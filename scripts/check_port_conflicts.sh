#!/bin/bash
# 전체 프로젝트 포트 충돌 점검 스크립트
# 사용법: bash scripts/check_port_conflicts.sh

echo "============================================"
echo " 포트 충돌 점검 $(date '+%Y-%m-%d %H:%M')"
echo "============================================"

# 1. 실행 중인 컨테이너 포트
echo ""
echo "[1] 현재 실행 중인 컨테이너 포트"
docker ps --format "  {{.Names}}: {{.Ports}}" | grep -v "^  :" | sort

# 2. 전체 프로젝트 포트 중복 스캔
echo ""
echo "[2] 전체 docker-compose 포트 중복 분석"
python3 << 'PYEOF'
import re
from collections import defaultdict

files = {
    'MEDI-IOT':   '/mnt/e/Office_Automation/idea-collection/projects/docker-compose.dev.yml',
    'SVG-New-Bot':'/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/docker-compose.yml',
    'SVG-Stock':  '/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/docker-compose.yml',
    'pronunciation':'/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/docker-compose.yml',
    'fin-stat':   '/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/docker-compose.yml',
    'proposal':   '/mnt/e/Office_Automation/svg-proposal-agent/docker-compose.yml',
    'paperclip':  '/mnt/e/Office_Automation/paperclipai/paperclip/docker-compose.yml',
}

port_map = defaultdict(list)
project_ports = {}

for proj, path in files.items():
    try:
        txt = open(path).read()
        ports = sorted(set(re.findall(r'"(\d+):\d+"', txt)), key=int)
        project_ports[proj] = ports
        for p in ports:
            port_map[p].append(proj)
    except:
        project_ports[proj] = ['(파일 없음)']

# 충돌 출력
conflicts = {p:v for p,v in port_map.items() if len(v)>1}
if conflicts:
    print('  ⚠️  충돌 발견:')
    for p, projs in sorted(conflicts.items(), key=lambda x: int(x[0])):
        print(f'    포트 {p:6s}: {" vs ".join(projs)}')
else:
    print('  ✅ 충돌 없음')

# 전체 현황 출력
print()
print('  전체 포트 현황:')
for proj, ports in project_ports.items():
    print(f'  {proj:15s}: {", ".join(ports)}')
PYEOF

# 3. PORT-ALLOCATION.md 동기화 확인
echo ""
echo "[3] PORT-ALLOCATION.md 동기화 상태"
MASTER="/mnt/e/Office_Automation/idea-collection/projects/PORT-ALLOCATION.md"
TARGETS=(
    "/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/PORT-ALLOCATION.md"
    "/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/PORT-ALLOCATION.md"
    "/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/PORT-ALLOCATION.md"
    "/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/PORT-ALLOCATION.md"
    "/mnt/e/Office_Automation/svg-proposal-agent/PORT-ALLOCATION.md"
    "/mnt/e/Office_Automation/paperclipai/paperclip/PORT-ALLOCATION.md"
)

for target in "${TARGETS[@]}"; do
    proj=$(basename $(dirname "$target"))
    if [ ! -f "$target" ]; then
        echo "  ❌ 없음: $target"
    elif diff -q "$MASTER" "$target" > /dev/null 2>&1; then
        echo "  ✅ 동기화: $proj"
    else
        echo "  ⚠️  차이 있음: $proj"
        diff "$MASTER" "$target" | head -5 | sed 's/^/      /'
    fi
done

# 4. 동기화 업데이트 옵션
echo ""
echo "============================================"
echo " PORT-ALLOCATION.md 전체 동기화하려면:"
echo "   bash scripts/sync_port_allocation.sh"
echo "============================================"
