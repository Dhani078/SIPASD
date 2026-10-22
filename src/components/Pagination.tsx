interface Props {
  current: number;
  total: number;
  totalItems: number;
  onPage: (page: number) => void;
}

export default function Pagination({ current, total, totalItems, onPage }: Props) {
  return (
    <div className="pagination">
      <span>
        Menampilkan {totalItems ? (current - 1) * 15 + 1 : 0} - {Math.min(current * 15, totalItems)} dari {totalItems} arsip
      </span>
      <div className="page-btns">
        <button
          disabled={current <= 1}
          onClick={() => onPage(current - 1)}
          aria-label="Halaman sebelumnya"
        >
          Sebelumnya
        </button>
        <span className="mono">
          {current} / {total}
        </span>
        <button
          disabled={current >= total}
          onClick={() => onPage(current + 1)}
          aria-label="Halaman berikutnya"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
