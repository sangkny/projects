# ============================================================
# run_harness.ps1 — Harness CLI PowerShell 래퍼
#
# 역할: docker compose exec 를 자동으로 앞에 붙여
#       컨테이너 내부의 python -m harness 를 실행합니다.
#
# 위치: projects/run_harness.ps1
# 실행: Windows PowerShell / PowerShell Core (pwsh)
#
# 사용법:
#   .\run_harness.ps1 smoke
#   .\run_harness.ps1 smoke --save
#   .\run_harness.ps1 domain software
#   .\run_harness.ps1 domain medical --save
#   .\run_harness.ps1 tags smoke safety
#   .\run_harness.ps1 all
#   .\run_harness.ps1 all --min-pass-rate 90
#   .\run_harness.ps1 compare
#   .\run_harness.ps1 compare --suite all
#   .\run_harness.ps1 compare --baseline /app/reports/harness/baseline.json
#   .\run_harness.ps1 --help
#   .\run_harness.ps1 smoke --log-level INFO
# ============================================================

param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$HarnessArgs
)

# ── 경로 설정 ──────────────────────────────────────────────
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $ScriptDir "docker-compose.dev.yml"
$Service     = "shared-libs"

# ── 색상 출력 헬퍼 ─────────────────────────────────────────
function Write-Info    { param($msg) Write-Host "[harness] $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "[harness] $msg" -ForegroundColor Green }
function Write-Warn    { param($msg) Write-Host "[harness] $msg" -ForegroundColor Yellow }
function Write-Err     { param($msg) Write-Host "[harness] ERROR: $msg" -ForegroundColor Red }

# ── 인수 없음 → 도움말 ─────────────────────────────────────
if ($HarnessArgs.Count -eq 0) {
    Write-Host ""
    Write-Host "Harness CLI 래퍼 (PowerShell)" -ForegroundColor White
    Write-Host ""
    Write-Host "사용법:"
    Write-Host "  .\run_harness.ps1 <COMMAND> [OPTIONS]"
    Write-Host ""
    Write-Host "COMMAND:"
    Write-Host "  smoke                   스모크 테스트 (~1분)"
    Write-Host "  domain <name>           도메인별 테스트 (software|medical|business)"
    Write-Host "  tags <tag1> [tag2 ...]  태그별 테스트"
    Write-Host "  all                     전체 테스트 (~15분)"
    Write-Host "  compare [--suite ...]   기준선 비교 (회귀 탐지)"
    Write-Host "  --help                  상세 도움말"
    Write-Host ""
    Write-Host "OPTIONS (공통):"
    Write-Host "  --save                  리포트 파일 저장"
    Write-Host "  --min-pass-rate RATE    최소 통과율 (기본 80)"
    Write-Host "  --log-level LEVEL       DEBUG|INFO|WARNING|ERROR (기본 WARNING)"
    Write-Host ""
    Write-Host "예시:"
    Write-Host "  .\run_harness.ps1 smoke --save"
    Write-Host "  .\run_harness.ps1 domain software --save --log-level INFO"
    Write-Host "  .\run_harness.ps1 compare --suite software"
    Write-Host ""
    exit 0
}

# ── Docker 실행 중인지 확인 ────────────────────────────────
$RunningServices = docker compose -f $ComposeFile ps --status running --services 2>$null
if ($RunningServices -notcontains $Service) {
    Write-Err "컨테이너 '$Service'가 실행 중이 아닙니다."
    Write-Warn "다음 명령으로 시작하세요:"
    Write-Warn "  docker compose -f $ComposeFile up -d"
    exit 1
}

# ── 실행 ───────────────────────────────────────────────────
$ArgsStr = $HarnessArgs -join " "
Write-Info "docker compose exec $Service python -m harness $ArgsStr"
Write-Host ""

docker compose -f $ComposeFile exec $Service python -m harness @HarnessArgs

$ExitCode = $LASTEXITCODE

Write-Host ""
if ($ExitCode -eq 0) {
    Write-Success "완료 (exit 0)"
} else {
    Write-Err "실패 (exit $ExitCode)"
}

exit $ExitCode
