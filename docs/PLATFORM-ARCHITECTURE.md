# MEDI-IoT 부모 플랫폼 아키텍처

포트의 단일 기준은 [PORT-ALLOCATION.md](../PORT-ALLOCATION.md) 다. 서비스 사이 계약은 [CROSS-PROJECT-INTEGRATION.md](CROSS-PROJECT-INTEGRATION.md) 다. 피부·스캔·안과 코드 대조는 [SKINAI-LOOKSCAN-EYECARE-INTEGRATION-ASSESSMENT.md](SKINAI-LOOKSCAN-EYECARE-INTEGRATION-ASSESSMENT.md) 다.

관계 표시: **CONFIRMED** 는 이번 PC에서 연 소스와 Git HEAD, **PROPOSED** 는 아직 호출 코드가 없는 계약, **UNKNOWN** 은 이번 검사로 단정하지 못한 항목이다. PROPOSED 를 구현된 연동으로 적지 않는다.

## 진행 기록

### 2026-10-23T11:41:25+09:00 — PC1-PLATFORM-PUBLICATION-AND-CLINICAL-INTEGRATION-004

```
TASK_ID: PC1-PLATFORM-PUBLICATION-AND-CLINICAL-INTEGRATION-004
EXECUTION_HOST: MEDIIOT-SKLEE
PC_ROLE: PC1
REPOSITORY: projects
BRANCH: main
HEAD_BEFORE: 283ffc0e2b714ba9080e1719051816a44e1a9087
HEAD_AFTER: 이 기록이 들어간 문서 커밋
START_TIME_KST: 2026-10-23T11:41:25+09:00
END_TIME_KST: 문서 수정 시점. 푸시 결과는 다음 기록
FILES_CHANGED: docs/PLATFORM-ARCHITECTURE.md
VALIDATION: 애플리케이션 코드와 서브모듈 포인터는 이 커밋에 넣지 않음
OPEN_ISSUES: Phase 007 머지 없음
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
FILES_CHANGED: docs/PLATFORM-ARCHITECTURE.md
VALIDATION: 저장소 HEAD 를 읽기 전용으로 확인. 애플리케이션 코드와 배포는 변경하지 않음.
OPEN_ISSUES: Clinical Query 구현 위치는 지정 브랜치와 통합 브랜치에서 찾지 못함. PC2 작업 트리는 SMB 로 수정하지 않음.
```

## 확인된 HEAD

| 저장소 | 브랜치 | HEAD | 원격 |
|---|---|---|---|
| projects | `main` | `283ffc0e2b714ba9080e1719051816a44e1a9087` | https://github.com/sangkny/projects.git |
| MEDI-IOT-EyeCare | `feature/mvp04c-security-hardening` | `bb984a820362bfd0fd191945a54bf3134e09aca1` | https://github.com/sangkny/MEDI-IOT-EyeCare.git |
| MEDI-IOT-EyeCare 통합 워크트리 | `integration/eyecare-clinical-support` | `8d59f10477fc0002f6f5254d4e6b7e3b4012c3c7` | 같은 GitHub 저장소 |
| MEDI-SkinAI-Core | `main` | `cdbee394cb920ca8ec5ab86057c37080fbdc4034` | https://github.com/sangkny/MEDI-SkinAI-Core.git |
| LookScan | `main` | `51cc5bb683d3479a1e6302bbb981c074fbde2d33` | https://github.com/sangkny/LookScan.git |
| shared-libraries | `main` | `95c1bb1d12f5eac7791a34a5a071c5567bc952c5` | https://github.com/sangkny/shared-libraries.git |
| shared-libraries 통합 워크트리 | `integration/medi-iot-clinical-policy` | `fd7f62e807cfad8537a4bf1873b04b123438b429` | 같은 GitHub 저장소 |
| SVG-Analyzer | `main` | `aca9ad84bd76c3f39bc7625a6885546c2f5eaee4` | https://github.com/sangkny/SVG-Analyzer.git |

지정 EyeCare 작업 트리에는 `api/clinical_support.py` 가 없다. 임상 지원 라우터와 `medi007_ecrf_foundation.py` 는 통합 워크트리에 있다.

## 부모 토폴로지

```
projects (오케스트레이션, 이 문서, 포트 표, docker-compose.dev.yml / docker-compose.prod.yml)
├── MEDI-IOT-EyeCare     안과 영상·AI, 환자 암호화. 임상 지원은 통합 브랜치
├── shared-libraries     인증·인가 정책
├── eyecare-platform     웰니스/B2B 백엔드. SkinAI 런타임을 import 하는 Python 은 이번 검색에서 문서 1건뿐
├── medi-audit-engine    EyeCare 와 별도 감사 API
├── AutoNoGaDa-ADK, CoOps-Platform, dashboard, nginx, observability
LOOKSCAN                 projects 밖. 소비자 앱
MEDI-SkinAI-Core         projects 안 라이브러리. HTTP 없음
SVG-Analyzer             projects 밖. 분석 도구. 런타임 의존성 아님
```

