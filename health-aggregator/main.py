"""
3개 백엔드 /health 를 병렬 조회해 JSON으로 집계 (Nginx /api/health).
"""
from __future__ import annotations

import asyncio
import os
from typing import Any

import httpx
from fastapi import FastAPI, Response

app = FastAPI(title="Health Aggregator", version="0.1.0")

MEDICAL = os.getenv("BACKEND_MEDICAL_URL", "http://medi-iot-api:8000/health")
CODE = os.getenv("BACKEND_CODE_URL", "http://autonogada-api:8000/health")
OPS = os.getenv("BACKEND_OPS_URL", "http://coops-api:8000/health")


async def _get_json(client: httpx.AsyncClient, url: str) -> dict[str, Any]:
    try:
        r = await client.get(url, timeout=5.0)
        body: Any = r.json() if r.headers.get("content-type", "").startswith(
            "application/json"
        ) else {"raw": r.text[:500]}
        return {"http_status": r.status_code, "body": body}
    except Exception as e:
        return {"http_status": None, "error": str(e)}


@app.get("/aggregate")
async def aggregate() -> dict[str, Any]:
    async with httpx.AsyncClient() as client:
        med, code, ops = await asyncio.gather(
            _get_json(client, MEDICAL),
            _get_json(client, CODE),
            _get_json(client, OPS),
        )

    overall = "ok"
    for block in (med, code, ops):
        if block.get("http_status") != 200:
            overall = "degraded"
            break

    return {
        "status": overall,
        "services": {
            "medical": med,
            "code":    code,
            "ops":     ops,
        },
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "health-aggregator"}


@app.get("/metrics")
async def metrics() -> Response:
    return Response(
        "# health-aggregator exposes aggregate only\n",
        media_type="text/plain; version=0.0.4",
    )
