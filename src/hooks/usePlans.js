import { useEffect, useState } from 'react'
import { SEED } from '../data/seed.js'

export const PLANS_STORAGE_KEY = 'schedulingapp-plans-v1'

// Phương án mẫu duy nhất, lấy đúng từ seed HK2 của Lộc — không bịa thêm.
// QLDA T6 tiết 1-6, CNMOI T3 tiết 4-6 + T4 tiết 10-12,
// AUTOMAT T5 tiết 4-6, KTTKPM T7 tiết 7-9 + T6 tiết 13-15.
function seedPlans() {
  return [
    {
      id: 'plan-hk2',
      name: 'HK2 – bản nháp',
      sessions: SEED.hk2.map((s, i) => ({ ...s, id: `plan-hk2-${i + 1}` })),
    },
    { id: 'plan-b', name: 'Phương án B — trống', sessions: [] },
  ]
}

function loadPlans() {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY)
    if (!raw) return seedPlans()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.length) return seedPlans()
    return parsed.filter((p) => p && p.id && typeof p.name === 'string' && Array.isArray(p.sessions))
  } catch { /* dữ liệu hỏng -> dùng seed */ }
  return seedPlans()
}

/**
 * Các phương án mô phỏng đăng ký: tạo / đổi tên / nhân bản / xóa phương án,
 * thêm / sửa / xóa buổi trong một phương án. Dữ liệu lưu localStorage riêng
 * (schedulingapp-plans-v1), không động vào lịch chính (xep-lich-hoc-v1)
 * cho tới khi Lộc bấm "Chốt phương án".
 */
export function usePlans() {
  const [plans, setPlans] = useState(loadPlans)
  const [activePlanId, setActivePlanId] = useState(() => loadPlans()[0]?.id)

  useEffect(() => {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans))
  }, [plans])

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0]

  function updatePlan(id, fn) {
    setPlans((prev) => prev.map((p) => (p.id === id ? fn(p) : p)))
  }

  function createPlan(name) {
    const id = `plan-${Date.now()}`
    const plan = { id, name: name?.trim() || `Phương án ${plans.length + 1}`, sessions: [] }
    setPlans((prev) => [...prev, plan])
    setActivePlanId(id)
    return id
  }

  function renamePlan(id, name) {
    if (!name.trim()) return
    updatePlan(id, (p) => ({ ...p, name: name.trim() }))
  }

  function duplicatePlan(id) {
    const src = plans.find((p) => p.id === id)
    if (!src) return
    const copy = {
      id: `plan-${Date.now()}`,
      name: `${src.name} (bản sao)`,
      sessions: src.sessions.map((s, i) => ({ ...s, id: `plan-${Date.now()}-${i}` })),
    }
    setPlans((prev) => [...prev, copy])
    setActivePlanId(copy.id)
  }

  function deletePlan(id) {
    setPlans((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((p) => p.id !== id)
      if (id === activePlanId) setActivePlanId(next[0].id)
      return next
    })
  }

  function addSession(planId, values) {
    const session = { ...values, id: `plan-s-${Date.now()}` }
    updatePlan(planId, (p) => ({ ...p, sessions: [...p.sessions, session] }))
    return session
  }

  function updateSession(planId, values) {
    updatePlan(planId, (p) => ({
      ...p,
      sessions: p.sessions.map((s) => (s.id === values.id ? values : s)),
    }))
  }

  function upsertSession(planId, values) {
    if (values.id) updateSession(planId, values)
    else addSession(planId, values)
  }

  function removeSession(planId, sessionId) {
    updatePlan(planId, (p) => ({ ...p, sessions: p.sessions.filter((s) => s.id !== sessionId) }))
  }

  function importSessions(planId, sessions) {
    if (!sessions.length) return 0
    updatePlan(planId, (p) => ({ ...p, sessions: [...p.sessions, ...sessions] }))
    return sessions.length
  }

  return {
    plans, activePlan, activePlanId, setActivePlanId,
    createPlan, renamePlan, duplicatePlan, deletePlan,
    addSession, updateSession, upsertSession, removeSession, importSessions,
  }
}
