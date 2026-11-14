import { useMemo, useState } from 'react'
import { conflictIds, findConflicts, todayIndex, DAY_NAMES } from '../lib/time.js'
import { conflictPairs, scorePlan } from '../lib/planScore.js'
import { EMPTY_FORM } from '../hooks/useSchedule.js'
import { usePlans } from '../hooks/usePlans.js'
import { WeekGrid } from '../components/WeekGrid.jsx'
import { SessionDetailModal } from '../components/SessionDetailModal.jsx'
import { SessionFormModal } from '../components/SessionFormModal.jsx'
import { PlanCompare } from '../components/PlanCompare.jsx'
import { PlanImport } from '../components/PlanImport.jsx'

// Mô phỏng đăng ký: Lộc nhập các lớp định đăng ký, app vẽ thử lịch cả kỳ,
// báo trùng ngay, chấm điểm và so sánh các phương án A / B / C.
// Chưa có OCR ảnh chụp — đó là bước sau.
export function SimulatorPage({ schedule }) {
  const plans = usePlans()
  const {
    plans: planList, activePlan, activePlanId, setActivePlanId,
    createPlan, renamePlan, duplicatePlan, deletePlan,
    upsertSession, removeSession, importSessions,
  } = plans

  const [mobileDay, setMobileDay] = useState(todayIndex())
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState('')

  const sessions = activePlan?.sessions || []
  const conflicts = useMemo(() => conflictIds(sessions), [sessions])
  const pairs = useMemo(() => conflictPairs(sessions), [sessions])
  const score = useMemo(() => scorePlan(sessions), [sessions])
  const filteredIds = useMemo(() => new Set(sessions.map((s) => s.id)), [sessions])
  const today = todayIndex()
  const daySessions = (d) => sessions.filter((s) => s.day === d).sort((a, b) => a.start - b.start)
  const formConflicts = form ? findConflicts(form, sessions) : []

  function handleApply(plan) {
    const semName = schedule.semester === 'hk2' ? 'HK2' : 'HK1'
    if (!confirm(`Chốt "${plan.name}" làm lịch ${semName}?\nLịch ${semName} hiện tại sẽ bị thay bằng ${plan.sessions.length} buổi trong phương án này.`)) return
    schedule.applyPlan(plan.sessions, plan.name)
    setNotice(`Đã chốt "${plan.name}" làm lịch ${semName}. Qua tab Lịch học để xem.`)
  }

  function handleCreate() {
    const name = prompt('Tên phương án mới:', `Phương án ${String.fromCharCode(65 + planList.length)}`)
    if (name === null) return
    createPlan(name.trim() || undefined)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-5">
      {notice && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">{notice}</div>
      )}

      <h2 className="text-xl font-extrabold">Mô phỏng đăng ký</h2>
      <p className="mt-1 text-sm text-slate-500">
        Nhập các lớp định đăng ký, xem thử lịch cả kỳ trước khi bấm đăng ký thật trên web trường.
        So sánh các phương án rồi chốt phương án đẹp nhất làm lịch chính.
      </p>

      {/* Danh sách phương án */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {planList.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlanId(p.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold ${p.id === activePlanId ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
          >
            {p.name} · {scorePlan(p.sessions).score}đ
          </button>
        ))}
        <button onClick={handleCreate} className="rounded-xl border border-dashed border-slate-400 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
          + Phương án mới
        </button>
      </div>

      {activePlan && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => { const n = prompt('Đổi tên phương án:', activePlan.name); if (n !== null) renamePlan(activePlan.id, n) }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
          >
            ✏️ Đổi tên
          </button>
          <button onClick={() => duplicatePlan(activePlan.id)} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-50">
            📋 Nhân bản
          </button>
          <button
            onClick={() => { if (confirm(`Xóa phương án "${activePlan.name}"?`)) deletePlan(activePlan.id) }}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            🗑️ Xóa phương án
          </button>
          <button
            onClick={() => handleApply(activePlan)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            ✅ Chốt phương án này
          </button>
        </div>
      )}

      {/* Điểm phương án đang xem */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          { label: 'Điểm lịch đẹp', value: `${score.score} / 100` },
          { label: 'Ngày lên trường', value: `${score.days} ngày` },
          { label: 'Tiết buổi tối', value: `${score.eveningPeriods} tiết` },
          { label: 'Tổng tiết / tuần', value: `${score.totalPeriods} tiết` },
          { label: 'Cặp trùng', value: `${score.conflicts} cặp` },
          { label: 'Giờ trống giữa ca', value: `${score.gapPeriods} tiết` },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-extrabold text-indigo-700">{c.value}</div>
            <div className="text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Cách tính điểm: 100 − 20 × cặp trùng − 8 × (ngày lên trường vượt quá 3) − 3 × tiết buổi tối − 1 × tiết trống giữa các ca trong ngày.
      </p>

      {/* Cảnh báo trùng trực tiếp */}
      {pairs.length > 0 && (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4">
          <p className="font-bold text-red-800">⚠️ Phương án này có {pairs.length} cặp trùng tiết:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-red-700">
            {pairs.map((p, i) => (
              <li key={i}>
                {DAY_NAMES[p.a.day]}, tiết {Math.max(p.a.start, p.b.start)}-{Math.min(p.a.end, p.b.end)}: {p.a.subject} ↔ {p.b.subject}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lưới thử — bấm khối môn để xem chi tiết, bấm ô trống để thêm lớp */}
      <WeekGrid
        sessions={sessions} filteredIds={filteredIds} conflicts={conflicts} today={today}
        mobileDay={mobileDay} onMobileDayChange={setMobileDay}
        daySessions={daySessions} onSelect={setDetail}
        onEmptyCell={(day, period) => setForm({ ...EMPTY_FORM, day, start: period, end: period })}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setForm({ ...EMPTY_FORM })} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
          + Thêm lớp dự kiến
        </button>
      </div>

      {/* Nhập hàng loạt vào phương án đang xem */}
      <PlanImport onImport={(list) => importSessions(activePlanId, list)} />

      {/* So sánh tất cả phương án */}
      <h3 className="mt-6 text-lg font-extrabold">So sánh các phương án</h3>
      <PlanCompare
        plans={planList}
        activePlanId={activePlanId}
        onSelectPlan={setActivePlanId}
        onApplyPlan={handleApply}
      />

      <SessionDetailModal
        session={detail}
        isConflict={detail ? conflicts.has(detail.id) : false}
        onClose={() => setDetail(null)}
        onEdit={() => { setForm({ ...detail }); setDetail(null) }}
        onDelete={() => { removeSession(activePlanId, detail.id); setDetail(null) }}
      />
      <SessionFormModal
        form={form}
        onFormChange={setForm}
        formConflicts={formConflicts}
        onClose={() => setForm(null)}
        onSave={(values) => { upsertSession(activePlanId, values); setForm(null) }}
      />
    </main>
  )
}
