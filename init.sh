#!/bin/bash
# ============================================
# Autopus Docker 환경 초기화
# ============================================

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# ============================================
# Phase 0: 사전 검사
# ============================================
log_info "Phase 0: 사전 검사"

if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되지 않았습니다"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되지 않았습니다"
    exit 1
fi

log_success "Docker 및 Docker Compose 확인됨"

# ============================================
# Phase 1: 디렉토리 구조 생성
# ============================================
log_info "Phase 1: 디렉토리 구조 생성"

mkdir -p project
mkdir -p workspace/{worktrees,lore,cache,logs}
mkdir -p scripts

log_success "디렉토리 생성 완료"

# ============================================
# Phase 2: 환경 설정 파일 생성
# ============================================
log_info "Phase 2: 환경 설정 파일 생성"

# .env 파일 생성
cat > .env << 'EOF'
# Ollama 설정
OLLAMA_API_URL=http://ollama:11434
OLLAMA_MODELS=mistral:7b,neural-chat:7b
OLLAMA_NUM_PARALLEL=1

# Autopus 설정
AUTOPUS_MODE=docker
AUTOPUS_QUALITY=balanced
AUTOPUS_MAX_WORKERS=3
AUTOPUS_AUTO_LOOP=true
AUTOPUS_CIRCUIT_BREAKER=3

# 로깅
LOG_LEVEL=info
EOF

log_success ".env 파일 생성됨"

# ============================================
# Phase 3: Docker 빌드 및 실행
# ============================================
log_info "Phase 3: Docker 컨테이너 빌드 및 실행"

log_info "Ollama 컨테이너 시작..."
docker-compose up -d ollama

log_info "Ollama 준비 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        log_success "Ollama 서비스 준비 완료"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Ollama 시작 타임아웃"
        exit 1
    fi
    sleep 2
done

# ============================================
# Phase 4: 모델 다운로드
# ============================================
log_info "Phase 4: LLM 모델 다운로드"

log_info "mistral:7b 다운로드 중 (첫 실행, 약 5-10분)..."
docker exec autopus-ollama ollama pull mistral:7b

log_info "neural-chat:7b 다운로드 중..."
docker exec autopus-ollama ollama pull neural-chat:7b

log_success "모델 다운로드 완료"

# 모델 확인
log_info "다운로드된 모델 확인:"
docker exec autopus-ollama ollama list

# ============================================
# Phase 5: Autopus CLI 빌드
# ============================================
log_info "Phase 5: Autopus CLI 빌드"

if [ ! -d "autopus-adk" ]; then
    log_warn "autopus-adk 디렉토리가 없습니다"
    log_info "다음 명령으로 클론하세요:"
    echo "  git clone https://github.com/Insajin/autopus-adk.git"
else
    log_info "Autopus CLI 빌드 중..."
    docker-compose build autopus
    log_success "Autopus CLI 빌드 완료"
fi

# ============================================
# Phase 6: 프로젝트 초기화
# ============================================
log_info "Phase 6: 프로젝트 초기화"

log_info "프로젝트 디렉토리에 Go 모듈 초기화..."
cat > project/go.mod << 'EOF'
module github.com/example/my-project

go 1.22
EOF

log_success "프로젝트 초기화 완료"

# ============================================
# Phase 7: 테스트 실행
# ============================================
log_info "Phase 7: 기본 테스트"

log_info "Ollama API 테스트..."
RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:7b",
    "prompt": "hello",
    "stream": false
  }')

if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
    log_success "Ollama API 정상 작동"
else
    log_error "Ollama API 테스트 실패"
fi

# ============================================
# Phase 8: 설명 및 다음 단계
# ============================================
log_success "✨ Autopus Docker 환경 초기화 완료!"

echo ""
echo "=========================================="
echo "🐙 다음 단계:"
echo "=========================================="
echo ""
echo "1. 대화형 쉘 진입:"
echo "   docker-compose exec autopus bash"
echo ""
echo "2. Autopus 버전 확인:"
echo "   docker-compose exec autopus auto version"
echo ""
echo "3. 프로젝트 초기화:"
echo "   docker-compose exec autopus auto init"
echo ""
echo "4. 첫 SPEC 작성:"
echo "   docker-compose exec autopus auto plan \"기능 설명\""
echo ""
echo "5. 자율 파이프라인 실행:"
echo "   docker-compose exec autopus auto go SPEC-ID --auto --loop"
echo ""
echo "=========================================="
echo "📊 모니터링:"
echo "=========================================="
echo ""
echo "• 실시간 로그: docker-compose logs -f"
echo "• Ollama 모니터: docker exec autopus-ollama ollama list"
echo "• 컨테이너 상태: docker-compose ps"
echo ""
echo "=========================================="
echo "🧹 정리:"
echo "=========================================="
echo ""
echo "• 모든 컨테이너 중지: docker-compose down"
echo "• 볼륨 포함 완전 삭제: docker-compose down -v"
echo ""
