# WSL + Docker + LM Studio 네트워크 완전 가이드

> 최종 업데이트: 2026-06-11  
> SSOT: `projects/docker-compose.dev.yml` · `projects/PORT-ALLOCATION.md`

---

## §1. 개발 환경 네트워크 구조

```
Windows (192.168.0.12)
  ├── LM Studio: 192.168.0.12:1234  (Serve on Local Network 필수)
  ├── WSL2: 172.29.192.x (가상 네트워크)
  │   ├── Docker 컨테이너들
  │   │   ├── medi-iot-api: 8001→8000
  │   │   ├── autonogada:   8002→8000
  │   │   └── coops-api:    8003→8000
  │   └── WSL 직접 실행
  └── GPU 서버: 192.168.0.23 (CNN 훈련 전용)
```

---

## §2. LM Studio 접근 방법

| 실행 환경 | LM Studio URL |
|----------|---------------|
| Windows PowerShell | `http://localhost:1234/v1` |
| WSL 직접 | `http://192.168.0.12:1234/v1` |
| Docker 컨테이너 | `http://host.docker.internal:1234/v1` |
| GPU 서버 (원격 LLM 테스트) | `http://192.168.0.12:1234/v1` |

**검증 완료 (2026-06-11)**

| 경로 | 결과 |
|------|------|
| WSL → LM Studio | ✅ 4모델 |
| Docker → LM Studio | ✅ 4모델 |
| `test_lm_chat_wsl.py` | ✅ `reply=안녕하세요` |

---

## §3. 포트 충돌 주의사항

### 문제 (2026-06-11)

- **SVG-Stock**이 호스트 **8000** 점유
- LM Studio 기본 포트 8000과 충돌
- Docker `host.docker.internal:8000` → **SVG-Stock**으로 연결됨 (LM Studio 아님)

### 해결

| 항목 | 설정 |
|------|------|
| LM Studio 포트 | **8000 → 1234** |
| LM Studio | **Serve on Local Network** ✅ |
| SVG-Stock | **단독 실행** 원칙 유지 (8000) |

---

## §4. `probe_lm_studio.py` CANDIDATES 우선순위

1. `LM_STUDIO_BASE_URL` 환경변수
2. `http://192.168.0.12:1234/v1` ← **현재 권장 (WSL)**
3. `http://172.29.192.1:1234/v1`
4. `http://127.0.0.1:1234/v1`
5. `http://localhost:1234/v1`
6. `http://host.docker.internal:1234/v1`
7~9. `:8000` fallback (SVG-Stock 충돌 시 실패 가능)

---

## §5. `docker-compose.dev.yml` 환경변수

```yaml
LOCAL_BASE_URL: http://host.docker.internal:1234/v1
LLM_SUMMARY_BASE_URL: http://host.docker.internal:1234/v1
```

`x-llm-env` 앵커가 MEDI / AutoNoGaDa / CoOps / shared-libs에 공통 적용됩니다.

---

## §6. LM Studio 설정 (필수)

| 설정 | 값 |
|------|-----|
| Port | **1234** |
| Serve on Local Network | **✅ 활성화** |

> 비활성화 시 WSL·Docker에서 Windows LM Studio에 접근할 수 없습니다.

---

## §7. 디버깅 체크리스트

- [ ] LM Studio **Serve on Local Network** 활성화
- [ ] SVG-Stock 중지 확인 (8000 충돌 방지)
- [ ] `curl http://192.168.0.12:1234/v1/models` 응답 확인
- [ ] `docker exec medi-iot-api-dev curl -s http://host.docker.internal:1234/v1/models`
- [ ] `python scripts/test_lm_chat_wsl.py` (shared-libraries)

---

## §8. Dashboard 접속 포트 (MEDI-IOT)

| URL | 제공 | 비고 |
|-----|------|------|
| `http://localhost:3000/dashboard/` | Docker `dashboard-dev` (nginx) | **정식 빌드** · `docker compose build dashboard` 산출물 |
| `http://localhost:8090/dashboard/` | Docker `api-gateway-dev` | 게이트웨이 경유 (호스트 **8090** 바인딩 필요) |
| `http://localhost:5174/dashboard/` | Vite dev (`npm run dev`) | compose **외부** · store/persist 변경 시 **재시작** |

| 호스트 | 서비스 | 용도 |
|--------|--------|------|
| **3000** | `dashboard` | Dashboard nginx (80) |
| **3001** | `grafana` | Grafana (내부 3000) |
| **3010** | `openclaw` | OpenClaw Agent Runtime |
| **8090** | `api-gateway` | API + `/dashboard/` 프록시 |

상세: `projects/PORT-ALLOCATION.md` · `dashboard/vite.config.ts` (5174)

---

## 관련 문서

- `projects/PORT-ALLOCATION.md` — 포트 배정 · SVG-Stock 경고
- `shared-libraries/docs/SCRIPTS-REFERENCE.md` — probe · chat 스크립트
- `idea-collection/CURSOR_HANDOVER.md` — GPU·LLM 인프라 구분
