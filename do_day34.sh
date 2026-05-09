#!/usr/bin/env bash
set -euo pipefail
PROJ="/mnt/e/Office_Automation/idea-collection/projects"
MEDI="${PROJ}/MEDI-IOT-EyeCare"

echo "══ MEDI-IOT Day 3+4 커밋 ══"
cd "$MEDI"
git add -A
git status --short
git commit -m "feat: Week 3 Day 3+4 - Patient history + Redis caching (13/13 tests)

Day 3 - Patient History API:
- api/patients.py: GET /history (exam+diagnosis full record),
  GET /trend (IOP/vision timeseries + alerts), GET /reports (with filter)
- services/trend_analyzer.py: TrendSummary(improving/stable/worsening),
  linear regression slope, IOP/vision alerts, recommendations

Day 4 - Redis Smart Caching:
- services/cache.py: diagnosis(24h), embedding(7d), trend(1h) cache
  + invalidate, stats, ping
- Trend API: Redis 1h cache with cached=True/False flag

Tests 13/13 passed (2.64s, no LLM):
- TestPatientHistoryAPI(3): full history, code lookup, empty case
- TestPatientTrendAPI(2): worsening detection + Redis cache hit, insufficient_data
- TestPatientReportsAPI(2): empty list, only_passed filter
- TestCacheService(6): diagnosis/embed cache, miss, stats, invalidation, ping"
git log --oneline -3

echo ""
echo "══ projects repo 커밋 ══"
cd "$PROJ"
git add -A
git commit -m "chore: Week 3 Day 3+4 submodule update (history + cache)"
git log --oneline -3

echo "══ Push ══"
cd "$MEDI" && git push origin HEAD && echo "MEDI-IOT push OK"
cd "$PROJ" && git push origin HEAD && echo "projects push OK"
echo "✅ Week 3 Day 3+4 완료"
