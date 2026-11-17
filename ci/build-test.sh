#!/usr/bin/env bash
set -euo pipefail

# Cài đặt sạch -> lint -> typecheck -> test -> build cho MỘT thành phần. Chặn merge nếu fail.
# Dùng: bash ci/build-test.sh <frontend|portal|academic-api|finance-api>
# Bước nào thành phần không có (vd finance-api chưa có test) thì bỏ qua, không fail.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="${1:?Cần tên thành phần: frontend | portal | academic-api | finance-api}"

case "$NAME" in
  frontend) DIR="$ROOT/frontend" ;;
  portal | academic-api | finance-api) DIR="$ROOT/services/$NAME" ;;
  *) echo "build-test: không biết thành phần '$NAME'" >&2; exit 2 ;;
esac
cd "$DIR"

has_script() { node -e "process.exit(require('./package.json').scripts?.['$1'] ? 0 : 1)"; }
# ::group:: là cú pháp gom log của GitHub Actions; chạy local thì chỉ là một dòng chữ.
section() { echo "::group::[$NAME] $1"; }
endsection() { echo "::endgroup::"; }

section "npm ci"
npm ci --no-audit --no-fund
endsection

if has_script lint; then
  section "lint"
  npm run lint
  endsection
fi

# Frontend: "npm run build" đã gồm "tsc -b" nên không typecheck riêng.
# Backend: typecheck cả src lẫn test (tsconfig.test.json) nếu có, để test hỏng kiểu cũng bị bắt.
if [[ "$NAME" != frontend ]]; then
  section "typecheck"
  if [[ -f tsconfig.test.json ]]; then
    npx tsc -p tsconfig.test.json --noEmit
  else
    npx tsc -p tsconfig.json --noEmit --incremental false
  fi
  endsection
fi

# Test e2e của academic-api đọc file .env (process.loadEnvFile) rồi tự tạo DB school_portal_test.
# Trên CI không có .env -> sinh từ biến môi trường của job (Postgres service container) + JWT ngẫu nhiên.
# Ở máy cá nhân giữ nguyên .env có sẵn của cậu.
if [[ "$NAME" == academic-api && "${CI:-}" == true && ! -f .env ]]; then
  rand() { node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"; }
  cat > .env <<EOF
NODE_ENV=test
PORT=8081
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-school}
DB_PASSWORD=${DB_PASSWORD:?Cần DB_PASSWORD để chạy test academic-api}
DB_NAME=school_portal
DB_SYNCHRONIZE=true
JWT_ACCESS_SECRET=$(rand)
JWT_REFRESH_SECRET=$(rand)
JWT_ACCESS_TTL_SECONDS=900
JWT_REFRESH_TTL_SECONDS=604800
EOF
  trap 'rm -f "$DIR/.env"' EXIT
fi

if has_script test; then
  section "test"
  npm test
  endsection
fi

section "build"
npm run build
endsection

echo "build-test: $NAME OK"
