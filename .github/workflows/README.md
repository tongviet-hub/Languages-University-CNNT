# CI/CD: `.github/workflows/`

Logic thật nằm trong [`ci/*.sh`](../../ci), còn file `.yml` chỉ khai báo trigger rồi gọi script.
**Muốn đổi hành vi thì sửa script, không sửa YAML.** Toàn bộ CI chạy được ngay trên máy cá nhân:

```bash
bash ci/start-ci.sh                 # tất cả thành phần
bash ci/start-ci.sh portal frontend # chỉ vài thành phần
```

## Luồng tổng thể

```
 PR / push main
      │
      ▼
 ┌──────────────── CI (ci.yml) ────────────────┐
 │ changes ─► build-test ─► docker-build        │   chỉ chạy cho thành phần bị sửa
 │ security (song song, không chặn)             │
 │ ci-ok  (check tổng cho branch protection)    │
 └──────────────────────┬──────────────────────┘
                        │ xanh + là push lên main
                        ▼
 ┌──────────────── CD (cd.yml) ────────────────┐
 │ build-and-push: build ─► Trivy ─► push GHCR  │
 │                 (SBOM + provenance) ─► cosign│
 │ update-infra:   sửa tag trong repo Infra     │   environment: production
 │ smoke-test:     chờ lumina.synnie.dev OK     │
 └──────────────────────┬──────────────────────┘
                        ▼
        ArgoCD thấy commit mới trong Infra ─► cập nhật cluster
```

## CI (`ci.yml`): chạy trên mọi PR và push lên `main`

| Job | Việc | Lỗi thì sao |
|---|---|---|
| `changes` | Xem thành phần nào bị sửa (`frontend`, `portal`, `academic-api`, `finance-api`). Sửa `ci/` hoặc `ci.yml` thì tính là sửa tất cả | – |
| `build-test` | `ci/build-test.sh`: `npm ci` → lint → typecheck → test → build. academic-api test trên PostgreSQL 17 thật (service container) | **chặn** |
| `docker-build` | Build thử Dockerfile (không push) → `ci/scan-image.sh` (Trivy) | **chặn** khi có lỗ hổng CRITICAL đã có bản vá |
| `security` | `ci/scan-secrets.sh` (Gitleaks, cả lịch sử git) + `ci/scan-deps.sh` (npm audit + Trivy fs: thư viện, Dockerfile) → SARIF lên tab Security, báo cáo ở Artifacts | không chặn (chỉ cảnh báo) |
| `ci-ok` | Gom kết quả, chỉ fail khi có job `failure`/`cancelled` | dùng làm Required check |

**Chặn** = CI đỏ, PR không merge được, CD không chạy. **Không chặn** = chỉ cảnh báo vàng, vẫn chạy tiếp.

## CD (`cd.yml`): chỉ chạy khi CI xanh trên `main`

| Job | Việc |
|---|---|
| `build-and-push` | Build 4 image → Trivy quét trước khi push → push `ghcr.io/<owner>/<image>:sha-<commit>` kèm SBOM + provenance → ký bằng cosign keyless |
| `update-infra` | Sửa `newTag` trong `Synnie-studio/Infra/apps/portal/kustomization.yaml` (retry khi bị chen commit) |
| `smoke-test` | Gọi `https://lumina.synnie.dev/` và `/api/v1/health` tối đa 10 phút (không chặn) |

Chạy tay: **Actions → CD → Run workflow** (chỉ trên `main`, bỏ qua CI, chỉ dùng khi khẩn cấp).

**Rollback:** `git revert <commit ci(portal)>` trong repo Infra rồi push, ArgoCD sẽ đưa image cũ trở lại.

**Kiểm tra chữ ký image:**
```bash
cosign verify ghcr.io/tongviet-hub/portal-portal:sha-<commit> \
  --certificate-identity-regexp 'https://github.com/tongviet-hub/Languages-University-Portal/' \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com
```

## Secrets & cài đặt repo

| Loại | Tên | Ý nghĩa |
|---|---|---|
| Secret | `INFRA_DEPLOY_KEY` | Private key SSH; public key tương ứng là Deploy key **có quyền ghi** của repo `Synnie-studio/Infra` |
| (tự có) | `GITHUB_TOKEN` | Đẩy image lên GHCR, không cần tạo |
| Environment | `production` | Tự tạo ở lần deploy đầu. Muốn duyệt tay trước khi deploy: Settings → Environments → production → Required reviewers |

**Branch protection** cho `main` (Settings → Branches → Add rule):
- Require a pull request before merging
- Require status checks to pass → chọn **`CI OK`**
- Require branches to be up to date before merging

## Ghi chú bảo mật

- Action bên thứ ba (`docker/*`, `dorny/*`, `sigstore/*`, `webfactory/*`) được ghim theo **commit SHA**, vì tag có thể bị ghi đè. Action của GitHub (`actions/*`, `github/*`) dùng tag major.
- Mỗi job chỉ xin quyền tối thiểu (`permissions:`).
- Gitleaks bỏ qua `.env.example` và `package-lock.json` (xem `.gitleaks.toml`).
- Trivy và Gitleaks chạy bằng Docker image ghim phiên bản (`aquasec/trivy:0.76.2`, `ghcr.io/gitleaks/gitleaks:v8.30.1`).
