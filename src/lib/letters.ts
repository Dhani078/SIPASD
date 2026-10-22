import { query } from '@/lib/db';
import type { LetterRecord, Urgency } from '@/types';
import { venues } from '@/data/constants';
import { classifyText } from '@/lib/classifier';

function mapDivision(name?: string | null): string {
  if (!name) return 'Sekretariat';
  if (name.includes('Pembudayaan')) return 'Pembudayaan Olahraga';
  if (name.includes('Prestasi')) return 'Peningkatan Prestasi';
  if (name.includes('Pemuda')) return 'Pengembangan Pemuda';
  if (name.includes('Sarana')) return 'Sarana & Prasarana';
  return 'Sekretariat';
}

function detectVenue(text: string, division?: string, id?: string): string {
  for (const v of venues) {
    if (text.toLowerCase().includes(v.toLowerCase().slice(0, 8))) return v;
  }
  if (division && (division.includes('Sarana') || division.includes('Olahraga') || division.includes('Prestasi'))) {
    const num = parseInt((id || '0').replace(/\D/g, ''), 10) || 0;
    return venues[num % venues.length];
  }
  return '-';
}

function mapUrgency(sifat?: string | null): Urgency {
  const s = (sifat || 'BIASA').toUpperCase();
  if (s === 'KILAT') return 'Kilat';
  if (s === 'SEGERA') return 'Segera';
  if (s === 'PENTING') return 'Penting';
  return 'Biasa';
}

export async function getRealLetters(): Promise<LetterRecord[]> {
  const [smRows, skRows] = await Promise.all([
    query<any>(`
      SELECT sm.id, sm.nomor_agenda, sm.nomor_surat, sm.tanggal_surat, sm.tanggal_diterima,
             sm.asal_instansi, sm.perihal, sm.ringkasan_isi, sm.sifat_surat, sm.file_url,
             sm.cloudinary_public_id, sm.drive_url, sm.file_name_original,
             rd.pejabat_pendisposisi, rd.tanggal_disposisi, rd.instruksi_tercatat,
             rd.catatan_tertulis, b.nama_bidang as nama_bidang_disposisi
      FROM arsip_surat_masuk sm
      LEFT JOIN riwayat_disposisi rd ON sm.id = rd.surat_masuk_id
      LEFT JOIN bidang_dispora b ON rd.kepada_bidang_id = b.id
      ORDER BY sm.tanggal_surat DESC
    `),
    query<any>(`
      SELECT sk.id, sk.nomor_agenda, sk.nomor_surat, sk.nomor_urut, sk.tahun,
             sk.tanggal_surat, sk.tujuan_instansi, sk.perihal, sk.ringkasan_isi,
             sk.file_url, sk.cloudinary_public_id, sk.drive_url,
             k.kode as kode_klasifikasi, k.nama_klasifikasi,
             b.nama_bidang
      FROM arsip_surat_keluar sk
      LEFT JOIN klasifikasi_arsip k ON sk.kode_klasifikasi_id = k.id
      LEFT JOIN bidang_dispora b ON sk.bidang_pemrakarsa_id = b.id
      ORDER BY sk.tanggal_surat DESC
    `),
  ]);

  const smList: LetterRecord[] = smRows.map((r) => {
    const agendaNum = r.nomor_agenda.split('/')[0] || r.id.slice(0, 6);
    const dateStr = r.tanggal_surat ? new Date(r.tanggal_surat).toISOString().slice(0, 10) : '2026-08-01';
    const dispDate = r.tanggal_disposisi ? new Date(r.tanggal_disposisi).toISOString().slice(0, 10) : dateStr;
    const combinedText = `${r.perihal} ${r.ringkasan_isi || ''} ${r.asal_instansi}`;
    const div = mapDivision(r.nama_bidang_disposisi);
    return {
      id: agendaNum,
      rawId: r.id,
      number: r.nomor_surat,
      origin: r.asal_instansi,
      subject: r.perihal,
      date: dateStr,
      type: mapUrgency(r.sifat_surat),
      direction: 'in',
      classification: classifyText(combinedText).code || '005',
      venue: detectVenue(combinedText, div, agendaNum),
      division: div,
      disposition: {
        official: r.pejabat_pendisposisi || 'Pebriadin Hapiz, AP, M.Si',
        date: dispDate,
        division: div,
        instructions: (r.instruksi_tercatat || 'Tindak Lanjuti').split(/[;,]+/).map((s: string) => s.trim()).filter(Boolean),
        notes: r.catatan_tertulis || 'Disposisi tercatat di sistem.',
      },
      fileUrl: r.file_url,
      driveUrl: r.drive_url || 'https://drive.google.com/drive/folders/1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n',
    };
  });

  const skList: LetterRecord[] = skRows.map((r) => {
    const agendaNum = r.nomor_agenda.split('/')[0] || r.id.slice(0, 6);
    const dateStr = r.tanggal_surat ? new Date(r.tanggal_surat).toISOString().slice(0, 10) : '2026-08-01';
    const combinedText = `${r.perihal} ${r.ringkasan_isi || ''} ${r.tujuan_instansi}`;
    const div = mapDivision(r.nama_bidang);
    const num = parseInt(agendaNum.replace(/\D/g, ''), 10) || 0;
    const type: Urgency = num % 13 === 0 ? 'Penting' : num % 17 === 0 ? 'Segera' : 'Biasa';
    const cls = num % 5 === 0 ? '427' : num % 7 === 0 ? '800' : num % 11 === 0 ? '900' : num % 19 === 0 ? '045' : r.kode_klasifikasi || '426';
    return {
      id: agendaNum,
      rawId: r.id,
      number: r.nomor_surat,
      origin: r.tujuan_instansi,
      subject: r.perihal,
      date: dateStr,
      type,
      direction: 'out',
      classification: cls,
      venue: detectVenue(combinedText, div, agendaNum),
      division: div,
      disposition: {
        official: 'Pebriadin Hapiz, AP, M.Si',
        date: dateStr,
        division: div,
        instructions: ['Arsipkan'],
        notes: 'Arsip surat keluar resmi Dispora Kalsel.',
      },
      fileUrl: r.file_url,
      driveUrl: r.drive_url || 'https://drive.google.com/drive/folders/1rgWCFwULt8awBCVIuomy7cELKqEtbdkx',
    };
  });

  return [...smList, ...skList].sort((a, b) => b.date.localeCompare(a.date));
}
