import { useMemo, useState } from 'react'
import { findConflicts, todayIndex } from '../lib/time.js'
import { EMPTY_FORM, useSchedule } from '../hooks/useSchedule.js'
import { useTasks } from '../hooks/useTasks.js'
import { usePreset } from '../hooks/usePreset.js'
import { useReminders } from '../hooks/useReminders.js'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import { useTheme } from '../hooks/useTheme.js'
import { Header } from '../components/Header.jsx'
import { Sidebar, NAV_ITEMS, useSidebarCollapsed } from '../components/Sidebar.jsx'
import { StatsBar } from '../components/StatsBar.jsx'
import { ConflictBanner } from '../components/ConflictBanner.jsx'
import { ReminderBanner } from '../components/ReminderBanner.jsx'
import { TodayTomorrow } from '../components/TodayTomorrow.jsx'
import { TasksPanel } from '../components/TasksPanel.jsx'
import { Toolbar } from '../components/Toolbar.jsx'
import { QuickImportModal } from '../components/QuickImportModal.jsx'
import { WeekGrid } from '../components/WeekGrid.jsx'
import { SessionDetailModal } from '../components/SessionDetailModal.jsx'
import { SessionFormModal } from '../components/SessionFormModal.jsx'
import { SimulatorPage } from './SimulatorPage.jsx'
import { ExamList } from '../components/ExamList.jsx'
import { FreeTimeFinder } from '../components/FreeTimeFinder.jsx'
import { exportTimetablePng } from '../lib/exportPng.js'

const VIEW_TITLES = {
  schedule: '📅 Lịch học',
  exams: '📝 Lịch thi',
  simulator: '🧪 Mô phỏng đăng ký',
  freetime: '👥 Giờ trống chung',
  tasks: '✅ Task & Deadline',
}

