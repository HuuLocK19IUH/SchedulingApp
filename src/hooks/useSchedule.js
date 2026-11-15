import { useEffect, useMemo, useState } from 'react'
import { SEED } from '../data/seed.js'
import { conflictIds, timeRange, todayIndex, DAY_NAMES, PERIOD_TIMES } from '../lib/time.js'
import { inferMode, modeLabel, normalizeMode, resolveMode } from '../lib/colors.js'
import {
  DEFAULT_SEMESTERS, SEMESTERS_STORAGE_KEY,
  currentSemesterId, normalizeDataMap, normalizeSemesters, parseBackup,
} from '../lib/semesters.js'
import { download } from '../lib/download.js'
import { buildIcs } from '../lib/ics.js'

export const STORAGE_KEY = 'xep-lich-hoc-v1'

export const EMPTY_FORM = {
  subject: '', code: '', className: '', day: 0, start: 7, end: 9,
  room: '', teacher: '', note: '', type: 'Học', examDate: '', icon: '',
}

// Cấu hình học kỳ (Part 11): đọc từ localStorage, sai/hỏng -> mặc định 3.
function loadSemesters() {
  try {
    const raw = localStorage.getItem(SEMESTERS_STORAGE_KEY)
    if (!raw) return DEFAULT_SEMESTERS.map((s) => ({ ...s }))
    return normalizeSemesters(JSON.parse(raw))
  } catch { return DEFAULT_SEMESTERS.map((s) => ({ ...s })) }
}

