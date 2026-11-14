// Xuất lịch sang file .ics (Google Calendar, một chiều, không backend).
// Mỗi buổi học lặp hàng tuần (COUNT=15 ≈ 1 học kỳ); task có ngày hết hạn
// thành sự kiện cả ngày. Giờ dùng "floating local time" (không gắn múi giờ)
// để đúng giờ tiết IUH dù import ở máy nào.
import { nextOccurrence, periodEndMinutes, periodStartMinutes, appDayToJsDay } from './time.js'

const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']

function pad(n) {
  return String(n).padStart(2, '0')
}

function fmtDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

function fmtDate(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

/** Escape text theo RFC 5545: \ , ; và xuống dòng. */
export function escapeIcsText(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Gấp dòng dài quá 75 ký tự theo RFC 5545 (CRLF + 1 khoảng trắng). */
function foldLine(line) {
  const out = []
  let rest = line
  out.push(rest.slice(0, 75))
  rest = rest.slice(75)
  while (rest.length > 0) {
    out.push(' ' + rest.slice(0, 74))
    rest = rest.slice(74)
  }
  return out.join('\r\n')
}

function eventLines(lines) {
  return lines.map(foldLine).join('\r\n')
}

function uid(prefix, i) {
  return `${prefix}-${Date.now()}-${i}@schedulingapp`
}

/**
 * @param {Array} sessions - các buổi học (day 0=T2..6=CN, start/end là tiết)
 * @param {Array} tasks - task có dueDate dạng 'YYYY-MM-DD'
 * @param {{ semesterWeeks?: number, from?: Date }} opts
 * @returns {string} nội dung file .ics (CRLF)
 */
export function buildIcs(sessions = [], tasks = [], opts = {}) {
  const weeks = opts.semesterWeeks || 15
  const from = opts.from || new Date()
  const events = []

  sessions.forEach((s, i) => {
    if (typeof s.day !== 'number' || !s.start || !s.end) return
    const start = nextOccurrence(s, from)
    const endMin = periodEndMinutes(s.end)
    const end = new Date(start)
    end.setHours(Math.floor(endMin / 60), endMin % 60, 0, 0)
    const desc = [s.code, s.className, s.teacher, s.note].filter(Boolean).join(' · ')
    events.push(eventLines([
      'BEGIN:VEVENT',
      `UID:${uid('class', i)}`,
      `DTSTAMP:${fmtDateTime(new Date())}`,
      `DTSTART:${fmtDateTime(start)}`,
      `DTEND:${fmtDateTime(end)}`,
      `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[s.day]};COUNT=${weeks}`,
      `SUMMARY:${escapeIcsText(s.subject)}`,
      s.room ? `LOCATION:${escapeIcsText(s.room)}` : '',
      desc ? `DESCRIPTION:${escapeIcsText(desc)}` : '',
      'END:VEVENT',
    ].filter(Boolean)))
  })

  tasks.forEach((t, i) => {
    if (!t.dueDate || t.done) return
    const [y, m, d] = t.dueDate.split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const end = new Date(y, m - 1, d + 1)
    const label = t.type === 'Thi' ? 'Thi' : t.type || 'Task'
    const summary = `[${label}] ${t.title}${t.subject ? ` — ${t.subject}` : ''}`
    events.push(eventLines([
      'BEGIN:VEVENT',
      `UID:${uid('task', i)}`,
      `DTSTAMP:${fmtDateTime(new Date())}`,
      `DTSTART;VALUE=DATE:${fmtDate(start)}`,
      `DTEND;VALUE=DATE:${fmtDate(end)}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      'END:VEVENT',
    ]))
  })

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SchedulingApp//Lich hoc//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}
