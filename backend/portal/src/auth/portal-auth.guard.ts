import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiError } from '../common/api-error.js';
import { requestIdOf } from '../common/request-id.middleware.js';
import { UpstreamClient } from '../upstream/upstream.client.js';

export interface PortalUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
}

/**
 * Xác thực bằng cách hỏi Academic (GET /auth/me) chứ không tự giải mã JWT.
 * Nhờ vậy Portal không giữ khóa bí mật nào, và tài khoản bị khóa / đổi quyền có hiệu lực ngay
 * (Academic tra DB ở mỗi request). Đổi lại là thêm một lần gọi nội bộ cho mỗi request được bảo vệ.
 */
@Injectable()
export class PortalAuthGuard implements CanActivate {
  constructor(private readonly upstream: UpstreamClient) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { user?: PortalUser }>();
    const authorization = req.header('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Thiếu access token.');
    }
    const { data } = await this.upstream.request<PortalUser>('academic', '/auth/me', {
      requestId: requestIdOf(req),
      authorization,
      clientIp: req.ip,
    });
    req.user = data;
    return true;
  }
}
