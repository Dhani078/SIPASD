import { getDbPool } from '@/lib/db';

export async function getReportMasuk(startDate?: string, endDate?: string) {
  const pool = getDbPool();
  const dateStart = startDate || '2020-01-01';
  const dateEnd = endDate || '2030-12-31';

  const [rows] = await pool.query(
    `SELECT nomor_agenda, tanggal_diterima, nomor_surat, tanggal_surat, asal_instansi, perihal, sifat_surat
     FROM arsip_surat_masuk
     WHERE tanggal_diterima BETWEEN ? AND ?
     ORDER BY tanggal_diterima ASC, id ASC`,
    [dateStart, dateEnd]
  );

  const [summary] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(sifat_surat = 'BIASA'), 0) AS biasa,
            COALESCE(SUM(sifat_surat = 'PENTING'), 0) AS penting,
            COALESCE(SUM(sifat_surat = 'KILAT'), 0) AS kilat
     FROM arsip_surat_masuk
     WHERE tanggal_diterima BETWEEN ? AND ?`,
    [dateStart, dateEnd]
  );

  return { rows, summary: (summary as unknown[])[0] };
}

export async function getReportKeluar(startDate?: string, endDate?: string) {
  const pool = getDbPool();
  const dateStart = startDate || '2020-01-01';
  const dateEnd = endDate || '2030-12-31';

  const [rows] = await pool.query(
    `SELECT s.nomor_agenda, s.nomor_surat, s.tanggal_surat,
            k.kode AS kode_klasifikasi, k.nama_klasifikasi,
            b.nama_bidang AS bidang_pemrakarsa,
            s.tujuan_instansi, s.perihal
     FROM arsip_surat_keluar s
     LEFT JOIN klasifikasi_arsip k ON s.kode_klasifikasi_id = k.id
     LEFT JOIN bidang_dispora b ON s.bidang_pemrakarsa_id = b.id
     WHERE s.tanggal_surat BETWEEN ? AND ?
     ORDER BY s.tanggal_surat ASC, s.id ASC`,
    [dateStart, dateEnd]
  );

  const [summary] = await pool.query(
    `SELECT b.nama_bidang, COUNT(s.id) AS total
     FROM bidang_dispora b
     LEFT JOIN arsip_surat_keluar s ON b.id = s.bidang_pemrakarsa_id AND s.tanggal_surat BETWEEN ? AND ?
     GROUP BY b.id, b.nama_bidang`,
    [dateStart, dateEnd]
  );

  return { rows, summary };
}

export async function getReportDisposisi(startDate?: string, endDate?: string) {
  const pool = getDbPool();
  const dateStart = startDate || '2020-01-01';
  const dateEnd = endDate || '2030-12-31';

  const [rows] = await pool.query(
    `SELECT b.nama_bidang,
            COUNT(d.id) AS jumlah_surat,
            COALESCE((
              SELECT d2.instruksi_tercatat
              FROM riwayat_disposisi d2
              WHERE d2.kepada_bidang_id = b.id
                AND d2.tanggal_disposisi BETWEEN ? AND ?
              GROUP BY d2.instruksi_tercatat
              ORDER BY COUNT(*) DESC, d2.instruksi_tercatat ASC
              LIMIT 1
            ), '-') AS instruksi_terbanyak,
            COALESCE(SUM(d.status_penyelesaian = 'SELESAI'), 0) AS selesai,
            COALESCE(SUM(d.status_penyelesaian = 'PROSES'), 0)  AS proses,
            COALESCE(SUM(d.status_penyelesaian = 'BELUM_DIPROSES'), 0) AS belum_diproses
     FROM bidang_dispora b
     LEFT JOIN riwayat_disposisi d ON d.kepada_bidang_id = b.id AND d.tanggal_disposisi BETWEEN ? AND ?
     GROUP BY b.id, b.nama_bidang
     ORDER BY jumlah_surat DESC`,
    [dateStart, dateEnd, dateStart, dateEnd]
  );

  return rows;
}
