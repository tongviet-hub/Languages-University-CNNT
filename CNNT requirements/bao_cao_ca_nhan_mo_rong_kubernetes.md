# BÁO CÁO CÁ NHÂN BÀI TẬP LỚN

*Phần mở rộng: Triển khai hệ thống website trường học trên Kubernetes (K3s) theo mô hình GitOps*

> Ghi chú khi chép sang file Word: các chỗ `[...]` và `......` là thông tin cậu phải tự điền hoặc tự xác nhận. Ngày giờ và mã commit trong báo cáo lấy từ lịch sử Git của hai repo, có thể kiểm tra lại bằng `git log`. Xoá dòng ghi chú này trước khi nộp.

---

## 1. Thông tin sinh viên và đề tài

| | |
|---|---|
| **Họ và tên** | Tống Việt |
| **Mã sinh viên và lớp** | ............................ / ............................ |
| **Nhóm và mã đề tài** | Nhóm ........ / Đề tài 05 |
| **Tên đề tài** | Phân tích và triển khai hệ thống website cho trường học |
| **Vai trò chính trong nhóm** | [vd: Phụ trách triển khai hạ tầng; thực hiện phần mở rộng Kubernetes] |
| **Thời gian thực hiện phần mở rộng** | từ 17/11/2026 đến 18/11/2026 (cụm K3s, ArgoCD, Cloudflare Tunnel, Prometheus đã được tôi dựng từ 11/11/2026 đến 13/11/2026 cho một dự án cá nhân và được dùng lại) |
| **Ngày nộp báo cáo** | ........................ |

## 2. Nhiệm vụ được giao và kết quả

Phần mở rộng do tôi đề xuất với giảng viên và được đồng ý cho làm thêm ngoài yêu cầu bắt buộc.

| Mã việc | Nhiệm vụ và sản phẩm phải bàn giao | Kết quả thực tế |
|---|---|---|
| CV01 | Đóng gói frontend và 3 dịch vụ backend thành Docker image chạy không cần root | Hoàn thành: `frontend/Dockerfile`, `frontend/nginx.conf`, `services/*/Dockerfile`; 4 image trên GHCR |
| CV02 | Chuyển hệ thống từ docker-compose sang manifest Kubernetes, triển khai lên cụm K3s qua ArgoCD, mở tên miền thật | Hoàn thành: thư mục `apps/portal/` trong repo hạ tầng, `argocd/portal.yaml`; website chạy tại `https://lumina.synnie.dev` |
| CV03 | Xây dựng pipeline CI/CD tự động: kiểm thử, build, quét lỗ hổng, ký image, cập nhật cụm | Hoàn thành: `.github/workflows/ci.yml`, `.github/workflows/cd.yml` |
| CV04 | Siết an toàn vận hành: tường lửa giữa các Pod, giới hạn quyền và tài nguyên, sao lưu tự động, log tập trung, cảnh báo | Hoàn thành: `network-policy.yaml`, `policies.yaml`, `postgres-backup.yaml`, `alerts.yaml`; Loki + Alloy; cảnh báo về Slack |

---

## 3. Trình bày công việc trực tiếp thực hiện

### 3.1. CV01 – Đóng gói ứng dụng thành Docker image

**Mục tiêu:** có image nhỏ gọn, chạy bằng user thường, để Kubernetes triển khai được.

**Môi trường thực hiện:** Docker [phiên bản ......], Node.js 22 (image `node:22-alpine`), nginx-unprivileged 1.27, hệ điều hành máy build: [......].

**Các bước đã thực hiện:**
1. Viết `frontend/Dockerfile` hai tầng: tầng `build` dùng `node:22-alpine` chạy `npm ci` và `npm run build`; tầng cuối dùng `nginxinc/nginx-unprivileged:1.27-alpine`, chỉ chép thư mục `dist/` và file `nginx.conf`.
2. Viết `frontend/nginx.conf`: nghe cổng 8080, `try_files $uri $uri/ /index.html` để các route của React hoạt động khi tải lại trang, cache 1 năm cho `/assets/`.
3. Viết Dockerfile hai tầng cho `services/portal`, `services/academic-api`, `services/finance-api`; sau khi build chạy `npm prune --omit=dev` và dùng `USER node`.
4. Build thử, ban đầu nạp image vào cụm bằng `k3d image import`; sau đó chuyển sang đẩy lên GHCR qua pipeline (CV03).

