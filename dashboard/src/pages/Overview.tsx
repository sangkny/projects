import { useEffect, useState } from 'react'

import MetricsCard from '../components/MetricsCard'
import OntologyErrorList from '../components/OntologyErrorList'
import { fetchHarnessLatest, fetchHealth, fetchOntology } from '../api/client'
import type { HarnessLatest, OntologyStats } from '../types'

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export default function Overview() {
  const [medi, setMedi] = useState<OntologyStats | null>(null)
  const [code, setCode] = useState<OntologyStats | null>(null)
  const [ops, setOps] = useState<OntologyStats | null>(null)
  const [harness, setHarness] = useState<HarnessLatest | null>(null)
  const [health, setHealth] = useState<Record<
    string,
    unknown
  > | null>(null)

  useEffect(() => {
    void fetchOntology('medi').then(setMedi)
    void fetchOntology('code').then(setCode)
    void fetchOntology('ops').then(setOps)
    void fetchHarnessLatest().then(setHarness)
    void fetchHealth().then((h) => setHealth(h as Record<string, unknown> | null))
  }, [])

  const ontologyAvgVals = [
    medi?.pass_rate,
    code?.pass_rate,
    ops?.pass_rate,
  ].filter((x): x is number => typeof x === 'number')

  const meanOnt =
    ontologyAvgVals.length > 0
      ? ontologyAvgVals.reduce((a, b) => a + b, 0) /
        ontologyAvgVals.length
      : undefined

  const mergedEr = [...(medi?.top_errors ?? []), ...(ops?.top_errors ?? [])]

  let harnessLine = '—'
  if (harness && harness.total > 0) {
    const pr =
      typeof harness.pass_rate === 'number'
        ? harness.pass_rate.toFixed(1)
        : ((100 * harness.passed) / harness.total).toFixed(1)
    harnessLine = `${harness.passed}/${harness.total} · ${pr}%`
  } else if (harness && harness.total === 0) {
    harnessLine = '0 시나리오'
  }

  return (
    <div className="page">
      <h1>통합 현황</h1>
      <p className="muted">
        Phase 2 Week 9 — Ontology 패스레이트, Harness 결과, 헬스
      </p>

      <section className="grid-3">
        <MetricsCard
          title="MEDI ontology 통과율"
          value={pct(medi?.pass_rate)}
          subtitle={`오늘 검증 수 ${medi?.today_validations ?? '—'}`}
        />
        <MetricsCard
          title="ADK ontology 통과율"
          value={pct(code?.pass_rate)}
          subtitle={`오늘 검증 수 ${code?.today_validations ?? '—'}`}
        />
        <MetricsCard
          title="CoOps ontology 통과율"
          value={pct(ops?.pass_rate)}
          subtitle={`오늘 검증 수 ${ops?.today_validations ?? '—'}`}
        />
      </section>

      <section className="stripe-ops mt">
        <h2 className="section-title">Stripe 운영 (B-7 R3)</h2>
        <p className="muted small">
          멀티 통화 minor·분쟁·USD 근사 메트릭은 Grafana{' '}
          <strong>SaaS Billing</strong> 대시보드 하단 &quot;Stripe R3&quot; 행에서 확인.
          로컬 Compose 기본: Grafana{' '}
          <a
            className="inline-link"
            href={`http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001/d/saas-billing-overview`}
            target="_blank"
            rel="noreferrer"
          >
            :3001/d/saas-billing-overview
          </a>
          · CoOps API 문서{' '}
          <a className="inline-link" href="/api/ops/docs" target="_blank" rel="noreferrer">
            /api/ops/docs
          </a>{' '}
          (billing/stripe — metered-usage, portal <code>flow</code>, checkout 프로모).
        </p>
      </section>

      <section className="grid-2 mt">
        <MetricsCard
          title="헬스 집계"
          value={health ? '(JSON 수신)' : '—'}
          subtitle="/api/health"
        />
        <MetricsCard
          title="Harness all_latest"
          value={harnessLine}
          subtitle={harness?.timestamp ?? ''}
        />
      </section>

      <section className="grid-3 mt">
        <MetricsCard title="3플랫폼 Ontology 평균" value={pct(meanOnt)} />
        <MetricsCard
          title="결재 대기 (CoOps)"
          value={ops?.pending_approvals ?? '—'}
        />
        <MetricsCard title="시나리오 수" value={harness?.total ?? '—'} />
      </section>

      <div className="mt">
        <OntologyErrorList
          title="MEDI + CoOps 상위 ontology 오류 (샘플)"
          errors={mergedEr.slice(0, 14)}
        />
      </div>
    </div>
  )
}
