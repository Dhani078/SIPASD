'use client';

interface Props {
  currentCount: number;
  totalFiltered: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}

export default function DispositionPagination({
  currentCount, totalFiltered, page, totalPages, pageSize,
  onPageChange, onPageSizeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <span>Menampilkan {currentCount} dari {totalFiltered} riwayat disposisi</span>
        <span className="text-slate-300">|</span>
        <label htmlFor="disp-limit-select" className="sr-only">Baris per halaman</label>
        <select
          id="disp-limit-select"
          aria-label="Baris per halaman"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700"
        >
          <option value={10}>10 baris</option>
          <option value={15}>15 baris</option>
          <option value={25}>25 baris</option>
          <option value={50}>50 baris</option>
        </select>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="px-2 font-medium">Halaman {page} dari {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="px-2.5 py-1 border border-slate-300 rounded bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
