import { useState } from 'react'
import { validatePeriodTimes } from '../lib/time.js'

// Mục "Khung giờ tiết" trong menu Cài đặt: chọn preset trường hoặc tự
// chỉnh 16 tiết. Đổi preset là đổi giờ khắp app (lưới, nhắc lịch, .ics,
// mô phỏng) vì mọi nơi đều đọc `times` từ hook usePreset.
export function PresetSettings({ preset }) {
  const [draft, setDraft] = useState(null) // bản nháp khi đang chỉnh tay
  const [error, setError] = useState('')
  const editing = preset.presetId === 'custom'
  const rows = editing ? (draft ?? preset.times) : preset.times

  function startEdit() {
    setDraft([...preset.times])
    setError('')
    preset.setPreset('custom')
  }

  function saveCustom() {
    const err = validatePeriodTimes(draft)
    if (err) { setError(err); return }
    const saveErr = preset.setCustom(draft)
    if (saveErr) { setError(saveErr); return }
    setError('')
    setDraft(null)
  }

  function setRow(i, part, value) {
    const next = [...rows]
    const [s, e] = next[i].split(' - ')
    next[i] = part === 'start' ? `${value} - ${e}` : `${s} - ${value}`
    setDraft(next)
  }

  return (
    <div className="border-t border-slate-100 px-3 py-2">
      <p className="text-sm font-bold">🕐 Khung giờ tiết</p>
      <select
        value={preset.presetId}
        onChange={(e) => { setDraft(null); setError(''); preset.setPreset(e.target.value) }}
        className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
      >
        {preset.presets.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
        <option value="custom">Tùy chỉnh…</option>
      </select>
      <p className="mt-1 text-xs text-slate-500">
        {preset.presetId === 'custom'
          ? 'Đang dùng khung giờ tự chỉnh.'
          : (preset.presets.find((p) => p.id === preset.presetId)?.note || '')}
      </p>

      {editing && (
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
          {rows.map((t, i) => {
            const [s, e] = t.split(' - ')
            return (
              <label key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-10 shrink-0 font-bold">Tiết {i + 1}</span>
                <input type="time" value={s} onChange={(e) => setRow(i, 'start', e.target.value)} className="w-full rounded border border-slate-300 px-1 py-0.5" />
                <span>–</span>
                <input type="time" value={e} onChange={(e) => setRow(i, 'end', e.target.value)} className="w-full rounded border border-slate-300 px-1 py-0.5" />
              </label>
            )
          })}
        </div>
      )}
      {editing && (
        <div className="mt-2 flex gap-2">
          <button onClick={saveCustom} className="flex-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-xs font-bold text-white">Lưu khung giờ</button>
          <button onClick={() => { setDraft(null); setError(''); preset.resetToIuh() }} className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold">Khôi phục IUH</button>
        </div>
      )}
      {!editing && (
        <button onClick={startEdit} className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold hover:bg-slate-50">
          Tự chỉnh từng tiết…
        </button>
      )}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}
