import { useEffect, useState } from 'react'

import MetricsCard from '../components/MetricsCard'
import OntologyErrorList from '../components/OntologyErrorList'
import { fetchJson, fetchOntology, paths } from '../api/client'
import type { OntologyStats } from '../types'

interface MediStatsBody {
  exams_today?: number
  ontology_validator_warnings?: { patient_code?: string }[]
}

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

export default function MediIOT() {
  const [ont, setOnt] = useState<OntologyStats | null>(null)
  const [stats, setStats] = useState<MediStatsBody | null>(null)

  useEffect(() => {
    void fetchOntology('medi').then(setOnt)
    void fetchJson<MediStatsBody>(paths.mediDashboardStats).then(setStats)
  }, [])

  const warnCt = stats?.ontology_validator_warnings?.length

  return (
    <div className="page">
      <h1>MEDI-IOT 안과 플랫폼</h1>
      <section className="grid-3">
        <MetricsCard
          title="오늘 검사 수"
          value={stats?.exams_today ?? '토큰/권한 필요'}
          subtitle="/api/v1/dashboard/stats (admin)"
        />
        <MetricsCard
          title="for_medical 통과율 (금일)"
          value={pct(ont?.pass_rate)}
          subtitle="/api/v1/ontology/stats"
        />
        <MetricsCard
          title="Ontology 미통과 진단 알림 건수"
          value={
            stats && typeof warnCt === 'number' ? warnCt : '통계 미수신 또는 403'
          }
          subtitle={
            ont && warnCt !== undefined ? '실제 검사 증분은 대시 보드 KPI 참고' : ''
          }
        />
      </section>

      <div className="mt">
        <OntologyErrorList
          title="최근 medical ontology 오류 버킷"
          errors={ont?.top_errors ?? []}
          emptyHint="오늘 검증 레코드가 없거나 버킷이 비어 있습니다."
        />
      </div>
    </div>
  )
}
