import { useEffect, useState } from 'react'
import {
  MAX_SEMESTERS, canRemoveSemester, defaultLabel, formatMonthDay,
  newSemesterId, parseMonthDay,
} from '../lib/semesters.js'

// Mục "Học kỳ" trong menu Cài đặt (Part 11): đổi tên, đổi khoảng ngày,
// thêm/xóa học kỳ. Sửa trong bản nháp rồi bấm Lưu một lần — giống cách
// PresetSettings chỉnh khung giờ. Khoảng ngày quyết định học kỳ nào là
// "hiện tại" (app tự chọn theo ngày hôm nay khi mở lên).
// Ràng buộc: tối thiểu 1 học kỳ, tối đa 8; không xóa học kỳ còn buổi học.
function validateDraft(draft) {
  const labels = new Set()
  for (let i = 0; i < draft.length; i++) {
    const row = draft[i]
    const label = (row.label || '').trim()
    if (!label) return `Học kỳ thứ ${i + 1} chưa có tên.`
    if (labels.has(label.toLowerCase())) return `Tên "${label}" bị trùng với học kỳ khác.`
    labels.add(label.toLowerCase())
    const start = parseMonthDay(row.start)
    const end = parseMonthDay(row.end)
    if (!start || !end) return `Ngày bắt đầu/kết thúc của "${label}" không hợp lệ (ngày phải tồn tại trong tháng).`
    if (start.month === end.month && start.day === end.day) return `Ngày bắt đầu và kết thúc của "${label}" trùng nhau.`
  }
  return ''
}

