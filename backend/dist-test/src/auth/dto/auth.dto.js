var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { PasswordField } from '../../users/dto/password.js';
const normalizeEmail = ({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value;
export class RegisterDto {
    email;
    password;
    fullName;
}
__decorate([
    ApiProperty({ example: 'hocsinh.moi@sv.adu.edu.vn' }),
    Transform(normalizeEmail),
    IsEmail(),
    MaxLength(255),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    PasswordField(),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    ApiProperty({ example: 'Nguyễn Văn A' }),
    Transform(({ value }) => (typeof value === 'string' ? value.trim() : value)),
    IsString(),
    MinLength(2),
    MaxLength(120),
    __metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
export class LoginDto {
    email;
    password;
}
__decorate([
    ApiProperty({ example: 'student@adu.edu.vn' }),
    Transform(normalizeEmail),
    IsEmail(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    ApiProperty({ example: 'Password123!' }),
    IsString(),
    IsNotEmpty(),
    MaxLength(72),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
export class RefreshDto {
    refreshToken;
}
__decorate([
    ApiProperty(),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], RefreshDto.prototype, "refreshToken", void 0);
export class ChangePasswordDto {
    currentPassword;
    newPassword;
}
__decorate([
    ApiProperty(),
    IsString(),
    IsNotEmpty(),
    MaxLength(72),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "currentPassword", void 0);
__decorate([
    PasswordField(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
//# sourceMappingURL=auth.dto.js.map