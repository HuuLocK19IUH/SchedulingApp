import { useEffect, useState } from 'react'
import { DAY_NAMES, timeRange, sessionStatusToday, inMinutesLabel, nextOccurrence } from '../lib/time.js'
import { colorFor } from '../lib/colors.js'

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
 */
export function TodayTomorrow({ today, tomorrow, daySessions, conflicts, onSelect, times }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mt-5 grid gap-3 md:grid-cols-2">
      {[{ d: today, label: 'Hôm nay học gì' }, { d: tomorrow, label: 'Ngày mai' }].map(({ d, label }) => (
        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold">{label} — {DAY_NAMES[d]}</h2>
          {daySessions(d).length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Không có buổi học.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {daySessions(d).map((s) => {
                const c = colorFor(s.subject)
                const status = d === today ? statusLabel(s, now, times) : ''
                const ongoing = d === today && sessionStatusToday(s, now, times) === 'ongoing'
                const done = d === today && sessionStatusToday(s, now, times) === 'done'
                return (
                  <li key={s.id}>
                    <button onClick={() => onSelect(s)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-slate-50">
                      <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: c.border }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.subject}</span>
                        <span className="block text-xs text-slate-500">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end, times)}{s.room ? ` · ${s.room}` : ''}</span>
                        {status && (
                          <span className={`block text-xs font-semibold ${ongoing ? 'text-emerald-600' : done ? 'text-slate-400' : 'text-indigo-700'}`}>
                            {status}
                          </span>
                        )}
                      </span>
                      {conflicts.has(s.id) && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Trùng</span>}
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
