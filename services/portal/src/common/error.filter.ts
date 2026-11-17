import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiError, codeForStatus } from './api-error.js';
import { requestIdOf } from './request-id.middleware.js';

/** Mọi lỗi trả ra ngoài đều có dạng {error:{code,message,requestId}} (mục 6.2 của đề). */
@Catch()
export class ErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger('Error');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const requestId = requestIdOf(req);

    let status = 500;
    let code = 'INTERNAL_ERROR' as string;
    let message = 'Lỗi hệ thống, vui lòng thử lại sau.';

    if (exception instanceof ApiError) {
      status = exception.getStatus();
      code = exception.code;
      message = exception.message;
      for (const [k, v] of Object.entries(exception.headers)) res.setHeader(k, v);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = codeForStatus(status);
      const body = exception.getResponse();
      const raw = typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
      message = Array.isArray(raw) ? raw.join('; ') : (raw ?? exception.message);
    } else {
      // Chi tiết kỹ thuật chỉ nằm trong log, người dùng chỉ thấy thông điệp chung.
      this.logger.error(`[${requestId}] ${exception instanceof Error ? exception.stack : String(exception)}`);
    }

    res.status(status).json({ error: { code, message, requestId } });
  }
}
