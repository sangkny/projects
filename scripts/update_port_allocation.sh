#!/bin/bash
# docker-compose 실제 포트 → PORT-ALLOCATION.md 자동 재생성 + 배포
# 사용법: bash scripts/update_port_allocation.sh

set -e
MASTER="/mnt/e/Office_Automation/idea-collection/projects/PORT-ALLOCATION.md"
DATE=$(date '+%Y-%m-%d')

echo "============================================"
echo " PORT-ALLOCATION.md 자동 재생성 $DATE"
echo "============================================"

# 1. 각 프로젝트 실제 포트 추출
python3 << 'PYEOF'
import re, json
from collections import defaultdict

projects = {
    'MEDI-IOT': {
        'path': '/mnt/e/Office_Automation/idea-collection/projects/docker-compose.dev.yml',
        'dir':  '/mnt/e/Office_Automation/idea-collection/projects/',
        'note': '주력 안과 AI 플랫폼'
    },
    'SVG-New-Bot': {
        'path': '/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/docker-compose.yml',
        'dir':  '/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot/',
        'note': '챗봇 플랫폼'
    },
    'SVG-Stock': {
        'path': '/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/docker-compose.yml',
        'dir':  '/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP/',
        'note': '주식 추천 MVP (단독 실행 원칙)'
    },
    'pronunciation': {
        'path': '/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/docker-compose.yml',
        'dir':  '/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master/',
        'note': '발음 교정 앱'
    },
    'fin-stat': {
        'path': '/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/docker-compose.yml',
        'dir':  '/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template/',
        'note': '재무 분석'
    },
    'proposal': {
        'path': '/mnt/e/Office_Automation/svg-proposal-agent/docker-compose.yml',
        'dir':  '/mnt/e/Office_Automation/svg-proposal-agent/',
        'note': '제안서 에이전트'
    },
    'paperclip': {
        'path': '/mnt/e/Office_Automation/paperclipai/paperclip/docker-compose.yml',
        'dir':  '/mnt/e/Office_Automation/paperclipai/paperclip/',
        'note': 'PaperclipAI'
    },
}

# 포트 추출
port_map = defaultdict(set)
project_data = {}

for proj, info in projects.items():
    try:
        txt = open(info['path']).read()
        # "호스트:컨테이너" 패턴 추출
        ports = []
        for m in re.finditer(r'"(\d+):(\d+)"', txt):
            host_port = m.group(1)
            container_port = m.group(2)
            ports.append((host_port, container_port))
            port_map[host_port].add(proj)
        project_data[proj] = {
            'ports': sorted(set(ports), key=lambda x: int(x[0])),
            'note': info['note'],
            'dir': info['dir']
        }
    except FileNotFoundError:
        project_data[proj] = {'ports': [], 'note': info['note'] + ' (파일 없음)', 'dir': info['dir']}

# 충돌 감지
conflicts = {p:v for p,v in port_map.items() if len(v)>1}

# PORT-ALLOCATION.md 생성
import datetime
content = f"""# 개발 PC 전체 Docker 포트 배정표

> **자동 생성**: {datetime.date.today()} — `bash scripts/update_port_allocation.sh`
> **SSOT**: 각 프로젝트 `docker-compose.yml` (실제 포트 기준)
> **수정 방법**: docker-compose.yml 수정 후 이 스크립트 재실행
> **마스터 위치**: `projects/PORT-ALLOCATION.md`

---

## ⚠️ 충돌 현황

"""
if conflicts:
    content += "| 포트 | 충돌 프로젝트 |\n|------|-------------|\n"
    for p, projs in sorted(conflicts.items(), key=lambda x: int(x[0])):
        content += f"| **{p}** | {' vs '.join(projs)} |\n"
else:
    content += "✅ **MEDI-IOT compose 포트** — Docker 프로젝트 간 호스트 포트 충돌 없음\n"

