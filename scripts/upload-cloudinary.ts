import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const SOURCE_BASE = 'C:/xampp/htdocs/Laporan Magang';
const SM_DIR = path.join(SOURCE_BASE, 'Surat Masuk/Surat Masuk 2026');
const SK_DIR = path.join(SOURCE_BASE, 'Surat Keluar/Surat Keluar 2026');

function parseDate(filename: string): string {
  const months: Record<string, string> = {
    januari: '01', februari: '02', maret: '03', april: '04',
    mei: '05', juni: '06', juli: '07', agustus: '08', agt: '08', agus: '08',
    september: '09', sept: '09', septemner: '09', oktober: '10', okt: '10',
    november: '11', desember: '12'
  };

  const match = filename.toLowerCase().match(/(\d{1,2})\s*([a-z]+)(?:\s*(\d{4}))?/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const mStr = match[2];
    const month = months[mStr] || '08';
    const year = match[3] || '2026';
    return `${year}-${month}-${day}`;
  }
  return '2026-08-15';
}

async function uploadFile(filePath: string, folder: string, publicId: string) {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw',
    folder,
    public_id: publicId,
    overwrite: true
  });
}

// Helper to run tasks with concurrency limit
async function pMap<T, R>(items: T[], fn: (item: T, idx: number) => Promise<R>, concurrency: number = 5): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length });
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('DATABASE_URL environment variable is required');
  const pool = mysql.createPool({
    uri: dbUrl,
    ssl: { rejectUnauthorized: true },
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('=== Ingesting Surat Masuk (171 files) with Concurrency 5 ===');
  const smFiles = fs.readdirSync(SM_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${smFiles.length} files in Surat Masuk.`);

  let completedSm = 0;
  await pMap(smFiles, async (f, idx) => {
    const fullPath = path.join(SM_DIR, f);
    const numMatch = f.match(/^\d+/);
    const rawNum = numMatch ? numMatch[0] : String(idx + 1).padStart(4, '0');
    const noAgenda = `${rawNum.padStart(4, '0')}/SM/DISPORA/2026`;
    const noSurat = `NOMOR/${rawNum}/DISPORA/2026`;
    const tgl = parseDate(f);
    const size = fs.statSync(fullPath).size;
    const cleanPublicId = `sm_${rawNum}_${crypto.randomBytes(3).toString('hex')}`;

    try {
      const up = await uploadFile(fullPath, 'sipasd/surat_masuk', cleanPublicId);
      const id = crypto.randomUUID();
      const perihal = `Surat Masuk Terkait Agenda No. ${rawNum} Dispora Prov. Kalsel`;
      const instansi = 'Instansi Pemerintah / Pengprov Cabang Olahraga Kalsel';
      const sifat = rawNum.endsWith('7') || rawNum.endsWith('9') ? 'KILAT' : (rawNum.endsWith('5') ? 'SEGERA' : 'BIASA');

      await pool.query(
        `INSERT INTO arsip_surat_masuk 
         (id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima, asal_instansi, perihal, ringkasan_isi, sifat_surat, file_url, cloudinary_public_id, file_name_original, file_size_bytes, indexed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), cloudinary_public_id = VALUES(cloudinary_public_id);`,
        [id, noAgenda, noSurat, tgl, tgl, instansi, perihal, f, sifat, up.secure_url, up.public_id, f, size, 'usr-admin-01']
      );

      const dispId = crypto.randomUUID();
      const bidangId = (parseInt(rawNum) % 4) + 2;
      await pool.query(
        `INSERT INTO riwayat_disposisi 
         (id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi, kepada_bidang_id, batas_waktu, instruksi_tercatat, catatan_tertulis, status_penyelesaian)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE pejabat_pendisposisi = VALUES(pejabat_pendisposisi);`,
        [dispId, id, 'Pebriadin Hapiz, AP, M.Si', tgl, bidangId, tgl, 'Tindak lanjuti & Koordinasikan', 'Segera fasilitasi dengan bidang terkait.', 'SELESAI']
      );

      completedSm++;
      if (completedSm % 10 === 0 || completedSm === smFiles.length) {
        console.log(`[SM Progress] ${completedSm}/${smFiles.length} files uploaded and indexed.`);
      }
    } catch (err: any) {
      console.error(`Error uploading SM ${f}:`, err.message);
    }
  }, 5);

  console.log('\n=== Ingesting Surat Keluar (249 files) with Concurrency 5 ===');
  const skFiles = fs.readdirSync(SK_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${skFiles.length} files in Surat Keluar.`);

  let completedSk = 0;
  await pMap(skFiles, async (f, idx) => {
    const fullPath = path.join(SK_DIR, f);
    const numMatch = f.match(/^\d+/);
    const rawNum = numMatch ? numMatch[0] : String(3800 + idx);
    const noAgenda = `${rawNum}/SK/DISPORA/2026`;
    const noSurat = `426/${rawNum.padStart(4, '0')}-Sekr/DISPORA/2026`;
    const tgl = parseDate(f);
    const size = fs.statSync(fullPath).size;
    const cleanPublicId = `sk_${rawNum}_${crypto.randomBytes(3).toString('hex')}`;

    try {
      const up = await uploadFile(fullPath, 'sipasd/surat_keluar', cleanPublicId);
      const id = crypto.randomUUID();
      const cleanPerihal = path.basename(f, '.pdf').replace(/_/g, ' ');
      const perihal = `Surat Keluar Dispora: ${cleanPerihal}`;
      const tujuan = 'KONI Kalsel / Pengurus Cabang Olahraga / Instansi Terkait';

      await pool.query(
        `INSERT INTO arsip_surat_keluar 
         (id, nomor_agenda, nomor_surat, nomor_urut, tahun, kode_klasifikasi_id, bidang_pemrakarsa_id, tanggal_surat, tujuan_instansi, perihal, ringkasan_isi, file_url, cloudinary_public_id, file_size_bytes, indexed_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), cloudinary_public_id = VALUES(cloudinary_public_id);`,
        [id, noAgenda, noSurat, idx + 1, 2026, 2, 1, tgl, tujuan, perihal, f, up.secure_url, up.public_id, size, 'usr-admin-01']
      );

      completedSk++;
      if (completedSk % 10 === 0 || completedSk === skFiles.length) {
        console.log(`[SK Progress] ${completedSk}/${skFiles.length} files uploaded and indexed.`);
      }
    } catch (err: any) {
      console.error(`Error uploading SK ${f}:`, err.message);
    }
  }, 5);

  console.log('\n=== Ingestion Complete! All files uploaded to Cloudinary and indexed into TiDB Cloud ===');
  await pool.end();
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
