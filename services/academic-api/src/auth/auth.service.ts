import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Role } from '../common/enums/role.enum.js';
import { toPublicUser, User } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
import { ChangePasswordDto, LoginDto, RegisterDto } from './dto/auth.dto.js';

export interface AccessPayload {
  sub: string;
  email: string;
  role: Role;
}

interface RefreshPayload {
  sub: string;
  jti: string;
}

// Hash giả để vẫn tốn thời gian bcrypt khi email không tồn tại => không lộ "email nào có trong hệ thống" qua thời gian phản hồi.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);
const BAD_CREDENTIALS = 'Email hoặc mật khẩu không đúng';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Tự đăng ký luôn là học sinh. Tài khoản giáo viên/admin do ADMIN tạo (POST /users).
    const created = await this.users.create({ ...dto, role: Role.STUDENT });
    const user = await this.users.findById(created.id);
    return this.issueTokens(user!);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailWithSecrets(dto.email);
    const ok = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException(BAD_CREDENTIALS);
    if (!user.isActive) throw new ForbiddenException('Tài khoản đã bị khoá');
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.users.findByIdWithSecrets(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực');
    }

    if (!safeEqualHex(user.refreshTokenHash, sha256(refreshToken))) {
      // Token hợp lệ về chữ ký nhưng KHÔNG phải token mới nhất => có thể đã bị đánh cắp và dùng lại.
      // Thu hồi cả phiên để buộc đăng nhập lại.
      await this.users.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực');
    }
    return this.issueTokens(user); // xoay vòng: token cũ chết ngay khi cấp token mới
  }

  async logout(userId: string) {
    await this.users.setRefreshTokenHash(userId, null);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findByIdWithSecrets(userId);
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
    }
    await this.users.setPassword(userId, dto.newPassword);
  }

  private async issueTokens(user: User) {
    const accessTtl = this.config.getOrThrow<number>('JWT_ACCESS_TTL_SECONDS');
    const refreshTtl = this.config.getOrThrow<number>('JWT_REFRESH_TTL_SECONDS');

    const accessPayload: AccessPayload = { sub: user.id, email: user.email, role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: accessTtl }),
      // jti ngẫu nhiên: hai lần cấp trong cùng 1 giây vẫn ra hai token khác nhau.
      this.jwt.signAsync({ sub: user.id, jti: randomUUID() } satisfies RefreshPayload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      }),
    ]);

    // Chỉ lưu hash (SHA-256 là đủ vì token đã là chuỗi ngẫu nhiên dài; bcrypt chỉ đọc 72 byte đầu nên không hợp).
    await this.users.setRefreshTokenHash(user.id, sha256(refreshToken));

    return { user: toPublicUser(user), accessToken, refreshToken, expiresIn: accessTtl };
  }
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

function safeEqualHex(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