**Cấu hình hoặc quyết định quan trọng:**
- Build nhiều tầng: image frontend còn khoảng 80MB thay vì gần 1GB nếu giữ cả Node.js và `node_modules`.
- Chọn `nginx-unprivileged` và cổng 8080: tiến trình chạy uid 101, không cần quyền root để mở cổng dưới 1024. Đây là cách đáp ứng yêu cầu "web server không chạy root" của đề.
- Chép `package*.json` trước khi chép code để tận dụng cache của Docker.

**Kết quả và giới hạn:** 4 image chạy được trên cụm. Kích thước bản đầu: frontend ~80MB, portal ~367MB, academic ~413MB, finance ~265MB. Image backend còn khá lớn, chưa tối ưu thêm.

### 3.2. CV02 – Chuyển sang Kubernetes và triển khai lên cụm

**Mục tiêu:** chạy toàn bộ hệ thống trên Kubernetes, truy cập được từ Internet qua tên miền thật mà không sửa mã nguồn ứng dụng.

**Môi trường thực hiện:** cụm K3s 1 node chạy bằng k3d trên [máy/hệ điều hành ......]; ArgoCD; Bitnami Sealed Secrets; Cloudflare Tunnel (cloudflared 2026.10.7); tên miền `synnie.dev` quản lý trên Cloudflare. Cụm, ArgoCD và tunnel đã có sẵn từ dự án cá nhân của tôi (dựng ngày 11–13/11/2026); phần làm cho đề tài này là toàn bộ namespace `portal`.

**Các bước đã thực hiện:**
1. Đọc `docker-compose.yml` của nhóm và "dịch" từng dịch vụ sang manifest: `postgres` thành StatefulSet + PVC 2Gi; `portal`, `academic-api`, `finance-api`, `frontend` thành Deployment + Service.
2. Viết `ingress.yaml`: host `lumina.synnie.dev`, đường dẫn `/api/v1` sang Service `portal`, còn lại sang `frontend`.
3. Sinh mật khẩu DB và hai khoá JWT bằng `openssl rand`, lưu ngoài repo với quyền 600, mã hoá bằng `kubeseal` thành `sealed-secret.yaml`.
4. Tạo SealedSecret `ghcr-pull` để cụm tải được image private từ GHCR.
5. Gom tất cả bằng `kustomization.yaml`, tạo ArgoCD Application `portal` (bật `prune` và `selfHeal`) trỏ vào thư mục `apps/portal`.
6. Seed tài khoản demo bằng `kubectl exec -n portal deploy/academic-api -- node dist/database/seed.js`.
7. Thêm route `lumina.synnie.dev` vào Cloudflare Tunnel để mở website ra Internet.

Các commit tương ứng trong repo hạ tầng: `8842b59` (17/11 13:52, thêm manifest, SealedSecret, ArgoCD app), `69f0883` (17/11 13:56, đổi tên miền `lumina.synnie.dev`), `944eaa1` (17/11 14:34, thêm `ghcr-pull`).

**Cấu hình hoặc quyết định quan trọng:**
- **StatefulSet cho PostgreSQL:** Pod luôn tên `postgres-0` và luôn gắn đúng PVC `data-postgres-0`, xoá Pod tạo lại không mất dữ liệu.
- **Giữ nguyên tên dịch vụ** (`http://academic-api:8081`) như trong compose: Service + CoreDNS phân giải tên, nên mã nguồn không phải sửa.
- **`TRUST_PROXY=10.42.0.0/16`:** IP Pod thay đổi liên tục nhưng luôn trong dải Pod của K3s; an toàn vì NetworkPolicy chỉ cho Portal gọi Academic.
- **Cloudflare Tunnel thay vì mở cổng router:** máy chủ không có IP công khai; tunnel kết nối từ trong ra, Cloudflare lo HTTPS.
- **Tag image theo `sha-<commit>`** thay vì `latest`: biết chính xác cụm chạy commit nào, quay lui chính xác.

