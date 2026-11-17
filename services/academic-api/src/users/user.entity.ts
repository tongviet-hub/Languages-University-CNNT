import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  /** select:false => không bao giờ bị lôi ra bởi query thông thường, phải chủ động addSelect khi cần. */
  @Column({ type: 'varchar', length: 100, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 120 })
  fullName: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role: Role;

  /** Khoá tài khoản mà không cần xoá dữ liệu. */
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /** SHA-256 của refresh token đang hợp lệ (mỗi user 1 phiên). null = đã đăng xuất. */
  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  refreshTokenHash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export type PublicUser = Pick<User, 'id' | 'email' | 'fullName' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'>;

/** Chỉ lộ những trường an toàn ra ngoài API. */
export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
