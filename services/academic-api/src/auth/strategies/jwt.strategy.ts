import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../../common/decorators/current-user.decorator.js';
import { UsersService } from '../../users/users.service.js';
import { AccessPayload } from '../auth.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Chạy sau khi chữ ký + hạn token đã đúng. Tra lại DB để:
   *  - tài khoản bị khoá/xoá có hiệu lực NGAY (không phải đợi access token hết hạn),
   *  - vai trò lấy từ DB, nên admin đổi role là áp dụng liền.
   * Giá trị trả về được gắn vào request.user.
   */
  async validate(payload: AccessPayload): Promise<AuthUser> {
    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { id: user.id, email: user.email, role: user.role };
  }
}
