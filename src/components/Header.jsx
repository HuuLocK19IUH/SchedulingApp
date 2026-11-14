import { useRef } from 'react'
import { SEMESTERS } from '../data/seed.js'

export function Header({ semester, onSemesterChange, onExportCSV, onExportBackup, onImportJSON, onRestoreSeed }) {
  const fileRef = useRef(null)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SchedulingApp" className="h-10 w-10 rounded-xl object-cover" />
          <div>
            <h1 className="text-lg font-extrabold leading-tight">SchedulingApp</h1>
            <p className="text-xs text-slate-500">Xếp Lịch Học · Nguyễn Hữu Lộc · IUH</p>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1">
            {SEMESTERS.map((s) => (
              <button
                key={s.id}
                onClick={() => onSemesterChange(s.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold ${semester === s.id ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                {s.id === 'hk2' ? 'HK2 · Nháp' : 'HK1'}
              </button>
            ))}
          </div>
          <button onClick={onExportCSV} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Xuất CSV</button>
          <button onClick={onExportBackup} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Backup JSON</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">Nhập JSON</button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportJSON(f); e.target.value = '' }} />
          <button
            onClick={() => { if (confirm('Khôi phục toàn bộ lịch gốc từ ảnh / Excel của Lộc? Các thay đổi của bạn sẽ mất.')) onRestoreSeed() }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >Khôi phục gốc</button>
        </div>
      </div>
    </header>
  )
}
