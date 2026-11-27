#!/usr/bin/env bash
set -euo pipefail

# Quét lỗ hổng thư viện + cấu hình sai, không cần build:
#   1. npm audit từng thành phần (chỉ dependency chạy production, mức HIGH trở lên)
#   2. Trivy filesystem: lỗ hổng trong package-lock.json + misconfig Dockerfile (chạy root, thiếu HEALTHCHECK...)
# Trả mã lỗi != 0 nếu có phát hiện, nhưng trên CI bước này KHÔNG chặn (continue-on-error).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRIVY_IMAGE="${TRIVY_IMAGE:-aquasec/trivy:0.76.2}"
SEVERITY="${TRIVY_SEVERITY:-CRITICAL,HIGH}"
REPORT_DIR="${REPORT_DIR:-$ROOT/ci-reports}"
mkdir -p "$REPORT_DIR"

status=0

for dir in frontend backend/portal backend/academic-api backend/finance-api; do
  echo "==> npm audit: $dir"
  (cd "$ROOT/$dir" && npm audit --omit=dev --audit-level=high) || status=1
done

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "==> trivy fs (vuln + misconfig)"
  docker run --rm \
    -v "$ROOT":/src:ro \
    -v "$REPORT_DIR":/reports \
    -v trivy-cache:/root/.cache/trivy \
    "$TRIVY_IMAGE" fs /src \
    --scanners vuln,misconfig \
    --severity "$SEVERITY" \
    --skip-dirs node_modules --skip-dirs '**/node_modules' --skip-dirs '**/dist' \
    --format sarif --output /reports/trivy-fs.sarif \
    --exit-code 1 || status=1
  # In thêm bảng dễ đọc ra log (bản SARIF ở trên dành cho tab Security của GitHub)
  docker run --rm -v "$ROOT":/src:ro -v trivy-cache:/root/.cache/trivy \
    "$TRIVY_IMAGE" fs /src --scanners vuln,misconfig --severity "$SEVERITY" \
    --skip-dirs node_modules --skip-dirs '**/node_modules' --skip-dirs '**/dist' --format table || true
else
  echo "==> trivy fs — SKIPPED (không có Docker)"
fi

exit "$status"
