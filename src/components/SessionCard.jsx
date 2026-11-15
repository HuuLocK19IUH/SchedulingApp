import { cellStyleFor, TYPE_STYLE } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'
import { PERIOD_TIMES, timeRange } from '../lib/time.js'

// Một khối môn trên lưới tuần (desktop). Đặt bằng gridColumn/gridRow
// theo thứ và khoảng tiết của buổi. Nền ô mã hóa HÌNH THỨC (Part 9:
// thực hành xanh lá, lý thuyết xám nhạt, thi vàng nhạt), viền trái là
// thanh nhấn màu môn, giờ + phòng tách dòng riêng để đọc nhanh.
//
// NGUYÊN NHÂN THẬT của lỗi "bấm buổi học lại mở form thêm mới" (Part 10):
// các ô trống trong WeekGrid có class `relative` (positioned), còn nút
// này trước đây KHÔNG có vị trí (static). Theo thứ tự vẽ của CSS,
// phần tử positioned vẽ TRÊN phần tử không positioned trong cùng một
// stacking context — bất kể thứ tự DOM — nên 112 ô trống trong suốt
// đè lên khối môn và chặn mọi cú bấm: bấm vào buổi học thực chất là bấm
// vào ô trống bên dưới, mở form thêm mới với đúng thứ/tiết đó. Khối
// `.card`/lưới chứa chúng đều không có position nên không cứu được.
// Sửa ở phía khối môn: thêm `relative` — vì khối môn render SAU các ô
// trống trong DOM nên khi cả hai đều positioned thì khối môn vẽ trên.
// Không bỏ `relative` ở ô trống (giữ nguyên hành vi hover "+").
// stopPropagation là đai an toàn thứ hai: bấm vào khối môn không bao
// giờ lọt xuống ô trống bên dưới.
export function SessionCard({ session, isConflict, onSelect, dark = false, times = PERIOD_TIMES }) {
  const c = cellStyleFor(session, dark)
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(session) }}
      className="transition-soft relative m-[2px] overflow-hidden rounded-lg p-1.5 text-left hover:-translate-y-px hover:shadow-md motion-reduce:transform-none"
      style={{
        gridColumn: session.day + 2,
        gridRow: `${session.start + 1} / ${session.end + 2}`,
        background: c.bg,
        borderLeft: `4px solid ${c.border}`,
        boxShadow: isConflict ? '0 0 0 2px #dc2626 inset' : undefined,
      }}
    >
      <span className="block truncate text-xs font-bold leading-tight" style={{ color: c.text }} title={session.subject}>
        {isConflict ? '⚠️ ' : ''}{iconFor(session)} {session.subject}
      </span>
      <span className="mt-0.5 block truncate text-[11px] leading-tight" style={{ color: c.text }}>
        Tiết {session.start}-{session.end} · {timeRange(session.start, session.end, times)}
      </span>
      {session.room && <span className="block truncate text-[11px] leading-tight" style={{ color: c.text }} title={session.room}>📍 {session.room}</span>}
      {session.teacher && <span className="block truncate text-[11px]" style={{ color: c.text }} title={session.teacher}>{session.teacher}</span>}
      {session.type !== 'Học' && <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[session.type]}`}>{session.type}</span>}
    </button>
  )
}
