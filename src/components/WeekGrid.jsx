import { DAY_NAMES, DAY_SHORT, PERIOD_TIMES, timeRange } from '../lib/time.js'
import { colorFor } from '../lib/colors.js'
import { SessionCard } from './SessionCard.jsx'

export function WeekGrid({
  sessions, filteredIds, conflicts, today,
  mobileDay, onMobileDayChange,
  daySessions, onSelect, onEmptyCell,
}) {
  return (
    <>
      {/* Lưới tuần — desktop */}
      <div className="timetable-scroll mt-5 hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:block">
        <div
          className="grid min-w-[920px]"
          style={{ gridTemplateColumns: '76px repeat(7, minmax(0, 1fr))', gridTemplateRows: '42px repeat(16, 56px)' }}
        >
          <div className="flex items-center justify-center border-b border-slate-200 text-xs font-bold text-slate-500">Ca / Tiết</div>
          {DAY_NAMES.map((d, i) => (
            <div key={d} className={`flex items-center justify-center border-b border-slate-200 text-sm font-bold ${i === today ? 'text-indigo-700' : ''}`}>
              {d}{i === today ? ' •' : ''}
            </div>
          ))}
          {PERIOD_TIMES.map((t, p) => (
            <div key={p} className="flex flex-col items-center justify-center border-b border-slate-100 text-center">
              <span className="text-[11px] font-bold text-slate-600">T{p + 1}{p === 0 ? ' · Sáng' : p === 6 ? ' · Chiều' : p === 12 ? ' · Tối' : ''}</span>
              <span className="text-[10px] text-slate-400">{t}</span>
            </div>
          ))}
          {DAY_NAMES.map((_, day) =>
            PERIOD_TIMES.map((_, p) => (
              <div
                key={`${day}-${p}`}
                onClick={() => onEmptyCell(day, p + 1)}
                title={`${DAY_NAMES[day]} tiết ${p + 1} — bấm để thêm buổi`}
                className="cursor-pointer border-b border-r border-slate-100 hover:bg-indigo-50/50"
                style={{ gridColumn: day + 2, gridRow: p + 2 }}
              />
            )),
          )}
          {sessions.filter((s) => filteredIds.has(s.id)).map((s) => (
            <SessionCard key={s.id} session={s} isConflict={conflicts.has(s.id)} onSelect={onSelect} />
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">Bấm vào ô trống để thêm buổi mới vào tiết đó · Bấm vào khối môn để xem chi tiết.</p>
      </div>

      {/* Xem theo ngày — mobile */}
      <div className="mt-5 md:hidden">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {DAY_SHORT.map((d, i) => (
            <button key={d} onClick={() => onMobileDayChange(i)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${mobileDay === i ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}>
              {d}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-2">
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).length === 0 && (
            <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Không có buổi nào trong ngày này (theo bộ lọc hiện tại).</p>
          )}
          {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).map((s) => {
            const c = colorFor(s.subject)
            return (
              <button key={s.id} onClick={() => onSelect(s)} className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm">
                <span className="h-full min-h-10 w-1.5 rounded-full" style={{ background: c.border }} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold">{s.subject}</span>
                  <span className="block text-xs text-slate-500">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end)}</span>
                  <span className="block text-xs text-slate-500">{[s.room, s.teacher].filter(Boolean).join(' · ') || 'Chưa có phòng / GV'}</span>
                  {s.note && <span className="block text-xs text-slate-400">{s.note}</span>}
                </span>
                {conflicts.has(s.id) && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Trùng</span>}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
