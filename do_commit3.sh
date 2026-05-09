#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT-EyeCare 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Day3 EyeAnalyzer VISION model - 11/11 tests passed

- services/eye_analyzer.py: analyze() unified method + AnalysisResult dataclass
  - JSON structured output: condition/severity/icd10_code/confidence
  - 4 exam types: fundus, oct, visual_field, general
  - OntologyValidator(MEDICAL) integration
- tests/test_eye_analyzer.py: 11 tests (6 unit + 5 LLM)
  - TestEyeAnalyzerUnit: parsing logic (6/6, no LLM)
  - TestEyeAnalyzerFundus: H36.0 diabetic_retinopathy (VISION model)
  - TestEyeAnalyzerOCT: H35.34 macular_hole, confidence=0.98
  - TestEyeAnalyzerGlaucoma: H40.1 open_angle_glaucoma, IOP analysis
  - TestOntologyIntegration: validation pipeline"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: Day3 EyeAnalyzer submodule + book ch11 update"
git log --oneline -3

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"
echo "✅ 완료"
