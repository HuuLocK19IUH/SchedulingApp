import { useCallback, useEffect, useRef, useState } from 'react'
import {
  formatDateLocal, nextOccurrence, daysUntil, inMinutesLabel,
} from '../lib/time.js'

export const REMINDERS_KEY = 'schedulingapp-reminders-v1'
export const NOTIFIED_KEY = 'schedulingapp-notified-v1'

function loadSettings() {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return {
        enabled: !!p.enabled,
        minutesBefore: p.minutesBefore === 30 ? 30 : 15,
      }
    }
  } catch { /* dùng mặc định */ }
  return { enabled: false, minutesBefore: 15 }
}

function loadNotified() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveNotified(set) {
  try {
    // Chỉ giữ 200 mục gần nhất để localStorage không phình.
    const arr = [...set].slice(-200)
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr))
  } catch { /* bỏ qua */ }
}

/**
 * Nhắc lịch: kiểm tra mỗi 30 giây khi app đang mở.
 * - Buổi học: lần học tiếp theo bắt đầu trong vòng `minutesBefore` phút.
 * - Task: đến hạn hôm nay hoặc ngày mai.
 * Chống spam: mỗi buổi/ngày và mỗi task/ngày chỉ nhắc 1 lần (lưu key đã nhắc).
 * Thông báo trình duyệt chỉ là phần thêm — banner trong app luôn hiện
 * dù người dùng từ chối quyền thông báo.
 */
export function useReminders(sessions, tasks) {
  const [settings, setSettings] = useState(loadSettings)
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  )
  const [banners, setBanners] = useState([])
  const [dismissed, setDismissed] = useState(() => new Set())
  const notifiedRef = useRef(loadNotified())
  const sessionsRef = useRef(sessions)
  const tasksRef = useRef(tasks)
  const settingsRef = useRef(settings)
  sessionsRef.current = sessions
  tasksRef.current = tasks
  settingsRef.current = settings

  useEffect(() => {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(settings))
  }, [settings])

  const notify = useCallback((title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/icon-192.png' })
      } catch { /* trình duyệt chặn — banner trong app vẫn hiện */ }
    }
  }, [])

  const check = useCallback(() => {
    const cfg = settingsRef.current
    if (!cfg.enabled) {
      setBanners([])
      return
    }
    const now = new Date()
    const found = []
    const notified = notifiedRef.current
    let changed = false

    for (const s of sessionsRef.current) {
      const next = nextOccurrence(s, now)
      const diffMin = (next - now) / 60000
      if (diffMin < 0 || diffMin > cfg.minutesBefore) continue
      const key = `class:${s.id}:${formatDateLocal(next)}`
      if (!dismissed.has(key) && !notified.has(key)) {
        notified.add(key)
        changed = true
        notify(`Sắp học: ${s.subject}`, `Tiết ${s.start}-${s.end}${s.room ? ` · Phòng ${s.room}` : ''} · ${inMinutesLabel(next, now)}`)
      }
      if (!dismissed.has(key)) {
        found.push({
          id: key,
          kind: 'class',
          title: `Sắp học: ${s.subject}`,
          detail: `Tiết ${s.start}-${s.end}${s.room ? ` · Phòng ${s.room}` : ''} · bắt đầu ${inMinutesLabel(next, now)}`,
        })
      }
    }

    for (const t of tasksRef.current) {
      if (t.done || !t.dueDate) continue
      const diffDays = daysUntil(t.dueDate, now)
      if (diffDays !== 0 && diffDays !== 1) continue
      const key = `task:${t.id}:${formatDateLocal(now)}`
      if (!dismissed.has(key) && !notified.has(key)) {
        notified.add(key)
        changed = true
        const when = diffDays === 0 ? 'Hôm nay đến hạn' : 'Ngày mai đến hạn'
        notify(`${when}: ${t.title}`, t.subject ? `Môn: ${t.subject}` : '')
      }
      if (!dismissed.has(key)) {
        found.push({
          id: key,
          kind: 'task',
          title: `${diffDays === 0 ? 'Hôm nay đến hạn' : 'Ngày mai đến hạn'}: ${t.title}`,
          detail: t.subject ? `Môn: ${t.subject}` : '',
        })
      }
    }

    if (changed) saveNotified(notified)
    setBanners(found)
  }, [dismissed, notify])

  useEffect(() => {
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [check])

  function requestPermission() {
    if (typeof Notification === 'undefined') return
    Notification.requestPermission().then((p) => setPermission(p))
  }

  function toggleEnabled() {
    setSettings((prev) => {
      const next = { ...prev, enabled: !prev.enabled }
      if (next.enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().then((p) => setPermission(p))
      }
      return next
    })
  }

  function setMinutesBefore(v) {
    setSettings((prev) => ({ ...prev, minutesBefore: v === 30 ? 30 : 15 }))
  }

  function dismissBanner(id) {
    setDismissed((prev) => new Set(prev).add(id))
    setBanners((prev) => prev.filter((b) => b.id !== id))
  }

  return {
    settings, permission, banners,
    toggleEnabled, setMinutesBefore, requestPermission, dismissBanner,
  }
}
