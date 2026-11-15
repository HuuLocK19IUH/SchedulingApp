import { useEffect, useState } from 'react'
import { DAY_NAMES, sessionLabel, timeRange } from '../lib/time.js'
import { TYPE_STYLE, modeLabel, resolveMode } from '../lib/colors.js'
import { iconFor } from '../lib/icons.js'
import { Modal } from './Modal.jsx'
import { Row } from './Row.jsx'

// Xác nhận xóa (Part 10): trước đây nút "Xóa" xóa ngay lập tức. Giờ bấm
// "Xóa" chỉ chuyển modal sang trạng thái xác nhận trong cùng modal (KHÔNG
// dùng window.confirm): hiện tên + thứ/tiết của buổi, [Hủy] quay lại xem
// chi tiết, [Xóa buổi] mới gọi onDelete. Trạng thái nằm trong component
// này nên cả Lịch học (DashboardPage) lẫn Mô phỏng (SimulatorPage) đều
// được xác nhận xóa mà không sửa gì thêm. Hook đứng TRƯỚC `if (!session)
// return null` (luật Hooks); trạng thái reset khi mở sang buổi khác.
export function SessionDetailModal({ session, isConflict, onClose, onEdit, onDelete, onAddTask, times }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  useEffect(() => { setConfirmingDelete(false) }, [session?.id])
  if (!session) return null
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-extrabold leading-snug">{iconFor(session)} {session.subject}</h3>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${TYPE_STYLE[session.type]}`}>{session.type}</span>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Thứ" value={`${DAY_NAMES[session.day]} · Tiết ${session.start}-${session.end} (${sessionLabel(session.start)})`} />
        <Row label="Giờ" value={timeRange(session.start, session.end, times)} />
        {session.type === 'Học' && (
          <Row label="Hình thức" value={modeLabel(resolveMode(session))} />
        )}
        {session.type === 'Thi' && session.examDate && (
          <Row label="Ngày thi" value={new Date(`${session.examDate}T00:00:00`).toLocaleDateString('vi-VN')} />
        )}
        <Row label="Mã LHP" value={session.code || '—'} />
        <Row label="Lớp" value={session.className || '—'} />
        <Row label="Phòng" value={session.room || '—'} />
        <Row label="Giảng viên" value={session.teacher || '—'} />
        {session.note && <Row label="Ghi chú" value={session.note} />}
      </dl>
      {isConflict && (
        <p className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/60 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300">⚠️ Buổi này đang trùng tiết với một buổi khác cùng ngày — kiểm tra lại với web trường.</p>
      )}
      {confirmingDelete ? (
        <div role="alertdialog" aria-label="Xác nhận xóa buổi học" className="mt-5 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/60 p-4">
          <p className="font-bold text-red-800 dark:text-red-200">Xóa buổi này?</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {iconFor(session)} {session.subject} — {DAY_NAMES[session.day]} · Tiết {session.start}-{session.end}
            {session.room ? ` · ${session.room}` : ''}
          </p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">Buổi này sẽ bị xóa khỏi lịch và không khôi phục được (trừ khi Lộc khôi phục lại lịch gốc).</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setConfirmingDelete(false)} className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold">Hủy</button>
            <button onClick={onDelete} className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">Xóa buổi</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={onEdit} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Sửa</button>
          {onAddTask && (
            <button onClick={onAddTask} className="flex-1 rounded-xl border border-indigo-300 dark:border-indigo-600 px-4 py-2 text-sm font-bold text-indigo-700 dark:text-indigo-300">＋ Thêm task cho môn này</button>
          )}
          <button onClick={() => setConfirmingDelete(true)} className="rounded-xl border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400">Xóa</button>
          <button onClick={onClose} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-semibold">Đóng</button>
        </div>
      )}
    </Modal>
  )
}
