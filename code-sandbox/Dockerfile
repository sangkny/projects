# Phase 2 W4 — 폴리glot 구문 검증 마이크로서비스
FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update && apt-get install -y --no-install-recommends nodejs rustc cargo \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g typescript@5.4.5

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .

EXPOSE 8010
HEALTHCHECK --interval=30s --timeout=10s CMD curl -sf http://127.0.0.1:8010/health || exit 1
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"]
