import { query } from '../src/lib/db';
import fs from 'node:fs';
import path from 'node:path';

const TMP = path.join(process.env.LOCALAPPDATA || '.', 'Temp');
const APPLY = process.argv.includes('--apply');
const TAG = (process.argv.find((a) => a === 'sk' || a === 'sm') || 'sm') as 'sm' | 'sk';

type MetaRow = {
  file: string; nomor_surat: string | null; tanggal_surat: string | null;
  perihal: string | null; asal_instansi: string | null; tujuan_instansi?: string | null;
};

async function main() {
  const meta: MetaRow[] = JSON.parse(fs.readFileSync(path.join(TMP, `sipasd_meta_${TAG}.json`), 'utf-8'));
  const isSm = TAG === 'sm';
  const db = await query<any>(
    isSm
      ? 'SELECT id, nomor_agenda, nomor_surat, tanggal_surat, asal_instansi, perihal FROM arsip_surat_masuk ORDER BY nomor_agenda'
      : 'SELECT id, nomor_agenda, nomor_surat, tanggal_surat, tujuan_instansi, perihal FROM arsip_surat_keluar ORDER BY nomor_agenda'
  );

  const byNum = new Map<string, MetaRow>();
  for (const m of meta) {
    const n = (m.file.match(/^\s*(\d{3,4})/) || [])[1];
    if (n) byNum.set(String(Number(n)), m);
  }

  const plan: any[] = [];
  const skipped: any[] = [];
  for (const d of db) {
    const num = String(Number((d.nomor_agenda || '').split('/')[0].replace(/\D/g, '')) || '');
    const src = byNum.get(num);
    if (!src) { skipped.push(d.nomor_agenda); continue; }
    plan.push({
      id: d.id, agenda: d.nomor_agenda,
      nomor_lama: d.nomor_surat, nomor_baru: src.nomor_surat || null,
      tgl_lama: d.tanggal_surat ? new Date(d.tanggal_surat).toISOString().slice(0, 10) : null, tgl_baru: src.tanggal_surat,
      pihak_lama: isSm ? d.asal_instansi : d.tujuan_instansi,
      pihak_baru: (isSm ? src.asal_instansi : src.tujuan_instansi) || null,
      perihal_lama: d.perihal, perihal_baru: src.perihal || null,
    });
  }

  const c = (f: (p: any) => boolean) => plan.filter(f).length;
  console.log(`TAG=${TAG} DB=${db.length} PETA=${plan.length} TANPA_PDF=${skipped.length}`);
  console.log('nomor terisi  :', c((p) => !!p.nomor_baru), '/', plan.length);
  console.log('tanggal terisi:', c((p) => !!p.tgl_baru), '/', plan.length);
  console.log(isSm ? 'asal terisi   :' : 'tujuan terisi :', c((p) => !!p.pihak_baru), '/', plan.length);
  console.log('perihal terisi:', c((p) => !!p.perihal_baru), '/', plan.length);
  console.log('SAMPEL:');
  for (const p of plan.slice(0, 10)) {
    console.log(`  ${p.agenda.padEnd(20)} ${String(p.nomor_baru || '-').padEnd(30)} ${String(p.tgl_baru || '-')}  ${String(p.pihak_baru || '-').slice(0, 36)}  ${String(p.perihal_baru || '-').slice(0, 30)}`);
  }

  fs.writeFileSync(path.join(TMP, `meta_plan_${TAG}.json`), JSON.stringify({ plan, skipped }, null, 1), 'utf-8');
  if (!APPLY) { console.log('DRY-RUN. Tambahkan --apply untuk menulis.'); return; }

  const backup = path.join(TMP, `meta_backup_${TAG}_${Date.now()}.json`);
  fs.writeFileSync(backup, JSON.stringify(plan.map((p) => ({
    id: p.id, agenda: p.agenda, nomor_surat: p.nomor_lama, tanggal_surat: p.tgl_lama, pihak: p.pihak_lama, perihal: p.perihal_lama,
  })), null, 1), 'utf-8');
  console.log('BACKUP:', backup);

  let n = 0;
  for (const p of plan) {
    const kolom = isSm ? 'asal_instansi' : 'tujuan_instansi';
    const nomor = p.nomor_baru || (isSm ? '-' : `TIDAK TERBACA/${p.agenda}`);
    await query(
      `UPDATE ${isSm ? 'arsip_surat_masuk' : 'arsip_surat_keluar'} SET nomor_surat = ?, ${kolom} = ?, perihal = ?, tanggal_surat = COALESCE(?, tanggal_surat) WHERE id = ?`,
      [nomor, p.pihak_baru || '-', p.perihal_baru || '-', p.tgl_baru, p.id]
    );
    n++;
  }
  console.log('UPDATED_ROWS:', n);

  const tabel = isSm ? 'arsip_surat_masuk' : 'arsip_surat_keluar';
  const kol = isSm ? 'asal_instansi' : 'tujuan_instansi';
  const cek = await query<any>(
    `SELECT COUNT(*) AS total, SUM(nomor_surat <> '-') AS nomor_real, SUM(${kol} <> '-') AS pihak_real, SUM(perihal <> '-') AS perihal_real FROM ${tabel}`
  );
  console.log('VERIFIKASI:', JSON.stringify(cek));
}
main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });