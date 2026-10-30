import { getDbPool } from '@/lib/db';

export async function getReportKepatuhan(
  todayDate: string,
  status: string,
  startDate?: string,
  endDate?: string
) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT m.nomor_agenda, m.perihal,
            b.nama_bidang AS bidang_tujuan,
            d.pejabat_pendisposisi, d.batas_waktu, d.status_penyelesaian,
            CASE 
              WHEN d.status_penyelesaian = 'SELESAI' THEN 'Sudah Selesai'
              WHEN d.batas_waktu IS NULL THEN 'Tanpa Batas Waktu'
              WHEN DATEDIFF(d.batas_waktu, ?) < 0 
                   THEN CONCAT('Terlambat ', ABS(DATEDIFF(d.batas_waktu, ?)), ' Hari')
              WHEN DATEDIFF(d.batas_waktu, ?) = 0 THEN 'Jatuh Tempo Hari Ini'
              ELSE CONCAT(DATEDIFF(d.batas_waktu, ?), ' Hari Tersisa')
            END AS status_monitoring
     FROM riwayat_disposisi d
     INNER JOIN arsip_surat_masuk m ON d.surat_masuk_id = m.id
     INNER JOIN bidang_dispora b ON d.kepada_bidang_id = b.id
     WHERE ( ? = 'SEMUA' 
             OR (? = 'BELUM_SELESAI' AND d.status_penyelesaian IN ('PROSES', 'BELUM_DIPROSES'))
             OR d.status_penyelesaian = ? )
       AND ( ? IS NULL OR d.tanggal_disposisi BETWEEN ? AND ? )
     ORDER BY d.batas_waktu ASC, d.id ASC`,
    [
      todayDate, todayDate, todayDate, todayDate,
      status, status, status,
      startDate || null, startDate || null, endDate || null
    ]
  );
  return rows;
}

export async function getReportKlasifikasi(startDate?: string, endDate?: string) {
  const pool = getDbPool();
  const dateStart = startDate || '2020-01-01';
  const dateEnd = endDate || '2030-12-31';

  const [rows] = await pool.query(
    `SELECT k.kode, k.nama_klasifikasi,
            COUNT(s.id) AS total_surat_keluar
     FROM klasifikasi_arsip k
     LEFT JOIN arsip_surat_keluar s ON s.kode_klasifikasi_id = k.id AND s.tanggal_surat BETWEEN ? AND ?
     GROUP BY k.id, k.kode, k.nama_klasifikasi
     ORDER BY total_surat_keluar DESC`,
    [dateStart, dateEnd]
  );
  return rows;
}

export async function getReportAudit(action: string, startDate?: string, endDate?: string) {
  const pool = getDbPool();
  const dateStart = startDate ? `${startDate} 00:00:00` : '2020-01-01 00:00:00';
  const dateEnd = endDate ? `${endDate} 23:59:59` : '2030-12-31 23:59:59';

  const [rows] = await pool.query(
    `SELECT a.id, a.created_at AS waktu_akses,
            COALESCE(u.nama_lengkap, 'System/Tamu') AS nama_pegawai,
            COALESCE(u.role, 'PUBLIC') AS role_pengguna,
            a.action AS tindakan, a.resource AS modul_target,
            a.ip_address, a.user_agent
     FROM audit_logs a
     LEFT JOIN users u ON a.user_id = u.id
     WHERE (? = 'SEMUA' OR a.action = ?)
       AND a.created_at BETWEEN ? AND ?
     ORDER BY a.id DESC`,
    [action, action, dateStart, dateEnd]
  );
  return rows;
}
