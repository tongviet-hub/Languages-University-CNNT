# 7. PHẦN MỞ RỘNG NÂNG CAO: TRIỂN KHAI TRÊN KUBERNETES (K3s) THEO MÔ HÌNH GITOPS

*Phần làm thêm ngoài yêu cầu bắt buộc, đã được giảng viên đồng ý. Chi tiết cách thực hiện, minh chứng và kiểm thử nằm trong báo cáo cá nhân của người thực hiện.*

Toàn bộ hệ thống website trường học (frontend React, 3 dịch vụ NestJS, PostgreSQL) đã được đưa lên cụm Kubernetes K3s và chạy thật tại `https://lumina.synnie.dev`. Mã nguồn ứng dụng giữ nguyên. Mọi yêu cầu bắt buộc của Đề tài 05 vẫn được đáp ứng, đồng thời hệ thống có thêm khả năng tự phục hồi, cập nhật không gián đoạn, tường lửa giữa các dịch vụ, triển khai tự động, giám sát tập trung và sao lưu tự động.

---

## 7.1. Lý do mở rộng

Mô hình một máy chủ ở phần bắt buộc (Nginx + systemd/docker-compose) đáp ứng đề bài nhưng còn 5 điểm yếu khi vận hành thật:

| Vấn đề | Biểu hiện | Kubernetes xử lý bằng |
|---|---|---|
| Điểm lỗi đơn | Tiến trình chết hoặc treo thì web ngừng cho đến khi có người khởi động lại | Probe phát hiện chết/treo, tự tạo lại Pod |
| Cập nhật gây gián đoạn | Phải dừng bản cũ rồi mới chạy bản mới | Rolling update: bản mới Ready rồi mới tắt bản cũ |
| Cấu hình làm tay trên server | Không truy vết được ai sửa gì, khó dựng lại | Toàn bộ cấu hình nằm trong Git, ArgoCD tự đồng bộ |
| Khó kiểm soát tài nguyên | Một dịch vụ rò rỉ RAM kéo chậm cả máy | `requests/limits`, ResourceQuota |
| Tường lửa thô | `ufw` chỉ lọc theo cổng của máy | NetworkPolicy lọc theo từng cặp dịch vụ |

Nhóm chọn **K3s**: bản Kubernetes rút gọn đạt chuẩn CNCF, chạy từ một file, ít tốn RAM, có sẵn Traefik, CoreDNS, bộ cấp phát ổ đĩa và metrics-server.

## 7.2. Kiến trúc

```text
 Người dùng ──https://lumina.synnie.dev──► Cloudflare (DNS, TLS 1.3, chống DDoS)
                                              │  Cloudflare Tunnel (mở từ trong cụm ra,
                                              │  router không mở cổng nào)
 ═════════════════════════════ Cụm K3s ═══════╪═══════════════════════════════
                                              ▼
                                    cloudflared ──► Traefik (Ingress)
                                                    │/api/v1/*       │ / (còn lại)
 namespace portal                                   ▼                ▼
                                          portal (2 Pod)     frontend (2 Pod, nginx)
                                             │        │
                                             ▼        ▼
                                  academic-api (1)  finance-api (1)
                                             │
                                             ▼
                                  postgres-0 (StatefulSet, PVC 2Gi) ◄── CronJob backup 02:00

 Ngoài ra: ArgoCD (GitOps) · Prometheus + Grafana + Alertmanager → Slack · Loki + Alloy (log)
```

| Thành phần | Loại | Số bản | Cổng | RAM request / limit | Chạy bằng user |
|---|---|---|---|---|---|
| `frontend` | Deployment + Service | 2 | 8080 | 16Mi / 64Mi | uid 101 (nginx) |
| `portal` | Deployment + Service | 2 | 8080 | 96Mi / 256Mi | uid 1000 |
| `academic-api` | Deployment + Service | 1 | 8081 | 128Mi / 384Mi | uid 1000 |
| `finance-api` | Deployment + Service | 1 | 8082 | 64Mi / 256Mi | uid 1000 |
| `postgres` | StatefulSet + PVC 2Gi | 1 | 5432 | 128Mi / 512Mi | uid 70 (sau entrypoint) |
| `postgres-backup` | CronJob + PVC 2Gi | theo lịch | – | 64Mi / 256Mi | uid 70 |

