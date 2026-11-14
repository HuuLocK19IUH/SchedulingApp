import { useEffect, useMemo, useState } from 'react'
import { SEED, SEMESTERS } from '../data/seed.js'
import { conflictIds, timeRange, todayIndex, DAY_NAMES } from '../lib/time.js'
import { download } from '../lib/download.js'
import { buildIcs } from '../lib/ics.js'

export const STORAGE_KEY = 'xep-lich-hoc-v1'

export const EMPTY_FORM = {
  subject: '', code: '', className: '', day: 0, start: 7, end: 9,
  room: '', teacher: '', note: '', type: 'Học',
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(SEED)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed.hk1) && Array.isArray(parsed.hk2)) return parsed
  } catch { /* dữ liệu hỏng -> dùng seed */ }
  return structuredClone(SEED)
}

export function parseDay(text) {
  const t = text.trim().toLowerCase()
  if (t.includes('chủ') || t === 'cn' || t.includes('sunday')) return 6
  const n = parseInt(t.replace(/[^0-9]/g, ''), 10)
  if (n >= 2 && n <= 7) return n - 2
  if (n === 8) return 6
  return null
}

export function parsePeriods(text) {
  const t = text.trim().replace(/[–—]/g, '-')
  const m = t.match(/^(\d{1,2})\s*(?:-\s*(\d{1,2}))?$/)
  if (!m) return null
  const start = parseInt(m[1], 10)
  const end = m[2] ? parseInt(m[2], 10) : start
  if (start < 1 || start > 16 || end < 1 || end > 16 || end < start) return null
  return [start, end]
}

/**
 * Toàn bộ trạng thái dữ liệu của lịch: nạp/lưu localStorage, chuyển học kỳ,
 * thêm/sửa/xóa buổi, nhập nhanh bằng dán, xuất/nhập file, khôi phục gốc.
 * Trạng thái giao diện (tìm kiếm, lọc, modal đang mở...) nằm ở DashboardPage.
 */
export function useSchedule() {
  const [data, setData] = useState(loadData)
  const [semester, setSemester] = useState('hk1')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const sessions = data[semester]
  const semInfo = SEMESTERS.find((s) => s.id === semester)
  const conflicts = useMemo(() => conflictIds(sessions), [sessions])

  const today = todayIndex()
  const tomorrow = (today + 1) % 7
  const daySessions = (d) => sessions.filter((s) => s.day === d).sort((a, b) => a.start - b.start)

  function showNotice(msg, ms = 3000) {
    setNotice(msg)
    setTimeout(() => setNotice(''), ms)
  }

  function saveData(next) {
    setData(next)
  }

  function updateSemester(list) {
    saveData({ ...data, [semester]: list })
  }

  function upsertSession(values) {
    const list = values.id
      ? sessions.map((s) => (s.id === values.id ? values : s))
      : [...sessions, { ...values, id: `u-${Date.now()}` }]
    updateSemester(list)
    showNotice(values.id ? 'Đã lưu thay đổi.' : 'Đã thêm buổi mới.')
  }

  function deleteSession(id) {
    updateSemester(sessions.filter((s) => s.id !== id))
    showNotice('Đã xóa buổi học.')
  }

  // Nhập nhanh: mỗi dòng "Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV".
  // Trả về { addedCount, message } để trang hiển thị kết quả.
  function importFromPaste(pasteText) {
    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) return { addedCount: 0, message: 'Chưa có dòng nào để nhập.' }
    const added = []
    const failed = []
    for (const line of lines) {
      const parts = line.split('|').map((p) => p.trim())
      const day = parts[1] ? parseDay(parts[1]) : null
      const periods = parts[2] ? parsePeriods(parts[2]) : null
      if (!parts[0] || day === null || !periods) {
        failed.push(line)
        continue
      }
      added.push({
        id: `p-${Date.now()}-${added.length}`,
        subject: parts[0], code: '', className: '',
        day, start: periods[0], end: periods[1],
        room: parts[3] || '', teacher: parts[4] || '', note: '', type: 'Học',
      })
    }
    if (added.length) updateSemester([...sessions, ...added])
    const message = `Đã thêm ${added.length} buổi.` +
      (failed.length ? ` ${failed.length} dòng lỗi, không nhập được: ${failed.join(' ; ')}` : '')
    return { addedCount: added.length, message }
  }

  function exportCSV() {
    const head = 'Môn,Mã LHP,Lớp,Thứ,Tiết bắt đầu,Tiết kết thúc,Giờ,Phòng,Giảng viên,Ghi chú,Loại'
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = sessions.map((s) => [
      s.subject, s.code, s.className, DAY_NAMES[s.day], s.start, s.end,
      timeRange(s.start, s.end), s.room, s.teacher, s.note, s.type,
    ].map(esc).join(','))
    download(`lich-hoc-${semester}.csv`, '\uFEFF' + [head, ...rows].join('\n'), 'text/csv')
  }

  // Xuất .ics: toàn bộ buổi cả 2 học kỳ + task có ngày hết hạn.
  // Task được truyền vào từ DashboardPage (hook này không giữ task).
  function exportIcs(tasks = []) {
    const allSessions = [...(data.hk1 || []), ...(data.hk2 || [])]
    download('schedulingapp-lich-hoc.ics', buildIcs(allSessions, tasks), 'text/calendar')
    showNotice('Đã tải file .ics — import vào Google Calendar để đồng bộ.', 4000)
  }

  function exportBackup() {
    download('lich-hoc-backup.json', JSON.stringify(data, null, 2), 'application/json')
  }

  function importJSON(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!Array.isArray(parsed.hk1) || !Array.isArray(parsed.hk2)) throw new Error('bad')
        for (const key of ['hk1', 'hk2']) {
          for (const s of parsed[key]) {
            if (!s.subject || typeof s.day !== 'number' || !s.start || !s.end) throw new Error('bad')
          }
        }
        saveData(parsed)
        showNotice('Đã khôi phục dữ liệu từ file JSON.', 4000)
      } catch {
        showNotice('File JSON không đúng định dạng backup của app.', 4000)
      }
    }
    reader.readAsText(file)
  }

  function restoreSeed() {
    saveData(structuredClone(SEED))
    showNotice('Đã khôi phục lịch gốc.')
  }

  // Chốt một phương án mô phỏng: thay toàn bộ buổi của học kỳ hiện tại
  // bằng các buổi trong phương án (cấp id mới để không đụng id cũ).
  // Chỉ chạy khi Lộc bấm "Chốt phương án" và xác nhận.
  function applyPlan(list, planName) {
    const copied = list.map((s, i) => ({ ...s, id: `u-${Date.now()}-${i}` }))
    updateSemester(copied)
    showNotice(`Đã chốt "${planName}" làm lịch ${semester === 'hk2' ? 'HK2' : 'HK1'}.`, 4000)
  }

  return {
    data,
    semester, setSemester,
    sessions, semInfo, conflicts,
    today, tomorrow, daySessions,
    notice,
    upsertSession, deleteSession,
    importFromPaste, exportCSV, exportBackup, exportIcs, importJSON, restoreSeed, applyPlan,
  }
}
