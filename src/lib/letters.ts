import { query } from '@/lib/db';
import type { LetterRecord, Urgency } from '@/types';
import { GDRIVE_FOLDERS } from '@/data/constants';
import { classifyText } from '@/lib/classifier';
import { toLocalDateString } from '@/lib/format';

interface SuratMasukDbRow {
  id: string; nomor_agenda: string; nomor_surat: string;
  tanggal_surat: string | Date | null; tanggal_diterima: string | Date | null;
  asal_instansi: string; perihal: string; ringkasan_isi: string | null; sifat_surat: string | null;
  file_url: string | null; cloudinary_public_id: string | null; drive_url: string | null;
  file_name_original: string | null; pejabat_pendisposisi: string | null;
  tanggal_disposisi: string | Date | null; instruksi_tercatat: string | null;
  catatan_tertulis: string | null; status_penyelesaian: string | null; nama_bidang_disposisi: string | null;
}

interface SuratKeluarDbRow {
  id: string; nomor_agenda: string; nomor_surat: string; nomor_urut: number; tahun: number;
  tanggal_surat: string | Date | null; tujuan_instansi: string; perihal: string; ringkasan_isi: string | null;
  file_url: string | null; cloudinary_public_id: string | null; drive_url: string | null;
  file_name_original: string | null;
  kode_klasifikasi: string | null; nama_klasifikasi: string | null; nama_bidang: string | null;
}

function mapDivision(name?: string | null): string {
  if (!name) return 'Sekretariat';
  if (name.includes('Pembudayaan')) return 'Pembudayaan Olahraga';
  if (name.includes('Prestasi')) return 'Peningkatan Prestasi';
  if (name.includes('Pemuda')) return 'Pengembangan Pemuda';
  if (name.includes('Sarana')) return 'Sarana & Prasarana';
  return 'Sekretariat';
}

function detectVenue(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('17 mei')) return 'Lapangan 17 Mei';
  if (t.includes('swargaloka')) return 'Lap. Golf Swargaloka';
  if (t.includes('darma praja') || t.includes('dharma praja')) return 'Lap. Tenis Dharma Praja';
  if (t.includes('hasanuddin')) return 'GOR Hasanuddin HM';
  if (t.includes('mulawarman') && (t.includes('kolam') || t.includes('renang'))) return 'Kolam Renang Mulawarman';
  if (t.includes('demang lehman')) return 'Stadion Demang Lehman';
  if (t.includes('paman birin')) return 'GOR Paman Birin';
  if (t.includes('sultan suriansyah')) return 'Gedung Sultan Suriansyah';
  if (t.includes('skb mulawarman') || t.includes('sentra olahraga skb')) return 'Lapangan SKB';
  if (t.includes('sungai ulin')) return 'BMX Sungai Ulin';
  if (t.includes('balipat')) return 'Sirkuit Balipat';
  return '-';
}

function detectClassification(number: string, text: string): string {
  const n = (number || '').trim();
  const t = text.toLowerCase();
  if (n.startsWith('900') || n.startsWith('90') || ['anggaran', 'keuangan', 'rekening', 'spj', 'bku', 'kas'].some((k) => t.includes(k))) return '900';
  if (n.startsWith('800') || n.startsWith('80') || n.startsWith('000.1.2.3') || ['tugas', 'perjalanan', 'pegawai'].some((k) => t.includes(k))) return '800';
  if (n.startsWith('005') || t.includes('undangan')) return '005';
  if (n.startsWith('045') || n.startsWith('000.5') || t.includes('arsip')) return '045';
  if (t.includes('pemuda') || t.includes('pramuka')) return '427';
  if (t.includes('olahraga') || t.includes('atlet')) return '426';
  return '900';
}

function mapOutgoingDivision(text: string): string {
  const t = text.toLowerCase();
  if (['pemuda', 'pramuka', 'wirausaha', 'kepemudaan'].some((k) => t.includes(k))) return 'Pengembangan Pemuda';
  if (['prestasi', 'atlet', 'koni', 'kejurprov', 'pelatda'].some((k) => t.includes(k))) return 'Peningkatan Prestasi';
  if (['pembudayaan', 'senam', 'masyarakat', 'rekreasi'].some((k) => t.includes(k))) return 'Pembudayaan Olahraga';
  if (['sarana', 'prasarana', 'kendaraan', 'pesanan', 'rehabilitasi', 'order'].some((k) => t.includes(k))) return 'Sarana & Prasarana';
  return 'Sekretariat';
}

