import { useMemo, useState } from 'react'
import { findConflicts, todayIndex } from '../lib/time.js'
import { EMPTY_FORM, useSchedule } from '../hooks/useSchedule.js'
import { useTasks } from '../hooks/useTasks.js'
import { useReminders } from '../hooks/useReminders.js'
import { useInstallPrompt } from '../hooks/useInstallPrompt.js'
import { Header } from '../components/Header.jsx'
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

export function DashboardPage() {
  const schedule = useSchedule()
  const {
    semester, setSemester, sessions, conflicts,
    today, tomorrow, daySessions, notice,
    upsertSession, deleteSession, importFromPaste,
    exportCSV, exportBackup, exportIcs, importJSON, restoreSeed,
  } = schedule
  const tasksApi = useTasks()
  const reminders = useReminders(sessions, tasksApi.tasks)
  const install = useInstallPrompt()
  const [taskPrefill, setTaskPrefill] = useState(null)
  const subjects = useMemo(
    () => [...new Set(sessions.map((s) => s.subject))].sort(),
    [sessions],
  )

  // Trạng thái giao diện (tìm kiếm, lọc, modal đang mở...) — dữ liệu nằm ở hook.
  const [view, setView] = useState('schedule') // 'schedule' | 'simulator'
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
    <div className="min-h-screen">
      <Header
        semester={semester}
        onSemesterChange={setSemester}
        onExportCSV={exportCSV}
        onExportBackup={exportBackup}
        onExportIcs={() => exportIcs(tasksApi.tasks)}
        onImportJSON={importJSON}
        onRestoreSeed={restoreSeed}
        view={view}
        onViewChange={setView}
        reminders={reminders}
        onReminderToggle={reminders.toggleEnabled}
        onReminderMinutes={reminders.setMinutesBefore}
        onRequestPermission={reminders.requestPermission}
        install={install}
      />

      {view === 'simulator' ? (
        <SimulatorPage schedule={schedule} />
      ) : (
      <main className="mx-auto max-w-7xl px-4 py-5">
        {notice && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">{notice}</div>
        )}
        <ReminderBanner banners={reminders.banners} onDismiss={reminders.dismissBanner} />

        <StatsBar stats={stats} />
        <ConflictBanner conflictList={conflictList} />
        <TodayTomorrow today={today} tomorrow={tomorrow} daySessions={daySessions} conflicts={conflicts} onSelect={setDetail} />
        <TasksPanel
          tasks={tasksApi.tasks}
          subjects={subjects}
          onAdd={tasksApi.addTask}
          onToggleDone={tasksApi.toggleDone}
          onDelete={tasksApi.deleteTask}
          prefill={taskPrefill}
        />

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
        />

        <footer className="mt-6 text-center text-xs text-slate-400">
          Dữ liệu chỉ lưu trên trình duyệt này — Backup JSON trước khi đổi máy.
        </footer>
      </main>
      )}

      <SessionDetailModal
        session={detail}
        isConflict={detail ? conflicts.has(detail.id) : false}
        onClose={() => setDetail(null)}
        onEdit={() => { setForm({ ...detail }); setDetail(null) }}
        onDelete={() => { deleteSession(detail.id); setDetail(null) }}
        onAddTask={detail ? () => {
          setTaskPrefill({ subject: detail.subject, sessionId: detail.id, type: 'Bài tập', nonce: Date.now() })
          setDetail(null)
          setView('schedule')
        } : undefined}
      />
      <SessionFormModal
        form={form}
        onFormChange={setForm}
        formConflicts={formConflicts}
        onClose={() => setForm(null)}
        onSave={(values) => { upsertSession(values); setForm(null) }}
      />
    </div>
  )
}
