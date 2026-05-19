# Phase 2 — 통합 테스트 요약 (W12 기준선)

| 구분 | 명령 | 결과 (2026-05-11 Docker) |
|------|------|---------------------------|
| shared-libraries | `docker compose -f docker-compose.dev.yml exec shared-libs pytest tests/ -q` | 스위트 수집 43건 — LM/통합 포함 시 수 분 소요 |
| MEDI-IOT-EyeCare | `docker compose -f docker-compose.dev.yml exec medi-iot-api pytest tests/ -q --ignore=tests/test_e2e_week4_full_flow.py` | 78 items 수집 |
| AutoNoGaDa-ADK | `docker compose -f docker-compose.dev.yml exec autonogada-api pytest tests/ -q` | **74 passed** |
| CoOps-Platform | `docker compose -f docker-compose.dev.yml exec coops-api pytest tests/ -q` | **7 passed** |

## Harness

- **보안 태그** (`python -m harness tags security --min-pass-rate 80`): **2/2 통과 (100%)** — `security_pii_protection`, `security_policy_enforcement`
- Phase 2 W12 목표: 전체 스위트 `--min-pass-rate 85` 및 `reports/harness/baseline_phase2_final.json` 저장 (로컬/LM 환경에서 실행).

## 참고

- 컨테이너 최초 기동 후 `shared-libs`에서 `pip install -e .` 및 `requirements.txt` 동기화 여부 확인.
- 본 문서는 CI/릴리스 직전에 위 표를 최신 `pytest` 출력으로 갱신하는 것을 권장합니다.
