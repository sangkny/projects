import { useEffect, useState } from 'react'

import MetricsCard from '../components/MetricsCard'
import OntologyErrorList from '../components/OntologyErrorList'
import { fetchOntology } from '../api/client'
import type { OntologyStats } from '../types'

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export default function CoOps() {
  const [ops, setOps] = useState<OntologyStats | null>(null)

  useEffect(() => {
    void fetchOntology('ops').then(setOps)
  }, [])

  const hi = ops?.high_risk_contracts ?? []

  return (
    <div className="page">
      <h1>CoOps 운영 / 계약 AI</h1>

      <section className="grid-3">
        <MetricsCard
          title="BUSINESS ontology 통과율 (금일 분석)"
          value={pct(ops?.pass_rate)}
          subtitle={`validations 합계 ${ops?.today_validations ?? '—'}`}
        />
        <MetricsCard
          title="결재 대기"
          value={ops?.pending_approvals ?? '—'}
        />
        <MetricsCard
          title="고위험 계약 레코드 (샘플)"
          value={hi.length}
          subtitle="risk_level ∈ {high,critical}"
        />
      </section>

      <section className="panel mt">
        <h2>고위험 분석 결과</h2>
        <table className="table compact">
          <thead>
            <tr>
              <th>계약 번호</th>
              <th>위험</th>
              <th>ontology 통과</th>
            </tr>
          </thead>
          <tbody>
            {hi.map((row) => (
              <tr key={row.contract_number}>
                <td>{row.contract_number}</td>
                <td>{row.risk_level}</td>
                <td>{row.ontology_passed ? '✔' : '✖'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!hi.length ? (
          <p className="muted">등록된 고위험 분석 결과가 없습니다.</p>
        ) : null}
      </section>

      <div className="mt">
        <OntologyErrorList title="비즈니스 ontology 오류" errors={ops?.top_errors ?? []} />
      </div>
    </div>
  )
}
