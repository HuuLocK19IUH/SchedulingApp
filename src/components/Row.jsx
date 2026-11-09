export function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 font-semibold text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 font-medium">{value}</dd>
    </div>
  )
}
