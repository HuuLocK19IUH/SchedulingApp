import { useEffect, useRef } from 'react'
import { PresetSettings } from './PresetSettings.jsx'
import { ThemeSettings } from './ThemeSettings.jsx'
import {
  IconBell, IconCalendarDays, IconDownload, IconFolderOpen, IconImage, IconMonitor,
  IconMoon, IconRotateCcw, IconSave, IconSearch, IconSettings,
  IconSmartphone, IconSun, IconX,
} from '../lib/ui-icons.jsx'

// Header gọn: tiêu đề view hiện tại + ô tìm kiếm kiểu command-palette +
// nút sáng/tối + menu Cài đặt. Logo và điều hướng chính nằm ở Sidebar trái;
// chuyển học kỳ HK1/HK2 chỉ nằm ở sidebar — header không còn bản sao nào.
export function Header({ viewTitle, theme, settingsOpen, onSettingsOpenChange, onExportCSV, onExportBackup, onImportJSON, onRestoreSeed, onExportIcs, onExportPng, preset, reminders, onReminderToggle, onReminderMinutes, onRequestPermission, install, search, onSearchChange }) {
  const fileRef = useRef(null)
  const menuRef = useRef(null)
  const searchRef = useRef(null)

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

  // Phím "/" đưa con trỏ vào ô tìm kiếm (trừ khi đang gõ trong ô khác).
  useEffect(() => {
    function onKey(e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      e.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  function run(action) {
    action()
    onSettingsOpenChange(false)
  }

  const ThemeIcon = theme.mode === 'dark' ? IconMoon : theme.mode === 'system' ? IconMonitor : IconSun

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold leading-tight text-foreground">{viewTitle}</h1>
          <p className="hidden text-xs text-muted sm:block">SchedulingApp · Nguyễn Hữu Lộc · IUH</p>
        </div>
        <div className="relative order-3 w-full min-w-0 sm:order-none sm:w-auto sm:min-w-[240px] sm:flex-1 sm:max-w-md">
          {/* Icon kính lúp: pointer-events-none, nằm gọn trong vùng đệm trái
              pl-10 của input — trước đây `.input` (không layer) đã nuốt mất
              pl-9/pr-10 nên icon đè lên placeholder; đã sửa ở index.css. */}
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm môn, giảng viên, phòng, mã LHP…"
            aria-label="Tìm môn, giảng viên, phòng, mã LHP"
            className="input rounded-full py-2 pl-10 pr-10"
          />
          {/* Gợi ý phím "/" chỉ hiện khi ô trống; có chữ thì hiện nút xóa —
              hai thứ không bao giờ chồng lên nhau, và pr-10 giữ chữ gõ
              không chạy xuống dưới chúng. */}
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Xóa tìm kiếm"
              title="Xóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted transition-soft hover:bg-border hover:text-foreground"
            >
              <IconX className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[11px] font-bold text-muted sm:block">/</kbd>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={theme.cycleMode}
            title="Đổi sáng / tối / theo hệ thống"
            aria-label="Đổi giao diện sáng tối"
            className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <ThemeIcon className="h-4 w-4" />
            <span className="hidden lg:inline">{theme.mode === 'dark' ? 'Tối' : theme.mode === 'system' ? 'Hệ thống' : 'Sáng'}</span>
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => onSettingsOpenChange(!settingsOpen)}
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
              className="btn-ghost flex items-center gap-2 px-3 py-1.5 text-sm"
            >
              <IconSettings className="h-4 w-4" />
              Cài đặt
            </button>
            {settingsOpen && (
              <div role="menu" className="card absolute right-0 z-40 mt-2 max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] max-w-xs overflow-y-auto p-2 sm:w-80">
                {theme && <ThemeSettings theme={theme} />}
                <button onClick={() => run(onExportCSV)} className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-soft hover:bg-primary/10">
                  <IconDownload className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Xuất CSV <span className="block text-xs font-normal text-muted">Tải lịch học kỳ này về file CSV</span></span>
                </button>
                <button onClick={() => run(onExportBackup)} className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-soft hover:bg-primary/10">
                  <IconSave className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Backup JSON <span className="block text-xs font-normal text-muted">Sao lưu toàn bộ lịch để chuyển máy</span></span>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-soft hover:bg-primary/10"
                >
                  <IconFolderOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Nhập JSON <span className="block text-xs font-normal text-muted">Khôi phục từ file backup JSON</span></span>
                </button>
                <button
                  onClick={() => {
                    onSettingsOpenChange(false)
                    if (confirm('Khôi phục toàn bộ lịch gốc từ ảnh / Excel của Lộc? Các thay đổi của bạn sẽ mất.')) onRestoreSeed()
                  }}
                  className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 dark:text-red-400 transition-soft hover:bg-red-500/10"
                >
                  <IconRotateCcw className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Khôi phục gốc <span className="block text-xs font-normal text-red-400 dark:text-red-300">Xóa hết thay đổi, về lại lịch gốc</span></span>
                </button>
                {onExportIcs && (
                  <button onClick={() => run(onExportIcs)} className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-soft hover:bg-primary/10">
                    <IconCalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Xuất .ics (Google Calendar) <span className="block text-xs font-normal text-muted">Tải file .ics rồi import vào Google Calendar → Lịch → Cài đặt → Nhập &amp; xuất</span></span>
                  </button>
                )}
                {onExportPng && (
                  <button onClick={() => run(onExportPng)} className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-soft hover:bg-primary/10">
                    <IconImage className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>Xuất ảnh PNG <span className="block text-xs font-normal text-muted">Tải lưới tuần thành ảnh để share nhóm</span></span>
                  </button>
                )}
                {preset && <PresetSettings preset={preset} />}
                {reminders && (
                  <div className="border-t border-border px-3 py-2">
                    <p className="flex items-center gap-2 text-sm font-bold text-foreground"><IconBell className="h-4 w-4 text-primary" /> Nhắc lịch</p>
                    <label className="mt-1 flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={reminders.settings.enabled} onChange={onReminderToggle} className="h-4 w-4 accent-indigo-600" />
                      Nhắc trước giờ học
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <span>Trước</span>
                      <select
                        value={reminders.settings.minutesBefore}
                        disabled={!reminders.settings.enabled}
                        onChange={(e) => onReminderMinutes(Number(e.target.value))}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-sm text-foreground"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                      </select>
                      <span>· thi/deadline nhắc trước 1 ngày</span>
                    </div>
                    {reminders.settings.enabled && reminders.permission !== 'granted' && (
                      <p className="mt-1 text-xs text-muted">
                        {reminders.permission === 'unsupported'
                          ? 'Trình duyệt này không hỗ trợ thông báo — banner trong app vẫn hiện.'
                          : 'Thông báo trình duyệt chưa bật — banner trong app vẫn hiện. '}
                        {reminders.permission === 'default' && (
                          <button onClick={onRequestPermission} className="font-bold text-primary underline">Bật thông báo</button>
                        )}
                      </p>
                    )}
                  </div>
                )}
                {install && (
                  <div className="border-t border-border px-3 py-2">
                    {install.canInstall ? (
                      <button onClick={() => run(install.promptInstall)} className="btn-primary flex w-full items-center gap-2 px-3 py-2 text-left text-sm">
                        <IconSmartphone className="h-4 w-4 shrink-0" />
                        Cài đặt app lên điện thoại
                      </button>
                    ) : (
                      <p className="flex items-start gap-2 text-xs text-muted"><IconSmartphone className="mt-0.5 h-4 w-4 shrink-0" /> Cài đặt app: mở menu trình duyệt → Thêm vào màn hình chính.</p>
                    )}
                  </div>
                )}
                <p className="border-t border-border px-3 pt-2 text-xs text-muted">
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
