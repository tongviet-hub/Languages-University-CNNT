var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsIn, IsInt, IsOptional, IsString, Max, Min, MinLength, validateSync } from 'class-validator';
class EnvironmentVariables {
    NODE_ENV = 'development';
    PORT = 3000;
    CORS_ORIGINS;
    DB_HOST;
    DB_PORT;
    DB_USER;
    DB_PASSWORD;
    DB_NAME;
    DB_SYNCHRONIZE;
    JWT_ACCESS_SECRET;
    JWT_REFRESH_SECRET;
    JWT_ACCESS_TTL_SECONDS;
    JWT_REFRESH_TTL_SECONDS;
}
__decorate([
    IsIn(['development', 'production', 'test']),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "NODE_ENV", void 0);
__decorate([
    IsInt(),
    Min(1),
    Max(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "PORT", void 0);
__decorate([
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "CORS_ORIGINS", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_HOST", void 0);
__decorate([
    IsInt(),
    Min(1),
    Max(65535),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "DB_PORT", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_USER", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_PASSWORD", void 0);
__decorate([
    IsString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_NAME", void 0);
__decorate([
    IsOptional(),
    IsBooleanString(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DB_SYNCHRONIZE", void 0);
__decorate([
    IsString(),
    MinLength(32),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_ACCESS_SECRET", void 0);
__decorate([
    IsString(),
    MinLength(32),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    IsInt(),
    Min(60),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "JWT_ACCESS_TTL_SECONDS", void 0);
__decorate([
    IsInt(),
    Min(60),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "JWT_REFRESH_TTL_SECONDS", void 0);
export function validateEnv(config) {
    const validated = plainToInstance(EnvironmentVariables, config, { enableImplicitConversion: true });
    const errors = validateSync(validated, { skipMissingProperties: false });
    if (errors.length) {
        const details = errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
        throw new Error(`Cấu hình .env không hợp lệ:\n - ${details.join('\n - ')}`);
    }
    return validated;
}
//# sourceMappingURL=env.validation.js.map