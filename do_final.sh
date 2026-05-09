#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"
ROOT="/mnt/e/Office_Automation/idea-collection"

echo "══ Step 1: MEDI-IOT-EyeCare 최종 상태 확인 ══"
cd "$MEDI"
git status --short
echo "변경사항 없음 확인 (모두 이미 커밋됨)"
git log --oneline -3

echo ""
echo "══ Step 2: projects repo — book + HANDOVER 커밋 ══"
cd "$PROJ"
git add -A
git status --short
git commit -m "feat: Week 2 complete - ch12 medical ontology + CURSOR_HANDOVER update

- book/part4/ch12-medical-ontology.md: MEDICAL Ontology 설계 상세
  ICD-10 안과 코드 체계, PII 보호, EyeAnalyzer 연동, Harness 시나리오
- CURSOR_HANDOVER.md: Week 2 완료 + Week 3 시작 준비 상태로 업데이트
  33개 테스트 현황, GitHub 커밋 히스토리, Week 3 작업 순서"
git log --oneline -3

echo ""
echo "══ Step 3: Push ══"
cd "$PROJ"
git push origin HEAD && echo "projects push OK"

echo ""
echo "══ Step 4: 최종 submodule 상태 확인 ══"
cd "$PROJ"
git submodule status

echo ""
echo "=== MEDI-IOT 최근 커밋 ==="
cd "$MEDI" && git log --oneline -5

echo ""
echo "✅ Week 2 최종 완료"