**Kết quả và giới hạn:** website chạy tại `https://lumina.synnie.dev`, đăng nhập được bằng tài khoản demo. Giới hạn: cụm chỉ 1 node; `academic-api` vẫn chạy `NODE_ENV=development` với `DB_SYNCHRONIZE=true` vì chưa có migration.

### 3.3. CV03 – Pipeline CI/CD và GitOps

**Mục tiêu:** push code lên `main` là website tự cập nhật, nhưng code chưa qua kiểm thử thì không được lên.

**Môi trường thực hiện:** GitHub Actions, GitHub Container Registry, Trivy, cosign (keyless, OIDC của GitHub), ArgoCD.

**Các bước đã thực hiện:**
1. Viết `ci.yml`: build, lint, test, quét dependency và kiểm tra bảo mật (script CI bổ sung ở commit `9016abe`, 17/11 21:49).
2. Viết `cd.yml` (cùng các Dockerfile ở commit `3f5fb95`, 17/11 14:34) chạy khi CI thành công trên `main` (sự kiện `workflow_run`), gồm 3 job:
    - `build-and-push`: build 4 image song song, Trivy quét (lỗ hổng CRITICAL thì dừng), đẩy lên GHCR kèm SBOM và provenance, cosign ký theo digest.
    - `update-infra`: dùng deploy key ghi tag `sha-<commit>` vào `apps/portal/kustomization.yaml` của repo hạ tầng.
    - `smoke-test`: chờ trang chủ trả 200 và `/api/v1/health` trả `"status":"ok"`, tối đa 10 phút.
3. ArgoCD thấy repo hạ tầng thay đổi thì tự áp dụng và rolling update.

Bằng chứng pipeline đã chạy thật: các commit tự động `72e179d`, `7263c2a`, `ad1b140` của `github-actions[bot]` trong repo hạ tầng (17/11/2026, 14:36 – 14:55 giờ Việt Nam), lần lượt cập nhật image lên `sha-3f5fb95`, `sha-47baf19`, `sha-83a14c3`.

**Cấu hình hoặc quyết định quan trọng:**
- **Mô hình pull:** CI chỉ có quyền ghi vào một repo Git, không giữ kubeconfig; quyền thay đổi cụm nằm trong cụm (ArgoCD). Lộ CI cũng không lộ quyền quản trị cụm.
- `concurrency: cd-production` để hai lần deploy không chồng lên nhau; `fail-fast: true` để một image hỏng thì dừng cả 4.

**Kết quả và giới hạn:** pipeline hoạt động từ đầu đến cuối. Giới hạn: chưa có chính sách trong cụm bắt buộc chỉ chạy image đã ký (mới ký, chưa kiểm tra khi triển khai).

### 3.4. CV04 – Siết an toàn vận hành, sao lưu, giám sát

**Mục tiêu:** hệ thống chịu được Pod chết, chặn tấn công lan rộng, có sao lưu tự động và báo lỗi về Slack.

**Môi trường thực hiện:** cụm K3s như CV02; kube-prometheus-stack 93.2.2; Loki 7.6.0 (SingleBinary); Alloy 1.16.0; Slack.

