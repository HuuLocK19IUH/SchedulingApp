import { DAY_NAMES } from '../lib/time.js'

export function ConflictBanner({ conflictList }) {
  if (conflictList.length === 0) return null
  return (
    <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4">
      <p className="font-bold text-red-800">⚠️ Có {conflictList.length} buổi đang trùng tiết — kiểm tra lại với web trường:</p>
      <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
        {conflictList.map((s) => (
          <li key={s.id}>{DAY_NAMES[s.day]}, tiết {s.start}-{s.end}: {s.subject} — {s.room || 'chưa có phòng'}</li>
        ))}
      </ul>
    </div>
  )
}
