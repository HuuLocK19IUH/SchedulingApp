export function StatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[
        { label: 'Môn học', value: stats.subjects },
        { label: 'Buổi / tuần', value: stats.sessions },
        { label: 'Ngày học / tuần', value: stats.days },
        { label: 'Tiết / tuần', value: stats.periods },
      ].map((c) => (
        <div key={c.label} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">{c.value}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
