var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Role } from '../../common/enums/role.enum.js';
export class ListUsersQuery {
    role;
    search;
    page = 1;
    limit = 20;
}
__decorate([
    ApiPropertyOptional({ enum: Role }),
    IsOptional(),
    IsEnum(Role),
    __metadata("design:type", String)
], ListUsersQuery.prototype, "role", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Tìm theo tên hoặc email' }),
    IsOptional(),
    IsString(),
    MaxLength(100),
    __metadata("design:type", String)
], ListUsersQuery.prototype, "search", void 0);
__decorate([
    ApiPropertyOptional({ default: 1 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    __metadata("design:type", Number)
], ListUsersQuery.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ default: 20, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsInt(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], ListUsersQuery.prototype, "limit", void 0);
//# sourceMappingURL=list-users.query.js.map