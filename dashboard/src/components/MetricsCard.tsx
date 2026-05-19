interface Props {
  title: string
  value: string | number
  subtitle?: string
}

export default function MetricsCard({ title, value, subtitle }: Props) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}</div>
      {subtitle ? <div className="card-sub muted">{subtitle}</div> : null}
    </div>
  )
}
