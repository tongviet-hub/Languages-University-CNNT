import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { requestIdOf } from '../common/request-id.middleware.js';
import { UpstreamClient } from '../upstream/upstream.client.js';
import { PortalAuthGuard, PortalUser } from './portal-auth.guard.js';

// Cùng mức siết chặt như Academic: chống dò mật khẩu ngay tại cổng vào.
const STRICT = { default: { limit: 10, ttl: 60_000 } };

/**
 * Portal là điểm vào duy nhất: client chỉ biết Portal, còn việc đăng nhập do Academic xử lý.
 * Portal chuyển tiếp nguyên body; Academic kiểm tra dữ liệu đầu vào, Portal đổi lỗi sang định dạng chuẩn.
 */
@ApiTags('portal-auth')
@Controller('portal')
export class PortalAuthController {
  constructor(private readonly upstream: UpstreamClient) {}

  private forward(req: Request, path: string, body?: unknown) {
    return this.upstream.request('academic', path, {
      method: 'POST',
      body: body ?? {},
      requestId: requestIdOf(req),
      authorization: req.header('authorization'),
      clientIp: req.ip,
    });
  }

  @Throttle(STRICT)
  @Post('auth/register')
  @ApiOperation({ summary: 'Sinh viên tự đăng ký (chuyển tiếp tới Academic)' })
  async register(@Req() req: Request, @Body() body: unknown) {
    return (await this.forward(req, '/auth/register', body)).data;
  }

  @Throttle(STRICT)
  @Post('auth/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập, nhận access + refresh token' })
  async login(@Req() req: Request, @Body() body: unknown) {
    return (await this.forward(req, '/auth/login', body)).data;
  }

  @Throttle(STRICT)
  @Post('auth/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đổi refresh token lấy cặp token mới' })
  async refresh(@Req() req: Request, @Body() body: unknown) {
    return (await this.forward(req, '/auth/refresh', body)).data;
  }

  @ApiBearerAuth()
  @Post('auth/logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Đăng xuất (thu hồi refresh token)' })
  async logout(@Req() req: Request) {
    await this.forward(req, '/auth/logout');
  }

  @ApiBearerAuth()
  @Throttle(STRICT)
  @Post('auth/change-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Đổi mật khẩu (đăng xuất mọi thiết bị)' })
  async changePassword(@Req() req: Request, @Body() body: unknown) {
    await this.forward(req, '/auth/change-password', body);
  }

  @ApiBearerAuth()
  @UseGuards(PortalAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Thông tin người đang đăng nhập' })
  me(@Req() req: Request & { user: PortalUser }) {
    return req.user;
  }
}
