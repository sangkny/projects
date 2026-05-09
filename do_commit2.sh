#!/usr/bin/env bash
set -euo pipefail

PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT-EyeCare 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: E2E tests 13/13 passed - full pipeline verified

- tests/test_e2e.py: TestHealthAPI(2) + TestPatientAPI(6) + TestDiagnosisAPI(3) + TestAIDiagnosis(2)
- AI diagnosis pipeline: H36.0 diabetic_retinopathy, ontology_passed=True, 85s
- tests/__init__.py + conftest.py added
- requirements.txt: pytest==9.0.3 added"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: E2E tests + book ch11 update submodule pointer"
git log --oneline -3

echo ""
echo "══ Push ══"
cd "$MEDI"
git push origin HEAD && echo "MEDI-IOT push OK"

cd "$PROJ"
git push origin HEAD && echo "projects push OK"

echo ""
echo "✅ 완료"