export function DashboardPage() {
  const preset = usePreset()
  const theme = useTheme()
  const schedule = useSchedule(preset.times)
  const {
    semester, setSemester, sessions, conflicts,
    today, tomorrow, daySessions, notice,
    upsertSession, deleteSession, importFromPaste,
    exportCSV, exportBackup, exportIcs, importJSON, restoreSeed,
  } = schedule
  const tasksApi = useTasks()
  const reminders = useReminders(sessions, tasksApi.tasks, preset.times)
  const install = useInstallPrompt()
  const [taskPrefill, setTaskPrefill] = useState(null)
  const [sidebarCollapsed, toggleSidebarCollapsed] = useSidebarCollapsed()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const subjects = useMemo(
    () => [...new Set(sessions.map((s) => s.subject))].sort(),
    [sessions],
  )

  // Trạng thái giao diện (tìm kiếm, lọc, modal đang mở...) — dữ liệu nằm ở hook.
  // view: 'schedule' | 'exams' | 'simulator' | 'freetime' | 'tasks'
  const [view, setView] = useState('schedule')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('Tất cả')
  const [mobileDay, setMobileDay] = useState(todayIndex())
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(null) // null = đóng; {…EMPTY_FORM, id?} = mở
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteResult, setPasteResult] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sessions.filter((s) => {
      if (filterType !== 'Tất cả' && s.type !== filterType) return false
      if (!q) return true
      return [s.subject, s.teacher, s.room, s.code, s.className]
        .join(' ').toLowerCase().includes(q)
    })
  }, [sessions, search, filterType])
  const filteredIds = useMemo(() => new Set(filtered.map((s) => s.id)), [filtered])

  const stats = useMemo(() => ({
    subjects: new Set(sessions.map((s) => s.subject)).size,
    sessions: sessions.length,
    days: new Set(sessions.map((s) => s.day)).size,
    periods: sessions.reduce((sum, s) => sum + (s.end - s.start + 1), 0),
  }), [sessions])

  const conflictList = sessions.filter((s) => conflicts.has(s.id))
  const formConflicts = form ? findConflicts(form, sessions) : []

  function handlePaste() {
    const { addedCount, message } = importFromPaste(pasteText)
    setPasteResult(message)
    if (addedCount) setPasteText('')
  }

  return (
    <div className="min-h-screen" style={{ background: theme.backgroundCss }}>
      <Sidebar
        view={view}
        onViewChange={setView}
        semester={semester}
        onSemesterChange={setSemester}
        theme={theme}
        onOpenSettings={() => setSettingsOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      {/* Thanh tab ngang trên mobile — cùng các mục sidebar, không dùng hamburger. */}
      <nav className="sticky top-0 z-20 flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden dark:border-slate-700 dark:bg-slate-900/95">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
              view === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className={sidebarCollapsed ? 'md:pl-16' : 'md:pl-60'}>
        <Header
          semester={semester}
          onSemesterChange={setSemester}
          viewTitle={VIEW_TITLES[view]}
          theme={theme}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
          onExportCSV={exportCSV}
          onExportBackup={exportBackup}
          onExportIcs={() => exportIcs(tasksApi.tasks)}
          onExportPng={() => exportTimetablePng(sessions, preset.times, semester === 'hk2' ? 'HK2' : 'HK1')}
          preset={preset}
          onImportJSON={importJSON}
          onRestoreSeed={restoreSeed}
          reminders={reminders}
          onReminderToggle={reminders.toggleEnabled}
          onReminderMinutes={reminders.setMinutesBefore}
          onRequestPermission={reminders.requestPermission}
          install={install}
        />

        {view === 'simulator' ? (
          <SimulatorPage schedule={schedule} times={preset.times} dark={theme.dark} />
        ) : view === 'exams' ? (
          <main className="mx-auto max-w-7xl px-4 py-5">
            <h2 className="text-xl font-extrabold text-red-700 dark:text-red-300">Lịch thi</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Riêng các buổi thi và task thi — có ngày thi thì đếm ngược, chưa có ngày thì xếp sau.
              Các buổi thi vẫn hiện trên lưới tuần ở tab Lịch học.
            </p>
            <ExamList sessions={sessions} tasks={tasksApi.tasks} times={preset.times} onSelectSession={setDetail} />
          </main>
        ) : view === 'freetime' ? (
          <main className="mx-auto max-w-7xl px-4 py-5">
            <FreeTimeFinder mySessions={sessions} times={preset.times} />
            <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
            </footer>
          </main>
        ) : view === 'tasks' ? (
          <main className="mx-auto max-w-7xl px-4 py-5">
            <TasksPanel
              tasks={tasksApi.tasks}
              subjects={subjects}
              onAdd={tasksApi.addTask}
              onToggleDone={tasksApi.toggleDone}
              onDelete={tasksApi.deleteTask}
              prefill={taskPrefill}
            />
            <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
            </footer>
          </main>
        ) : (
        <main className="mx-auto max-w-7xl px-4 py-5">
          {notice && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-200">{notice}</div>
          )}
          <ReminderBanner banners={reminders.banners} onDismiss={reminders.dismissBanner} />

          <StatsBar stats={stats} />
          <ConflictBanner conflictList={conflictList} />
          <TodayTomorrow today={today} tomorrow={tomorrow} daySessions={daySessions} conflicts={conflicts} onSelect={setDetail} times={preset.times} dark={theme.dark} />

          <Toolbar
            search={search} onSearchChange={setSearch}
            filterType={filterType} onFilterChange={setFilterType}
            onAdd={() => setForm({ ...EMPTY_FORM })}
            pasteOpen={pasteOpen} onTogglePaste={() => setPasteOpen((v) => !v)}
          />
          <QuickImportModal
            open={pasteOpen}
            pasteText={pasteText} onPasteTextChange={setPasteText}
            pasteResult={pasteResult} onImport={handlePaste}
          />

          <WeekGrid
            sessions={sessions} filteredIds={filteredIds} conflicts={conflicts} today={today}
            mobileDay={mobileDay} onMobileDayChange={setMobileDay}
            daySessions={daySessions} onSelect={setDetail}
            onEmptyCell={(day, period) => setForm({ ...EMPTY_FORM, day, start: period, end: period })}
            times={preset.times}
            dark={theme.dark}
          />

          <footer className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
          </footer>
        </main>
        )}
      </div>

      <SessionDetailModal
        session={detail}
        times={preset.times}
        isConflict={detail ? conflicts.has(detail.id) : false}
        onClose={() => setDetail(null)}
        onEdit={() => { setForm({ ...detail }); setDetail(null) }}
        onDelete={() => { deleteSession(detail.id); setDetail(null) }}
        onAddTask={detail ? () => {
          setTaskPrefill({ subject: detail.subject, sessionId: detail.id, type: 'Bài tập', nonce: Date.now() })
          setDetail(null)
          setView('tasks')
        } : undefined}
      />
      <SessionFormModal
        form={form}
        times={preset.times}
        onFormChange={setForm}
        formConflicts={formConflicts}
        onClose={() => setForm(null)}
        onSave={(values) => { upsertSession(values); setForm(null) }}
      />
    </div>
  )
}
