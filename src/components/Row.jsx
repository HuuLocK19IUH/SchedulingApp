export function Row({ label, value }) {
  // Giá trị dài (tên môn, GV, ghi chú) thì cắt gọn + title để rê chuột
  // vẫn đọc được đầy đủ, thay vì tràn modal.
  const text = typeof value === 'string' ? value : ''
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 whitespace-nowrap font-semibold text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 truncate font-medium text-foreground" title={text || undefined}>{value}</dd>
    </div>
  )
}
