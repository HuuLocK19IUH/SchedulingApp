// Bộ phân tích lịch dán / file — hàm thuần, không có UI, không bịa dữ liệu.
// Mọi parser đều trả về { sessions, failed: [{ line, reason }] }.
// Thiếu thông tin bắt buộc (tên môn, thứ, tiết) -> vào failed với lý do,
// KHÔNG tự đoán thứ, không tự đoán tiết.

export function parseDay(text) {
  if (text == null) return null
  const t = String(text).trim().toLowerCase()
  if (!t) return null
  if (t.includes('chủ') || t === 'cn' || t.includes('sunday')) return 6
  const n = parseInt(t.replace(/[^0-9]/g, ''), 10)
  if (n >= 2 && n <= 7) return n - 2
  if (n === 8) return 6
  return null
}

export function parsePeriods(text) {
  if (text == null) return null
  const t = String(text).trim().replace(/[–—]/g, '-')
  const m = t.match(/(\d{1,2})\s*(?:-\s*(\d{1,2}))?/)
  if (!m) return null
  const start = parseInt(m[1], 10)
  const end = m[2] ? parseInt(m[2], 10) : start
  if (start < 1 || start > 16 || end < 1 || end > 16 || end < start) return null
  return [start, end]
}

let counter = 0
function newSession(fields) {
  counter += 1
  return {
    id: `imp-${Date.now()}-${counter}`,
    subject: '', code: '', className: '',
    day: null, start: 0, end: 0,
    room: '', teacher: '', note: '', type: 'Học',
    ...fields,
  }
}

function cleanSession(s) {
  return {
    ...s,
    subject: (s.subject || '').trim(),
    code: (s.code || '').trim(),
    className: (s.className || '').trim(),
    room: (s.room || '').trim(),
    teacher: (s.teacher || '').trim(),
    note: (s.note || '').trim(),
    type: s.type || 'Học',
  }
}

// (a) Dán nhanh — cùng định dạng với nhập nhanh trên dashboard:
// "Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV"
export function parseQuickPaste(text) {
  const sessions = []
  const failed = []
  for (const rawLine of String(text || '').split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const parts = line.split('|').map((p) => p.trim())
    const day = parts[1] ? parseDay(parts[1]) : null
    const periods = parts[2] ? parsePeriods(parts[2]) : null
    if (!parts[0]) { failed.push({ line, reason: 'Thiếu tên môn' }); continue }
    if (day === null) { failed.push({ line, reason: 'Không đọc được Thứ (VD: Thứ 2)' }); continue }
    if (!periods) { failed.push({ line, reason: 'Không đọc được tiết (VD: 7-9)' }); continue }
    sessions.push(cleanSession(newSession({
      subject: parts[0], day, start: periods[0], end: periods[1],
      room: parts[3] || '', teacher: parts[4] || '',
    })))
  }
  return { sessions, failed }
}

// (b) Dán từ web trường sv.iuh.edu.vn — các khối cách nhau bằng dòng trống.
// Mỗi khối có thể gồm: dòng "Thứ X", dòng tên môn, dòng mã dạng
// "DHKTPM19BTT - 422000402302", "Tiết: 1 - 3", "Phòng: V12.01", "GV: ...".
// Phòng / GV thiếu thì để trống, nhưng Thứ và Tiết thiếu thì KHÔNG nhập.
export function parseIuhPaste(text) {
  const sessions = []
  const failed = []
  const blocks = String(text || '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  // Nếu người dùng dán liền một khối không có dòng trống, vẫn thử tách
  // theo dòng "Thứ X" làm đầu mỗi khối mới.
  const allBlocks = blocks.length > 1 ? blocks : splitByDay(String(text || ''))

  for (const block of allBlocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    let day = null
    let periods = null
    let room = ''
    let teacher = ''
    let code = ''
    let className = ''
    let subject = ''
    for (const line of lines) {
      const lower = line.toLowerCase()
      if (/^thứ\s/i.test(line) || /^chủ nhật/i.test(line)) {
        day = parseDay(line)
        continue
      }
      if (/^tiết\s*:/i.test(line)) {
        periods = parsePeriods(line.replace(/^tiết\s*:/i, ''))
        continue
      }
      if (/^phòng\s*:/i.test(line)) {
        room = line.replace(/^phòng\s*:/i, '').trim()
        continue
      }
      if (/^(gv|giảng viên)\s*:/i.test(line)) {
        teacher = line.replace(/^(gv|giảng viên)\s*:/i, '').trim()
        continue
      }
      const codeMatch = line.match(/(\d{9,12})/)
      if (codeMatch && !code) {
        code = codeMatch[1]
        const before = line.slice(0, codeMatch.index).replace(/[-–—\s]+$/, '').trim()
        if (before) className = before
        continue
      }
      if (!subject && !/^(mã|tiết|phòng|gv|ghi chú|nhóm)/i.test(line)) subject = line
    }
    if (!subject) { failed.push({ line: block, reason: 'Không thấy tên môn trong khối' }); continue }
    if (day === null) { failed.push({ line: block, reason: 'Thiếu Thứ — app không tự đoán thứ, Lộc chọn thứ rồi nhập lại khối này' }); continue }
    if (!periods) { failed.push({ line: block, reason: 'Thiếu Tiết (VD: Tiết: 1 - 3)' }); continue }
    sessions.push(cleanSession(newSession({
      subject, code, className, day, start: periods[0], end: periods[1], room, teacher,
    })))
  }
  return { sessions, failed }
}

function splitByDay(text) {
  const lines = text.split('\n')
  const blocks = []
  let current = []
  for (const line of lines) {
    if (/^\s*(thứ\s*\d|chủ nhật)/i.test(line) && current.length) {
      blocks.push(current.join('\n'))
      current = [line]
    } else {
      current.push(line)
    }
  }
  if (current.length) blocks.push(current.join('\n'))
  return blocks.map((b) => b.trim()).filter(Boolean)
}

// Tách một dòng CSV/TSV, tôn trọng dấu ngoặc kép.
function splitRow(line, sep) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === sep && !inQuotes) {
      out.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur.trim())
  return out.map((v) => v.replace(/^"|"$/g, ''))
}

