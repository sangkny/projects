#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT-EyeCare 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Day4 ReportGenerator tests + coverage (9 tests, report_gen 71%)

- tests/test_report_gen.py: 9 tests across 4 classes
  TestReportGenUnit(5): _build_task/_parse_report unit tests
  TestReportGenDiabetic(2): CONSENSUS H36.0 2000-char report, iter=2
  TestReportGenGlaucoma(1): pipeline H40.1, ontology_passed=True
  TestEyeAnalyzerToReport(1): EyeAnalyzer->ReportGenerator pipeline
- pytest.ini added (asyncio=auto, coverage config)
- requirements.txt: pytest-cov added
- Coverage: config=97%, models=96%, report_gen=71%, eye_analyzer=43%
- api/ coverage 0%: httpx E2E runs in separate server process"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: Day4 submodule + book ch11 coverage update"
git log --oneline -3

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"
echo "✅ 완료"
