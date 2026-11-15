import { DAY_NAMES, DAY_SHORT, PERIOD_TIMES, currentPeriodIndex, timeRange } from '../lib/time.js'
import { cellStyleFor, KIND_BG } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'
import { SessionCard } from './SessionCard.jsx'

// Chú thích màu ô (Part 9): một hàng gọn, hiện cả trên lưới desktop lẫn
// xem theo ngày trên mobile — nền mã hóa hình thức, viền trái mã hóa môn.
export function ModeLegend({ dark = false }) {
  const items = [
    { kind: KIND_BG.practice, label: 'Thực hành' },
    { kind: KIND_BG.theory, label: 'Lý thuyết' },
    { kind: KIND_BG.exam, label: 'Thi' },
  ]
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted" aria-label="Chú thích màu ô: xanh lá là thực hành, xám nhạt là lý thuyết, vàng nhạt là thi">
      <span className="text-foreground">Màu ô:</span>
      {items.map(({ kind, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded border border-border" style={{ background: dark ? kind.darkBg : kind.bg }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function WeekGrid({
  sessions, filteredIds, conflicts, today,
  mobileDay, onMobileDayChange,
  daySessions, onSelect, onEmptyCell, times = PERIOD_TIMES, dark = false,
  onAddFirst, onRestoreSeed,
}) {
  const PERIOD_TIMES = times
  // Tiết đang diễn ra (chỉ số 0-based), -1 nếu ngoài giờ học — để vẽ
  // vạch "đang học" trên cột hôm nay. Tính theo khung giờ đang dùng.
  const nowPeriod = currentPeriodIndex(new Date(), times)
  return (
    <>
      {/* Trạng thái trống: lưới không có buổi nào thì hiện hướng dẫn + nút
          làm luôn, thay vì một lưới trắng trơn. */}
      {sessions.length === 0 && (
        <div className="card mt-5 hidden p-5 text-center md:block">
          <p className="font-bold text-foreground">Chưa có buổi học nào trong học kỳ này.</p>
          <p className="mt-1 text-sm text-muted">Thêm buổi đầu tiên, hoặc khôi phục lại lịch gốc từ ảnh / Excel của Lộc.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {onAddFirst && <button onClick={onAddFirst} className="btn-primary px-4 py-2 text-sm">+ Thêm buổi đầu tiên</button>}
            {onRestoreSeed && <button onClick={onRestoreSeed} className="btn-ghost px-4 py-2 text-sm">Khôi phục lịch gốc</button>}
          </div>
        </div>
      )}
      {/* Chú thích màu ô theo hình thức — hiện cả desktop lẫn mobile. */}
      <ModeLegend dark={dark} />
      {/* Lưới tuần — desktop */}
      <div className="card timetable-scroll mt-5 hidden p-3 md:block">
        <div
          className="grid min-w-[1024px]"
          style={{ gridTemplateColumns: '76px repeat(7, minmax(0, 1fr))', gridTemplateRows: '42px repeat(16, 56px)' }}
        >
          {/* Ô góc "Ca / Tiết": đặt rõ ràng cột 1, hàng 1. */}
          <div className="flex items-center justify-center border-b border-border text-xs font-bold text-muted" style={{ gridColumn: 1, gridRow: 1 }}>Ca / Tiết</div>
          {/* Tiêu đề ngày: MỘT hàng duy nhất (flex-row + whitespace-nowrap),
              ĐẶT RÕ RÀNG cột i+2, hàng 1 cho cả 8 ô tiêu đề.
              NGUYÊN NHÂN THẬT của lỗi "Chủ nhật xuống dòng" (Part 8): trước
              đây 8 ô tiêu đề KHÔNG có vị trí rõ ràng (auto-placement), còn
              nền nhấn cột hôm nay (div bên dưới) chiếm gridRow '1 / 19' —
              tức chiếm luôn ô tiêu đề của cột hôm nay. CSS Grid đặt ô đã
              đặt rõ trước, rồi mới auto-place các ô còn lại vào chỗ trống:
              tiêu đề của cột hôm nay (Chủ nhật khi hôm nay là Chủ nhật)
              không vào được hàng 1 nên rớt xuống hàng 2, cột 1 — đúng chỗ
              Lộc thấy "Chủ nhật + Hôm nay" nằm trên "T1 · Sáng". Lỗi này
              xảy ra với BẤT KỲ ngày nào vào đúng ngày đó (thứ 2 cũng rớt
              tiêu đề vào thứ 2...). Part 7 chỉ sửa flex-col → flex-row
              nên không chạm tới nguyên nhân này. Cột rộng tối thiểu
              1024px (≈135px/cột) để tên ngày + huy hiệu vừa một hàng. */}
          {DAY_NAMES.map((d, i) => (
            <div key={d} className={`flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap border-b border-border text-xs font-bold lg:text-sm ${i === today ? 'text-primary' : 'text-foreground'}`} style={{ gridColumn: i + 2, gridRow: 1 }}>
              <span className="whitespace-nowrap">{d}</span>
              {i === today && <span className="shrink-0 rounded-full bg-primary px-2 py-px text-[10px] font-bold text-white">Hôm nay</span>}
            </div>
          ))}
          {/* Gutter tiết: cũng đặt rõ ràng cột 1, hàng p+2 — trước đây
              auto-place nên chỉ đúng nhờ con trỏ đang ở đúng chỗ. */}
          {PERIOD_TIMES.map((t, p) => (
            <div key={p} className="flex flex-col items-center justify-center border-b border-border text-center" style={{ gridColumn: 1, gridRow: p + 2 }}>
              <span className="text-[11px] font-bold text-foreground">T{p + 1}{p === 0 ? ' · Sáng' : p === 6 ? ' · Chiều' : p === 12 ? ' · Tối' : ''}</span>
              <span className="text-[10px] text-muted">{t}</span>
              {p === nowPeriod && (
                <span className="mt-0.5 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-white">Đang học</span>
              )}
            </div>
          ))}
          {/* Nền nhấn cột hôm nay (nằm dưới các ô, không chặn bấm).
              CHỈ phủ các hàng thân lưới (hàng 2–17, tức 16 tiết), KHÔNG
              bao giờ phủ hàng 1 (tiêu đề) — trước đây là '1 / 19' nên
              chiếm luôn ô tiêu đề của cột hôm nay và đẩy tiêu đề đó
              xuống hàng 2, cột 1 (xem ghi chú ở tiêu đề ngày). */}
          <div
            aria-hidden="true"
            className="pointer-events-none bg-primary/5"
            style={{ gridColumn: today + 2, gridRow: '2 / 18' }}
          />
          {/* Vạch "đang học" ngang qua cột hôm nay ở tiết hiện tại. */}
          {nowPeriod >= 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none border-t-2 border-primary/70"
              style={{ gridColumn: today + 2, gridRow: nowPeriod + 2 }}
            />
          )}
          {DAY_NAMES.map((_, day) =>
            PERIOD_TIMES.map((_, p) => (
              <div
                key={`${day}-${p}`}
                onClick={() => onEmptyCell(day, p + 1)}
                title={`${DAY_NAMES[day]} tiết ${p + 1} — bấm để thêm buổi`}
                className="group relative flex cursor-pointer items-center justify-center border-b border-r border-border hover:bg-primary/5"
                style={{ gridColumn: day + 2, gridRow: p + 2 }}
              >
                <span className="text-lg font-bold text-primary opacity-0 transition-opacity group-hover:opacity-60" aria-hidden="true">+</span>
              </div>
            )),
          )}
          {sessions.filter((s) => filteredIds.has(s.id)).map((s) => (
            <SessionCard key={s.id} session={s} isConflict={conflicts.has(s.id)} onSelect={onSelect} dark={dark} times={times} />
          ))}
        </div>
      </div>

      {/* Xem theo ngày — mobile */}
      <div className="mt-5 md:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DAY_SHORT.map((d, i) => (
            <button key={d} onClick={() => onMobileDayChange(i)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${mobileDay === i ? 'bg-primary text-white' : 'card text-muted'}`}>
              {d}{i === today ? ' •' : ''}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).length === 0 && (
            <div className="card p-4">
              <p className="text-sm text-muted">Không có buổi nào trong ngày này (theo bộ lọc hiện tại).</p>
              <button onClick={() => onEmptyCell(mobileDay, 1)} className="btn-primary mt-3 px-4 py-2 text-sm">+ Thêm buổi cho ngày này</button>
            </div>
          )}
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).map((s) => {
            // Nền ô theo hình thức (Part 9) như trên lưới desktop; viền
            // trái vẫn là màu môn. Chữ giữ text-foreground/text-muted
            // (đọc được trên cả 3 nền sáng + tối).
            const c = cellStyleFor(s, dark)
            return (
              <button key={s.id} onClick={() => onSelect(s)} className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left transition-soft hover:-translate-y-px hover:shadow-card-hover motion-reduce:transform-none" style={{ background: c.bg }}>
                <span className="h-full min-h-10 w-1.5 rounded-full" style={{ background: c.border }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-foreground">{iconFor(s)} {s.subject}</span>
                  <span className="block text-xs text-muted">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end, times)}</span>
                  <span className="block text-xs text-muted">{[s.room, s.teacher].filter(Boolean).join(' · ') || 'Chưa có phòng / GV'}</span>
                </span>
                {conflicts.has(s.id) && <span className="rounded bg-red-100 dark:bg-red-900/60 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">Trùng</span>}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
