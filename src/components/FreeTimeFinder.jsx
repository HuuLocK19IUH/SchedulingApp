import { useMemo, useState } from 'react'
import { DAY_NAMES, timeRange } from '../lib/time.js'
import { findFreeSlots, freeSlotsByDay } from '../lib/freeTime.js'
import { parseQuickPaste } from '../lib/importers.js'

const FRIENDS_KEY = 'schedulingapp-friends-v1'

function loadFriends() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function saveFriends(list) {
  try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(list)) } catch { /* bỏ qua */ }
}

// Tìm giờ trống chung để họp nhóm / học nhóm.
// Bạn bè được thêm bằng tên + lịch bận của họ (dán nhanh cùng định dạng
// "Tên môn | Thứ | Tiết | Phòng | GV"). Lưu ở localStorage máy này.
// Chia sẻ bằng cách bạn xuất lịch của họ (CSV/JSON/.ics) rồi Lộc nhập vào
// — chưa có lịch chung trực tuyến, vì app không có backend.
export function FreeTimeFinder({ mySessions, times }) {
  const [friends, setFriends] = useState(loadFriends)
  const [name, setName] = useState('')
  const [paste, setPaste] = useState('')
  const [message, setMessage] = useState('')

  const friendsSessions = useMemo(
    () => friends.flatMap((f) => f.sessions.map((s) => ({ ...s, friend: f.name }))),
    [friends],
  )
  const topSlots = useMemo(
    () => findFreeSlots(mySessions, friendsSessions, { minPeriods: 2 }),
    [mySessions, friendsSessions],
  )
  const byDay = useMemo(
    () => freeSlotsByDay(mySessions, friendsSessions),
    [mySessions, friendsSessions],
  )

  function addFriend() {
    const n = name.trim()
    if (!n) { setMessage('Nhập tên bạn trước đã.'); return }
    const { sessions, failed } = parseQuickPaste(paste)
    if (!sessions.length) {
      setMessage(failed.length ? `Không nhập được dòng nào: ${failed[0].reason}` : 'Dán lịch bận của bạn vào khung bên dưới trước đã.')
      return
    }
    const next = [...friends, { id: `f-${Date.now()}`, name: n, sessions }]
    setFriends(next)
    saveFriends(next)
    setMessage(`Đã thêm ${n}: ${sessions.length} buổi bận${failed.length ? `, ${failed.length} dòng lỗi` : ''}.`)
    setName('')
    setPaste('')
  }

  function removeFriend(id) {
    const next = friends.filter((f) => f.id !== id)
    setFriends(next)
    saveFriends(next)
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-extrabold">Tìm giờ trống chung</h2>
      <p className="mt-1 text-sm text-slate-500">
        Thêm lịch bận của bạn bè, app tìm khung giờ cả nhóm cùng rảnh để họp nhóm / học nhóm.
        Chia sẻ bằng cách bạn xuất lịch (CSV/JSON/.ics) rồi Lộc nhập vào — chưa có lịch chung trực tuyến vì app không có backend.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {friends.map((f) => (
          <span key={f.id} className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-800">
            {f.name} · {f.sessions.length} buổi bận
            <button onClick={() => removeFriend(f.id)} aria-label={`Xóa ${f.name}`} className="font-bold text-indigo-400 hover:text-red-600">×</button>
          </span>
        ))}
        {friends.length === 0 && <span className="text-sm text-slate-400">Chưa có bạn nào — thêm bạn đầu tiên bên dưới.</span>}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_2fr]">
        <input
          value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên bạn (VD: Khánh)"
          className="input"
        />
        <textarea
          value={paste} onChange={(e) => setPaste(e.target.value)}
          placeholder={'Dán lịch bận của bạn, mỗi buổi một dòng:\nTên môn | Thứ | Tiết bắt đầu-Tiết kết thúc | Phòng | GV'}
          rows={3} className="input"
        />
      </div>
      <button onClick={addFriend} className="mt-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">+ Thêm bạn</button>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}

      <h3 className="mt-5 font-bold">Khung giờ trống dài nhất (≥ 2 tiết)</h3>
      {topSlots.length === 0 ? (
        <p className="mt-1 text-sm text-slate-500">Không còn khung trống ≥ 2 tiết trong tuần — thử giảm buổi bận hoặc họp vào khung 1 tiết bên dưới.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {topSlots.slice(0, 5).map((s, i) => (
            <li key={i} className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              {DAY_NAMES[s.day]} · Tiết {s.start}-{s.end} ({timeRange(s.start, s.end, times)}) — trống {s.periods} tiết, cả nhóm rảnh
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-5 font-bold">Giờ trống theo ngày</h3>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        {DAY_NAMES.map((d, day) => (
          <div key={d} className="rounded-xl border border-slate-100 p-3">
            <p className="text-sm font-bold">{d}</p>
            {byDay[day].length === 0 ? (
              <p className="text-xs text-slate-400">Kín cả ngày.</p>
            ) : (
              <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                {byDay[day].map((s, i) => (
                  <li key={i}>Tiết {s.start}-{s.end} ({timeRange(s.start, s.end, times)}) — trống {s.periods} tiết</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