**Các bước đã thực hiện:**
1. Thêm `securityContext` cho mọi Deployment: `runAsNonRoot`, `readOnlyRootFilesystem` (kèm `emptyDir` cho `/tmp`), `capabilities.drop: [ALL]`, `allowPrivilegeEscalation: false`, `seccompProfile: RuntimeDefault`, `automountServiceAccountToken: false`.
2. Viết `network-policy.yaml`: bắt đầu bằng `default-deny-all` cho cả chiều vào và ra, sau đó mở từng đường cần thiết, kể cả DNS cổng 53.
3. Tăng `frontend` và `portal` lên 2 bản, rolling update `maxUnavailable: 0, maxSurge: 1`, thêm startup/readiness/liveness probe.
4. Viết `policies.yaml`: PodDisruptionBudget, ResourceQuota `portal-quota`, LimitRange `portal-defaults`.
5. Viết `postgres-backup.yaml`: CronJob `pg_dump` lúc 19:00 UTC (02:00 giờ Việt Nam), lưu vào PVC riêng, giữ 7 bản.
6. Cài Loki + Alloy để gom log mọi Pod; viết `alerts.yaml` gồm 9 luật cảnh báo; cấu hình Alertmanager gửi về kênh Slack `#alert`.

Các commit: `bdbb25f` (17/11 22:43, siết production, backup, cảnh báo, Loki + Alloy), `b865e92` (18/11 09:45, sửa luật `PortalPodNotReady`), `9b454aa` (18/11 10:00, Alertmanager gửi về Slack).

**Cấu hình hoặc quyết định quan trọng:**
- **Không đặt `limits.cpu`**, chỉ giới hạn RAM: tránh CPU throttling làm chậm phản hồi, còn thiếu RAM mới là thứ làm sập máy.
- **`academic-api` giữ 1 bản:** bộ đếm chống dò mật khẩu nằm trong RAM, chạy 2 bản thì giới hạn thực tế bị gấp đôi.
- **PostgreSQL là ngoại lệ về quyền:** image cần root lúc khởi động để `chown` thư mục dữ liệu rồi tự hạ xuống uid 70; tôi chỉ thêm seccomp và `allowPrivilegeEscalation: false`, không ép uid trên ổ đang có dữ liệu.
- **Có ResourceQuota thì phải có LimitRange:** nếu không, Pod quên khai báo `resources` sẽ bị từ chối tạo.
- **Loki thay vì Elasticsearch:** chỉ đánh chỉ mục theo nhãn, nhẹ, hợp cụm một máy.

**Kết quả và giới hạn:** các lớp bảo vệ và cảnh báo hoạt động (xem mục 5). Giới hạn: bản sao lưu nằm cùng máy với CSDL; chưa có kiểm tra website từ bên ngoài cụm.

---

## 4. Danh mục minh chứng

Đường dẫn `infra/...` là repo hạ tầng (thư mục `Synnie_infra`); đường dẫn còn lại là repo mã nguồn của nhóm. Ảnh chụp đặt trong thư mục `MinhChung/` của bài nộp.

| Mã | Nội dung chứng minh | Vị trí file hoặc thời điểm trong video |
|---|---|---|
| MC01 | Dockerfile nhiều tầng, nginx không chạy root (CV01) | `frontend/Dockerfile`, `frontend/nginx.conf`, `services/*/Dockerfile` |
| MC02 | Manifest Kubernetes của toàn hệ thống (CV02) | `infra/apps/portal/` (đặc biệt `portal.yaml`, `postgres.yaml`, `ingress.yaml`, `kustomization.yaml`) |
| MC03 | ArgoCD Application và lịch sử triển khai (CV02) | `infra/argocd/portal.yaml`; commit `8842b59`, `69f0883`, `944eaa1`; ảnh giao diện ArgoCD `MinhChung/MC03_argocd.png` |
| MC04 | Pipeline CI/CD và các lần chạy thật (CV03) | `.github/workflows/ci.yml`, `cd.yml`; commit tự động `72e179d`, `7263c2a`, `ad1b140`; ảnh tab Actions `MinhChung/MC04_actions.png` |
| MC05 | Tường lửa giữa các Pod, quyền tiến trình, giới hạn tài nguyên (CV04) | `infra/apps/portal/network-policy.yaml`, `policies.yaml`; commit `bdbb25f` |
| MC06 | Sao lưu tự động và cảnh báo (CV04) | `infra/apps/portal/postgres-backup.yaml`, `alerts.yaml`; commit `b865e92`, `9b454aa` |
| MC07 | Website chạy thật qua HTTPS | Ảnh trình duyệt `https://lumina.synnie.dev` kèm thông tin chứng chỉ: `MinhChung/MC07_website.png` |
| MC08 | Ảnh kết quả các ca kiểm thử ở mục 5 | `MinhChung/KT*.png` [hoặc video phút ...:... đến ...:...] |

