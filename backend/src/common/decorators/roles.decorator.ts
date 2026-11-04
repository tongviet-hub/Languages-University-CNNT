import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum.js';

export const ROLES_KEY = 'roles';

/** Chỉ cho phép các vai trò được liệt kê. Không gắn @Roles() = mọi user đã đăng nhập đều vào được. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
