import { useEffect, useRef } from 'react'
import { SEMESTERS } from '../data/seed.js'
import { PresetSettings } from './PresetSettings.jsx'
import { ThemeSettings } from './ThemeSettings.jsx'

// Header gọn: tiêu đề view hiện tại + chuyển học kỳ + nút sáng/tối + menu
// Cài đặt. Logo và điều hướng chính đã chuyển sang Sidebar trái (desktop)
// — header không còn giữ bản sao của chúng nữa. Menu Cài đặt được điều
// khiển từ DashboardPage để mục "Cài đặt" ở sidebar mở được nó.
export function Header({ semester, onSemesterChange, viewTitle, theme, settingsOpen, onSettingsOpenChange, onExportCSV, onExportBackup, onImportJSON, onRestoreSeed, onExportIcs, onExportPng, preset, reminders, onReminderToggle, onReminderMinutes, onRequestPermission, install }) {
  const fileRef = useRef(null)
  const menuRef = useRef(null)

  // Đóng menu khi bấm ra ngoài hoặc bấm Esc.
  useEffect(() => {
    if (!settingsOpen) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) onSettingsOpenChange(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') onSettingsOpenChange(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen, onSettingsOpenChange])

  function run(action) {
    action()
    onSettingsOpenChange(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <h1 className="text-lg font-extrabold leading-tight">{viewTitle}</h1>
        <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">SchedulingApp · Nguyễn Hữu Lộc · IUH</p>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={theme.cycleMode}
            title="Đổi sáng / tối / theo hệ thống"
            aria-label="Đổi giao diện sáng tối"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {theme.dark ? '🌙' : '☀️'}
          </button>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {SEMESTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onSemesterChange(s.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${semester === s.id ? 'bg-white dark:bg-slate-900 shadow' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {s.id === 'hk2' ? 'HK2 · Nháp' : 'HK1'}
              </button>
            ))}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => onSettingsOpenChange(!settingsOpen)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              ⚙️ Cài đặt
            </button>
            {settingsOpen && (
              <div role="menu" className="absolute right-0 z-40 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-xs overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-lg sm:w-80">
                {theme && <ThemeSettings theme={theme} />}
                <button onClick={() => run(onExportCSV)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                  ⬇️ Xuất CSV <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">Tải lịch học kỳ này về file CSV</span>
                </button>
                <button onClick={() => run(onExportBackup)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                  💾 Backup JSON <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">Sao lưu toàn bộ lịch để chuyển máy</span>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  📂 Nhập JSON <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">Khôi phục từ file backup JSON</span>
                </button>
                <button
                  onClick={() => {
                    onSettingsOpenChange(false)
                    if (confirm('Khôi phục toàn bộ lịch gốc từ ảnh / Excel của Lộc? Các thay đổi của bạn sẽ mất.')) onRestoreSeed()
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"
                >
                  ↩️ Khôi phục gốc <span className="block text-xs font-normal text-red-400 dark:text-red-300">Xóa hết thay đổi, về lại lịch gốc</span>
                </button>
                {onExportIcs && (
                  <button onClick={() => run(onExportIcs)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                    📅 Xuất .ics (Google Calendar) <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">Tải file .ics rồi import vào Google Calendar → Lịch → Cài đặt → Nhập &amp; xuất</span>
                  </button>
                )}
                {onExportPng && (
                  <button onClick={() => run(onExportPng)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
                    🖼️ Xuất ảnh PNG <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">Tải lưới tuần thành ảnh để share nhóm</span>
                  </button>
                )}
                {preset && <PresetSettings preset={preset} />}
                {reminders && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2">
                    <p className="text-sm font-bold">🔔 Nhắc lịch</p>
                    <label className="mt-1 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={reminders.settings.enabled} onChange={onReminderToggle} className="h-4 w-4 accent-indigo-600" />
                      Nhắc trước giờ học
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span>Trước</span>
                      <select
                        value={reminders.settings.minutesBefore}
                        disabled={!reminders.settings.enabled}
                        onChange={(e) => onReminderMinutes(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1 text-sm"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                      </select>
                      <span>· thi/deadline nhắc trước 1 ngày</span>
                    </div>
                    {reminders.settings.enabled && reminders.permission !== 'granted' && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {reminders.permission === 'unsupported'
                          ? 'Trình duyệt này không hỗ trợ thông báo — banner trong app vẫn hiện.'
                          : 'Thông báo trình duyệt chưa bật — banner trong app vẫn hiện. '}
                        {reminders.permission === 'default' && (
                          <button onClick={onRequestPermission} className="font-bold text-indigo-700 dark:text-indigo-300 underline">Bật thông báo</button>
                        )}
                      </p>
                    )}
                  </div>
                )}
                {install && (
                  <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2">
                    {install.canInstall ? (
                      <button onClick={() => run(install.promptInstall)} className="block w-full rounded-lg bg-indigo-600 px-3 py-2 text-left text-sm font-bold text-white">
                        📲 Cài đặt app lên điện thoại
                      </button>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">📲 Cài đặt app: mở menu trình duyệt → Thêm vào màn hình chính.</p>
                    )}
                  </div>
                )}
                <p className="border-t border-slate-100 dark:border-slate-800 px-3 pt-2 text-xs text-slate-400 dark:text-slate-500">
                  Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
                </p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              onSettingsOpenChange(false)
              if (f) onImportJSON(f)
              e.target.value = ''
            }} />
        </div>
      </div>
    </header>
  )
}
