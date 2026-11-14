import { BACKGROUND_OPTIONS, THEME_MODES, backgroundStyle } from '../lib/theme.js'

// Mục "Giao diện" trong menu Cài đặt: chế độ sáng/tối + nền dashboard.
// Bản xem trước nền dùng gradient thật (bản sáng) để Lộc thấy trước khi chọn.
export function ThemeSettings({ theme }) {
  return (
    <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-700">
      <p className="text-sm font-bold">🎨 Giao diện</p>
      <div className="mt-1 flex gap-1">
        {THEME_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => theme.setMode(m.id)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold ${
              theme.mode === m.id
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {theme.mode === 'system' ? 'Đang theo giao diện hệ thống (sáng/tối theo máy).' : theme.mode === 'dark' ? 'Đang dùng giao diện tối.' : 'Đang dùng giao diện sáng.'}
      </p>

      <p className="mt-3 text-sm font-bold">🖼️ Nền dashboard</p>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {BACKGROUND_OPTIONS.map((b) => (
          <button
            key={b.id}
            onClick={() => theme.setBackground(b.id)}
            className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold ${
              theme.background === b.id
                ? 'border-indigo-600 ring-1 ring-indigo-600'
                : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className="h-5 w-5 shrink-0 rounded-md border border-slate-300 dark:border-slate-600"
              style={{ background: backgroundStyle(b.id, theme.customColor, false) }}
            />
            {b.label}
          </button>
        ))}
      </div>
      {theme.background === 'custom' && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={theme.customColor}
            onChange={(e) => theme.setCustomColor(e.target.value)}
            aria-label="Chọn màu nền"
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
          <input
            value={theme.customColor}
            onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) theme.setCustomColor(v) }}
            aria-label="Mã màu hex"
            className="input w-28 py-1 text-xs"
            style={{ width: '7rem' }}
            placeholder="#4f46e5"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">Nhập mã hex hoặc bấm ô màu.</span>
        </div>
      )}
    </div>
  )
}
