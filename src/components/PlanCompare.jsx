import { scorePlan } from '../lib/planScore.js'

// Bảng so sánh các phương án. Mỗi hàng là một tiêu chí, mỗi cột là một
// phương án; giá trị tốt nhất trong hàng được tô đậm + nền xanh.
// Điểm càng cao càng tốt; các tiêu chí còn lại càng thấp càng tốt.
const ROWS = [
  { key: 'score', label: 'Điểm lịch đẹp', higherBetter: true, suffix: ' điểm' },
  { key: 'days', label: 'Số ngày lên trường', higherBetter: false, suffix: ' ngày' },
  { key: 'eveningPeriods', label: 'Tiết buổi tối', higherBetter: false, suffix: ' tiết' },
  { key: 'totalPeriods', label: 'Tổng tiết / tuần', higherBetter: false, suffix: ' tiết' },
  { key: 'conflicts', label: 'Số cặp trùng', higherBetter: false, suffix: ' cặp' },
  { key: 'gapPeriods', label: 'Giờ trống giữa các ca', higherBetter: false, suffix: ' tiết' },
]

export function PlanCompare({ plans, activePlanId, onSelectPlan, onApplyPlan }) {
  if (!plans.length) return null
  const scored = plans.map((p) => ({ plan: p, ...scorePlan(p.sessions) }))

  function bestValue(row) {
    const values = scored.map((s) => s[row.key])
    return row.higherBetter ? Math.max(...values) : Math.min(...values)
  }

  return (
    <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-left">
            <th className="px-4 py-3 font-bold">Tiêu chí</th>
            {scored.map(({ plan }) => (
              <th key={plan.id} className="px-4 py-3 font-bold">
                <button onClick={() => onSelectPlan(plan.id)} className="text-left hover:underline">
                  {plan.name}
                  {plan.id === activePlanId && ' ●'}
                </button>
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">{plan.sessions.length} buổi</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const best = bestValue(row)
            return (
              <tr key={row.key} className="border-b border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2.5 font-semibold">{row.label}</td>
                {scored.map(({ plan, ...s }) => (
                  <td
                    key={plan.id}
                    className={`px-4 py-2.5 ${s[row.key] === best ? 'bg-emerald-50 dark:bg-emerald-950/60 font-extrabold text-emerald-800 dark:text-emerald-200' : ''}`}
                  >
                    {s[row.key]}{row.suffix}
                  </td>
                ))}
              </tr>
            )
          })}
          <tr>
            <td className="px-4 py-3 font-semibold">Chốt phương án</td>
            {scored.map(({ plan }) => (
              <td key={plan.id} className="px-4 py-3">
                <button
                  onClick={() => onApplyPlan(plan)}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-700"
                >
                  Chốt phương án này
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
        Điểm lịch đẹp = 100 − 20 × cặp trùng − 8 × (ngày lên trường vượt quá 3) − 3 × tiết buổi tối − 1 × tiết trống giữa các ca.
        Ô xanh lá là giá trị tốt nhất trong hàng.
      </p>
    </div>
  )
}
