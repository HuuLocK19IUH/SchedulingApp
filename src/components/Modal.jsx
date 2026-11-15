export function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="card max-h-[92vh] w-full max-w-lg overflow-y-auto p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
