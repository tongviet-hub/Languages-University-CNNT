import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { AuthUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQuery } from './dto/list-users.query.js';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto.js';
import { PublicUser, toPublicUser, User } from './user.entity.js';

const BCRYPT_ROUNDS = 12;
const PG_UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  // ---------- Dùng nội bộ (AuthService, JwtStrategy, seed) ----------

  hashPassword(plain: string) {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  /** Lấy user kèm các cột nhạy cảm (passwordHash, refreshTokenHash) - chỉ dùng cho luồng xác thực. */
  findByEmailWithSecrets(email: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('u.email = :email', { email: email.toLowerCase() })
      .getOne();
  }

  findByIdWithSecrets(id: string) {
    return this.users
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('u.id = :id', { id })
      .getOne();
  }

  findById(id: string) {
    return this.users.findOneBy({ id });
  }

  async setRefreshTokenHash(id: string, hash: string | null) {
    await this.users.update({ id }, { refreshTokenHash: hash });
  }

  async setPassword(id: string, plain: string) {
    // Đổi mật khẩu thì thu hồi luôn refresh token => buộc đăng nhập lại ở mọi nơi.
    await this.users.update({ id }, { passwordHash: await this.hashPassword(plain), refreshTokenHash: null });
  }

  // ---------- Nghiệp vụ ----------

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const user = this.users.create({
      email: dto.email,
      fullName: dto.fullName,
      role: dto.role,
      passwordHash: await this.hashPassword(dto.password),
      refreshTokenHash: null,
    });
    try {
      return toPublicUser(await this.users.save(user));
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new ConflictException('Email đã được sử dụng');
      }
      throw err;
    }
  }

  async findAll(query: ListUsersQuery, actor: AuthUser) {
    // Phân quyền theo dữ liệu: giáo viên chỉ được xem danh sách học sinh, dù có truyền role nào.
    const role = actor.role === Role.TEACHER ? Role.STUDENT : query.role;
    const base: FindOptionsWhere<User> = role ? { role } : {};
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

  async getPublicById(id: string): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return toPublicUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser): Promise<PublicUser> {
    if (id === actor.id && (dto.role !== undefined || dto.isActive !== undefined)) {
      // Tránh tự "tước quyền" hoặc tự khoá mình rồi không còn ai quản trị được hệ thống.
      throw new BadRequestException('Không thể tự đổi vai trò hoặc khoá chính tài khoản của mình');
    }
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    Object.assign(user, dto);
    const saved = await this.users.save(user);
    if (dto.isActive === false || dto.role !== undefined) {
      // Đổi vai trò / khoá tài khoản => buộc các phiên cũ phải xác thực lại.
      await this.setRefreshTokenHash(id, null);
    }
    return toPublicUser(saved);
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    return toPublicUser(await this.users.save(user));
  }

  async remove(id: string, actor: AuthUser) {
    if (id === actor.id) throw new ForbiddenException('Không thể xoá chính tài khoản của mình');
    const result = await this.users.delete({ id });
    if (!result.affected) throw new NotFoundException('Không tìm thấy người dùng');
  }
}

/** Tránh người dùng chèn % hoặc _ để biến câu tìm kiếm thành wildcard. */
function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}
