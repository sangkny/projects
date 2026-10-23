# 개발 PC 전체 Docker 포트 배정표

> **단일 기준 문서**: 이 파일 `projects/PORT-ALLOCATION.md`  
> GitHub: https://github.com/sangkny/projects/blob/main/PORT-ALLOCATION.md  
> 다른 저장소는 숫자 표를 새로 만들지 않고 이 파일을 가리킨다.  
> 아래 「보존된 카탈로그」는 2026-07-15 생성본이다. 지운 행은 없다.

## 포트 거버넌스

1. 포트를 새로 쓰기 전에 이 파일을 본다.
2. 새 포트는 이 표의 호스트 포트와 겹치는지 확인한다.
3. 제안 배정과 이미 설정에 있는 배정을 구분한다.
4. PC1 `MEDIIOT-SKLEE`와 PC2 `SVG-SKLEE`의 배정이 다르면 호스트를 적는다.
5. 컨테이너 포트와 호스트에 공개된 포트를 구분한다.
6. 다시 쓰려고 예약한 임시 포트는 예약으로 적는다. 한 번 쓰고 지운 포트는 예약이 아니다.
7. 쓰지 않는 포트를 확인 없이 사용 가능으로 적지 않는다.
8. 배포 설정의 포트 변경은 승인 후에만 한다. 이 문서는 실행 중인 서비스를 바꾸지 않는다.
9. 과거 행은 삭제하지 않는다. 현재 설정과 다르면 상태를 고친다.
10. 진행 기록은 최신이 맨 위다.

`scripts/update_port_allocation.sh`는 이 작업에서 수정하지 않았다. 그 스크립트가 이 파일을 통째로 다시 쓰면 거버넌스 절이 사라질 수 있다. 스크립트 변경은 별도 승인이다.

## 진행 기록

### 2026-10-23T11:41:25+09:00 — PC1-PLATFORM-PUBLICATION-AND-CLINICAL-INTEGRATION-004

```
TASK_ID: PC1-PLATFORM-PUBLICATION-AND-CLINICAL-INTEGRATION-004
EXECUTION_HOST: MEDIIOT-SKLEE
PC_ROLE: PC1
REPOSITORY: projects
BRANCH: main
HEAD_BEFORE: 283ffc0e2b714ba9080e1719051816a44e1a9087
HEAD_AFTER: 이 기록이 들어간 문서 커밋. 푸시 여부는 커밋 뒤 origin/main 재확인
START_TIME_KST: 2026-10-23T11:41:25+09:00
END_TIME_KST: 문서 수정 시점. 푸시 완료 시각은 다음 기록
FILES_CHANGED: PORT-ALLOCATION.md
VALIDATION: 55432/55433 과 PC2 관찰은 배정 표 밖. 자격 증명 문자열은 넣지 않음
OPEN_ISSUES: 푸시 결과와 Phase 007 통합 순서는 실행 후 상단 기록으로 남긴다
```

### 2026-10-23 08:56 KST — MEDI-IOT-PLATFORM-DOCUMENTATION-001

```
TASK_ID: MEDI-IOT-PLATFORM-DOCUMENTATION-001
EXECUTION_HOST: MEDIIOT-SKLEE
PC_ROLE: PC1
REPOSITORY: projects
BRANCH: main
HEAD_BEFORE: 283ffc0e2b714ba9080e1719051816a44e1a9087
HEAD_AFTER: 283ffc0e2b714ba9080e1719051816a44e1a9087
START_TIME_KST: 2026-10-23 08:51
END_TIME_KST: 2026-10-23 08:56
FILES_CHANGED: PORT-ALLOCATION.md
VALIDATION: docker-compose.dev.yml, docker-compose.prod.yml, eyecare-platform/docker-compose.yml, medi-audit-engine/docker-compose.yml, LOOKSCAN/infra/docker-compose.yml 를 읽었다. 서비스는 재시작하지 않았다. D: 경로 프로젝트 compose 는 이번 PC에서 다시 열지 않았다.
OPEN_ISSUES: 호스트 레지스트리 E:/Office_Automation/port_allocation.md 가 SVG-Analyzer CLI 기본 입력이라 이 파일과 별도다. eyecare-redis 6380 은 카탈로그에만 있고 현재 compose 는 호스트에 공개하지 않는다. 5432 와 80 은 운영 compose 와 기존 카탈로그가 겹친다. PC2 실시간 포트는 확인하지 않았다.
```

## 2026-10-23 설정 파일에서 확인한 포트

호스트는 PC1 `MEDIIOT-SKLEE`다. compose에 바인드 주소가 없으면 Docker 기본값으로 모든 인터페이스에 공개된다. 프로토콜은 compose 단축 표기의 TCP다. 실행 중 리스너는 다시 스캔하지 않았다. 상태는 설정 기준이다.

