import { IconBookOpen, IconCalendarDays, IconClock, IconLayers } from '../lib/ui-icons.jsx'

// 4 thẻ thống kê kiểu Bento: icon chip + số lớn + nhãn + dòng ngữ cảnh
// (tính từ dữ liệu thật đã có — không bịa số).
export function StatsBar({ stats }) {
  const cards = [
    { label: 'Môn học', value: stats.subjects, context: `${stats.sessions} buổi / tuần`, Icon: IconBookOpen },
    { label: 'Buổi / tuần', value: stats.sessions, context: `${stats.periods} tiết / tuần`, Icon: IconCalendarDays },
    { label: 'Ngày học / tuần', value: stats.days, context: `${7 - stats.days} ngày nghỉ`, Icon: IconClock },
    { label: 'Tiết / tuần', value: stats.periods, context: `~${stats.days ? Math.round(stats.periods / stats.days) : 0} tiết / ngày học`, Icon: IconLayers },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="card transition-soft p-4 hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:transform-none"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <c.Icon className="h-5 w-5" />
            </span>
            <span className="text-2xl font-extrabold leading-none text-foreground">{c.value}</span>
          </div>
          <p className="mt-3 text-sm font-bold text-foreground">{c.label}</p>
          <p className="text-xs text-muted">{c.context}</p>
        </div>
      ))}
    </div>
  )
}
