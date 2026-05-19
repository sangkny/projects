import type { OntologyErrorBucket } from '../types'

interface Props {
  title: string
  errors: OntologyErrorBucket[]
  emptyHint?: string
}

export default function OntologyErrorList({
  title,
  errors,
  emptyHint,
}: Props) {
  if (!errors.length) {
    return (
      <div className="panel">
        <h3>{title}</h3>
        <p className="muted">{emptyHint ?? '표시할 오류 없음 (양호)'}</p>
      </div>
    )
  }
  return (
    <div className="panel">
      <h3>{title}</h3>
      <table className="table compact">
        <thead>
          <tr>
            <th>코드</th>
            <th>건수</th>
            <th>메시지</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((e) => (
            <tr key={`${e.code}-${e.count}`}>
              <td>
                <code>{e.code}</code>
              </td>
              <td>{e.count}</td>
              <td>{e.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
