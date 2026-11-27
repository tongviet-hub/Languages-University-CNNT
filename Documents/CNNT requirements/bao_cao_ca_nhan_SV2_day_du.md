# BÁO CÁO CÁ NHÂN BÀI TẬP LỚN – SINH VIÊN 2 (SV2)

*Trọng tâm: phần việc SV2 – cài Web server Nginx và cấu hình hệ điều hành – gồm phần cơ bản và phần nâng cao (Cấp 1–7), kèm mở rộng tự chọn so sánh Nginx ↔ Apache. Phần triển khai trên Kubernetes là việc làm thêm, chỉ trình bày tóm tắt.*

---

## MỤC LỤC

**1.** Thông tin sinh viên và đề tài

**2.** Nhiệm vụ được giao và kết quả

**PHẦN VIỆC KỸ THUẬT VÀ MINH CHỨNG**

**3.** Trình bày công việc trực tiếp thực hiện
- 3.0. CV00 – Viết mã nguồn website của hệ thống
- *Phần A – Yêu cầu bắt buộc*
    - 3.1. CV01 – Cài đặt Nginx và cấu hình Virtual Host
    - 3.2. CV02 – Tài khoản dịch vụ và phân quyền hệ thống tệp
    - 3.3. CV03 – Phương án HTTPS
    - 3.4. CV04 – Gia cố hệ điều hành (phần nâng cao, Cấp 1–7) và so sánh với Apache
        - a) Cấp 1 – Triển khai chuyên nghiệp: tách vai trò, đổi bản nguyên tử, phát hiện sửa lén
        - b) Cấp 2 – Toàn bộ Nginx chạy không root
        - c) Cấp 3 – Sandbox systemd và trần tài nguyên cgroup
        - d) Cấp 4 – AppArmor (kiểm soát truy cập bắt buộc, MAC)
        - e) Cấp 5 – Tinh chỉnh hệ điều hành
        - f) Cấp 6 – Tự chấm bằng script, Cấp 7 – Phòng lab lỗi
        - g) So sánh Nginx đã gia cố và Apache mặc định
- *Phần B – Việc làm thêm: triển khai trên Kubernetes (tóm tắt)*

**4.** Danh mục minh chứng

**KIỂM THỬ VÀ XỬ LÝ VẤN ĐỀ**

**5.** Kết quả kiểm thử cá nhân
- 5.1. Kiểm thử phần bắt buộc
    - KT1 – Truy cập trang và tải tài liệu bằng tên miền
    - KT2 – Phân biệt lỗi DNS và lỗi dịch vụ
    - KT3 – Sao lưu và khôi phục nội dung web
    - Kiểm thử hiệu năng
    - Kiểm thử tự động `verify-sv2.sh`
    - Triển khai không gián đoạn và tự rollback
    - Thí nghiệm DAC và MAC

**6.** Vấn đề đã gặp và cách xử lý
- 6.1. Vấn đề chính: mất quyền thư mục nhưng web trả 500 chứ không phải 403
- 6.2. Các lỗi khác đã xử lý ở phần nâng cao

**ĐÓNG GÓP VÀ TỰ ĐÁNH GIÁ**

**7.** Tiến độ và phối hợp

**8.** Hiểu hệ thống và tự đánh giá

**9.** Nguồn tham khảo và công cụ hỗ trợ

**10.** Cam kết cá nhân

**PHỤ LỤC**

- Phụ lục A – Danh mục tệp bàn giao
- Phụ lục B – Lệnh thực hiện và kết quả ghi nhận (phần cơ bản A1–A5, phần nâng cao B1–B9)


---

## 1. Thông tin sinh viên và đề tài

| | |
|---|---|
| **Họ và tên** | Tống Quang Việt |
| **Mã sinh viên và lớp** | B24DCCC288 / D24CCHT03 |
| **Nhóm và mã đề tài** | Nhóm 2A / Đề tài 05 |
| **Tên đề tài** | Phân tích và triển khai hệ thống Website cho trường học |
| **Học phần** | Nhập môn Công nghệ Thông tin và Truyền thông |
| **Vai trò chính trong nhóm** | Sinh viên 2 – Kỹ sư Quản trị Web Server & An toàn Hệ điều hành; người viết mã nguồn website (frontend React, backend NestJS, dịch vụ Portal) mà cả nhóm dùng để triển khai; người thực hiện phần mở rộng Kubernetes |
| **Thời gian thực hiện** | Mã nguồn website: từ 04/11/2026 đến 18/11/2026. Phần bắt buộc (Nginx, cơ bản và nâng cao): từ 05/11/2026 đến 10/11/2026. Phần mở rộng: từ 17/11/2026 đến 18/11/2026 (cụm K3s, ArgoCD, Cloudflare Tunnel, Prometheus đã được tôi dựng từ 11/11/2026 đến 13/11/2026 cho một dự án cá nhân và được dùng lại) |
| **Ngày nộp báo cáo** | 26/11/2026 |

## 2. Nhiệm vụ được giao và kết quả

**Phần bắt buộc (theo phiếu giao đề, vai SV2: cài Web, cấu hình hệ điều hành)**

| Mã việc | Nhiệm vụ và sản phẩm phải bàn giao | Kết quả thực tế |
|---|---|---|
| CV00 | Viết mã nguồn website được triển khai trong đề tài: frontend React (11 trang), backend `academic-api` (đăng nhập JWT, quản lý người dùng, phân quyền vai trò), dịch vụ `portal` (cổng API gộp) và kiểm thử e2e | Hoàn thành: `frontend/`, `backend/academic-api/`, `backend/portal/`, `backend/finance-api/`; 9 commit từ 04/11 đến 18/11/2026 (mục 3.0) |
| CV01 | Cài Nginx 1.28.3 trên Ubuntu 26.04.1; cấu hình Virtual Host `truong.test`: log riêng định dạng `school`, ẩn phiên bản, nén gzip, hỗ trợ route React, chặn file ẩn; gỡ site `default`; mở tường lửa `ufw` cổng 80 cho dải LAN | Hoàn thành: `/etc/nginx/sites-available/school`, `/etc/nginx/nginx.conf` (`user svc_nginx;`) |
| CV02 | Tạo tài khoản hệ thống `svc_nginx` (không đăng nhập được); phân quyền `/var/www/school` chủ `root:svc_nginx`, thư mục 750, tệp 640; kiểm chứng `svc_nginx` chỉ đọc được, không ghi được, người khác không đọc được | Hoàn thành |
| CV03 | Trình bày phương án HTTPS: khoá riêng 2048-bit, CSR, chứng chỉ X.509; chuyển hướng 80 → 443 (301); HSTS | Hoàn thành (trình bày phương án, mục 3.3) |
| CV04 | Gia cố hệ điều hành theo hướng dẫn nâng cao, Cấp 1–7: triển khai nguyên tử có sổ băm và tự rollback, tài khoản `deploy` chỉ được sudo 1 lệnh; toàn bộ Nginx chạy không root với 1 capability; sandbox systemd + cgroup (điểm 6.7 → 1.7); AppArmor enforce và thí nghiệm DAC/MAC; tinh chỉnh file descriptor, `somaxconn`, mount chỉ đọc; script tự chấm và 5 lab gây lỗi; so sánh với Apache | Hoàn thành: `nginx-school.service`, `nginx-school.service.d/10-sandbox.conf`, `/etc/nginx-school/nginx.conf`, `usr.sbin.nginx`, `90-school.conf`, `/etc/sudoers.d/school-deploy`, `school-deploy.sh`, `verify-sv2.sh` (31/31 PASS) |

**Mở rộng tự chọn của đề** (*"triển khai và kiểm thử một phương án thay thế cho một thành phần của đề; so sánh bằng cùng tiêu chí và số liệu"*): thay HTTP server Nginx bằng Apache 2.4.66 và so sánh theo các tiêu chí thuộc phần SV2 – xem CV04 mục g.

**Việc làm thêm ngoài yêu cầu (tóm tắt ở mục 3, Phần B):** đưa cùng website lên cụm Kubernetes K3s theo mô hình GitOps.

| Mã việc | Nhiệm vụ | Kết quả thực tế |
|---|---|---|
| CV05 | Đóng gói frontend và 3 dịch vụ backend thành Docker image chạy không cần root | Hoàn thành: `frontend/Dockerfile`, `frontend/nginx.conf`, `backend/*/Dockerfile` |
| CV06 | Viết manifest Kubernetes, triển khai lên cụm K3s qua ArgoCD, mở tên miền qua Cloudflare Tunnel | Hoàn thành: `infra/apps/portal/`, `infra/argocd/portal.yaml`; `https://lumina.synnie.dev` |
| CV07 | Pipeline CI/CD; bộ script chạy CI trên máy trước khi push | Hoàn thành: `.github/workflows/ci.yml`, `cd.yml`, `ci/*.sh`, `.gitleaks.toml` |
| CV08 | Siết an toàn vận hành trên cụm: NetworkPolicy, giới hạn quyền/tài nguyên, sao lưu CSDL, log tập trung, cảnh báo | Hoàn thành: `network-policy.yaml`, `policies.yaml`, `postgres-backup.yaml`, `alerts.yaml` |

---

# Phần việc kỹ thuật và minh chứng

## 3. Trình bày công việc trực tiếp thực hiện

### 3.0. CV00 – Viết mã nguồn website của hệ thống

**Mục tiêu:** có một website trường học thật (không phải trang tĩnh mẫu) để triển khai lên Nginx ở phần bắt buộc và lên Kubernetes ở phần mở rộng. Trang thông báo và mục tài liệu tải về đáp ứng phạm vi của đề ("website cung cấp thông báo và tài liệu").

**Môi trường thực hiện:** Node.js 22, React + Vite + TypeScript (frontend), NestJS + TypeORM + PostgreSQL (backend), Git/GitHub.

**Các bước đã thực hiện (theo lịch sử Git, tác giả đều là tôi):**
1. `789db84` (04/11 18:48): frontend React gồm trang giới thiệu, đăng nhập, bảng điều khiển, thông báo, lịch học, điểm, điểm danh, hồ sơ, trang 404; hỗ trợ hai ngôn ngữ (`i18n.tsx`, `dictionary.ts`).
2. `2d1edd5` (04/11 23:23): backend NestJS: đăng nhập bằng JWT (access + refresh token), quản lý người dùng, phân quyền 3 vai trò `admin/teacher/student`, mật khẩu băm bằng bcrypt, giới hạn số lần thử (`@nestjs/throttler`), script seed tài khoản demo, kiểm thử e2e `auth.e2e.test.ts`.
3. `7ac7a72`, `3f5fb95` (17/11 14:34): tách backend thành kiến trúc nhiều dịch vụ: `academic-api` (học vụ), `finance-api` (học phí, hiện mới có `/health`) và `portal` (cổng API gộp: chuyển tiếp yêu cầu, gắn `X-Request-Id`, chuẩn hoá mã lỗi 502/503/504 khi dịch vụ con hỏng, cấu hình `TRUST_PROXY`); kiểm thử e2e `portal.e2e.test.ts` (17 ca). Cùng commit này có Dockerfile và workflow CD (Phần B).
4. `47baf19` (17/11 14:44): frontend gọi API thật qua `api-client.ts` thay cho đăng nhập giả, xử lý lỗi và thông báo cho người dùng.
5. `83a14c3` (17/11 14:54): trang đăng ký tài khoản sinh viên. `b5fd616` (18/11 09:45): nút hiện/ẩn mật khẩu ở đăng nhập, đăng ký, đổi mật khẩu.

