interface Props {
  title: string
  count: number
  items?: { id?: string; label: string }[]
}

/** 파이프라인 / 작업 상태 요약 */
export default function PipelineStatus({ title, count, items }: Props) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <p>
        활성 세션 수: <strong>{count}</strong>
      </p>
      {items && items.length ? (
        <ul className="muted small">
          {items.map((it) => (
            <li key={it.id ?? it.label}>{it.label}</li>
          ))}
        </ul>
      ) : (
        <p className="muted small">항목 없음 또는 익명 접근 불가</p>
      )}
    </div>
  )
}
