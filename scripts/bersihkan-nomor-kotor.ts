import { query } from '../src/lib/db';

async function main() {
  // 1. Bersihkan akhiran 'Dasar', 'DasarDPA', dsb pada SK
  const skFixes = [
    { agenda: '4065/SK/DISPORA/2026', nomor: '800.1.11.1/4065/DISPORA/2026' },
    { agenda: '4620/SK/DISPORA/2026', nomor: '800.1.11.1/4620/DISPORA/2026' },
    { agenda: '4631/SK/DISPORA/2026', nomor: '800.1.11.1/4631/DISPORA/2026' },
    { agenda: '4808/SK/DISPORA/2026', nomor: '800.1.11.1/4808/DISPORA/2026' },
    { agenda: '5679/SK/DISPORA/2026', nomor: '800.1.11.1/5679/DISPORA/2026' },
    { agenda: '6060/SK/DISPORA/2026', nomor: '800.1.11.1/6060/DISPORA/2026' },
    { agenda: '6398/SK/DISPORA/2026', nomor: '800.1.11.1/6398/DISPORA/2026' },
    { agenda: '7049/SK/DISPORA/2026', nomor: '800.1.11.1/7049/DISPORA/2026' },
    { agenda: '7652/SK/DISPORA/2026', nomor: '800.1.11.1/7652/DISPORA/2026' },
  ];

  for (const f of skFixes) {
    await query('UPDATE arsip_surat_keluar SET nomor_surat = ? WHERE nomor_agenda = ?', [f.nomor, f.agenda]);
    console.log(`✓ SK ${f.agenda} -> ${f.nomor}`);
  }

  // 2. Bersihkan SM 1149
  await query(
    'UPDATE arsip_surat_masuk SET nomor_surat = ? WHERE nomor_agenda = ?',
    ['500.12/001875/KESRA/2026', '1149/SM/DISPORA/2026']
  );
  console.log('✓ SM 1149/SM/DISPORA/2026 -> 500.12/001875/KESRA/2026');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});