---

## 5. Kết quả kiểm thử cá nhân

Tôi trực tiếp thực hiện toàn bộ các ca dưới đây trên cụm. Trước các ca cần làm hỏng có chủ đích, tôi tạm tắt auto-sync của ArgoCD (vì `selfHeal` sẽ sửa lại ngay), làm xong thì bật lại bằng `kubectl apply -f argocd/portal.yaml`.

### KT2-K8s – Phân biệt lỗi DNS và dịch vụ dừng (liên quan CV02)

**Điều kiện ban đầu và dữ liệu thử:** hệ thống chạy bình thường, `frontend` và `portal` mỗi dịch vụ 2/2 Pod.

**Thao tác kiểm tra:**
1. TH1: truy cập `lumina-sai.synnie.dev`, chạy `nslookup` và `curl -Iv`.
2. TH2: tắt auto-sync, `kubectl scale -n portal deploy/frontend deploy/portal --replicas=0`, chạy lại `nslookup`, `curl -Iv https://lumina.synnie.dev`, `kubectl get pods,endpoints -n portal`. Cuối cùng scale về 2 và bật lại auto-sync.

**Kết quả mong đợi:** TH1 báo `NXDOMAIN`, không có IP. TH2 vẫn ra IP Cloudflare, bắt tay TLS thành công nhưng nhận HTTP 503; endpoints rỗng; sau khoảng 2 phút Slack nhận `PortalServiceDown`.

**Kết quả thực tế:** TH1: ............................................. TH2: .............................................

**Kết luận:** ☐ Đạt ☐ Chưa đạt ☐ Chưa đủ bằng chứng
**Mã minh chứng kèm theo:** MC08 (`KT2_*.png`)

### KT3-K8s – Sao lưu và khôi phục CSDL (liên quan CV04)

**Điều kiện ban đầu và dữ liệu thử:** CSDL `school_portal` có các tài khoản demo đã seed.

**Thao tác kiểm tra:**
1. Chạy backup ngay: `kubectl create job -n portal --from=cronjob/postgres-backup backup-tay-$(date +%s)`, xem log Job và `ls -lh /backup`.
2. Tạo Pod tạm `restore-test`, nạp bản backup mới nhất vào CSDL tạm `restore_test`, so `select count(*) from users` giữa CSDL thật và bản khôi phục, rồi xoá CSDL tạm và Pod tạm.

**Kết quả mong đợi:** log Job ghi `Đã tạo /backup/portal-....sql.gz (... bytes)` với kích thước hợp lý (không phải ~20 bytes); hai con số đếm bằng nhau.

**Kết quả thực tế:** kích thước file: ........ ; số bản ghi DB thật: ........ ; bản khôi phục: ........

**Kết luận:** ☐ Đạt ☐ Chưa đạt ☐ Chưa đủ bằng chứng
**Mã minh chứng kèm theo:** MC08 (`KT3_*.png`)

### KT5 – Cập nhật không gián đoạn (liên quan CV04)

**Điều kiện ban đầu và dữ liệu thử:** `portal` đang chạy 2/2 Pod.

**Thao tác kiểm tra:** chạy vòng lặp `while true; do curl -s -o /dev/null -w '%{http_code}\n' https://lumina.synnie.dev/api/v1/health; sleep 0.5; done`, đồng thời `kubectl rollout restart -n portal deploy/portal` và `kubectl rollout status -n portal deploy/portal`.

**Kết quả mong đợi:** mọi dòng là `200`, không có `502/503`; rollout báo thành công.

**Kết quả thực tế:** tổng số request: ........ ; số request khác 200: ........ ; thời gian rollout: ........