**Cấu hình hoặc quyết định quan trọng:**
- Đăng nhập sai email hay sai mật khẩu đều tốn cùng thời gian (so với một hash giả) để kẻ dò không biết email nào có trong hệ thống.
- Frontend là ứng dụng một trang (SPA): mọi đường dẫn như `/grades` phải trả về `index.html` → đây là lý do tôi cấu hình `try_files ... /index.html` trên Nginx (CV01) và trong `frontend/nginx.conf` (CV05).

**Kết quả và giới hạn:** khoảng 7.000 dòng TypeScript ở frontend, 1.200 dòng ở `academic-api`, 730 dòng ở `portal`; mỗi lần push đều qua CI (CV07). Giới hạn: `finance-api` mới là khung; một số trang (lịch học, điểm, điểm danh) còn dùng dữ liệu mẫu `mock-data.ts`.

### PHẦN A – YÊU CẦU BẮT BUỘC

### 3.1. CV01 – Cài đặt Nginx và cấu hình Virtual Host

**Mục tiêu:** máy khách truy cập được website qua tên miền nội bộ `truong.test`.

**Môi trường thực hiện:** Ubuntu 26.04.1 LTS, kernel 7.0.0-42-generic, máy `viet-BATTLE-AX-B760M-T-WIFI`, IP LAN `192.168.102.114/24` (thêm giao diện Tailscale `100.83.219.103`); Nginx 1.28.3 (Ubuntu). Tên miền `truong.test` khai báo trong `/etc/hosts` trỏ về `127.0.0.1`.

**Các bước đã thực hiện:**
1. Cài Nginx, bật dịch vụ bằng `systemctl enable --now nginx`.
2. Sửa `/etc/nginx/nginx.conf` thành `user svc_nginx;` để worker chạy bằng tài khoản ít quyền (CV02).
3. Tạo `/etc/nginx/sites-available/school`:
    - `listen 80`, `server_name truong.test`, `root /var/www/school`, `index index.html`;
    - log riêng `/var/log/nginx/school.access.log` dùng định dạng tự đặt `school` (IP, thời điểm, yêu cầu, mã trả về, số byte, thời gian xử lý) và `school.error.log` mức `warn`;
    - `server_tokens off` (ẩn phiên bản Nginx); `gzip on` cho CSS/JS/JSON/SVG;
    - `location /` dùng `try_files $uri $uri/ /index.html` cho route của React;
    - `location /assets/` cho trình duyệt lưu đệm 7 ngày;
    - `location /tai-lieu/` dùng `try_files $uri =404` để tài liệu không tồn tại trả 404 thật (phục vụ quan sát mã HTTP);
    - `location ~ /\.` `deny all` để chặn `.git`, `.env` (trả 403).
4. Liên kết sang `sites-enabled` và **gỡ site `default`**, chỉ còn `school`.
5. Kiểm tra cú pháp `sudo nginx -t` (ok) rồi mới `systemctl restart nginx`.
6. Mở tường lửa `ufw`: OpenSSH; cổng 80/tcp chỉ cho dải LAN `192.168.102.0/24` và giao diện `tailscale0`, không mở cho mọi nơi.

**Cấu hình hoặc quyết định quan trọng:**
- Log riêng, có thêm thời gian xử lý, để SV3/SV4 đọc và phân tích mà không lẫn với site mặc định.
- Gỡ site `default`: tránh truy cập bằng IP/tên lạ lại rơi vào trang mặc định của Nginx.
- Tách `/tai-lieu/` khỏi luật SPA: nếu để chung thì tài liệu không tồn tại vẫn trả 200 kèm `index.html`, che mất lỗi thật.
- Luôn chạy `nginx -t` trước `reload/restart`: cấu hình lỗi mà nạp thẳng có thể làm dừng web.

**Kết quả:** `nginx.service` `active (running)`, 1 master + 12 worker (Nginx tự chọn `worker_processes auto` theo số nhân CPU) dùng khoảng 12 MB RAM (ảnh lúc 06/11/2026 10:59).

### 3.2. CV02 – Tài khoản dịch vụ và phân quyền hệ thống tệp

**Mục tiêu:** tiến trình web chỉ đọc được nội dung, không sửa được; người dùng khác không đọc được.

**Các bước đã thực hiện:**
1. Tạo tài khoản hệ thống `svc_nginx` (uid 997, gid 973), không có thư mục home, shell `nologin`.
2. Đặt chủ `/var/www/school` là `root:svc_nginx`; thư mục `750` (`drwxr-x---`), tệp `640` (`-rw-r-----`).
3. Kiểm chứng bằng chính các tài khoản:
    - `sudo -u svc_nginx cat /var/www/school/index.html` → đọc được;
    - `sudo -u svc_nginx touch /var/www/school/hack.txt` → `Permission denied`;
    - `sudo -u nobody cat /var/www/school/index.html` → `Permission denied`;
    - `namei -l /var/www/school/index.html` cho thấy quyền từng tầng thư mục; người dùng thường (`viet`) bị chặn ngay ở thư mục `school`.

**Cấu hình hoặc quyết định quan trọng:**
- Chủ là `root`, nhóm là `svc_nginx`: chỉ quản trị sửa được nội dung, Nginx chỉ đọc. Nếu Nginx bị chiếm quyền thì kẻ tấn công cũng không ghi đè được trang.
- Thư mục cần quyền `x` cho nhóm để Nginx đi vào được thư mục; "người khác" không có quyền nào.
- Ở cấu hình cơ bản, master vẫn chạy root (cần mở cổng 80), chỉ worker là `svc_nginx`; phần nâng cao (CV04) bỏ hẳn root.

### 3.3. CV03 – Phương án HTTPS

**Mục tiêu:** đề yêu cầu *trình bày phương án HTTPS cho triển khai thực tế*; phần này nêu phương án cho site `truong.test`.

