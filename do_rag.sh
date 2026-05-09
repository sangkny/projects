#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT-EyeCare Week 3 Day 2 RAG 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Week 3 Day 2 - RAG Knowledge Base pipeline (9/9 tests)

KnowledgeBase service:
- services/knowledge_base.py: add_document (embed+store), search (cosine),
  get_rag_context (Markdown format), count_documents, fallback_text_search
- scripts/load_knowledge.py: 5 ophthalmology docs loaded
  (diabetic retinopathy, macular degeneration, glaucoma, ICD codes, AI safety)
- services/report_gen.py: RAG context integration (use_rag=True param)
  - KnowledgeBase.get_rag_context() injected into Orchestrator task

Tests 9/9 passed:
- TestKnowledgeBaseLoad(3): 5 docs + nomic-embed 768dim + duplicate skip
- TestKnowledgeBaseSearch(4): cosine similarity, ICD filter, category filter
- TestRAGContext(2): 1159-char context, empty on no match"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: Week 3 Day 2 RAG pipeline submodule update"
git log --oneline -3

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"
echo "✅ Week 3 Day 2 완료"