**Kết luận:** ☐ Đạt ☐ Chưa đạt ☐ Chưa đủ bằng chứng
**Mã minh chứng kèm theo:** MC08 (`KT5_*.png`)

### KT6 – Tường lửa giữa các Pod (liên quan CV04)

**Điều kiện ban đầu và dữ liệu thử:** NetworkPolicy đã áp dụng.

**Thao tác kiểm tra:**
- (a) `kubectl exec -n portal deploy/portal -- wget -qO- -T 3 https://example.com`
- (b) `kubectl exec -n portal deploy/frontend -- wget -qO- -T 3 http://academic-api:8081/api/v1/health`
- (c) `kubectl exec -n portal deploy/portal -- wget -qO- -T 3 http://academic-api:8081/api/v1/health`

**Kết quả mong đợi:** (a) và (b) hết thời gian chờ (bị chặn); (c) trả `{"status":"ok",...}` (đường được phép).

**Kết quả thực tế:** (a) ............ (b) ............ (c) ............

**Kết luận:** ☐ Đạt ☐ Chưa đạt ☐ Chưa đủ bằng chứng
**Mã minh chứng kèm theo:** MC08 (`KT6_*.png`)

### Các ca còn lại

| Mã | Thao tác chính | Kết quả mong đợi | Kết quả thực tế | Kết luận | Minh chứng |
|---|---|---|---|---|---|
| KT1-K8s | Mở `https://lumina.synnie.dev`, tải `/tai-lieu/thong-bao-mau.txt`, xem log frontend | Trang hiển thị, HTTPS hợp lệ, log ghi `200` | ............ | ☐ Đạt ☐ Chưa đạt | `KT1_*.png` |
| KT4 | `kubectl delete pod -n portal -l app.kubernetes.io/name=portal --wait=false`, theo dõi `get pods -w` | Pod mới được tạo lại, trở về 2/2 | ............ | ☐ Đạt ☐ Chưa đạt | `KT4_*.png` |
| KT7 | `kubectl exec ... -- id` và `-- touch /app/hack` | `uid=1000(node)`; `Read-only file system` | ............ | ☐ Đạt ☐ Chưa đạt | `KT7_*.png` |
| KT8 | `ab -n 2000 -c 50 https://lumina.synnie.dev/`, xem Grafana | Không vượt limit, không restart | RPS: ...... ; độ trễ TB: ...... ms | ☐ Đạt ☐ Chưa đạt | `KT8_*.png` |
| KT9 | `kubectl scale -n portal deploy/frontend --replicas=5` khi auto-sync bật | ArgoCD đưa về 2 bản | ............ | ☐ Đạt ☐ Chưa đạt | `KT9_*.png` |
| KT10 | Gửi cảnh báo thử qua Alertmanager | Tin cảnh báo và tin RESOLVED trên Slack | ............ | ☐ Đạt ☐ Chưa đạt | `KT10_*.png` |

---

## 6. Một vấn đề đã gặp và cách xử lý

**Hiện tượng:** Job sao lưu báo trạng thái `Complete` (thành công), nhưng file `.sql.gz` tạo ra chỉ khoảng 20 bytes, tức là gần như rỗng. Nếu không để ý kích thước file thì tưởng đã có bản sao lưu.

**Nguyên nhân và căn cứ xác định:**
- *Đã kiểm chứng:* lệnh sao lưu ban đầu có dạng `pg_dump ... | gzip > file`. Trong shell, mã thoát của một chuỗi pipe là mã thoát của lệnh **cuối cùng** (`gzip`). `pg_dump` lỗi thì không ghi gì ra, `gzip` nén một luồng rỗng thành file ~20 bytes và vẫn thoát mã 0, nên Kubernetes coi Job thành công.
- *Nguyên nhân khiến `pg_dump` lỗi lúc đó:* Pod mới cần vài giây để NetworkPolicy áp luật, nên kết nối tới Postgres bị `Connection refused`. [Cậu xác nhận lại: đúng là lỗi kết nối, hay lỗi khác như sai mật khẩu?]

