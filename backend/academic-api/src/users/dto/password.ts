import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Chính sách mật khẩu dùng chung: 8–72 ký tự (bcrypt chỉ đọc 72 byte đầu), có chữ và số. */
export const PasswordField = () =>
  applyDecorators(
    ApiProperty({ minLength: 8, maxLength: 72, example: 'Password123!' }),
    IsString(),
    MinLength(8),
    MaxLength(72),
    Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: 'Mật khẩu phải có cả chữ và số' }),
  );
