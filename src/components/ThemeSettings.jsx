import { BACKGROUND_OPTIONS, THEME_MODES, backgroundStyle } from '../lib/theme.js'
import { IconImage, IconMonitor, IconMoon, IconPalette, IconSun } from '../lib/ui-icons.jsx'

const MODE_ICONS = { light: IconSun, dark: IconMoon, system: IconMonitor }

// Mục "Giao diện" trong menu Cài đặt: chế độ sáng/tối + nền dashboard.
// Bản xem trước nền dùng gradient thật (bản sáng) để Lộc thấy trước khi chọn.
export function ThemeSettings({ theme }) {
  return (
    <div className="border-t border-border px-3 py-2">
      <p className="flex items-center gap-2 text-sm font-bold text-foreground"><IconPalette className="h-4 w-4 text-primary" /> Giao diện</p>
      <div className="mt-1 flex gap-1">
        {THEME_MODES.map((m) => {
          const ModeIcon = MODE_ICONS[m.id]
          return (
            <button
              key={m.id}
              onClick={() => theme.setMode(m.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-bold transition-soft ${
                theme.mode === m.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-foreground hover:bg-primary/10'
              }`}
            >
              <ModeIcon className="h-4 w-4" />
              {m.label}
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-xs text-muted">
        {theme.mode === 'system' ? 'Đang theo giao diện hệ thống (sáng/tối theo máy).' : theme.mode === 'dark' ? 'Đang dùng giao diện tối.' : 'Đang dùng giao diện sáng.'}
      </p>

      <p className="mt-3 flex items-center gap-2 text-sm font-bold text-foreground"><IconImage className="h-4 w-4 text-primary" /> Nền dashboard</p>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        {BACKGROUND_OPTIONS.map((b) => (
          <button
            key={b.id}
            onClick={() => theme.setBackground(b.id)}
            className={`transition-soft flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-xs font-semibold text-foreground ${
              theme.background === b.id
                ? 'border-primary ring-1 ring-primary'
                : 'border-border hover:bg-primary/10'
            }`}
          >
            <span
              className="h-5 w-5 shrink-0 rounded-md border border-border"
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
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-border bg-surface"
          />
          <input
            value={theme.customColor}
            onChange={(e) => { const v = e.target.value; if (/^#[0-9a-fA-F]{6}$/.test(v)) theme.setCustomColor(v) }}
            aria-label="Mã màu hex"
            className="input w-28 py-1 text-xs"
            style={{ width: '7rem' }}
            placeholder="#4f46e5"
          />
          <span className="text-xs text-muted">Nhập mã hex hoặc bấm ô màu.</span>
        </div>
      )}
    </div>
  )
}
