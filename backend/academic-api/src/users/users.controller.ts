import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../common/enums/role.enum.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ListUsersQuery } from './dto/list-users.query.js';
import { UpdateProfileDto, UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  // Mọi user đã đăng nhập: thao tác trên chính mình. Khai báo TRƯỚC ':id' để 'me' không bị hiểu là id.
  @Get('me')
  @ApiOperation({ summary: 'Xem hồ sơ của mình' })
  me(@CurrentUser() user: AuthUser) {
    return this.users.getPublicById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Sửa hồ sơ của mình (chỉ tên)' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  // Admin + Giáo viên: xem danh sách (giáo viên chỉ thấy học sinh - xử lý trong service).
  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Danh sách người dùng (admin: tất cả; giáo viên: chỉ học sinh)' })
  list(@Query() query: ListUsersQuery, @CurrentUser() actor: AuthUser) {
    return this.users.findAll(query, actor);
  }

  // Chỉ admin.
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tạo tài khoản với vai trò bất kỳ' })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Xem một người dùng' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.getPublicById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Đổi tên / vai trò / khoá-mở tài khoản' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthUser) {
    return this.users.update(id, dto, actor);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Xoá tài khoản' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthUser) {
    return this.users.remove(id, actor);
  }
}
