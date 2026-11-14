import { DAY_NAMES, countdownLabel, daysUntil, timeRange } from '../lib/time.js'

// Tab "Lịch thi": liệt kê riêng các buổi loại Thi + task loại Thi,
// xếp theo ngày (có ngày trước, sớm nhất trước; chưa có ngày xếp sau).
// Các buổi thi vẫn hiện trên lưới tuần bình thường (màu đỏ) — tab này
// chỉ là một góc nhìn riêng, không thay thế lưới.
export function ExamList({ sessions, tasks, times, onSelectSession }) {
  const exams = (sessions || [])
    .filter((s) => s.type === 'Thi')
    .map((s) => ({
      kind: 'session',
      id: s.id,
      subject: s.subject,
      date: s.examDate || '',
      session: s,
    }))
  const examTasks = (tasks || [])
    .filter((t) => t.type === 'Thi' && !t.done)
    .map((t) => ({
      kind: 'task',
      id: t.id,
      subject: t.subject ? `${t.title} — ${t.subject}` : t.title,
      date: t.dueDate || '',
      task: t,
    }))
  const all = [...exams, ...examTasks].sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date)
    if (a.date) return -1
    if (b.date) return 1
    return (a.session?.day ?? 7) - (b.session?.day ?? 7)
  })

  if (all.length === 0) {
    return (
      <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        <p className="font-bold">Chưa có lịch thi nào.</p>
        <p className="mt-1">Thêm một buổi loại “Thi” (có thể nhập thêm Ngày thi trong form) hoặc thêm một task loại “Thi” có ngày hết hạn — nó sẽ hiện ở đây với đếm ngược.</p>
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-2">
      {all.map((e) => {
        const label = e.date
          ? `${new Date(`${e.date}T00:00:00`).toLocaleDateString('vi-VN')} · ${countdownLabel(e.date)}`
          : e.session
            ? `${DAY_NAMES[e.session.day]} · Tiết ${e.session.start}-${e.session.end} (${timeRange(e.session.start, e.session.end, times)}) — chưa nhập ngày thi`
            : 'Chưa có ngày'
        const overdue = e.date && daysUntil(e.date) < 0
        return (
          <button
            key={`${e.kind}-${e.id}`}
            onClick={() => e.kind === 'session' && onSelectSession?.(e.session)}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left shadow-sm hover:bg-red-100/60"
          >
            <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-extrabold text-white">THI</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-red-900">{e.subject}</span>
              <span className="block text-xs text-red-700">
                {label}
                {e.session?.room ? ` · Phòng ${e.session.room}` : ''}
                {e.session?.teacher ? ` · ${e.session.teacher}` : ''}
              </span>
            </span>
            {e.date && (
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${overdue ? 'bg-red-600 text-white' : 'bg-white text-red-700'}`}>
                {countdownLabel(e.date)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