**Phân vai Traefik và nginx:** Traefik (có sẵn trong K3s) đảm nhận vai trò reverse proxy và định tuyến của Nginx trong phần bắt buộc. Nginx vẫn chạy trong Pod `frontend` để phục vụ file tĩnh React, bằng user không đặc quyền. TLS do Cloudflare kết thúc.

## 7.3. Đối chiếu với yêu cầu Đề tài 05

| Yêu cầu của đề | Phần bắt buộc | Trên Kubernetes |
|---|---|---|
| 2.1 Luồng yêu cầu | Client → DNS → Nginx → File System | Client → Cloudflare → Tunnel → Traefik → Service → Pod |
| 2.2 Web server, tên miền | Nginx, `school.internal.edu.vn` trong hosts | Traefik + nginx-unprivileged, tên miền thật `lumina.synnie.dev` |
| 2.2 Document Root, quyền | `chown www-data`, `chmod 755` | Nội dung web đóng trong image, root filesystem chỉ đọc |
| 2.2 Không chạy root | User `www-data` | `runAsNonRoot`, `capabilities.drop: [ALL]`, `allowPrivilegeEscalation: false`, seccomp |
| 2.3 Giám sát CPU/RAM, HTTP status, log | `top`, `tail -f access.log` | `kubectl top`, Grafana, Loki lọc theo mã trạng thái, 9 luật cảnh báo về Slack |
| 2.4 Giới hạn trang quản trị | IP nội bộ / Basic Auth | JWT + phân quyền; NetworkPolicy chặn mọi đường từ ngoài vào Academic API |
| 2.4 Sao lưu | Script + cron | CronJob `pg_dump` hằng đêm, kiểm tra `gzip -t`, giữ 7 bản, đã thử khôi phục |
| 2.4 HTTPS | Self-signed / Let's Encrypt | Chứng chỉ Cloudflare, TLS 1.3 |
| Tường lửa | `ufw allow 80,443` | Không mở cổng router + NetworkPolicy chặn mặc định |
| Mở rộng 6: Reverse proxy & caching | Nginx trước Apache | Traefik làm reverse proxy; nginx cache `/assets/` 1 năm; Cloudflare CDN |

## 7.4. Các điểm kỹ thuật chính

**Bảo mật nhiều lớp.**
- *Container:* mọi Pod ứng dụng chạy user thường, ổ đĩa chỉ đọc (chỉ `/tmp` ghi được), bỏ toàn bộ Linux capabilities, bật seccomp, không gắn token Kubernetes API.
- *Mạng:* NetworkPolicy `default-deny-all` chặn cả chiều vào lẫn chiều ra, rồi chỉ mở đúng các đường Traefik → frontend/portal, portal → academic/finance, academic và Job backup → postgres, mọi Pod → DNS cổng 53. Không Pod nào ra được Internet.
- *Biên mạng:* Cloudflare Tunnel do cụm chủ động mở ra ngoài, nên router không mở cổng nào và IP thật được giấu.
- *Bí mật:* mật khẩu DB và khoá JWT được mã hoá bằng Sealed Secrets trước khi đưa lên Git.
- *Chuỗi cung ứng:* mỗi image được Trivy quét (lỗ hổng CRITICAL thì dừng), kèm SBOM, provenance và chữ ký cosign.

