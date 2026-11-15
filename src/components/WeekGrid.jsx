import { DAY_NAMES, DAY_SHORT, PERIOD_TIMES, currentPeriodIndex, timeRange } from '../lib/time.js'
import { colorFor } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'
import { SessionCard } from './SessionCard.jsx'

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
      {/* Lưới tuần — desktop */}
      <div className="card timetable-scroll mt-5 hidden p-3 md:block">
        <div
          className="grid min-w-[1024px]"
          style={{ gridTemplateColumns: '76px repeat(7, minmax(0, 1fr))', gridTemplateRows: '42px repeat(16, 56px)' }}
        >
          <div className="flex items-center justify-center border-b border-border text-xs font-bold text-muted">Ca / Tiết</div>
          {/* Tiêu đề ngày: MỘT hàng duy nhất (flex-row + whitespace-nowrap).
              Trước đây là flex-col nên huy hiệu "Hôm nay" rớt xuống dòng
              thứ hai dưới tên ngày — đúng thứ Lộc thấy ở cột Chủ nhật vào
              ngày Chủ nhật. Cột rộng tối thiểu 1024px (≈135px/cột) để tên
              ngày + huy hiệu nằm vừa một hàng. */}
          {DAY_NAMES.map((d, i) => (
            <div key={d} className={`flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap border-b border-border text-xs font-bold lg:text-sm ${i === today ? 'text-primary' : 'text-foreground'}`}>
              <span className="whitespace-nowrap">{d}</span>
              {i === today && <span className="shrink-0 rounded-full bg-primary px-2 py-px text-[10px] font-bold text-white">Hôm nay</span>}
            </div>
          ))}
          {PERIOD_TIMES.map((t, p) => (
            <div key={p} className="flex flex-col items-center justify-center border-b border-border text-center">
              <span className="text-[11px] font-bold text-foreground">T{p + 1}{p === 0 ? ' · Sáng' : p === 6 ? ' · Chiều' : p === 12 ? ' · Tối' : ''}</span>
              <span className="text-[10px] text-muted">{t}</span>
              {p === nowPeriod && (
                <span className="mt-0.5 rounded-full bg-primary px-1.5 py-px text-[9px] font-bold text-white">Đang học</span>
              )}
            </div>
          ))}
          {/* Nền nhấn cột hôm nay (nằm dưới các ô, không chặn bấm). */}
          <div
            aria-hidden="true"
            className="pointer-events-none bg-primary/5"
            style={{ gridColumn: today + 2, gridRow: '1 / 19' }}
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
            const c = colorFor(s.subject, dark)
            return (
              <button key={s.id} onClick={() => onSelect(s)} className="card flex w-full items-start gap-3 p-3 text-left transition-soft hover:-translate-y-px hover:shadow-card-hover motion-reduce:transform-none">
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
