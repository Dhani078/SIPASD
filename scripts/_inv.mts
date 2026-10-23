import { query } from '../src/lib/db';

const CANON_HINTS = ['Sekretariat Daerah', 'Dinas Kepemudaan', 'Dinas Pendidikan', 'Badan Kepegawaian',
  'Bappeda', 'Inspektorat', 'Dinas Pariwisata', 'Dinas Komunikasi', 'Badan Kesatuan Bangsa', 'DPRD',
  'Kementerian Pemuda', 'Kementerian Pendidikan', 'Universitas Lambung Mangkurat', 'UIN Antasari',
  'Gerakan Pramuka', 'Kodam', 'Pemerintah Kota Banjarmasin', 'SMK Negeri 3', 'Ikatan Anggar',
  'Persatuan Sepak Bola', 'BBoy', 'National Paralympic', 'Mercedes-Benz', 'Yayasan Jantung',
  'Perkumpulan Praktisi Yoga', 'Persatuan Tenis', 'Federasi Aerosport', 'Persatuan Atletik',
  'Ikatan Mahasiswa', 'Bina Potensi', 'Forum Kewirausahaan', 'Komunitas Indonesia Skateboard',
  'Dewan Pemuda', 'Himpunan Mahasiswa', 'Politeknik Negeri', 'Pemerintah Provinsi', 'Bank'];

async function main() {
  const sm = await query<any>("SELECT nomor_agenda, nomor_surat, perihal, asal_instansi FROM arsip_surat_masuk");
  const smJunkPerihal = sm.filter((r: any) => r.perihal !== '-' && (/[*{}\\]|ffi|r}{/.test(r.perihal) || /^\s*\d{2,4}[\.\d]*\s*\//.test(r.perihal)));
  const smJunkAsal = sm.filter((r: any) => r.asal_instansi !== '-' && /[*{}\\ ]{0,2}[A-Z]{18,}/.test(r.asal_instansi));
  console.log('SM perihal bernoda:', smJunkPerihal.length);
  for (const r of smJunkPerihal.slice(0, 12)) console.log('   ', JSON.stringify({ a: r.nomor_agenda, p: r.perihal }));
  console.log('SM asal bernoda:', smJunkAsal.length);
  for (const r of smJunkAsal.slice(0, 6)) console.log('   ', JSON.stringify({ a: r.nomor_agenda, s: r.asal_instansi }));

  const sk = await query<any>("SELECT nomor_agenda, perihal, tujuan_instansi FROM arsip_surat_keluar");
  const skJunkTujuan = sk.filter((r: any) => r.tujuan_instansi !== '-' && !CANON_HINTS.some((c) => r.tujuan_instansi.includes(c)));
  const skJunkPerihal = sk.filter((r: any) => r.perihal !== '-' && (/[*{}\\]|ffi/.test(r.perihal) || /^\s*\d{2,4}[\.\d]*\s*\//.test(r.perihal)));
  console.log('SK tujuan di luar daftar baku:', skJunkTujuan.length);
  for (const r of skJunkTujuan.slice(0, 15)) console.log('   ', JSON.stringify({ a: r.nomor_agenda, t: r.tujuan_instansi }));
  console.log('SK perihal bernoda:', skJunkPerihal.length);
  for (const r of skJunkPerihal.slice(0, 10)) console.log('   ', JSON.stringify({ a: r.nomor_agenda, p: r.perihal }));
}
main().then(() => process.exit(0)).catch((e) => { console.error('FAIL:', e.message); process.exit(1); });