개발 compose 주석의 PC1 주소는 `192.168.0.12` 다. CNN 훈련 장비로 적힌 주소는 `192.168.0.23` 이다. 이 세션에서 그 호스트에 접속하지 않았다.

## 저장소 소유

| 저장소 | 소유 | 소유하지 않음 |
|---|---|---|
| projects | 부모 조합, 아키텍처 문서, 포트 표 | 피부 알고리즘, 소비자 UI, 안과 모델 가중치 |
| MEDI-IOT-EyeCare | 안과 영상·진단 AI, 환자 신원 암호화, 통합 브랜치의 연구 지원 | 피부 ordinal, LookScan PBM 세션 |
| MEDI-SkinAI-Core | 피부 전처리, Appearance5 추론, 레지스트리 SHA 검사, 종단 비교 키 | 제품 UI, HTTP, 기기 프로토콜, 임상 문장 |
| LookScan | 소비자 촬영, Face Mesh 기본 분석, 후보 SkinAI 호출, 스캔 이력, PBM 페어링·세션 시작 | 안과 연구 데이터, 검증된 임상 끝점 |
| shared-libraries | 공통 인증과 인가 정책 | 도메인 모델 가중치 |
| SVG-Analyzer | 기술 분석, 근거 묶음, 역공학·검증 보조, 아키텍처 점검 | 제품 요청 경로의 런타임 라이브러리 |

저장소는 합치지 않는다. 서브모듈 포인터는 이 작업에서 바꾸지 않는다.

## 기능 책임과 성숙도

| 기능 | 위치 | 성숙도 |
|---|---|---|
| 안과 영상·AI | EyeCare `feature/mvp04c-security-hardening` | CONFIRMED |
| 환자 암호화 | EyeCare `services/patient_crypto.py` 가 그 브랜치에 있음 | CONFIRMED, 이번 문서 작업에서 동작은 재실행하지 않음 |
| 연구·기관·대상자·방문·관찰 수명주기·설문·품질 실행 | 통합 브랜치 `api/clinical_support.py`, prefix `/clinical-support` | CONFIRMED 파일 존재. Draft PR 미머지 |
| eCRF 기반 | 통합 브랜치 `alembic/versions/medi007_ecrf_foundation.py` | CONFIRMED 파일 존재 |
| Clinical Query | `feat/clinical-query-quality-007` `87aea03` 의 `services/clinical_queries.py` | 브랜치에 코드가 있음. 통합 브랜치 `8d59f10` 과 지정 HEAD `bb984a82` 에는 없음. 머지하지 않음 |
| 통계 분석 API | 같은 브랜치 검색 | 007은 품질 실행 `services/clinical_quality.py` 를 확장한다. 별도 통계 분석 API는 확인하지 못함 |
| Appearance5 | `skinai.inference.runtime.SkinAnalyzer`, `GEOMETRY_PROVIDER = caller_face_bbox` | CONFIRMED. 상태 CANDIDATE. `RELEASED` 적재는 거부 |
| 얼굴 검출기 | SkinAI `PROJECT-CONTEXT.md` 는 소유로 적음 | 코드 진입점은 호출자 bbox. 검출기는 NOT CONFIRMED |
| LookScan 기본 스캔 | `routers/scans.py` `create_scan` → `analyze_image_bytes` | CONFIRMED |
| SkinAI 후보 추론 | `services/skin_candidate.py` `execute_candidate`. `analysis_engine=skinai_candidate` 일 때만 | CONFIRMED. 기본 스캔은 이 함수를 타지 않음 |
| PBM 페어링·시작·상한 | `routers/pbm.py` `pair_pbm_device`, `start_pbm_session` | CONFIRMED |
| PBM 펌웨어, 고장, 세션 종료 | LookScan 백엔드 검색 | NOT CONFIRMED |
| SVG 분석 | SVG-Analyzer CLI. 제품 compose 에 서비스로 없음 | CONFIRMED 도구. 런타임 의존성 아님 |

## 공유 라이브러리

EyeCare 개발 서비스는 `PYTHONPATH=/app/shared-libraries:/app` 로 shared-libraries 를 마운트한다. 임상 정책 커밋 `fd7f62e` 는 통합 워크트리에 있고, 지정 `main` `95c1bb1` 과는 다르다. 통합 시험은 `SHARED_LIBRARIES_PATH` 가 통합 워크트리를 가리킬 때만 임상 액션이 맞다. 형제 디렉터리의 `main` 을 그대로 쓰면 임상 쓰기 권한이 없다.

LookScan 과 SkinAI 는 shared-libraries 를 제품 의존성으로 선언하지 않았다. **PROPOSED**: 이후 연구 API 를 붙일 때만 정책을 재사용한다.