function mapOutgoingUrgency(text: string): Urgency {
  const t = text.toLowerCase();
  if (['kilat', 'darurat'].some((k) => t.includes(k))) return 'Kilat';
  if (['segera', 'tanggapan', 'konfirmasi'].some((k) => t.includes(k))) return 'Segera';
  if (['audit', 'penting', 'perintah tugas', 'pemeriksaan'].some((k) => t.includes(k))) return 'Penting';
  return 'Biasa';
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
    query<SuratMasukDbRow>(`
      SELECT sm.id, sm.nomor_agenda, sm.nomor_surat, sm.tanggal_surat, sm.tanggal_diterima,
             sm.asal_instansi, sm.perihal, sm.ringkasan_isi, sm.sifat_surat, sm.file_url,
             sm.cloudinary_public_id, sm.drive_url, sm.file_name_original,
             rd.pejabat_pendisposisi, rd.tanggal_disposisi, rd.instruksi_tercatat,
             rd.catatan_tertulis, rd.status_penyelesaian, b.nama_bidang as nama_bidang_disposisi
      FROM arsip_surat_masuk sm
      LEFT JOIN riwayat_disposisi rd ON sm.id = rd.surat_masuk_id
      LEFT JOIN bidang_dispora b ON rd.kepada_bidang_id = b.id
      ORDER BY sm.tanggal_surat DESC, CAST(SUBSTRING_INDEX(sm.nomor_agenda, '/', 1) AS UNSIGNED) DESC
    `),
    query<SuratKeluarDbRow>(`
      SELECT sk.id, sk.nomor_agenda, sk.nomor_surat, sk.nomor_urut, sk.tahun,
             sk.tanggal_surat, sk.tujuan_instansi, sk.perihal, sk.ringkasan_isi,
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
    const dispDate = toLocalDateString(r.tanggal_disposisi) || dateStr;
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
      classification: classifyText(combinedText)?.code || '005',
      venue: detectVenue(combinedText),
      division: div,
      disposition: {
        official: r.pejabat_pendisposisi || '-',
        date: dispDate,
        division: div,
        instructions: (r.instruksi_tercatat || 'Tindak Lanjuti').split(/[;,]+/).map((s: string) => s.trim()).filter(Boolean),
        notes: r.catatan_tertulis || 'Disposisi tercatat di sistem.',
        status: (r.status_penyelesaian === 'PROSES' || r.status_penyelesaian === 'BELUM_DIPROSES' ? r.status_penyelesaian : 'SELESAI') as 'SELESAI' | 'BELUM_DIPROSES' | 'PROSES',
      },
      fileUrl: r.file_url || undefined,
      driveUrl: r.drive_url || GDRIVE_FOLDERS.smUrl,
      fileName: r.file_name_original || `${agendaNum}.pdf`,
    };
  });

  const skList: LetterRecord[] = skRows.map((r) => {
    const agendaNum = r.nomor_agenda.split('/')[0] || r.id.slice(0, 6);
    const dateStr = toLocalDateString(r.tanggal_surat) || '2026-08-01';
    const combinedText = `${r.perihal} ${r.ringkasan_isi || ''} ${r.tujuan_instansi}`;
    const div = mapOutgoingDivision(combinedText);
    const type: Urgency = mapOutgoingUrgency(combinedText);
    const cls = detectClassification(r.nomor_surat, combinedText);
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
      venue: detectVenue(combinedText),
      division: div,
      disposition: {
        official: '-',
        date: dateStr,
        division: div,
        instructions: ['Arsipkan'],
        notes: 'Arsip surat keluar resmi Dispora Kalsel.',
      },
      fileUrl: r.file_url || undefined,
      driveUrl: r.drive_url || GDRIVE_FOLDERS.skUrl,
      fileName: r.file_name_original || `${agendaNum}.pdf`,
    };
  });

  return [...smList, ...skList].sort((a, b) => b.date.localeCompare(a.date));
}
