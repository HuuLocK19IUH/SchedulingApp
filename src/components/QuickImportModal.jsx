// Khối nhập nhanh: dán mỗi buổi một dòng, theo mẫu
// "Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV".
export function QuickImportModal({ open, pasteText, onPasteTextChange, pasteResult, onImport }) {
  if (!open) return null
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <p className="text-sm font-semibold">Dán mỗi buổi một dòng, theo mẫu:</p>
      <code className="mt-1 block rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs">Tên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV</code>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ví dụ: Lập trình WWW (Java) | Thứ 2 | 7-9 | V7.01 | Đặng Thị Thu Hà</p>
      <textarea
        value={pasteText} onChange={(e) => onPasteTextChange(e.target.value)} rows={4}
        placeholder="Dán lịch ở đây…"
        className="mt-3 w-full rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      />
      <div className="mt-2 flex items-center gap-3">
        <button onClick={onImport} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">Nhập vào lịch</button>
        {pasteResult && <span className="text-sm text-slate-600 dark:text-slate-300">{pasteResult}</span>}
      </div>
    </div>
  )
}
