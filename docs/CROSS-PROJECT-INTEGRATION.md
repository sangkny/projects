# 프로젝트 사이 통합 계약

구현된 호출과 제안 필드를 구분한다. 포트는 [PORT-ALLOCATION.md](../PORT-ALLOCATION.md), 소유와 PC 역할은 [PLATFORM-ARCHITECTURE.md](PLATFORM-ARCHITECTURE.md) 를 본다.

탐색적 피부 점수를 검증된 임상 끝점으로 올리지 않는다. 소비자 계정과 임상 대상자를 자동으로 연결하지 않는다.

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
FILES_CHANGED: docs/CROSS-PROJECT-INTEGRATION.md
VALIDATION: PROPOSED 계약을 구현된 API로 적지 않음
OPEN_ISSUES: Clinical Query 계약은 Phase 007 검토 후 별도 기록
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
FILES_CHANGED: docs/CROSS-PROJECT-INTEGRATION.md
VALIDATION: SkinAnalyzer, LookScan scans/pbm/skin_candidate, EyeCare 통합 라우터 파일을 대조. 새 API 는 만들지 않음.
OPEN_ISSUES: 아래 PROPOSED 필드는 스키마 초안이다. 승인 없이 마이그레이션하지 않는다. Clinical Query 계약은 구현 파일을 찾기 전에는 비워 둔다.
```

## 값의 종류

| 종류 | 의미 | 현재 예 |
|---|---|---|
| 원천 관찰 | 사람이 확정한 방문 기록 | 통합 브랜치 임상 관찰. 지정 HEAD 에는 없음 |
| 알고리즘 측정 | 영상에서 계산한 값 | LookScan `wrinkle_metrics`, SkinAI ordinal |
| 예측 | 이후 시점 추정 | SkinAI `forecast_series`. 치료 효과 주장이 아님 |
| 임상 끝점 | 연구 계획에서 확정한 평가 변수 | 이번 코드에서 피부 점수로 확정된 끝점 없음 |
| 웰니스 표시 | 소비자 참고 문구 | LookScan `interpret_skinai` 의 `reference_indicator_only` |

SkinAI `accuracy_claim` 은 거짓이다. 설문 Baumann 과 이미지 Baumann 은 `baumann_sources_merged = False` 로 나뉘어 있다. 이 분리를 유지한다.

## 이미 있는 경계

| 계약 | 상태 | 근거 |
|---|---|---|
| 얼굴 기하 | CONFIRMED | `GEOMETRY_PROVIDER = caller_face_bbox`. SkinAI 는 검출하지 않음 |
| Appearance5 출력 | CONFIRMED | pigmentation, redness, wrinkle, pore, inflammation |
| 모델 식별 | CONFIRMED | 레지스트리 JSON, 체크포인트 SHA 불일치 거부, `RELEASED` 거부 |
| 종단 비교 | CONFIRMED | 모델·전처리·보정 여부가 같을 때만 |
| 기본 스캔 | CONFIRMED | `create_scan` → `analyze_image_bytes` |
| 후보 추론 | CONFIRMED | `execute_candidate` 는 `analysis_engine=skinai_candidate` 만 수행하고 `cv_analysis` 를 부르지 않음 |
| PBM 시작 | CONFIRMED | 장치 모델 ID, 사용자 연결, `started_at`, 파장 nm·세기 상한 |
| 임상 지원 HTTP | CONFIRMED, 미머지 | `/clinical-support`. 통합 HEAD `8d59f10` |
| 소비자 ID = 대상자 ID | NOT IMPLEMENTED | 자동 연결 코드 없음 |
| EyeCare 가 SkinAI 를 호출 | NOT IMPLEMENTED | |
| 공통 PBM 세션 테이블 | NOT IMPLEMENTED | |

## 제안 인터페이스

아래는 **PROPOSED** 다. 어느 저장소에도 이 이름 그대로의 공통 API 는 없다.

공통 참조는 식별자와 출처만 담는다. 장치별 치료 절차는 페이로드로 남긴다.

### 사용자와 대상자

```
subject_ref:
  namespace: eyecare-clinical | lookscan-consumer
  id: 각 저장소의 기본 키
  link: null
