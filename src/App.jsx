import { useEffect, useMemo, useRef, useState } from 'react'
import { SEED, SEMESTERS } from './data/seed.js'
import {
  DAY_NAMES, DAY_SHORT, PERIOD_TIMES, TYPES,
  conflictIds, findConflicts, sessionLabel, timeRange, todayIndex,
} from './lib/time.js'

const STORAGE_KEY = 'xep-lich-hoc-v1'

// Một màu cho mỗi môn — tự sinh từ tên môn, ổn định giữa các lần mở.
const PALETTE = [
  { bg: '#dcfce7', border: '#16a34a', text: '#14532d' },
  { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a' },
  { bg: '#fef3c7', border: '#d97706', text: '#78350f' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843' },
  { bg: '#e0e7ff', border: '#4f46e5', text: '#312e81' },
  { bg: '#cffafe', border: '#0891b2', text: '#164e63' },
  { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d' },
  { bg: '#ede9fe', border: '#7c3aed', text: '#4c1d95' },
]
function colorFor(subject) {
  let h = 0
  for (const ch of subject) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const TYPE_STYLE = {
  'Học': 'bg-emerald-100 text-emerald-800',
  'Thi': 'bg-red-100 text-red-800',
  'Làm việc': 'bg-amber-100 text-amber-800',
  'Cá nhân': 'bg-sky-100 text-sky-800',
}

const EMPTY_FORM = {
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

function download(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function parseDay(text) {
  const t = text.trim().toLowerCase()
  if (t.includes('chủ') || t === 'cn' || t.includes('sunday')) return 6
  const n = parseInt(t.replace(/[^0-9]/g, ''), 10)
  if (n >= 2 && n <= 7) return n - 2
  if (n === 8) return 6
  return null
}

function parsePeriods(text) {
  const t = text.trim().replace(/[–—]/g, '-')
  const m = t.match(/^(\d{1,2})\s*(?:-\s*(\d{1,2}))?$/)
  if (!m) return null
  const start = parseInt(m[1], 10)
  const end = m[2] ? parseInt(m[2], 10) : start
  if (start < 1 || start > 16 || end < 1 || end > 16 || end < start) return null
  return [start, end]
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [semester, setSemester] = useState('hk1')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('Tất cả')
  const [mobileDay, setMobileDay] = useState(todayIndex())
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(null) // null = đóng; {…EMPTY_FORM, id?} = mở
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteResult, setPasteResult] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const sessions = data[semester]
  const semInfo = SEMESTERS.find((s) => s.id === semester)
  const conflicts = useMemo(() => conflictIds(sessions), [sessions])

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

  const today = todayIndex()
  const tomorrow = (today + 1) % 7
  const daySessions = (d) => sessions.filter((s) => s.day === d).sort((a, b) => a.start - b.start)

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
    setForm(null)
    setNotice(values.id ? 'Đã lưu thay đổi.' : 'Đã thêm buổi mới.')
    setTimeout(() => setNotice(''), 3000)
  }
  function deleteSession(id) {
    updateSemester(sessions.filter((s) => s.id !== id))
    setDetail(null)
    setNotice('Đã xóa buổi học.')
    setTimeout(() => setNotice(''), 3000)
  }

  const formConflicts = form ? findConflicts(form, sessions) : []

  function handlePaste() {
    const lines = pasteText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) { setPasteResult('Chưa có dòng nào để nhập.'); return }
    const added = []
    const failed = []
    for (const line of lines) {
      // Định dạng: Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV
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
    setPasteResult(
      `Đã thêm ${added.length} buổi.` +
      (failed.length ? ` ${failed.length} dòng lỗi, không nhập được: ${failed.join(' ; ')}` : ''),
    )
    if (added.length) setPasteText('')
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

  function handleImportJSON(file) {
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
        setNotice('Đã khôi phục dữ liệu từ file JSON.')
      } catch {
        setNotice('File JSON không đúng định dạng backup của app.')
      }
      setTimeout(() => setNotice(''), 4000)
    }
    reader.readAsText(file)
  }

  const conflictList = sessions.filter((s) => conflicts.has(s.id))

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl">📅</div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight">Xếp Lịch Học</h1>
              <p className="text-xs text-slate-500">Nguyễn Hữu Lộc · IUH · Lưu trên máy của bạn (localStorage)</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-1">
              {SEMESTERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSemester(s.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${semester === s.id ? 'bg-white shadow' : 'text-slate-600'}`}
                >
                  {s.id === 'hk2' ? 'HK2 · Nháp' : 'HK1'}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Xuất CSV</button>
            <button onClick={() => download(`lich-hoc-backup.json`, JSON.stringify(data, null, 2), 'application/json')} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Backup JSON</button>
            <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Nhập JSON</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportJSON(f); e.target.value = '' }} />
            <button
              onClick={() => { if (confirm('Khôi phục toàn bộ lịch gốc từ ảnh / Excel của Lộc? Các thay đổi của bạn sẽ mất.')) { saveData(structuredClone(SEED)); setNotice('Đã khôi phục lịch gốc.'); setTimeout(() => setNotice(''), 3000) } }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >Khôi phục gốc</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {notice && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">{notice}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Môn học', value: stats.subjects },
            { label: 'Buổi / tuần', value: stats.sessions },
            { label: 'Ngày học / tuần', value: stats.days },
            { label: 'Tiết / tuần', value: stats.periods },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-2xl font-extrabold text-indigo-700">{c.value}</div>
              <div className="text-sm text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500">{semInfo.name} — {semInfo.note}</p>

        {/* Cảnh báo trùng tiết */}
        {conflictList.length > 0 && (
          <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4">
            <p className="font-bold text-red-800">⚠️ Có {conflictList.length} buổi đang trùng tiết — kiểm tra lại với web trường:</p>
            <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
              {conflictList.map((s) => (
                <li key={s.id}>{DAY_NAMES[s.day]}, tiết {s.start}-{s.end}: {s.subject} — {s.room || 'chưa có phòng'}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Hôm nay / Ngày mai */}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[{ d: today, label: 'Hôm nay' }, { d: tomorrow, label: 'Ngày mai' }].map(({ d, label }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="font-bold">{label} — {DAY_NAMES[d]}</h2>
              {daySessions(d).length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Không có buổi học. Nghỉ ngơi hoặc xếp lịch làm việc.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {daySessions(d).map((s) => {
                    const c = colorFor(s.subject)
                    return (
                      <li key={s.id}>
                        <button onClick={() => setDetail(s)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-left hover:bg-slate-50">
                          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: c.border }} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{s.subject}</span>
                            <span className="block text-xs text-slate-500">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end)}{s.room ? ` · ${s.room}` : ''}</span>
                          </span>
                          {conflicts.has(s.id) && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Trùng</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Tìm kiếm / lọc / thêm */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm môn, giảng viên, phòng, mã LHP…"
            className="min-w-[220px] flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <div className="flex flex-wrap gap-1.5">
            {['Tất cả', ...TYPES].map((t) => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => setForm({ ...EMPTY_FORM })} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">+ Thêm buổi</button>
          <button onClick={() => setPasteOpen((v) => !v)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            {pasteOpen ? 'Ẩn nhập nhanh' : '⌨️ Nhập nhanh (dán)'}
          </button>
        </div>

        {/* Nhập nhanh */}
        {pasteOpen && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">Dán mỗi buổi một dòng, theo mẫu:</p>
            <code className="mt-1 block rounded-lg bg-slate-100 px-3 py-2 text-xs">Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV</code>
            <p className="mt-1 text-xs text-slate-500">Ví dụ: Lập trình WWW (Java) | Thứ 2 | 7-9 | V7.01 | Đặng Thị Thu Hà</p>
            <textarea
              value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4}
              placeholder="Dán lịch ở đây…"
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <div className="mt-2 flex items-center gap-3">
              <button onClick={handlePaste} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Nhập vào lịch</button>
              {pasteResult && <span className="text-sm text-slate-600">{pasteResult}</span>}
            </div>
          </div>
        )}

        {/* Lưới tuần — desktop */}
        <div className="timetable-scroll mt-5 hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:block">
          <div
            className="grid min-w-[920px]"
            style={{ gridTemplateColumns: '76px repeat(7, minmax(0, 1fr))', gridTemplateRows: '42px repeat(16, 56px)' }}
          >
            <div className="flex items-center justify-center border-b border-slate-200 text-xs font-bold text-slate-500">Ca / Tiết</div>
            {DAY_NAMES.map((d, i) => (
              <div key={d} className={`flex items-center justify-center border-b border-slate-200 text-sm font-bold ${i === today ? 'text-indigo-700' : ''}`}>
                {d}{i === today ? ' •' : ''}
              </div>
            ))}
            {PERIOD_TIMES.map((t, p) => (
              <div key={p} className="flex flex-col items-center justify-center border-b border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-600">T{p + 1}{p === 0 ? ' · Sáng' : p === 6 ? ' · Chiều' : p === 12 ? ' · Tối' : ''}</span>
                <span className="text-[10px] text-slate-400">{t}</span>
              </div>
            ))}
            {DAY_NAMES.map((_, day) =>
              PERIOD_TIMES.map((_, p) => (
                <div
                  key={`${day}-${p}`}
                  onClick={() => setForm({ ...EMPTY_FORM, day, start: p + 1, end: p + 1 })}
                  title={`${DAY_NAMES[day]} tiết ${p + 1} — bấm để thêm buổi`}
                  className="cursor-pointer border-b border-r border-slate-100 hover:bg-indigo-50/50"
                  style={{ gridColumn: day + 2, gridRow: p + 2 }}
                />
              )),
            )}
            {sessions.filter((s) => filteredIds.has(s.id)).map((s) => {
              const c = colorFor(s.subject)
              const isConflict = conflicts.has(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => setDetail(s)}
                  className="m-[2px] overflow-hidden rounded-lg p-1.5 text-left"
                  style={{
                    gridColumn: s.day + 2,
                    gridRow: `${s.start + 1} / ${s.end + 2}`,
                    background: c.bg,
                    borderLeft: `4px solid ${c.border}`,
                    boxShadow: isConflict ? '0 0 0 2px #dc2626 inset' : undefined,
                  }}
                >
                  <span className="block text-xs font-bold leading-tight" style={{ color: c.text }}>
                    {isConflict ? '⚠️ ' : ''}{s.subject}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-tight" style={{ color: c.text }}>
                    Tiết {s.start}-{s.end}{s.room ? ` · ${s.room}` : ''}
                  </span>
                  {s.teacher && <span className="block truncate text-[11px]" style={{ color: c.text }}>{s.teacher}</span>}
                  {s.type !== 'Học' && <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${TYPE_STYLE[s.type]}`}>{s.type}</span>}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-400">Bấm vào ô trống để thêm buổi mới vào tiết đó · Bấm vào khối môn để xem chi tiết.</p>
        </div>

        {/* Xem theo ngày — mobile */}
        <div className="mt-5 md:hidden">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {DAY_SHORT.map((d, i) => (
              <button key={d} onClick={() => setMobileDay(i)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-bold ${mobileDay === i ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).length === 0 && (
              <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Không có buổi nào trong ngày này (theo bộ lọc hiện tại).</p>
            )}
            {daySessions(mobileDay).filter((s) => filteredIds.has(s.id)).map((s) => {
              const c = colorFor(s.subject)
              return (
                <button key={s.id} onClick={() => setDetail(s)} className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm">
                  <span className="h-full min-h-10 w-1.5 rounded-full" style={{ background: c.border }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{s.subject}</span>
                    <span className="block text-xs text-slate-500">Tiết {s.start}-{s.end} · {timeRange(s.start, s.end)}</span>
                    <span className="block text-xs text-slate-500">{[s.room, s.teacher].filter(Boolean).join(' · ') || 'Chưa có phòng / GV'}</span>
                    {s.note && <span className="block text-xs text-slate-400">{s.note}</span>}
                  </span>
                  {conflicts.has(s.id) && <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Trùng</span>}
                </button>
              )
            })}
          </div>
        </div>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Dữ liệu chỉ lưu trên trình duyệt này (localStorage) — không có tài khoản, không có backend, không gửi dữ liệu đi đâu.
          Muốn dùng ở máy khác thì bấm Backup JSON rồi Nhập JSON ở máy đó.
        </footer>
      </main>

      {/* Modal chi tiết */}
      {detail && (
        <Modal onClose={() => setDetail(null)}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-extrabold leading-snug">{detail.subject}</h3>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${TYPE_STYLE[detail.type]}`}>{detail.type}</span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Thứ" value={`${DAY_NAMES[detail.day]} · Tiết ${detail.start}-${detail.end} (${sessionLabel(detail.start)})`} />
            <Row label="Giờ" value={timeRange(detail.start, detail.end)} />
            <Row label="Mã LHP" value={detail.code || '—'} />
            <Row label="Lớp" value={detail.className || '—'} />
            <Row label="Phòng" value={detail.room || '—'} />
            <Row label="Giảng viên" value={detail.teacher || '—'} />
            {detail.note && <Row label="Ghi chú" value={detail.note} />}
          </dl>
          {conflicts.has(detail.id) && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">⚠️ Buổi này đang trùng tiết với một buổi khác cùng ngày — kiểm tra lại với web trường.</p>
          )}
          <div className="mt-5 flex gap-2">
            <button onClick={() => { setForm({ ...detail }); setDetail(null) }} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Sửa</button>
            <button onClick={() => deleteSession(detail.id)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-600">Xóa</button>
            <button onClick={() => setDetail(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Đóng</button>
          </div>
        </Modal>
      )}

      {/* Modal thêm / sửa */}
      {form && (
        <Modal onClose={() => setForm(null)}>
          <h3 className="text-lg font-extrabold">{form.id ? 'Sửa buổi' : 'Thêm buổi mới'}</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!form.subject.trim()) { alert('Nhập tên môn trước đã.'); return }
              upsertSession({ ...form, subject: form.subject.trim(), start: Number(form.start), end: Number(form.end), day: Number(form.day) })
            }}
          >
            <Field label="Tên môn *">
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="VD: Lập trình WWW (Java)" className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mã LHP"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input" /></Field>
              <Field label="Lớp"><input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="DHKTPM19BTT" className="input" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Thứ">
                <select value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })} className="input">
                  {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </Field>
              <Field label="Từ tiết">
                <select value={form.start} onChange={(e) => setForm({ ...form, start: Number(e.target.value), end: Math.max(Number(e.target.value), form.end) })} className="input">
                  {PERIOD_TIMES.map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                </select>
              </Field>
              <Field label="Đến tiết">
                <select value={form.end} onChange={(e) => setForm({ ...form, end: Number(e.target.value) })} className="input">
                  {PERIOD_TIMES.map((_, i) => <option key={i} value={i + 1} disabled={i + 1 < form.start}>{i + 1}</option>)}
                </select>
              </Field>
            </div>
            <p className="text-xs text-slate-500">Giờ: {timeRange(Number(form.start), Number(form.end))} · Ca {sessionLabel(Number(form.start))}</p>
            {formConflicts.length > 0 && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                <b>⚠️ Trùng tiết với:</b>
                <ul className="list-disc pl-5">
                  {formConflicts.map((s) => <li key={s.id}>{s.subject} — tiết {s.start}-{s.end}{s.room ? ` · ${s.room}` : ''}</li>)}
                </ul>
                Vẫn lưu được nếu Lộc cố tình xếp trùng, nhưng nên kiểm tra lại.
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phòng"><input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="V12.01" className="input" /></Field>
              <Field label="Giảng viên"><input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className="input" /></Field>
            </div>
            <Field label="Loại">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Ghi chú"><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="VD: Team code: 27adb02" className="input" /></Field>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Lưu</button>
              <button type="button" onClick={() => setForm(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Hủy</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 font-semibold text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{value}</dd>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500">{label}</span>
      {children}
    </label>
  )
}
