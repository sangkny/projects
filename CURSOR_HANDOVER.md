# projects — Cursor Agent 인수인계

> 최종 업데이트: 2026-06-11 · Git: `3ec5e13`  
> **메타 HANDOVER**: `idea-collection/CURSOR_HANDOVER.md`

---

## 개발 스택

| 항목 | 경로 |
|------|------|
| Compose | `docker-compose.dev.yml` |
| 포트 SSOT | `PORT-ALLOCATION.md` |
| 네트워크 | `docs/NETWORK-GUIDE.md` |
| LM Studio | `:1234` · `.env.local.example` |

## Git 서브프로젝트

| repo | Git (2026-06-11) |
|------|------------------|
| MEDI-IOT-EyeCare | `ad299a6` |
| shared-libraries | `3f938b1` |
| dashboard | projects 내 |
| CoOps / ADK | projects 내 |

## LM Studio Docker 설정

```bash
cp .env.local.example .env.local
docker compose -f docker-compose.dev.yml up -d --force-recreate medi-iot-api
```

---

## 다음 우선순위

1. Dashboard Vite E2E (`dashboard/scripts/check-portal-e2e.mjs`)
2. `update_port_allocation.sh` — compose 변경 시 재실행
