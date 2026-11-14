import { useRef, useState } from 'react'
import { parseIuhPaste, parseQuickPaste, parseCsvTsv } from '../lib/importers.js'

// Panel nhập lịch cho một phương án, 3 cách — chưa có OCR (bước sau).
// Mỗi cách đều báo số buổi nhập được + các dòng lỗi kèm lý do, không bịa dữ liệu.
const TABS = [
  { id: 'iuh', label: 'Dán từ web trường' },
  { id: 'quick', label: 'Dán nhanh' },
  { id: 'file', label: 'Tải file CSV/TSV' },
]

const EXAMPLES = {
  iuh: `Đảm bảo chất lượng và Kiểm thử phần mềm
DHKTPM19BTT - 422000402302
Tiết: 1 - 3
Phòng: V12.01
GV: Châu Thị Bảo Hà

Lập trình WWW (Java)
DHKTPM19BTT - 422000395002
Tiết: 4 - 6
Phòng: H3.1.1
GV: Đặng Thị Thu Hà`,
  quick: `Lập trình WWW (Java) | Thứ 2 | 7-9 | V7.01 | Đặng Thị Thu Hà`,
  file: `Môn,Thứ,Tiết bắt đầu,Tiết kết thúc,Phòng,GV,Mã
Lập trình WWW (Java),Thứ 2,7,9,V7.01,Đặng Thị Thu Hà,422000395002`,
}

export function PlanImport({ onImport }) {
  const [tab, setTab] = useState('iuh')
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  function runImport(parsed) {
    const added = parsed.sessions.length ? onImport(parsed.sessions) : 0
    setResult({ ...parsed, added })
  }

  function handleTextImport() {
    if (!text.trim()) { setResult({ sessions: [], failed: [{ line: '', reason: 'Chưa dán gì cả.' }], added: 0 }); return }
    if (tab === 'iuh') runImport(parseIuhPaste(text))
    else runImport(parseQuickPaste(text))
  }

  function handleFile(file) {
    const reader = new FileReader()
    reader.onload = () => {
      // File CSV/TSV là văn bản: phân tích như dán, nhưng dùng parser bảng.
      runImport(parseCsvTsv(String(reader.result || '')))
    }
    reader.readAsText(file)
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-extrabold">Nhập lớp vào phương án này</h3>
      <p className="mt-1 text-xs text-slate-500">
        Dán đoạn copy từ sv.iuh.edu.vn, dán nhanh, hoặc tải file CSV/TSV xuất từ Excel.
        Chưa có OCR ảnh chụp — đó là bước sau.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResult(null) }}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'file' ? (
        <div className="mt-3">
          <p className="text-sm font-semibold">File CSV / TSV / TXT — hàng đầu là tiêu đề cột (tùy chọn):</p>
          <code className="mt-1 block whitespace-pre-wrap rounded-lg bg-slate-100 px-3 py-2 text-xs">{EXAMPLES.file}</code>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            📂 Chọn file CSV / TSV
          </button>
          <input
            ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
          />
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-sm font-semibold">
            {tab === 'iuh'
              ? 'Dán nguyên đoạn copy từ trang Lịch học, lịch thi theo tuần của web trường — mỗi buổi một khối, cách nhau bằng dòng trống:'
              : 'Dán mỗi buổi một dòng, theo mẫu:'}
          </p>
          <code className="mt-1 block whitespace-pre-wrap rounded-lg bg-slate-100 px-3 py-2 text-xs">{EXAMPLES[tab]}</code>
          {tab === 'iuh' && (
            <p className="mt-1 text-xs text-slate-500">
              Nhớ copy kèm dòng "Thứ X" cho mỗi buổi. Thiếu Thứ hoặc thiếu Tiết thì app không tự đoán — dòng đó sẽ báo lỗi để Lộc sửa lại.
            </p>
          )}
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} rows={5}
            placeholder="Dán lịch ở đây…"
            className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button onClick={handleTextImport} className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
            Nhập vào phương án
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p>
            Đã thêm <b>{result.added} buổi</b>
            {result.failed.length > 0 && <> · <b className="text-red-700">{result.failed.length} dòng lỗi</b></>}
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs text-red-700">
              {result.failed.map((f, i) => (
                <li key={i}>
                  {f.reason}
                  {f.line && <span className="text-slate-500"> — "{String(f.line).slice(0, 80)}{String(f.line).length > 80 ? '…' : ''}"</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
