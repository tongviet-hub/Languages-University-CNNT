# BÁO CÁO PHẦN MỞ RỘNG NÂNG CAO
## TRIỂN KHAI HỆ THỐNG WEBSITE TRƯỜNG HỌC TRÊN KUBERNETES (K3s) THEO MÔ HÌNH GITOPS

*Tài liệu bổ sung cho báo cáo chính [bao_cao_trien_khai_he_thong_website_truong_hoc.md](bao_cao_trien_khai_he_thong_website_truong_hoc.md) – Đề tài 05: Phân tích và triển khai hệ thống website cho trường học.*

---

### THÔNG TIN CHUNG
* **Môn học:** Mạng máy tính & Hệ điều hành / Quản trị hệ thống
* **Lớp:** ................................................................
* **Nhóm:** ...............................................................
* **Người thực hiện phần mở rộng:** .................................... (Mã SV: ....................)
* **Website triển khai thật:** `https://lumina.synnie.dev`
* **Mã nguồn ứng dụng:** repo `School Portal` (thư mục `frontend/`, `backend/`)
* **Mã nguồn hạ tầng (Infrastructure as Code):** repo `synnie-studio/infra`, thư mục `apps/portal/` và `argocd/`

### TÓM TẮT

Ở phần bắt buộc, hệ thống được triển khai theo mô hình truyền thống: **một máy chủ Linux, Nginx phục vụ file tĩnh và làm reverse proxy, dịch vụ chạy bằng systemd/docker-compose**. Mô hình này đáp ứng đề bài nhưng có các điểm yếu khi vận hành thật: một máy hỏng là cả web sập, cập nhật phải làm tay trên server, tiến trình chết phải có người khởi động lại.

Phần mở rộng này đưa **toàn bộ hệ thống** (website React, 3 dịch vụ backend NestJS, cơ sở dữ liệu PostgreSQL) lên **cụm Kubernetes K3s**, với:

| Hạng mục | Kết quả đạt được |
|---|---|
| Truy cập | Domain thật `https://lumina.synnie.dev`, HTTPS qua Cloudflare, **không mở cổng nào trên router** (Cloudflare Tunnel) |
| Triển khai | **Tự động hoàn toàn**: push code → CI kiểm thử → build & quét lỗ hổng image → ký số → ArgoCD tự cập nhật cluster (GitOps) |
| Sẵn sàng cao | Frontend và Portal chạy **2 bản**, cập nhật cuốn chiếu **không gián đoạn**, Pod chết **tự khởi động lại** |
| Bảo mật | Mọi container chạy **không phải root**, hệ thống file **chỉ đọc**, bỏ toàn bộ Linux capabilities, **tường lửa giữa các Pod (NetworkPolicy) chặn mặc định**, mật khẩu được **mã hoá trước khi đưa lên Git** (Sealed Secrets) |
| Giám sát | Prometheus + Grafana (số liệu), Loki + Alloy (log tập trung), **9 luật cảnh báo** tự gửi về Slack |
| Sao lưu | CronJob `pg_dump` mỗi đêm lúc 2h sáng, kiểm tra tính toàn vẹn, giữ 7 bản, **đã thử khôi phục thành công** |

---

## MỤC LỤC

