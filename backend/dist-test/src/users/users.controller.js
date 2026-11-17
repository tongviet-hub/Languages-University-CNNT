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
import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQuery } from './dto/list-users.query.js';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
let UsersController = class UsersController {
    users;
    constructor(users) {
        this.users = users;
    }
    me(user) {
        return this.users.getPublicById(user.id);
    }
    updateMe(user, dto) {
        return this.users.updateProfile(user.id, dto);
    }
    list(query, actor) {
        return this.users.findAll(query, actor);
    }
    create(dto) {
        return this.users.create(dto);
    }
    findOne(id) {
        return this.users.getPublicById(id);
    }
    update(id, dto, actor) {
        return this.users.update(id, dto, actor);
    }
    remove(id, actor) {
        return this.users.remove(id, actor);
    }
};
__decorate([
    Get('me'),
    ApiOperation({ summary: 'Xem hồ sơ của mình' }),
    __param(0, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    Patch('me'),
    ApiOperation({ summary: 'Sửa hồ sơ của mình (chỉ tên)' }),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    Get(),
    Roles(Role.ADMIN, Role.TEACHER),
    ApiOperation({ summary: 'Danh sách người dùng (admin: tất cả; giáo viên: chỉ học sinh)' }),
    __param(0, Query()),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListUsersQuery, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "list", null);
__decorate([
    Post(),
    Roles(Role.ADMIN),
    ApiOperation({ summary: 'Tạo tài khoản với vai trò bất kỳ' }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    Get(':id'),
    Roles(Role.ADMIN),
    ApiOperation({ summary: 'Xem một người dùng' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    Patch(':id'),
    Roles(Role.ADMIN),
    ApiOperation({ summary: 'Đổi tên / vai trò / khoá-mở tài khoản' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, Body()),
    __param(2, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    Delete(':id'),
    Roles(Role.ADMIN),
    HttpCode(204),
    ApiOperation({ summary: 'Xoá tài khoản' }),
    __param(0, Param('id', ParseUUIDPipe)),
    __param(1, CurrentUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
UsersController = __decorate([
    ApiTags('users'),
    ApiBearerAuth(),
    Controller('users'),
    __metadata("design:paramtypes", [UsersService])
], UsersController);
export { UsersController };
//# sourceMappingURL=users.controller.js.map