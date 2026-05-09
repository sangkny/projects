#!/usr/bin/env bash
set -euo pipefail

PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"
LIBS="${PROJ}/shared-libraries"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  STEP 1: MEDI-IOT-EyeCare"
echo "══════════════════════════════════════════════════════"
cd "$MEDI"
git config user.email "dev@mediiot.local"
git config user.name "MEDI-IOT Agent"

echo "--- git status ---"
git status --short

echo ""
git add -A

CHANGED=$(git diff --cached --stat | tail -1)
echo "staged: $CHANGED"

git commit -F .git_commit_msg
rm -f .git_commit_msg

echo ""
echo "--- log (최근 3개) ---"
git log --oneline -3

echo ""
echo "══════════════════════════════════════════════════════"
echo "  STEP 2: shared-libraries (변경 있으면 커밋)"
echo "══════════════════════════════════════════════════════"
cd "$LIBS"

git status --short

LIBS_CHANGED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$LIBS_CHANGED" -gt "0" ]; then
    git add -A
    git commit -m "chore: Week 2 Day 2 minor fixes"
    echo "커밋 완료"
else
    echo "변경사항 없음 — 커밋 스킵"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  STEP 3: projects repo (submodule 포인터)"
echo "══════════════════════════════════════════════════════"
cd "$PROJ"

git add -A
git status --short

git commit -F .git_commit_msg_projects
rm -f .git_commit_msg_projects

echo ""
echo "--- log (최근 3개) ---"
git log --oneline -3

echo ""
echo "══════════════════════════════════════════════════════"
echo "  STEP 4: Push (remote 있으면)"
echo "══════════════════════════════════════════════════════"

cd "$MEDI"
if git remote | grep -q origin; then
    git push origin HEAD 2>&1 && echo "MEDI-IOT push OK" || echo "MEDI-IOT push 실패 (remote 없음 가능)"
else
    echo "MEDI-IOT: remote 없음 — push 스킵"
fi

cd "$LIBS"
if git remote | grep -q origin; then
    git push origin HEAD 2>&1 && echo "shared-libs push OK" || echo "shared-libs push 실패"
else
    echo "shared-libs: remote 없음"
fi

cd "$PROJ"
if git remote | grep -q origin; then
    git push origin HEAD 2>&1 && echo "projects push OK" || echo "projects push 실패"
else
    echo "projects: remote 없음"
fi

echo ""
echo "══════════════════════════════════════════════════════"
echo "  STEP 5: submodule status 최종 확인"
echo "══════════════════════════════════════════════════════"
cd "$PROJ"
git submodule status

echo ""
echo "=== MEDI-IOT 최근 커밋 ==="
cd "$MEDI" && git log --oneline -3

echo ""
echo "=== shared-libs 최근 커밋 ==="
cd "$LIBS" && git log --oneline -3

echo ""
echo "✅ 전체 완료"