**Cách xử lý và kết quả kiểm tra lại:**
1. Thêm `set -o pipefail`: lệnh nào trong pipe lỗi thì cả pipe lỗi, Job sẽ báo `Failed`.
2. Đợi Postgres sẵn sàng bằng vòng `pg_isready` tối đa khoảng 60 giây trước khi dump.
3. Ghi ra file `.tmp`, kiểm tra bằng `gzip -t`, chỉ `mv` sang tên thật khi mọi bước thành công; `trap` xoá file tạm nếu lỗi giữa chừng.
4. Thêm cảnh báo `PortalBackupFailed` và `PortalBackupTooOld` (quá 26 giờ không có bản thành công) gửi về Slack.

Kiểm tra lại: chạy backup tay, file mới có kích thước ........ bytes; khôi phục thử vào CSDL tạm cho số bản ghi khớp (KT3-K8s).

**Bài học rút ra:** "thành công" theo mã thoát chưa chắc là thành công thật. Script sao lưu phải dùng `pipefail`, phải kiểm tra kết quả (kích thước, `gzip -t`), và bản sao lưu chỉ đáng tin khi đã khôi phục thử thành công.

---

## 7. Tiến độ và phối hợp

| Thời điểm | Công việc và sản phẩm đã tạo | Phối hợp hoặc bàn giao |
|---|---|---|
| 11/11 – 13/11/2026 | Dựng cụm K3s (k3d), ArgoCD, Sealed Secrets, Cloudflare Tunnel, Prometheus + Grafana (cho dự án cá nhân, dùng lại cho đề tài) | Tự làm |
| 17/11/2026 13:52 – 14:38 | Manifest `apps/portal/`, SealedSecret, ArgoCD app, tên miền `lumina.synnie.dev`, chìa khoá `ghcr-pull`; Dockerfile và workflow CD (`3f5fb95`, 14:34) | Tự làm; mã nguồn ứng dụng là của cả nhóm |
| 17/11/2026 14:36 – 14:55 | CD chạy thật 3 lần, tự cập nhật image `sha-3f5fb95` → `sha-47baf19` → `sha-83a14c3` | Tự động (github-actions) |
| 17/11/2026 21:49 | Bổ sung script CI: build, test, quét dependency, kiểm tra bảo mật (`9016abe`) | Tự làm |
| 17/11/2026 22:43 | Siết production: NetworkPolicy, securityContext, 2 bản + PDB, Quota, backup, Loki + Alloy, cảnh báo (`bdbb25f`) | Tự làm |
| 18/11/2026 09:45 – 10:00 | Sửa luật cảnh báo cho Job backup; Alertmanager gửi về Slack (`b865e92`, `9b454aa`) | Tự làm |
| ........ | Chạy các ca kiểm thử KT1–KT10, chụp minh chứng | [Tự làm / có bạn ...... hỗ trợ chụp ảnh, kiểm tra từ máy khác] |
| ........ | Viết mục 7 trong báo cáo chung | Bàn giao cho nhóm ghép vào báo cáo chung |

[Nếu có bạn trong nhóm hỗ trợ phần nào thì ghi rõ tên và phần hỗ trợ. Nếu không có, giữ "Tự làm".]

---

## 8. Hiểu hệ thống và tự đánh giá

**Phần việc của tôi liên kết với hệ thống chung như thế nào?**
- *Đầu vào:* mã nguồn frontend và backend của nhóm, file `docker-compose.yml` và các biến môi trường mà dịch vụ cần.
- *Đầu ra:* website chạy thật tại `https://lumina.synnie.dev`, tự cập nhật mỗi khi nhóm push lên `main`.
- *Phụ thuộc:* mọi Pod phụ thuộc vào Secret `portal-secrets` (giải mã từ SealedSecret) và DNS nội bộ (CoreDNS); đường vào phụ thuộc Cloudflare Tunnel và Traefik; nếu CI của nhóm đỏ thì CD không chạy.

