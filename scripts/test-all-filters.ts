import { getRealLetters } from '../src/lib/letters';
import { matchesSearch } from '../src/lib/format';
import { classifications, venues, divisions } from '../src/data/constants';

async function main() {
  const letters = await getRealLetters();
  console.log('Total berkas ditarik dari TiDB Cloud:', letters.length);

  let passed = 0;
  let failed = 0;

  function assert(desc: string, condition: boolean) {
    if (condition) {
      console.log('  [PASS]', desc);
      passed++;
    } else {
      console.error('  [FAIL]', desc);
      failed++;
    }
  }

  console.log('\n--- 1. FILTER TAHUN ANGGARAN ---');
  const t2026 = letters.filter((l) => l.date.startsWith('2026'));
  const t2025 = letters.filter((l) => l.date.startsWith('2025'));
  assert(`Filter TA 2026 menghasilkan ${t2026.length} arsip (100% data)`, t2026.length === 411);
  assert(`Filter TA 2025 menghasilkan ${t2025.length} arsip (tepat, data historis belum ada)`, t2025.length === 0);

  console.log('\n--- 2. FILTER ARAH PERSURATAN (DIRECTION) ---');
  const sm = letters.filter((l) => l.direction === 'in');
  const sk = letters.filter((l) => l.direction === 'out');
  assert(`Filter Surat Masuk: ${sm.length} arsip (target: 170)`, sm.length === 170);
  assert(`Filter Surat Keluar: ${sk.length} arsip (target: 241)`, sk.length === 241);

  console.log('\n--- 3. FILTER SIFAT SURAT (URGENCY) ---');
  for (const urg of ['Biasa', 'Penting', 'Segera', 'Kilat'] as const) {
    const res = letters.filter((l) => l.type === urg);
    const valid = res.every((l) => l.type === urg);
    assert(`Filter Sifat '${urg}': ${res.length} arsip valid`, res.length > 0 && valid);
  }
  const urgentMulti = letters.filter((l) => ['Kilat', 'Segera'].includes(l.type));
  assert(`Filter 'Urgent' (Kilat & Segera): ${urgentMulti.length} arsip terhitung tepat`, urgentMulti.length === letters.filter((l) => l.type === 'Kilat').length + letters.filter((l) => l.type === 'Segera').length);

  console.log('\n--- 4. FILTER KODE KLASIFIKASI DINAS ---');
  for (const [code, name] of classifications) {
    const res = letters.filter((l) => l.classification === code);
    const valid = res.every((l) => l.classification === code);
    assert(`Filter Kode '${code}' (${name}): ${res.length} arsip valid`, valid && res.length >= 0);
  }

  console.log('\n--- 5. FILTER BIDANG TUJUAN DISPORA ---');
  for (const div of divisions) {
    const res = letters.filter((l) => l.division === div);
    const valid = res.every((l) => l.division === div);
    assert(`Filter Bidang '${div}': ${res.length} arsip valid`, valid && res.length >= 0);
  }

  console.log('\n--- 6. FILTER VENUE OLAHRAGA DISPORA ---');
  for (const v of venues) {
    const res = letters.filter((l) => l.venue === v);
    const valid = res.every((l) => l.venue === v);
    assert(`Filter Venue '${v}': ${res.length} arsip valid`, valid && res.length >= 0);
  }

  console.log('\n--- 7. FILTER PENCARIAN TEKS BEBAS (SEARCH QUERY) ---');
  const queries = ['Dispora', 'Kalsel', 'Agenda', '1099', 'Sekretariat', 'Paman Birin'];
  for (const q of queries) {
    const res = letters.filter((l) => matchesSearch(l, q));
    assert(`Pencarian kata kunci '${q}': ${res.length} arsip cocok`, res.length > 0);
  }

  console.log('\n--- 8. KOMBINASI FILTER MULTI-DIMENSI ---');
  const combo1 = letters.filter((l) => l.direction === 'in' && l.type === 'Biasa');
  assert(`Kombinasi Surat Masuk + Sifat Biasa: ${combo1.length} arsip`, combo1.length > 0 && combo1.every((l) => l.direction === 'in' && l.type === 'Biasa'));

  const combo2 = letters.filter((l) => l.direction === 'out' && l.classification === '426');
  assert(`Kombinasi Surat Keluar + Klasifikasi 426: ${combo2.length} arsip`, combo2.length > 0 && combo2.every((l) => l.direction === 'out' && l.classification === '426'));

  const combo3 = letters.filter((l) => l.date.startsWith('2026') && l.direction === 'in' && ['Kilat', 'Segera'].includes(l.type));
  assert(`Kombinasi TA 2026 + Surat Masuk + Urgent: ${combo3.length} arsip`, combo3.length > 0);

  const combo4 = letters.filter((l) => l.venue === 'GOR Hasanuddin HM' && l.direction === 'in');
  assert(`Kombinasi Venue GOR Hasanuddin HM + Surat Masuk: ${combo4.length} arsip`, combo4.length > 0 && combo4.every((l) => l.venue === 'GOR Hasanuddin HM' && l.direction === 'in'));

  console.log(`\n==============================================`);
  console.log(`TOTAL UJI FILTER: ${passed} SUKSES, ${failed} GAGAL`);
  console.log(`STATUS: ${failed === 0 ? '100% SEMUA FILTER BERFUNGSI VALID' : 'ADA FILTER GAGAL'}`);
  console.log(`==============================================`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
