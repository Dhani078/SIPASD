import { v2 as cloudinary } from 'cloudinary';
import { query } from '../src/lib/db';
import { uploadToGoogleDrive } from '../src/lib/gdrive';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface PendingRow {
  id: string;
  nomor_agenda: string;
  tanggal_surat: string;
  file_url: string;
  file_name_original: string | null;
}

async function fetchCloudinaryPdf(fileUrl: string): Promise<Buffer> {
  const m = fileUrl.match(/sipasd\/(surat_masuk|surat_keluar|disposisi|test)\/[^?#]+/);
  if (m) {
    const cleanPublicId = m[0].replace(/\.pdf$/i, '') + '.pdf';
    const signedUrl = cloudinary.utils.private_download_url(cleanPublicId, 'pdf', {
      resource_type: 'raw',
      type: 'upload',
    });
    const res = await fetch(signedUrl);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  const fallback = await fetch(fileUrl);
  if (!fallback.ok) throw new Error(`HTTP ${fallback.status} downloading ${fileUrl}`);
  return Buffer.from(await fallback.arrayBuffer());
}

async function processTable(table: 'arsip_surat_masuk' | 'arsip_surat_keluar', folderType: 'masuk' | 'keluar') {
  const rows = await query<PendingRow>(
    `SELECT id, nomor_agenda, DATE_FORMAT(tanggal_surat, '%Y-%m-%d') AS tanggal_surat, file_url, file_name_original
     FROM ${table}
     WHERE drive_url LIKE '%/folders/%' AND file_url IS NOT NULL AND file_url <> ''`
  );
  console.log(`[Backfill] ${table}: ${rows.length} berkas perlu diunggah ke Google Drive.`);
  let ok = 0;
  for (const row of rows) {
    const fileName = row.file_name_original || `${row.nomor_agenda.replace(/\//g, '_')}.pdf`;
    const year = String(row.tanggal_surat || '2026').slice(0, 4);
    try {
      const buf = await fetchCloudinaryPdf(row.file_url);
      if (buf.subarray(0, 5).toString('ascii') !== '%PDF-') {
        console.warn(`  [SKIP] ${row.nomor_agenda}: bukan PDF valid`);
        continue;
      }
      const driveUrl = await uploadToGoogleDrive(buf, fileName, folderType, year);
      if (!driveUrl) {
        console.error(`  [FAIL] ${row.nomor_agenda}: uploadToGoogleDrive gagal`);
        continue;
      }
      await query(`UPDATE ${table} SET drive_url = ? WHERE id = ?`, [driveUrl, row.id]);
      ok++;
      console.log(`  [OK] ${row.nomor_agenda} (${fileName}) -> ${driveUrl}`);
    } catch (err: unknown) {
      console.error(`  [ERR] ${row.nomor_agenda}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`[Backfill] ${table}: selesai ${ok}/${rows.length}.\n`);
}

async function main() {
  await processTable('arsip_surat_masuk', 'masuk');
  await processTable('arsip_surat_keluar', 'keluar');
  process.exit(0);
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