**Kiến thức học phần đã vận dụng:**
- *Hệ điều hành:* tiến trình và user không đặc quyền (uid 101/1000), cgroups giới hạn RAM (vượt limit thì bị OOM-killer giết), namespaces cô lập container, capabilities và seccomp, hệ thống file chỉ đọc, cron (CronJob), mã thoát tiến trình và pipe (bài học ở mục 6).
- *Mạng máy tính:* DNS (Cloudflare bên ngoài, CoreDNS bên trong), reverse proxy và định tuyến theo host/đường dẫn (Ingress), cân bằng tải (Service, iptables), TLS 1.3, tường lửa theo cặp nguồn–đích–cổng (NetworkPolicy), NAT và lý do không cần mở cổng router khi dùng tunnel, phân biệt lỗi theo tầng (NXDOMAIN với HTTP 503).

**Điểm còn hạn chế và hướng cải thiện:**
- Cụm 1 node: hỏng máy là ngừng dịch vụ → cụm 3 node, lưu trữ phân tán.
- Bản sao lưu nằm cùng máy với CSDL → đẩy thêm bản ra Cloudflare R2/S3.
- `academic-api` chưa có migration và chỉ chạy 1 bản → viết migration, chuyển bộ đếm rate-limit sang Redis.
- Image đã ký nhưng cụm chưa kiểm tra chữ ký khi chạy → thêm admission policy.

**Nội dung tôi có thể giải thích và thao tác khi bảo vệ:**
- Giải thích luồng request từ trình duyệt đến PostgreSQL và vai trò Traefik/nginx.
- Xem trạng thái hệ thống: `kubectl get pods,svc,endpoints,ingress -n portal`, `kubectl top pods`, `kubectl logs`.
- Demo tự phục hồi (xoá Pod), rolling update không gián đoạn, GitOps sửa ngược thay đổi tay.
- Chứng minh tường lửa và quyền tiến trình bằng `kubectl exec` (KT6, KT7).
- Chạy backup tay và khôi phục thử; tra log trên Grafana bằng LogQL.

---

## 9. Nguồn tham khảo và công cụ hỗ trợ

**Tài liệu tham khảo:**
- Tài liệu chính thức: Kubernetes (kubernetes.io/docs), K3s (docs.k3s.io), ArgoCD, Bitnami Sealed Secrets, Cloudflare Tunnel, Grafana Loki/Alloy, kube-prometheus-stack.
- [Thêm bài viết, video hoặc mã mẫu khác cậu đã dùng, nếu có.]

**Công cụ AI:**
- Có sử dụng Claude (Anthropic) để: [cậu ghi đúng thực tế, ví dụ: giải thích khái niệm Kubernetes; gợi ý và rà soát cấu hình YAML; hỗ trợ viết tài liệu `docs/` trong repo hạ tầng; hỗ trợ soạn và trình bày báo cáo này].
- Phần tự làm và tự chỉnh sửa: [ví dụ: tự triển khai lên cụm, tự chạy và sửa lỗi khi chạy thật, tự chọn thông số tài nguyên, tự thực hiện kiểm thử].
- Cách kiểm chứng: mọi cấu hình đều được áp dụng lên cụm thật và kiểm tra bằng `kubectl` và các ca kiểm thử ở mục 5; số liệu trong báo cáo lấy từ kết quả chạy thật và lịch sử Git, không lấy từ AI.

---

## 10. Cam kết cá nhân

Tôi xác nhận nội dung báo cáo phản ánh đúng công việc mình thực hiện và sự hỗ trợ đã nhận. Tôi chịu trách nhiệm về số liệu, minh chứng và có thể giải thích phần việc đã kê khai.

Ngày ........ tháng ........ năm ........

Sinh viên ghi họ tên: .................................................................................

*Tên file gợi ý: Lop_Nhom_DeTai_MSSV_BaoCaoCaNhan.docx. Không đưa mật khẩu, khoá JWT, token hay nội dung file `portal-secrets.env` vào báo cáo hoặc ảnh minh chứng.*
