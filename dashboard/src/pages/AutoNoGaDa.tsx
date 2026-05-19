import { useEffect, useState } from 'react'

import MetricsCard from '../components/MetricsCard'
import OntologyErrorList from '../components/OntologyErrorList'
import PipelineStatus from '../components/PipelineStatus'
import SVGPreview from '../components/SVGPreview'
import { fetchJson, fetchOntology, paths } from '../api/client'
import type { OntologyStats } from '../types'

function pct(n?: number): string {
  if (n == null || Number.isNaN(n)) return '—'
  return `${(n * 100).toFixed(1)}%`
}

type PipeResponse = {
  count: number
  pipelines: { task_id?: string; status?: string }[]
}

export default function AutoNoGaDa() {
  const [ont, setOnt] = useState<OntologyStats | null>(null)
  const [pipes, setPipes] = useState<PipeResponse | null>(null)
  const [cost, setCost] = useState<Record<string, unknown> | null>(null)
  const [svgTpl, setSvgTpl] = useState<unknown>(null)

  useEffect(() => {
    void fetchOntology('code').then(setOnt)
    void fetchJson<PipeResponse>(paths.autonMonitorActive).then(setPipes)
    void fetchJson<Record<string, unknown>>(paths.costSummary).then(setCost)
    void fetchJson<unknown>(paths.svgTypes).then(setSvgTpl)
  }, [])

  const pipeSamples =
    pipes?.pipelines.slice(0, 6).map((p, i) => ({
      id: `${p.task_id ?? i}-${i}`,
      label: `${String(p.task_id ?? 'task')} — ${String(p.status ?? '-')}`,
    })) ?? []

  return (
    <div className="page">
      <h1>AutoNoGaDa 코드 자동화</h1>

      <section className="grid-3">
        <MetricsCard
          title="ADK ontology 통과율 (금일)"
          value={pct(ont?.pass_rate)}
          subtitle={`금일 validations ${ont?.today_validations ?? '—'}`}
        />
        <MetricsCard
          title="활성 파이프라인"
          value={pipes?.count ?? '—'}
          subtitle="/monitor/active"
        />
        <MetricsCard
          title="비용 로그 상태"
          value={cost ? '(수신 됨)' : '개발자 토큰 필요'}
          subtitle="/cost/summary"
        />
      </section>

      <section className="grid-2 mt">
        <PipelineStatus
          title="실행 중 작업 요약"
          count={pipes?.count ?? 0}
          items={pipeSamples}
        />
        <div className="panel">
          <h3>SVG 템플릿 메타 (/svg/types)</h3>
          <pre className="code-block">
            {svgTpl ? JSON.stringify(svgTpl).slice(0, 640) + '…' : '미수신'}
          </pre>
        </div>
      </section>

      <div className="mt">
        <SVGPreview markup={undefined} title="실시간 SVG 미리보기" />
      </div>

      <div className="mt">
        <OntologyErrorList title="복합 ontology 오류" errors={ont?.top_errors ?? []} />
      </div>

      <div className="mt panel">
        <h3>domains_detail (software / polyglot / knowledge / cost)</h3>
        <table className="table compact">
          <thead>
            <tr>
              <th>domain</th>
              <th>n</th>
              <th>패스%</th>
            </tr>
          </thead>
          <tbody>
            {(ont?.domains_detail ?? []).map((d) => (
              <tr key={d.domain}>
                <td>{d.domain}</td>
                <td>{d.today_validations}</td>
                <td>{pct(d.pass_rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
