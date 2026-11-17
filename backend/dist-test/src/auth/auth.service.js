var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Role } from '../common/enums/role.enum.js';
import { toPublicUser } from '../users/user.entity.js';
import { UsersService } from '../users/users.service.js';
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', 12);
const BAD_CREDENTIALS = 'Email hoặc mật khẩu không đúng';
let AuthService = class AuthService {
    users;
    jwt;
    config;
    constructor(users, jwt, config) {
        this.users = users;
        this.jwt = jwt;
        this.config = config;
    }
    async register(dto) {
        const created = await this.users.create({ ...dto, role: Role.STUDENT });
        const user = await this.users.findById(created.id);
        return this.issueTokens(user);
    }
    async login(dto) {
        const user = await this.users.findByEmailWithSecrets(dto.email);
        const ok = await bcrypt.compare(dto.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !ok)
            throw new UnauthorizedException(BAD_CREDENTIALS);
        if (!user.isActive)
            throw new ForbiddenException('Tài khoản đã bị khoá');
        return this.issueTokens(user);
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
        const user = await this.users.findByIdWithSecrets(payload.sub);
        if (!user || !user.isActive || !user.refreshTokenHash) {
            throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực');
        }
        if (!safeEqualHex(user.refreshTokenHash, sha256(refreshToken))) {
            await this.users.setRefreshTokenHash(user.id, null);
            throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực');
        }
        return this.issueTokens(user);
    }
    async logout(userId) {
        await this.users.setRefreshTokenHash(userId, null);
    }
    async changePassword(userId, dto) {
        const user = await this.users.findByIdWithSecrets(userId);
        if (!user || !(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
            throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
        }
        await this.users.setPassword(userId, dto.newPassword);
    }
    async issueTokens(user) {
        const accessTtl = this.config.getOrThrow('JWT_ACCESS_TTL_SECONDS');
        const refreshTtl = this.config.getOrThrow('JWT_REFRESH_TTL_SECONDS');
        const accessPayload = { sub: user.id, email: user.email, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(accessPayload, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: accessTtl }),
            this.jwt.signAsync({ sub: user.id, jti: randomUUID() }, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
                expiresIn: refreshTtl,
            }),
        ]);
        await this.users.setRefreshTokenHash(user.id, sha256(refreshToken));
        return { user: toPublicUser(user), accessToken, refreshToken, expiresIn: accessTtl };
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
function safeEqualHex(a, b) {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    return ba.length === bb.length && timingSafeEqual(ba, bb);
}
//# sourceMappingURL=auth.service.js.map