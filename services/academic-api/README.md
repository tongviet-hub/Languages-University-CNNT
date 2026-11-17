# School Portal – Backend (NestJS + PostgreSQL)

API xác thực & phân quyền cho School Portal. Stack: **NestJS 12**, **TypeORM**, **PostgreSQL**, JWT (access + refresh), `class-validator`, Swagger.

## Chạy nhanh

```bash
cd backend
cp .env.example .env        # rồi đổi JWT_*_SECRET (node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")

# 1. Bật PostgreSQL (chọn 1 trong 2)
docker compose up -d                                    # cách A: Docker (cổng 5440)
pg_ctl -D C:\Users\ADMIN\pgdata-school-portal -o "-p 5440" start   # cách B: instance local đã init sẵn trên máy này

# 2. Chạy
npm install
npm run seed                # tạo 3 tài khoản demo (an toàn khi chạy lại)
npm run start:dev           # http://localhost:3000/api  |  Swagger: http://localhost:3000/docs
npm test                    # e2e trên DB riêng school_portal_test
```

Tài khoản demo (mật khẩu `Password123!`):

| Vai trò | Email |
|---|---|
| admin | `admin@adu.edu.vn` |
| teacher | `teacher@adu.edu.vn` |
| student | `minhanh@sv.adu.edu.vn` |

## Endpoint

Tiền tố `/api`. Mặc định **mọi route đều cần Bearer token**, trừ route đánh dấu `@Public()`.

| Method | Path | Ai gọi được |
|---|---|---|
| GET | `/health` | public |
| POST | `/auth/register` | public – luôn tạo **student** |
| POST | `/auth/login` | public |
| POST | `/auth/refresh` | public (gửi refresh token) |
| POST | `/auth/logout` | đã đăng nhập |
| GET | `/auth/me` | đã đăng nhập |
| POST | `/auth/change-password` | đã đăng nhập |
| GET / PATCH | `/users/me` | đã đăng nhập |
| GET | `/users` | admin (xem tất cả), teacher (chỉ thấy student) |
| POST | `/users` | admin (tạo tài khoản với role bất kỳ) |
| GET / PATCH / DELETE | `/users/:id` | admin |

## Thiết kế xác thực & phân quyền

- **Access token** (15 phút) gửi qua header `Authorization: Bearer …`. **Refresh token** (7 ngày) chỉ để đổi lấy cặp token mới.
- **Xoay vòng refresh token**: mỗi lần refresh cấp token mới, token cũ chết. Dùng lại token cũ ⇒ coi như bị lộ ⇒ thu hồi cả phiên. DB chỉ lưu SHA-256 của token.
- **Tra DB ở mỗi request** (`JwtStrategy.validate`): khoá tài khoản hoặc đổi role có hiệu lực ngay, không phải đợi access token hết hạn.
- Mật khẩu băm bằng bcrypt (12 vòng); đăng nhập sai không phân biệt "sai email" hay "sai mật khẩu" và tốn thời gian như nhau.
- Rate limit: 60 req/phút/IP, riêng login/register/refresh/đổi mật khẩu là 10 req/phút.
- `ValidationPipe` với `forbidNonWhitelisted`: client không thể tự gửi `role` khi đăng ký.
- Admin không thể tự đổi role / khoá / xoá chính mình.

## Cấu trúc

```
src/
├─ main.ts, app.setup.ts     # khởi động + cấu hình chung (pipe, CORS, helmet, Swagger)
├─ app.module.ts             # module gốc: DB, throttler, 3 guard toàn cục
├─ config/env.validation.ts  # kiểm tra .env lúc khởi động
├─ common/                   # enum Role, decorator (@Public @Roles @CurrentUser), guard (Jwt, Roles)
├─ auth/                     # AuthModule: login/refresh/logout, JwtStrategy
├─ users/                    # UsersModule: entity, CRUD, phân quyền theo dữ liệu
├─ health/
└─ database/seed.ts
test/auth.e2e.test.ts
```

## Việc cần làm trước khi lên production

- Tắt `DB_SYNCHRONIZE`, chuyển sang **migration** của TypeORM.
- Đặt `NODE_ENV=production` (tắt Swagger và seed), đặt `CORS_ORIGINS` đúng domain, chạy sau HTTPS.
- Cân nhắc đưa refresh token vào cookie `httpOnly` thay vì body nếu frontend là SPA.
