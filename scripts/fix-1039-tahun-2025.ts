import { query } from '../src/lib/db';

async function main() {
  // 1. Perbaiki 1039 di arsip_surat_masuk
  await query(
    `UPDATE arsip_surat_masuk 
     SET nomor_surat = ?,
         tanggal_surat = ?,
         asal_instansi = ?,
         perihal = ?
     WHERE nomor_agenda LIKE '%1039%'`,
    [
      '040.XI/PABERSI-KS/2026',
      '2026-08-28',
      'Pengurus Provinsi PABERSI Kalimantan Selatan',
      'Permohonan biaya pelaksanaan Kejurprov Angkat Berat Kalsel Tahun 2026',
    ]
  );
  console.log('✓ 1039 SM diperbaiki ke 2026-08-28');

  // 2. Perbaiki 8750 di arsip_surat_keluar
  await query(
    `UPDATE arsip_surat_keluar
     SET nomor_surat = ?,
         tanggal_surat = ?,
         tujuan_instansi = ?,
         perihal = ?
     WHERE nomor_agenda LIKE '%8750%'`,
    [
      '900/8750/Dispora/2026',
      '2026-09-30',
      'Dinas Kepemudaan dan Olahraga Prov. Kalimantan Selatan',
      'Berita Acara Pemeriksaan Kas',
    ]
  );
  console.log('✓ 8750 SK diperbaiki ke 2026-09-30');

  // 3. Perbaiki 3868 di arsip_surat_keluar
  await query(
    `UPDATE arsip_surat_keluar
     SET nomor_surat = ?,
         tanggal_surat = ?,
         tujuan_instansi = ?,
         perihal = ?
     WHERE nomor_agenda LIKE '%3868%'`,
    [
      '000.5.2/3868/Dispora/2026',
      '2026-05-05',
      'Dinas Perpustakaan dan Kearsipan Prov. Kalsel',
      'Laporan Arsip dan Daftar Isi Arsip Bulan April 2026',
    ]
  );
  console.log('✓ 3868 SK diperbaiki ke 2026-05-05');

  // Cek apakah masih ada dokumen 2025 di database
  const sm2025 = await query<any>("SELECT nomor_agenda, nomor_surat, tanggal_surat FROM arsip_surat_masuk WHERE YEAR(tanggal_surat) = 2025");
  const sk2025 = await query<any>("SELECT nomor_agenda, nomor_surat, tanggal_surat FROM arsip_surat_keluar WHERE YEAR(tanggal_surat) = 2025");
  console.log('Sisa SM 2025:', sm2025.length);
  console.log('Sisa SK 2025:', sk2025.length);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});