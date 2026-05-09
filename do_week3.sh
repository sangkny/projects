#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT-EyeCare Week 3 Day 1 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Week 3 Day 1 - Image Upload API + pgvector + RAG tables

Image Upload API:
- api/images.py: POST /upload, GET /{id}, GET /{id}/analysis,
  POST /{id}/analyze, GET /patient/{id}
- models/medical.py: EyeImage model (ImageTypeEnum, vision analysis fields)
- services/eye_analyzer.py: analyze_image_file() with base64 encoding

pgvector + Knowledge Base:
- docker-compose.dev.yml: postgres -> pgvector/pgvector:pg15
- models/knowledge.py: MedicalDocument, DocumentEmbedding(768-dim), DiagnosisEmbedding
- alembic c45bcf9c73f7: eye_images + 3 knowledge tables + vector columns

Tests: 11/11 passed
- TestPgvector(3): v0.8.2 installed, vector column, 4 new tables
- TestImageUploadAPI(6): upload/get/list/format/type validation
- TestImageAnalysis(2): VISION model analyze + auto_analyze flag"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: Week 3 Day 1 submodule + docker-compose pgvector update"
git log --oneline -3

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"
echo "✅ Week 3 Day 1 완료"
