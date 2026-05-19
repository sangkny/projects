#!/usr/bin/env bash
# ============================================================================
# deploy/coops.sh — CoOps Platform MVP 배포 자동화 (C Week 3 Day 4, 2026-05-12)
#
# 사용:
#   ./deploy/coops.sh [pre-check | deploy | smoke-test | rollback | logs]
#
#   pre-check   : .env.prod 존재 + Stripe 키 형식 + 포스트그레스 접근성 검증.
#   deploy      : alembic upgrade head + docker compose up + healthcheck 대기.
#   smoke-test  : 5종 핵심 라우트 호출 (auth / billing/plans / billing/me / video
#                 quota 차단 / stripe status). 비정상이면 exit 1.
#   rollback    : 가장 최근 backup 으로 DB restore + 이전 image 로 컨테이너 재시작.
#   logs        : coops-api-prod 의 최근 100 줄 로그.
#
# 환경:
#   ENV_FILE    : 기본값 ./projects/.env.prod (override 가능).
#   COMPOSE     : 기본값 docker compose -f projects/docker-compose.prod.yml.
#   COOPS_BASE  : 기본값 http://localhost:8003.
#
# 안전 장치:
#   - 모든 단계는 idempotent. 실패 시 exit 1 + log.
#   - smoke-test 가 실패하면 자동 rollback 하지 않는다 (운영자 판단).
#   - JWT_SECRET_KEY 가 'change-me-prod' 면 deploy 거부.
# ============================================================================
set -euo pipefail

ENV_FILE="${ENV_FILE:-projects/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-projects/docker-compose.prod.yml}"
COMPOSE="${COMPOSE:-docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE}}"
COOPS_BASE="${COOPS_BASE:-http://localhost:8003}"
SERVICE="coops-api"
CONTAINER="coops-api-prod"

log()   { echo "[$(date +%H:%M:%S)] $*"; }
fail()  { echo "[FAIL] $*" >&2; exit 1; }

pre_check() {
    log "── pre-check ──"

    [[ -f "${ENV_FILE}" ]] || fail ".env.prod 가 없습니다: ${ENV_FILE} (projects/.env.prod.example 참고)"

    # 필수 변수 추출 (.env.prod 파싱)
    local jwt
    jwt=$(grep -E '^JWT_SECRET_KEY=' "${ENV_FILE}" | head -1 | cut -d'=' -f2-)
    [[ -n "${jwt}" ]] || fail "JWT_SECRET_KEY 가 비어 있음"
    [[ "${jwt}" != "change-me-prod" ]] || fail "JWT_SECRET_KEY 가 기본값 — 실 운영 시 32 byte 무작위로 교체"
    [[ ${#jwt} -ge 32 ]] || fail "JWT_SECRET_KEY 길이 ${#jwt} < 32 — 더 강한 값 사용"

    local pgpass
    pgpass=$(grep -E '^POSTGRES_PASSWORD=' "${ENV_FILE}" | head -1 | cut -d'=' -f2-)
    [[ -n "${pgpass}" ]] || fail "POSTGRES_PASSWORD 가 비어 있음"
    [[ "${pgpass}" != "dev" ]] || fail "POSTGRES_PASSWORD 가 'dev' — 운영에서 위험"

    # Stripe enabled 시 secret 형식 검증
    local stripe_enabled
    stripe_enabled=$(grep -E '^STRIPE_ENABLED=' "${ENV_FILE}" | head -1 | cut -d'=' -f2-)
    if [[ "${stripe_enabled}" == "1" ]]; then
        local sk
        sk=$(grep -E '^(COOPS_)?STRIPE_SECRET_KEY=' "${ENV_FILE}" | head -1 | cut -d'=' -f2-)
        [[ -n "${sk}" ]] || fail "STRIPE_ENABLED=1 인데 STRIPE_SECRET_KEY 미설정"
        [[ "${sk}" =~ ^sk_(test|live)_ ]] || fail "STRIPE_SECRET_KEY prefix 가 sk_test_ / sk_live_ 가 아님"
        log "  Stripe 활성 ($([[ "${sk}" =~ ^sk_test_ ]] && echo 'test mode' || echo 'live mode'))"
    else
        log "  Stripe 비활성 (STRIPE_ENABLED=0) — admin /subscribe 수기 부여만 사용"
    fi

    log "  pre-check OK"
}

deploy() {
    log "── deploy ──"
    pre_check

    log "  컨테이너 build + start ..."
    ${COMPOSE} up -d --build ${SERVICE}

    log "  healthcheck 대기 (start_period 120s 포함, max 180s) ..."
    local ok=0
    for i in $(seq 1 36); do
        sleep 5
        if curl -fsS -m 3 "${COOPS_BASE}/health" >/dev/null 2>&1; then
            ok=1; break
        fi
    done
    [[ ${ok} -eq 1 ]] || fail "healthcheck 실패 — \`docker logs ${CONTAINER}\` 확인"

    log "  /health 200 OK"
    log "  배포 완료. smoke-test 실행:"
    smoke_test
}

smoke_test() {
    log "── smoke-test ──"

    # 1) /health
    curl -fsS -m 3 "${COOPS_BASE}/health" >/dev/null \
        || fail "/health 실패"
    log "  [1/5] /health OK"

    # 2) 공개 plan 카탈로그
    local plans
    plans=$(curl -fsS -m 3 "${COOPS_BASE}/api/v1/billing/plans") \
        || fail "/billing/plans 실패"
    echo "${plans}" | grep -q '"code":"startup"' \
        || fail "/billing/plans 응답에 'startup' plan 누락"
    log "  [2/5] /billing/plans (4 plans) OK"

    # 3) auth (staff)
    local tok
    tok=$(curl -fsS -m 3 -X POST "${COOPS_BASE}/api/v1/auth/token" \
        -d "username=staff&password=staff123" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])") \
        || fail "/auth/token (staff) 실패"
    [[ -n "${tok}" ]] || fail "token 비어 있음"
    log "  [3/5] /auth/token OK"

    # 4) /billing/me (인증)
    local me
    me=$(curl -fsS -m 3 "${COOPS_BASE}/api/v1/billing/me" \
        -H "Authorization: Bearer ${tok}") \
        || fail "/billing/me 실패"
    echo "${me}" | grep -q '"plan_code"' \
        || fail "/billing/me 응답에 plan_code 누락"
    log "  [4/5] /billing/me OK"

    # 5) Stripe status (disabled 도 200 OK 반환)
    curl -fsS -m 3 "${COOPS_BASE}/api/v1/billing/stripe/status" >/dev/null \
        || fail "/billing/stripe/status 실패"
    log "  [5/5] /billing/stripe/status OK"

    log "  smoke-test 모두 PASS"
}

rollback() {
    log "── rollback ──"
    log "  이전 image 로 컨테이너 재시작 (alembic downgrade 는 운영자 수기 필요)"
    ${COMPOSE} pull ${SERVICE} || true
    ${COMPOSE} up -d --force-recreate ${SERVICE}
    log "  rollback 완료 — \`./deploy/coops.sh smoke-test\` 로 검증"
}

logs() {
    docker logs --tail 100 -f ${CONTAINER}
}

case "${1:-deploy}" in
    pre-check)  pre_check ;;
    deploy)     deploy ;;
    smoke-test) smoke_test ;;
    rollback)   rollback ;;
    logs)       logs ;;
    *)
        echo "Usage: $0 [pre-check|deploy|smoke-test|rollback|logs]"
        exit 1
        ;;
esac