## 서비스 경계

| 호출 | 상태 |
|---|---|
| 개발 게이트웨이 `8090` → medi-iot-api / autonogada / coops | CONFIRMED compose |
| LookScan → SkinAI `SkinAnalyzer` | CONFIRMED 후보 경로만 |
| EyeCare → SkinAI | NOT CONFIRMED. 망막 저장소에 피부 런타임 의존성을 넣지 않는다 |
| EyeCare → LookScan PBM | NOT CONFIRMED |
| SVG-Analyzer → 제품 API | NOT CONFIRMED. 분석 대상일 뿐 요청 경로가 아님 |
| eyecare-platform → MEDI API | CONFIRMED 주석. `MEDI_BASE_URL` 은 선택이며 기본 추론 모드는 stub |

## 데이터 소유

| 데이터 | 소유 |
|---|---|
| 안과 환자 식별자와 암호화 | MEDI-IOT-EyeCare |
| 연구 대상자, 방문, 확정 관찰 | 통합 브랜치의 EyeCare 임상 지원. 머지 전이라 지정 HEAD 의 운영 데이터가 아님 |
| 소비자 사용자와 스캔 | LookScan |
| ordinal, 전처리 버전, 체크포인트 SHA | MEDI-SkinAI-Core 계약. 저장 행은 LookScan `skin_*` |
| PBM 장치 모델과 세션 시작 | LookScan |
| 인증 주체와 역할 정책 | shared-libraries. 환자 행과 소비자 행은 각 제품 DB |
| 분석 리포트 | SVG-Analyzer `reports`. 환자 데이터를 넣지 않는다 |

소비자 식별자와 임상 대상자 식별자는 자동으로 잇지 않는다. **PROPOSED** 연결은 별도 승인 없이 만들지 않는다.

## 배포 경계

- 개발: `docker-compose.dev.yml`. EyeCare API 호스트 8001, 게이트웨이 8090, Postgres 5452.
- 운영 파일: `docker-compose.prod.yml`. 같은 8001/8002/8003, Postgres 5432, Redis 6379, 게이트웨이 80. 이번 작업에서 기동하지 않았다.
- LookScan: `infra/docker-compose.yml` 8600 / 5456. 부모 compose 에 포함하지 않는다.
- SkinAI: 학습용 `docker/Dockerfile.train` 만 있고 공개 포트가 없다.
- SVG-Analyzer: 분석 이미지에 호스트 포트를 붙이지 않는다. 18480–18499 는 예약 기록이다.

## PC 역할

### PC1 — MEDIIOT-SKLEE

부모 플랫폼 통합, 여러 서비스 구조, 공유 인프라, 통합 시험, 배포 조율. 이 문서와 포트 표의 기준 사본은 PC1 작업 트리다.

### PC2 — SVG-SKLEE

SVG-Analyzer 와 REA, 임상 모듈 개발, 독립 시험, 분석과 검증.

공식 소스 동기화는 GitHub 다. SMB 공유는 PC 사이 읽기 전용 점검이다. 다른 PC 의 Git 작업 디렉터리를 SMB 로 수정하지 않는다.

## 승인 전 커밋 경계

커밋과 푸시는 하지 않았다. 승인 시 저장소마다 아래 파일만 포함한다.

| 저장소 | 포함할 파일 | 빼둘 기존 작업 |
|---|---|---|
| projects `main` | `PORT-ALLOCATION.md`, `docs/PLATFORM-ARCHITECTURE.md`, `docs/CROSS-PROJECT-INTEGRATION.md`, `docs/NETWORK-GUIDE.md` 의 참조 한 줄 | 서브모듈 포인터, compose, 스크립트, `.env`, 다른 미커밋 문서 |
| MEDI-IOT-EyeCare | `docs/PARENT-PLATFORM-REFERENCE.md` | 스크립트 수정, 모델, 통합 브랜치 SHA |
| MEDI-SkinAI-Core | `README.md`, `docs/DEVELOPMENT-ENVIRONMENT.md` 의 참조 한 줄 | 없음. 작업 트리는 이 변경 전에 깨끗했다 |
| LookScan | `PORT-ALLOCATION.md`, `docs/PARENT-PLATFORM-REFERENCE.md` | 앱, 온톨로지, 모바일, 기존 문서 수정 |
| shared-libraries | `docs/PARENT-PLATFORM-REFERENCE.md` | `main` 의 알림·결제·요구사항 수정, 통합 브랜치 |
| SVG-Analyzer | `docs/PORT_REGISTRY.md`, `README.md` 의 포트 문장 | 분석 코드 |

`docs/SKINAI-LOOKSCAN-EYECARE-INTEGRATION-ASSESSMENT.md` 는 앞선 분석 과제 산출물이다. 이번 아키텍처 커밋에 넣을지는 별도 결정이다.
