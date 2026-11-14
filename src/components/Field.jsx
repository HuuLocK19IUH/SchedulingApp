export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </label>
  )
}
