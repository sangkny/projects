import { useMemo, useEffect, useState } from 'react'

import OntologyErrorList from '../components/OntologyErrorList'
import { fetchOntology } from '../api/client'
import type { OntologyDomainSlice, OntologyStats } from '../types'

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export default function OntologyMonitor() {
  const [medi, setMedi] = useState<OntologyStats | null>(null)
  const [code, setCode] = useState<OntologyStats | null>(null)
  const [ops, setOps] = useState<OntologyStats | null>(null)

  useEffect(() => {
    void fetchOntology('medi').then(setMedi)
    void fetchOntology('code').then(setCode)
    void fetchOntology('ops').then(setOps)
  }, [])

  const slices: OntologyDomainSlice[] = useMemo(() => {
    const out: OntologyDomainSlice[] = []
    for (const svc of [medi, code, ops]) {
      for (const row of svc?.domains_detail ?? []) out.push(row)
    }
    return out
  }, [medi, code, ops])

  const codeFreq = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of slices) {
      for (const e of s.top_errors ?? []) {
        m.set(e.code, (m.get(e.code) ?? 0) + e.count)
      }
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([code, count]) => ({ code, count, message: '도메인 병합' }))
  }, [slices])

  return (
    <div className="page">
      <h1>Ontology Monitor</h1>
      <p className="muted">
        플랫폼 ontology/stats API의 domains_detail + 오류 빈도
      </p>

      <section className="panel">
        <h2>도메인별 패스레이트 (금일 검증 분모)</h2>
        <div className="dom-grid">
          {slices.map((s) => (
            <div key={s.domain} className="dom-cell">
              <div className="dom-name">{s.domain}</div>
              <div className="dom-rate">{pct(s.pass_rate)}</div>
              <div className="muted small">
                validations {s.today_validations}
              </div>
            </div>
          ))}
          {!slices.length ? (
            <p className="muted">ontology 응답 없음 또는 domains_detail 빈 목록</p>
          ) : null}
        </div>
      </section>

      <section className="mt">
        <OntologyErrorList
          title="오류 코드 병합 TOP (domains_detail 상위 버킷)"
          errors={codeFreq}
          emptyHint="통계 버킷이 비어 있습니다."
        />
      </section>
    </div>
  )
}
