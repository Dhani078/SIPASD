import mysql from 'mysql2/promise';
import { getWorkdayIndex, format5Digit } from '../src/lib/workday-slot';

async function migrate() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.error('DATABASE_URL is not set!');
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    uri: dbUrl.split('?')[0],
    ssl: { rejectUnauthorized: true },
  });

  console.log('====================================================');
  console.log('MIGRASI NOMOR AGENDA BLOK 50 (5 DIGIT) DISPORA 2026');
  console.log('====================================================\n');

  try {
    await conn.beginTransaction();

    // 1. Migrasi Surat Masuk
    console.log('[1/2] Memproses Migrasi 170 Arsip Surat Masuk...');
    const [smRows] = await conn.query<any[]>(
      'SELECT id, nomor_agenda, tanggal_diterima FROM arsip_surat_masuk ORDER BY tanggal_diterima ASC, CAST(SUBSTRING_INDEX(nomor_agenda, "/", 1) AS UNSIGNED) ASC FOR UPDATE'
    );

    const smWorkdayUsage: Record<number, number> = {};
    const smNewAgendas = new Set<string>();

    for (const r of smRows) {
      const dStr = r.tanggal_diterima instanceof Date ? r.tanggal_diterima.toISOString().slice(0, 10) : String(r.tanggal_diterima).slice(0, 10);
      const [y, m, d] = dStr.split('-').map(Number);
      const year = y || 2026;
      const workday = getWorkdayIndex(year, m, d);

      const slotStart = (workday - 1) * 50 + 1;
      const slotEnd = workday * 50;
      const used = smWorkdayUsage[workday] || 0;

      let newAgenda = '';
      if (used < 50) {
        newAgenda = `${format5Digit(slotStart + used)}/SM/DISPORA/${year}`;
      } else {
        const sub = used - 50 + 1;
        newAgenda = `${format5Digit(slotEnd, sub)}/SM/DISPORA/${year}`;
      }
      smWorkdayUsage[workday] = used + 1;
      smNewAgendas.add(newAgenda);

      await conn.query('UPDATE arsip_surat_masuk SET nomor_agenda = ? WHERE id = ?', [newAgenda, r.id]);
    }
    console.log(`  ✓ Berhasil memperbarui ${smRows.length} Surat Masuk. Keunikan nomor: ${smNewAgendas.size}/${smRows.length} unik.`);

    // 2. Migrasi Surat Keluar
    console.log('\n[2/2] Memproses Migrasi 253 Arsip Surat Keluar...');
    const [skRows] = await conn.query<any[]>(
      'SELECT id, nomor_agenda, tanggal_surat FROM arsip_surat_keluar ORDER BY tanggal_surat ASC, CAST(SUBSTRING_INDEX(nomor_agenda, "/", 1) AS UNSIGNED) ASC FOR UPDATE'
    );

    const skWorkdayUsage: Record<number, number> = {};
    const skNewAgendas = new Set<string>();

    for (const r of skRows) {
      const dStr = r.tanggal_surat instanceof Date ? r.tanggal_surat.toISOString().slice(0, 10) : String(r.tanggal_surat).slice(0, 10);
      const [y, m, d] = dStr.split('-').map(Number);
      const year = y || 2026;
      const workday = getWorkdayIndex(year, m, d);

      const slotStart = (workday - 1) * 50 + 1;
      const slotEnd = workday * 50;
      const used = skWorkdayUsage[workday] || 0;

      let newAgenda = '';
      if (used < 50) {
        newAgenda = `${format5Digit(slotStart + used)}/SK/DISPORA/${year}`;
      } else {
        const sub = used - 50 + 1;
        newAgenda = `${format5Digit(slotEnd, sub)}/SK/DISPORA/${year}`;
      }
      skWorkdayUsage[workday] = used + 1;
      skNewAgendas.add(newAgenda);

      await conn.query('UPDATE arsip_surat_keluar SET nomor_agenda = ? WHERE id = ?', [newAgenda, r.id]);
    }
    console.log(`  ✓ Berhasil memperbarui ${skRows.length} Surat Keluar. Keunikan nomor: ${skNewAgendas.size}/${skRows.length} unik.`);

    await conn.commit();
    console.log('\n====================================================');
    console.log('MIGRASI SELESAI 100% SUKSES DAN TERKOMIT KE TIDB CLOUD');
    console.log('====================================================\n');
  } catch (err) {
    await conn.rollback();
    console.error('Migrasi Gagal, Transaksi di-rollback:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrate();
