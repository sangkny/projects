#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT Week 3 최종 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Week 3 complete - image+RAG+history+cache (66 tests)

Summary of all Week 3 changes:
- services/cache.py: instance-level _client (fix event loop conflict)
- All 66 tests passing across 6 test files"
git log --oneline -5

echo ""
echo "══ projects repo 최종 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "feat: Week 3 complete - ch13 book + CURSOR_HANDOVER Week3 update

- book/part4/ch13-eye-analysis.md: VISION, RAG, trend, Redis caching
- CURSOR_HANDOVER.md: Week 3 done, Week 4 preparation
- docker-compose.dev.yml: pgvector/pgvector:pg15"
git log --oneline -5

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"

echo ""
echo "══ Final submodule status ══"
cd "$PROJ"
git submodule status

echo ""
echo "✅ Week 3 최종 완료"
