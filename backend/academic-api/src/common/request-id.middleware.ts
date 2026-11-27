import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const SAFE_ID = /^[\w-]{8,64}$/;
const logger = new Logger('HTTP');

/**
 * Giữ nguyên X-Request-ID nếu client/dịch vụ gọi tới gửi (và hợp lệ), nếu không thì sinh UUID.
 * ID được ghi ngược vào header của request để mọi nơi đọc `req.headers['x-request-id']` thấy cùng giá trị,
 * trả lại trong header phản hồi, và gắn vào mỗi dòng log truy cập -> `grep <requestId>` thấy được
 * đường đi của một yêu cầu qua Portal và các dịch vụ phía sau.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  const id = incoming && SAFE_ID.test(incoming) ? incoming : randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);

  if (process.env.NODE_ENV !== 'test') {
    const start = performance.now();
    res.on('finish', () => {
      logger.log(`[${id}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - start)}ms ip=${req.ip}`);
    });
  }
  next();
}

export const requestIdOf = (req: Request): string => String(req.headers['x-request-id'] ?? '');