| 호스트 | 환경 | 저장소 | 서비스 | 프로토콜 | 호스트 포트 | 컨테이너 포트 | 바인드 | 상태 | 소유 | 출처 | 확인일 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| MEDIIOT-SKLEE | development | projects | shared-libs | TCP | 8004 | 8000 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | medi-iot-api | TCP | 8001 | 8000 | compose 기본 | CONFIGURED | MEDI-IOT-EyeCare | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | mosquitto | TCP | 1883 | 1883 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | mosquitto websocket | TCP | 9002 | 9001 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | openclaw | TCP | 3010 | 3000 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | paperclip | TCP | 8080 | 8080 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | postgres-dev | TCP | 5452 | 5432 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | redis-dev | TCP | 없음 | 6379 | 네트워크 내부 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | minio | TCP | 9010 | 9000 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | minio console | TCP | 9011 | 9001 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | dashboard | TCP | 3000 | 80 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | code-sandbox | TCP | 8011 | 8010 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | autonogada-api | TCP | 8002 | 8000 | compose 기본 | CONFIGURED | AutoNoGaDa-ADK | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | coops-api | TCP | 8003 | 8000 | compose 기본 | CONFIGURED | CoOps-Platform | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | health-aggregator | TCP | 없음 | 없음 | 네트워크 내부 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | prometheus | TCP | 9091 | 9090 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | grafana | TCP | 3001 | 3000 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | projects | api-gateway | TCP | 8090 | 80 | compose 기본 | CONFIGURED | projects | docker-compose.dev.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | medi-iot-api-prod | TCP | 8001 | 8000 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | autonogada-api-prod | TCP | 8002 | 8000 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | coops-api-prod | TCP | 8003 | 8000 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | postgres-prod | TCP | 5432 | 5432 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | redis-prod | TCP | 6379 | 6379 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | production file | projects | api-gateway-prod | TCP | 80 | 80 | compose 기본 | CONFIGURED_NOT_RUNNING_VERIFIED | projects | docker-compose.prod.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | eyecare-platform | eyecare-postgres | TCP | 5455 | 5432 | compose 기본 | CONFIGURED | eyecare-platform | eyecare-platform/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | eyecare-platform | eyecare-redis | TCP | 없음 | 6379 | expose만 | CONFIGURED | eyecare-platform | eyecare-platform/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | eyecare-platform | eyecare-ai-inference | TCP | 8210 | 8000 | compose 기본 | CONFIGURED | eyecare-platform | eyecare-platform/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | eyecare-platform | eyecare-api | TCP | 8211 | 8000 | compose 기본 | CONFIGURED | eyecare-platform | eyecare-platform/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | eyecare-platform | eyecare-worker | TCP | 없음 | 없음 | 네트워크 내부 | CONFIGURED | eyecare-platform | eyecare-platform/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | medi-audit-engine | audit-postgres | TCP | 5454 | 5432 | compose 기본 | CONFIGURED | medi-audit-engine | medi-audit-engine/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | medi-audit-engine | audit-api | TCP | 8500 | 8000 | compose 기본 | CONFIGURED | medi-audit-engine | medi-audit-engine/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | LOOKSCAN | backend (`lookscan-backend`) | TCP | 8600 | 8000 | compose 기본 | CONFIGURED | LOOKSCAN | LOOKSCAN/infra/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | LOOKSCAN | db (`lookscan-db`) | TCP | 5456 | 5432 | compose 기본 | CONFIGURED | LOOKSCAN | LOOKSCAN/infra/docker-compose.yml | 2026-10-23 |
| MEDIIOT-SKLEE | development | LOOKSCAN | cv-inference 주석 | TCP | 8601 | 미기재 | 없음 | RESERVED_COMMENT | LOOKSCAN | LOOKSCAN/infra/docker-compose.yml 주석 | 2026-10-23 |
| MEDIIOT-SKLEE | development | LOOKSCAN | redis 주석 | TCP | 6381 | 미기재 | 없음 | RESERVED_COMMENT | LOOKSCAN | LOOKSCAN/infra/docker-compose.yml 주석 | 2026-10-23 |
| MEDIIOT-SKLEE | development | MEDI-SkinAI-Core | 없음 | — | 없음 | 없음 | — | NOT_ALLOCATED | MEDI-SkinAI-Core | 패키지. HTTP 서버 없음 | 2026-10-23 |
| MEDIIOT-SKLEE | development | SVG-Analyzer | report-viewer | TCP | 18480-18499 | 8080 내부 | 127.0.0.1 로 기록됨 | RESERVED | SVG-Analyzer | E:/Office_Automation/port_allocation.md, 2026-10-21 감사 | 2026-10-21 |
| MEDIIOT-SKLEE | Windows | 외부 | LM Studio | TCP | 1234 | — | 카탈로그 기록 | RECORDED | 호스트 | PORT-ALLOCATION 기존 절, docker-compose.dev.yml LOCAL_BASE_URL | 2026-10-23 파일 재확인 |

