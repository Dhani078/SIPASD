import { query } from '../src/lib/db';
import fs from 'node:fs';
import path from 'node:path';

const TMP = path.join(process.env.LOCALAPPDATA || '.', 'Temp');
const APPLY = process.argv.includes('--apply');

type MapRow = { agenda: string | null; file: string; chars: number; addressee: string; official: string; rule: string };

async function main() {
  const mp: MapRow[] = JSON.parse(fs.readFileSync(path.join(TMP, 'sipasd_map_sm.json'), 'utf-8'));
  const db = await query<any>(
    'SELECT sm.id, sm.nomor_agenda, sm.file_name_original, rd.pejabat_pendisposisi ' +
    'FROM arsip_surat_masuk sm LEFT JOIN riwayat_disposisi rd ON rd.surat_masuk_id = sm.id ' +
    'ORDER BY sm.nomor_agenda'
  );

  const byAgenda = new Map<string, MapRow>();
  for (const r of mp) if (r.agenda) byAgenda.set(String(Number(r.agenda)), r);

  const plan: any[] = [];
  const skipped: any[] = [];
  for (const d of db) {
    const num = String(Number((d.nomor_agenda || '').split('/')[0].replace(/\D/g, '')) || '');
    const src = byAgenda.get(num);
    if (!src) { skipped.push({ agenda: d.nomor_agenda, reason: 'pdf-tidak-cocok' }); continue; }
    plan.push({
      id: d.id, agenda: d.nomor_agenda, file: src.file,
      addressee: (src.addressee || '').slice(0, 70),
      lama: d.pejabat_pendisposisi, baru: src.official, rule: src.rule, chars: src.chars,
    });
  }

  const rules: Record<string, number> = {};
  const offs: Record<string, number> = {};
  let akanBerubah = 0;
  for (const p of plan) {
    rules[p.rule] = (rules[p.rule] || 0) + 1;
    offs[p.baru] = (offs[p.baru] || 0) + 1;
    if (p.baru !== p.lama) akanBerubah++;
  }

  console.log('DB_SM:', db.length, '| PDF_COCOK:', plan.length, '| TANPA_PDF:', skipped.length);
  console.log('RULE:', JSON.stringify(rules));
  console.log('PEJABAT_BARU:', JSON.stringify(offs));
  console.log('AKAN_BERUBAH:', akanBerubah);
  console.log('SAMPEL_15:');
  for (const p of plan.slice(0, 15)) {
    console.log(`  ${p.agenda.padEnd(21)} ${String(p.file).slice(0, 24).padEnd(26)} ${String(p.lama).slice(0, 20).padEnd(22)} -> ${p.baru.padEnd(24)} [${p.rule}]`);
  }

  fs.writeFileSync(path.join(TMP, 'disp_plan.json'), JSON.stringify({ plan, skipped }, null, 1), 'utf-8');
  console.log('PLAN:', path.join(TMP, 'disp_plan.json'));

  if (!APPLY) { console.log('DRY-RUN: DB belum diubah (jalankan dengan --apply).'); return; }

  const backupPath = path.join(TMP, `disp_backup_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(plan.map((p) => ({ id: p.id, agenda: p.agenda, lama: p.lama })), null, 1), 'utf-8');
  console.log('BACKUP:', backupPath);

  let changed = 0;
  for (const p of plan) {
    if (p.baru === p.lama) continue;
    await query('UPDATE riwayat_disposisi SET pejabat_pendisposisi = ? WHERE surat_masuk_id = ?', [p.baru, p.id]);
    changed++;
  }
  console.log('UPDATED_ROWS:', changed);

  const cek = await query<any>('SELECT pejabat_pendisposisi, COUNT(*) AS n FROM riwayat_disposisi GROUP BY pejabat_pendisposisi ORDER BY n DESC');
  console.log('VERIFIKASI_DB:', JSON.stringify(cek));
}
main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });