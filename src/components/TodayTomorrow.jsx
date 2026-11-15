import { useEffect, useMemo, useState } from 'react'
import { DAY_NAMES, timeRange, sessionStatusToday, inMinutesLabel, nextOccurrence, nextUpcomingSession, formatDateLocal, countdownLabel } from '../lib/time.js'
import { colorFor } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'

function statusLabel(session, now, times) {
  const status = sessionStatusToday(session, now, times)
  if (status === 'ongoing') return 'Đang học'
  if (status === 'done') return 'Đã xong'
  if (status === 'upcoming') {
    const start = nextOccurrence(session, now, times)
    return `Bắt đầu ${inMinutesLabel(start, now)}`
  }
  return ''
}

/**
 * Widget "Hôm nay học gì": thẻ Hôm nay lên đầu dashboard, mỗi buổi kèm
 * đếm ngược / trạng thái Đang học / Đã xong; thẻ Ngày mai gọn bên cạnh.
 * Khi hôm nay trống, thẻ Hôm nay chỉ luôn buổi học tiếp theo gần nhất
 * (kèm đếm ngược) thay vì để trống trơn — lịch ít buổi vẫn có ích.
 */
export function TodayTomorrow({ today, tomorrow, daySessions, conflicts, onSelect, times, dark = false, sessions = [] }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  const next = useMemo(() => nextUpcomingSession(sessions, now, times), [sessions, now, times])

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {[{ d: today, label: 'Hôm nay học gì' }, { d: tomorrow, label: 'Ngày mai' }].map(({ d, label }) => (
        <div key={label} className="card p-4">
          <h2 className="font-bold text-foreground">{label} — {DAY_NAMES[d]}</h2>
          {daySessions(d).length === 0 ? (
            <div className="mt-2">
              <p className="text-sm text-muted">Không có buổi học.</p>
              {d === today && next && (
                <button onClick={() => onSelect(next.session)} className="mt-2 flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2 text-left transition-soft hover:bg-primary/5">
                  <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: colorFor(next.session.subject, dark).border }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-primary">Buổi tiếp theo · {countdownLabel(formatDateLocal(next.date), now)}</span>
                    <span className="block truncate text-sm font-semibold text-foreground">{iconFor(next.session)} {next.session.subject}</span>
                    <span className="block text-xs text-muted">{DAY_NAMES[next.session.day]}, {next.date.toLocaleDateString('vi-VN')} · Tiết {next.session.start}-{next.session.end} · {timeRange(next.session.start, next.session.end, times)}{next.session.room ? ` · ${next.session.room}` : ''}</span>
                  </span>
                </button>
              )}
            </div>
          ) : (
            <ul className="mt-2 space-y-2">
              {daySessions(d).map((s) => {
                const c = colorFor(s.subject, dark)
                const status = d === today ? statusLabel(s, now, times) : ''
                const ongoing = d === today && sessionStatusToday(s, now, times) === 'ongoing'
                const done = d === today && sessionStatusToday(s, now, times) === 'done'
                return (
                  <li key={s.id}>
                    <button onClick={() => onSelect(s)} className="flex w-full items-center gap-3 rounded-xl border border-border px-3 py-2 text-left transition-soft hover:bg-primary/5">
                      <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: c.border }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{iconFor(s)} {s.subject}</span>
                        <span className="block truncate text-xs text-muted">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end, times)}{s.room ? ` · ${s.room}` : ''}</span>
                        {status && (
                          <span className={`block text-xs font-semibold ${ongoing ? 'text-emerald-600 dark:text-emerald-400' : done ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-700 dark:text-indigo-300'}`}>
                            {status}
                          </span>
                        )}
                      </span>
                      {conflicts.has(s.id) && <span className="rounded bg-red-100 dark:bg-red-900/60 px-2 py-0.5 text-xs font-bold text-red-700 dark:text-red-300">Trùng</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