1. [Lý do mở rộng lên Kubernetes](#1-lý-do-mở-rộng-lên-kubernetes)
2. [Kiến thức nền tảng](#2-kiến-thức-nền-tảng)
3. [Kiến trúc tổng thể](#3-kiến-trúc-tổng-thể)
4. [Luồng xử lý một yêu cầu trên Kubernetes](#4-luồng-xử-lý-một-yêu-cầu-trên-kubernetes)
5. [Đối chiếu yêu cầu Đề tài 05 với giải pháp Kubernetes](#5-đối-chiếu-yêu-cầu-đề-tài-05-với-giải-pháp-kubernetes)
6. [Triển khai chi tiết từng thành phần](#6-triển-khai-chi-tiết-từng-thành-phần)
7. [Bảo mật nhiều lớp](#7-bảo-mật-nhiều-lớp)
8. [Tính sẵn sàng cao và khả năng tự phục hồi](#8-tính-sẵn-sàng-cao-và-khả-năng-tự-phục-hồi)
9. [CI/CD và GitOps](#9-cicd-và-gitops)
10. [Giám sát, log tập trung và cảnh báo](#10-giám-sát-log-tập-trung-và-cảnh-báo)
11. [Sao lưu và phục hồi dữ liệu](#11-sao-lưu-và-phục-hồi-dữ-liệu)
12. [Kịch bản kiểm thử nghiệm thu trên Kubernetes](#12-kịch-bản-kiểm-thử-nghiệm-thu-trên-kubernetes)
13. [Bảng lệnh vận hành nhanh](#13-bảng-lệnh-vận-hành-nhanh)
14. [Câu hỏi vấn đáp bảo vệ bổ sung](#14-câu-hỏi-vấn-đáp-bảo-vệ-bổ-sung)
15. [Hạn chế và hướng phát triển](#15-hạn-chế-và-hướng-phát-triển)
16. [Phụ lục](#16-phụ-lục)

---

## 1. LÝ DO MỞ RỘNG LÊN KUBERNETES

### 1.1. Hạn chế của mô hình một máy chủ

| Vấn đề | Biểu hiện trong mô hình Nginx + systemd/docker-compose |
|---|---|
| **Điểm lỗi đơn (SPOF)** | Tiến trình Nginx hoặc backend chết thì website ngừng phục vụ cho đến khi có người vào khởi động lại (hoặc nhờ `Restart=` của systemd, nhưng không kiểm tra được "còn sống mà bị treo"). |
| **Cập nhật gây gián đoạn** | Muốn lên bản mới phải dừng tiến trình cũ, chạy tiến trình mới → người dùng gặp lỗi trong vài giây đến vài phút. |
| **Thao tác tay trên server** | Cấu hình nằm rải rác trên máy (`/etc/nginx`, `.env`, crontab). Không biết ai đã sửa gì, khó dựng lại y hệt trên máy khác. |
| **Khó kiểm soát tài nguyên** | Một dịch vụ rò rỉ bộ nhớ có thể kéo cả máy chậm/treo. |
| **Tường lửa thô** | `ufw` chỉ lọc theo cổng của máy, không phân biệt được "dịch vụ nào được gọi dịch vụ nào" bên trong. |

### 1.2. So sánh ba cách triển khai

| Tiêu chí | VM + Nginx (phần bắt buộc) | docker-compose | **Kubernetes (phần mở rộng)** |
|---|---|---|---|
| Đóng gói | Cài trực tiếp lên OS | Container | Container |
| Tự khởi động lại khi chết | systemd `Restart=` | `restart: unless-stopped` | Có, kèm **kiểm tra sức khoẻ** (probe) |
| Phát hiện tiến trình bị treo | Không | `healthcheck` chỉ đánh dấu, không tự xử lý | **livenessProbe → tự giết và tạo lại** |
| Cập nhật không gián đoạn | Không | Không | **Rolling update** |
| Nhiều bản chạy song song + cân bằng tải | Cấu hình tay `upstream` | Hạn chế | **Service tự cân bằng tải** |
| Tường lửa giữa các dịch vụ | Không | Mạng Docker riêng (cả mạng tin nhau) | **NetworkPolicy theo từng cặp dịch vụ** |
| Giới hạn tài nguyên | cgroup thủ công | `deploy.resources` | `requests/limits`, ResourceQuota cả namespace |
| Quản lý bí mật | File `.env` trên server | File `.env` | Secret + **SealedSecret mã hoá trong Git** |
| Cấu hình lưu ở đâu | Trên server | 1 file YAML | **Toàn bộ trong Git, tự đồng bộ (GitOps)** |
| Độ phức tạp | Thấp | Thấp | Cao hơn |

**Kết luận:** Kubernetes phức tạp hơn nhưng giải quyết đúng các điểm yếu vận hành mà đề bài đặt ra (giám sát, phân quyền, sao lưu, an toàn). Nhóm chọn **K3s** – bản Kubernetes rút gọn đạt chuẩn CNCF, một file chạy duy nhất, ít tốn RAM, phù hợp máy cá nhân và phòng lab.

---

## 2. KIẾN THỨC NỀN TẢNG

| Khái niệm | Giải thích | Tương đương trong mô hình truyền thống |
|---|---|---|
| **Cluster / Node** | Cụm máy chạy Kubernetes; mỗi máy là một Node. Ở đây cụm có 1 node (K3s chạy trong Docker bằng k3d). | Máy chủ vật lý / VM |
| **Pod** | Đơn vị chạy nhỏ nhất, chứa 1 (hoặc vài) container, có IP riêng trong dải `10.42.0.0/16`. | Một tiến trình dịch vụ |
| **Deployment** | "Luôn giữ N Pod giống nhau đang chạy"; lo việc cập nhật cuốn chiếu. | systemd unit + script deploy |
| **StatefulSet** | Như Deployment nhưng Pod có **tên cố định** (`postgres-0`) và **ổ đĩa gắn chặt** – dành cho CSDL. | Dịch vụ PostgreSQL + thư mục dữ liệu |
| **Service** | Tên DNS và IP ảo cố định đứng trước một nhóm Pod, tự cân bằng tải. | `upstream` của Nginx |
| **Ingress** | Luật định tuyến HTTP từ ngoài vào theo tên miền/đường dẫn; Traefik thực thi luật này. | VirtualHost / Server Block |
| **Namespace** | "Phòng riêng" cô lập tài nguyên; hệ thống này nằm trong namespace `portal`. | Thư mục/tài khoản riêng cho mỗi site |
| **PersistentVolumeClaim (PVC)** | Yêu cầu một ổ đĩa bền vững cho Pod. | Phân vùng `/var/lib/postgresql` |
| **NetworkPolicy** | Tường lửa giữa các Pod (ai được gọi ai, cổng nào). | `iptables`/`ufw`, nhưng mịn hơn |
| **Probe** | Kubelet định kỳ gọi kiểm tra sức khoẻ container. | Script giám sát + `systemctl restart` |
| **CronJob** | Tạo Job chạy theo lịch. | `crontab` |
| **Secret / SealedSecret** | Lưu mật khẩu; SealedSecret là bản **đã mã hoá** để commit được lên Git. | File `.env` quyền 600 |
| **GitOps (ArgoCD)** | Git là nguồn sự thật duy nhất; ArgoCD liên tục so sánh cluster với Git và tự sửa cho khớp. | (không có) |

**Nguyên lý cốt lõi – mô hình khai báo (declarative):** người quản trị **không ra lệnh** "hãy khởi động tiến trình X", mà **mô tả trạng thái mong muốn** ("cần 2 bản portal, mỗi bản tối đa 256Mi RAM"). Các *controller* của Kubernetes chạy vòng lặp **quan sát → so sánh → điều chỉnh** liên tục để thực tế luôn khớp mô tả.

---

## 3. KIẾN TRÚC TỔNG THỂ

### 3.1. Sơ đồ kiến trúc

```text
                       Người dùng (trình duyệt)
                                │  https://lumina.synnie.dev
                                ▼
            ┌──────────────────────────────────────────┐
            │ Cloudflare (DNS + chứng chỉ TLS + chặn    │
            │ DDoS). HTTPS kết thúc tại đây.            │
            └──────────────────────────────────────────┘
                                │  Cloudflare Tunnel (kết nối do cloudflared mở TỪ TRONG ra,
                                │  router nhà KHÔNG mở cổng 80/443 nào)
════════════════════════════════╪══════════════ Cụm K3s (máy nhà) ═══════════════════════════
                                ▼
   ns: cloudflared   ┌─────────────────────┐
                     │ Pod cloudflared     │
                     └─────────────────────┘
                                │
   ns: kube-system   ┌─────────────────────┐
                     │ Traefik (Ingress    │   Ingress "portal": host lumina.synnie.dev
                     │ controller)         │
                     └─────────────────────┘
                     /api/v1/* │        │ /* (còn lại)
   ns: portal                  ▼        ▼
            ┌──────────────────────┐  ┌──────────────────────┐
            │ Service portal :8080 │  │ Service frontend:8080│
            │  ├ Pod portal (1)    │  │  ├ Pod frontend (1)  │  nginx-unprivileged
            │  └ Pod portal (2)    │  │  └ Pod frontend (2)  │  phục vụ file tĩnh React
            └──────────────────────┘  └──────────────────────┘
                 │              │
                 ▼              ▼
   ┌──────────────────────┐  ┌──────────────────────┐
   │ Service academic-api │  │ Service finance-api  │
   │ :8081 – 1 Pod        │  │ :8082 – 1 Pod        │
   └──────────────────────┘  └──────────────────────┘
                 │
                 ▼
   ┌──────────────────────────────┐     ┌────────────────────────────────┐
   │ StatefulSet postgres (pg 17) │◄────│ CronJob postgres-backup        │
   │ Pod postgres-0 + PVC data 2Gi│     │ 02:00 hằng đêm → PVC backup 2Gi│
   └──────────────────────────────┘     └────────────────────────────────┘

   ns: argocd      ArgoCD – theo dõi repo Infra, tự đồng bộ ns portal
   ns: monitoring  Prometheus, Grafana, Alertmanager (→ Slack #alert)
   ns: logging     Loki (kho log) + Alloy (thu gom log mọi Pod)
```

### 3.2. Bảng thành phần (số liệu lấy từ manifest)

| Thành phần | Loại tài nguyên | Số bản | Image | Cổng | CPU request | RAM request / limit | Chạy bằng user |
|---|---|---|---|---|---|---|---|
| `frontend` | Deployment + Service | 2 | `ghcr.io/tongviet-hub/portal-frontend` (nginx-unprivileged 1.27) | 8080 | 10m | 16Mi / 64Mi | uid 101 (nginx) |
| `portal` | Deployment + Service | 2 | `ghcr.io/tongviet-hub/portal-portal` (Node 22) | 8080 | 50m | 96Mi / 256Mi | uid 1000 (node) |
| `academic-api` | Deployment + Service | 1 | `ghcr.io/tongviet-hub/portal-academic` | 8081 | 50m | 128Mi / 384Mi | uid 1000 |
| `finance-api` | Deployment + Service | 1 | `ghcr.io/tongviet-hub/portal-finance` | 8082 | 20m | 64Mi / 256Mi | uid 1000 |
| `postgres` | StatefulSet + Service + PVC 2Gi | 1 | `postgres:17-alpine` | 5432 | 50m | 128Mi / 512Mi | uid 70 (postgres, sau entrypoint) |
| `postgres-backup` | CronJob + PVC 2Gi | theo lịch | `postgres:17-alpine` | – | 50m | 64Mi / 256Mi | uid 70 |

*Ghi chú: `50m` = 50 milli-CPU = 5% một nhân CPU. Không đặt `limits.cpu` để tránh bị bóp CPU (CPU throttling) gây chậm phản hồi; chỉ giới hạn RAM.*

### 3.3. Vai trò của các namespace

| Namespace | Nội dung |
|---|---|
| `portal` | Toàn bộ ứng dụng trường học (5 thành phần + backup) |
| `kube-system` | Thành phần lõi của K3s: Traefik, CoreDNS, sealed-secrets-controller, metrics-server |
| `cloudflared` | Đường hầm Cloudflare |
| `argocd` | Công cụ GitOps |
| `monitoring` | kube-prometheus-stack (Prometheus, Grafana, Alertmanager) |
| `logging` | Loki, Alloy |

---

## 4. LUỒNG XỬ LÝ MỘT YÊU CẦU TRÊN KUBERNETES

*Đối chiếu với sơ đồ luồng ở mục 2.1 của báo cáo chính.*

```text
[ Trình duyệt ]  GET https://lumina.synnie.dev/api/v1/portal/me
      │
      ▼ (1) DNS: lumina.synnie.dev → IP anycast của Cloudflare (bản ghi CNAME tới tunnel)
[ Cloudflare edge ]
      │ (2) Bắt tay TCP + TLS 1.3 với Cloudflare, giải mã HTTPS
      ▼ (3) Gửi request qua đường hầm (tunnel) đã được cloudflared mở sẵn từ trong cụm ra
[ Pod cloudflared ] ── HTTP ──► Service traefik (kube-system)
      │
      ▼ (4) Traefik so luật Ingress: Host = lumina.synnie.dev, Path có tiền tố /api/v1 → Service "portal"
[ Service portal (ClusterIP) ]
      │ (5) kube-proxy (iptables) chọn 1 trong 2 Pod portal đang Ready → cân bằng tải
      ▼     NetworkPolicy "web-from-ingress" kiểm tra: nguồn là Traefik, cổng 8080 → CHO PHÉP
[ Pod portal ]  sinh/giữ X-Request-ID, kiểm tra token
      │ (6) Gọi http://academic-api:8081/api/v1/auth/me
      │     CoreDNS phân giải academic-api → academic-api.portal.svc.cluster.local → ClusterIP
      ▼     NetworkPolicy: chỉ Pod portal được vào academic-api:8081 → CHO PHÉP
[ Pod academic-api ] ── truy vấn SQL ──► [ Service postgres:5432 ] ──► [ Pod postgres-0 ] ──► PVC (đĩa)
      │
      ▼ (7) Đóng gói JSON, trả ngược lại theo đường cũ; mỗi tầng ghi log có cùng request-id
[ Trình duyệt hiển thị ]
```

**Khác biệt so với mô hình truyền thống:**

| Bước | Mô hình Nginx một máy | Kubernetes |
|---|---|---|
| Phân giải tên | `/etc/hosts` hoặc BIND9 nội bộ | DNS công khai (Cloudflare) cho bên ngoài; **CoreDNS** cho tên dịch vụ bên trong |
| Kết thúc TLS | Nginx + Certbot trên server | Cloudflare (tự cấp, tự gia hạn chứng chỉ) |
| Chọn VirtualHost | `server_name` | `spec.rules[].host` trong Ingress |
| Ánh xạ URL | `location /api/ { proxy_pass ... }` | `paths: /api/v1 → service portal` |
| Kiểm soát truy cập mạng | `ufw` theo cổng | NetworkPolicy theo **nhãn Pod** |
| Truy xuất file tĩnh | Nginx đọc `/var/www/...` | nginx trong container đọc `/usr/share/nginx/html` (đóng sẵn trong image, chỉ đọc) |

---

## 5. ĐỐI CHIẾU YÊU CẦU ĐỀ TÀI 05 VỚI GIẢI PHÁP KUBERNETES

*Bảng này cho thấy mọi yêu cầu bắt buộc của đề vẫn được đáp ứng, và được nâng cấp khi lên Kubernetes.*

| Yêu cầu của đề (báo cáo chính) | Cách làm truyền thống | Cách làm trên Kubernetes | File cấu hình |
|---|---|---|---|
| 2.1 Kiến trúc luồng yêu cầu | Client → DNS → Nginx → File System | Client → Cloudflare → Tunnel → Traefik → Service → Pod (mục 4) | `ingress.yaml`, `apps/cloudflared/` |
| 2.2 Web server | Nginx/Apache | Traefik (reverse proxy) + nginx-unprivileged (file tĩnh) | `ingress.yaml`, `frontend.yaml` |
| 2.2 Tên miền | `school.internal.edu.vn` trong hosts | Domain thật `lumina.synnie.dev` trên Cloudflare | `ingress.yaml` |
| 2.2 Document Root & quyền thư mục | `chown www-data`, `chmod 755` | Nội dung web đóng gói trong image; **root filesystem chỉ đọc** | `frontend.yaml` |
| 2.2 Tiến trình không chạy root | User `www-data` | `runAsNonRoot: true`, `runAsUser: 101/1000`, `capabilities.drop: [ALL]`, `allowPrivilegeEscalation: false`, seccomp | mọi `*.yaml` |
| 2.3 Giám sát HTTP status | Đọc `access.log` | Loki tách nhãn `status`, lọc `{status=~"5.."}` | `argocd/alloy.yaml` |
| 2.3 Giám sát CPU/RAM/PID | `top`, `htop`, `ps` | `kubectl top pods`, Grafana, cảnh báo gần hết RAM | `argocd/monitoring.yaml`, `alerts.yaml` |
| 2.3 Log thời gian thực | `tail -f access.log` | `kubectl logs -f`, Grafana Explore (Loki), giữ 7 ngày, xem được log của Pod đã chết | `argocd/loki.yaml` |
| 2.4 Giới hạn trang quản trị | IP nội bộ / Basic Auth | API quản trị chỉ đi qua Portal (JWT + phân quyền admin/teacher/student); Academic API **không** có đường từ ngoài vào (NetworkPolicy) | `network-policy.yaml` |
| 2.4 Sao lưu định kỳ | Script + `cron` | **CronJob** `pg_dump` + kiểm tra `gzip -t` + xoay vòng 7 bản | `postgres-backup.yaml` |
| 2.4 HTTPS | Self-signed / Let's Encrypt | Chứng chỉ Cloudflare (Universal SSL), TLS 1.3, chuyển hướng HTTP→HTTPS ở edge | Cloudflare dashboard |
| Tường lửa | `ufw allow 80,443` | **Không mở cổng nào trên router** (tunnel đi ra) + NetworkPolicy chặn mặc định | `network-policy.yaml` |
| KT1–KT3 | Mục 3 báo cáo chính | Làm lại trên K8s + 6 kịch bản bổ sung (mục 12) | – |
| Mở rộng (mục 6): Reverse Proxy & Caching | Nginx trước Apache | Traefik làm reverse proxy; nginx đặt `Cache-Control: immutable` 1 năm cho `/assets/`; Cloudflare CDN cache ở edge | `frontend/nginx.conf` |

---

## 6. TRIỂN KHAI CHI TIẾT TỪNG THÀNH PHẦN

### 6.1. Đóng gói ứng dụng thành Docker image

**Frontend** – build nhiều tầng (multi-stage), file `frontend/Dockerfile`:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Chạy không cần root, nghe cổng 8080
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
```

* Tầng `build` có Node.js và `node_modules` (hàng trăm MB) chỉ để biên dịch React; **tầng cuối chỉ giữ lại thư mục `dist/`** nên image chỉ còn khoảng **80MB**.
* Chép `package*.json` trước rồi mới chép code để tận dụng cache của Docker: sửa code mà không đổi thư viện thì không phải `npm ci` lại.
* `nginx-unprivileged` chạy bằng uid 101 và nghe cổng 8080 (cổng < 1024 cần quyền root) – đáp ứng yêu cầu "web server không chạy root" của đề.

Cấu hình nginx bên trong image (`frontend/nginx.conf`):

```nginx
server {
    listen 8080;
    root /usr/share/nginx/html;
    location / {
        try_files $uri $uri/ /index.html;   # mọi route của React -> index.html
    }
    location /assets/ {
        expires 1y;                          # file có mã băm trong tên -> cache lâu
        add_header Cache-Control "public, immutable";
    }
}
```

**Backend (NestJS)** – `backend/*/Dockerfile` cũng build 2 tầng, sau khi build chạy `npm prune --omit=dev` để bỏ thư viện chỉ dùng khi phát triển, và có dòng `USER node` để tiến trình chạy bằng user thường.

| Image | Kích thước (bản đầu) |
|---|---|
| `portal-frontend` | ~80MB |
| `portal-portal` | ~367MB |
| `portal-academic` | ~413MB |
| `portal-finance` | ~265MB |

### 6.2. Deployment và Service (lấy `portal` làm ví dụ)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portal
spec:
  replicas: 2                           # 2 bản: 1 bản restart thì bản kia vẫn phục vụ
  revisionHistoryLimit: 5               # giữ 5 phiên bản cũ để rollback
  strategy:
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }   # bản mới Ready rồi mới tắt bản cũ
  selector:
    matchLabels: { app.kubernetes.io/name: portal }
  template:
    metadata:
      labels: { app.kubernetes.io/name: portal }
    spec:
      imagePullSecrets: [{ name: ghcr-pull }]   # chìa khoá tải image private từ GHCR
      automountServiceAccountToken: false       # app không cần gọi Kubernetes API
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        runAsGroup: 1000
        seccompProfile: { type: RuntimeDefault }
      volumes:
        - name: tmp
          emptyDir: { sizeLimit: 64Mi }
      containers:
        - name: portal
          image: portal-portal                  # tên + tag thật đặt ở kustomization.yaml
          ports: [{ containerPort: 8080, name: http }]
          env:
            - { name: ACADEMIC_URL, value: "http://academic-api:8081" }   # gọi bằng tên Service
            - { name: FINANCE_URL,  value: "http://finance-api:8082" }
            - { name: UPSTREAM_TIMEOUT_MS, value: "2000" }
            - { name: TRUST_PROXY, value: 10.42.0.0/16 }
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: [ALL] }
          volumeMounts: [{ name: tmp, mountPath: /tmp }]
          resources:
            requests: { cpu: 50m, memory: 96Mi }
            limits: { memory: 256Mi }
          startupProbe:   { httpGet: { path: /api/v1/health, port: http }, periodSeconds: 2, failureThreshold: 30 }
          readinessProbe: { httpGet: { path: /api/v1/health, port: http }, periodSeconds: 5 }
          livenessProbe:  { httpGet: { path: /api/v1/health, port: http }, periodSeconds: 10, failureThreshold: 3 }
---
apiVersion: v1
kind: Service
metadata:
  name: portal
spec:
  selector: { app.kubernetes.io/name: portal }
  ports: [{ port: 8080, targetPort: http, name: http }]
```

**Nhãn (label) `app.kubernetes.io/name` là sợi dây nối mọi thứ:** Deployment quản lý Pod theo nhãn, Service chọn Pod theo nhãn, NetworkPolicy cho phép/chặn theo nhãn, Prometheus và Loki gom số liệu/log theo nhãn.

**Vì sao biến `ACADEMIC_URL` giống hệt docker-compose?** Pod nhận IP mới mỗi lần khởi động, nhưng Service `academic-api` có tên cố định; CoreDNS phân giải tên đó ra IP ảo của Service. Nhờ vậy mã nguồn không cần sửa gì khi chuyển từ compose sang Kubernetes.

### 6.3. Cơ sở dữ liệu PostgreSQL – StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 1
  template:
    spec:
      terminationGracePeriodSeconds: 60   # cho Postgres 60s ghi hết dữ liệu xuống đĩa khi bị tắt
      containers:
        - name: postgres
          image: postgres:17-alpine
          env:
            - { name: POSTGRES_USER, value: school }
            - { name: POSTGRES_DB, value: school_portal }
            - name: POSTGRES_PASSWORD
              valueFrom: { secretKeyRef: { name: portal-secrets, key: DB_PASSWORD } }
            - { name: PGDATA, value: /var/lib/postgresql/data/pgdata }
          readinessProbe: { exec: { command: ["sh","-c","pg_isready -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\""] } }
          volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: local-path
        resources: { requests: { storage: 2Gi } }
```

| Vì sao StatefulSet chứ không phải Deployment? | |
|---|---|
| Tên Pod cố định | Luôn là `postgres-0`, dễ quản lý, dễ ghi vào cảnh báo |
| Ổ đĩa gắn chặt | PVC `data-postgres-0` đi theo Pod; **xoá Pod, tạo lại vẫn gắn đúng ổ cũ → không mất dữ liệu** |
| Thứ tự khởi động/tắt | Có thứ tự, tránh 2 tiến trình cùng ghi một thư mục dữ liệu |

`storageClassName: local-path` là bộ cấp phát đĩa có sẵn của K3s: tạo một thư mục trên ổ cứng của node và gắn vào Pod – tương ứng với vai trò **quản lý hệ thống tập tin** của hệ điều hành trong đề bài.

### 6.4. Ingress – định tuyến theo đường dẫn (thay cho VirtualHost của Nginx)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: portal
spec:
  ingressClassName: traefik
  rules:
    - host: lumina.synnie.dev
      http:
        paths:
          - path: /api/v1
            pathType: Prefix
            backend: { service: { name: portal, port: { name: http } } }
          - path: /
            pathType: Prefix
            backend: { service: { name: frontend, port: { name: http } } }
```

Tương đương cấu hình Nginx sau trong mô hình truyền thống:

```nginx
server {
    server_name lumina.synnie.dev;
    location /api/v1/ { proxy_pass http://portal:8080; }
    location /        { proxy_pass http://frontend:8080; }
}
```

Web và API **cùng một tên miền** nên trình duyệt coi là cùng nguồn gốc (same-origin) → không phát sinh vấn đề CORS.

### 6.5. Kustomize – gom và quản lý phiên bản

`apps/portal/kustomization.yaml` là "mục lục" của cả hệ thống:

```yaml
namespace: portal                 # gắn mọi tài nguyên vào namespace portal
resources:
  - namespace.yaml
  - sealed-secret.yaml            # mật khẩu đã mã hoá
  - sealed-ghcr-pull.yaml         # chìa khoá tải image
  - postgres.yaml
  - postgres-backup.yaml
  - academic-api.yaml
  - finance-api.yaml
  - portal.yaml
  - frontend.yaml
  - ingress.yaml
  - network-policy.yaml
  - policies.yaml                 # PodDisruptionBudget, ResourceQuota, LimitRange
  - alerts.yaml                   # PrometheusRule
images:                           # do CI tự ghi, không sửa tay
  - name: portal-portal
    newName: ghcr.io/tongviet-hub/portal-portal
    newTag: sha-<mã commit đầy đủ>
  # ... tương tự cho frontend, academic, finance
```

* Tag image là **`sha-<mã commit>`** (bất biến) thay vì `latest`: nhìn tag biết ngay cluster đang chạy code của commit nào, và rollback được chính xác.
* Kiểm tra kết quả cuối cùng mà không áp dụng: `kubectl kustomize apps/portal`.

### 6.6. Bảng chuyển đổi từ docker-compose sang Kubernetes

| docker-compose (`docker-compose.yml`) | Kubernetes (`apps/portal/`) |
|---|---|
| `services.db` + `volumes.academic-pgdata` | StatefulSet `postgres` + PVC |
| `services.portal/academic-api/finance-api` | Deployment + Service |
| Gọi nhau bằng tên `http://academic-api:8081` | Giữ nguyên nhờ Service + CoreDNS |
| `environment:` | `env:` |
| File `.env` (mật khẩu) | Secret `portal-secrets` (từ SealedSecret) |
| `ports:` + Nginx trên host | Ingress + Traefik |
| `docker-compose.deploy.yml` (chỉ Portal mở cổng) | NetworkPolicy |
| `healthcheck:` | startupProbe / readinessProbe / livenessProbe |
| `restart: unless-stopped` | Deployment controller tự tạo lại Pod |
| IP cố định `172.30.0.10` để Academic tin Portal | Tin dải Pod `10.42.0.0/16`, an toàn nhờ NetworkPolicy |

---

## 7. BẢO MẬT NHIỀU LỚP

### 7.1. Lớp 1 – Container: quyền tiến trình tối thiểu

*Đây là phiên bản nâng cao của yêu cầu "web server chỉ chạy dưới quyền tài khoản không đặc quyền" (mục 2.2 báo cáo chính).*

| Cấu hình | Ý nghĩa | Kẻ tấn công chiếm được container thì… |
|---|---|---|
| `runAsNonRoot: true`, `runAsUser: 1000` | Kubernetes **từ chối khởi động** nếu image cố chạy bằng root | Chỉ có quyền user thường |
| `readOnlyRootFilesystem: true` | Toàn bộ hệ thống file container chỉ đọc; chỉ `/tmp` (emptyDir giới hạn 64Mi) ghi được | Không sửa được mã nguồn, không cài được công cụ |
| `capabilities: { drop: [ALL] }` | Bỏ mọi đặc quyền Linux (mở cổng < 1024, đổi chủ file, raw socket…) | Không nghe lén mạng, không đổi quyền file |
| `allowPrivilegeEscalation: false` | Đặt cờ `no_new_privs`: chương trình setuid (vd `sudo`) không nâng quyền được | Không leo thang lên root |
| `seccompProfile: RuntimeDefault` | Bộ lọc **system call** của kernel, chặn các syscall nguy hiểm (vd `mount`, `kexec_load`) | Không khai thác được nhiều lỗ hổng kernel |
| `automountServiceAccountToken: false` | Không gắn token truy cập Kubernetes API vào Pod | Không điều khiển được cluster |

**Liên hệ kiến thức Hệ điều hành:** Container thực chất là tiến trình Linux bình thường được cô lập bằng **namespaces** (PID, network, mount…) và bị giới hạn tài nguyên bằng **cgroups**. `resources.limits.memory` chính là giới hạn `memory.max` của cgroup: tiến trình vượt mức sẽ bị kernel OOM-killer giết (trạng thái `OOMKilled`). Seccomp và capabilities là các cơ chế bảo mật của kernel Linux.

**Ngoại lệ có chủ đích – PostgreSQL:** entrypoint của image `postgres` cần chạy root lúc đầu để `chown` thư mục dữ liệu, sau đó **tự hạ quyền** xuống user `postgres` (uid 70). Nhóm chỉ thêm `seccompProfile` và `allowPrivilegeEscalation: false` cho Postgres, không ép uid 70 từ đầu vì việc đổi quyền trên ổ đĩa đang chứa dữ liệu thật là rủi ro không đáng.

### 7.2. Lớp 2 – Mạng: NetworkPolicy "chặn mặc định" (zero-trust)

Mặc định trong Kubernetes **Pod nào cũng gọi được Pod nào**, kể cả Pod của ứng dụng khác chạy chung cụm. Nhóm áp dụng nguyên tắc **chặn hết cả chiều vào lẫn chiều ra, rồi chỉ mở đúng từng đường cần thiết**:

```yaml
# Bước 1: chặn mọi thứ cho mọi Pod trong namespace
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-all }
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
---
# Bước 2 (ví dụ): chỉ Pod portal được gọi vào academic-api cổng 8081
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: academic-from-portal }
spec:
  podSelector: { matchLabels: { app.kubernetes.io/name: academic-api } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app.kubernetes.io/name: portal } } }]
      ports: [{ protocol: TCP, port: 8081 }]
```

**Ma trận luồng mạng được phép** (mọi luồng khác đều bị chặn):

| Nguồn | Đích | Cổng | Lý do |
|---|---|---|---|
| Traefik (kube-system) | frontend, portal | TCP 8080 | Người dùng truy cập web và API |
| portal | academic-api | TCP 8081 | Đăng nhập, phân quyền |
| portal | finance-api | TCP 8082 | Học phí |
| academic-api | postgres | TCP 5432 | Đọc/ghi dữ liệu |
| postgres-backup (Job) | postgres | TCP 5432 | Sao lưu |
| Mọi Pod | CoreDNS (kube-system) | UDP/TCP 53 | Phân giải tên Service |

```text
  Traefik ──✔──► frontend          Traefik ──✘──► academic-api   (không đi tắt qua Portal)
  Traefik ──✔──► portal            frontend ──✘──► postgres
  portal  ──✔──► academic-api      Pod ứng dụng khác ──✘──► bất cứ gì trong ns portal
  portal  ──✔──► finance-api       Mọi Pod ──✘──► Internet (không tải được mã độc, không gửi dữ liệu ra ngoài)
  academic-api ──✔──► postgres
```

**Bài học thực tế:** khi chặn chiều ra (egress) phải **mở DNS cổng 53** tới CoreDNS. Thiếu luật này, Pod không phân giải được tên `postgres`, `academic-api` và toàn hệ thống sập dù các luật khác đều đúng. Probe của kubelet đi từ chính node nên không bị NetworkPolicy chặn.

### 7.3. Lớp 3 – Biên mạng: không mở cổng nào ra Internet

Mô hình truyền thống phải mở cổng 80/443 trên router (NAT/port forwarding) – lộ IP nhà và là mục tiêu quét cổng. Ở đây **cloudflared chủ động mở kết nối đi ra** Cloudflare; request của người dùng chạy ngược vào qua đường hầm đó. Router **không có cổng nào mở chiều vào**, IP thật của máy chủ được giấu sau Cloudflare, đồng thời hưởng lớp chống DDoS của Cloudflare.

### 7.4. Lớp 4 – Bí mật: Sealed Secrets

Hệ thống cần 3 giá trị bí mật: `DB_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. GitOps lấy mọi thứ từ Git, nhưng **không được** đưa mật khẩu dạng rõ lên Git. Giải pháp là **Sealed Secrets** (mã hoá bất đối xứng):

```text
 portal-secrets.env ──kubeseal (khoá CÔNG KHAI)──► sealed-secret.yaml ──git push──► GitHub
 (giá trị thật, sinh bằng                          (chuỗi mã hoá,                (an toàn: không ai
  openssl rand -hex 24, chỉ                         commit được)                  giải mã được)
  nằm trên máy quản trị, quyền 600)                       │
                                                          ▼ ArgoCD áp dụng
                                       sealed-secrets-controller giải mã bằng khoá RIÊNG (chỉ trong cluster)
                                                          │
                                                          ▼
                                       Secret "portal-secrets" → postgres, academic-api đọc qua secretKeyRef/envFrom
```

Quy trình tạo:

```bash
umask 077                                        # file tạo ra chỉ chủ sở hữu đọc được (600)
cat > ~/.synnie-backup/portal-secrets.env <<EOF
DB_PASSWORD=$(openssl rand -hex 24)
JWT_ACCESS_SECRET=$(openssl rand -hex 48)
JWT_REFRESH_SECRET=$(openssl rand -hex 48)
EOF
kubectl create secret generic portal-secrets -n portal \
  --from-env-file=$HOME/.synnie-backup/portal-secrets.env --dry-run=client -o yaml \
| kubeseal --controller-name sealed-secrets-controller --controller-namespace kube-system -o yaml \
> apps/portal/sealed-secret.yaml
```

Bản mã hoá **gắn với tên `portal-secrets` và namespace `portal`**: kẻ có được file cũng không thể đem sang namespace khác để giải mã. Chìa khoá tải image private từ GHCR (`ghcr-pull`) và webhook Slack của Alertmanager cũng được cất theo cách này.

### 7.5. Lớp 5 – Tin cậy địa chỉ IP người dùng (`TRUST_PROXY`)

Backend dùng IP người gọi để **giới hạn số lần đăng nhập** (chống dò mật khẩu). Sau proxy, IP thật nằm trong header `X-Forwarded-For` – nhưng header này **ai cũng tự viết được**, nên chỉ tin khi request đến từ proxy đã biết.

* Trong compose: Portal có IP cố định `172.30.0.10` → Academic chỉ tin đúng IP đó.
* Trong Kubernetes: IP Pod thay đổi liên tục nhưng luôn nằm trong dải `10.42.0.0/16` (dải Pod của K3s) → tin cả dải.
* **Vẫn an toàn** vì NetworkPolicy đảm bảo chỉ Traefik gọi được Portal và chỉ Portal gọi được Academic – không ai khác chạm tới để giả header.

### 7.6. Lớp 6 – Chuỗi cung ứng phần mềm (supply chain)

Trong pipeline CD (`.github/workflows/cd.yml`), mỗi image trước khi lên cluster phải qua:

| Bước | Công cụ | Mục đích |
|---|---|---|
| Quét lỗ hổng | **Trivy** | Có lỗ hổng mức CRITICAL → **dừng, không push** |
| Danh sách thành phần | **SBOM** | Liệt kê mọi thư viện trong image để tra cứu khi có lỗ hổng mới |
| Chứng nhận nguồn gốc | **Provenance** (SLSA) | Chứng minh image được build từ commit nào, ở đâu |
| Ký số | **cosign keyless** (Sigstore, OIDC của GitHub) | Ký theo **digest** (mã băm nội dung, không đổi được); không phải giữ private key nào |

Kiểm tra chữ ký của một image:

```bash
cosign verify ghcr.io/tongviet-hub/portal-portal@sha256:<digest> \
  --certificate-identity-regexp 'https://github.com/<owner>/<repo>/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

---

## 8. TÍNH SẴN SÀNG CAO VÀ KHẢ NĂNG TỰ PHỤC HỒI

### 8.1. Ba loại probe (kiểm tra sức khoẻ)

| Probe | Câu hỏi | Nếu thất bại | Cấu hình |
|---|---|---|---|
| `startupProbe` | "Đã khởi động xong chưa?" (kết nối DB, tạo bảng) | Chưa cho liveness/readiness chạy; quá 60s (30 lần × 2s) thì khởi động lại | `GET /api/v1/health` |
| `readinessProbe` | "Sẵn sàng nhận khách chưa?" | **Tạm rút khỏi Service** (không gửi request tới), không giết | mỗi 5s |
| `livenessProbe` | "Còn sống hay bị treo?" | **Giết và khởi động lại** container | mỗi 10s, 3 lần liên tiếp |

Với frontend, probe gọi `GET /`; với Postgres, probe chạy lệnh `pg_isready`.

### 8.2. Cập nhật cuốn chiếu không gián đoạn (rolling update)

```text
maxUnavailable: 0, maxSurge: 1, replicas: 2

 t0   [v1 ✔] [v1 ✔]                     ← 2 bản cũ phục vụ
 t1   [v1 ✔] [v1 ✔] [v2 … khởi động]    ← tạo thêm 1 bản mới (surge)
 t2   [v1 ✔] [v1 ✔] [v2 ✔ Ready]        ← readinessProbe đạt → nhận traffic
 t3   [v1 ✔] [v2 ✔]                     ← mới tắt 1 bản cũ
 t4   [v1 ✔] [v2 ✔] [v2 … khởi động]
 t5   [v2 ✔] [v2 ✔]                     ← hoàn tất, chưa lúc nào thiếu bản phục vụ
```

Nếu bản mới lỗi (không qua được readinessProbe), quá trình **dừng lại ở bước t1** và bản cũ vẫn phục vụ bình thường → lỗi không bao giờ tới tay người dùng. `revisionHistoryLimit: 5` giữ 5 phiên bản để có thể quay lui.

### 8.3. Chính sách vận hành (`policies.yaml`)

| Tài nguyên | Cấu hình | Tác dụng |
|---|---|---|
| **PodDisruptionBudget** `frontend`, `portal` | `minAvailable: 1` | Khi bảo trì node (`kubectl drain`) hoặc nâng cấp cụm, luôn giữ ít nhất 1 bản chạy |
| **ResourceQuota** `portal-quota` | requests CPU ≤ 1, RAM ≤ 2Gi; limits RAM ≤ 4Gi; ≤ 20 Pod; ≤ 4 PVC; ≤ 10Gi đĩa | "Ngân sách" của namespace: một ứng dụng lỗi (tạo Pod vô hạn, rò rỉ RAM) không thể kéo sập các ứng dụng khác chạy chung cụm |
| **LimitRange** `portal-defaults` | mặc định request 20m/64Mi, limit 256Mi, tối đa 1Gi | Pod nào quên khai báo tài nguyên vẫn được cấp giá trị hợp lý (bắt buộc khi có ResourceQuota) |

### 8.4. Vì sao `academic-api` chỉ chạy 1 bản?

Bộ đếm chống dò mật khẩu (`ThrottlerModule` của NestJS) nằm **trong RAM của từng Pod**. Chạy 2 bản thì kẻ tấn công được gấp đôi số lần thử. Muốn scale academic-api phải chuyển bộ đếm sang kho dùng chung (Redis) trước. Portal chạy 2 bản vẫn chấp nhận được vì lớp chặn dò mật khẩu thật sự nằm ở academic-api. Đây là ví dụ cho thấy **nhân bản ứng dụng không chỉ là tăng con số `replicas`** – phải xét đến trạng thái nằm trong tiến trình.

---

## 9. CI/CD VÀ GITOPS

### 9.1. Sơ đồ quy trình

```text
 Lập trình viên
     │ git push lên nhánh main (repo School Portal)
     ▼
 ┌──────────────── GitHub Actions ─────────────────────────────────────────┐
 │ CI  : build, lint, test e2e, quét dependency, kiểm tra bảo mật          │
 │        │ xanh                                                           │
 │        ▼                                                                │
 │ CD  : (1) build-and-push – 4 image song song                            │
 │           build → Trivy (CRITICAL thì dừng) → push GHCR + SBOM          │
 │           + provenance → cosign ký theo digest                          │
 │       (2) update-infra – ghi tag sha-<commit> vào                       │
 │           apps/portal/kustomization.yaml của repo Infra (deploy key)    │
 │       (3) smoke-test – chờ https://lumina.synnie.dev trả 200 và         │
 │           /api/v1/health trả "status":"ok" (tối đa 10 phút)             │
 └─────────────────────────────────────────────────────────────────────────┘
                                         │ commit mới trong repo Infra
                                         ▼
 ┌──────────── Cụm K3s ──────────────────────────────────────────────┐
 │ ArgoCD (Application "portal") thấy Git đổi → áp dụng → rolling   │
 │ update các Deployment → Pod mới kéo image từ GHCR (ghcr-pull)     │
 └───────────────────────────────────────────────────────────────────┘
```

### 9.2. Các nguyên tắc thiết kế

| Nguyên tắc | Cách thực hiện |
|---|---|
| Code chưa qua test không bao giờ lên production | CD chỉ chạy khi workflow CI **thành công** trên `main` (sự kiện `workflow_run`) |
| CI không có quyền vào cluster | CI chỉ **sửa file trong Git**; ArgoCD trong cluster tự **kéo** về (mô hình *pull*), cluster không phải lộ API ra ngoài |
| Không deploy chồng chéo | `concurrency: cd-production`, lần sau xếp hàng chờ lần trước |
| Không deploy nửa vời | `fail-fast: true`: 1 image hỏng → dừng cả 4 |
| Lịch sử triển khai | Môi trường `production` trên GitHub lưu mọi lần deploy; mỗi commit trong Infra ghi rõ nguồn và link workflow |

### 9.3. ArgoCD Application

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata: { name: portal, namespace: argocd }
spec:
  source:
    repoURL: git@github.com:Synnie-studio/Infra.git
    targetRevision: main
    path: apps/portal
  destination: { server: https://kubernetes.default.svc, namespace: portal }
  syncPolicy:
    automated:
      prune: true      # xoá khỏi cluster những gì đã bị xoá khỏi Git
      selfHeal: true   # ai sửa tay trên cluster sẽ bị đưa về đúng như Git
```

**Lợi ích về quản trị hệ thống:**
* **Truy vết (audit):** mọi thay đổi hạ tầng là một commit Git – biết ai, lúc nào, sửa gì, vì sao.
* **Chống trôi cấu hình (configuration drift):** `selfHeal` tự sửa mọi thay đổi tay không qua Git.
* **Rollback trong vài giây:** `git revert <commit>` trong repo Infra rồi push, ArgoCD tự đưa cluster về trạng thái cũ.
* **Dựng lại toàn bộ hệ thống** trên máy mới chỉ bằng cài K3s + ArgoCD rồi trỏ vào repo Infra (cộng khoá riêng của Sealed Secrets đã sao lưu).

---

## 10. GIÁM SÁT, LOG TẬP TRUNG VÀ CẢNH BÁO

*Nâng cấp mục 2.3 báo cáo chính (`top`, `tail -f access.log`) thành hệ thống quan sát (observability) đầy đủ: số liệu, log và cảnh báo.*

### 10.1. Thành phần

| Thành phần | Vai trò | Lưu trữ |
|---|---|---|
| **Prometheus** (kube-prometheus-stack, Helm chart 93.2.2) | Thu thập số liệu CPU/RAM/restart/trạng thái Pod (qua cAdvisor, kube-state-metrics) | 7 ngày, PVC 5Gi |
| **Grafana** (`grafana.synnie.dev`) | Biểu đồ, xem log, xem cảnh báo | – |
| **Alertmanager** | Gom nhóm, lọc trùng, gửi cảnh báo về Slack kênh `#alert` | – |
| **Loki** (SingleBinary) | Kho log tập trung, chỉ đánh chỉ mục theo nhãn → nhẹ | 7 ngày, PVC 10Gi |
| **Alloy** | Thu gom log mọi Pod qua Kubernetes API + **Kubernetes Events**, làm sạch, gắn nhãn, đẩy sang Loki | – |

### 10.2. Xử lý log của Alloy

Log truy cập của Portal/Academic có dạng `[<request-id>] GET /api/v1/... 200 12ms ip=...`. Alloy:
1. Bỏ mã màu ANSI của NestJS.
2. Tách `method`, `status` thành **nhãn** (ít giá trị → lọc rất nhanh, vd mọi lỗi 5xx).
3. Tách `request_id`, `duration_ms` thành **structured metadata** (mỗi request một giá trị – nếu làm nhãn sẽ khiến Loki phình to).
4. Thu thêm Kubernetes Events (Pod bị kill, kéo image lỗi, probe thất bại…) – thứ mà `kubectl` chỉ giữ khoảng 1 giờ.

### 10.3. Truy vấn LogQL thường dùng (Grafana → Explore → Loki)

| Muốn xem | LogQL |
|---|---|
| Toàn bộ log hệ thống trường học | `{namespace="portal"}` |
| Chỉ academic-api | `{namespace="portal", app="academic-api"}` |
| Request lỗi 5xx | `{namespace="portal", status=~"5.."}` |
| Đường đi của **một request** qua Portal → Academic | `{namespace="portal"} \| request_id="<X-Request-ID>"` |
| Request chậm hơn 500ms | `{namespace="portal"} \| duration_ms > 500` |
| Đăng nhập thất bại | `{app="academic-api"} \|= "/auth/login" \| status="401"` |
| Số request mỗi phút theo mã trạng thái | `sum by (status) (count_over_time({namespace="portal", status!=""}[1m]))` |
| Sự kiện Kubernetes liên quan | `{job="kubernetes-events"} \|= "portal"` |
| Log của Pod **đã chết** | `{pod="<tên pod cũ>"}` |

### 10.4. Luật cảnh báo (`alerts.yaml` – PrometheusRule)

| Cảnh báo | Điều kiện | Mức |
|---|---|---|
| `PortalPodCrashLooping` | Restart > 3 lần trong 15 phút | critical |
| `PortalPodNotReady` | Pod không Ready > 10 phút (bỏ qua Pod của Job đã xong) | warning |
| `PortalDeploymentDegraded` | Số bản sẵn sàng < mong muốn > 10 phút | warning |
| `PortalServiceDown` | 0 bản sẵn sàng > 2 phút | critical |
| `PortalDatabaseDown` | `postgres-0` không Ready > 2 phút | critical |
| `PortalContainerOOMKilled` | Container vừa bị tắt vì hết RAM | warning |
| `PortalMemoryNearLimit` | Dùng > 90% `limits.memory` trong 15 phút | warning |
| `PortalBackupFailed` | Job backup thất bại (sau lần thành công gần nhất) | critical |
| `PortalBackupTooOld` | > 26 giờ không có backup thành công | warning |

Ví dụ biểu thức:

```yaml
- alert: PortalServiceDown
  expr: kube_deployment_status_replicas_available{namespace="portal"} == 0
  for: 2m
  labels: { severity: critical }
  annotations:
    summary: "{{ $labels.deployment }} KHÔNG còn bản nào chạy"
```

**Định tuyến Alertmanager:** gom các cảnh báo trong 30 giây thành 1 tin, nhắc lại mỗi 4 giờ nếu chưa hết, gửi tin ✅ RESOLVED khi hết lỗi; đã có cảnh báo `critical` thì im cảnh báo `warning` cùng tên. Webhook Slack được cất trong SealedSecret và mount thành file (`api_url_file`), không bao giờ nằm trong Git dạng rõ.

### 10.5. Lệnh giám sát nhanh (tương đương `top`, `ps`, `tail -f`)

```bash
kubectl top nodes                                  # CPU/RAM của máy
kubectl top pods -n portal                         # CPU/RAM từng Pod (thay cho top/htop)
kubectl get pods -n portal -o wide                 # trạng thái, số lần restart, IP, node (thay cho ps)
kubectl logs -n portal deploy/portal -f            # log thời gian thực (thay cho tail -f)
kubectl logs -n portal deploy/frontend --tail=50   # access log của nginx frontend
kubectl get events -n portal --sort-by=.lastTimestamp
```

---

## 11. SAO LƯU VÀ PHỤC HỒI DỮ LIỆU

### 11.1. CronJob sao lưu (`postgres-backup.yaml`)

| Thuộc tính | Giá trị | Lý do |
|---|---|---|
| Lịch | `0 19 * * *` UTC = **02:00 giờ Việt Nam** | Lúc ít người dùng nhất |
| `concurrencyPolicy` | `Forbid` | Không chạy chồng nếu lần trước chưa xong |
| `backoffLimit` | 2 | Thử lại tối đa 2 lần khi lỗi |
| `activeDeadlineSeconds` | 1800 | Treo quá 30 phút coi như lỗi để cảnh báo bắt được |
| Lưu ở | PVC riêng `postgres-backup` 2Gi | Tách khỏi ổ dữ liệu |
| Số bản giữ | 7 bản gần nhất | Xoay vòng 1 tuần |
| Chạy bằng | uid 70, root FS chỉ đọc, drop ALL | Tối thiểu quyền |

Kịch bản sao lưu:

```sh
set -eu
set -o pipefail                      # pg_dump lỗi thì cả lệnh lỗi (không tạo file nén rỗng)
for i in $(seq 1 30); do pg_isready -q && break; sleep 2; done   # đợi Postgres sẵn sàng
pg_isready -q
FILE=/backup/portal-$(date +%Y%m%d-%H%M%S).sql.gz
trap 'rm -f "$FILE.tmp"' EXIT
pg_dump --no-owner --no-privileges | gzip > "$FILE.tmp"   # ghi ra file tạm
gzip -t "$FILE.tmp"                                        # kiểm tra file nén không hỏng
mv "$FILE.tmp" "$FILE"                                     # chỉ đổi tên khi thành công -> không có bản dở dang
ls -1t /backup/portal-*.sql.gz | tail -n +8 | xargs -r rm --   # giữ 7 bản mới nhất
```

**Các điểm đảm bảo tính đúng đắn:** `pipefail` tránh trường hợp `pg_dump` lỗi mà `gzip` vẫn "thành công"; ghi file tạm rồi `mv` (thao tác nguyên tử trên cùng hệ thống tập tin) đảm bảo không bao giờ có bản backup dở dang; `gzip -t` kiểm tra tính toàn vẹn trước khi chấp nhận.

So với phần bắt buộc (nén thư mục web + cron): trên Kubernetes **nội dung website đã nằm bất biến trong image** (có thể kéo lại bất kỳ phiên bản nào từ GHCR), **cấu hình đã nằm trong Git** – nên thứ duy nhất cần sao lưu là **dữ liệu CSDL**.

### 11.2. Chạy sao lưu ngay (không chờ đến đêm)

```bash
kubectl create job -n portal --from=cronjob/postgres-backup backup-tay-$(date +%s)
kubectl logs -n portal -l app.kubernetes.io/name=postgres-backup --tail=20 -f
# Mong đợi: "Đã tạo /backup/portal-2026....sql.gz (xxxx bytes)" + danh sách file
```

### 11.3. Thử khôi phục vào CSDL tạm (không ảnh hưởng dữ liệu thật)

*"Bản sao lưu chưa từng khôi phục thử thì coi như chưa có bản sao lưu."*

```bash
kubectl apply -n portal -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: restore-test
  labels: { app.kubernetes.io/name: postgres-backup }   # nhãn này để NetworkPolicy cho vào Postgres
spec:
  restartPolicy: Never
  containers:
    - name: pg
      image: postgres:17-alpine
      command: ["sleep", "3600"]
      env:
        - { name: PGHOST, value: postgres }
        - { name: PGUSER, value: school }
        - name: PGPASSWORD
          valueFrom: { secretKeyRef: { name: portal-secrets, key: DB_PASSWORD } }
      resources: { requests: { cpu: 20m, memory: 64Mi }, limits: { memory: 256Mi } }
      volumeMounts: [{ name: backup, mountPath: /backup, readOnly: true }]
  volumes:
    - name: backup
      persistentVolumeClaim: { claimName: postgres-backup }
EOF
kubectl wait -n portal --for=condition=Ready pod/restore-test

kubectl exec -n portal restore-test -- sh -c '
  LATEST=$(ls -1t /backup/portal-*.sql.gz | head -1)
  psql -d postgres -c "DROP DATABASE IF EXISTS restore_test" -c "CREATE DATABASE restore_test"
  gunzip -c "$LATEST" | psql -q -d restore_test
  echo "--- DB thật:";      psql -d school_portal -tAc "select count(*) from users"
  echo "--- Bản khôi phục:"; psql -d restore_test  -tAc "select count(*) from users"
  psql -d postgres -c "DROP DATABASE restore_test"'
kubectl delete pod -n portal restore-test
```

**Tiêu chí đạt:** hai con số đếm bản ghi bằng nhau.

### 11.4. Khôi phục thật khi mất dữ liệu

1. Tạm tắt auto-sync của ArgoCD cho app `portal` (nếu không, `selfHeal` sẽ bật lại academic-api ngay).
2. Dừng ứng dụng ghi vào DB: `kubectl scale -n portal deploy/academic-api --replicas=0`.
3. Dùng Pod tạm như mục 11.3: `DROP DATABASE school_portal`, `CREATE DATABASE school_portal`, nạp file backup.
4. `kubectl scale -n portal deploy/academic-api --replicas=1`, bật lại auto-sync.
5. Kiểm tra đăng nhập trên `https://lumina.synnie.dev`.

**RPO / RTO:** tối đa mất dữ liệu 24 giờ (RPO ≈ 24h, do sao lưu hằng đêm); thời gian khôi phục vài phút với dữ liệu hiện tại (RTO ≈ 5–10 phút).

---

## 12. KỊCH BẢN KIỂM THỬ NGHIỆM THU TRÊN KUBERNETES

*Ba kịch bản đầu là KT1–KT3 của đề, thực hiện lại trên Kubernetes. Các kịch bản sau chứng minh những tính năng chỉ có ở phần mở rộng.*

**Chuẩn bị chung:** khi cần làm hỏng có chủ đích, phải tạm tắt auto-sync của ArgoCD (vì `selfHeal` sẽ sửa lại gần như tức thì):

```bash
# Tắt auto-sync
kubectl patch application portal -n argocd --type merge -p '{"spec":{"syncPolicy":{"automated":null}}}'
# Bật lại sau khi test xong (áp dụng lại file gốc)
kubectl apply -f argocd/portal.yaml
```

| Mã test | Kịch bản thực hiện | Kết quả mong đợi | Bằng chứng cần nộp |
| :--- | :--- | :--- | :--- |
| **KT1-K8s** | **Truy cập & tải tài liệu:** Từ một máy bất kỳ có Internet mở `https://lumina.synnie.dev`, xem trang chủ, tải `https://lumina.synnie.dev/tai-lieu/thong-bao-mau.txt`. Song song: `kubectl logs -n portal deploy/frontend --tail=20`. | Trang hiển thị đúng, ổ khoá HTTPS hợp lệ; file tải nguyên vẹn; log nginx ghi `GET /tai-lieu/thong-bao-mau.txt ... 200`. | Ảnh trình duyệt (kèm thông tin chứng chỉ); dòng log tương ứng (hoặc truy vấn Loki `{app="frontend"} \|= "tai-lieu"`). |
| **KT2-K8s** | **Phân biệt lỗi DNS và dịch vụ dừng:** (1) Gõ sai domain, vd `lumina-sai.synnie.dev`, hoặc trỏ domain về IP không tồn tại trong file hosts của client. (2) Trả lại đúng, tắt auto-sync rồi dừng dịch vụ: `kubectl scale -n portal deploy/frontend deploy/portal --replicas=0`, truy cập lại. Cuối cùng scale về 2 và bật lại auto-sync. | TH1: trình duyệt báo `DNS_PROBE_FINISHED_NXDOMAIN` (hoặc timeout khi trỏ IP sai); `nslookup` không ra IP / ra IP sai. TH2: `nslookup` vẫn ra IP Cloudflare, TLS vẫn bắt tay thành công, nhưng `curl -I` nhận **HTTP 503 Service Unavailable** (Traefik không còn Pod nào phía sau – `kubectl get endpoints -n portal` rỗng). | Bảng so sánh 2 trường hợp; ảnh `nslookup`, `curl -Iv` cả 2 trường hợp; ảnh `kubectl get pods,endpoints -n portal`. Bonus: ảnh tin nhắn Slack `PortalServiceDown` sau 2 phút. |
| **KT3-K8s** | **Sao lưu & khôi phục CSDL:** Chạy backup tay (mục 11.2), sau đó thực hiện quy trình khôi phục vào DB tạm (mục 11.3). | Log Job: `Đã tạo /backup/portal-....sql.gz`; số bản ghi `users` của DB thật và bản khôi phục bằng nhau. | Ảnh log Job backup; ảnh `ls -lh /backup`; ảnh kết quả 2 con số. |
| **KT4** | **Tự phục hồi khi Pod chết:** `kubectl delete pod -n portal -l app.kubernetes.io/name=portal --wait=false` rồi `kubectl get pods -n portal -w`; trong lúc đó chạy vòng lặp `curl` tới `/api/v1/health`. | Pod mới được tạo lại trong vài giây; Deployment trở về 2/2. | Ảnh `get pods -w` (Pod cũ Terminating, Pod mới Running); ảnh kết quả vòng `curl`. |
| **KT5** | **Cập nhật không gián đoạn:** Chạy liên tục `while true; do curl -s -o /dev/null -w '%{http_code}\n' https://lumina.synnie.dev/api/v1/health; sleep 0.5; done`, đồng thời `kubectl rollout restart -n portal deploy/portal`. | Mọi dòng là `200`, không có `502/503`; `kubectl rollout status` báo thành công. | Ảnh vòng `curl` + ảnh `rollout status`. |
| **KT6** | **Tường lửa giữa các Pod:** (a) `kubectl exec -n portal deploy/portal -- wget -qO- -T 3 https://example.com` (b) `kubectl exec -n portal deploy/frontend -- wget -qO- -T 3 http://academic-api:8081/api/v1/health` (c) `kubectl exec -n portal deploy/portal -- wget -qO- -T 3 http://academic-api:8081/api/v1/health` | (a) timeout – Pod không ra được Internet. (b) timeout – frontend không được gọi Academic. (c) trả `{"status":"ok",...}` – đường được phép. | Ảnh 3 lệnh và kết quả. |
| **KT7** | **Quyền tiến trình & hệ thống file chỉ đọc:** `kubectl exec -n portal deploy/portal -- id` và `kubectl exec -n portal deploy/portal -- touch /app/hack` | `uid=1000(node) gid=1000(node)`; `touch: /app/hack: Read-only file system`. | Ảnh 2 lệnh. |
| **KT8** | **Giới hạn tài nguyên & giám sát:** `kubectl top pods -n portal`; bắn tải `ab -n 2000 -c 50 https://lumina.synnie.dev/` (hoặc `wrk`) và quan sát Grafana. | RPS, độ trễ trung bình; CPU/RAM các Pod tăng nhưng không vượt `limits`; không Pod nào restart. | Bảng số liệu `ab`; ảnh biểu đồ Grafana trong lúc bắn tải. |
| **KT9** | **GitOps chống sửa tay:** `kubectl scale -n portal deploy/frontend --replicas=5` (auto-sync đang bật). | Trong vài giây ArgoCD đưa về `replicas: 2` như trong Git; giao diện ArgoCD hiện sự kiện sync. | Ảnh `get deploy -w`; ảnh giao diện ArgoCD. |
| **KT10** | **Cảnh báo về Slack:** Gửi cảnh báo thử (mục 13) hoặc dùng cảnh báo phát sinh từ KT2. | Tin 🟡/🔴 xuất hiện ở kênh `#alert`, sau đó có tin ✅ RESOLVED. | Ảnh kênh Slack. |

**Bảng so sánh KT2 (điền khi thực hiện):**

| Tiêu chí | TH1 – Lỗi DNS | TH2 – Dịch vụ dừng |
|---|---|---|
| `nslookup lumina.synnie.dev` | ............ | ............ |
| `ping` | ............ | ............ |
| Bắt tay TLS (`curl -Iv`) | ............ | ............ |
| Mã HTTP | ............ | ............ |
| Thông báo trình duyệt | ............ | ............ |
| Tầng OSI gây lỗi | Tầng ứng dụng – dịch vụ DNS | Tầng ứng dụng – dịch vụ web (mạng, TLS vẫn thông) |

**Ảnh minh chứng:** *[chèn ảnh theo thứ tự KT1-K8s → KT10]*

---

## 13. BẢNG LỆNH VẬN HÀNH NHANH

| Muốn biết / làm | Lệnh |
|---|---|
| Các Pod có chạy không | `kubectl get pods -n portal` |
| Toàn bộ tài nguyên của hệ thống | `kubectl get all,ingress,pvc,networkpolicy -n portal` |
| Vì sao Pod lỗi | `kubectl describe pod -n portal <tên-pod>` (xem phần Events) |
| Log một dịch vụ | `kubectl logs -n portal deploy/portal` (thêm `--previous` để xem log trước lần restart) |
| CPU/RAM | `kubectl top pods -n portal` |
| Service đang trỏ tới Pod nào | `kubectl get endpoints -n portal` |
| Ingress đã nhận domain chưa | `kubectl get ingress -n portal` |
| Secret đã giải mã chưa | `kubectl get secret -n portal portal-secrets` |
| Lịch sử phiên bản / quay lui | `kubectl rollout history -n portal deploy/portal` / `kubectl rollout undo -n portal deploy/portal` (sau đó revert trong Git để ArgoCD không ghi đè) |
| Trạng thái đồng bộ GitOps | `kubectl get applications -n argocd` |
| Ép ArgoCD kiểm tra Git ngay | `kubectl annotate application portal -n argocd argocd.argoproj.io/refresh=normal --overwrite` |
| Tạo tài khoản demo | `kubectl exec -n portal deploy/academic-api -- node dist/database/seed.js` |
| Truy cập thử không qua domain | `kubectl port-forward -n portal svc/frontend 9000:8080` |
| Xem YAML cuối cùng | `kubectl kustomize apps/portal` |
| Backup tay | `kubectl create job -n portal --from=cronjob/postgres-backup backup-tay-$(date +%s)` |
| Gửi cảnh báo thử | `kubectl port-forward -n monitoring svc/monitoring-kube-prometheus-alertmanager 9093:9093` rồi `curl -XPOST -H 'Content-Type: application/json' localhost:9093/api/v2/alerts -d '[{"labels":{"alertname":"ThuNghiem","severity":"warning"},"annotations":{"summary":"Tin thử"}}]'` |

---

## 14. CÂU HỎI VẤN ĐÁP BẢO VỆ BỔ SUNG

### Câu 1: *"Vì sao không dùng Nginx trên một máy như đề yêu cầu mà lại dùng Kubernetes?"*
Phần bắt buộc nhóm vẫn làm đúng mô hình Nginx (báo cáo chính). Kubernetes là phần mở rộng nhằm giải quyết các vấn đề vận hành mà mô hình một máy không xử lý được: tự phục hồi khi tiến trình chết/treo, cập nhật không gián đoạn, tường lửa mịn giữa các dịch vụ, cấu hình nằm trong Git có thể truy vết và dựng lại. Bản chất các khái niệm của đề vẫn còn nguyên: Traefik đóng vai Nginx reverse proxy, Ingress là VirtualHost, NetworkPolicy là firewall, CronJob là cron, securityContext là phân quyền tiến trình.

### Câu 2: *"Nếu một Pod bị chết thì chuyện gì xảy ra?"*
Deployment controller phát hiện số Pod thực tế (1) ít hơn mong muốn (2) và tạo ngay Pod mới. Trong lúc đó Service chỉ gửi request tới Pod còn sống (do Pod chết không còn Ready). Người dùng không thấy lỗi. Nếu Pod không chết mà **bị treo**, livenessProbe thất bại 3 lần liên tiếp (30 giây) thì kubelet giết và khởi động lại container. Nếu Pod restart quá 3 lần/15 phút, cảnh báo `PortalPodCrashLooping` được gửi về Slack.

### Câu 3: *"readinessProbe và livenessProbe khác nhau thế nào? Vì sao cần startupProbe?"*
Readiness hỏi "sẵn sàng nhận khách chưa" – thất bại thì chỉ rút khỏi Service, không giết. Liveness hỏi "còn sống không" – thất bại thì giết và tạo lại. StartupProbe cho ứng dụng tối đa 60 giây để khởi động (kết nối DB, tạo bảng) trước khi liveness bắt đầu kiểm tra; nếu không có nó, ứng dụng khởi động chậm có thể bị liveness giết liên tục, rơi vào vòng lặp khởi động lại.

### Câu 4: *"Vì sao PostgreSQL dùng StatefulSet mà không dùng Deployment?"*
CSDL cần danh tính ổn định và ổ đĩa gắn chặt. StatefulSet đảm bảo Pod luôn tên `postgres-0` và luôn gắn PVC `data-postgres-0`; xoá Pod rồi tạo lại vẫn gắn đúng ổ cũ nên không mất dữ liệu. Deployment coi các Pod là giống hệt và thay thế được cho nhau, có thể tạm thời có 2 Pod cùng gắn một ổ trong lúc rolling update – nguy hiểm cho CSDL.

### Câu 5: *"Mật khẩu CSDL nằm ở đâu? Đưa lên GitHub có lộ không?"*
Trên Git chỉ có bản **đã mã hoá bằng khoá công khai** của sealed-secrets-controller. Chỉ controller trong cluster có khoá riêng để giải mã ra Secret thật. Bản mã hoá còn gắn với tên và namespace, không đem đi nơi khác giải mã được. Giá trị gốc được sinh ngẫu nhiên bằng `openssl rand` và chỉ lưu ngoài repo với quyền 600.

### Câu 6: *"Ping thành công nhưng website không mở được – trên Kubernetes kiểm tra gì?"*
Bổ sung cho câu hỏi ở mục 5 báo cáo chính. Kiểm tra theo chiều request đi vào:

1. **Pod:** `kubectl get pods -n portal` – có `Running` và `READY 1/1` không? Nếu `CrashLoopBackOff` → `kubectl logs --previous`; nếu `ImagePullBackOff` → kiểm tra tag image và Secret `ghcr-pull`; nếu `Pending` → thiếu tài nguyên/ResourceQuota (`kubectl describe pod`).
2. **Service/Endpoints:** `kubectl get endpoints -n portal portal` – rỗng nghĩa là không Pod nào Ready hoặc selector sai nhãn.
3. **Ingress:** `kubectl get ingress -n portal` – host đúng `lumina.synnie.dev`? Path đúng? Log Traefik: `kubectl logs -n kube-system deploy/traefik`.
4. **NetworkPolicy:** có luật cho Traefik vào cổng 8080 không? Có mở DNS cổng 53 cho chiều ra không? Thử `kubectl exec` gọi trực tiếp giữa các Pod.
5. **Tunnel:** `kubectl logs -n cloudflared deploy/cloudflared` – đường hầm còn kết nối không? (Cloudflare báo lỗi 1033 khi tunnel mất kết nối, 502 khi tunnel không tới được Traefik.)
6. **Gọi thẳng bỏ qua Ingress:** `kubectl port-forward -n portal svc/portal 8080:8080` rồi `curl localhost:8080/api/v1/health` – được thì lỗi nằm ở Ingress/tunnel, không được thì lỗi ở ứng dụng.

### Câu 7: *"Nếu cả máy chủ (node) bị tắt thì sao?"*
Cụm hiện có 1 node nên website sẽ ngừng hoạt động – đây là hạn chế đã nêu ở mục 15. Khi bật lại, K3s tự khởi động mọi Pod theo đúng trạng thái trong Git, dữ liệu Postgres còn nguyên trên PVC. Smoke test và cảnh báo sẽ báo khi website không trả lời. Muốn khắc phục hoàn toàn cần cụm nhiều node và lưu trữ phân tán.

### Câu 8: *"Làm sao biết cluster đang chạy phiên bản code nào?"*
Tag image có dạng `sha-<mã commit>`. Xem `apps/portal/kustomization.yaml` trong repo Infra hoặc `kubectl get deploy -n portal -o wide`. Mỗi commit tự động trong Infra còn ghi kèm đường dẫn tới lần chạy workflow đã tạo ra nó. Có thể xác minh image bằng chữ ký cosign.

---

## 15. HẠN CHẾ VÀ HƯỚNG PHÁT TRIỂN

| Hạn chế hiện tại | Hướng khắc phục |
|---|---|
| Cụm **1 node** (k3d trên máy nhà) → vẫn còn điểm lỗi đơn ở mức phần cứng | Cụm K3s 3 node, lưu trữ phân tán (Longhorn) |
| Bản sao lưu nằm **cùng máy** với CSDL | Đẩy thêm bản sao ra ngoài (Cloudflare R2 / S3) theo quy tắc 3-2-1 |
| `academic-api` còn chạy `NODE_ENV=development` + `DB_SYNCHRONIZE=true` (chưa có migration) | Viết TypeORM migration, chuyển `production` |
| Frontend còn dùng dữ liệu mẫu, chưa gọi API thật | Nối `frontend/src/api` với `/api/v1/portal/...` |
| `academic-api` chỉ 1 bản do bộ đếm rate-limit trong RAM | Chuyển bộ đếm sang Redis, rồi bật HorizontalPodAutoscaler |
| Chưa kiểm tra từ bên ngoài cụm | Thêm `blackbox-exporter` để Prometheus gọi thử `https://lumina.synnie.dev` mỗi phút |
| Postgres chưa ép chạy non-root từ đầu | Áp dụng khi dựng CSDL mới (đổi quyền PVC an toàn) |
| Chưa kiểm tra chữ ký image khi triển khai | Thêm admission policy (Kyverno/Sigstore policy-controller) chỉ cho chạy image đã ký |

---

## 16. PHỤ LỤC

### 16.1. Cấu trúc thư mục hạ tầng (repo Infra)

```text
infra/
├── apps/
│   ├── portal/                    # Hệ thống website trường học (namespace portal)
│   │   ├── kustomization.yaml     # mục lục: gom file, đặt namespace, tag image (CI tự ghi)
│   │   ├── namespace.yaml
│   │   ├── frontend.yaml          # Deployment + Service: nginx phục vụ React (2 bản)
│   │   ├── portal.yaml            # Deployment + Service: API cổng vào (2 bản)
│   │   ├── academic-api.yaml      # Deployment + Service: đăng nhập, phân quyền
│   │   ├── finance-api.yaml       # Deployment + Service: học phí
│   │   ├── postgres.yaml          # StatefulSet + Service: CSDL
│   │   ├── postgres-backup.yaml   # CronJob + PVC: sao lưu hằng đêm
│   │   ├── ingress.yaml           # lumina.synnie.dev: /api/v1 → portal, / → frontend
│   │   ├── network-policy.yaml    # tường lửa giữa các Pod
│   │   ├── policies.yaml          # PodDisruptionBudget, ResourceQuota, LimitRange
│   │   ├── alerts.yaml            # PrometheusRule: 9 luật cảnh báo
│   │   ├── sealed-secret.yaml     # mật khẩu đã mã hoá
│   │   ├── sealed-ghcr-pull.yaml  # chìa khoá tải image đã mã hoá
│   │   └── secrets.env.example    # mẫu tên khoá bí mật (giá trị giả)
│   ├── cloudflared/               # Cloudflare Tunnel
│   └── monitoring-secrets/        # webhook Slack đã mã hoá
├── argocd/                        # Khai báo ArgoCD Application (áp dụng 1 lần để khởi tạo)
│   ├── portal.yaml  cloudflared.yaml  monitoring.yaml  loki.yaml  alloy.yaml  ingress.yaml
└── docs/
    ├── 03-deploy-school-portal.md          # nhật ký triển khai lần đầu
    └── 04-portal-production-hardening.md   # nhật ký siết bảo mật, backup, log, cảnh báo
```

### 16.2. Công nghệ và phiên bản

| Thành phần | Phiên bản / ghi chú |
|---|---|
| Kubernetes | K3s (chạy bằng k3d), Traefik, CoreDNS, local-path-provisioner, metrics-server có sẵn |
| GitOps | ArgoCD |
| Quản lý bí mật | Bitnami Sealed Secrets |
| Ứng dụng | React 19 + Vite (nginx-unprivileged 1.27), NestJS (Node 22), PostgreSQL 17 |
| Giám sát | kube-prometheus-stack 93.2.2, Loki 7.6.0 (SingleBinary), Alloy 1.16.0 |
| Đường vào | Cloudflare Tunnel (cloudflared 2026.10.7) |
| CI/CD | GitHub Actions, GHCR, Trivy, cosign |

### 16.3. Nhật ký các giai đoạn triển khai

| Giai đoạn | Nội dung |
|---|---|
| 1 | Viết Dockerfile frontend, build 4 image, nạp vào cụm bằng `k3d image import` |
| 2 | Dịch `docker-compose.yml` sang manifest Kubernetes (`apps/portal/`) |
| 3 | Tạo SealedSecret, ArgoCD Application, deploy lần đầu, seed tài khoản demo |
| 4 | Mở domain `lumina.synnie.dev` qua Cloudflare Tunnel |
| 5 | CI/CD: tự build, quét, ký và đẩy image lên GHCR, tự cập nhật tag trong Infra |
| 6 | Siết production: NetworkPolicy chặn mặc định, securityContext đầy đủ, 2 bản + PDB, ResourceQuota |
| 7 | Sao lưu hằng đêm + thử khôi phục; Loki + Alloy; 9 luật cảnh báo; Alertmanager → Slack |