```

`link` 는 승인된 연구 연결이 생기기 전에는 null 이다.

### 영상 획득과 출처

```
image_ref:
  owner: lookscan | eyecare
  capture_id
  acquired_at
  geometry_provider    # SkinAI 경로에서는 caller_face_bbox
  chart_status         # PRESENT | ABSENT | UNCERTAIN | 해당 없음
```

안저 파일과 얼굴 파일은 저장소를 섞지 않는다.

### 모델 신원

```
model_ref:
  name                 # 예: appearance5-effb0-20261011T004014Z
  status               # CANDIDATE 를 RELEASED 로 올리지 않음
  checkpoint_sha256
  contract_version     # skinai_inference_contract_v1
  preprocess_version   # SKINAI_FACE_PREPROCESS_V1
  git_sha              # LookScan 은 core_git_sha 를 이미 저장할 수 있음
```

### AI 측정

```
measurement:
  kind: algorithm_measurement | prediction | wellness_indicator
  task                 # pigmentation 등. 임상 끝점 이름 아님
  value
  comparison_key       # 종단 호환 키
  source_image_ref
```

임상 관찰 열에 이 객체를 넣지 않는다. 연구가 필요하면 관찰의 외부 참조로 measurement id 만 둔다.

### PBM

공통으로 제안하는 필드: 장치 모델 ID, 사용자 또는 대상자 참조, 시작 시각, 종료 시각, 수행 여부.

LookScan 이 이미 쓰는 것: 장치 모델 ID, 사용자 연결, 시작 시각, 파장·세기 상한 검사.

아직 없는 것: 종료 시각 API, 펌웨어 버전, 고장 이벤트. **PROPOSED** 고장 레코드는 `device_id`, `occurred_at`, `code`, `severity` 만 두고, 파장 프로토콜은 LookScan 페이로드에 남긴다.

MEDI-EYE 안저 장비의 촬영 설정은 이 PBM 페이로드에 넣지 않는다. 세션 시각과 장치 모델 ID 만 같은 모양을 쓸 수 있다.

### 종단 측정

SkinAI `comparison_key` 와 전처리 버전이 같아야 비교한다. EyeCare `prognosis_tracker` 와 피부 추세는 같은 시계열이 아니다.

### 연구 참조와 품질

```
study_ref:
  study_id             # /clinical-support 의 연구. 통합 브랜치가 머지된 뒤
  subject_ref
  visit_id
  external_measurement_id
```

품질 발견은 임상 품질 실행 결과와, 영상 쪽 차트·얼굴 상자 실패를 한 등급으로 합치지 않는다. 안저 QC 와 얼굴 차트 상태는 각각 자기 저장소 용어를 유지한다.

### Clinical Query

`feat/clinical-query-quality-007` `87aea03` 에 생성, 배정, 응답, 해결, 재오픈이 있다. 이 커밋은 임상 지원 브랜치 `a8661d5` 위이고, 보안 강화가 합쳐진 `8d59f10` 에는 아직 없다. 부모 플랫폼에 배포된 계약이 아니다. 통합 전에는 PROPOSED 로 둔다.

상태 전이는 `open → answered → resolved → reopened → answered` 다. 품질 실행은 같은 브랜치의 `services/clinical_quality.py` 에 있고, 호출 권한 이름은 shared-libraries `a9d2dbd` 의 `clinical_query_*`, `clinical_quality_*` 다. 그 정책 커밋은 통합 브랜치 `fd7f62e` 에 아직 없다.

## 데이터 품질과 감사

통합 브랜치의 품질 실행과 감사는 임상 레코드용이다. SkinAI SHA 와 LookScan `core_git_sha` 는 알고리즘 출처다. 둘을 한 감사 테이블로 합치는 작업은 **PROPOSED** 이며 이번 범위 밖이다.
