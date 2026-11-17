import mysql from 'mysql2/promise';

function getWorkdayIndex(year: number, month: number, day: number): number {
  const start = new Date(Date.UTC(year, 0, 1));
  const target = new Date(Date.UTC(year, month - 1, day));
  
  // If target is Saturday (6), roll forward to Monday (+2 days)
  // If target is Sunday (0), roll forward to Monday (+1 day)
  const targetDow = target.getUTCDay();
  if (targetDow === 6) target.setUTCDate(target.getUTCDate() + 2);
  else if (targetDow === 0) target.setUTCDate(target.getUTCDate() + 1);

  let workdayCount = 0;
  const curr = new Date(start);
  while (curr <= target) {
    const dow = curr.getUTCDay();
    if (dow >= 1 && dow <= 5) {
      workdayCount++;
    }
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return workdayCount;
}

export function format5Digit(num: number, subIndex?: number): string {
  const base = String(num).padStart(5, '0');
  if (subIndex && subIndex > 0) {
    const sub = String(subIndex).padStart(2, '0');
    return `${base}.${sub}`;
  }
  return base;
}

async function runDryRun() {
  const dbUrl = process.env.DATABASE_URL || '';
  const conn = await mysql.createConnection({
    uri: dbUrl.split('?')[0],
    ssl: { rejectUnauthorized: true },
  });

  console.log('====================================================');
  console.log('DRY RUN: SIMULASI ALOKASI KUOTA 50 AGENDA HARIAN (5 DIGIT)');
  console.log('====================================================\n');

  // 1. Surat Masuk
  const [smRows] = await conn.query<any[]>(
    'SELECT id, nomor_agenda, tanggal_diterima, perihal, asal_instansi FROM arsip_surat_masuk ORDER BY tanggal_diterima ASC, CAST(SUBSTRING_INDEX(nomor_agenda, "/", 1) AS UNSIGNED) ASC'
  );

  console.log(`Menganalisis ${smRows.length} Surat Masuk...`);
  const smDayUsage: Record<string, number> = {};
  const smResults: any[] = [];

  for (const row of smRows) {
    const dStr = row.tanggal_diterima instanceof Date ? row.tanggal_diterima.toISOString().slice(0, 10) : String(row.tanggal_diterima).slice(0, 10);
    const [y, m, d] = dStr.split('-').map(Number);
    const year = y || 2026;
    const workday = getWorkdayIndex(year, m, d);

    const slotStart = (workday - 1) * 50 + 1;
    const slotEnd = workday * 50;

    const usedSoFar = smDayUsage[workday] || 0;
    let newNumStr = '';

    if (usedSoFar < 50) {
      const assignedNum = slotStart + usedSoFar;
      newNumStr = `${format5Digit(assignedNum)}/SM/DISPORA/${year}`;
      smDayUsage[workday] = usedSoFar + 1;
    } else {
      const subIdx = usedSoFar - 50 + 1;
      newNumStr = `${format5Digit(slotEnd, subIdx)}/SM/DISPORA/${year}`;
      smDayUsage[workday] = usedSoFar + 1;
    }

    smResults.push({
      id: row.id,
      date: dStr,
      workday,
      oldAgenda: row.nomor_agenda,
      newAgenda: newNumStr,
    });
  }

  // 2. Surat Keluar
  const [skRows] = await conn.query<any[]>(
    'SELECT id, nomor_agenda, tanggal_surat, perihal, tujuan_instansi FROM arsip_surat_keluar ORDER BY tanggal_surat ASC, CAST(SUBSTRING_INDEX(nomor_agenda, "/", 1) AS UNSIGNED) ASC'
  );

  console.log(`Menganalisis ${skRows.length} Surat Keluar...`);
  const skDayUsage: Record<string, number> = {};
  const skResults: any[] = [];

  for (const row of skRows) {
    const dStr = row.tanggal_surat instanceof Date ? row.tanggal_surat.toISOString().slice(0, 10) : String(row.tanggal_surat).slice(0, 10);
    const [y, m, d] = dStr.split('-').map(Number);
    const year = y || 2026;
    const workday = getWorkdayIndex(year, m, d);

    const slotStart = (workday - 1) * 50 + 1;
    const slotEnd = workday * 50;

    const usedSoFar = skDayUsage[workday] || 0;
    let newNumStr = '';

    if (usedSoFar < 50) {
      const assignedNum = slotStart + usedSoFar;
      newNumStr = `${format5Digit(assignedNum)}/SK/DISPORA/${year}`;
      skDayUsage[workday] = usedSoFar + 1;
    } else {
      const subIdx = usedSoFar - 50 + 1;
      newNumStr = `${format5Digit(slotEnd, subIdx)}/SK/DISPORA/${year}`;
      skDayUsage[workday] = usedSoFar + 1;
    }

    skResults.push({
      id: row.id,
      date: dStr,
      workday,
      oldAgenda: row.nomor_agenda,
      newAgenda: newNumStr,
    });
  }

  await conn.end();

  console.log('\n--- CONTOH HASIL SIMULASI SURAT MASUK (10 Pertama) ---');
  console.table(smResults.slice(0, 10).map(r => ({ Tanggal: r.date, HariKe: r.workday, AgendaLama: r.oldAgenda, AgendaBaru5Digit: r.newAgenda })));

  console.log('\n--- CONTOH HASIL SIMULASI SURAT KELUAR (10 Pertama) ---');
  console.table(skResults.slice(0, 10).map(r => ({ Tanggal: r.date, HariKe: r.workday, AgendaLama: r.oldAgenda, AgendaBaru5Digit: r.newAgenda })));

  console.log('\n--- CONTOH HASIL SIMULASI AKHIR TAHUN / OKTOBER ---');
  console.table(smResults.slice(-5).map(r => ({ Tanggal: r.date, HariKe: r.workday, AgendaLama: r.oldAgenda, AgendaBaru5Digit: r.newAgenda })));

  // Check unique agendas
  const uniqueSm = new Set(smResults.map(r => r.newAgenda));
  const uniqueSk = new Set(skResults.map(r => r.newAgenda));
  console.log('\nValidasi Keunikan Nomor:');
  console.log(`- Surat Masuk: Total ${smResults.length}, Unik ${uniqueSm.size} (Duplikat: ${smResults.length - uniqueSm.size})`);
  console.log(`- Surat Keluar: Total ${skResults.length}, Unik ${uniqueSk.size} (Duplikat: ${skResults.length - uniqueSk.size})`);
}

runDryRun();
