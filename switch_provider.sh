#!/usr/bin/env bash
# 사용법(WSL/Linux): chmod +x switch_provider.sh && ./switch_provider.sh local|openai|anthropic|google
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PROVIDER="${1:-local}"
ENV_SRC=".env.${PROVIDER}"

if [[ ! -f "$ENV_SRC" ]]; then
  echo "환경파일 없음: $ENV_SRC" >&2
  exit 1
fi

cp "$ENV_SRC" ".env.current"
docker compose -f docker-compose.dev.yml --env-file .env.current down
docker compose -f docker-compose.dev.yml --env-file .env.current up -d

echo "✅ Provider 전환 완료: ${PROVIDER} (--env-file .env.current)"
