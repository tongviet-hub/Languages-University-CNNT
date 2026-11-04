import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto, LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto.js';

// Các route nhạy cảm bị giới hạn chặt hơn mức mặc định để chống dò mật khẩu.
const STRICT = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}

  @Public()
  @Throttle(STRICT)
  @Post('register')
  @ApiOperation({ summary: 'Học sinh tự đăng ký' })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Public()
  @Throttle(STRICT)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đăng nhập, nhận access + refresh token' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Throttle(STRICT)
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Đổi refresh token lấy cặp token mới (xoay vòng)' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Đăng xuất (thu hồi refresh token)' })
  logout(@CurrentUser() user: AuthUser) {
    return this.auth.logout(user.id);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Thông tin người đang đăng nhập' })
  me(@CurrentUser() user: AuthUser) {
    return this.users.getPublicById(user.id);
  }

  @ApiBearerAuth()
  @Throttle(STRICT)
  @Post('change-password')
  @HttpCode(204)
  @ApiOperation({ summary: 'Đổi mật khẩu (đăng xuất mọi thiết bị)' })
  changePassword(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.id, dto);
  }
}
