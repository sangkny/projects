interface Props {
  /** SVG 문자열 또는 HTML 이스케이프된 문자열 */
  markup?: string | null
  title?: string
}

export default function SVGPreview({ markup, title }: Props) {
  if (!markup) {
    return (
      <div className="svg-box muted">
        {title ?? 'SVG'} — 데이터 없음 (POST 생성 API는 JWT 필요)
      </div>
    )
  }
  return (
    <div className="svg-box">
      {title ? <div className="small muted">{title}</div> : null}
      {/* eslint-disable-next-line react/no-danger */}
      <div className="svg-inner" dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  )
}