export function SemesterSettings({ semesters, currentSemId, counts, onSave, onReset }) {
  const [draft, setDraft] = useState(semesters)
  const [error, setError] = useState('')

  // Đồng bộ bản nháp khi cấu hình đã lưu đổi từ bên ngoài (Lưu / Khôi
  // phục mặc định / nhập JSON khôi phục).
  useEffect(() => { setDraft(semesters); setError('') }, [semesters])

  const dirty = JSON.stringify(draft) !== JSON.stringify(semesters)

  function setRow(id, patch) {
    setDraft((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // Đổi tháng/ngày của một đầu khoảng: giữ đầu còn lại, chuẩn hóa "MM-DD".
  function setPart(id, which, part, value) {
    const row = draft.find((r) => r.id === id)
    if (!row) return
    const parsed = parseMonthDay(row[which]) || { month: 1, day: 1 }
    if (part === 'month') {
      setRow(id, { [which]: formatMonthDay(Number(value), parsed.day) })
    } else {
      // Ô ngày: cho xóa trắng lúc đang gõ (lưu sẽ báo lỗi); số > 31 thì bỏ qua.
      if (value === '') { setRow(id, { [which]: '' }); return }
      const day = parseInt(value, 10)
      if (Number.isNaN(day) || day < 1 || day > 31) return
      setRow(id, { [which]: formatMonthDay(parsed.month, day) })
    }
  }

  function addRow() {
    if (draft.length >= MAX_SEMESTERS) { setError(`Tối đa ${MAX_SEMESTERS} học kỳ.`); return }
    const id = newSemesterId(draft.map((r) => r.id))
    setDraft([...draft, { id, label: defaultLabel(draft), start: '01-01', end: '12-31' }])
    setError('')
  }

  function removeRow(id) {
    const check = canRemoveSemester(draft, counts, id)
    if (!check.ok) {
      setError(check.reason === 'last'
        ? 'Không xóa được học kỳ cuối cùng còn lại.'
        : `Học kỳ này còn ${check.count} buổi — xóa các buổi trước đã.`)
      return
    }
    setDraft(draft.filter((r) => r.id !== id))
    setError('')
  }

  function save() {
    const err = validateDraft(draft)
    if (err) { setError(err); return }
    setError('')
    onSave(draft.map(({ id, label, start, end }) => ({ id, label: label.trim(), start, end })))
  }

  return (
    <div className="border-t border-border px-3 py-2">
      <p className="text-sm font-bold text-foreground">📅 Học kỳ</p>
      <p className="mt-0.5 text-xs text-muted">
        Mặc định 3 học kỳ (HK3 là học kỳ hè — không bắt buộc, chủ yếu học
        vượt / học lại). Khoảng ngày quyết định học kỳ nào là “hiện tại”
        khi mở app. Khoảng ngày mặc định là ước lượng — sửa lại cho khớp
        lịch trường bạn.
      </p>

      <div className="mt-2 space-y-2">
        {draft.map((row, i) => {
          const start = parseMonthDay(row.start)
          const end = parseMonthDay(row.end)
          const count = counts?.[row.id] || 0
          return (
            <div key={row.id} className="rounded-xl border border-border bg-background p-2">
              <div className="flex items-center gap-1.5">
                <input
                  value={row.label}
                  onChange={(e) => setRow(row.id, { label: e.target.value })}
                  aria-label={`Tên học kỳ ${i + 1}`}
                  className="input min-w-0 flex-1 px-2 py-1 text-sm font-bold"
                />
                {row.id === currentSemId && (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">Hiện tại</span>
                )}
                <button
                  onClick={() => removeRow(row.id)}
                  aria-label={`Xóa ${row.label || 'học kỳ'}`}
                  title="Xóa học kỳ này"
                  className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
                >
                  ✕
                </button>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                <span>Từ</span>
                <select
                  value={start?.month ?? 1}
                  onChange={(e) => setPart(row.id, 'start', 'month', e.target.value)}
                  aria-label="Tháng bắt đầu"
                  className="rounded-lg border border-border bg-surface px-1 py-1 text-xs text-foreground"
                >
                  {Array.from({ length: 12 }, (_, m) => (
                    <option key={m + 1} value={m + 1}>Th {m + 1}</option>
                  ))}
                </select>
                <input
                  type="number" min={1} max={31}
                  value={start?.day ?? ''}
                  onChange={(e) => setPart(row.id, 'start', 'day', e.target.value)}
                  aria-label="Ngày bắt đầu"
                  className="w-12 rounded-lg border border-border bg-surface px-1 py-1 text-center text-xs text-foreground"
                />
                <span>đến</span>
                <select
                  value={end?.month ?? 1}
                  onChange={(e) => setPart(row.id, 'end', 'month', e.target.value)}
                  aria-label="Tháng kết thúc"
                  className="rounded-lg border border-border bg-surface px-1 py-1 text-xs text-foreground"
                >
                  {Array.from({ length: 12 }, (_, m) => (
                    <option key={m + 1} value={m + 1}>Th {m + 1}</option>
                  ))}
                </select>
                <input
                  type="number" min={1} max={31}
                  value={end?.day ?? ''}
                  onChange={(e) => setPart(row.id, 'end', 'day', e.target.value)}
                  aria-label="Ngày kết thúc"
                  className="w-12 rounded-lg border border-border bg-surface px-1 py-1 text-center text-xs text-foreground"
                />
                {count > 0 && <span className="ml-auto font-semibold">{count} buổi</span>}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          onClick={addRow}
          disabled={draft.length >= MAX_SEMESTERS}
          className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs font-bold hover:bg-primary/10 disabled:opacity-40"
        >
          ＋ Thêm học kỳ
        </button>
        <button
          onClick={save}
          disabled={!dirty}
          className="flex-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-xs font-bold text-white disabled:opacity-40"
        >
          Lưu học kỳ
        </button>
      </div>
      <div className="mt-1.5 flex gap-2">
        <button
          onClick={() => { setDraft(semesters); setError('') }}
          disabled={!dirty}
          className="flex-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-primary/10 disabled:opacity-40"
        >
          Hủy thay đổi
        </button>
        <button
          onClick={onReset}
          className="flex-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-primary/10"
        >
          Khôi phục mặc định (3 học kỳ)
        </button>
      </div>
    </div>
  )
}
