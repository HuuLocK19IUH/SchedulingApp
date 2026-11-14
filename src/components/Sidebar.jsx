import { useEffect, useState } from 'react'

export const SIDEBAR_KEY = 'schedulingapp-sidebar-v1'

export const NAV_ITEMS = [
  { id: 'schedule', label: 'Lịch học', icon: '📅' },
  { id: 'exams', label: 'Lịch thi', icon: '📝' },
  { id: 'simulator', label: 'Mô phỏng đăng ký', icon: '🧪' },
  { id: 'freetime', label: 'Giờ trống chung', icon: '👥' },
  { id: 'tasks', label: 'Task & Deadline', icon: '✅' },
]

function loadCollapsed() {
  try { return localStorage.getItem(SIDEBAR_KEY) === 'collapsed' } catch { return false }
}

// Sidebar trái (desktop): logo + điều hướng chính của app. Thu gọn được
// về dạng chỉ icon (nhớ lựa chọn ở localStorage). Trên mobile (<md) không
// dùng sidebar dọc — DashboardPage vẽ thanh tab ngang thay thế.
export function Sidebar({ view, onViewChange, semester, onSemesterChange, theme, onOpenSettings, collapsed, onToggleCollapsed }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white/95 backdrop-blur md:flex dark:border-slate-700 dark:bg-slate-900/95 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className={`flex items-center gap-3 border-b border-slate-200 px-3 py-3 dark:border-slate-700 ${collapsed ? 'justify-center px-2' : ''}`}>
        <img src="/logo.png" alt="SchedulingApp" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold leading-tight">SchedulingApp</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Xếp Lịch Học · IUH</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                active
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              } ${collapsed ? 'justify-center px-2' : ''}`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {!collapsed && <span className="truncate text-left">{item.label}</span>}
            </button>
          )
        })}
        <button
          onClick={onOpenSettings}
          title={collapsed ? 'Cài đặt' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <span className="text-lg leading-none">⚙️</span>
          {!collapsed && <span className="truncate text-left">Cài đặt</span>}
        </button>
      </nav>

      <div className="space-y-2 border-t border-slate-200 px-2 py-3 dark:border-slate-700">
        {!collapsed ? (
          <>
            <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {[{ id: 'hk1', label: 'HK1' }, { id: 'hk2', label: 'HK2 · Nháp' }].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSemesterChange(s.id)}
                  className={`flex-1 rounded-md px-2 py-1.5 text-xs font-bold ${semester === s.id ? 'bg-white shadow dark:bg-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={theme.cycleMode}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
              title="Đổi sáng / tối / theo hệ thống"
            >
              {theme.dark ? '🌙 Tối' : '☀️ Sáng'} · {theme.mode === 'system' ? 'theo hệ thống' : theme.mode === 'dark' ? 'tối' : 'sáng'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSemesterChange(semester === 'hk1' ? 'hk2' : 'hk1')}
              title={`Học kỳ: ${semester === 'hk1' ? 'HK1' : 'HK2 · Nháp'} — bấm để đổi`}
              className="flex w-full items-center justify-center rounded-lg bg-slate-100 py-2 text-xs font-bold dark:bg-slate-800"
            >
              {semester === 'hk1' ? 'HK1' : 'HK2'}
            </button>
            <button
              onClick={theme.cycleMode}
              title="Đổi sáng / tối / theo hệ thống"
              className="flex w-full items-center justify-center rounded-lg border border-slate-300 py-2 text-base dark:border-slate-600"
            >
              {theme.dark ? '🌙' : '☀️'}
            </button>
          </>
        )}
        <button
          onClick={onToggleCollapsed}
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {collapsed ? '»' : '« Thu gọn'}
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
