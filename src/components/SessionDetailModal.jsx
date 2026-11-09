import { DAY_NAMES, sessionLabel, timeRange } from '../lib/time.js'
import { TYPE_STYLE } from '../lib/colors.js'
import { Modal } from './Modal.jsx'
import { Row } from './Row.jsx'

export function SessionDetailModal({ session, isConflict, onClose, onEdit, onDelete }) {
  if (!session) return null
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-extrabold leading-snug">{session.subject}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${TYPE_STYLE[session.type]}`}>{session.type}</span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Thứ" value={`${DAY_NAMES[session.day]} · Tiết ${session.start}-${session.end} (${sessionLabel(session.start)})`} />
        <Row label="Giờ" value={timeRange(session.start, session.end)} />
        <Row label="Mã LHP" value={session.code || '—'} />
        <Row label="Lớp" value={session.className || '—'} />
        <Row label="Phòng" value={session.room || '—'} />
        <Row label="Giảng viên" value={session.teacher || '—'} />
        {session.note && <Row label="Ghi chú" value={session.note} />}
      </dl>
      {isConflict && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">⚠️ Buổi này đang trùng tiết với một buổi khác cùng ngày — kiểm tra lại với web trường.</p>
      )}
      <div className="mt-5 flex gap-2">
        <button onClick={onEdit} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Sửa</button>
        <button onClick={onDelete} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-600">Xóa</button>
        <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Đóng</button>
      </div>
    </Modal>
  )
}
