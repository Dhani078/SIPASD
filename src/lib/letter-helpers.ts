import type { Urgency } from '@/types';

export function mapDivision(name?: string | null): string {
  if (!name) return 'Sekretariat';
  if (name.includes('Keuangan') || name.includes('KEU')) return 'Subbagian Keuangan';
  if (name.includes('Umum') || name.includes('Kepegawaian')) return 'Subbagian Umum & Kepegawaian';
  if (name.includes('Perencanaan') || name.includes('Pelaporan')) return 'Subbagian Perencanaan & Pelaporan';
  if (name.includes('Pembudayaan')) return 'Pembudayaan Olahraga';
  if (name.includes('Prestasi')) return 'Peningkatan Prestasi';
  if (name.includes('Pengembangan')) return 'Pengembangan Pemuda';
  if (name.includes('Pemberdayaan')) return 'Pemberdayaan Pemuda';
  if (name.includes('Pemuda')) return 'Pengembangan Pemuda';
  if (name.includes('Sarana') || name.includes('Prasarana')) return 'Sarana & Prasarana';
  return 'Sekretariat';
}

export function detectVenue(text: string): string {
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

export function detectClassification(number: string, text: string): string {
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

export function mapOutgoingDivision(text: string): string {
  const t = text.toLowerCase();
  if (['keuangan', 'spj', 'bku', 'gaji', 'retribusi', 'anggaran', 'karcis', 'pembayaran', 'honor'].some((k) => t.includes(k))) return 'Subbagian Keuangan';
  if (['kepegawaian', 'cuti', 'pangkat', 'skum', 'kp', 'kgb', 'tata usaha', 'ekspedisi', 'kenaikan'].some((k) => t.includes(k))) return 'Subbagian Umum & Kepegawaian';
  if (['renja', 'renstra', 'lakip', 'sakip', 'lppd', 'perencanaan', 'pelaporan', 'monev', 'dpa'].some((k) => t.includes(k))) return 'Subbagian Perencanaan & Pelaporan';
  if (['pemberdayaan', 'paskibraka', 'wawasan kebangsaan', 'imtaq'].some((k) => t.includes(k))) return 'Pemberdayaan Pemuda';
  if (['pemuda', 'pramuka', 'wirausaha', 'kepemudaan', 'knpi', 'pelopor'].some((k) => t.includes(k))) return 'Pengembangan Pemuda';
  if (['prestasi', 'atlet', 'koni', 'kejurprov', 'pelatda', 'npc', 'popda', 'pomnas'].some((k) => t.includes(k))) return 'Peningkatan Prestasi';
  if (['pembudayaan', 'senam', 'masyarakat', 'rekreasi', 'tradisional', 'kormi'].some((k) => t.includes(k))) return 'Pembudayaan Olahraga';
  if (['sarana', 'prasarana', 'kendaraan', 'pesanan', 'rehabilitasi', 'order', 'venue', 'gor', 'stadion', 'lapangan'].some((k) => t.includes(k))) return 'Sarana & Prasarana';
  return 'Sekretariat';
}

export function mapOutgoingUrgency(text: string): Urgency {
  const t = text.toLowerCase();
  if (['kilat', 'darurat'].some((k) => t.includes(k))) return 'Kilat';
  if (['segera', 'tanggapan', 'konfirmasi'].some((k) => t.includes(k))) return 'Segera';
  if (['audit', 'penting', 'perintah tugas', 'pemeriksaan'].some((k) => t.includes(k))) return 'Penting';
  return 'Biasa';
}

export function mapUrgency(sifat?: string | null): Urgency {
  const s = (sifat || 'BIASA').toUpperCase();
  if (s === 'KILAT') return 'Kilat';
  if (s === 'SEGERA') return 'Segera';
  return s === 'PENTING' ? 'Penting' : 'Biasa';
}

export function parseBidangId(name?: string): number {
  const s = (name || '').trim().toLowerCase();
  if (!s) return 1;
  if (s === 'subbagian keuangan' || s.includes('keuangan')) return 6;
  if (s === 'subbagian umum & kepegawaian' || s.includes('umum') || s.includes('kepegawaian')) return 7;
  if (s === 'subbagian perencanaan & pelaporan' || s.includes('perencanaan') || s.includes('pelaporan')) return 8;
  if (s === 'pengembangan pemuda' || s === 'bidang pengembangan & pemberdayaan pemuda') return 4;
  if (s === 'pemberdayaan pemuda' || s === 'bidang pemberdayaan pemuda' || s.includes('pemberdayaan')) return 9;
  if (s.includes('pembudayaan')) return 2;
  if (s.includes('prestasi')) return 3;
  if (s.includes('pemuda') || s.includes('pengembangan')) return 4;
  return s.includes('sarana') || s.includes('prasarana') ? 5 : 1;
}

export async function parseKlasifikasiId(conn: { query: (sql: string, params: unknown[]) => Promise<unknown> }, code?: string): Promise<number> {
  if (!code) return 1;
  const [rows] = (await conn.query('SELECT id FROM klasifikasi_arsip WHERE kode = ? LIMIT 1', [code])) as [Array<{ id: number }>, unknown];
  if (rows && rows.length > 0) return Number(rows[0].id);
  const map: Record<string, number> = { '005': 1, '426': 2, '427': 3, '800': 4, '045': 5, '900': 6 };
  return map[code] || 1;
}
