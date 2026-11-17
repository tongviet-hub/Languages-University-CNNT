import { plainToInstance } from 'class-transformer';
import { parseTrustProxy } from '../common/trust-proxy.js';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Max, Min, validateSync } from 'class-validator';

/** Kiểm tra biến môi trường ngay lúc khởi động: thiếu/sai thì app dừng luôn thay vì chạy sai âm thầm. */
class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsInt() @Min(1) @Max(65535)
  PORT: number = 8080;

  @IsOptional() @IsString()
  CORS_ORIGINS?: string;

  /** IP/subnet của reverse proxy (Nginx) được tin. Để trống = không tin ai. Xem common/trust-proxy.ts. */
  @IsOptional() @IsString()
  TRUST_PROXY?: string;

  @IsUrl({ require_tld: false }) ACADEMIC_URL: string;
  @IsUrl({ require_tld: false }) FINANCE_URL: string;

  @IsInt() @Min(100) @Max(30_000)
  UPSTREAM_TIMEOUT_MS: number = 2000;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    const details = errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
    throw new Error(`Cấu hình .env không hợp lệ:\n - ${details.join('\n - ')}`);
  }
  parseTrustProxy(validated.TRUST_PROXY); // ném lỗi ngay lúc khởi động nếu giá trị nguy hiểm
  return validated;
}
