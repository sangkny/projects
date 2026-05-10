# 전체 회귀 테스트 요약 (Week 8 Day 1)

측정 일시: 2026-05-10 (Docker `docker-compose.dev.yml`, `LLM_PROVIDER=local` 기준)

## 결과 표

| 플랫폼 | 테스트 수 | 통과 | 실패 | 소요시간 |
|--------|----------|------|------|---------|
| shared-libraries | 33 | 33 | 0 | ~21m 36s (1295.70s) |
| MEDI-IOT-EyeCare | 74 | 74 | 0 | ~12m 23s (742.60s) |
| AutoNoGaDa-ADK | 14 | 14 | 0 | ~5s |
| CoOps-Platform | 4 | 4 | 0 | ~2s |
| **합계** | **125** | **125** | **0** | **~35m** (직렬 합계, 환경·LM Studio 부하에 따라 변동) |

## 실행 명령

```bash
docker compose -f docker-compose.dev.yml exec shared-libs \
  python -m pytest tests/ -q --tb=short

docker compose -f docker-compose.dev.yml exec medi-iot-api \
  python -m pytest tests/ -q --ignore=tests/test_e2e_week4_full_flow.py

docker compose -f docker-compose.dev.yml exec autonogada-api \
  python -m pytest tests/ -q

docker compose -f docker-compose.dev.yml exec coops-api \
  python -m pytest tests/ -q
```

## 비고

- `shared-libraries` 스위트는 LM Studio 연동·에이전트 통합 시나리오 포함으로 **가장 오래** 걸립니다.
- MEDI-IOT는 `test_report_gen`·`test_e2e` 등 **실 LLM 호출**이 포함됩니다.
- `test_e2e_week4_full_flow.py`는 명세에 따라 이번 요약에서 **제외**했습니다.
