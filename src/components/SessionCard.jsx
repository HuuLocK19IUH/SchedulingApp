import { colorFor, TYPE_STYLE } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'

// Một khối môn trên lưới tuần (desktop). Đặt bằng gridColumn/gridRow
// theo thứ và khoảng tiết của buổi.
export function SessionCard({ session, isConflict, onSelect, dark = false }) {
  const c = colorFor(session.subject, dark)
  return (
    <button
      onClick={() => onSelect(session)}
      className="m-[2px] overflow-hidden rounded-lg p-1.5 text-left"
      style={{
        gridColumn: session.day + 2,
        gridRow: `${session.start + 1} / ${session.end + 2}`,
        background: c.bg,
        borderLeft: `4px solid ${c.border}`,
        boxShadow: isConflict ? '0 0 0 2px #dc2626 inset' : undefined,
      }}
    >
      <span className="block text-xs font-bold leading-tight" style={{ color: c.text }}>
        {isConflict ? '⚠️ ' : ''}{iconFor(session)} {session.subject}
      </span>
      <span className="mt-0.5 block text-[11px] leading-tight" style={{ color: c.text }}>
        Tiết {session.start}-{session.end}{session.room ? ` · ${session.room}` : ''}
      </span>
      {session.teacher && <span className="block truncate text-[11px]" style={{ color: c.text }}>{session.teacher}</span>}
      {session.type !== 'Học' && <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[session.type]}`}>{session.type}</span>}
    </button>
  )
}