# Docker 외부 서비스 (compose 자동 추출 대상 아님 — 수동 SSOT)
EXTERNAL_SERVICES = """
## 외부 서비스 (Docker 외부)

| 서비스 | 호스트 포트 | 실행 위치 | 비고 |
|--------|-----------|----------|------|
| **LM Studio** | **1234** | Windows (`192.168.0.12`) | Serve on Local Network 필수 |
| **GPU 서버 SSH** | **22** | `192.168.0.23` | `medi-train:gpu` · CNN 훈련 |
| GPU 서버 (Docker) | — | `192.168.0.23` | 호스트 포트 외부 미노출 |

### ⚠️ 포트 충돌 주의 (외부 서비스)

| 충돌 상황 | 결과 | 해결 |
|----------|------|------|
| SVG-Stock 실행 중 + LM Studio **8000** | ❌ LM Studio 접근 불가 | LM Studio **1234** 사용 |
| SVG-Stock + MEDI-IOT 동시 실행 | ⚠️ 호스트 **8000** 점유 | SVG-Stock **단독 실행** 원칙 |

### LM Studio 설정 (필수)

| 항목 | 값 |
|------|-----|
| Port | **1234** |
| Serve on Local Network | **✅ 활성화** |

**접근 URL**

| 환경 | URL |
|------|-----|
| PowerShell | `http://localhost:1234/v1` |
| WSL / Docker (호스트) | `http://192.168.0.12:1234/v1` |
| Docker 컨테이너 | `http://host.docker.internal:1234/v1` |

> 상세: `docs/NETWORK-GUIDE.md` · `docker-compose.dev.yml` `LOCAL_BASE_URL`
"""

content += EXTERNAL_SERVICES
content += "\n---\n\n## 프로젝트별 포트 현황\n\n"

for proj, data in project_data.items():
    content += f"### {proj}\n"
    content += f"> {data['note']}  \n"
    content += f"> 경로: `{data['dir']}`\n\n"
    if data['ports']:
        content += "| 호스트 포트 | 컨테이너 포트 |\n|------------|-------------|\n"
        for host, container in data['ports']:
            conflict = " ⚠️" if host in conflicts else ""
            content += f"| **{host}**{conflict} | {container} |\n"
    else:
        content += "_포트 없음 또는 파일 없음_\n"
    content += "\n"

content += """---

## 동시 실행 가능 조합

| 조합 | 가능 여부 | 비고 |
|------|----------|------|
| MEDI-IOT + SVG-New-Bot | ✅ 가능 | 포트 분리됨 |
| MEDI-IOT + pronunciation | ✅ 가능 | — |
| MEDI-IOT + paperclip | ✅ 가능 | — |
| MEDI-IOT + proposal | ✅ 가능 | — |
| SVG-Stock + 다른 프로젝트 | ⚠️ 주의 | 80/9000/8000 점유 — 단독 실행 권장 |
| LM Studio + SVG-Stock | ⚠️ 주의 | LM Studio는 **1234** (SVG-Stock이 8000 점유) |

---

## 관리 명령어

```bash
# 점검 (충돌 확인)
bash scripts/check_port_conflicts.sh

# 재생성 + 동기화 (docker-compose 수정 후)
bash scripts/update_port_allocation.sh
```
"""

with open('/mnt/e/Office_Automation/idea-collection/projects/PORT-ALLOCATION.md', 'w') as f:
    f.write(content)

print(f"마스터 생성 완료: {len(project_data)}개 프로젝트")
if conflicts:
    print(f"⚠️  충돌 {len(conflicts)}건: {list(conflicts.keys())}")
else:
    print("✅ 충돌 없음")

PYEOF

# 2. 각 프로젝트에 배포
echo ""
echo "배포 중..."
TARGETS=(
    "/mnt/d/sangkny/work/doc/external_activity/SVG-New-Bot"
    "/mnt/d/sangkny/work/doc/external_activity/SVG-Stock-Recommend-MVP"
    "/mnt/d/sangkny/work/doc/external_activity/Learning-Languages/pronunciation-master"
    "/mnt/d/sangkny/work/doc/external_activity/svg-fin-stat-analyzer/template"
    "/mnt/e/Office_Automation/svg-proposal-agent"
    "/mnt/e/Office_Automation/paperclipai/paperclip"
)

for dir in "${TARGETS[@]}"; do
    if [ -d "$dir" ]; then
        cp "$MASTER" "$dir/PORT-ALLOCATION.md"
        echo "  ✅ $(basename $dir)"
    else
        echo "  ❌ 없음: $dir"
    fi
done

echo ""
echo "============================================"
echo " 완료! 포트 변경 시 이 스크립트를 항상 실행"
echo "============================================"
