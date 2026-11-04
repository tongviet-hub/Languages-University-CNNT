import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength, validateSync } from 'class-validator';

/** Kiểm tra biến môi trường ngay lúc khởi động: thiếu/sai thì app dừng luôn thay vì chạy sai âm thầm. */
class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsInt() @Min(1) @Max(65535)
  PORT: number = 3000;

  @IsOptional() @IsString()
  CORS_ORIGINS?: string;

  @IsString() DB_HOST: string;
  @IsInt() @Min(1) @Max(65535) DB_PORT: number;
  @IsString() DB_USER: string;
  @IsString() DB_PASSWORD: string;
  @IsString() DB_NAME: string;

  @IsOptional() @IsBooleanString()
  DB_SYNCHRONIZE?: string;

  @IsString() @MinLength(32) JWT_ACCESS_SECRET: string;
  @IsString() @MinLength(32) JWT_REFRESH_SECRET: string;
  @IsInt() @Min(60) JWT_ACCESS_TTL_SECONDS: number;
  @IsInt() @Min(60) JWT_REFRESH_TTL_SECONDS: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    const details = errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
    throw new Error(`Cấu hình .env không hợp lệ:\n - ${details.join('\n - ')}`);
  }
  return validated;
}