const HEADER_ALIASES = {
  subject: ['môn', 'tên môn', 'môn học', 'subject'],
  day: ['thứ', 'day'],
  start: ['tiết bắt đầu', 'từ tiết', 'tiết bd', 'start'],
  end: ['tiết kết thúc', 'đến tiết', 'tiết kt', 'end'],
  periods: ['tiết', 'tiết học', 'periods'],
  room: ['phòng', 'room'],
  teacher: ['gv', 'giảng viên', 'teacher'],
  code: ['mã lhp', 'mã', 'code'],
  className: ['lớp', 'class'],
  note: ['ghi chú', 'note'],
  type: ['loại', 'type'],
}

function findHeaderIndex(header, keys) {
  return header.findIndex((h) => keys.some((k) => h.toLowerCase().includes(k)))
}

// (c) CSV/TSV — file .csv/.tsv/.txt hoặc đoạn copy từ Excel.
// Có hàng tiêu đề thì tự nhận cột; không có thì mặc định thứ tự
// Môn, Thứ, Tiết bắt đầu, Tiết kết thúc, Phòng, GV, Mã.
export function parseCsvTsv(text) {
  const sessions = []
  const failed = []
  const rawLines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)
  if (!rawLines.length) return { sessions, failed }

  const sep = rawLines.some((l) => l.includes('\t')) ? '\t' : ','
  let rows = rawLines.map((l) => splitRow(l, sep))
  let col = { subject: 0, day: 1, start: 2, end: 3, room: 4, teacher: 5, code: 6, className: -1, note: -1, type: -1 }
  const first = rows[0].map((h) => h.toLowerCase())
  const hasHeader = Object.values(HEADER_ALIASES).some((keys) => findHeaderIndex(first, keys) >= 0)
  if (hasHeader) {
    col = {
      subject: findHeaderIndex(first, HEADER_ALIASES.subject),
      day: findHeaderIndex(first, HEADER_ALIASES.day),
      start: findHeaderIndex(first, HEADER_ALIASES.start),
      end: findHeaderIndex(first, HEADER_ALIASES.end),
      periods: findHeaderIndex(first, HEADER_ALIASES.periods),
      room: findHeaderIndex(first, HEADER_ALIASES.room),
      teacher: findHeaderIndex(first, HEADER_ALIASES.teacher),
      code: findHeaderIndex(first, HEADER_ALIASES.code),
      className: findHeaderIndex(first, HEADER_ALIASES.className),
      note: findHeaderIndex(first, HEADER_ALIASES.note),
      type: findHeaderIndex(first, HEADER_ALIASES.type),
    }
    rows = rows.slice(1)
  }

  for (const cells of rows) {
    const line = cells.join(sep === '\t' ? '\t' : ', ')
    const get = (i) => (i >= 0 && i < cells.length ? cells[i] : '')
    const subject = get(col.subject)
    const day = get(col.day) ? parseDay(get(col.day)) : null
    let periods = null
    if (col.start >= 0 && col.end >= 0 && get(col.start) && get(col.end)) {
      const s = parseInt(get(col.start), 10)
      const e = parseInt(get(col.end), 10)
      if (Number.isFinite(s) && Number.isFinite(e) && s >= 1 && e <= 16 && e >= s) periods = [s, e]
    } else if (col.periods >= 0 && get(col.periods)) {
      periods = parsePeriods(get(col.periods))
    } else if (col.start >= 0 && get(col.start)) {
      periods = parsePeriods(get(col.start))
    }
    if (!subject) { failed.push({ line, reason: 'Thiếu tên môn' }); continue }
    if (day === null) { failed.push({ line, reason: 'Không đọc được Thứ (VD: Thứ 2)' }); continue }
    if (!periods) { failed.push({ line, reason: 'Không đọc được tiết (VD: 7-9 hoặc 2 cột Tiết bắt đầu / Tiết kết thúc)' }); continue }
    sessions.push(cleanSession(newSession({
      subject,
      code: get(col.code),
      className: get(col.className),
      day, start: periods[0], end: periods[1],
      room: get(col.room), teacher: get(col.teacher),
      note: get(col.note), type: get(col.type) || 'Học',
    })))
  }
  return { sessions, failed }
}
