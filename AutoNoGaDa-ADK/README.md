# AutoNoGaDa-ADK (시작 준비)

코드 생성·Ontology 검증·PIPELINE 오케스트레이션을 위한 별도 FastAPI 마이크로서비스를 둘 예정입니다.

## 다음 단계 (WEEK4_PROMPTS.md 프롬프트 4-3-1)

1. GitHub 에 **Public** 저장소 `AutoNoGaDa-ADK` 생성 (소유자: sangkny).
2. WSL 또는 Windows에서 디렉터리 생성 후 `git clone` 또는 `git init` + 원격 추가.
3. 아래 초기 디렉터리를 채워 넣음:
   - `Dockerfile`
   - `requirements.txt`
   - `main.py`, `config.py`, `database.py`
   - `models/software.py`, `schemas/software.py`
   - `api/health.py`, `api/tasks.py`, `api/pipeline.py`
   - `services/code_analyzer.py`, `services/pipeline_runner.py`
4. `shared-libraries` 는 현재처럼 **볼륨 마운트** 또는 GIT submodule 로 연결하여  
   `Orchestrator(PIPELINE)` + `OntologyValidator(SOFTWARE)` 를 사용합니다.
5. `projects` 레포에는 이 폴더를 submodule 로 등록 (기존 MEDI-IOT-EyeCare 와 동일 패턴).

## 현재 상태

Week 4 Day 1~2 까지는 **MEDI-IOT EyeCare** 중심으로 작업합니다. 본 디렉터리는 Day 3 이전까지 **플레이스홀더 및 체크리스트** 역할입니다.
