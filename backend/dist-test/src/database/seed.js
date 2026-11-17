import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../app.module.js';
import { Role } from '../common/enums/role.enum.js';
import { UsersService } from '../users/users.service.js';
const DEMO_USERS = [
    { email: 'admin@adu.edu.vn', fullName: 'Quản trị viên', role: Role.ADMIN },
    { email: 'teacher@adu.edu.vn', fullName: 'Trần Thị Lan', role: Role.TEACHER },
    { email: 'minhanh@sv.adu.edu.vn', fullName: 'Nguyễn Minh Anh', role: Role.STUDENT },
];
async function main() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
    const config = app.get(ConfigService);
    if (config.get('NODE_ENV') === 'production') {
        throw new Error('Không được chạy seed ở production');
    }
    const password = process.env.SEED_PASSWORD ?? 'Password123!';
    const users = app.get(UsersService);
    for (const u of DEMO_USERS) {
        if (await users.findByEmailWithSecrets(u.email)) {
            console.log(`- bỏ qua (đã tồn tại): ${u.email}`);
            continue;
        }
        await users.create({ ...u, password });
        console.log(`+ đã tạo ${u.role.padEnd(7)} ${u.email}`);
    }
    console.log(`Mật khẩu demo: ${password}`);
    await app.close();
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map