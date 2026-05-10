"""
Week 7 Day 3 — /health 동시 호출 간단 부하 스크립트 (호스트 Python).

실행: 프로젝트 루트 `projects/` 에서
  python tests/load_test.py

컨테이너(shared-libs 등) 안에서 같은 compose 네트워크로 테스트할 때:
  LOAD_TEST_USE_DOCKER_DNS=1 python tests/load_test.py
"""
from __future__ import annotations

import asyncio
import os
import sys
from statistics import mean, stdev

import httpx

BASE_URLS = {
    "medi-iot": "http://localhost:8001",
    "autonogada": "http://localhost:8002",
    "coops": "http://localhost:8003",
}
if os.environ.get("LOAD_TEST_USE_DOCKER_DNS", "").strip().lower() in ("1", "true", "yes"):
    BASE_URLS = {
        "medi-iot": "http://medi-iot-api:8000",
        "autonogada": "http://autonogada-api:8000",
        "coops": "http://coops-api:8000",
    }


async def test_health_endpoint(
    client: httpx.AsyncClient,
    url: str,
    n: int = 20,
) -> dict[str, int | float]:
    times: list[float] = []
    errors = 0
    tasks = [client.get(f"{url}/health") for _ in range(n)]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    for r in results:
        if isinstance(r, Exception):
            errors += 1
        else:
            times.append(float(r.elapsed.total_seconds() * 1000))
    return {
        "count":          n,
        "errors":         errors,
        "avg_ms":         round(mean(times), 1) if times else 0.0,
        "max_ms":         round(max(times), 1) if times else 0.0,
        "stdev_ms": round(stdev(times), 1) if len(times) > 1 else 0.0,
    }


async def main() -> None:
    timeout = float(sys.argv[1]) if len(sys.argv) > 1 else 30.0
    async with httpx.AsyncClient(timeout=timeout) as client:
        print("=== 부하 테스트 시작 (/health 동시 요청 ×20) ===")
        for name, url in BASE_URLS.items():
            result = await test_health_endpoint(client, url, n=20)
            print(f"{name}: {result}")


if __name__ == "__main__":
    asyncio.run(main())