// Dữ liệu buổi học: map id học kỳ -> mảng buổi. Dạng cũ {hk1, hk2} vẫn
// đọc được — chuẩn hóa thêm [] cho học kỳ nào chưa có (vd HK3 mới).
// Dữ liệu hỏng -> dùng seed.
function loadData(semesters) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(SEED)
    const map = normalizeDataMap(JSON.parse(raw), semesters)
    if (!map) return structuredClone(SEED)
    return map
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
export function useSchedule(times = PERIOD_TIMES) {
  const [semesters, setSemesters] = useState(loadSemesters)
  const [data, setData] = useState(() => loadData(loadSemesters()))
  // Học kỳ đang chọn: chỉ là state phiên (không lưu) — lần mở đầu lấy
  // theo ngày hôm nay (Part 11), không còn mặc định cứng 'hk1'.
  const [semester, setSemester] = useState(() => {
    const list = loadSemesters()
    return currentSemesterId(list) || list[0].id
  })
  const [notice, setNotice] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    try { localStorage.setItem(SEMESTERS_STORAGE_KEY, JSON.stringify(semesters)) } catch { /* bỏ qua */ }
  }, [semesters])

  // Học kỳ "hiện tại" theo ngày hôm nay — để sidebar gắn huy hiệu và để
  // quay về khi học kỳ đang chọn bị xóa. Tính lại mỗi lần render (rẻ).
  const currentSemId = currentSemesterId(semesters)
  const sessions = data[semester] || []
  const semInfo = semesters.find((s) => s.id === semester) || semesters[0]
  const semesterCounts = useMemo(() => {
    const counts = {}
    for (const s of semesters) counts[s.id] = (data[s.id] || []).length
    return counts
  }, [data, semesters])
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

  // --- Quản lý cấu hình học kỳ (Part 11) ---
  // Đổi cấu hình: nếu học kỳ đang chọn không còn trong danh sách thì quay
  // về học kỳ hiện tại theo ngày (hoặc học kỳ đầu danh sách).
  function updateSemesters(next) {
    const list = normalizeSemesters(next)
    setSemesters(list)
    if (!list.some((s) => s.id === semester)) {
      setSemester(currentSemesterId(list) || list[0].id)
    }
  }

  function resetSemesters() {
    const list = DEFAULT_SEMESTERS.map((s) => ({ ...s }))
    setSemesters(list)
    setSemester(currentSemesterId(list) || list[0].id)
  }

  function upsertSession(values) {
    // Chuẩn hóa hình thức trước khi lưu (Part 9): buổi Học giữ mode đã
    // chọn rõ, chưa có thì đoán theo tên môn; buổi không phải Học bỏ mode.
    const normalized = normalizeMode(values)
    const list = normalized.id
      ? sessions.map((s) => (s.id === normalized.id ? normalized : s))
      : [...sessions, { ...normalized, id: `u-${Date.now()}` }]
    updateSemester(list)
    showNotice(normalized.id ? 'Đã lưu thay đổi.' : 'Đã thêm buổi mới.')
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
        // Hình thức đoán theo tên môn (Part 9): chứa "thực hành" thì
        // thực hành, còn lại lý thuyết — sửa lại trong form Sửa buổi.
        mode: inferMode(parts[0]),
      })
    }
    if (added.length) updateSemester([...sessions, ...added])
    const message = `Đã thêm ${added.length} buổi.` +
      (failed.length ? ` ${failed.length} dòng lỗi, không nhập được: ${failed.join(' ; ')}` : '')
    return { addedCount: added.length, message }
  }

  function exportCSV() {
    // Cột "Hình thức" (Part 9): Lý thuyết / Thực hành cho buổi Học,
    // để trống cho buổi không phải Học. Đặt cuối để không làm lệch thứ
    // tự cột cũ khi mở bằng Excel.
    const head = 'Môn,Mã LHP,Lớp,Thứ,Tiết bắt đầu,Tiết kết thúc,Giờ,Phòng,Giảng viên,Ghi chú,Loại,Hình thức'
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = sessions.map((s) => [
      s.subject, s.code, s.className, DAY_NAMES[s.day], s.start, s.end,
      timeRange(s.start, s.end, times), s.room, s.teacher, s.note, s.type,
      s.type === 'Học' ? modeLabel(resolveMode(s)) : '',
    ].map(esc).join(','))
    // Tên file dùng nhãn học kỳ (Part 11) — bỏ ký tự lạ cho an toàn.
    const fileLabel = (semInfo?.label || semester).replace(/[^\p{L}\p{N}]+/gu, '-')
    download(`lich-hoc-${fileLabel}.csv`, '\uFEFF' + [head, ...rows].join('\n'), 'text/csv')
  }

  // Xuất .ics: toàn bộ buổi của MỌI học kỳ đã cấu hình + task có ngày hết hạn.
  // Task được truyền vào từ DashboardPage (hook này không giữ task).
  function exportIcs(tasks = []) {
    const allSessions = semesters.flatMap((s) => data[s.id] || [])
    download('schedulingapp-lich-hoc.ics', buildIcs(allSessions, tasks, { times }), 'text/calendar')
    showNotice('Đã tải file .ics — import vào Google Calendar để đồng bộ.', 4000)
  }

  function exportBackup() {
    // Dạng mới (Part 11): { version: 2, semesters, sessions } — nhập lại
    // được cả cấu hình học kỳ, không chỉ buổi học.
    download('lich-hoc-backup.json', JSON.stringify({ version: 2, semesters, sessions: data }, null, 2), 'application/json')
  }

  function importJSON(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        // parseBackup phân biệt dạng mới {version: 2, semesters, sessions}
        // với dạng cũ {hk1, hk2}; file lạ -> throw, KHÔNG xóa lịch.
        const { semesters: nextSemesters, data: map } = parseBackup(parsed, semesters)
        for (const list of Object.values(map)) {
          for (const s of list) {
            if (!s.subject || typeof s.day !== 'number' || !s.start || !s.end) throw new Error('bad')
          }
        }
        if (nextSemesters !== semesters) {
          setSemesters(nextSemesters)
          if (!nextSemesters.some((s) => s.id === semester)) {
            setSemester(currentSemesterId(nextSemesters) || nextSemesters[0].id)
          }
        }
        saveData(map)
        showNotice('Đã khôi phục dữ liệu từ file JSON.', 4000)
      } catch {
        showNotice('File JSON không đúng định dạng backup của app.', 4000)
      }
    }
    reader.readAsText(file)
  }

  function restoreSeed() {
    saveData(structuredClone(SEED))
    // Khôi phục gốc cũng về lại 3 học kỳ mặc định (Part 11).
    const list = DEFAULT_SEMESTERS.map((s) => ({ ...s }))
    setSemesters(list)
    setSemester(currentSemesterId(list) || list[0].id)
    showNotice('Đã khôi phục lịch gốc (3 học kỳ mặc định).')
  }

  // Chốt một phương án mô phỏng: thay toàn bộ buổi của học kỳ hiện tại
  // bằng các buổi trong phương án (cấp id mới để không đụng id cũ).
  // Chỉ chạy khi Lộc bấm "Chốt phương án" và xác nhận.
  function applyPlan(list, planName) {
    const copied = list.map((s, i) => ({ ...s, id: `u-${Date.now()}-${i}` }))
    updateSemester(copied)
    showNotice(`Đã chốt "${planName}" làm lịch ${semInfo?.label || semester}.`, 4000)
  }

  return {
    data,
    semester, setSemester,
    semesters, currentSemId, semInfo, semesterCounts,
    updateSemesters, resetSemesters,
    sessions, conflicts,
    today, tomorrow, daySessions,
    notice,
    upsertSession, deleteSession,
    importFromPaste, exportCSV, exportBackup, exportIcs, importJSON, restoreSeed, applyPlan,
  }
}
