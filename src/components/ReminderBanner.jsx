export function ReminderBanner({ banners, onDismiss }) {
  if (!banners.length) return null
  return (
    <div className="mb-4 space-y-2">
      {banners.map((b) => (
        <div key={b.id} className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm">
          <span className="mt-0.5">🔔</span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-amber-900">{b.title}</span>
            {b.detail && <span className="block text-amber-800 dark:text-amber-200">{b.detail}</span>}
          </span>
          <button onClick={() => onDismiss(b.id)} aria-label="Đóng nhắc nhở" className="font-bold text-amber-700">✕</button>
        </div>
      ))}
    </div>
  )
}
