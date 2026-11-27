#!/usr/bin/env bash
# Chạy toàn bộ CI ngay trên máy cá nhân, trước khi push. Thiếu công cụ (vd không có Docker)
# thì bước tương ứng bị SKIP chứ không fail. Cuối cùng in bảng tổng kết.
#   bash ci/start-ci.sh                 # tất cả thành phần
#   bash ci/start-ci.sh portal frontend # chỉ vài thành phần
# Test của academic-api cần PostgreSQL đang chạy theo backend/academic-api/.env.
set -uo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/.." && pwd)"

PASS=(); FAIL=(); SKIP=(); WARN=()
step() { local l="$1"; shift; echo; echo "==> $l"; if "$@"; then PASS+=("$l"); else FAIL+=("$l"); fi; }
skip() { echo; echo "==> $1 — SKIPPED ($2)"; SKIP+=("$1 ($2)"); }
soft_step() { local l="$1"; shift; echo; echo "==> $l (không chặn)"; if "$@"; then PASS+=("$l"); else WARN+=("$l"); fi; }

COMPONENTS=("$@")
((${#COMPONENTS[@]})) || COMPONENTS=(frontend portal academic-api finance-api)

for c in "${COMPONENTS[@]}"; do
  step "build-test $c" bash "$DIR/build-test.sh" "$c"
done

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  soft_step "scan-secrets" bash "$DIR/scan-secrets.sh"
  soft_step "scan-deps" bash "$DIR/scan-deps.sh"
  for c in "${COMPONENTS[@]}"; do
    ctx="$ROOT/backend/$c"; [[ "$c" == frontend ]] && ctx="$ROOT/frontend"
    ref="portal-$c:ci-local"
    step "docker-build $c" docker build -t "$ref" "$ctx"
    step "scan-image $c" bash "$DIR/scan-image.sh" "$ref"
  done
else
  skip "scan-secrets + docker-build + scan-image" "Docker chưa chạy"
  soft_step "scan-deps (chỉ npm audit)" bash "$DIR/scan-deps.sh"
fi

echo
echo "================ TỔNG KẾT ================"
echo "PASS (${#PASS[@]})"
((${#PASS[@]})) && printf '  \xe2\x9c\x93 %s\n' "${PASS[@]}"
echo "SKIP (${#SKIP[@]})"
((${#SKIP[@]})) && printf '  - %s\n' "${SKIP[@]}"
echo "WARN (${#WARN[@]})"
((${#WARN[@]})) && printf '  ! %s\n' "${WARN[@]}"
echo "FAIL (${#FAIL[@]})"
((${#FAIL[@]})) && printf '  \xe2\x9c\x97 %s\n' "${FAIL[@]}"

[[ ${#FAIL[@]} -eq 0 ]]
