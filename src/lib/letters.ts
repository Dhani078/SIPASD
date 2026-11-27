import { query } from '@/lib/db';
import type { LetterRecord, Urgency } from '@/types';
import { GDRIVE_FOLDERS } from '@/data/constants';
import { classifyText } from '@/lib/classifier';
import { toLocalDateString } from '@/lib/format';
import {
  mapDivision, detectVenue, detectClassification,
  mapOutgoingDivision, mapOutgoingUrgency, mapUrgency,
} from '@/lib/letter-helpers';

export { mapDivision };

interface SuratMasukDbRow {
  id: string; nomor_agenda: string; nomor_surat: string;
  tanggal_surat: string | Date | null; tanggal_diterima: string | Date | null;
  asal_instansi: string; perihal: string; ringkasan_isi: string | null; sifat_surat: string | null;
  kode_klasifikasi: string | null; venue: string | null;
  file_url: string | null; cloudinary_public_id: string | null; drive_url: string | null;
  file_name_original: string | null; pejabat_pendisposisi: string | null;
  tanggal_disposisi: string | Date | null; instruksi_tercatat: string | null;
  catatan_tertulis: string | null; status_penyelesaian: string | null; nama_bidang_disposisi: string | null;
  file_disposisi_url: string | null; disposisi_drive_url: string | null; disposisi_file_name: string | null;
}

interface SuratKeluarDbRow {
  id: string; nomor_agenda: string; nomor_surat: string; nomor_urut: number; tahun: number;
  tanggal_surat: string | Date | null; tanggal_diterbitkan: string | Date | null;
  tujuan_instansi: string; perihal: string; ringkasan_isi: string | null;
  venue: string | null; file_url: string | null; cloudinary_public_id: string | null; drive_url: string | null;
  file_name_original: string | null;
  kode_klasifikasi: string | null; nama_klasifikasi: string | null; nama_bidang: string | null;
}

