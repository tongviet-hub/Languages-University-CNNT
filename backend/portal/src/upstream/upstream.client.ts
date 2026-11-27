import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError, codeForStatus } from '../common/api-error.js';

export type UpstreamSource = 'academic' | 'finance';

export interface UpstreamRequest {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  requestId: string;
  /** Giá trị header Authorization của người dùng, chuyển tiếp nguyên trạng. */
  authorization?: string;
  /** IP người dùng (req.ip của Portal), gửi qua X-Forwarded-For để dịch vụ con rate limit đúng người. */
  clientIp?: string;
  /**
   * Các mã 4xx là "câu trả lời hợp lệ" cho người dùng ở lời gọi này (sai mật khẩu, thiếu dữ liệu...).
   * Mã 4xx khác nghĩa là Portal gọi sai hợp đồng (đường dẫn, phiên bản) -> 502, không đổ lỗi cho người dùng.
   */
  passThrough?: number[];
}

/** Mặc định cho các lời gọi xác thực: 400 dữ liệu sai, 401 sai thông tin, 403 không đủ quyền, 409 trùng, 429 quá nhiều lần. */
const DEFAULT_PASS_THROUGH = [400, 401, 403, 409, 429];

const FRIENDLY: Record<UpstreamSource, string> = {
  academic: 'Dịch vụ học vụ',
  finance: 'Dịch vụ học phí',
};

const isTimeout = (err: unknown) => err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');

/**
 * Cách duy nhất Portal nói chuyện với dịch vụ con. Phân loại lỗi theo bảng mục 3.6 / 6.3 của đề:
 *   không kết nối được                  -> 503 UPSTREAM_UNAVAILABLE
 *   quá thời gian chờ                   -> 504 UPSTREAM_TIMEOUT
 *   5xx, body hỏng, đứt giữa chừng,
 *   4xx ngoài danh sách passThrough     -> 502 UPSTREAM_BAD_RESPONSE
 *   4xx trong passThrough               -> giữ nguyên mã, đổi sang định dạng lỗi chuẩn
 */
@Injectable()
export class UpstreamClient {
  private readonly logger = new Logger('Upstream');
  private readonly timeoutMs: number;
  private readonly baseUrl: Record<UpstreamSource, string>;

  constructor(config: ConfigService) {
    this.timeoutMs = config.getOrThrow<number>('UPSTREAM_TIMEOUT_MS');
    this.baseUrl = {
      academic: config.getOrThrow<string>('ACADEMIC_URL').replace(/\/+$/, ''),
      finance: config.getOrThrow<string>('FINANCE_URL').replace(/\/+$/, ''),
    };
  }

  async request<T = unknown>(
    source: UpstreamSource,
    path: string,
    opts: UpstreamRequest,
  ): Promise<{ status: number; data: T | undefined }> {
    const { requestId } = opts;
    const url = `${this.baseUrl[source]}/api/v1${path}`;
    const headers: Record<string, string> = { Accept: 'application/json', 'X-Request-ID': requestId };
    if (opts.authorization) headers.Authorization = opts.authorization;
    if (opts.clientIp) headers['X-Forwarded-For'] = opts.clientIp; // ghi đè, không nối thêm chuỗi client gửi
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

    // Bước 1: kết nối + nhận header. Lỗi ở đây = không tới được dịch vụ (hoặc quá hạn).
    let res: Response;
    try {
      res = await fetch(url, {
        method: opts.method ?? 'GET',
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        // Timeout bao cả lúc đọc body, không chỉ lúc nhận header.
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err) {
      if (isTimeout(err)) this.timeout(source, requestId, err);
      this.logger.warn(`[${requestId}] ${source} unreachable: ${String(err)}`);
      throw new ApiError(503, 'UPSTREAM_UNAVAILABLE', `${FRIENDLY[source]} tạm thời không khả dụng.`);
    }

    // Bước 2: đọc body. Đã kết nối được, nên lỗi ở đây là phản hồi hỏng (hoặc quá hạn), không phải "không khả dụng".
    let text: string;
    try {
      text = await res.text();
    } catch (err) {
      if (isTimeout(err)) this.timeout(source, requestId, err);
      this.badResponse(source, requestId, `body read failed: ${String(err)}`);
    }

    let data: unknown;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status < 400) this.badResponse(source, requestId, `non-JSON body (status ${res.status})`);
      }
    }

    if (res.status >= 500) this.badResponse(source, requestId, `status ${res.status}`);
    if (res.status >= 400) {
      if (!(opts.passThrough ?? DEFAULT_PASS_THROUGH).includes(res.status)) {
        this.badResponse(source, requestId, `unexpected ${res.status} for ${opts.method ?? 'GET'} ${path}: ${text.slice(0, 200)}`);
      }
      const retryAfter = res.headers.get('retry-after');
      throw new ApiError(
        res.status,
        codeForStatus(res.status),
        this.messageOf(data) ?? `Yêu cầu bị từ chối (${res.status}).`,
        retryAfter ? { 'Retry-After': retryAfter } : {},
      );
    }
    return { status: res.status, data: data as T | undefined };
  }

  private timeout(source: UpstreamSource, requestId: string, err: unknown): never {
    this.logger.warn(`[${requestId}] ${source} timeout after ${this.timeoutMs}ms: ${String(err)}`);
    throw new ApiError(504, 'UPSTREAM_TIMEOUT', `${FRIENDLY[source]} phản hồi quá chậm, vui lòng thử lại sau.`);
  }

  private badResponse(source: UpstreamSource, requestId: string, detail: string): never {
    // Chi tiết (đường dẫn nội bộ, body lỗi) chỉ vào log; người dùng chỉ thấy thông điệp chung.
    this.logger.warn(`[${requestId}] ${source} bad response: ${detail}`);
    throw new ApiError(502, 'UPSTREAM_BAD_RESPONSE', `${FRIENDLY[source]} trả về dữ liệu không hợp lệ.`);
  }

  /** Lấy thông điệp từ lỗi chuẩn Nest ({message: string | string[]}) hoặc lỗi chuẩn của đề ({error:{message}}). */
  private messageOf(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const d = data as { message?: string | string[]; error?: { message?: string } | string };
    const msg = d.message ?? (typeof d.error === 'object' ? d.error?.message : undefined);
    return Array.isArray(msg) ? msg.join('; ') : msg;
  }
}
