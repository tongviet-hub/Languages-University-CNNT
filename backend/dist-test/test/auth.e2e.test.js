import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import request from 'supertest';
const TEST_DB = 'school_portal_test';
const PASSWORD = 'Password123!';
process.loadEnvFile('.env');
process.env.DB_NAME = TEST_DB;
process.env.DB_SYNCHRONIZE = 'true';
process.env.NODE_ENV = 'test';
let app;
let http;
const api = (path) => `/api${path}`;
const bearer = (t) => ({ Authorization: `Bearer ${t}` });
async function recreateDatabase() {
    const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
    const admin = new pg.Client({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASSWORD, database: 'postgres' });
    await admin.connect();
    await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${TEST_DB}`);
    await admin.end();
}
async function login(email, password = PASSWORD) {
    const res = await http.post(api('/auth/login')).send({ email, password });
    assert.equal(res.status, 200, `login ${email}: ${JSON.stringify(res.body)}`);
    return res.body;
}
describe('Auth & phân quyền', () => {
    let admin;
    let teacher;
    let student;
    before(async () => {
        await recreateDatabase();
        const { AppModule } = await import('../src/app.module.js');
        const { configureApp } = await import('../src/app.setup.js');
        const { UsersService } = await import('../src/users/users.service.js');
        const { Role } = await import('../src/common/enums/role.enum.js');
        const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
        app = moduleRef.createNestApplication();
        configureApp(app);
        await app.init();
        http = request(app.getHttpServer());
        const users = app.get(UsersService);
        await users.create({ email: 'admin@test.vn', fullName: 'Admin', role: Role.ADMIN, password: PASSWORD });
        await users.create({ email: 'teacher@test.vn', fullName: 'Giáo viên', role: Role.TEACHER, password: PASSWORD });
        await users.create({ email: 'student@test.vn', fullName: 'Học sinh', role: Role.STUDENT, password: PASSWORD });
        [admin, teacher, student] = await Promise.all([login('admin@test.vn'), login('teacher@test.vn'), login('student@test.vn')]);
    });
    after(async () => {
        await app?.close();
    });
    describe('xác thực', () => {
        it('health là public', async () => {
            await http.get(api('/health')).expect(200);
        });
        it('không có token => 401', async () => {
            await http.get(api('/users/me')).expect(401);
            await http.get(api('/users/me')).set(bearer('rac.khong.hop.le')).expect(401);
        });
        it('đăng ký: luôn là student, không lộ passwordHash', async () => {
            const res = await http
                .post(api('/auth/register'))
                .send({ email: '  Moi@Test.vn ', password: PASSWORD, fullName: 'Người Mới' })
                .expect(201);
            assert.equal(res.body.user.email, 'moi@test.vn');
            assert.equal(res.body.user.role, 'student');
            assert.ok(res.body.accessToken && res.body.refreshToken);
            assert.equal(JSON.stringify(res.body).includes('passwordHash'), false);
            assert.equal(JSON.stringify(res.body).includes('refreshTokenHash'), false);
        });
        it('đăng ký: chặn tự gán role (mass assignment)', async () => {
            await http
                .post(api('/auth/register'))
                .send({ email: 'hacker@test.vn', password: PASSWORD, fullName: 'Hacker', role: 'admin' })
                .expect(400);
        });
        it('đăng ký: email trùng => 409, mật khẩu yếu => 400', async () => {
            await http.post(api('/auth/register')).send({ email: 'student@test.vn', password: PASSWORD, fullName: 'Trùng' }).expect(409);
            await http.post(api('/auth/register')).send({ email: 'yeu@test.vn', password: 'abcdefgh', fullName: 'Yếu' }).expect(400);
            await http.post(api('/auth/register')).send({ email: 'ngan@test.vn', password: 'a1', fullName: 'Ngắn' }).expect(400);
        });
        it('đăng nhập sai mật khẩu / email lạ => cùng một thông báo 401', async () => {
            const a = await http.post(api('/auth/login')).send({ email: 'student@test.vn', password: 'Sai12345' }).expect(401);
            const b = await http.post(api('/auth/login')).send({ email: 'khong.co@test.vn', password: 'Sai12345' }).expect(401);
            assert.equal(a.body.message, b.body.message);
        });
        it('GET /auth/me trả đúng người đăng nhập', async () => {
            const res = await http.get(api('/auth/me')).set(bearer(student.accessToken)).expect(200);
            assert.equal(res.body.email, 'student@test.vn');
        });
        it('refresh token không dùng được làm access token', async () => {
            await http.get(api('/users/me')).set(bearer(student.refreshToken)).expect(401);
        });
    });
    describe('phân quyền theo vai trò', () => {
        it('student không xem được danh sách user (403)', async () => {
            await http.get(api('/users')).set(bearer(student.accessToken)).expect(403);
        });
        it('teacher chỉ thấy học sinh; admin thấy tất cả', async () => {
            const t = await http.get(api('/users?role=admin')).set(bearer(teacher.accessToken)).expect(200);
            assert.ok(t.body.items.length > 0);
            assert.ok(t.body.items.every((u) => u.role === 'student'), 'teacher chỉ được thấy student kể cả khi xin role=admin');
            const a = await http.get(api('/users')).set(bearer(admin.accessToken)).expect(200);
            const roles = new Set(a.body.items.map((u) => u.role));
            assert.deepEqual([...roles].sort(), ['admin', 'student', 'teacher']);
        });
        it('chỉ admin được tạo / xem / sửa / xoá user', async () => {
            const body = { email: 'gv.moi@test.vn', password: PASSWORD, fullName: 'GV Mới', role: 'teacher' };
            await http.post(api('/users')).set(bearer(student.accessToken)).send(body).expect(403);
            await http.post(api('/users')).set(bearer(teacher.accessToken)).send(body).expect(403);
            const created = await http.post(api('/users')).set(bearer(admin.accessToken)).send(body).expect(201);
            assert.equal(created.body.role, 'teacher');
            const id = created.body.id;
            await http.get(api(`/users/${id}`)).set(bearer(teacher.accessToken)).expect(403);
            await http.get(api(`/users/${id}`)).set(bearer(admin.accessToken)).expect(200);
            await http.patch(api(`/users/${id}`)).set(bearer(student.accessToken)).send({ role: 'admin' }).expect(403);
            await http.delete(api(`/users/${id}`)).set(bearer(teacher.accessToken)).expect(403);
            await http.delete(api(`/users/${id}`)).set(bearer(admin.accessToken)).expect(204);
            await http.get(api(`/users/${id}`)).set(bearer(admin.accessToken)).expect(404);
        });
        it('user tự sửa tên của mình nhưng không đổi được role', async () => {
            const ok = await http.patch(api('/users/me')).set(bearer(student.accessToken)).send({ fullName: 'Tên Mới' }).expect(200);
            assert.equal(ok.body.fullName, 'Tên Mới');
            await http.patch(api('/users/me')).set(bearer(student.accessToken)).send({ role: 'admin' }).expect(400);
        });
        it('id sai định dạng => 400, admin không tự đổi role/xoá mình', async () => {
            await http.get(api('/users/khong-phai-uuid')).set(bearer(admin.accessToken)).expect(400);
            await http.patch(api(`/users/${admin.user.id}`)).set(bearer(admin.accessToken)).send({ role: 'student' }).expect(400);
            await http.patch(api(`/users/${admin.user.id}`)).set(bearer(admin.accessToken)).send({ isActive: false }).expect(400);
            await http.delete(api(`/users/${admin.user.id}`)).set(bearer(admin.accessToken)).expect(403);
        });
        it('đổi role có hiệu lực ngay với access token đang dùng', async () => {
            const u = await http
                .post(api('/auth/register'))
                .send({ email: 'len.chuc@test.vn', password: PASSWORD, fullName: 'Lên Chức' })
                .expect(201);
            const token = u.body.accessToken;
            await http.get(api('/users')).set(bearer(token)).expect(403);
            await http.patch(api(`/users/${u.body.user.id}`)).set(bearer(admin.accessToken)).send({ role: 'teacher' }).expect(200);
            await http.get(api('/users')).set(bearer(token)).expect(200);
        });
        it('khoá tài khoản: token cũ chết ngay, không đăng nhập lại được', async () => {
            const u = await http
                .post(api('/auth/register'))
                .send({ email: 'bi.khoa@test.vn', password: PASSWORD, fullName: 'Bị Khoá' })
                .expect(201);
            await http.get(api('/users/me')).set(bearer(u.body.accessToken)).expect(200);
            await http.patch(api(`/users/${u.body.user.id}`)).set(bearer(admin.accessToken)).send({ isActive: false }).expect(200);
            await http.get(api('/users/me')).set(bearer(u.body.accessToken)).expect(401);
            await http.post(api('/auth/login')).send({ email: 'bi.khoa@test.vn', password: PASSWORD }).expect(403);
            await http.post(api('/auth/refresh')).send({ refreshToken: u.body.refreshToken }).expect(401);
        });
    });
    describe('refresh token / đăng xuất / đổi mật khẩu', () => {
        it('refresh xoay vòng; dùng lại token cũ => 401 và thu hồi cả phiên', async () => {
            const first = await login('student@test.vn');
            const second = await http.post(api('/auth/refresh')).send({ refreshToken: first.refreshToken }).expect(200);
            assert.notEqual(second.body.refreshToken, first.refreshToken);
            await http.get(api('/users/me')).set(bearer(second.body.accessToken)).expect(200);
            await http.post(api('/auth/refresh')).send({ refreshToken: first.refreshToken }).expect(401);
            await http.post(api('/auth/refresh')).send({ refreshToken: second.body.refreshToken }).expect(401);
        });
        it('logout thu hồi refresh token', async () => {
            const s = await login('student@test.vn');
            await http.post(api('/auth/logout')).set(bearer(s.accessToken)).expect(204);
            await http.post(api('/auth/refresh')).send({ refreshToken: s.refreshToken }).expect(401);
        });
        it('refresh với chuỗi rác => 401', async () => {
            await http.post(api('/auth/refresh')).send({ refreshToken: 'abc' }).expect(401);
        });
        it('đổi mật khẩu: sai mật khẩu hiện tại => 401; đúng thì đăng xuất mọi nơi', async () => {
            const t = await login('teacher@test.vn');
            await http.post(api('/auth/change-password')).set(bearer(t.accessToken))
                .send({ currentPassword: 'SaiSaiSai1', newPassword: 'MatKhauMoi123' }).expect(401);
            await http.post(api('/auth/change-password')).set(bearer(t.accessToken))
                .send({ currentPassword: PASSWORD, newPassword: 'MatKhauMoi123' }).expect(204);
            await http.post(api('/auth/refresh')).send({ refreshToken: t.refreshToken }).expect(401);
            await http.post(api('/auth/login')).send({ email: 'teacher@test.vn', password: PASSWORD }).expect(401);
            await login('teacher@test.vn', 'MatKhauMoi123');
        });
    });
});
//# sourceMappingURL=auth.e2e.test.js.map