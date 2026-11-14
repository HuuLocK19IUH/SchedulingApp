import { useEffect, useRef, useState } from 'react'
import { SEMESTERS } from '../data/seed.js'
import { PresetSettings } from './PresetSettings.jsx'

export function Header({ semester, onSemesterChange, onExportCSV, onExportBackup, onImportJSON, onRestoreSeed, view, onViewChange, onExportIcs, onExportPng, preset, reminders, onReminderToggle, onReminderMinutes, onRequestPermission, install }) {
  const fileRef = useRef(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const menuRef = useRef(null)

  // Đóng menu khi bấm ra ngoài hoặc bấm Esc.
  useEffect(() => {
    if (!settingsOpen) return
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setSettingsOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [settingsOpen])

  function run(action) {
    action()
    setSettingsOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SchedulingApp" className="h-10 w-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-lg font-extrabold leading-tight">SchedulingApp</h1>
            <p className="text-xs text-slate-500">Xếp Lịch Học · Nguyễn Hữu Lộc · IUH</p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {view && onViewChange && (
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => onViewChange('schedule')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === 'schedule' ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                Lịch học
              </button>
              <button
                onClick={() => onViewChange('simulator')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === 'simulator' ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                Mô phỏng đăng ký
              </button>
              <button
                onClick={() => onViewChange('exams')}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${view === 'exams' ? 'bg-red-600 text-white shadow' : 'text-red-600'}`}
              >
                Lịch thi
              </button>
            </div>
          )}
          <div className="flex rounded-lg bg-slate-100 p-1">
            {SEMESTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onSemesterChange(s.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${semester === s.id ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                {s.id === 'hk2' ? 'HK2 · Nháp' : 'HK1'}
              </button>
            ))}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
            >
              ⚙️ Cài đặt
            </button>
            {settingsOpen && (
              <div role="menu" className="absolute right-0 z-40 mt-2 w-[calc(100vw-2rem)] max-w-xs rounded-2xl border border-slate-200 bg-white p-2 shadow-lg sm:w-80">
                <button onClick={() => run(onExportCSV)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50">
                  ⬇️ Xuất CSV <span className="block text-xs font-normal text-slate-500">Tải lịch học kỳ này về file CSV</span>
                </button>
                <button onClick={() => run(onExportBackup)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50">
                  💾 Backup JSON <span className="block text-xs font-normal text-slate-500">Sao lưu toàn bộ lịch để chuyển máy</span>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50"
                >
                  📂 Nhập JSON <span className="block text-xs font-normal text-slate-500">Khôi phục từ file backup JSON</span>
                </button>
                <button
                  onClick={() => {
                    setSettingsOpen(false)
                    if (confirm('Khôi phục toàn bộ lịch gốc từ ảnh / Excel của Lộc? Các thay đổi của bạn sẽ mất.')) onRestoreSeed()
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  ↩️ Khôi phục gốc <span className="block text-xs font-normal text-red-400">Xóa hết thay đổi, về lại lịch gốc</span>
                </button>
                {onExportIcs && (
                  <button onClick={() => run(onExportIcs)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50">
                    📅 Xuất .ics (Google Calendar) <span className="block text-xs font-normal text-slate-500">Tải file .ics rồi import vào Google Calendar → Lịch → Cài đặt → Nhập &amp; xuất</span>
                  </button>
                )}
                {onExportPng && (
                  <button onClick={() => run(onExportPng)} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-slate-50">
                    🖼️ Xuất ảnh PNG <span className="block text-xs font-normal text-slate-500">Tải lưới tuần thành ảnh để share nhóm</span>
                  </button>
                )}
                {preset && <PresetSettings preset={preset} />}
                {reminders && (
                  <div className="border-t border-slate-100 px-3 py-2">
                    <p className="text-sm font-bold">🔔 Nhắc lịch</p>
                    <label className="mt-1 flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={reminders.settings.enabled} onChange={onReminderToggle} className="h-4 w-4 accent-indigo-600" />
                      Nhắc trước giờ học
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                      <span>Trước</span>
                      <select
                        value={reminders.settings.minutesBefore}
                        disabled={!reminders.settings.enabled}
                        onChange={(e) => onReminderMinutes(Number(e.target.value))}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                      </select>
                      <span>· thi/deadline nhắc trước 1 ngày</span>
                    </div>
                    {reminders.settings.enabled && reminders.permission !== 'granted' && (
                      <p className="mt-1 text-xs text-slate-500">
                        {reminders.permission === 'unsupported'
                          ? 'Trình duyệt này không hỗ trợ thông báo — banner trong app vẫn hiện.'
                          : 'Thông báo trình duyệt chưa bật — banner trong app vẫn hiện. '}
                        {reminders.permission === 'default' && (
                          <button onClick={onRequestPermission} className="font-bold text-indigo-700 underline">Bật thông báo</button>
                        )}
                      </p>
                    )}
                  </div>
                )}
                {install && (
                  <div className="border-t border-slate-100 px-3 py-2">
                    {install.canInstall ? (
                      <button onClick={() => run(install.promptInstall)} className="block w-full rounded-lg bg-indigo-600 px-3 py-2 text-left text-sm font-bold text-white">
                        📲 Cài đặt app lên điện thoại
                      </button>
                    ) : (
                      <p className="text-xs text-slate-500">📲 Cài đặt app: mở menu trình duyệt → Thêm vào màn hình chính.</p>
                    )}
                  </div>
                )}
                <p className="border-t border-slate-100 px-3 pt-2 text-xs text-slate-400">
                  Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
                </p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              setSettingsOpen(false)
              if (f) onImportJSON(f)
              e.target.value = ''
            }} />
        </div>
      </div>
    </header>
  )
}
