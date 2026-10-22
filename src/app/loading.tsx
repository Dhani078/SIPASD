export default function Loading() {
  return (
    <div className="loading-skeleton" aria-busy="true" aria-label="Memuat data arsip">
      <div className="skeleton-topbar" />
      <div className="skeleton-body">
        <div className="skeleton-sidebar" />
        <div className="skeleton-main">
          <div className="skeleton-heading" />
          <div className="skeleton-cards">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
          <div className="skeleton-table">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-row" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