## 배정이 아닌 기록

아래는 포트 배정이 아니다. 할당 표, CONFIGURED 행, RESERVED 행에 넣지 않는다.

| 구분 | 호스트 | 포트 | 상태 | 근거 |
|---|---|---|---|---|
| 일회성 시험 | MEDIIOT-SKLEE (PC1) | 55432, 55433 | EPHEMERAL_REMOVED | 2026-10-23 임상 통합 검증용 PostgreSQL. 컨테이너 삭제. 재사용 예약 아님 |
| PC2 관찰 | SVG-SKLEE | 호스트에 공개된 Docker 포트 0건 | OBSERVED_NOT_ALLOCATED | `SVG-Analyzer/docs/PC1_PC2_REPRODUCIBILITY.md` 2026-10-21. `ports audit` 의 docker published ports 0. 제품 서비스 포트로 복사하지 않음 |
| PC2 관찰 | SVG-SKLEE | 18480–18499 리스너 없음 | OBSERVED_NOT_ALLOCATED | 같은 문서. `netstat` 필터 `1848`/`1849` 에 리스너 없음. PC2 감사는 레지스트리 파일이 없어 양 끝을 `AVAILABLE-CANDIDATE` 로 봤다 |
| PC1 배정 | MEDIIOT-SKLEE | 18480–18499 | RESERVED | 이 파일의 SVG-Analyzer 절. PC2의 AVAILABLE-CANDIDATE 관찰이 PC1 예약을 해제하지 않는다 |

PC2의 제외 TCP/UDP 범위는 18480–18499와 겹치지 않았다고 적혀 있다. 그 범위의 개별 포트 번호는 이 문서에 없고, 배정으로 추정하지 않는다. 이번 2026-10-23 세션은 PC2에 접속하지 않았다.

## 충돌과 불일치

| 항목 | 상태 | 근거 |
|---|---|---|
| 8501 | 기존 충돌 기록 | tacr-eval 와 SVG-Stock. 이번 세션에서 D: compose 는 다시 열지 않음 |
| 8000 | 기존 주의 | SVG-Stock 이 8000 을 쓰면 LM Studio 를 1234 로 둔다는 기록 |
| 80 | 설정 충돌 | `docker-compose.prod.yml` api-gateway `80:80` 과 카탈로그의 SVG-Stock 80. 동시 기동은 확인하지 않음 |
| 5432 | 설정 충돌 | `docker-compose.prod.yml` postgres `5432:5432` 와 카탈로그의 pronunciation 5432. 개발 postgres 는 5452 |
| 8001, 8002, 8003 | 같은 호스트 포트 | 개발 compose 와 운영 compose 가 같은 호스트 포트를 공개. 한 PC에서 두 파일을 같이 띄우면 겹친다 |
| 6380 | 카탈로그와 현재 compose 불일치 | 아래 보존 표는 eyecare-redis `6380:6379`. 2026-10-23 `eyecare-platform/docker-compose.yml` 은 `expose: 6379` 만 있고 호스트 공개가 없다. 6380 을 비어 있다고 표시하지 않음 |
| 문서 이중화 | 미해소 | SVG-Analyzer CLI 기본 파일은 `E:\Office_Automation\port_allocation.md`. 이 파일이 부모 SSOT다. CLI 경로 변경은 승인 전 |

PC2 `SVG-SKLEE`의 실시간 리스너는 이 세션에서 보지 않았다. 상태 UNKNOWN.

## 보존된 카탈로그

> **자동 생성**: 2026-07-15 — `bash scripts/update_port_allocation.sh`  
> 당시 문서는 compose 를 SSOT 로 적었다. 2026-10-23 부터 이 마크다운이 배정 SSOT 다.  
> **마스터 위치**: `projects/PORT-ALLOCATION.md`

---

## ⚠️ 충돌 현황

| 포트 | 충돌 프로젝트 |
|------|-------------|
| **8501** | tacr-eval vs SVG-Stock |

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
| **8501** ⚠️ | 8501 |
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
| **5432** | 5432 |

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

### medi-audit-engine
> 임상시험 Audit Trail + 계산식 버전 관리 (MEDI-IOT-EyeCare와 독립)  
> 경로: `/mnt/e/Office_Automation/idea-collection/projects/medi-audit-engine/`

| 호스트 포트 | 컨테이너 포트 | 서비스 |
|------------|-------------|--------|
| **5454** | 5432 | audit-postgres |
| **8500** | 8000 | audit-api |

### eyecare-platform
> 안과병원 B2B + 안경점 Wellness 공유 백엔드 (멀티테넌트)  
> 경로: `/mnt/e/Office_Automation/idea-collection/projects/eyecare-platform/`  
> 추가일: **2026-08-09**

