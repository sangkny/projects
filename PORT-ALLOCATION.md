# 개발 PC 전체 Docker 포트 배정표

> **목적**: 동일 개발 PC (192.168.0.12 WSL2) 에서 여러 프로젝트 동시 운영 시 포트 충돌 방지  
> **최초 작성**: 2026-06-03  
> **관리 원칙**: docker-compose 포트 변경 시 반드시 이 문서 업데이트 후 커밋

---

## 프로젝트별 포트 대역 배정

| 대역 | 프로젝트 | 경로 |
|------|----------|------|
| **8001–8099** | MEDI-IOT-EyeCare | `/mnt/e/Office_Automation/idea-collection/projects/` |
| **8100–8199** | SVG-New-Bot | `/mnt/d/.../SVG-New-Bot/` |
| **8200–8299** | SVG-Stock-Recommend-MVP | `/mnt/d/.../SVG-Stock-Recommend-MVP/` |
| **8300–8399** | svg-fin-stat-analyzer | `/mnt/d/.../svg-fin-stat-analyzer/` |
| **8400–8499** | svg-proposal-agent | `/mnt/e/Office_Automation/svg-proposal-agent/` |
| **8500–8599** | pronunciation-master | `/mnt/d/.../Learning-Languages/pronunciation-master/` |
| **5000–5099** | pronunciation-master (레거시 유지) | — |
| **3100–3199** | paperclipai | `/mnt/e/Office_Automation/paperclipai/` |

---

## 충돌 현황 및 조치 (2026-06-03 기준)

| 포트 | 충돌 프로젝트들 | 조치 |
|------|----------------|------|
| **11434** | pronunciation-master ↔ SVG-New-Bot | pronunciation-master → **11435** |
| **8000** | svg-fin-stat-analyzer ↔ SVG-New-Bot ↔ SVG-Stock | SVG-New-Bot → **8100**, fin-stat → **8300** |
| **5678** | SVG-New-Bot ↔ SVG-Stock ↔ svg-proposal-agent | SVG-New-Bot → **5679**, proposal-agent → **5680** |
| **3000** | SVG-New-Bot ↔ SVG-Stock(monitoring) | SVG-New-Bot → **3002** |
| **9090** | MEDI-IOT ↔ SVG-Stock(monitoring) | MEDI-IOT → **9091** |
| **9000/9001** | MEDI-IOT ↔ SVG-Stock | MEDI-IOT → **9010/9011** |
| **5432** | MEDI-IOT ↔ SVG-Stock(minimal) ↔ paperclipai | MEDI-IOT → **5452**, paperclipai → **5453** |
| **6379** | SVG-Stock(minimal) ↔ prod.yml | minimal은 비활성, prod는 내부전용 권장 |
| **80** | MEDI-IOT ↔ SVG-Stock | MEDI-IOT → **8090** |

---

## 전체 프로젝트 포트 목록 (확정안)

### MEDI-IOT-EyeCare (`docker-compose.dev.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| medi-iot-api-dev | **8001** | 8000 |
| autonogada-api-dev | **8002** | 8000 |
| coops-api-dev | **8003** | 8000 |
| shared-libs-dev | **8004** | 8000 |
| code-sandbox-dev | **8011** | 8010 |
| api-gateway-dev | **8090** | 80 |
| openclaw-runtime | **8080** | 8080 |
| openclaw-runtime (UI) | **3010** | 3000 |
| nginx(gateway) | **8090** | 80 |
| dashboard-dev | **3000** | 80 |
| dashboard Vite (`npm run dev`) | **5174** | — (호스트 only, pronunciation 5173 회피) |
| grafana-dev | **3001** | 3000 |
| prometheus-dev | **9091** | 9090 |
| mosquitto-dev | **1883** | 1883 |
| mosquitto-dev(ws) | **9002** | 9001 |
| postgres-dev | **5452** | 5432 |
| redis-dev | (노출없음) | 6379 |
| minio-dev | **9010** | 9000 |
| minio-dev(console) | **9011** | 9001 |

### SVG-New-Bot (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| svg-new-bot-backend | **8100** | 8000 |
| svg-new-bot-admin-ui | **3002** | 3000 |
| svg-new-bot-n8n | **5679** | 5678 |
| svg-new-bot-llm (Ollama) | **11434** | 11434 |

### SVG-Stock-Recommend-MVP (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| svg-postgres | **5434** | 5432 |
| svg-timescaledb | **5433** | 5432 |
| svg-redis | **26379** | 6379 |
| svg-api | **8000** | 8000 |
| svg-streamlit | **8501** | 8501 |
| svg-n8n | **5678** | 5678 |
| svg-nginx | **80/443** | 80/443 |
| svg-minio | **9000/9001** | 9000/9001 |

