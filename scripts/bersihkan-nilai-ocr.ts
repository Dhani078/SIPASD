import { query } from '../src/lib/db';
import fs from 'node:fs';
import path from 'node:path';

const TMP = path.join(process.env.LOCALAPPDATA || '.', 'Temp');
const APPLY = process.argv.includes('--apply');

const SIFAT = '(Biasa|Penting|Segera|Sangat Segera|Kilat|Sangat Rahasia|Rahasia)';

const NORMALISASI: [RegExp, string][] = [
  [/bappeda|badan perencanaan pembangunan/i, 'Bappeda Prov. Kalimantan Selatan'],
  [/inspektur|inspektorat|irbanwil/i, 'Inspektorat Daerah Prov. Kalimantan Selatan'],
  [/bank kalsel|bpd kalsel/i, 'Bank Kalsel'],
  [/bank indonesia/i, 'Bank Indonesia Perwakilan Kalsel'],
  [/kanwil|kantor wilayah kementerian agama/i, 'Kantor Wilayah Kementerian Agama Prov. Kalsel'],
  [/perpustakaan dan kearsipan/i, 'Dinas Perpustakaan dan Kearsipan Prov. Kalsel'],
  [/badan pendapatan daerah/i, 'Badan Pendapatan Daerah Prov. Kalimantan Selatan'],
];

function bersihkanPerihal(v: string): string {
  const m = v.match(new RegExp(`^\\s*[0-9][0-9A-Za-z\\.\\/\\s-]{2,40}?\\s*${SIFAT}\\s+(.{6,})$`, 'i'));
  if (m) return m[2].replace(/\s+/g, ' ').trim();
  return v;
}

function nilaiTujuanTidakSah(v: string): boolean {
  if (v === '-') return false;
  if (/\d{6,}/.test(v)) return true;                                    // derau NIP
  if (/\bNIP\b|\bNama\b|:/i.test(v)) return true;                        // blok data pegawai, bukan instansi
  if (/atasan langsung|yang ditentukan|dari tanggal nomor|surat perintah|dasar\b|untuk \d|email|tembusan/i.test(v)) return true;
  if (/KONI Kalsel \/ Instansi Terkait|^Instansi\b|^Tujuan\b/i.test(v)) return true;
  if (v.length > 150) return true;
  if (!v.includes(' ') && v.length > 24) return true;
  if (/^[A-Z][a-z]+$/.test(v) && v.length < 8) return true;
  return false;
}

function normalisasiTujuan(v: string): string {
  for (const [re, canon] of NORMALISASI) if (re.test(v)) return canon;
  return v.replace(/\s+/g, ' ').trim();
}

async function main() {
  const sm = await query<any>('SELECT id, nomor_agenda, perihal FROM arsip_surat_masuk');
  const sk = await query<any>('SELECT id, nomor_agenda, perihal, tujuan_instansi FROM arsip_surat_keluar');

  const aksi: any[] = [];
  for (const r of sm) {
    const baru = bersihkanPerihal(r.perihal);
    if (baru !== r.perihal) aksi.push({ tabel: 'arsip_surat_masuk', id: r.id, agenda: r.nomor_agenda, kolom: 'perihal', lama: r.perihal, baru });
  }
  for (const r of sk) {
    const perihalBaru = bersihkanPerihal(r.perihal);
    if (perihalBaru !== r.perihal) aksi.push({ tabel: 'arsip_surat_keluar', id: r.id, agenda: r.nomor_agenda, kolom: 'perihal', lama: r.perihal, baru: perihalBaru });
    if (nilaiTujuanTidakSah(r.tujuan_instansi)) {
      aksi.push({ tabel: 'arsip_surat_keluar', id: r.id, agenda: r.nomor_agenda, kolom: 'tujuan_instansi', lama: r.tujuan_instansi, baru: '-' });
    } else {
      const tunaNorm = normalisasiTujuan(r.tujuan_instansi);
      if (tunaNorm !== r.tujuan_instansi) aksi.push({ tabel: 'arsip_surat_keluar', id: r.id, agenda: r.nomor_agenda, kolom: 'tujuan_instansi', lama: r.tujuan_instansi, baru: tunaNorm });
    }
  }

  console.log('AKSI_PERBAIKAN:', aksi.length);
  for (const a of aksi.slice(0, 20)) {
    console.log(`  [${a.tabel.replace('arsip_surat_', '')}] ${a.agenda.padEnd(20)} ${a.kolom.padEnd(15)} '${String(a.lama).slice(0, 40)}' -> '${String(a.baru).slice(0, 40)}'`);
  }

  fs.writeFileSync(path.join(TMP, 'bersih_plan.json'), JSON.stringify(aksi, null, 1), 'utf-8');
  if (!APPLY) { console.log('DRY-RUN. Tambahkan --apply untuk menulis.'); return; }

  const backup = path.join(TMP, `bersih_backup_${Date.now()}.json`);
  fs.writeFileSync(backup, JSON.stringify(aksi, null, 1), 'utf-8');
  console.log('BACKUP:', backup);

  let n = 0;
  for (const a of aksi) {
    await query(`UPDATE ${a.tabel} SET ${a.kolom} = ? WHERE id = ?`, [a.baru, a.id]);
    n++;
  }
  console.log('UPDATED_ROWS:', n);

  const cek = await query<any>("SELECT SUM(perihal <> '-') AS sm_perihal, SUM(nomor_surat <> '-') AS sm_nomor, SUM(asal_instansi <> '-') AS sm_asal FROM arsip_surat_masuk");
  const cekSk = await query<any>("SELECT SUM(perihal <> '-') AS sk_perihal, SUM(tujuan_instansi <> '-') AS sk_tujuan FROM arsip_surat_keluar");
  console.log('VERIFIKASI_SM:', JSON.stringify(cek[0]), 'SK:', JSON.stringify(cekSk[0]));
}
main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });