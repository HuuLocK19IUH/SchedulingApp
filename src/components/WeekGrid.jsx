import { DAY_NAMES, DAY_SHORT, PERIOD_TIMES, timeRange } from '../lib/time.js'
import { colorFor } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'
import { SessionCard } from './SessionCard.jsx'

export function WeekGrid({
  sessions, filteredIds, conflicts, today,
  mobileDay, onMobileDayChange,
  daySessions, onSelect, onEmptyCell, times = PERIOD_TIMES, dark = false,
}) {
  const PERIOD_TIMES = times
  return (
    <>
      {/* Lưới tuần — desktop */}
      <div className="timetable-scroll mt-5 hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-sm md:block">
        <div
          className="grid min-w-[920px]"
          style={{ gridTemplateColumns: '76px repeat(7, minmax(0, 1fr))', gridTemplateRows: '42px repeat(16, 56px)' }}
        >
          <div className="flex items-center justify-center border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400">Ca / Tiết</div>
          {DAY_NAMES.map((d, i) => (
            <div key={d} className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700 text-sm font-bold ${i === today ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
              {d}{i === today ? ' •' : ''}
            </div>
          ))}
          {PERIOD_TIMES.map((t, p) => (
            <div key={p} className="flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">T{p + 1}{p === 0 ? ' · Sáng' : p === 6 ? ' · Chiều' : p === 12 ? ' · Tối' : ''}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{t}</span>
            </div>
          ))}
          {DAY_NAMES.map((_, day) =>
            PERIOD_TIMES.map((_, p) => (
              <div
                key={`${day}-${p}`}
                onClick={() => onEmptyCell(day, p + 1)}
                title={`${DAY_NAMES[day]} tiết ${p + 1} — bấm để thêm buổi`}
                className="cursor-pointer border-b border-r border-slate-100 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/40"
                style={{ gridColumn: day + 2, gridRow: p + 2 }}
              />
            )),
          )}
          {sessions.filter((s) => filteredIds.has(s.id)).map((s) => (
            <SessionCard key={s.id} session={s} isConflict={conflicts.has(s.id)} onSelect={onSelect} dark={dark} />
          ))}
        </div>
      </div>

      {/* Xem theo ngày — mobile */}
      <div className="mt-5 md:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DAY_SHORT.map((d, i) => (
            <button key={d} onClick={() => onMobileDayChange(i)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${mobileDay === i ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).length === 0 && (
            <p className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400">Không có buổi nào trong ngày này (theo bộ lọc hiện tại).</p>
          )}
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).map((s) => {
            const c = colorFor(s.subject, dark)
            return (
              <button key={s.id} onClick={() => onSelect(s)} className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-left shadow-sm">
                <span className="h-full min-h-10 w-1.5 rounded-full" style={{ background: c.border }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{iconFor(s)} {s.subject}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end, times)}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{[s.room, s.teacher].filter(Boolean).join(' · ') || 'Chưa có phòng / GV'}</span>
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
