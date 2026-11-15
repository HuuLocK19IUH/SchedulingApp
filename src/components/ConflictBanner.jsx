import { DAY_NAMES } from '../lib/time.js'
import { IconAlertTriangle } from '../lib/ui-icons.jsx'

// Banner trùng tiết: viền trái đỏ dày + icon cảnh báo để không thể bỏ
// qua, liệt kê rõ từng buổi trùng để Lộc đối chiếu với web trường.
export function ConflictBanner({ conflictList }) {
  if (conflictList.length === 0) return null
  return (
    <div className="mt-4 rounded-2xl border border-red-300 border-l-4 border-l-red-600 bg-red-50 p-4 dark:border-red-700 dark:border-l-red-500 dark:bg-red-950/60">
      <p className="flex items-start gap-2 font-bold text-red-800 dark:text-red-200">
        <IconAlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <span>Trùng tiết — {conflictList.length} buổi đang chiếm cùng một tiết. Kiểm tra lại với web trường rồi sửa/xóa buổi sai:</span>
      </p>
      <ul className="mt-2 list-disc pl-5 text-sm text-red-700 dark:text-red-300">
        {conflictList.map((s) => (
          <li key={s.id} className="truncate" title={`${DAY_NAMES[s.day]}, tiết ${s.start}-${s.end}: ${s.subject} — ${s.room || 'chưa có phòng'}`}>
            <span className="whitespace-nowrap font-semibold">{DAY_NAMES[s.day]}, tiết {s.start}-{s.end}</span>: {s.subject} — {s.room || 'chưa có phòng'}
          </li>
        ))}
      </ul>
    </div>
  )
}