**Phương án:**
1. Tạo khoá riêng RSA 2048-bit và CSR bằng OpenSSL, ký chứng chỉ X.509 (tự ký hoặc CA nội bộ cho mạng trường; CA công khai như Let's Encrypt khi ra Internet).
2. Thêm khối `listen 443 ssl`, khai báo `ssl_certificate` và `ssl_certificate_key`; khoá riêng đặt ngoài `/var/www`, quyền chỉ cho root và tài khoản dịch vụ đọc.
3. Khối cổng 80 trả `return 301 https://$host$request_uri;` để mọi truy cập HTTP chuyển sang HTTPS.
4. Thêm header HSTS (`Strict-Transport-Security`) để trình duyệt tự dùng HTTPS ở các lần sau.
5. Mở thêm cổng 443/tcp trên `ufw` cho dải LAN; bổ sung đường dẫn khoá/chứng chỉ vào profile AppArmor (CV04 d) để Nginx đọc được.

**Cấu hình hoặc quyết định quan trọng:** chứng chỉ tự ký chỉ phù hợp mạng nội bộ, trình duyệt sẽ cảnh báo. Khi triển khai thật trên Internet thì dùng chứng chỉ của CA công khai (Let's Encrypt). Ở phần làm thêm trên Kubernetes, TLS do Cloudflare đảm nhận (Phần B).

### 3.4. CV04 – Gia cố hệ điều hành (phần nâng cao, Cấp 1–7) và so sánh với Apache

**Mục tiêu:** đi xa hơn cấu hình cơ bản (master vẫn root): bỏ hẳn root, giam dịch vụ trong sandbox, thêm lớp kiểm soát truy cập bắt buộc, tinh chỉnh nhân HĐH, triển khai không gián đoạn và tự kiểm chứng bằng script.

**Môi trường thực hiện:** cùng máy Ubuntu 26.04.1 ở CV01; dịch vụ mới `nginx-school.service` với cấu hình riêng `/etc/nginx-school/nginx.conf` (tách khỏi `/etc/nginx` của gói để dễ quay lại bản gốc); gói thêm `libcap2-bin`, `apparmor`, `apparmor-utils`; Apache 2.4.66 chỉ để so sánh.

#### a) Cấp 1 – Triển khai chuyên nghiệp: tách vai trò, đổi bản nguyên tử, phát hiện sửa lén

1. Ba vai trò tách biệt: `root` (quản trị), `deploy` (người đưa web lên), `svc_nginx` (chạy web). `deploy` chỉ có đúng một quyền sudo: `/etc/sudoers.d/school-deploy` với `NOPASSWD: /usr/local/sbin/school-deploy.sh`; thử chạy lệnh hệ thống khác bị từ chối ngay.
2. Mỗi bản build nằm trong `/var/www/school/releases/<thời điểm>/`; Nginx trỏ vào liên kết `current`, đổi bằng `mv -T` (thao tác nguyên tử: luôn trỏ vào trọn bản cũ hoặc trọn bản mới).
3. Mỗi bản có sổ băm SHA-256 ở `manifests/*.sha256` (thuộc root, ngoài tầm với của web). Chèn thử `<!-- hacked -->` vào `index.html` → `school-deploy.sh verify` phát hiện sai lệch và quay về bản nguyên vẹn trước đó.
4. Health-check tự rollback: cố ý triển khai với địa chỉ kiểm tra không tồn tại (`khong-co.pdf`) → script nhận mã 404 và tự quay về bản cũ. Trong lúc đó vòng `curl` liên tục ghi nhận **557/557 yêu cầu đều trả 200**, không gián đoạn.

#### b) Cấp 2 – Toàn bộ Nginx chạy không root

1. Viết `/etc/systemd/system/nginx-school.service`: `User=svc_nginx`, `Group=svc_nginx`; `RuntimeDirectory`, `StateDirectory`, `LogsDirectory` để systemd tự tạo thư mục PID/tạm/log thuộc `svc_nginx`; `KillSignal=SIGQUIT` (tắt êm), `Restart=on-failure`, `UMask=0027`.
2. Cấp **đúng một** capability: `AmbientCapabilities=CAP_NET_BIND_SERVICE`, `CapabilityBoundingSet=CAP_NET_BIND_SERVICE`, `NoNewPrivileges=yes`.
3. Tắt `nginx.service` gốc (cùng cổng 80), bật `nginx-school`.

**Kết quả:** cả master lẫn worker đều là `svc_nginx`. Đối chứng: tước capability thì Nginx khởi động báo `bind() to 0.0.0.0:80 failed (13: Permission denied)` – đúng lý do bình thường Nginx phải để master chạy root.

#### c) Cấp 3 – Sandbox systemd và trần tài nguyên cgroup

Drop-in `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf`:
- Hệ thống tệp: `ProtectSystem=strict` (toàn bộ `/` chỉ đọc trừ thư mục runtime/log), `ProtectHome=yes`, `PrivateTmp=yes`, `PrivateDevices=yes`, `InaccessiblePaths` cho `/root /boot /mnt /media /srv /opt`, `ProtectProc=invisible`.
- Nhân: `ProtectKernelTunables/Modules/Logs`, `ProtectControlGroups`, `ProtectClock`, `ProtectHostname`.
- Hành vi: `RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX`, `RestrictNamespaces`, `RestrictSUIDSGID`, `MemoryDenyWriteExecute=yes`, `SystemCallFilter=@system-service` (seccomp).
- cgroup: `MemoryMax=300M`, `CPUQuota=80%`, `TasksMax=200`.

**Kết quả:** `systemd-analyze security nginx-school.service` giảm từ **6.7 MEDIUM xuống 1.7 OK**.

#### d) Cấp 4 – AppArmor (kiểm soát truy cập bắt buộc, MAC)

1. Viết profile `/etc/apparmor.d/usr.sbin.nginx`: chỉ cho đọc `/etc/nginx-school/**`, `/var/www/school/**`; ghi `/var/log/nginx-school/**`, `/var/lib/nginx-school/**`, `/run/nginx-school/**`; mạng TCP; capability `net_bind_service`.
2. Chạy ở chế độ complain để học, rồi chuyển sang enforce.
3. **Thí nghiệm DAC và MAC:** tạo `/etc/school-probe.txt` quyền 644 (ai cũng đọc được) và `location = /probe { alias /etc/school-probe.txt; }`.
    - complain: HTTP **200**, lộ nội dung (DAC cho phép);
    - enforce: HTTP **403**, kernel ghi `apparmor="DENIED" operation="open" name="/etc/school-probe.txt"` (MAC chặn dù quyền file cho phép).
    Dọn dẹp sau thí nghiệm.

#### e) Cấp 5 – Tinh chỉnh hệ điều hành

- Giới hạn file mở xếp tầng: `worker_connections 4096` ≤ `worker_rlimit_nofile 8192` ≤ `LimitNOFILE=16384`.
- Hàng đợi kết nối: `/etc/sysctl.d/90-school.conf` đặt `net.core.somaxconn = 4096`, `net.ipv4.tcp_max_syn_backlog = 4096`; kiểm chứng `Send-Q` của socket LISTEN = min(backlog của Nginx, `somaxconn`) → nhân HĐH áp trần lên cấu hình ứng dụng.
- Bind mount `/var/www/school` với `ro,nosuid,nodev,noexec`: kể cả root cũng không ghi được; `school-deploy.sh` tự mở khoá rồi khoá lại khi phát hành bản mới.
- `reload` và `restart`: `reload` giữ nguyên PID master, không rớt yêu cầu nào; `restart` đổi PID và làm gián đoạn yêu cầu.

#### f) Cấp 6 – Tự chấm bằng script, Cấp 7 – Phòng lab lỗi

- `verify-sv2.sh` kiểm 31 hạng mục (cú pháp, socket, quyền, mã HTTP, sandbox, AppArmor): **31/31 PASS**, điểm bảo mật 1.7 OK.
- Các lab đã gây lỗi → chẩn đoán → sửa (tóm tắt, chi tiết ở mục 6.2):

| Lab | Gây lỗi | Triệu chứng quan sát thực tế |
|---|---|---|
| 1 | `chmod 700 /var/www/school` | Hướng dẫn dự đoán 403, thực tế ra **500** do vòng lặp `try_files` (mục 6.1) |
| 2 | Chép đè thủ công, sai quyền, không có sổ băm | 500/404; `verify` báo bản không có hash |
| 3 | Bật lại `nginx.service` gốc | Không khởi động được vì profile AppArmor chặn đọc `/etc/nginx/` |
| 4 | Tước capability | `bind() ... (13: Permission denied)` |
| 5 | Ghi log ra ngoài vùng sandbox | `(30: Read-only file system)` – phân biệt với `13` là thiếu quyền |

#### g) So sánh Nginx đã gia cố và Apache mặc định (cùng tiêu chí của SV2)

| Tiêu chí | Nginx (`nginx-school`, đã gia cố) | Apache 2.4.66 (mặc định gói) |
|---|---|---|
| Tiến trình master | `svc_nginx` (không root) | `root` |
| Tiến trình worker | `svc_nginx` | `www-data` |
| Capability của master | 1 (`cap_net_bind_service`) | 35 |
| AppArmor | enforce | unconfined |
| `systemd-analyze security` | 1.7 OK | 5.7 MEDIUM |
| Cấu hình | 1 tệp, khoảng 50 dòng thực | Rải ở nhiều thư mục/tệp |

Khi cài Apache, gói tự khởi động và tranh cổng 80 với Nginx; tôi chặn tự khởi động bằng `policy-rc.d` trong lúc cài.

**Cấu hình hoặc quyết định quan trọng:**
- Capability thay vì root: chiếm được Nginx cũng chỉ mở được cổng, không đọc file người khác, không nạp module nhân, không đổi quyền.
- Phòng thủ nhiều lớp: tài khoản không root → quyền tệp 750/640 → 1 capability → hệ thống tệp chỉ đọc → seccomp → cgroup → AppArmor → tường lửa.
- Dịch vụ riêng `nginx-school` thay vì sửa `nginx.service` của gói: muốn quay lại bản gốc chỉ cần đổi dịch vụ (lưu ý phải gỡ profile AppArmor trước, xem lỗi 6 mục 6.2).

**Kết quả và giới hạn:** Cấp 1–7 và phần so sánh Apache đều chạy thật, bằng chứng ở MC06, MC07. Bind mount chỉ đọc mất khi khởi động lại máy (chưa làm `.mount` unit vĩnh viễn).

### PHẦN B – VIỆC LÀM THÊM: TRIỂN KHAI TRÊN KUBERNETES (TÓM TẮT)

Sau khi xong phần SV2, tôi đưa cùng website lên cụm K3s 1 node (k3d) mà tôi đã dựng từ 11–13/11/2026 cho một dự án cá nhân. Phần này không thuộc yêu cầu của đề; chi tiết kiến trúc và kịch bản kiểm thử nằm trong `bao_cao_mo_rong_kubernetes.md`. Ở đây chỉ nêu việc đã làm và liên hệ với phần SV2.

**Việc đã làm (theo lịch sử Git):**
- **CV05 – Docker image:** Dockerfile hai tầng cho frontend và 3 dịch vụ; frontend dùng `nginx-unprivileged` (uid 101, cổng 8080), backend chạy `USER node` (commit `3f5fb95`).
- **CV06 – Kubernetes + GitOps:** PostgreSQL dạng StatefulSet + PVC; 4 Deployment + Service; Ingress định tuyến `/api/v1` và `/`; mật khẩu và khoá JWT mã hoá bằng Sealed Secrets; ArgoCD tự đồng bộ; Cloudflare Tunnel cho tên miền `lumina.synnie.dev` (repo hạ tầng: `8842b59`, `69f0883`, `944eaa1`, `c1987b8`).
- **CV07 – CI/CD:** `ci.yml` (build, lint, test, quét thư viện, Gitleaks) và `cd.yml` (build 4 image, Trivy, ký cosign, ghi tag `sha-<commit>` vào repo hạ tầng, smoke test); CD đã chạy thật 3 lần ngày 17/11 (commit tự động `72e179d`, `7263c2a`, `ad1b140`). Bộ `ci/*.sh` cho phép chạy y hệt CI trên máy cá nhân (`9016abe`).
- **CV08 – An toàn vận hành:** `securityContext` không root, hệ thống tệp chỉ đọc, bỏ mọi capability; NetworkPolicy chặn mặc định; 2 bản + PodDisruptionBudget; ResourceQuota + LimitRange; CronJob `pg_dump` hằng đêm; Loki + Alloy; 9 luật cảnh báo gửi Slack (`bdbb25f`, `b865e92`, `9b454aa`).

**Liên hệ với phần SV2:** mỗi biện pháp tôi làm trên máy Ubuntu có cách tương đương trên Kubernetes:

| Trên máy Ubuntu (phần SV2) | Trên Kubernetes |
|---|---|
| Virtual Host `server_name truong.test` | Ingress `host: lumina.synnie.dev` |
| Không root + `CAP_NET_BIND_SERVICE` | Nghe cổng 8080, `capabilities.drop: [ALL]` |
| Quyền 750/640, mount chỉ đọc | `readOnlyRootFilesystem: true` |
| Sandbox systemd (`NoNewPrivileges`, seccomp) | `allowPrivilegeEscalation: false`, `seccompProfile: RuntimeDefault` |
| cgroup `MemoryMax`, `TasksMax` | `resources.limits`, ResourceQuota |
| `ufw` lọc theo cổng | NetworkPolicy lọc theo từng cặp dịch vụ |
| `school-deploy.sh` (đổi bản nguyên tử, rollback) | Rolling update, ArgoCD quay về commit cũ |

**Giới hạn:** cụm 1 node; chưa đo hiệu năng và chưa chạy bộ kiểm thử đầy đủ trên cụm nên không đưa số liệu so sánh Kubernetes vào báo cáo này.

---

## 4. Danh mục minh chứng

Phần bắt buộc dùng mã MC01–MC07 (MC03–MC05 trùng mã trong hồ sơ nhóm). Số "Ảnh n" và mã B1–B9 tương ứng với Phụ lục B (lệnh và kết quả ghi nhận). Phần làm thêm (Kubernetes) dùng mã MK01–MK03. Đường dẫn `infra/...` là repo hạ tầng; đường dẫn còn lại là repo mã nguồn của nhóm.

| Mã | Nội dung chứng minh | Vị trí file hoặc mục trong phụ lục |
|---|---|---|
| MC01 | Mã nguồn website do tôi viết (CV00) | `frontend/`, `backend/academic-api/`, `backend/portal/`, `backend/finance-api/`; commit `789db84`, `2d1edd5`, `7ac7a72`, `3f5fb95`, `47baf19`, `83a14c3`, `b5fd616` (`git log --format='%h %ad %an %s'`) |
| MC02 | Máy chủ, phiên bản Nginx, tường lửa (CV01) | Ảnh 1, 2, 6: `lsb_release -ds` (Ubuntu 26.04.1), `uname -r`, `ip -4 addr`, `nginx -v` (1.28.3), `ufw status numbered` (80/tcp chỉ cho `192.168.102.0/24` và `tailscale0`) |
| MC03 | Virtual Host và phân quyền thư mục (CV01, CV02) | Ảnh 3, 4, 7, 8: `cat /etc/nginx/sites-available/school`; `grep '^user' nginx.conf` (`user svc_nginx;`); `sites-enabled` chỉ còn `school`; `namei -l` (`root:svc_nginx`, `drwxr-x---`); `svc_nginx` đọc được nhưng `touch` bị `Permission denied`, `nobody` bị từ chối; `nginx -t` ok |
| MC04 | Tiến trình, socket, dịch vụ (CV02, CV04) | Ảnh 9: `systemctl status nginx` (06/11/2026 10:59, 1 master + 12 worker, 12.2M RAM); ảnh 11: master PID 79591 là `root`, 12 worker là `svc_nginx`; ảnh 12: `ss -ltnp` cổng 80 LISTEN, Send-Q 511, do PID 79591 và các worker giữ; ảnh 13: `nginx -T` nạp `user svc_nginx;`; ảnh 14: RSS master 2,3 MB, mỗi worker 5,5–6,4 MB |
| MC05 | Phân giải tên miền, mã HTTP, log (KT1, C8) | Ảnh 5: `/etc/hosts` có `127.0.0.1 truong.test`, `ping` 0% loss; ảnh 15: `curl -I` ra 200 · 200 · 404 · 403 (06/11/2026 13:20:55 GMT); ảnh 16: 200 lần liên tiếp đều 200; ảnh 17: `ab`; ảnh 18: thống kê log `1252×200, 17×304, 1×403, 1×404` |
| MC06 | Gia cố hệ điều hành và kiểm thử tự động (CV04 a–f) | Phụ lục B, mục B1–B7 và B9 (toàn văn `nginx-school.service`, `10-sandbox.conf`, `usr.sbin.nginx`, `90-school.conf`); `school-deploy.sh`, `verify-sv2.sh`; ảnh `systemd-analyze security nginx-school.service` (6.7 → 1.7 OK), `/probe` 200 → 403 kèm `apparmor="DENIED"`, 557/557 mã 200 khi rollback, 31/31 PASS |
| MC07 | So sánh Nginx gia cố và Apache mặc định (CV04 g) | Phụ lục B, mục B8 |
| MK01 | Docker image và manifest Kubernetes (CV05, CV06) | `frontend/Dockerfile`, `backend/*/Dockerfile`; `infra/apps/portal/`, `infra/argocd/portal.yaml`; commit `8842b59`, `69f0883`, `944eaa1` |
| MK02 | Pipeline CI/CD và các lần chạy thật (CV07) | `.github/workflows/ci.yml`, `cd.yml`, `ci/*.sh`, `.gitleaks.toml`; commit `9016abe`, `72e179d`, `7263c2a`, `ad1b140` |
| MK03 | An toàn vận hành, sao lưu, cảnh báo (CV08) | `infra/apps/portal/network-policy.yaml`, `policies.yaml`, `postgres-backup.yaml`, `alerts.yaml`; commit `bdbb25f`, `b865e92`, `9b454aa` |

---

# Kiểm thử và xử lý vấn đề

## 5. Kết quả kiểm thử cá nhân

### 5.1. Kiểm thử phần bắt buộc

#### KT1 – Truy cập trang và tải tài liệu bằng tên miền

**Nhiệm vụ liên quan:** CV01, CV02. Phối hợp với SV1 (DNS); tôi phụ trách dịch vụ web và nội dung.

**Điều kiện ban đầu:** Nginx đang chạy, `/etc/hosts` có `127.0.0.1 truong.test`.

**Thao tác:** `getent hosts truong.test`; `ping -c 2 truong.test`; `curl -I http://truong.test/`; `curl -I http://truong.test/tai-lieu/thong-bao-mau.txt`; mở trang và tải tài liệu trên trình duyệt.

**Kết quả mong đợi:** phân giải đúng IP, HTTP 200, tệp tải về nguyên vẹn.

**Kết quả thực tế:** `truong.test` → `127.0.0.1`, ping 2/2 gói, 0% packet loss (ảnh 5); `HTTP/1.1 200 OK`, header `Server: nginx` (không lộ phiên bản nhờ `server_tokens off`); tải `thong-bao-mau.txt` thành công.


**Kết luận:** ☑ Đạt  **Minh chứng:** MC05

#### KT2 – Phân biệt lỗi DNS và lỗi dịch vụ

**Nhiệm vụ liên quan:** CV01. Tôi tự thực hiện cả hai tình huống trên máy chủ; phần phân tích DNS là của SV1.

**Thao tác:**
1. Sai DNS: sao lưu `/etc/hosts`, đổi `truong.test` sang IP không tồn tại `10.255.255.1`; chạy `getent hosts`, `ping -c 2`, `curl -m 5 -v http://truong.test/`; khôi phục `/etc/hosts.bak`.
2. Dừng dịch vụ: `sudo systemctl stop nginx`; chạy `getent hosts`, `ping -c 2`, `curl -v http://truong.test/`, `sudo ss -ltnp 'sport = :80'`, `systemctl status nginx`; khởi động lại.

**Kết quả mong đợi:**
- Sai DNS: tên miền ra **sai IP** `10.255.255.1`, `ping` mất 100% gói, `curl` **hết thời gian chờ** (trình duyệt `ERR_CONNECTION_TIMED_OUT`) vì gói tin đi tới một địa chỉ không ai trả lời.
- Dừng dịch vụ: tên miền vẫn ra `127.0.0.1`, `ping` vẫn thành công, nhưng `curl` báo **ngay** `Connection refused` (trình duyệt `ERR_CONNECTION_REFUSED`) vì máy vẫn sống nhưng không còn tiến trình nào nghe cổng 80; `ss` không còn dòng LISTEN, `systemctl` báo `inactive (dead)`.

**Kết quả thực tế:** sai DNS → trình duyệt báo `ERR_CONNECTION_TIMED_OUT`; khôi phục bằng `/etc/hosts.bak` thì vào lại được. Dừng dịch vụ → trình duyệt báo `ERR_CONNECTION_REFUSED`; `systemctl start nginx` thì vào lại được.

**Cách phân biệt:** lỗi DNS nằm ở bước tên → IP (ra IP sai nên chờ mãi không ai trả lời); lỗi dịch vụ thì tên → IP đúng, máy vẫn trả lời, chỉ cổng 80 đóng nên bị từ chối ngay.

**Kết luận:** ☑ Đạt  **Minh chứng:** Phụ lục B, mục A4–A5

#### KT3 – Sao lưu và khôi phục nội dung web

**Nhiệm vụ liên quan:** CV02 (phần sao lưu chính là của SV3; tôi chạy thử trên máy chủ của mình).

**Thao tác:** `rsync -a --delete /var/www/school/ /var/backups/school-demo/`; xoá `index.html`; `curl -I http://truong.test/`; `rsync` ngược từ bản sao về; `curl -I` lại.

**Kết quả mong đợi:** sau khi xoá thì lỗi; sau khi phục hồi thì 200.

**Kết quả thực tế:** xoá `index.html` gây lỗi 403/404; phục hồi bằng `rsync` thì trở lại `200 OK`. Ở phần nâng cao, cách phục hồi tốt hơn là `school-deploy.sh rollback` (đổi `current` về bản trước, kiểm tra bằng sổ băm).

**Kết luận:** ☑ Đạt  **Minh chứng:** Phụ lục B, mục A4–A5

#### Kiểm thử hiệu năng

**Thao tác:** `ab -n 1000 -c 20 http://truong.test/`

**Kết quả thực tế:** 35.522 req/s; thời gian đáp ứng trung bình mỗi yêu cầu 0,563 ms ("Time per request (mean)", vì 20 / 35.522 ≈ 0,000563 s; con số "across all concurrent requests" sẽ là khoảng 0,028 ms); tỉ lệ lỗi 0% (1000/1000 hoàn thành); 99% yêu cầu xong trong 2 ms. Trước đó 200 yêu cầu `curl` liên tiếp đều trả 200 (ảnh 16); log truy cập ghi 1252 lần 200, 17 lần 304, 1 lần 403, 1 lần 404 (ảnh 18). Đo ngay trên máy chủ qua `127.0.0.1`, không qua mạng, nên đây là giới hạn của bản thân Nginx chứ không phải tốc độ người dùng thật nhận được.

**Kết luận:** ☑ Đạt  **Minh chứng:** MC05 (ảnh 16–18)

#### Kiểm thử tự động `verify-sv2.sh`

**Kết quả thực tế:** 31/31 PASS (cú pháp Nginx, socket, quyền POSIX, mã 200/403/404, sandbox, AppArmor), điểm bảo mật 1.7 OK.  **Minh chứng:** MC06

#### Triển khai không gián đoạn và tự rollback (CV04 a)

**Thao tác:** chạy vòng `curl` liên tục vào `http://truong.test/`, đồng thời triển khai một bản có health-check trỏ vào `khong-co.pdf`.

**Kết quả mong đợi:** script phát hiện 404, tự rollback; mọi yêu cầu của vòng `curl` đều 200.

**Kết quả thực tế:** tự rollback về bản cũ; **557/557** yêu cầu trả 200.  **Kết luận:** ☑ Đạt  **Minh chứng:** MC06

#### Thí nghiệm DAC và MAC (CV04 d)

**Thao tác:** `curl` vào `/probe` (alias tới `/etc/school-probe.txt` quyền 644) ở chế độ complain rồi enforce; xem `journalctl -k | grep apparmor`.

**Kết quả thực tế:** complain → 200; enforce → 403 kèm `apparmor="DENIED" operation="open" name="/etc/school-probe.txt"`.  **Kết luận:** ☑ Đạt  **Minh chứng:** MC06

---

## 6. Vấn đề đã gặp và cách xử lý

### 6.1. Vấn đề chính: làm mất quyền thư mục nhưng web trả 500 chứ không phải 403 (Cấp 7, Lab 1)

**Hiện tượng:** chạy `sudo chmod 700 /var/www/school` để thử lỗi quyền. Hướng dẫn dự đoán web trả **403 Forbidden**, nhưng thực tế trả **500 Internal Server Error**.

**Nguyên nhân và căn cứ xác định:**
- *Đã kiểm chứng:* sau `chmod 700`, nhóm `svc_nginx` mất quyền `x` nên tiến trình web không đi vào được thư mục; mọi tệp bên trong đều không truy cập được.
- Cấu hình `location /` dùng `try_files $uri $uri/ /index.html`. Nginx không đọc được `$uri` nên coi như không có tệp, chuyển nội bộ sang `/index.html`; `/index.html` lại khớp `location /`, lại không đọc được, lại chuyển tiếp… Nginx phát hiện vòng lặp chuyển hướng nội bộ, dừng lại và trả 500.
- Như vậy mã 403 chỉ xuất hiện ở những `location` không có `try_files` dự phòng (ví dụ `/tai-lieu/` dùng `try_files $uri =404`).

**Cách xử lý và kết quả kiểm tra lại:** trả lại quyền `sudo chmod 750 /var/www/school` → trang chủ trả 200; chạy lại `verify-sv2.sh` → 31/31 PASS.

**Bài học rút ra:** cùng một lỗi quyền nhưng mã HTTP trả về phụ thuộc vào cấu hình; không suy nguyên nhân chỉ từ mã HTTP mà phải đọc `error.log` và kiểm tra quyền từng tầng thư mục bằng `namei -l`. Kết quả khác với dự đoán trong hướng dẫn cũng là lý do tôi ghi lại kết quả thực tế thay vì chép kết quả mong đợi.

### 6.2. Các lỗi khác đã xử lý ở phần nâng cao (6 lỗi trong tài liệu hướng dẫn gốc)

| # | Chỗ | Hiện tượng / lỗi gốc | Nguyên nhân | Cách xử lý |
|---|---|---|---|---|
| 1 | Cấp 1 – `school-deploy.sh` | Rollback quay về chính bản đang chạy | Script xếp bản theo mtime (`ls -dt`), mà `rsync` chép cả mtime của thư mục nguồn nên thứ tự sai | Xếp theo tên thư mục (= thời điểm deploy); rollback chọn bản ngay trước bản đang chạy |
| 2 | Cấp 1 – hàm `cur()` | Chưa có `current` mà hàm vẫn trả về một đường dẫn | Không kiểm tra `current` có phải symlink thật | Chỉ `readlink` khi `current` là symlink |
| 3 | Cấp 2, 3, 5 | systemd và sysctl đọc sai giá trị cấu hình | Ghi chú `# ...` đặt cùng dòng với chỉ thị; systemd/sysctl không hiểu ghi chú cuối dòng, coi là một phần giá trị | Tách mọi ghi chú ra dòng riêng |
| 4 | Cấp 2 – `sudo -u svc_nginx nginx -t` | Kiểm tra cú pháp báo `Permission denied` | `nginx -t` thử mở socket cổng 80, chạy ngoài systemd thì không có capability | Kiểm tra cú pháp qua `systemctl reload nginx-school` (dùng `ExecReload=nginx -t` trong unit, có đủ capability) |
| 5 | Bonus – Apache | Cài `apache2` xong tự khởi động, tranh cổng 80 | Gói Debian/Ubuntu tự bật dịch vụ khi cài | Chặn tự khởi động bằng `policy-rc.d` trong lúc cài |
| 6 | Cấp 4 – AppArmor | Bật lại Nginx gốc thì không khởi động được | Profile gắn với binary `/usr/sbin/nginx` nên áp lên cả bản gốc, mà profile không cho đọc `/etc/nginx/` | Gỡ profile trước khi khôi phục Nginx gốc |

---

# Đóng góp và tự đánh giá

## 7. Tiến độ và phối hợp

| Thời điểm | Công việc và sản phẩm đã tạo | Phối hợp hoặc bàn giao |
|---|---|---|
| 04/11/2026 18:48 – 23:23 | Frontend React (`789db84`); backend NestJS đăng nhập JWT, phân quyền, kiểm thử e2e (`2d1edd5`) | Tự viết; cung cấp mã nguồn cho cả nhóm |
| 05/11/2026 06:03 – 06:37 | README dự án, hướng dẫn triển khai cho nhóm (`27f0038`, `723dc3e`, `49bea24`, `71e9d5d`) | Tự làm; cả nhóm đọc để dựng lại |
| 05/11/2026 08:06 – 06/11/2026 10:59 | Cài Nginx 1.28.3, tài khoản `svc_nginx`, phân quyền `/var/www/school`, Virtual Host `truong.test`, gỡ site `default`, `ufw` (thời điểm theo ảnh `ls -l sites-enabled` và `systemctl status`) | Tự làm; báo tên miền, IP cho SV1 |
| 06/11/2026 10:59 – 13:20 | Ảnh 11–18: tiến trình, socket, mã HTTP 200/404/403, 200 yêu cầu liên tiếp, `ab`, log; KT2, KT3 | Tự làm; báo tên dịch vụ, PID, đường dẫn log cho SV4; đường dẫn cần sao lưu cho SV3 |
| 07/11/2026 – 10/11/2026 | Nâng cao Cấp 1–7: `school-deploy.sh`, `nginx-school.service`, sandbox, AppArmor, sysctl, mount chỉ đọc, `verify-sv2.sh` (31/31 PASS), 5 lab lỗi; so sánh Apache; sửa 6 lỗi của tài liệu hướng dẫn | Tự làm |
| 11/11 – 13/11/2026 | Dựng cụm K3s (k3d), ArgoCD, Sealed Secrets, Cloudflare Tunnel, Prometheus + Grafana (dự án cá nhân, dùng lại cho đề tài) | Tự làm |
| 17/11/2026 13:52 – 14:38 | Manifest `apps/portal/`, SealedSecret, ArgoCD app, tên miền `lumina.synnie.dev`, `ghcr-pull`, ArgoCD app `cloudflared` (`c1987b8`); tách backend thành `academic-api` + `finance-api` + `portal`, Dockerfile và workflow CD (`7ac7a72`, `3f5fb95`) | Tự làm |
| 17/11/2026 14:36 – 14:55 | Frontend gọi API thật (`47baf19`), trang đăng ký (`83a14c3`); CD chạy thật 3 lần: `sha-3f5fb95` → `sha-47baf19` → `sha-83a14c3` | Tự viết; CD chạy tự động (github-actions) |
| 17/11/2026 21:49 | `ci.yml` và bộ script CI chạy trên máy: `ci/*.sh`, Gitleaks (`9016abe`) | Tự làm |
| 17/11/2026 22:43 | NetworkPolicy, securityContext, 2 bản + PDB, Quota, backup, Loki + Alloy, cảnh báo (`bdbb25f`) | Tự làm |
| 18/11/2026 09:45 – 10:00 | Sửa luật cảnh báo cho Job backup; Alertmanager → Slack (`b865e92`, `9b454aa`); nút hiện/ẩn mật khẩu (`b5fd616`) | Tự làm |
| 25/11/2026 | Viết mục 7 báo cáo chung (phần làm thêm Kubernetes) | Bàn giao cho nhóm ghép vào báo cáo chung |

## 8. Hiểu hệ thống và tự đánh giá

**Phần việc của tôi liên kết với hệ thống chung như thế nào?**
- *Mã nguồn:* website tôi viết (bản build `frontend/dist`) chính là nội dung được chép vào `/var/www/school`; cả hai mô hình triển khai đều dùng cùng mã nguồn này.
- *Phần bắt buộc:* đầu vào là tên miền `truong.test` (thống nhất với SV1) và bản build website; đầu ra là dịch vụ web trên cổng 80 phục vụ nội dung `/var/www/school`. Log `/var/log/nginx/school.access.log` là đầu vào cho SV3 (log, sao lưu) và SV4 (đo tài nguyên, chẩn đoán lỗi); tên dịch vụ, PID và tài khoản `svc_nginx` là thông tin SV4 cần để đo CPU/RAM.
- *Phần làm thêm (Kubernetes):* đầu vào là mã nguồn frontend/backend và `docker-compose.yml`; đầu ra là website chạy thật tại `https://lumina.synnie.dev`, tự cập nhật khi nhóm push lên `main`. Mọi Pod phụ thuộc Secret `portal-secrets` và CoreDNS; đường vào phụ thuộc Cloudflare Tunnel và Traefik; CI đỏ thì CD không chạy.

**Kiến thức học phần đã vận dụng:**
- *Hệ điều hành:* tiến trình master/worker, user không đặc quyền (`svc_nginx` uid 997, uid 101/1000 trong container), Linux capabilities (`CAP_NET_BIND_SERVICE`), quyền POSIX rwx, systemd và sandboxing, AppArmor (MAC), seccomp, namespaces và cgroups (vượt limit RAM thì bị OOM-killer giết), hệ thống file chỉ đọc, tín hiệu tiến trình (`HUP`, `QUIT`), giới hạn file mở, hàng đợi `somaxconn`, mount `ro,noexec,nosuid,nodev`.
- *Mạng máy tính:* DNS (hosts/BIND, Cloudflare, CoreDNS), socket và trạng thái LISTEN, cổng đặc quyền dưới 1024, HTTP status code (200/304/403/404/500), TLS và chứng chỉ X.509, HSTS, reverse proxy và định tuyến theo host/đường dẫn, cân bằng tải, tường lửa (`ufw`, NetworkPolicy), NAT và tunnel, phân biệt lỗi theo tầng (sai IP → hết thời gian chờ, cổng đóng → `Connection refused`, lỗi ứng dụng → mã HTTP).

**Điểm còn hạn chế và hướng cải thiện:**
- Chứng chỉ tự ký ở phần bắt buộc chỉ dùng được nội bộ → dùng CA nội bộ hoặc Let's Encrypt khi có tên miền thật.
- Mount chỉ đọc `/var/www/school` mất khi khởi động lại máy → viết `.mount` unit của systemd để cố định.
- Gói các bước Cấp 1–3 thành một script `provision-sv2.sh` chạy nhiều lần không đổi kết quả, để dựng lại máy mới trong vài phút.
- Bản sao lưu nội dung web nằm cùng máy → chép thêm ra máy khác (quy tắc 3-2-1).
- Phần làm thêm Kubernetes mới chạy trên 1 node và chưa có bộ kiểm thử đầy đủ.

**Nội dung tôi có thể giải thích và thao tác khi bảo vệ:**
- Sửa cấu hình Nginx trước mặt giảng viên (đổi cổng, thêm tên miền, chặn IP), luôn `nginx -t` trước `reload`.
- Cố tình làm sai quyền tệp để ra 403, đọc `error.log` thấy `Permission denied`, sửa lại.
- Giải thích cơ chế Nginx non-root mở cổng 80: capability `CAP_NET_BIND_SERVICE` cho phép bind cổng dưới 1024 mà không cần toàn bộ quyền root. Trên Kubernetes thì tránh luôn bằng cách nghe cổng 8080 và bỏ mọi capability.
- Khác biệt 403 và 404: 403 là tệp tồn tại nhưng bị từ chối quyền đọc; 404 là URI không khớp tệp nào trong `root`. Vì sao `chmod 700` lại ra 500 chứ không phải 403 (vòng lặp `try_files`, mục 6.1).
- Thí nghiệm DAC/MAC: chuyển AppArmor complain ↔ enforce, `/probe` đổi 200 ↔ 403, chỉ dòng `apparmor="DENIED"` trong log nhân.
- `reload` và `restart`: chạy `ps -C nginx -o pid,ppid,euser:20,lstart` trước/sau để thấy PID master giữ nguyên khi `reload`.
- Sửa lén một file web rồi chạy `school-deploy.sh verify` để thấy bị phát hiện, `rollback` về bản sạch.
- Đọc điểm `systemd-analyze security nginx-school.service` và giải thích vài dòng sandbox; vì sao điểm thấp không có nghĩa là an toàn tuyệt đối.
- Phân biệt `(13: Permission denied)` (thiếu quyền) với `(30: Read-only file system)` (bị sandbox/mount chặn).
- Câu hỏi chuẩn bị của đề *"Ping thành công nhưng Website không mở được thì kiểm tra gì tiếp?"*: ping chỉ chứng minh tên → IP và máy còn sống. Kiểm tra tiếp theo thứ tự: dịch vụ còn chạy không (`systemctl status nginx-school`); có tiến trình nghe cổng 80 không (`ss -ltnp 'sport = :80'`); tường lửa có chặn không (`ufw status`); `curl -v` trả gì (refused, timeout hay mã HTTP); nếu có mã lỗi thì đọc `error.log` (quyền tệp, AppArmor `DENIED`, sandbox `Read-only file system`); cuối cùng kiểm tra `server_name` có khớp tên đang gõ không.
- (Phần làm thêm) Xem trạng thái cụm bằng `kubectl get pods -n portal`, xoá một Pod để thấy Pod tự tạo lại.
- Mã nguồn: luồng đăng nhập (frontend → `portal` → `academic-api` → PostgreSQL), access/refresh token, vì sao `portal` trả 503/504 khi dịch vụ con hỏng; chạy `bash ci/start-ci.sh` để thấy bảng PASS/FAIL.
- Vì sao `/tai-lieu/` dùng `try_files $uri =404` còn `/` dùng `try_files ... /index.html`: thử `curl -I` một tài liệu không tồn tại ra 404, một route React ra 200.

## 9. Nguồn tham khảo và công cụ hỗ trợ

**Tài liệu tham khảo:**
- Tài liệu chính thức: Nginx, Ubuntu Server, systemd (`systemd.exec`), AppArmor, OpenSSL; Kubernetes (kubernetes.io/docs), K3s (docs.k3s.io), ArgoCD, Bitnami Sealed Secrets, Cloudflare Tunnel, Grafana Loki/Alloy, kube-prometheus-stack.
- Tài liệu hướng dẫn thực hành của nhóm: `HUONG_DAN_SV2_UBUNTU.md` (phần cơ bản) và `HUONG_DAN_SV2_ADVANCE.md` (phần nâng cao Cấp 1–7); trong quá trình làm đã phát hiện và sửa 6 lỗi của tài liệu này (mục 6.2).

**Công cụ AI:**
- Có sử dụng Claude (Anthropic) để giải thích khái niệm, rà soát cấu hình và hỗ trợ trình bày báo cáo.
- Phần tự làm: cài đặt, cấu hình và chạy kiểm thử trên máy Ubuntu của mình; tự xử lý các lỗi phát sinh khi chạy (mục 6); viết mã nguồn website và các script CI.
- Cách kiểm chứng: mọi cấu hình đều được áp dụng trên máy Ubuntu/cụm thật và kiểm tra bằng `verify-sv2.sh` và các ca kiểm thử ở mục 5; số liệu lấy từ kết quả chạy thật và lịch sử Git, không lấy từ AI.

## 10. Cam kết cá nhân

Tôi xác nhận nội dung báo cáo phản ánh đúng công việc mình thực hiện và sự hỗ trợ đã nhận. Tôi chịu trách nhiệm về số liệu, minh chứng và có thể giải thích phần việc đã kê khai.

Ngày 26 tháng 11 năm 2026

Sinh viên ghi họ tên: Tống Quang Việt

---

## Phụ lục A – Danh mục tệp bàn giao

**Mã nguồn website (repo nhóm):**
- `frontend/` – React, 11 trang; `backend/academic-api/`, `backend/portal/`, `backend/finance-api/` – NestJS
- `backend/academic-api/test/auth.e2e.test.ts`, `backend/portal/test/portal.e2e.test.ts` – kiểm thử e2e
- `ci/start-ci.sh`, `ci/build-test.sh`, `ci/scan-deps.sh`, `ci/scan-image.sh`, `ci/scan-secrets.sh`, `.gitleaks.toml`
- `README.md` – mô tả dự án, cách chạy và triển khai

**Phần bắt buộc (nộp cho SV1 tổng hợp):**
- `/etc/nginx/sites-available/school` – Virtual Host `truong.test`
- `/etc/nginx/nginx.conf` – dòng `user svc_nginx;`
- Xuất cấu hình tường lửa: `sudo ufw status numbered > ufw.txt`
- `/etc/nginx-school/nginx.conf` – cấu hình Nginx chạy không root
- `/etc/systemd/system/nginx-school.service` – dịch vụ riêng, `User=svc_nginx`, 1 capability `CAP_NET_BIND_SERVICE`
- `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf` – sandbox systemd + cgroup
- `/etc/apparmor.d/usr.sbin.nginx` – profile AppArmor
- `/etc/sysctl.d/90-school.conf` – `somaxconn`, `tcp_max_syn_backlog`
- `/etc/sudoers.d/school-deploy` – `deploy` chỉ được chạy đúng `school-deploy.sh`
- `/usr/local/sbin/school-deploy.sh` – triển khai nguyên tử, sổ băm, `verify`, tự rollback
- `verify-sv2.sh` – kiểm thử tự động (31/31 PASS)
- Ảnh chụp và log terminal có dấu thời gian và hostname máy chủ

**Phần làm thêm Kubernetes (thư mục `MoRong_Kubernetes/`):**
- `frontend/Dockerfile`, `frontend/nginx.conf`, `backend/*/Dockerfile`
- `infra/apps/portal/` (toàn bộ manifest), `infra/argocd/portal.yaml`
- `.github/workflows/ci.yml`, `.github/workflows/cd.yml`

---

## Phụ lục B – Lệnh thực hiện và kết quả ghi nhận

Máy thực hành `viet@viet-BATTLE-AX-B760M-T-WIFI`, Ubuntu 26.04.1 LTS, Nginx 1.28.3. Mỗi mục gồm lệnh đã chạy và kết quả ghi nhận; số "Ảnh n" là số thứ tự ảnh chụp màn hình nộp kèm.

### C.A. Phần cơ bản (theo `HUONG_DAN_SV2_UBUNTU.md`)

#### A1 – C1–C6: cài đặt và cấu hình

##### Ảnh 1 – Thông tin máy
```bash
lsb_release -ds
uname -r
ip -4 addr show | grep inet
```
**Kết quả:**
```
Ubuntu 26.04.1 LTS
7.0.0-42-generic
    inet 127.0.0.1/8 scope host lo
    inet 192.168.102.114/24 brd 192.168.102.255 scope global dynamic noprefixroute enp5s0
    inet 100.83.219.103/32 scope global tailscale0
```
✅ Ubuntu 26.04.1 LTS · kernel 7.0.0-42 · IP LAN `192.168.102.114/24` · Tailscale `100.83.219.103`

##### Ảnh 2 – Nginx đã cài và chạy
```bash
nginx -v
systemctl status nginx | cat
```
**Kết quả:**
```
nginx version: nginx/1.28.3 (Ubuntu)
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Thu 2026-11-05 08:11:23 +07; 1 day 2h ago
 Invocation: 1836d047b6684462b3a587f4adaf9a96
       Docs: man:nginx(8)
   Main PID: 46587 (nginx)
      Tasks: 13 (limit: 37634)
     Memory: 11M (peak: 12.8M)
        CPU: 90ms
     CGroup: /system.slice/nginx.service
             ├─46587 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─46588 "nginx: worker process"
             ├─46589 "nginx: worker process"
             ├─46590 "nginx: worker process"
             ├─46591 "nginx: worker process"
             ├─46592 "nginx: worker process"
             ├─46593 "nginx: worker process"
             ├─46594 "nginx: worker process"
             ├─46596 "nginx: worker process"
             ├─46597 "nginx: worker process"
             ├─46598 "nginx: worker process"
             ├─46599 "nginx: worker process"
             └─46600 "nginx: worker process"

Nov 05 08:11:23 viet-BATTLE-AX-B760M-T-WIFI systemd[1]: Starting nginx.service - A high performance web server and a reverse proxy server...
Nov 05 08:11:23 viet-BATTLE-AX-B760M-T-WIFI systemd[1]: Started nginx.service - A high performance web server and a reverse proxy server.
```
✅ `Active: active (running)` · `enabled` (tự khởi động cùng máy) · 1 master + 12 worker

##### Ảnh 3 – Thư mục nội dung và phân quyền
```bash
ls -l /var/www/school
namei -l /var/www/school/index.html
id svc_nginx
```
**Kết quả:**
```
ls: cannot open directory '/var/www/school': Permission denied
f: /var/www/school/index.html
drwxr-xr-x root root      /
drwxr-xr-x root root      var
drwxr-xr-x root root      www
drwxr-x--- root svc_nginx school
                           index.html - Permission denied
uid=997(svc_nginx) gid=973(svc_nginx) groups=973(svc_nginx)
```
✅ Thư mục `school` là `drwxr-x--- root:svc_nginx` → user thường (`viet`) không xem được nội dung – đúng thiết kế

##### Ảnh 4 – Đặc quyền tối thiểu
```bash
sudo -u svc_nginx cat /var/www/school/index.html | head -3
sudo -u svc_nginx touch /var/www/school/hack.txt
sudo -u nobody cat /var/www/school/index.html
```
**Kết quả:**
```
<!doctype html>
<html lang="vi">
  <head>
touch: cannot touch '/var/www/school/hack.txt': Permission denied
cat: /var/www/school/index.html: Permission denied
```
✅ Lệnh 1 đọc được · Lệnh 2 và 3 báo `Permission denied`

##### Ảnh 5 – Tên miền nội bộ
```bash
cat /etc/hosts
getent hosts truong.test
ping -c 2 truong.test
```
**Kết quả:**
```
127.0.0.1 localhost
127.0.1.1 viet-BATTLE-AX-B760M-T-WIFI

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
127.0.0.1    truong.test
127.0.0.1       truong.test
PING truong.test (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost (127.0.0.1): icmp_seq=1 ttl=64 time=0.019 ms
64 bytes from localhost (127.0.0.1): icmp_seq=2 ttl=64 time=0.079 ms

--- truong.test ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1039ms
rtt min/avg/max/mdev = 0.019/0.049/0.079/0.030 ms
```
✅ `127.0.0.1   truong.test` · ping 0% packet loss

##### Ảnh 6 – Tường lửa
```bash
sudo ufw status numbered
```
**Kết quả:**
```
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] OpenSSH                    ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    192.168.102.0/24
[ 3] 80/tcp on tailscale0       ALLOW IN    Anywhere
[ 4] OpenSSH (v6)               ALLOW IN    Anywhere (v6)
[ 5] 80/tcp (v6) on tailscale0  ALLOW IN    Anywhere (v6)
```
✅ Có OpenSSH; cổng 80 chỉ mở cho dải LAN `192.168.102.0/24` và giao diện `tailscale0`

##### Ảnh 7 – Cấu hình Nginx
```bash
cat /etc/nginx/sites-available/school
grep -n '^user' /etc/nginx/nginx.conf
ls -l /etc/nginx/sites-enabled/
```
**Kết quả:**
```nginx
# ===== Website trường học (Đề tài 05) =====
server {
    listen      80;                          # cổng dịch vụ
    server_name truong.test;                 # tên miền nội bộ

    root  /var/www/school;                   # THƯ MỤC NỘI DUNG
    index index.html;

    access_log /var/log/nginx/school.access.log school;   # log truy cập
    error_log  /var/log/nginx/school.error.log  warn;     # log lỗi

    server_tokens off;                       # ẩn số phiên bản Nginx (bảo mật cơ bản)

    gzip on;                                 # nén bớt dữ liệu cho nhẹ
    gzip_types text/css application/javascript application/json image/svg+xml;

    # Ứng dụng React: đường dẫn không phải file thật → trả index.html để React tự xử lý (/grades, /schedule...)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # File giao diện: cho trình duyệt nhớ 7 ngày
    location /assets/ {
        expires 7d;
    }

    # Tài liệu tải về: không có file thì trả 404 thật (để quan sát mã HTTP)
    location /tai-lieu/ {
        try_files $uri =404;
    }

    # Chặn file ẩn (.git, .env...)
    location ~ /\. {
        deny all;
    }
}
```
```
1:user svc_nginx;
total 0
lrwxrwxrwx 1 root root 33 Nov  5 08:06 school -> /etc/nginx/sites-available/school
```
✅ `user svc_nginx;` · trong `sites-enabled` chỉ có `school`, không còn `default`

##### Ảnh 8 – Kiểm tra cú pháp
```bash
sudo nginx -t
```
**Kết quả:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```
✅ `syntax is ok` và `test is successful`

##### Ảnh 9 – Trạng thái dịch vụ sau khi restart
```bash
sudo systemctl restart nginx
systemctl status nginx | cat
```
**Kết quả:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Fri 2026-11-06 10:59:22 +07; 12ms ago
 Invocation: 763a6b5272a2429c96f57d521a5708a9
       Docs: man:nginx(8)
    Process: 79586 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
    Process: 79589 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)
   Main PID: 79591 (nginx)
      Tasks: 13 (limit: 37634)
     Memory: 12.2M (peak: 12.2M)
        CPU: 74ms
```
✅ Khởi động lại thành công, PID master mới `79591`, 12.2 MB RAM

---

#### A2 – C7: bằng chứng "ít quyền" (quan trọng nhất)

##### Ảnh 11 – Master = root, worker = svc_nginx
```bash
ps -eo pid,ppid,euser:20,comm | grep '[n]ginx'
```
**Kết quả:**
```
  79591       1 root                 nginx
  79592   79591 svc_nginx            nginx
  79593   79591 svc_nginx            nginx
  79594   79591 svc_nginx            nginx
  79595   79591 svc_nginx            nginx
  79596   79591 svc_nginx            nginx
  79597   79591 svc_nginx            nginx
  79598   79591 svc_nginx            nginx
  79600   79591 svc_nginx            nginx
  79601   79591 svc_nginx            nginx
  79602   79591 svc_nginx            nginx
  79603   79591 svc_nginx            nginx
  79604   79591 svc_nginx            nginx
```
✅ Một dòng `root` (master), các dòng còn lại `svc_nginx` (worker, PPID = master)

##### Ảnh 12 – PID nào giữ cổng 80
```bash
sudo ss -ltnp 'sport = :80'
```
**Kết quả:**
```
State  Recv-Q Send-Q Local Address:Port Peer Address:Port Process
LISTEN 0      511    0.0.0.0:80         0.0.0.0:*         users:(("nginx",pid=79604,fd=7),("nginx",pid=79603,fd=7),("nginx",pid=79602,fd=7),("nginx",pid=79601,fd=7),("nginx",pid=79600,fd=7),("nginx",pid=79598,fd=7),("nginx",pid=79597,fd=7),("nginx",pid=79596,fd=7),("nginx",pid=79595,fd=7),("nginx",pid=79594,fd=7),("nginx",pid=79593,fd=7),("nginx",pid=79592,fd=7),("nginx",pid=79591,fd=7))
```
✅ Cổng 80 ở trạng thái `LISTEN`, backlog (Send-Q) 511, do master `79591` và 12 worker cùng giữ socket

##### Ảnh 13 – Cấu hình đang nạp đúng user
```bash
sudo nginx -T 2>/dev/null | grep -E '^\s*user '
```
**Kết quả:**
```
user svc_nginx;
```
✅

##### Ảnh 14 – CPU/RAM các tiến trình nginx
```bash
ps -C nginx -o pid,user,%cpu,%mem,rss,cmd
```
**Kết quả:**
```
    PID USER     %CPU %MEM   RSS CMD
  79591 root      0.0  0.0  2352 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;
  79592 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79593 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79594 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79595 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79596 svc_ngi+  0.0  0.0  6352 nginx: worker process
  79597 svc_ngi+  0.0  0.0  5540 nginx: worker process
  79598 svc_ngi+  0.0  0.0  5476 nginx: worker process
  79600 svc_ngi+  0.0  0.0  5508 nginx: worker process
  79601 svc_ngi+  0.0  0.0  5764 nginx: worker process
  79602 svc_ngi+  0.0  0.0  5476 nginx: worker process
  79603 svc_ngi+  0.0  0.0  5540 nginx: worker process
  79604 svc_ngi+  0.0  0.0  5508 nginx: worker process
```
✅ Khi không tải: CPU 0%, master ~2,3 MB, mỗi worker 5,5–6,4 MB RSS (cột `svc_ngi+` là `svc_nginx` bị cắt tên)

---

#### A3 – C8: mã HTTP và đo tải

##### Ảnh 15 – Mã trả về
```bash
curl -I http://truong.test/
curl -I http://truong.test/tai-lieu/thong-bao-mau.txt
curl -I http://truong.test/tai-lieu/khong-co.pdf
curl -I http://truong.test/.git/config
```
**Kết quả:**
```
HTTP/1.1 200 OK
Server: nginx
Date: Fri, 06 Nov 2026 13:20:55 GMT
Content-Type: text/html
Content-Length: 1824

HTTP/1.1 200 OK
Server: nginx
Date: Fri, 06 Nov 2026 13:20:55 GMT
Content-Type: text/plain
Content-Length: 269

HTTP/1.1 404 Not Found
Server: nginx
Content-Type: text/html
Content-Length: 146

HTTP/1.1 403 Forbidden
Server: nginx
Content-Type: text/html
Content-Length: 146
```
✅ 200 · 200 · 404 · 403 · header `Server: nginx` không lộ phiên bản (`server_tokens off`)

##### Ảnh 16 – 200 yêu cầu liên tiếp
```bash
for i in $(seq 1 200); do curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/; done | sort | uniq -c
```
**Kết quả:**
```
    200 200
```
✅ 200 lần đều trả mã 200 (100% thành công)

##### Ảnh 17 – Benchmark (mở thêm 1 terminal chạy `top -u svc_nginx` rồi chụp cả hai)
```bash
ab -n 1000 -c 20 http://truong.test/
```
```bash
top -u svc_nginx
```
**Kết quả tóm tắt:**
```
Complete requests:      1000
Failed requests:        0
Requests per second:    35522.72 [#/sec] (mean)
Time per request:       0.563 [ms] (mean)
99% requests served within 2 ms
```
✅ 0 lỗi · 35.522 req/s · 0,563 ms là *Time per request (mean)* (= 20 / 35.522 s) · đo qua `127.0.0.1` nên không tính độ trễ mạng

##### Ảnh 18 – Log truy cập
```bash
sudo tail -n 20 /var/log/nginx/school.access.log
sudo awk -F'"' '{split($3,a," "); print a[1]}' /var/log/nginx/school.access.log | sort | uniq -c
```
**Kết quả (thống kê mã trả về):**
```
   1252 200
     17 304
      1 403
      1 404
```
✅ Log ghi đủ các mã đã thử: 200 (bình thường), 304 (trình duyệt dùng bản lưu đệm), 403 (`/.git/config`), 404 (`khong-co.pdf`)

---

#### A4 – KT2: hai lỗi "không vào được web"

##### Lỗi 1 – DNS sai
```bash
sudo cp /etc/hosts /etc/hosts.bak
sudo sed -i 's/^127.0.0.1\s\+truong.test/10.255.255.1 truong.test/' /etc/hosts
getent hosts truong.test
ping -c 2 truong.test
curl -m 5 -v http://truong.test/
```
Khôi phục:
```bash
sudo cp /etc/hosts.bak /etc/hosts
getent hosts truong.test
```
**Kết quả ghi nhận:** `/etc/hosts` trỏ nhầm sang `10.255.255.1` → trình duyệt báo **`ERR_CONNECTION_TIMED_OUT`** (gửi gói tin tới IP không ai trả lời nên chờ mãi). Khôi phục bằng `/etc/hosts.bak` thì truy cập lại được.

##### Lỗi 2 – Dừng dịch vụ
```bash
sudo systemctl stop nginx
getent hosts truong.test
ping -c 2 truong.test
curl -v http://truong.test/
sudo ss -ltnp 'sport = :80'
systemctl status nginx | cat
```
Khôi phục:
```bash
sudo systemctl start nginx
systemctl status nginx | cat
```
**Kết quả ghi nhận:** `systemctl stop nginx` → trình duyệt báo **`ERR_CONNECTION_REFUSED`** (tên miền vẫn đúng IP, máy vẫn trả lời nhưng không còn tiến trình nghe cổng 80). `systemctl start nginx` thì truy cập lại được.

✅ Hai lỗi có bằng chứng khác nhau: **timeout** (sai DNS) ↔ **refused** (dịch vụ dừng)

---

#### A5 – KT3: sao lưu và khôi phục

```bash
sudo rsync -a --delete /var/www/school/ /var/backups/school-demo/
sudo ls -l /var/backups/school-demo/ | head

sudo rm /var/www/school/index.html
curl -I http://truong.test/            # chụp: lỗi 403/404

sudo rsync -a --delete /var/backups/school-demo/ /var/www/school/
curl -I http://truong.test/            # chụp: 200 OK trở lại
```
**Kết quả ghi nhận:** sao lưu bằng `rsync -a --delete` vào `/var/backups/school-demo/`. Xoá thử `index.html` → lỗi 403/404; `rsync` ngược từ bản sao → trở lại `200 OK`.

✅ Khôi phục thành công

---

### C.B. Phần nâng cao (theo `HUONG_DAN_SV2_ADVANCE.md`)

> Theo `HUONG_DAN_SV2_ADVANCE.md`. Dịch vụ mới: `nginx-school.service`, cấu hình `/etc/nginx-school/nginx.conf`. Mỗi mục gồm lệnh kiểm chứng và kết quả ghi nhận. Đã làm Cấp 1–7 và Bonus so sánh Apache.

#### B1 – Lỗi trong tài liệu gốc đã phát hiện và khắc phục

| # | Chỗ | Lỗi gốc | Cách khắc phục |
|---|---|---|---|
| 1 | Cấp 1 – `school-deploy.sh` | Xếp bản theo mtime (`ls -dt`); do `rsync` chép mtime thư mục nguồn nên rollback quay về chính bản đang chạy | Xếp theo tên thư mục (= thời điểm deploy); rollback chọn bản ngay trước bản đang chạy |
| 2 | Cấp 1 – hàm `cur()` | Chưa có `current` vẫn trả về đường dẫn | Chỉ `readlink` khi `current` là symlink thật |
| 3 | Cấp 2, 3, 5 | Ghi chú `# ...` cùng dòng cấu hình khiến systemd & sysctl đọc sai giá trị | Tách ghi chú ra dòng riêng |
| 4 | Cấp 2 – `sudo -u svc_nginx nginx -t` | `nginx -t` thử mở socket cổng 80 → không có capability nên `Permission denied` | Kiểm tra cú pháp bằng `systemctl reload nginx-school` |
| 5 | Bonus – Apache | `apt install apache2` tự khởi động, tranh cổng 80 | Chặn auto-start bằng `policy-rc.d` trong quá trình cài |
| 6 | Cấp 4 – AppArmor | Profile gắn với binary `/usr/sbin/nginx` chặn cả instance Nginx gốc đọc `/etc/nginx/` | Gỡ profile trước khi khôi phục Nginx gốc |

---

#### B2 – Cấp 1: Triển khai chuyên nghiệp (Zero-Downtime & Tamper Detection)

**Lệnh kiểm chứng:**
```bash
sudo -l -U deploy                                            # chỉ liệt kê ĐÚNG 1 lệnh được phép
sudo -u deploy sudo -n systemctl stop nginx-school           # ❌ bị từ chối
readlink -f /var/www/school/current                          # đang chạy bản nào
sudo school-deploy.sh verify                                 # ✅ nguyên vẹn

# Sửa lén 1 file → verify phải phát hiện
sudo sh -c 'echo "<!-- hacked -->" >> /var/www/school/current/index.html'
sudo school-deploy.sh verify                                 # ❌ CÓ FILE BỊ SỬA
sudo school-deploy.sh rollback && sudo school-deploy.sh verify   # quay về bản sạch → ✅

# Terminal 2: tải liên tục, KHÔNG được có mã nào khác 200
while true; do curl -s -o /dev/null -w '%{http_code} ' http://truong.test/; sleep 0.05; done
# Terminal 1: health-check tự rollback
sudo SCHOOL_URL=http://truong.test/tai-lieu/khong-co.pdf school-deploy.sh deploy /home/deploy/dist
```

**Kết quả ghi nhận:**
- **Phân tách đặc quyền:** tài khoản `deploy` chỉ có đúng một quyền chạy script qua sudoers (`/etc/sudoers.d/school-deploy` với `NOPASSWD: /usr/local/sbin/school-deploy.sh`). Thử chạy lệnh hệ thống khác bị từ chối ngay lập tức.
- **Tự động rollback khi health-check thất bại:** trong lúc tải liên tục bằng vòng lặp `curl` (**557 lượt**), triển khai bản lỗi (`khong-co.pdf`) → hệ thống phát hiện mã 404 và tự rollback về bản cũ, **557/557 yêu cầu đều trả 200**, không gián đoạn.
- **Phát hiện sửa lén (integrity check):** đối chiếu checksum SHA-256 với `manifests/*.sha256`. Chèn thử `<!-- hacked -->` vào `index.html` → `verify` phát hiện sai lệch và rollback về phiên bản nguyên vẹn trước đó.

---

#### B3 – Cấp 2: Nginx chạy 100% không root

**Lệnh kiểm chứng:**
```bash
ps -C nginx -o pid,ppid,euser:20,cmd                         # TẤT CẢ là svc_nginx, kể cả master
sudo ss -ltnp 'sport = :80'
PID=$(systemctl show -p MainPID --value nginx-school)
grep -E '^Cap(Prm|Eff|Amb|Bnd)' /proc/$PID/status
capsh --decode=0000000000000400                              # → cap_net_bind_service
grep NoNewPrivs /proc/$PID/status                            # NoNewPrivs: 1

# Đối chứng: không có capability thì không mở được cổng 80
sudo systemctl stop nginx-school
sudo setpriv --reuid=svc_nginx --regid=svc_nginx --clear-groups \
     /usr/sbin/nginx -g 'daemon off;' -c /etc/nginx-school/nginx.conf 2>&1 | grep -i bind
sudo systemctl start nginx-school

sudo su - svc_nginx                                          # → "This account is currently not available."
```

**Kết quả ghi nhận:**
- Toàn bộ Nginx chạy dưới user dịch vụ `svc_nginx` thông qua unit `nginx-school.service`.
- Cấp quyền mở cổng đặc quyền 80 bằng Linux capability: `AmbientCapabilities=CAP_NET_BIND_SERVICE`, `CapabilityBoundingSet=CAP_NET_BIND_SERVICE`, `NoNewPrivileges=yes`.
- Cả **master lẫn worker** đều thuộc `svc_nginx`. Tước capability thì Nginx khởi động báo ngay `bind() to 0.0.0.0:80 failed (13: Permission denied)`.

---

#### B4 – Cấp 3: Sandbox systemd & giới hạn cgroup

**Lệnh kiểm chứng:**
```bash
systemd-analyze security nginx-school.service | tail -n 1    # chụp TRƯỚC và SAU khi thêm 10-sandbox.conf
PID=$(systemctl show -p MainPID --value nginx-school)
grep -E 'NoNewPrivs|Seccomp' /proc/$PID/status               # Seccomp: 2 = đang lọc syscall
systemctl show nginx-school -p MemoryMax -p CPUQuotaPerSecUSec -p TasksMax
cat /sys/fs/cgroup/system.slice/nginx-school.service/memory.max
sudo nsenter -t $PID -m ls /home                             # dịch vụ không thấy /home
sudo systemd-run --wait --pipe -p User=svc_nginx -p ProtectSystem=strict touch /usr/local/probe 2>&1 | tail -n 1
```

**Kết quả ghi nhận:**
- Drop-in `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf` (toàn văn ở B9.2).
- Hệ thống tệp: `ProtectSystem=strict` (toàn bộ filesystem chỉ đọc, trừ thư mục runtime/log), `ProtectHome=yes` (ẩn toàn bộ `/home`), `PrivateTmp=yes`.
- Seccomp & bảo mật: `SystemCallFilter=@system-service`, `MemoryDenyWriteExecute=yes`.
- Điểm phơi nhiễm `systemd-analyze security nginx-school.service`: **6.7 MEDIUM → 1.7 OK**.
- cgroup: `MemoryMax=300M`, `CPUQuota=80%`, `TasksMax=200`.

---

#### B5 – Cấp 4: AppArmor MAC (Mandatory Access Control)

**Lệnh kiểm chứng:**
```bash
sudo aa-status | grep -A2 nginx                              # profile ở enforce mode

# Thí nghiệm DAC vs MAC
echo "bí-mật-giả-lập" | sudo tee /etc/school-probe.txt && sudo chmod 644 /etc/school-probe.txt
# (thêm  location = /probe { alias /etc/school-probe.txt; }  vào /etc/nginx-school/nginx.conf, reload)
sudo aa-complain /usr/sbin/nginx && sudo systemctl restart nginx-school
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/probe       # 200
sudo aa-enforce /usr/sbin/nginx && sudo systemctl restart nginx-school
curl -s -o /dev/null -w "%{http_code}\n" http://truong.test/probe       # 403
sudo journalctl -k | grep -i 'apparmor="DENIED"' | tail -n 2
# Dọn dẹp: xoá dòng location = /probe, sudo rm /etc/school-probe.txt, reload
```

**Kết quả ghi nhận:**
- Profile `/etc/apparmor.d/usr.sbin.nginx` (toàn văn ở B9.3) giới hạn chặt tài nguyên Nginx được phép truy cập.
- Thí nghiệm DAC vs MAC: tạo `/etc/school-probe.txt` quyền 644 (DAC cho phép đọc) và `location = /probe { alias /etc/school-probe.txt; }`.

| Chế độ | `curl .../probe` | Giải thích |
|---|---|---|
| complain | **200** (lộ nội dung) | DAC cho phép, AppArmor chỉ ghi nhận |
| enforce | **403** | MAC chặn; kernel ghi `apparmor="DENIED" operation="open" name="/etc/school-probe.txt"` |

---

#### B6 – Cấp 5: Tinh chỉnh kernel & file mount

**Lệnh kiểm chứng:**
```bash
for p in $(pgrep -f 'nginx: worker'); do grep 'Max open files' /proc/$p/limits; done
PID=$(systemctl show -p MainPID --value nginx-school); grep 'Max open files' /proc/$PID/limits
sudo sysctl --system | grep -E 'somaxconn|tcp_max_syn'
ss -ltn 'sport = :80'                                        # cột Send-Q = backlog đang áp dụng
findmnt /var/www/school                                      # OPTIONS: ro,nosuid,nodev,noexec
sudo touch /var/www/school/test                              # ❌ Read-only file system – kể cả root
curl -I http://truong.test/                                  # vẫn 200

# Reload vs restart
ps -C nginx -o pid,ppid,euser:20,lstart,cmd
while true; do curl -s -o /dev/null -w '%{http_code} ' http://truong.test/; sleep 0.05; done &
sudo systemctl reload nginx-school
ps -C nginx -o pid,ppid,euser:20,lstart,cmd                  # PID master GIỮ NGUYÊN, worker mới
kill %1
```

**Kết quả ghi nhận:**
- **Giới hạn file descriptor** xếp tầng: `worker_connections` (4096) ≤ `worker_rlimit_nofile` (8192) ≤ `LimitNOFILE` (16384).
- **Kernel backlog:** nâng `somaxconn` lên 4096 và `tcp_max_syn_backlog` lên 4096 qua `/etc/sysctl.d/90-school.conf`. Chứng minh hàng đợi thực tế bị kernel áp trần: `Send-Q = min(backlog của Nginx, somaxconn)`.
- **Read-only bind mount:** `/var/www/school` mount với `ro,nosuid,nodev,noexec`; kể cả root cũng không ghi/sửa trực tiếp được. `school-deploy.sh` tự mở khoá/khoá lại khi phát hành bản mới.
- **Reload vs restart:** `systemctl reload` giữ nguyên PID master và không rớt request nào; `restart` đổi PID và làm gián đoạn request.

---

#### B7 – Cấp 6 & 7: Kiểm thử tự động & phòng lab lỗi

**Lệnh kiểm chứng:**
```bash
sudo bash verify-sv2.sh
```

**Kết quả ghi nhận:** `verify-sv2.sh` đạt **31/31 PASS**, điểm bảo mật **1.7 OK**.

**Các lab lỗi đã làm (gây lỗi → triệu chứng → chẩn đoán → sửa):**

| # | Gây lỗi | Triệu chứng thực tế | Ghi chú |
|---|---|---|---|
| 1 | Mất quyền thực thi thư mục (`chmod 700 /var/www/school`) | **500** thay vì 403 như hướng dẫn dự đoán | `try_files` chuyển nội bộ sang `/index.html`, cũng không đọc được → vòng lặp chuyển hướng nội bộ → 500. Sửa: `chmod 750` |
| 2 | Chép đè thủ công (sai quyền, thiếu hash) | 500/404 | `verify` phát hiện bản không có hash. Sửa: dùng `school-deploy.sh` |
| 3 | Xung đột instance (bật lại `nginx` gốc) | Nginx gốc không khởi động | AppArmor chặn đọc cấu hình `/etc/nginx/` |
| 4 | Mất capability mở cổng | `bind() ... (13: Permission denied)` | Trả lại `AmbientCapabilities` |
| 5 | Ghi log ra ngoài vùng sandbox | `(30: Read-only file system)` | Khác `13` (thiếu quyền): `30` là bị sandbox/mount chặn. Sửa: đưa log về `LogsDirectory` |

---

#### B8 – So sánh Nginx đã hardening và Apache mặc định

**Lệnh kiểm chứng:**
```bash
systemd-analyze security apache2.service | tail -n 1
systemd-analyze security nginx-school.service | tail -n 1
ps -C apache2 -o pid,ppid,euser:20,cmd
ps -C nginx -o pid,ppid,euser:20,cmd
sudo aa-status | grep -E 'nginx|apache'
wc -l /etc/apache2/apache2.conf /etc/apache2/sites-available/000-default.conf /etc/nginx-school/nginx.conf
```

**Kết quả ghi nhận:**

| Tiêu chí | Nginx (`nginx-school`, đã hardening) | Apache 2.4.66 (mặc định) |
|---|---|---|
| Master process | `svc_nginx` (không root) | `root` |
| Worker process | `svc_nginx` | `www-data` |
| Capability của master | 1 (`cap_net_bind_service`) | 35 |
| AppArmor | enforce | unconfined |
| Exposure level (`systemd-analyze`) | **1.7 OK** | **5.7 MEDIUM** |
| Cấu hình | 1 file duy nhất (~50 dòng thực) | Phân mảnh nhiều thư mục/file |
| Khả năng chịu lỗi cấu hình | Cách ly bằng sandbox | Quyền hạn rộng, rủi ro cao hơn |

---

#### B9 – Phụ lục cấu hình hoàn chỉnh

##### B9.1 Service file `/etc/systemd/system/nginx-school.service`
```ini
[Unit]
Description=Nginx - School Portal (chạy KHÔNG root)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=svc_nginx
Group=svc_nginx
RuntimeDirectory=nginx-school
StateDirectory=nginx-school
LogsDirectory=nginx-school

ExecStartPre=/usr/sbin/nginx -t -q -c /etc/nginx-school/nginx.conf
ExecStart=/usr/sbin/nginx -g "daemon off;" -c /etc/nginx-school/nginx.conf
ExecReload=/usr/sbin/nginx -t -q -c /etc/nginx-school/nginx.conf
ExecReload=/bin/kill -HUP $MAINPID
KillSignal=SIGQUIT
KillMode=mixed
TimeoutStopSec=15
Restart=on-failure
RestartSec=2s
LimitNOFILE=16384

AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
NoNewPrivileges=yes
UMask=0027

[Install]
WantedBy=multi-user.target
```

##### B9.2 Sandbox drop-in `/etc/systemd/system/nginx-school.service.d/10-sandbox.conf`
```ini
[Service]
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
PrivateDevices=yes
InaccessiblePaths=-/root -/boot -/mnt -/media -/srv -/opt
ProtectProc=invisible
ProcSubset=pid

ProtectKernelTunables=yes
ProtectKernelModules=yes
ProtectKernelLogs=yes
ProtectControlGroups=yes
ProtectClock=yes
ProtectHostname=yes

RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
RestrictNamespaces=yes
RestrictRealtime=yes
RestrictSUIDSGID=yes
LockPersonality=yes
MemoryDenyWriteExecute=yes
SystemCallArchitectures=native
SystemCallFilter=@system-service
SystemCallErrorNumber=EPERM

MemoryMax=300M
CPUQuota=80%
TasksMax=200
```

##### B9.3 AppArmor profile `/etc/apparmor.d/usr.sbin.nginx`
```
abi <abi/4.0>,
#include <tunables/global>

/usr/sbin/nginx flags=(attach_disconnected) {
  #include <abstractions/base>
  #include <abstractions/nameservice>

  capability net_bind_service,

  network inet stream,
  network inet6 stream,
  network unix stream,

  /usr/sbin/nginx                  mr,
  /etc/nginx-school/**             r,
  /etc/nginx/mime.types            r,
  /var/www/school/**               r,
  /var/log/nginx-school/**         rw,
  /var/lib/nginx-school/**         rwk,
  /run/nginx-school/**             rwk,
  /proc/sys/net/core/somaxconn     r,
  /sys/devices/system/cpu/         r,
  /sys/devices/system/cpu/**       r,
}
```

##### B9.4 Sysctl kernel `/etc/sysctl.d/90-school.conf`
```
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 4096
```

---

*Tên file gợi ý: D24CCHT03_Nhom2A_DeTai05_B24DCCC288_BaoCaoCaNhan.docx. Không đưa mật khẩu, khoá riêng, khoá JWT, token hay nội dung `portal-secrets.env` vào báo cáo hoặc ảnh minh chứng.*
