# School Portal – Cổng thông tin trường học

Website cổng thông tin cho trường học (thời khóa biểu, điểm, điểm danh, thông báo, hồ sơ cá nhân), kèm một **backend xác thực & phân quyền** theo vai trò. Dự án làm cho **Đề tài 05 – Website trường học**: ngoài việc có website chạy được, nhóm còn phải **triển khai nó lên máy chủ, cấu hình hệ điều hành, đảm bảo an toàn và có sao lưu** (xem [Triển khai & vận hành](#triển-khai--vận-hành-đề-tài-05)).

## Mục lục

- [Trạng thái hiện tại](#trạng-thái-hiện-tại)
- [Tính năng](#tính-năng)
- [Công nghệ](#công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Chạy trên máy cá nhân](#chạy-trên-máy-cá-nhân)
- [Backend API](#backend-api)
- [Triển khai & vận hành (Đề tài 05)](#triển-khai--vận-hành-đề-tài-05)
- [Phân công nhóm](#phân-công-nhóm)
- [Quy tắc bảo mật khi làm việc với repo](#quy-tắc-bảo-mật-khi-làm-việc-với-repo)

## Trạng thái hiện tại

| Phần | Tình trạng |
|---|---|
| **Frontend** (`frontend/`) | Chạy được đầy đủ giao diện. **Dữ liệu và đăng nhập đang là dữ liệu mẫu** (mock): vai trò lưu trong `localStorage`, chưa gọi API thật. |
| **Backend** (`backend/`) | API đăng nhập, làm mới token, phân quyền admin/teacher/student, quản lý người dùng; có test e2e. **Chưa được frontend sử dụng.** |
| **Tài liệu triển khai** (`../docs/`, ngoài repo) | Hướng dẫn cài web server, cấu hình hệ điều hành, hardening (Windows, Ubuntu, nâng cao). Không nằm trong repo này. |

> Nối frontend với backend (thay `frontend/src/api` và `frontend/src/lib/auth.tsx` bằng lời gọi `/api/...`) là bước tiếp theo, chưa làm.

## Tính năng

**Frontend**
- Trang giới thiệu (landing) có form đăng ký tư vấn.
- Đăng nhập demo theo vai trò.
- Bảng điều khiển, **thời khóa biểu**, **bảng điểm**, **điểm danh theo tháng**, **thông báo**, **bài tập**, **hồ sơ cá nhân**.
- Đa ngôn ngữ (chuyển ngôn ngữ trên giao diện), chế độ sáng/tối, menu lệnh nhanh (command menu), tải trang theo yêu cầu (lazy loading).

**Backend**
- Đăng ký (luôn tạo tài khoản *student*), đăng nhập, làm mới token, đăng xuất, đổi mật khẩu.
- Phân quyền theo vai trò **admin / teacher / student**; admin quản lý người dùng, teacher chỉ xem được student.
- Thiết kế an toàn: access token 15 phút + refresh token 7 ngày có **xoay vòng**, mật khẩu băm bcrypt, giới hạn tốc độ (rate limit), kiểm tra dữ liệu đầu vào nghiêm ngặt, `helmet`.

## Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui + Base UI, React Router 7, TanStack Query, React Hook Form + Zod, Recharts |
| Backend | NestJS 12 (ESM), TypeORM, PostgreSQL, Passport JWT, class-validator, Swagger, Helmet, Throttler |
| Triển khai (Đề tài 05) | Nginx, systemd, ufw, (AppArmor, cgroup trong bản nâng cao), PostgreSQL |

## Cấu trúc thư mục

```
.
├── frontend/          # Website (React + Vite). `npm run build` → frontend/dist (file tĩnh)
│   ├── public/tai-lieu/   # Tài liệu tải về (vd: thong-bao-mau.txt)
│   └── src/
│       ├── pages/         # landing, login, dashboard, schedule, grades, attendance, announcements, profile
│       ├── components/    # layout, ui, landing, common
│       ├── api/           # hàm lấy dữ liệu (hiện là dữ liệu mẫu)
│       └── lib/           # auth, dữ liệu mẫu, từ điển đa ngôn ngữ
├── backend/           # API NestJS + PostgreSQL (xem backend/README.md)
│   ├── src/{auth,users,common,config,database,health}
│   └── test/auth.e2e.test.ts
└── README.md
```
Hướng dẫn triển khai & vận hành (Đề tài 05) nằm ở thư mục `docs/` **cạnh** thư mục dự án (`KEY_PROJECT/docs/`), không thuộc repo này.

## Chạy trên máy cá nhân

Yêu cầu: **Node.js ≥ 22**, npm. Backend cần thêm PostgreSQL (hoặc Docker).

### Frontend
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build      # build ra frontend/dist
npm run lint       # oxlint
```

### Backend
```bash
cd backend
cp .env.example .env                 # rồi đổi JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (≥ 32 ký tự)
docker compose up -d                 # bật PostgreSQL (cổng 5440), hoặc dùng PostgreSQL có sẵn và sửa .env
npm install
npm run seed                         # tạo 3 tài khoản demo
npm run start:dev                    # API: http://localhost:3000/api   |   Swagger: http://localhost:3000/docs
npm test                             # test e2e trên DB riêng school_portal_test
```
Chi tiết thiết kế xác thực và danh sách endpoint: [backend/README.md](backend/README.md).

> Lưu ý kỹ thuật: backend là **ESM** (import tương đối phải có đuôi `.js`) và **TypeScript phải giữ ở bản ^6** (bản 7 chưa có compiler API nên Nest CLI không build được).

**Tài khoản demo** (do `npm run seed` tạo, mật khẩu mặc định chỉ dùng khi phát triển):

| Vai trò | Email |
|---|---|
| admin | `admin@adu.edu.vn` |
| teacher | `teacher@adu.edu.vn` |
| student | `minhanh@sv.adu.edu.vn` |

## Backend API

Tiền tố `/api`; mặc định mọi route cần `Authorization: Bearer <accessToken>`, trừ route công khai.

| Method | Đường dẫn | Ai gọi được |
|---|---|---|
| GET | `/health` | công khai |
| POST | `/auth/register`, `/auth/login`, `/auth/refresh` | công khai |
| POST | `/auth/logout`, `/auth/change-password` | đã đăng nhập |
| GET | `/auth/me`, `/users/me` | đã đăng nhập |
| GET | `/users` | admin (tất cả), teacher (chỉ student) |
| POST, GET/PATCH/DELETE | `/users`, `/users/:id` | admin |

## Triển khai & vận hành (Đề tài 05)

Hướng dẫn nằm ở thư mục `KEY_PROJECT/docs/` (cạnh thư mục dự án, **không nằm trong repo này**). Chúng viết cho vai trò **SV2 – "Cài web, cấu hình hệ điều hành"**, nhưng cả nhóm đọc để hiểu hệ thống chạy thế nào.

| Tài liệu (trong `KEY_PROJECT/docs/`) | Dành cho | Nội dung |
|---|---|---|
| `HUONG_DAN_SV2.md` | **Windows 11** | Phân tích đề bằng lời dễ hiểu; build web; cài Nginx; tên miền nội bộ `truong.test`; chạy dịch vụ dưới tài khoản ít quyền; chuẩn bị KT1–KT3 và câu hỏi bảo vệ |
| `HUONG_DAN_SV2_UBUNTU.md` | **Ubuntu** | Như trên nhưng trên Linux; có cài đặt ban đầu cho máy mới, **mục G: chạy thêm Backend + PostgreSQL**, và **phụ lục H: toàn bộ lệnh theo thứ tự (copy-paste)** |
| `HUONG_DAN_SV2_ADVANCE.md` | **Ubuntu (nâng cao)** | Triển khai không gián đoạn + rollback; chạy Nginx không root; sandbox systemd và cgroup; AppArmor; tinh chỉnh hệ điều hành; tự chấm điểm bằng script; Cấp 8 vận hành backend + PostgreSQL an toàn |

**Kiến trúc đích khi triển khai** (hướng có backend):
```
Trình duyệt ──80──► Nginx ──/──────► file tĩnh frontend/dist
                      │
                      └──/api/──► NestJS (127.0.0.1:3000) ──► PostgreSQL (127.0.0.1:5432)
```
Chỉ Nginx lộ ra ngoài; backend và database chỉ nói chuyện nội bộ và chạy bằng tài khoản hệ thống ít quyền.

**Ba bài nghiệm thu của đề:** KT1 – truy cập `http://truong.test/` từ máy khác; KT2 – phân biệt hai loại lỗi (DNS sai và dừng dịch vụ) bằng bằng chứng khác nhau; KT3 – xóa nội dung rồi khôi phục từ bản sao lưu.

## Phân công nhóm

| Thành viên | Phần việc |
|---|---|
| SV1 | DNS, sơ đồ đường đi của một lần truy cập web |
| **SV2** | **Cài web server, cấu hình hệ điều hành, tên miền nội bộ, thư mục nội dung, quyền tiến trình** |
| SV3 | Giới hạn truy cập quản trị, sao lưu & phục hồi, phương án HTTPS, phân quyền, log |
| SV4 | Quan sát mã HTTP, log, PID, CPU/RAM khi có nhiều yêu cầu; kiểm thử KT2 |

## Quy tắc bảo mật khi làm việc với repo

- **Không commit** `.env`, `*.pem`, `*.key`, mật khẩu thật hay khóa riêng (đã có trong `.gitignore`). Chỉ commit `.env.example` với giá trị giả.
- Mật khẩu/khóa JWT trên máy chủ thật phải **sinh ngẫu nhiên**, không dùng giá trị mẫu `change-me-...` hay `Password123!`.
- Trước mỗi lần commit: `git status` và `git diff --cached` để chắc không có file bí mật.
- Ảnh chụp màn hình đưa vào báo cáo nên che IP nội bộ, tên người dùng máy và mọi mật khẩu.
