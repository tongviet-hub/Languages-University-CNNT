var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto, LoginDto, RefreshDto, RegisterDto } from './dto/auth.dto.js';
const STRICT = { default: { limit: 10, ttl: 60_000 } };
let AuthController = class AuthController {
    auth;
    users;
    constructor(auth, users) {
        this.auth = auth;
        this.users = users;
    }
    register(dto) {
        return this.auth.register(dto);
    }
    login(dto) {
        return this.auth.login(dto);
    }
    refresh(dto) {
        return this.auth.refresh(dto.refreshToken);
    }
    logout(user) {
        return this.auth.logout(user.id);
    }
    me(user) {
        return this.users.getPublicById(user.id);
    }
    changePassword(user, dto) {
        return this.auth.changePassword(user.id, dto);
    }
};
__decorate([
    Public(),
    Throttle(STRICT),
    Post('register'),
    ApiOperation({ summary: 'Học sinh tự đăng ký' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    Public(),
    Throttle(STRICT),
    Post('login'),
    HttpCode(200),
    ApiOperation({ summary: 'Đăng nhập, nhận access + refresh token' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    Public(),
    Throttle(STRICT),
    Post('refresh'),
    HttpCode(200),
    ApiOperation({ summary: 'Đổi refresh token lấy cặp token mới (xoay vòng)' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RefreshDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    ApiBearerAuth(),
    Post('logout'),
    HttpCode(204),
    ApiOperation({ summary: 'Đăng xuất (thu hồi refresh token)' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    ApiBearerAuth(),
    Get('me'),
    ApiOperation({ summary: 'Thông tin người đang đăng nhập' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    ApiBearerAuth(),
    Throttle(STRICT),
    Post('change-password'),
    HttpCode(204),
    ApiOperation({ summary: 'Đổi mật khẩu (đăng xuất mọi thiết bị)' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "changePassword", null);
AuthController = __decorate([
    ApiTags('auth'),
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService,
        UsersService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map