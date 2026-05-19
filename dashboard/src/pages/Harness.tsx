import { useEffect, useMemo, useState } from 'react'

import HarnessResultCard from '../components/HarnessResultCard'
import { fetchHarnessLatest } from '../api/client'
import type { HarnessLatest } from '../types'

export default function HarnessPage() {
  const [rep, setRep] = useState<HarnessLatest | null>(null)

  useEffect(() => {
    void fetchHarnessLatest().then(setRep)
  }, [])

  const grouped = useMemo(() => {
    const m = new Map<string, HarnessLatest['results']>()
    for (const row of rep?.results ?? []) {
      const prev = m.get(row.domain) ?? []
      prev.push(row)
      m.set(row.domain, prev)
    }
    return m
  }, [rep])

  if (!rep) {
    return (
      <div className="page">
        <h1>Harness 결과</h1>
        <p className="muted">
          리포트를 불러오지 못했습니다 (게이트웨이
          {' '}
          <code>/harness-report/all_latest.json</code>
          마운트 확인).
        </p>
      </div>
    )
  }

  let passLbl = '—'
  if (typeof rep.pass_rate === 'number') passLbl = `${rep.pass_rate.toFixed(1)}%`
  else if (rep.total > 0) {
    passLbl = `${((100 * rep.passed) / rep.total).toFixed(1)}%`
  }

  return (
    <div className="page">
      <h1>Harness 시나리오</h1>
      <p className="muted">
        실행 시각 <code>{rep.timestamp}</code>
        {' · 총 '}
        {((rep.total_ms ?? 0) / 1000).toFixed(1)}초
      </p>
      <p className="summary-line">
        통과 <strong>{rep.passed}</strong>/<strong>{rep.total}</strong> — 패스
        레이트 <strong>{passLbl}</strong>
      </p>

      {[...grouped.entries()].map(([domain, rows]) => (
        <section key={domain} className="mt">
          <h2>{domain}</h2>
          <div className="harness-results">
            {rows.map((r) => (
              <HarnessResultCard
                key={r.scenario_name}
                name={r.scenario_name}
                domain={r.domain}
                passed={r.passed}
                latencyMs={r.latency_ms}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