| 호스트 포트 | 컨테이너 포트 | 서비스 | 용도 |
|------------|-------------|--------|------|
| **8211** | 8000 | eyecare-api | 인증·조직/환자·스크리닝 API |
| **8210** | 8000 | eyecare-ai-inference | retinal ONNX 추론 서빙 |
| **5455** | 5432 | eyecare-postgres | 플랫폼 DB |
| **6380** | 6379 | eyecare-redis | Celery/RQ 큐·캐시 |

> worker는 외부 포트 없음 (내부 Redis만 사용).  
> 참고: 후보 8110/8111/8120은 Docker Desktop 포트 포워딩 오류로 **8210/8211** 확정 (2026-08-09).  
> **2026-10-23 정정**: 현재 `eyecare-platform/docker-compose.yml` 의 eyecare-redis 는 호스트 `6380` 을 공개하지 않는다. 위 행은 역사 기록이다. 6380 은 사용 가능으로 바꾸지 않는다.

### tacr-eval
> TA CR 제안서 자동 평가 시스템 (Streamlit + Gemini) — SVG-Stock과 8501 겹침, 동시 실행 불가  
> 경로: `/mnt/d/sangkny/work/doc/external_activity/TACR/SW/tacr-eval/`

| 호스트 포트 | 컨테이너 포트 |
|------------|-------------|
| **8501** ⚠️ | 8501 |

### lookscan
> 소비자 얼굴·안와 스캔과 PBM 세션  
> 경로: `E:\Office_Automation\LOOKSCAN`  
> 추가일: **2026-08-23**, compose 재확인 **2026-10-23**  
> 부모 카탈로그에는 이 절이 없었고 `LOOKSCAN/PORT-ALLOCATION.md` 사본에만 있었다. 숫자 표의 기준은 이 파일이다.

| 호스트 포트 | 컨테이너 포트 | 서비스 | 용도 |
|------------|-------------|--------|------|
| **8600** | 8000 | backend / lookscan-backend | FastAPI |
| **5456** | 5432 | db / lookscan-db | PostgreSQL |

> 예약 주석(서비스 블록 없음): CV 추론 **8601**, Redis **6381**.  
> MEDI-SkinAI-Core 는 호스트 포트가 없다.

### SVG-Analyzer
> 분석 도구. 애플리케이션 런타임 의존성이 아니다.  
> 경로: `E:\Office_Automation\SVG-Analyzer`  
> 2026-10-21 PC1 감사 기록. 2026-10-23 에 `ports audit` 를 다시 실행하지 않음.

| 호스트 포트 | 컨테이너 포트 | 상태 |
|------------|-------------|------|
| **18480-18499** | 뷰어 내부 8080 로 기록 | RESERVED. 분석 컨테이너는 호스트 포트를 공개하지 않는다는 기록 |

---

## 동시 실행 가능 조합

| 조합 | 가능 여부 | 비고 |
|------|----------|------|
| MEDI-IOT + SVG-New-Bot | ✅ 가능 | 포트 분리됨 |
| MEDI-IOT + pronunciation | ✅ 가능 | — |
| MEDI-IOT + paperclip | ✅ 가능 | — |
| MEDI-IOT + proposal | ✅ 가능 | — |
| MEDI-IOT + tacr-eval | ✅ 가능 | 포트 분리됨 |
| SVG-Stock + 다른 프로젝트 | ⚠️ 주의 | 80/9000/8000 점유 — 단독 실행 권장 |
| SVG-Stock + tacr-eval | ❌ 불가 | 둘 다 **8501** 사용 — 동시 실행 금지, 한쪽을 내리고 실행 |
| LM Studio + SVG-Stock | ⚠️ 주의 | LM Studio는 **1234** (SVG-Stock이 8000 점유) |
| MEDI-IOT + lookscan | 설정상 분리 | 8600/5456 과 개발 카탈로그의 8000번대·5452 는 다르다. 이번 세션에서 동시 기동은 하지 않음 |
| eyecare-platform + lookscan | 설정상 분리 | 8210/8211/5455 와 8600/5456. redis 6380 공개는 현재 compose 에 없음 |
| 개발 compose + 운영 compose | ❌ 같은 PC에서 동시 기동 금지 | 8001, 8002, 8003 이 양쪽 파일에 있음. 운영 80·5432 는 SVG-Stock·pronunciation 카탈로그와도 겹침 |

---

## 관리 명령어

```bash
# 점검 (충돌 확인)
bash scripts/check_port_conflicts.sh

# 재생성 + 동기화 (docker-compose 수정 후)
# 2026-10-23: 이 스크립트는 거버넌스 절을 보존하도록 고치기 전에는 실행하지 않는다.
bash scripts/update_port_allocation.sh
```
