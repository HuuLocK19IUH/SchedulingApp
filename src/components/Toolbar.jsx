import { TYPES } from '../lib/time.js'

export function Toolbar({ search, onSearchChange, filterType, onFilterChange, onAdd, pasteOpen, onTogglePaste }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      <input
        value={search} onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Tìm môn, giảng viên, phòng, mã LHP…"
        className="min-w-[220px] flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500"
      />
      <div className="flex flex-wrap gap-1.5">
        {['Tất cả', ...TYPES].map((t) => (
          <button key={t} onClick={() => onFilterChange(t)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${filterType === t ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>
      <button onClick={onAdd} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">+ Thêm buổi</button>
      <button onClick={onTogglePaste} className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800">
        {pasteOpen ? 'Ẩn nhập nhanh' : '⌨️ Nhập nhanh (dán)'}
      </button>
    </div>
  )
}