export async function getRealLetters(): Promise<LetterRecord[]> {
  const [smRows, skRows] = await Promise.all([
    query<SuratMasukDbRow>(`
      SELECT sm.id, sm.nomor_agenda, sm.nomor_surat, sm.tanggal_surat, sm.tanggal_diterima,
             sm.asal_instansi, sm.perihal, sm.ringkasan_isi, sm.sifat_surat, sm.venue,
             k.kode as kode_klasifikasi, sm.file_url, sm.cloudinary_public_id, sm.drive_url,
             sm.file_name_original, rd.pejabat_pendisposisi, rd.tanggal_disposisi, rd.instruksi_tercatat,
             rd.catatan_tertulis, rd.status_penyelesaian, rd.file_disposisi_url,
             rd.disposisi_drive_url, rd.disposisi_file_name, b.nama_bidang as nama_bidang_disposisi
      FROM arsip_surat_masuk sm
      LEFT JOIN klasifikasi_arsip k ON sm.kode_klasifikasi_id = k.id
      LEFT JOIN riwayat_disposisi rd ON sm.id = rd.surat_masuk_id
      LEFT JOIN bidang_dispora b ON rd.kepada_bidang_id = b.id
      ORDER BY sm.tanggal_surat DESC, CAST(SUBSTRING_INDEX(sm.nomor_agenda, '/', 1) AS UNSIGNED) DESC
    `),
    query<SuratKeluarDbRow>(`
      SELECT sk.id, sk.nomor_agenda, sk.nomor_surat, sk.nomor_urut, sk.tahun,
             sk.tanggal_surat, sk.tanggal_diterbitkan, sk.tujuan_instansi, sk.perihal, sk.ringkasan_isi, sk.venue,
             sk.file_url, sk.cloudinary_public_id, sk.drive_url, sk.file_name_original,
             k.kode as kode_klasifikasi, k.nama_klasifikasi,
             b.nama_bidang
      FROM arsip_surat_keluar sk
      LEFT JOIN klasifikasi_arsip k ON sk.kode_klasifikasi_id = k.id
      LEFT JOIN bidang_dispora b ON sk.bidang_pemrakarsa_id = b.id
      ORDER BY sk.tanggal_surat DESC, CAST(SUBSTRING_INDEX(sk.nomor_agenda, '/', 1) AS UNSIGNED) DESC
    `),
  ]);

  const smList: LetterRecord[] = smRows.map((r) => {
    const agendaNum = r.nomor_agenda.split('/')[0] || r.id.slice(0, 6);
    const dateStr = toLocalDateString(r.tanggal_surat) || '2026-08-01';
    const receivedStr = toLocalDateString(r.tanggal_diterima) || dateStr;
    const dispDate = toLocalDateString(r.tanggal_disposisi) || receivedStr;
    const combinedText = `${r.perihal} ${r.ringkasan_isi || ''} ${r.asal_instansi}`;
    const div = mapDivision(r.nama_bidang_disposisi);
    return {
      id: agendaNum,
      rawId: r.id,
      number: r.nomor_surat,
      origin: r.asal_instansi,
      subject: r.perihal,
      date: dateStr,
      receivedDate: receivedStr,
      type: mapUrgency(r.sifat_surat),
      direction: 'in',
      classification: r.kode_klasifikasi || classifyText(combinedText)?.code || '005',
      venue: r.venue || detectVenue(combinedText),
      division: div,
      disposition: {
        official: r.pejabat_pendisposisi || '-',
        date: dispDate,
        division: div,
        instructions: (r.instruksi_tercatat || 'Tindak Lanjuti').split(/[;,]+/).map((s: string) => s.trim()).filter(Boolean),
        notes: r.catatan_tertulis || 'Disposisi tercatat di sistem.',
        status: (r.status_penyelesaian === 'PROSES' || r.status_penyelesaian === 'BELUM_DIPROSES' ? r.status_penyelesaian : 'SELESAI') as 'SELESAI' | 'BELUM_DIPROSES' | 'PROSES',
        fileUrl: r.file_disposisi_url || undefined,
        driveUrl: r.disposisi_drive_url || undefined,
        fileName: r.disposisi_file_name || undefined,
      },
      fileUrl: r.file_url || undefined,
      cloudinaryPublicId: r.cloudinary_public_id || undefined,
      driveUrl: r.drive_url || GDRIVE_FOLDERS.smUrl,
      fileName: r.file_name_original || `${agendaNum}.pdf`,
      dispositionFileUrl: r.file_disposisi_url || undefined,
      dispositionDriveUrl: r.disposisi_drive_url || undefined,
      dispositionFileName: r.disposisi_file_name || undefined,
    };
  });

  const skList: LetterRecord[] = skRows.map((r) => {
    const agendaNum = r.nomor_agenda.split('/')[0] || r.id.slice(0, 6);
    const dateStr = toLocalDateString(r.tanggal_surat) || '2026-08-01';
    const issuedStr = toLocalDateString(r.tanggal_diterbitkan) || dateStr;
    const combinedText = `${r.perihal} ${r.ringkasan_isi || ''} ${r.tujuan_instansi}`;
    const div = r.nama_bidang && r.nama_bidang !== 'Sekretariat Dispora' ? mapDivision(r.nama_bidang) : mapOutgoingDivision(combinedText);
    const type: Urgency = mapOutgoingUrgency(combinedText);
    const cls = r.kode_klasifikasi || detectClassification(r.nomor_surat, combinedText);
    return {
      id: agendaNum,
      rawId: r.id,
      number: r.nomor_surat,
      origin: r.tujuan_instansi,
      subject: r.perihal,
      date: dateStr,
      receivedDate: issuedStr,
      type,
      direction: 'out',
      classification: cls,
      venue: r.venue || detectVenue(combinedText),
      division: div,
      disposition: {
        official: '-',
        date: dateStr,
        division: div,
        instructions: ['Arsipkan'],
        notes: 'Arsip surat keluar resmi Dispora Kalsel.',
      },
      fileUrl: r.file_url || undefined,
      cloudinaryPublicId: r.cloudinary_public_id || undefined,
      driveUrl: r.drive_url || GDRIVE_FOLDERS.skUrl,
      fileName: r.file_name_original || `${agendaNum}.pdf`,
    };
  });

  return [...smList, ...skList].sort((a, b) => b.date.localeCompare(a.date));
}
