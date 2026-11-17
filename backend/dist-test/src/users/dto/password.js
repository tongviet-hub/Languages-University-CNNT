import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export const PasswordField = () => applyDecorators(ApiProperty({ minLength: 8, maxLength: 72, example: 'Password123!' }), IsString(), MinLength(8), MaxLength(72), Matches(/(?=.*[A-Za-z])(?=.*\d)/, { message: 'Mật khẩu phải có cả chữ và số' }));
//# sourceMappingURL=password.js.map