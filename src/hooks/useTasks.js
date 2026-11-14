import { useEffect, useState } from 'react'

export const TASKS_KEY = 'schedulingapp-tasks-v1'
export const TASK_TYPES = ['Bài tập', 'Thi', 'Deadline', 'Khác']

function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Task / deadline gắn vào môn.
 * { id, title, subject, sessionId, type, dueDate ('YYYY-MM-DD' hoặc ''),
 *   done, createdAt }
 * Bắt đầu với danh sách trống — không bịa ngày thi cho Lộc.
 */
export function useTasks() {
  const [tasks, setTasks] = useState(loadTasks)

  useEffect(() => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask({ title, subject = '', sessionId = null, type = 'Bài tập', dueDate = '' }) {
    const t = title.trim()
    if (!t) return null
    const task = {
      id: `t-${Date.now()}`,
      title: t,
      subject: subject.trim(),
      sessionId,
      type,
      dueDate,
      done: false,
      createdAt: Date.now(),
    }
    setTasks((prev) => [task, ...prev])
    return task
  }

  function toggleDone(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return { tasks, addTask, toggleDone, deleteTask }
}
