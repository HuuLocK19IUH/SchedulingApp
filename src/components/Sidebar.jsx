import { useEffect, useState } from 'react'
import {
  IconCalendarDays, IconCheckSquare, IconChevronLeft, IconChevronRight,
  IconClipboardList, IconFlask, IconMonitor, IconMoon, IconSettings,
  IconSun, IconUsers,
} from '../lib/ui-icons.jsx'

export const SIDEBAR_KEY = 'schedulingapp-sidebar-v1'

// Điều hướng chính — icon SVG inline (không emoji) cho UI chrome.
// Icon emoji của từng buổi học vẫn giữ nguyên (lib/icons.js).
export const NAV_ITEMS = [
  { id: 'schedule', label: 'Lịch học', Icon: IconCalendarDays, section: 'HỌC TẬP' },
  { id: 'exams', label: 'Lịch thi', Icon: IconClipboardList, section: 'HỌC TẬP' },
  { id: 'simulator', label: 'Mô phỏng đăng ký', Icon: IconFlask, section: 'HỌC TẬP' },
  { id: 'freetime', label: 'Giờ trống chung', Icon: IconUsers, section: 'CÔNG CỤ' },
  { id: 'tasks', label: 'Task & Deadline', Icon: IconCheckSquare, section: 'CÔNG CỤ' },
]

const MODE_LABEL = { light: 'Sáng', dark: 'Tối', system: 'Theo hệ thống' }
function ModeIcon({ mode, className }) {
  if (mode === 'dark') return <IconMoon className={className} />
  if (mode === 'system') return <IconMonitor className={className} />
  return <IconSun className={className} />
}

function loadCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'collapsed' } catch { return false }
}

// Sidebar trái (desktop): logo + điều hướng chính của app. Thu gọn được
// về dạng chỉ icon (nhớ lựa chọn ở localStorage). Trên mobile (<md) không
// dùng sidebar dọc — DashboardPage vẽ thanh tab ngang thay thế.
// Chuyển học kỳ chỉ nằm ở sidebar (không còn bản sao ở header) — vẽ đủ
// mọi học kỳ đã cấu hình (Part 11: mặc định 3, tối đa 8), học kỳ hiện
// tại theo ngày được gắn chấm "Hiện tại".
export function Sidebar({ view, onViewChange, semester, onSemesterChange, semesters = [], currentSemId, theme, onOpenSettings, collapsed, onToggleCollapsed }) {
  let lastSection = null
  const currentSem = semesters.find((s) => s.id === currentSemId)
  const selectedSem = semesters.find((s) => s.id === semester)
  // Thu gọn: bấm để về học kỳ hiện tại; đang ở đó rồi thì chuyển sang học
  // kỳ kế tiếp (xoay vòng) để vẫn đổi được học kỳ khi sidebar thu gọn.
  function handleCollapsedSemester() {
    if (!semesters.length) return
    if (semester !== currentSemId && currentSemId) { onSemesterChange(currentSemId); return }
    const i = semesters.findIndex((s) => s.id === semester)
    onSemesterChange(semesters[(i + 1) % semesters.length].id)
  }
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-surface md:flex ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`flex items-center gap-3 border-b border-border px-3 py-3 ${collapsed ? 'justify-center px-2' : ''}`}>
        <img src="/logo.png" alt="SchedulingApp" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight text-foreground">SchedulingApp</p>
            <p className="truncate text-xs text-muted">Xếp Lịch Học · IUH</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id
          const showSection = item.section !== lastSection
          lastSection = item.section
          return (
            <div key={item.id}>
              {showSection && !collapsed && (
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold tracking-wider text-muted">{item.section}</p>
              )}
              <button
                onClick={() => onViewChange(item.id)}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`transition-soft relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  active
                    ? 'bg-primary text-white shadow-card'
                    : 'text-muted hover:bg-primary/10 hover:text-foreground'
                } ${collapsed ? 'justify-center px-2' : ''}`}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" aria-hidden="true" />}
                <item.Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate text-left">{item.label}</span>}
              </button>
            </div>
          )
        })}
        {!collapsed && (
          <p className="px-3 pb-1 pt-2 text-[11px] font-bold tracking-wider text-muted">HỆ THỐNG</p>
        )}
        <button
          onClick={onOpenSettings}
          title={collapsed ? 'Cài đặt' : undefined}
          className={`transition-soft flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-primary/10 hover:text-foreground ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <IconSettings className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate text-left">Cài đặt</span>}
        </button>
      </nav>

      <div className="space-y-2 border-t border-border px-2 py-3">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 rounded-xl px-1 py-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">NL</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-foreground">Nguyễn Hữu Lộc</span>
                <span className="block truncate text-xs text-muted">IUH · Sinh viên</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
              {semesters.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSemesterChange(s.id)}
                  title={`${s.label}${s.id === currentSemId ? ' — học kỳ hiện tại' : ''}`}
                  className={`relative min-w-0 rounded-md px-1 py-1.5 text-xs font-bold ${semester === s.id ? 'bg-surface text-foreground shadow-card' : 'text-muted hover:text-foreground'}`}
                >
                  <span className="block truncate">{s.label}</span>
                  {s.id === currentSemId && (
                    <span className="mt-0.5 block text-[9px] font-bold leading-none text-primary">● Hiện tại</span>
                  )}
                </button>
              ))}
            </div>
            {currentSem && semester !== currentSemId && (
              <button
                onClick={() => onSemesterChange(currentSemId)}
                className="w-full rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                ⟲ Về {currentSem.label} (hiện tại)
              </button>
            )}
            <button
              onClick={theme.cycleMode}
              className="btn-ghost flex w-full items-center justify-center gap-2 px-2 py-1.5 text-xs"
              title="Đổi sáng / tối / theo hệ thống"
            >
              <ModeIcon mode={theme.mode} className="h-4 w-4" />
              {MODE_LABEL[theme.mode]}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCollapsedSemester}
              title={semester === currentSemId
                ? `Học kỳ: ${selectedSem?.label || semester} (hiện tại) — bấm để sang học kỳ kế tiếp`
                : `Đang xem ${selectedSem?.label || semester} — bấm để về ${currentSem?.label || 'học kỳ hiện tại'}`}
              className="flex w-full flex-col items-center justify-center rounded-lg bg-background py-2 text-xs font-bold text-foreground"
            >
              <span className="max-w-full truncate px-1">{selectedSem?.label || semester}</span>
              {semester === currentSemId && (
                <span className="text-[9px] font-bold leading-none text-primary">● Hiện tại</span>
              )}
            </button>
            <button
              onClick={theme.cycleMode}
              title={`Giao diện: ${MODE_LABEL[theme.mode]} — bấm để đổi`}
              className="btn-ghost flex w-full items-center justify-center py-2"
            >
              <ModeIcon mode={theme.mode} className="h-5 w-5" />
            </button>
          </>
        )}
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className="transition-soft flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-muted hover:bg-primary/10"
        >
          {collapsed ? <IconChevronRight className="h-4 w-4" /> : <><IconChevronLeft className="h-4 w-4" /> Thu gọn</>}
        </button>
      </div>
    </aside>
  )
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(loadCollapsed)
  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_KEY, collapsed ? 'collapsed' : 'open') } catch { /* bỏ qua */ }
  }, [collapsed])
  return [collapsed, () => setCollapsed((v) => !v)]
}
