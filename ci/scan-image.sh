#!/usr/bin/env bash
set -euo pipefail

# Quét lỗ hổng của một image ĐÃ BUILD (gồm cả hệ điều hành Alpine + node_modules bên trong).
# Dùng: bash ci/scan-image.sh <image-ref>
# Fail khi có lỗ hổng CRITICAL đã có bản vá -> CI đỏ / CD dừng, không deploy image đó.
# Lỗ hổng chưa có bản vá (--ignore-unfixed) thì không chặn được gì, chỉ làm nhiễu.

IMAGE_REF="${1:?Cần image, vd ghcr.io/tongviet-hub/portal-portal:sha-...}"
TRIVY_IMAGE="${TRIVY_IMAGE:-aquasec/trivy:0.76.2}"
FAIL_ON="${TRIVY_FAIL_ON:-CRITICAL}"

# Đọc image qua Docker socket của máy chạy (image vừa build/pull nằm ở đó), không cần đăng nhập registry lần nữa.
run_trivy() {
  docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v trivy-cache:/root/.cache/trivy \
    "$TRIVY_IMAGE" image --scanners vuln --ignore-unfixed "$@" "$IMAGE_REF"
}

# Bảng đầy đủ HIGH + CRITICAL để đọc trong log, không làm fail
run_trivy --severity HIGH,CRITICAL --format table --exit-code 0
# Cổng chặn: chỉ CRITICAL
run_trivy --severity "$FAIL_ON" --format table --exit-code 1 --quiet
