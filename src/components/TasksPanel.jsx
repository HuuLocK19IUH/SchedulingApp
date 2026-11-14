import { useEffect, useMemo, useState } from 'react'
import { countdownLabel, daysUntil } from '../lib/time.js'
import { TASK_TYPES } from '../hooks/useTasks.js'

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (!a.dueDate && !b.dueDate) return b.createdAt - a.createdAt
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1
    return b.createdAt - a.createdAt
  })
}

export function TasksPanel({ tasks, subjects, onAdd, onToggleDone, onDelete, prefill }) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('Bài tập')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all') // all | open | done
  const [formError, setFormError] = useState('')

  // Khi bấm "Thêm task cho môn này" từ modal chi tiết buổi học.
  useEffect(() => {
    if (!prefill) return
    setSubject(prefill.subject || '')
    setType(prefill.type || 'Bài tập')
    if (prefill.dueDate) setDueDate(prefill.dueDate)
  }, [prefill])

  const nearestExam = useMemo(() => {
    const exams = tasks
      .filter((t) => !t.done && t.type === 'Thi' && t.dueDate)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
    return exams[0] || null
  }, [tasks])

  const visible = useMemo(() => {
    const sorted = sortTasks(tasks)
    if (filter === 'open') return sorted.filter((t) => !t.done)
    if (filter === 'done') return sorted.filter((t) => t.done)
    return sorted
  }, [tasks, filter])

  const openCount = tasks.filter((t) => !t.done).length

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Nhập tên task trước đã.')
      return
    }
    if (type === 'Thi' && !dueDate) {
      setFormError('Task loại Thi cần có ngày thi (ngày hết hạn).')
      return
    }
    onAdd({ title, subject, type, dueDate, sessionId: prefill?.sessionId || null })
    setTitle('')
    setDueDate('')
    setFormError('')
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="font-bold">Task &amp; deadline</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{openCount} chưa xong</span>
      </div>

      {nearestExam && (
        <p className="mt-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3 py-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200">
          🎯 Kỳ thi gần nhất: {nearestExam.title}
          {nearestExam.subject ? ` — ${nearestExam.subject}` : ''} · {countdownLabel(nearestExam.dueDate)}
          {` (${nearestExam.dueDate})`}
        </p>
      )}

      <form onSubmit={submit} className="mt-3 grid gap-2 md:grid-cols-[1fr_180px_130px_150px_auto]">
        <input
          value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên task — VD: Nộp bài tập tuần 5"
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
        />
        <input
          value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="Môn" list="task-subjects"
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
        />
        <datalist id="task-subjects">
          {subjects.map((s) => <option key={s} value={s} />)}
        </datalist>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm">
          {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm"
          aria-label="Ngày hết hạn"
        />
        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">+ Thêm</button>
      </form>
      {formError && <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">{formError}</p>}

      <div className="mt-3 flex gap-2">
        {[
          ['all', 'Tất cả'],
          ['open', 'Chưa xong'],
          ['done', 'Đã xong'],
        ].map(([v, label]) => (
          <button
            key={v} onClick={() => setFilter(v)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${filter === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Chưa có task — thêm task đầu tiên cho môn của bạn.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {visible.map((t) => {
            const overdue = !t.done && t.dueDate && daysUntil(t.dueDate) < 0
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 px-3 py-2">
                <input
                  type="checkbox" checked={t.done} onChange={() => onToggleDone(t.id)}
                  aria-label={`Đánh dấu xong: ${t.title}`} className="h-4 w-4 accent-indigo-600"
                />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${t.done ? 'text-slate-400 dark:text-slate-500 line-through' : ''}`}>
                    {t.title}
                  </span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {t.type}{t.subject ? ` · ${t.subject}` : ''}
                    {t.dueDate && (
                      <span className={overdue ? ' font-bold text-red-600 dark:text-red-400' : ' font-semibold text-indigo-700 dark:text-indigo-300'}>
                        {` · ${countdownLabel(t.dueDate)} (${t.dueDate})`}
                      </span>
                    )}
                  </span>
                </span>
                <button onClick={() => { if (confirm(`Xóa task "${t.title}"?`)) onDelete(t.id) }} className="text-xs font-bold text-red-600 dark:text-red-400">Xóa</button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
