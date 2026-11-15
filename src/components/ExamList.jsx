import { DAY_NAMES, countdownLabel, daysUntil, timeRange } from '../lib/time.js'
import { cellStyleFor } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'

// Tab "Lịch thi": liệt kê riêng các buổi loại Thi + task loại Thi,
// xếp theo ngày (có ngày trước, sớm nhất trước; chưa có ngày xếp sau).
// Các buổi thi vẫn hiện trên lưới tuần bình thường (màu đỏ) — tab này
// chỉ là một góc nhìn riêng, không thay thế lưới.
// Nền hàng buổi thi (Part 9): vàng nhạt như ô thi trên lưới; task thi
// (không phải buổi học) giữ nền đỏ cũ để phân biệt.
export function ExamList({ sessions, tasks, times, onSelectSession, onAddExam, dark = false }) {
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
    // my-auto: khi chưa có lịch thi, hộp trống căn giữa theo chiều dọc
    // trong phần còn lại của trang (main là flex-col, cao tối thiểu
    // gần bằng viewport) thay vì dính lên đầu và bỏ lại khoảng xanh
    // trống lớn phía dưới.
    return (
      <div className="my-auto rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 p-5 text-sm text-red-800 dark:text-red-200">
        <p className="font-bold">Chưa có lịch thi nào.</p>
        <p className="mt-1">Thêm một buổi loại “Thi” (có thể nhập thêm Ngày thi trong form) hoặc thêm một task loại “Thi” có ngày hết hạn — nó sẽ hiện ở đây với đếm ngược.</p>
        {onAddExam && (
          <button onClick={onAddExam} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-soft hover:bg-red-700">
            + Thêm buổi thi đầu tiên
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-5 space-y-2">
      {all.map((e) => {
        // Cụm ngày/giờ giữ nguyên một dòng (whitespace-nowrap) để tên
        // thứ — ví dụ "Chủ nhật" — không bị gãy đôi; phần còn lại của
        // câu vẫn xuống dòng bình thường khi màn hình hẹp.
        const dayPart = e.date
          ? `${new Date(`${e.date}T00:00:00`).toLocaleDateString('vi-VN')} · ${countdownLabel(e.date)}`
          : e.session
            ? `${DAY_NAMES[e.session.day]} · Tiết ${e.session.start}-${e.session.end} (${timeRange(e.session.start, e.session.end, times)})`
            : 'Chưa có ngày'
        const rest = e.date || !e.session ? '' : ' — chưa nhập ngày thi'
        const overdue = e.date && daysUntil(e.date) < 0
        // Hàng buổi thi: nền vàng theo hình thức thi; hàng task thi giữ
        // nền đỏ cũ. Chữ đỏ giữ nguyên — đã đọc được trên nền vàng ở cả
        // hai chế độ (đỏ-900 trên vàng-100, đỏ-100 trên hổ phách-900).
        const rowBg = e.session ? cellStyleFor(e.session, dark).bg : undefined
        return (
          <button
            key={`${e.kind}-${e.id}`}
            onClick={() => e.kind === 'session' && onSelectSession?.(e.session)}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 p-4 text-left shadow-sm hover:brightness-95 dark:hover:brightness-110"
            style={rowBg ? { background: rowBg } : undefined}
          >
            <span className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-extrabold text-white">THI</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-red-900 dark:text-red-100" title={e.subject}>{e.session ? `${iconFor(e.session)} ` : '📝 '}{e.subject}</span>
              <span className="block text-xs text-red-700 dark:text-red-300">
                <span className="whitespace-nowrap">{dayPart}</span>
                {rest}
                {e.session?.room ? ` · Phòng ${e.session.room}` : ''}
                {e.session?.teacher ? ` · ${e.session.teacher}` : ''}
              </span>
            </span>
            {e.date && (
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${overdue ? 'bg-red-600 text-white' : 'bg-white dark:bg-slate-900 text-red-700 dark:text-red-300'}`}>
                {countdownLabel(e.date)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
