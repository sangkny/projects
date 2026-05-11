# observability-stack — Prometheus + Grafana + Alertmanager 룰 (Step 5)

idea-collection Phase 2 Month 3 의 청킹 메트릭 (`chunking_*`) 을 수집·시각화·알람하는
관측 스택. **book §16.10.3 / §16.10.3.1 / §16.10.5** 의 SLO 와 운영 권고를 코드로 옮긴
형태이며, Step 4 의 `/metrics/prometheus` 엔드포인트가 이미 활성화된 3개 서비스
(`medi-iot-api`, `coops-api`, `autonogada-api`) 를 scrape 한다.

## 구성

```
observability-stack/
├── prometheus.yml          # scrape config + rule_files
├── alerts.yml              # SLO 알람 규칙 (5 + 1 메타)
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── prometheus.yml      # Prometheus 데이터소스 자동 등록
│   │   └── dashboards/
│   │       └── dashboards.yml       # 대시보드 자동 프로비저닝
│   └── dashboards/
│       └── chunking-overview.json   # 12-panel 대시보드 (4개 flow x 3분류)
└── README.md
```

## 기동

`projects/docker-compose.dev.yml` 에 두 서비스가 추가되어 있다:

```bash
cd projects
docker compose -f docker-compose.dev.yml up -d prometheus grafana
```

기동 후 즉시 사용 가능한 URL:

| URL | 용도 |
|-----|------|
| http://localhost:9090 | Prometheus UI (Targets · Alerts · Graph) |
| http://localhost:9090/alerts | SLO 알람 발화 상태 (Alertmanager 없이도 확인 가능) |
| http://localhost:9090/targets | 3개 서비스 scrape 성공 여부 |
| http://localhost:3001 | Grafana UI (`admin` / `admin`, 첫 로그인 후 변경) |
| http://localhost:3001/d/chunking-overview | 청킹 대시보드 (직링크) |

## 메트릭 매핑

`shared-libraries/observability/prom_metrics.py` 에서 노출되는 16종 `chunking_*`
메트릭이 라벨 `service` × `flow` × `strategy` × `domain` 으로 분리되어 Grafana
대시보드의 12개 패널에 매핑된다. 자세한 메트릭 정의는 book §16.10.3.1 표 참고.

## SLO 알람 (alerts.yml)

| Alert | 조건 | Severity |
|-------|------|----------|
| `ChunkingContextOverflow` | 5분간 `chunking_context_overflow_total` 증가 ≥ 1 | critical |
| `ChunkingFitsRateLow` | 5분 평균 `chunking_fits_context` < 0.9 | warning |
| `ChunkingOverlapInflationHigh` | 10분 평균 `chunking_overlap_inflation_ratio` > 1.5 | warning |
| `ChunkingFailureRateHigh` | 5분 실패율 > 5% | warning |
| `ChunkingTotalLatencyHigh` | p95 `chunking_total_seconds` > 30s, 10분 지속 | warning |
| `ChunkingNoInvocations` | 30분간 호출 0건 (sanity, dev 환경 무시 가능) | info |

## Alertmanager (선택)

이 스택에는 Alertmanager 컨테이너가 포함되지 않는다. Prometheus 의 `/alerts` UI
와 `/api/v1/rules` 가 발화 상태를 보여주므로 SLO 검증 1차 자료로 충분하다.
실제 알림 라우팅(Slack/Email) 이 필요하면 Alertmanager 서비스를 추가하고
`prometheus.yml` 의 `alerting:` 블록을 활성화한다.

## 검증

```bash
# 1. Prometheus targets — 3개 모두 UP
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job, instance, health}'

# 2. chunking_* 메트릭 출력
curl -s http://localhost:9090/api/v1/query?query=chunking_invocations_total | jq '.data.result'

# 3. 규칙 로드 확인
curl -s http://localhost:9090/api/v1/rules | jq '.data.groups[].name'
```

## 운영 가이드

- **새 flow 추가** 시 `shared-libraries/observability/prom_metrics.py` 의
  `observe_chunking_snapshot(..., service=...)` 만 호출하면 대시보드의 `service`
  변수 드롭다운에 자동 등장한다 (prometheus.yml 변경 불필요).
- **알람 임계값 조정** 은 `alerts.yml` 편집 → `docker exec prometheus-dev kill -HUP 1`
  (또는 `curl -X POST http://localhost:9090/-/reload`) 로 핫-리로드.
- **대시보드 변경** 은 Grafana UI 에서 편집 → "Save" → JSON 모델 export →
  `grafana/dashboards/chunking-overview.json` 에 덮어쓰기 (Git tracked).

자세한 운영 절차와 SLO 검증 양식은
[`book/part6/ch16-phase2-extensions.md`](../../book/part6/ch16-phase2-extensions.md)
§16.10.3 / §16.10.6 참고.
