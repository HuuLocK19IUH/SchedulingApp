import { DAY_NAMES, PERIOD_TIMES, TYPES, sessionLabel, timeRange } from '../lib/time.js'
import { Modal } from './Modal.jsx'
import { Field } from './Field.jsx'

export function SessionFormModal({ form, onFormChange, formConflicts, onClose, onSave, times = PERIOD_TIMES }) {
  if (!form) return null
  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-extrabold">{form.id ? 'Sửa buổi' : 'Thêm buổi mới'}</h3>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!form.subject.trim()) { alert('Nhập tên môn trước đã.'); return }
          onSave({ ...form, subject: form.subject.trim(), start: Number(form.start), end: Number(form.end), day: Number(form.day) })
        }}
      >
        <Field label="Tên môn *">
          <input required value={form.subject} onChange={(e) => onFormChange({ ...form, subject: e.target.value })} placeholder="VD: Lập trình WWW (Java)" className="input" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mã LHP"><input value={form.code} onChange={(e) => onFormChange({ ...form, code: e.target.value })} className="input" /></Field>
          <Field label="Lớp"><input value={form.className} onChange={(e) => onFormChange({ ...form, className: e.target.value })} placeholder="DHKTPM19BTT" className="input" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Thứ">
            <select value={form.day} onChange={(e) => onFormChange({ ...form, day: Number(e.target.value) })} className="input">
              {DAY_NAMES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
          </Field>
          <Field label="Từ tiết">
            <select value={form.start} onChange={(e) => onFormChange({ ...form, start: Number(e.target.value), end: Math.max(Number(e.target.value), form.end) })} className="input">
              {times.map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </Field>
          <Field label="Đến tiết">
            <select value={form.end} onChange={(e) => onFormChange({ ...form, end: Number(e.target.value) })} className="input">
              {times.map((_, i) => <option key={i} value={i + 1} disabled={i + 1 < form.start}>{i + 1}</option>)}
            </select>
          </Field>
        </div>
        <p className="text-xs text-slate-500">Giờ: {timeRange(Number(form.start), Number(form.end), times)} · Ca {sessionLabel(Number(form.start))}</p>
        {form.type === 'Thi' && (
          <Field label="Ngày thi (không bắt buộc)">
            <input type="date" value={form.examDate || ''} onChange={(e) => onFormChange({ ...form, examDate: e.target.value })} className="input" />
          </Field>
        )}
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
          <Field label="Phòng"><input value={form.room} onChange={(e) => onFormChange({ ...form, room: e.target.value })} placeholder="V12.01" className="input" /></Field>
          <Field label="Giảng viên"><input value={form.teacher} onChange={(e) => onFormChange({ ...form, teacher: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Loại">
          <select value={form.type} onChange={(e) => onFormChange({ ...form, type: e.target.value })} className="input">
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Ghi chú"><input value={form.note} onChange={(e) => onFormChange({ ...form, note: e.target.value })} placeholder="VD: Team code: 27adb02" className="input" /></Field>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Lưu</button>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Hủy</button>
        </div>
      </form>
    </Modal>
  )
}
