#!/usr/bin/env bash
set -euo pipefail

# Quét secret (mật khẩu, token, private key...) trong TOÀN BỘ lịch sử git, không chỉ HEAD:
# secret đã commit rồi xoá ở commit sau vẫn còn trong lịch sử, vẫn bị lộ.
# Cấu hình bỏ qua (file .env.example, SealedSecret...) ở .gitleaks.toml.
# Trên CI cần checkout với fetch-depth: 0 để có đủ lịch sử.

ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
GITLEAKS_IMAGE="${GITLEAKS_IMAGE:-ghcr.io/gitleaks/gitleaks:v8.30.1}"
REPORT_DIR="${REPORT_DIR:-$ROOT/ci-reports}"
mkdir -p "$REPORT_DIR"

# Thư mục repo mount vào container thuộc user khác -> git báo "dubious ownership". Tin mọi thư mục cho riêng lệnh này.
docker run --rm \
  -v "$ROOT":/repo \
  -v "$REPORT_DIR":/reports \
  -e GIT_CONFIG_COUNT=1 -e GIT_CONFIG_KEY_0=safe.directory -e GIT_CONFIG_VALUE_0='*' \
  "$GITLEAKS_IMAGE" git /repo \
  --config /repo/.gitleaks.toml \
  --redact \
  --verbose \
  --report-format sarif \
  --report-path /reports/gitleaks.sarif \
  --exit-code 1
