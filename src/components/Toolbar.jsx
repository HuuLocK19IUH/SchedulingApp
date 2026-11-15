import { TYPES } from '../lib/time.js'
import { IconPlus } from '../lib/ui-icons.jsx'

// Thanh công cụ dưới widget Hôm nay: lọc theo loại + thêm buổi / nhập nhanh.
// Ô tìm kiếm đã chuyển lên header (kiểu command-palette, phím "/").
// Chip lọc cuộn ngang một hàng (không tràn, không đẩy nút hành động);
// hai nút hành động nằm hàng riêng, không bao giờ bị chèn ép.
export function Toolbar({ filterType, onFilterChange, onAdd, pasteOpen, onTogglePaste }) {
  return (
    <div className="mt-5 space-y-2">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['Tất cả', ...TYPES].map((t) => (
          <button key={t} onClick={() => onFilterChange(t)}
            className={`shrink-0 whitespace-nowrap transition-soft rounded-full px-3 py-1.5 text-sm font-semibold ${filterType === t ? 'bg-primary text-white shadow-card' : 'btn-ghost'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={onAdd} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
          <IconPlus className="h-4 w-4" />
          Thêm buổi
        </button>
        <button onClick={onTogglePaste} className="btn-ghost px-4 py-2 text-sm">
          {pasteOpen ? 'Ẩn nhập nhanh' : 'Nhập nhanh (dán)'}
        </button>
      </div>
    </div>
  )
}
