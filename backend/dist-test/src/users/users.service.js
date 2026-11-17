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
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ILike, Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { toPublicUser, User } from './user.entity.js';
const BCRYPT_ROUNDS = 12;
const PG_UNIQUE_VIOLATION = '23505';
let UsersService = class UsersService {
    users;
    constructor(users) {
        this.users = users;
    }
    hashPassword(plain) {
        return bcrypt.hash(plain, BCRYPT_ROUNDS);
    }
    findByEmailWithSecrets(email) {
        return this.users
            .createQueryBuilder('u')
            .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
            .where('u.email = :email', { email: email.toLowerCase() })
            .getOne();
    }
    findByIdWithSecrets(id) {
        return this.users
            .createQueryBuilder('u')
            .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
            .where('u.id = :id', { id })
            .getOne();
    }
    findById(id) {
        return this.users.findOneBy({ id });
    }
    async setRefreshTokenHash(id, hash) {
        await this.users.update({ id }, { refreshTokenHash: hash });
    }
    async setPassword(id, plain) {
        await this.users.update({ id }, { passwordHash: await this.hashPassword(plain), refreshTokenHash: null });
    }
    async create(dto) {
        const user = this.users.create({
            email: dto.email,
            fullName: dto.fullName,
            role: dto.role,
            passwordHash: await this.hashPassword(dto.password),
            refreshTokenHash: null,
        });
        try {
            return toPublicUser(await this.users.save(user));
        }
        catch (err) {
            if (err.code === PG_UNIQUE_VIOLATION) {
                throw new ConflictException('Email đã được sử dụng');
            }
            throw err;
        }
    }
    async findAll(query, actor) {
        const role = actor.role === Role.TEACHER ? Role.STUDENT : query.role;
        const base = role ? { role } : {};
        const where = query.search
            ? [
                { ...base, fullName: ILike(`%${escapeLike(query.search)}%`) },
                { ...base, email: ILike(`%${escapeLike(query.search)}%`) },
            ]
            : base;
        const [items, total] = await this.users.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (query.page - 1) * query.limit,
            take: query.limit,
        });
        return { items: items.map(toPublicUser), total, page: query.page, limit: query.limit };
    }
    async getPublicById(id) {
        const user = await this.findById(id);
        if (!user)
            throw new NotFoundException('Không tìm thấy người dùng');
        return toPublicUser(user);
    }
    async update(id, dto, actor) {
        if (id === actor.id && (dto.role !== undefined || dto.isActive !== undefined)) {
            throw new BadRequestException('Không thể tự đổi vai trò hoặc khoá chính tài khoản của mình');
        }
        const user = await this.findById(id);
        if (!user)
            throw new NotFoundException('Không tìm thấy người dùng');
        Object.assign(user, dto);
        const saved = await this.users.save(user);
        if (dto.isActive === false || dto.role !== undefined) {
            await this.setRefreshTokenHash(id, null);
        }
        return toPublicUser(saved);
    }
    async updateProfile(id, dto) {
        const user = await this.findById(id);
        if (!user)
            throw new NotFoundException('Không tìm thấy người dùng');
        if (dto.fullName !== undefined)
            user.fullName = dto.fullName;
        return toPublicUser(await this.users.save(user));
    }
    async remove(id, actor) {
        if (id === actor.id)
            throw new ForbiddenException('Không thể xoá chính tài khoản của mình');
        const result = await this.users.delete({ id });
        if (!result.affected)
            throw new NotFoundException('Không tìm thấy người dùng');
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersService);
export { UsersService };
function escapeLike(s) {
    return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}
//# sourceMappingURL=users.service.js.map