> ⚠️ SVG-Stock은 표준 포트(8000, 80, 9000 등) 다수 사용 중.  
> **이 프로젝트 실행 시 다른 프로젝트와 동시 실행 불가** — 단독 실행 원칙.

### svg-fin-stat-analyzer (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| svg-fin-stat-analyzer-app | **8300** | 8000 |

### pronunciation-master (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| backend | **5000** | 5000 |
| frontend | **5173** | 5173 |
| Ollama | **11435** | 11434 |

### svg-proposal-agent (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| n8n | **5680** | 5678 |

### paperclipai (`docker-compose.yml`)

| 컨테이너 | 호스트 포트 | 컨테이너 포트 |
|----------|------------|--------------|
| app | **3100** | 3100 |
| postgres | **5453** | 5432 |

---

## 동시 실행 가능 조합

| 조합 | 가능 여부 | 비고 |
|------|----------|------|
| MEDI-IOT + SVG-New-Bot | ✅ 가능 | 포트 분리 완료 |
| MEDI-IOT + pronunciation-master | ✅ 가능 | — |
| MEDI-IOT + paperclipai | ✅ 가능 | — |
| MEDI-IOT + svg-proposal-agent | ✅ 가능 | — |
| SVG-Stock + 다른 프로젝트 | ⚠️ 주의 | 80/9000/8000 점유 — 단독 실행 권장 |

---

## 충돌 체크 명령어

```bash
# 실행 중인 전체 포트 현황
docker ps --format "table {{.Names}}\t{{.Ports}}" | sort

# 특정 포트 점유 확인
ss -tlnp | grep <포트번호>

# 전체 프로젝트 포트 중복 스캔
python3 -c "
import re, glob
from collections import defaultdict
port_map = defaultdict(list)
files = [
  '/mnt/e/Office_Automation/idea-collection/projects/docker-compose.dev.yml',
  '/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/docker-compose.yml',
  '/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/docker-compose.yml',
  '/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/docker-compose.yml',
  '/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/docker-compose.yml',
  '/mnt/e/Office_Automation/svg-proposal-agent/docker-compose.yml',
  '/mnt/e/Office_Automation/paperclipai/paperclip/docker-compose.yml',
]
for f in files:
  try:
    for m in re.findall(r'\"(\d+):\d+\"', open(f).read()):
      port_map[m].append(f.split('/')[-3])
  except: pass
conflicts = {p:v for p,v in port_map.items() if len(v)>1}
print('충돌:', conflicts if conflicts else '없음 ✅')
"
```

---

## 새 프로젝트 추가 규칙

1. 이 문서 확인 → 빈 대역(100포트 단위) 선택
2. 인프라 포트 오프셋 규칙:
   - PostgreSQL: `5432 + N*10` (5452, 5453, 5454...)
   - Redis: 외부 노출 제거 권장, 필요 시 `6379 + N*100`
   - n8n: 5678부터 1씩 증가 (5679, 5680...)
   - Ollama: 11434부터 1씩 증가 (11435, 11436...)
3. **이 문서 업데이트 후 커밋**

---

## MEDI Dashboard 접속 (WSL2 + Docker)

| 용도 | URL | 전제 |
|------|-----|------|
| Portal/Admin Vite dev | `http://localhost:5174/dashboard/portal/fundus/upload` | `npm run dev` (호스트) |
| Docker 빌드 (직접) | `http://localhost:3000/` | `dashboard-dev` 컨테이너 |
| Gateway 경유 | `http://localhost:8090/dashboard/` | `api-gateway-dev` + `dashboard-dev` |
| MEDI fundus API | `http://localhost:8001/api/v1/lab/fundus/comprehensive` | `medi-iot-api-dev` |
| Swagger | `http://localhost:8001/docs` | — |

**Vite proxy (5174)** — `dashboard/vite.config.ts`:

| 경로 prefix | upstream | 용도 |
|-------------|----------|------|
| `/api/v1` | `:8001` | Portal comprehensive · lab |
| `/api` | `:8090` | Overview · `/api/medical\|code\|ops/` |
| `/harness-report` | `:8090` | Harness JSON |

**환경변수** — `dashboard/.env.example` · `VITE_API_URL` 비우면 proxy 모드(권장).

**동기화 규칙**: `docker-compose.dev.yml` 포트 변경 → 이 문서 + `dashboard/src/config/ports.ts` + `vite.config.ts` 함께 수정.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-07 | dashboard-dev 3000:80 정정(3010은 openclaw) · Vite dev 5174 · WSL 접속표 · proxy 분기 |
| 2026-06-03 | 초안 — 전체 7개 프로젝트 포트 충돌 분석 및 배정표 확정 |
