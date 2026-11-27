# School Portal – Cổng thông tin trường học

Website cho trường học: sinh viên, giáo viên, quản trị viên đăng nhập để xem **thời khóa biểu, điểm, điểm danh, thông báo, hồ sơ cá nhân**.

Repo này phục vụ hai môn:

- **THHT – Chủ đề 04 (REST API Portal):** viết backend theo kiểu **microservice** (nhiều dịch vụ nhỏ, mỗi dịch vụ một việc).
- **CNNT – Đề tài 05 (Website trường học):** đưa website lên máy chủ thật, cấu hình hệ điều hành, bảo mật, sao lưu.

---

## Mục lục

1. [Hiểu nhanh trong 1 phút](#1-hiểu-nhanh-trong-1-phút)
2. [Bản đồ thư mục](#2-bản-đồ-thư-mục)
3. [Muốn sửa X thì vào đâu?](#3-muốn-sửa-x-thì-vào-đâu)
4. [Đã làm được gì, còn thiếu gì](#4-đã-làm-được-gì-còn-thiếu-gì)
5. [Chạy thử trên máy mình](#5-chạy-thử-trên-máy-mình)
6. [Backend: các đường dẫn API](#6-backend-các-đường-dẫn-api)
7. [CI/CD (tự động kiểm tra và triển khai)](#7-cicd-tự-động-kiểm-tra-và-triển-khai)
8. [Triển khai lên máy chủ (Đề tài 05)](#8-triển-khai-lên-máy-chủ-đề-tài-05)
9. [Phân công nhóm](#9-phân-công-nhóm)
10. [Quy tắc bảo mật](#10-quy-tắc-bảo-mật)
11. [Từ điển thuật ngữ](#11-từ-điển-thuật-ngữ)

---

## 1. Hiểu nhanh trong 1 phút

Hệ thống có **2 nửa**:

| Nửa | Thư mục | Là gì | Viết bằng |
|---|---|---|---|
| **Frontend** | `frontend/` | Giao diện người dùng thấy trên trình duyệt | React + TypeScript |
| **Backend** | `backend/` | Máy chủ xử lý đăng nhập, phân quyền, lưu dữ liệu | NestJS + PostgreSQL |

Backend lại chia thành **3 dịch vụ nhỏ**:

| Dịch vụ | Cổng | Nhiệm vụ | Có database? |
|---|---|---|---|
| **Portal** | 8080 | "Cửa chính". Frontend **chỉ** nói chuyện với Portal. Portal nhận yêu cầu rồi chuyển cho dịch vụ phù hợp. | Không |
| **Academic API** | 8081 | Đăng ký, đăng nhập, phân quyền, quản lý người dùng | Có (PostgreSQL) |
| **Finance API** | 8082 | Học phí, thanh toán. **Hiện mới có khung rỗng.** | Chưa |

Một lần đăng nhập đi như sau:

```
Trình duyệt (frontend)
      │  POST /api/v1/portal/auth/login
      ▼
   Portal (8080)  ── chuyển tiếp ──►  Academic API (8081)  ──►  PostgreSQL
      ▲                                       │
      └──────── trả về token + thông tin ─────┘
```

---

## 2. Bản đồ thư mục

```
.
├── frontend/                  ← GIAO DIỆN (React + Vite)
│   ├── src/
│   │   ├── pages/             ← mỗi file là một trang: login, dashboard, grades, schedule...
│   │   ├── components/        ← các mảnh giao diện dùng lại (menu, nút, thẻ, layout...)
│   │   ├── api/               ← hàm lấy dữ liệu cho các trang (hiện vẫn là dữ liệu mẫu)
│   │   └── lib/
│   │       ├── api-client.ts  ← gọi API thật tới Portal (đăng nhập, đăng ký, refresh token...)
│   │       ├── auth.tsx       ← quản lý trạng thái đăng nhập
│   │       ├── mock-data.ts   ← dữ liệu giả (điểm, lịch học...)
│   │       └── dictionary.ts  ← chữ hiển thị cho từng ngôn ngữ
│   ├── public/                ← file tĩnh (ảnh, tài liệu tải về)
│   ├── Dockerfile, nginx.conf ← đóng gói frontend thành image Docker
│   └── vite.config.ts         ← cấu hình Vite (khi dev, chuyển /api sang localhost:8080)
│
├── backend/                   ← MÁY CHỦ (NestJS), chia 3 dịch vụ
│   ├── portal/                ← cửa chính, không có DB
│   ├── academic-api/          ← đăng nhập, người dùng, có DB  (xem README riêng bên trong)
│   ├── finance-api/           ← khung tối thiểu (/health)
│   └── dist-test/             ← bản build cũ, không cần quan tâm
│
├── ci/                        ← script kiểm tra tự động (build, test, quét bảo mật)
├── .github/workflows/         ← GitHub Actions gọi các script trong ci/ (có README riêng)
│
├── docker-compose.yml         ← chạy cả 3 dịch vụ + PostgreSQL bằng 1 lệnh
├── docker-compose.deploy.yml  ← dùng thêm khi triển khai thật: chỉ mở Portal ra ngoài
├── .env.example               ← mẫu biến môi trường (copy thành .env rồi điền)
│
└── Documents/                 ← TÀI LIỆU MÔN HỌC (không phải code)
    ├── THHT requirements/     ← đề bài THHT Chủ đề 04
    └── CNNT requirements/     ← đề bài CNNT, hướng dẫn SV2, báo cáo cá nhân, báo cáo nhóm
```

Bên trong mỗi dịch vụ backend có cấu trúc giống nhau:

```
backend/<tên-dịch-vụ>/
├── src/            ← code chính (main.ts là điểm khởi động)
├── test/           ← test e2e
├── Dockerfile      ← đóng gói thành image Docker
├── package.json    ← thư viện và các lệnh npm
└── .env.example    ← mẫu cấu hình khi chạy riêng dịch vụ này (finance-api chưa có)
```

---

## 3. Muốn sửa X thì vào đâu?

| Muốn... | Mở file / thư mục |
|---|---|
| Sửa giao diện một trang (vd trang điểm) | `frontend/src/pages/grades.tsx` |
| Thêm trang mới | tạo file trong `frontend/src/pages/`, rồi khai báo đường dẫn trong `frontend/src/App.tsx` |
| Sửa menu bên trái, thanh trên cùng | `frontend/src/components/layout/` |
| Sửa chữ / bản dịch | `frontend/src/lib/dictionary.ts` |
| Sửa dữ liệu mẫu (điểm, lịch học...) | `frontend/src/lib/mock-data.ts` |
| Sửa cách frontend gọi API | `frontend/src/lib/api-client.ts` |
| Sửa logic đăng nhập / token | `backend/academic-api/src/auth/` |
| Sửa quản lý người dùng | `backend/academic-api/src/users/` |
| Sửa cách Portal chuyển tiếp yêu cầu | `backend/portal/src/` |
| Thêm nghiệp vụ học phí | `backend/finance-api/src/` |
| Đổi cổng, mật khẩu DB, khóa JWT | `.env` (copy từ `.env.example`) |
| Đổi cách CI kiểm tra | `ci/*.sh` (không sửa file `.yml`) |

---

## 4. Đã làm được gì, còn thiếu gì

**✅ Đã xong**

- Frontend đầy đủ giao diện: trang giới thiệu, đăng nhập, đăng ký, bảng điều khiển, thời khóa biểu, bảng điểm, điểm danh, thông báo, hồ sơ cá nhân.
- Đa ngôn ngữ, chế độ sáng/tối, menu lệnh nhanh, nút hiện/ẩn mật khẩu.
- **Đăng nhập, đăng ký, đổi mật khẩu, đăng xuất đã gọi backend thật** qua Portal.
- Backend có phân quyền 3 vai trò **admin / teacher / student**:
  - admin: quản lý mọi người dùng
  - teacher: chỉ xem được danh sách student
  - student: chỉ xem thông tin của mình
- Bảo mật backend: mật khẩu băm bcrypt, access token 15 phút + refresh token 7 ngày (mỗi lần làm mới là đổi token mới), giới hạn số lần gọi (rate limit), kiểm tra dữ liệu đầu vào, `helmet`.
- Test e2e cho Portal và Academic. CI/CD trên GitHub Actions.

**⏳ Chưa xong**

- Thời khóa biểu, điểm, điểm danh, thông báo **vẫn là dữ liệu giả** (`mock-data.ts`), chưa có API backend.
- Finance API mới có `/health`, chưa có nghiệp vụ học phí.

---

## 5. Chạy thử trên máy mình

**Cần cài:** Node.js ≥ 22, npm. Muốn chạy backend thì cần thêm **Docker** (dễ nhất) hoặc PostgreSQL.

### Cách A – Chỉ xem giao diện

```bash
cd frontend
npm install
npm run dev        # mở http://localhost:5173
```

Giao diện hiện lên được, nhưng **đăng nhập sẽ báo lỗi** vì chưa có backend. Muốn đăng nhập được thì làm thêm Cách B.

### Cách B – Chạy cả hệ thống bằng Docker (khuyên dùng)

```bash
# 1. Tạo file cấu hình
cp .env.example .env
# Mở .env, điền DB_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET.
# Sinh chuỗi ngẫu nhiên bằng lệnh:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 2. Bật backend (3 dịch vụ + PostgreSQL)
docker compose up -d --build

# 3. Tạo 3 tài khoản demo
docker compose exec academic-api node dist/database/seed.js

# 4. Bật frontend (terminal khác)
cd frontend && npm install && npm run dev
```

Mở http://localhost:5173 và đăng nhập bằng tài khoản demo bên dưới. Khi dev, Vite tự chuyển các yêu cầu `/api` sang Portal ở `localhost:8080`.

Tắt backend: `docker compose down`.

### Cách C – Chạy từng dịch vụ backend riêng (khi cần sửa code backend)

Mỗi dịch vụ chạy trong **một terminal riêng**:

```bash
# Terminal 1 – Academic API
cd backend/academic-api
cp .env.example .env                 # đổi JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (≥ 32 ký tự)
docker compose up -d                 # bật PostgreSQL riêng ở cổng 5440
npm install && npm run seed
PORT=8081 npm run start:dev          # http://localhost:8081/api/v1  |  tài liệu API: /docs

# Terminal 2 – Portal
cd backend/portal
cp .env.example .env                 # ACADEMIC_URL=http://localhost:8081
npm install && npm run start:dev     # http://localhost:8080/api/v1  |  tài liệu API: /docs

# Terminal 3 – Finance (không bắt buộc)
cd backend/finance-api
npm install && PORT=8082 npm run start:dev
```

Chạy test: `npm test` trong `backend/academic-api` (cần PostgreSQL) hoặc `backend/portal` (không cần DB).

### Tài khoản demo

Do lệnh seed tạo ra. Mật khẩu mặc định chỉ dùng khi phát triển (xem trong code seed của `backend/academic-api`).

| Vai trò | Email |
|---|---|
| admin | `admin@lumina.edu.vn` |
| teacher | `teacher@lumina.edu.vn` |
| student | `minhanh@sv.lumina.edu.vn` |

### Các lệnh npm hay dùng

| Lệnh | Ở đâu | Làm gì |
|---|---|---|
| `npm run dev` | frontend | chạy giao diện ở chế độ dev |
| `npm run build` | frontend | build ra `frontend/dist` (file tĩnh để đưa lên Nginx) |
| `npm run lint` | frontend | kiểm tra lỗi code |
| `npm run start:dev` | backend/* | chạy dịch vụ, tự khởi động lại khi sửa code |
| `npm test` | backend/* | chạy test |
| `npm run seed` | academic-api | tạo tài khoản demo |

> **Lưu ý kỹ thuật khi sửa backend:**
> - Code dùng **ESM**, nên khi import file khác phải ghi đuôi `.js` (vd `import { X } from './x.js'`).
> - **Giữ TypeScript ở bản ^6**, đừng nâng lên 7 (Nest CLI chưa build được với bản 7).

---

## 6. Backend: các đường dẫn API

Mọi đường dẫn đều bắt đầu bằng `/api/v1`. Có thể xem và thử trực tiếp trên trang Swagger: `http://localhost:8080/docs`.

### Portal – cửa chính, frontend gọi vào đây

| Method | Đường dẫn | Ai gọi được |
|---|---|---|
| GET | `/health` | ai cũng gọi được |
| POST | `/portal/auth/register` | ai cũng gọi được (luôn tạo tài khoản student) |
| POST | `/portal/auth/login`, `/portal/auth/refresh` | ai cũng gọi được |
| POST | `/portal/auth/logout`, `/portal/auth/change-password` | đã đăng nhập |
| GET | `/portal/me` | đã đăng nhập |

### Academic API – nội bộ, chỉ Portal gọi

| Method | Đường dẫn | Ai gọi được |
|---|---|---|
| GET | `/health` | ai cũng gọi được |
| POST | `/auth/register`, `/auth/login`, `/auth/refresh` | ai cũng gọi được |
| POST | `/auth/logout`, `/auth/change-password` | đã đăng nhập |
| GET | `/auth/me`, `/users/me` | đã đăng nhập |
| GET | `/users` | admin (thấy tất cả), teacher (chỉ thấy student) |
| POST / GET / PATCH / DELETE | `/users`, `/users/:id` | chỉ admin |

### Finance API

Mới có `GET /health`.

### Vài điều cần biết

- **Lỗi luôn có cùng một dạng:** `{"error": {"code": "...", "message": "...", "requestId": "..."}}`.
- **Request ID:** mỗi yêu cầu có một mã `X-Request-ID`. Portal và Academic đều ghi mã này vào log, nên khi có lỗi chỉ cần `grep <requestId>` là thấy yêu cầu đã đi qua những đâu.
- **Portal chờ dịch vụ con tối đa 2 giây:**
  - không kết nối được → `503`
  - quá 2 giây → `504`
  - dịch vụ con trả lỗi 5xx hoặc dữ liệu hỏng → `502`

Chi tiết về thiết kế xác thực: [backend/academic-api/README.md](backend/academic-api/README.md).

---

## 7. CI/CD (tự động kiểm tra và triển khai)

- **CI** (`.github/workflows/ci.yml`): mỗi khi tạo PR hoặc push, GitHub tự build, chạy lint, test và quét bảo mật, **chỉ cho phần code bị sửa**.
- **CD** (`.github/workflows/cd.yml`): khi push lên `main` và CI xanh, GitHub tự build image Docker, quét lỗ hổng, đẩy lên GHCR rồi cập nhật bản triển khai.

Logic thật nằm trong `ci/*.sh`, file `.yml` chỉ gọi script. Có thể chạy CI ngay trên máy mình:

```bash
bash ci/start-ci.sh                  # kiểm tra tất cả
bash ci/start-ci.sh portal frontend  # chỉ kiểm tra vài phần
```

Giải thích chi tiết: [.github/workflows/README.md](.github/workflows/README.md).

---

## 8. Triển khai lên máy chủ (Đề tài 05)

Khi chạy trên máy chủ thật, hệ thống trông như sau:

```
Trình duyệt ──cổng 80──► Nginx ──/ ─────────────► file tĩnh frontend/dist
                           │
                           └──/api/v1/ ──► Portal (127.0.0.1:8080)
                                             │   mạng nội bộ Docker 172.30.0.0/24
                                             ├──► Academic API (:8081) ──► PostgreSQL
                                             └──► Finance API  (:8082)
```

Ý chính:

- **Chỉ Nginx mở ra ngoài.** Nginx trả file giao diện, và chuyển `/api/v1/` sang **Portal** (`proxy_pass http://127.0.0.1:8080;`).
- Academic, Finance, PostgreSQL **chỉ nói chuyện trong mạng nội bộ**, bên ngoài không gọi thẳng được.
- Lệnh chạy khi triển khai:

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d --build
  ```

- Khi Nginx nằm cùng máy, thêm vào `.env`:

  ```
  PORTAL_BIND=127.0.0.1
  PORTAL_TRUST_PROXY=172.30.0.1
  ```

  (giải thích trong `.env.example`).

**Tài liệu hướng dẫn** nằm trong `Documents/CNNT requirements/`:

| File | Nội dung |
|---|---|
| `yeu_cau_bai_tap_nhom.md` | Đề bài nhóm |
| `HUONG_DAN_DOC_YEU_CAU_BAI_TAP_NHOM.md` | Giải thích đề bài cho dễ hiểu |
| `HUONG_DAN_SV2_UBUNTU.md` | Hướng dẫn SV2 cài web, Nginx, cấu hình hệ điều hành trên Ubuntu |
| `HUONG_DAN_SV2_ADVANCE.md` | Bản nâng cao: triển khai không gián đoạn, rollback, sandbox systemd, AppArmor... |
| `LENH_CHUP_ANH_SV2.md` | Các lệnh cần chạy để chụp ảnh minh chứng |
| `mau_bao_cao_ca_nhan.md` | Mẫu báo cáo cá nhân |
| `bao_cao_*.md` | Các báo cáo đã viết |

**Ba bài nghiệm thu của đề:**

- **KT1:** máy khác truy cập được `http://truong.test/`.
- **KT2:** phân biệt hai loại lỗi (sai DNS và dịch vụ bị dừng) bằng bằng chứng khác nhau.
- **KT3:** xóa nội dung rồi khôi phục lại từ bản sao lưu.

---

## 9. Phân công nhóm

| Thành viên | Phần việc |
|---|---|
| SV1 | DNS, sơ đồ đường đi của một lần truy cập web |
| **SV2** | **Cài web server, cấu hình hệ điều hành, tên miền nội bộ, thư mục nội dung, quyền tiến trình** |
| SV3 | Giới hạn truy cập quản trị, sao lưu & phục hồi, HTTPS, phân quyền, log |
| SV4 | Quan sát mã HTTP, log, PID, CPU/RAM khi có nhiều yêu cầu; kiểm thử KT2 |

---

## 10. Quy tắc bảo mật

- **Không bao giờ commit** `.env`, `*.pem`, `*.key`, mật khẩu thật. Chỉ commit `.env.example` với giá trị giả (`.gitignore` đã chặn sẵn).
- Trên máy chủ thật, mật khẩu và khóa JWT phải **sinh ngẫu nhiên**, không dùng giá trị mẫu như `change-me-...` hay `Password123!`.
- Trước khi commit, chạy `git status` và `git diff --cached` để chắc không lọt file bí mật.
- Ảnh chụp màn hình cho báo cáo: che IP nội bộ, tên người dùng máy và mọi mật khẩu.

---

## 11. Từ điển thuật ngữ

| Từ | Nghĩa đơn giản |
|---|---|
| **Frontend** | Phần giao diện chạy trên trình duyệt |
| **Backend** | Phần máy chủ xử lý dữ liệu, người dùng không thấy |
| **Microservice** | Chia backend thành nhiều dịch vụ nhỏ, mỗi dịch vụ lo một việc |
| **API** | "Cửa" để frontend gửi yêu cầu và nhận dữ liệu từ backend |
| **Endpoint** | Một đường dẫn API cụ thể, vd `/portal/auth/login` |
| **Token (JWT)** | "Vé" chứng minh đã đăng nhập. Access token dùng để gọi API (sống 15 phút); refresh token dùng để xin vé mới (sống 7 ngày) |
| **Mock data** | Dữ liệu giả để dựng giao diện trước khi có backend |
| **Seed** | Lệnh tạo sẵn dữ liệu ban đầu (vd tài khoản demo) |
| **Docker / image / container** | Đóng gói ứng dụng kèm mọi thứ nó cần để chạy giống nhau trên mọi máy |
| **Docker Compose** | Chạy nhiều container cùng lúc bằng một file cấu hình |
| **Nginx** | Web server đứng trước, trả file giao diện và chuyển tiếp yêu cầu API |
| **Swagger** | Trang web tự sinh, liệt kê và cho thử các API (`/docs`) |
| **CI/CD** | Tự động kiểm tra code (CI) và tự động triển khai (CD) mỗi khi push |
| **e2e test** | Test chạy cả luồng từ đầu tới cuối, như người dùng thật gọi API |
