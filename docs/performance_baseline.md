# API 응답 시간 기준선 (Week 7 Day 3)

로컬 Docker + LM Studio / 기본 헬스 기준입니다. 초과 시 DB·Redis·Nginx·외부 LLM 상태를 우선 확인합니다.

| 엔드포인트 | 목표 상한 |
|------------|-----------|
| `GET /health` | \< 100ms (DB ping 포함 시 다소 높아질 수 있음) |
| `POST /api/v1/diagnosis/ai-analyze` | \< 120s (CONSENSUS · LLM) |
| `POST /api/v1/pipeline/generate` | \< 120s (PIPELINE · LLM) |
| `POST /api/v1/approvals/request` | \< 1s (Ontology + DB 플러시, LLM 미포함 시) |

## 부하 테스트

호스트(Windows/Python 사용 가능 환경)에서 3 플랫폼 헬스에 동시 `GET`(포트 매핑 8001/8002/8003):

```bash
cd projects
python tests/load_test.py
```

Docker 네트워크 안에서 테스트할 때(예: 코드가 컨테이너 안에 마운트된 경우) 서비스 DNS를 씁니다.

```bash
LOAD_TEST_USE_DOCKER_DNS=1 python tests/load_test.py
```
