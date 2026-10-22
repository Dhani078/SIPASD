'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-page" role="alert">
      <div className="error-card">
        <div className="error-icon">!</div>
        <h2>Terjadi Kesalahan Sistem</h2>
        <p>
          Koneksi ke TiDB Cloud Serverless atau layanan pendukung mengalami gangguan sementara.
        </p>
        <p className="error-detail mono">
          {error.message || 'Kesalahan internal server'}
        </p>
        <button className="btn primary" onClick={reset}>
          Coba Muat Ulang
        </button>
      </div>
    </div>
  );
}
