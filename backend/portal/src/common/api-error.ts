import { HttpException } from '@nestjs/common';

/** Mã lỗi nghiệp vụ dùng chung (khớp bảng 6.3 của đề). */
export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_BAD_RESPONSE'
  | 'INTERNAL_ERROR';

/** Lỗi có mã máy đọc được. Bộ lọc lỗi toàn cục biến nó thành {error:{code,message,requestId}}. */
export class ApiError extends HttpException {
  constructor(
    status: number,
    readonly code: ErrorCode,
    message: string,
    /** Header cần trả kèm, ví dụ Retry-After của 429. */
    readonly headers: Record<string, string> = {},
  ) {
    super(message, status);
  }
}

const CODE_BY_STATUS: Record<number, ErrorCode> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  429: 'TOO_MANY_REQUESTS',
};

export function codeForStatus(status: number): ErrorCode {
  return CODE_BY_STATUS[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR');
}
