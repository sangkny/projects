interface Props {
  name: string
  domain?: string
  passed: boolean
  latencyMs?: number
}

export default function HarnessResultCard({
  name,
  domain,
  passed,
  latencyMs,
}: Props) {
  return (
    <div className={`harness-card ${passed ? 'pass' : 'fail'}`}>
      <div className="h-name">{name}</div>
      {domain ? <div className="h-dom muted">{domain}</div> : null}
      <div className="h-meta">{passed ? 'PASS' : 'FAIL'}</div>
      {latencyMs != null ? (
        <div className="muted small">{latencyMs.toFixed(0)} ms</div>
      ) : null}
    </div>
  )
}
