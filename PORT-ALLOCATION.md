# 개발 PC 전체 Docker 포트 배정표

> **자동 생성**: 2026-06-11 — `bash scripts/update_port_allocation.sh`
> **SSOT**: 각 프로젝트 `docker-compose.yml` (실제 포트 기준)
> **수정 방법**: docker-compose.yml 수정 후 이 스크립트 재실행
> **마스터 위치**: `projects/PORT-ALLOCATION.md`

---

## ⚠️ 충돌 현황

✅ **MEDI-IOT compose 포트** — Docker 프로젝트 간 호스트 포트 충돌 없음

## 외부 서비스 (Docker 외부)

| 서비스 | 호스트 포트 | 실행 위치 | 비고 |
|--------|-----------|----------|------|
| **LM Studio** | **1234** | Windows (`192.168.0.12`) | Serve on Local Network 필수 |
| **GPU 서버 SSH** | **22** | `192.168.0.23` | `medi-train:gpu` · CNN 훈련 |
| GPU 서버 (Docker) | — | `192.168.0.23` | 호스트 포트 외부 미노출 |

### ⚠️ 포트 충돌 주의 (외부 서비스)

| 충돌 상황 | 결과 | 해결 |
|----------|------|------|
| SVG-Stock 실행 중 + LM Studio **8000** | ❌ LM Studio 접근 불가 | LM Studio **1234** 사용 |
| SVG-Stock + MEDI-IOT 동시 실행 | ⚠️ 호스트 **8000** 점유 | SVG-Stock **단독 실행** 원칙 |

### LM Studio 설정 (필수)

| 항목 | 값 |
|------|-----|
| Port | **1234** |
| Serve on Local Network | **✅ 활성화** |

**접근 URL**

| 환경 | URL |
|------|-----|
| PowerShell | `http://localhost:1234/v1` |
| WSL / Docker (호스트) | `http://192.168.0.12:1234/v1` |
| Docker 컨테이너 | `http://host.docker.internal:1234/v1` |

> 상세: `docs/NETWORK-GUIDE.md` · `docker-compose.dev.yml` `LOCAL_BASE_URL`

---

## 프로젝트별 포트 현황

### MEDI-IOT
> 주력 안과 AI 플랫폼  
> 경로: `/mnt/e/Office_Automation/idea-collection/projects/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **1883** | 1883 |
| **3000** | 80 |
| **3001** | 3000 |
| **3010** | 3000 |
| **5452** | 5432 |
| **8001** | 8000 |
| **8002** | 8000 |
| **8003** | 8000 |
| **8004** | 8000 |
| **8011** | 8010 |
| **8080** | 8080 |
| **8090** | 80 |
| **9002** | 9001 |
| **9010** | 9000 |
| **9011** | 9001 |
| **9091** | 9090 |

### SVG-New-Bot
> 챗봇 플랫폼  
> 경로: `/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **3002** | 3000 |
| **5679** | 5678 |
| **8100** | 8000 |
| **11434** | 11434 |

### SVG-Stock
> 주식 추천 MVP (단독 실행 원칙)  
> 경로: `/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **80** | 80 |
| **443** | 443 |
| **5433** | 5432 |
| **5434** | 5432 |
| **5678** | 5678 |
| **8000** | 8000 |
| **8501** | 8501 |
| **9000** | 9000 |
| **9001** | 9001 |
| **26379** | 6379 |

### pronunciation
> 발음 교정 앱  
> 경로: `/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **5000** | 5000 |
| **5173** | 5173 |
| **11435** | 11434 |

### fin-stat
> 재무 분석  
> 경로: `/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **8300** | 8000 |

### proposal
> 제안서 에이전트  
> 경로: `/mnt/e/Office_Automation/svg-proposal-agent/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **5680** | 5678 |

### paperclip
> PaperclipAI  
> 경로: `/mnt/e/Office_Automation/paperclipai/paperclip/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **0** | 0 |
| **3100** | 3100 |
| **5453** | 5432 |

---

## 동시 실행 가능 조합

| 조합 | 가능 여부 | 비고 |
|------|----------|------|
| MEDI-IOT + SVG-New-Bot | ✅ 가능 | 포트 분리됨 |
| MEDI-IOT + pronunciation | ✅ 가능 | — |
| MEDI-IOT + paperclip | ✅ 가능 | — |
| MEDI-IOT + proposal | ✅ 가능 | — |
| SVG-Stock + 다른 프로젝트 | ⚠️ 주의 | 80/9000/8000 점유 — 단독 실행 권장 |
| LM Studio + SVG-Stock | ⚠️ 주의 | LM Studio는 **1234** (SVG-Stock이 8000 점유) |

---

## 관리 명령어

```bash
# 점검 (충돌 확인)
bash scripts/check_port_conflicts.sh

# 재생성 + 동기화 (docker-compose 수정 후)
bash scripts/update_port_allocation.sh
```