**Sẵn sàng cao.** Frontend và Portal chạy 2 bản, rolling update với `maxUnavailable: 0`. Ba loại probe (startup, readiness, liveness) tự rút Pod chưa sẵn sàng khỏi Service và khởi động lại Pod bị treo. PodDisruptionBudget giữ ít nhất 1 bản khi bảo trì. ResourceQuota và LimitRange giới hạn tài nguyên cả namespace. Academic API giữ 1 bản vì bộ đếm chống dò mật khẩu nằm trong RAM.

**CI/CD và GitOps.** Push lên `main` → CI (build, lint, test, quét bảo mật) → CD build 4 image, quét, ký, đẩy lên GHCR → ghi tag `sha-<commit>` vào repo hạ tầng → ArgoCD trong cụm tự kéo về và rolling update → smoke test kiểm tra website. CI không có quyền truy cập cụm; `selfHeal` tự sửa mọi thay đổi tay không qua Git; quay lui bằng `git revert`.

**Giám sát và sao lưu.** Prometheus + Grafana theo dõi CPU/RAM/restart; Loki + Alloy gom log mọi Pod, giữ 7 ngày, tra được cả log của Pod đã chết. Alertmanager gửi 9 loại cảnh báo về Slack (Pod crash, dịch vụ sập, DB sập, hết RAM, backup lỗi hoặc quá cũ…). Sao lưu chạy lúc 02:00 hằng đêm; RPO ≈ 24 giờ, RTO ≈ 5–10 phút.

## 7.5. Kết quả kiểm thử

KT1–KT3 của đề được làm lại trên Kubernetes, cộng 7 kịch bản riêng của phần mở rộng. Số liệu và ảnh minh chứng chi tiết nằm trong báo cáo cá nhân.

| Mã | Nội dung | Kết quả |
|---|---|---|
| KT1-K8s | Truy cập và tải tài liệu qua `https://lumina.synnie.dev` | ☐ Đạt ☐ Chưa đạt |
| KT2-K8s | Phân biệt lỗi DNS (NXDOMAIN) và dịch vụ dừng (HTTP 503) | ☐ Đạt ☐ Chưa đạt |
| KT3-K8s | Sao lưu và khôi phục CSDL vào DB tạm, so số bản ghi | ☐ Đạt ☐ Chưa đạt |
| KT4 | Xoá Pod, hệ thống tự tạo lại | ☐ Đạt ☐ Chưa đạt |
| KT5 | Rolling update trong khi `curl` liên tục, không có lỗi 5xx | ☐ Đạt ☐ Chưa đạt |
| KT6 | NetworkPolicy chặn Pod ra Internet và chặn frontend gọi Academic | ☐ Đạt ☐ Chưa đạt |
| KT7 | Tiến trình chạy uid 1000, ổ đĩa chỉ đọc | ☐ Đạt ☐ Chưa đạt |
| KT8 | Bắn tải, tài nguyên không vượt limit, không Pod nào restart | ☐ Đạt ☐ Chưa đạt |
| KT9 | Sửa tay số bản, ArgoCD tự đưa về đúng Git | ☐ Đạt ☐ Chưa đạt |
| KT10 | Cảnh báo về Slack và tin RESOLVED | ☐ Đạt ☐ Chưa đạt |

## 7.6. Hạn chế và hướng phát triển

| Hạn chế | Hướng khắc phục |
|---|---|
| Cụm 1 node (k3d trên máy nhà), vẫn còn điểm lỗi đơn ở mức phần cứng | Cụm 3 node, lưu trữ phân tán (Longhorn) |
| Bản sao lưu nằm cùng máy với CSDL | Đẩy thêm bản ra ngoài (Cloudflare R2/S3) theo quy tắc 3-2-1 |
| `academic-api` còn chạy chế độ development, chưa có migration | Viết TypeORM migration, chuyển sang production |
| `academic-api` chỉ 1 bản | Chuyển bộ đếm rate-limit sang Redis rồi bật autoscaling |
| Chưa kiểm tra website từ bên ngoài cụm | Thêm `blackbox-exporter` |
