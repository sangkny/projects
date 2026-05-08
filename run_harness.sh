#!/usr/bin/env bash
# ============================================================
# run_harness.sh — Harness CLI WSL bash 래퍼
#
# 역할: docker compose exec 를 자동으로 앞에 붙여
#       컨테이너 내부의 python -m harness 를 실행합니다.
#
# 위치: projects/run_harness.sh
# 실행: WSL2 bash 환경에서 사용
#
# 사용법:
#   ./run_harness.sh smoke                          # 스모크 테스트
#   ./run_harness.sh smoke --save                   # 저장까지
#   ./run_harness.sh domain software                # SOFTWARE 도메인
#   ./run_harness.sh domain medical --save
#   ./run_harness.sh tags smoke safety
#   ./run_harness.sh all
#   ./run_harness.sh all --min-pass-rate 90
#   ./run_harness.sh compare                        # 기준선 비교 (smoke)
#   ./run_harness.sh compare --suite all
#   ./run_harness.sh compare --baseline /app/reports/harness/baseline.json
#   ./run_harness.sh --help                         # 도움말
#   ./run_harness.sh smoke --log-level INFO         # 상세 로그
# ============================================================

set -euo pipefail

# ── 경로 설정 ──────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.dev.yml"
SERVICE="shared-libs"

# ── 색상 출력 ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'  # No Color

info()    { echo -e "${CYAN}[harness]${NC} $*"; }
success() { echo -e "${GREEN}[harness]${NC} $*"; }
warn()    { echo -e "${YELLOW}[harness]${NC} $*"; }
error()   { echo -e "${RED}[harness] ERROR:${NC} $*" >&2; }

# ── 인수 없음 → 도움말 ─────────────────────────────────────
if [[ $# -eq 0 ]]; then
    echo -e "${BOLD}Harness CLI 래퍼 (WSL bash)${NC}"
    echo ""
    echo "사용법:"
    echo "  ./run_harness.sh <COMMAND> [OPTIONS]"
    echo ""
    echo "COMMAND:"
    echo "  smoke                   스모크 테스트 (~1분)"
    echo "  domain <name>           도메인별 테스트 (software|medical|business)"
    echo "  tags <tag1> [tag2 ...]  태그별 테스트"
    echo "  all                     전체 테스트 (~15분)"
    echo "  compare [--suite ...]   기준선 비교 (회귀 탐지)"
    echo "  --help                  상세 도움말"
    echo ""
    echo "OPTIONS (공통):"
    echo "  --save                  리포트 파일 저장"
    echo "  --min-pass-rate RATE    최소 통과율 (기본 80)"
    echo "  --log-level LEVEL       DEBUG|INFO|WARNING|ERROR (기본 WARNING)"
    echo ""
    echo "예시:"
    echo "  ./run_harness.sh smoke --save"
    echo "  ./run_harness.sh domain software --save --log-level INFO"
    echo "  ./run_harness.sh compare --suite software"
    exit 0
fi

# ── Docker 실행 중인지 확인 ────────────────────────────────
if ! docker compose -f "${COMPOSE_FILE}" ps --status running \
       --services 2>/dev/null | grep -q "^${SERVICE}$"; then
    error "컨테이너 '${SERVICE}'가 실행 중이 아닙니다."
    warn  "다음 명령으로 시작하세요:"
    warn  "  docker compose -f ${COMPOSE_FILE} up -d"
    exit 1
fi

# ── 실행 ───────────────────────────────────────────────────
info "docker compose exec ${SERVICE} python -m harness $*"
echo ""

docker compose -f "${COMPOSE_FILE}" exec "${SERVICE}" \
    python -m harness "$@"

EXIT_CODE=$?

echo ""
if [[ ${EXIT_CODE} -eq 0 ]]; then
    success "완료 (exit 0)"
else
    error "실패 (exit ${EXIT_CODE})"
fi

exit ${EXIT_CODE}
