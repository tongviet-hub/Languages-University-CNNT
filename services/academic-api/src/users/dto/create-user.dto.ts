import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';
import { PasswordField } from './password.js';

export class CreateUserDto {
  @ApiProperty({ example: 'gv.moi@lumina.edu.vn' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email: string;

  @PasswordField()
  password: string;

  @ApiProperty({ example: 'Trần Văn B' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ enum: Role, example: Role.TEACHER })
  @IsEnum(Role)
  role: Role;
}
