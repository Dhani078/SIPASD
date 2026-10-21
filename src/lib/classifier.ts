export interface ClassificationResult {
  code: string;
  name: string;
  division: string;
  confidence: number;
}

const CATEGORY_VOCAB: Record<string, { name: string; division: string; words: string[] }> = {
  '426': {
    name: 'Keolahragaan',
    division: 'Peningkatan Prestasi',
    words: [
      'atlet', 'cabor', 'koni', 'kejuaraan', 'kejurda', 'turnamen', 'voli', 'sepakbola',
      'renang', 'pon', 'medali', 'pertandingan', 'pelatih', 'disposisi', 'tanding', 'sk',
    ],
  },
  '427': {
    name: 'Kepemudaan',
    division: 'Pengembangan Pemuda',
    words: [
      'pemuda', 'paskibraka', 'jambore', 'wirausaha', 'pramuka', 'knpi', 'pelatihan',
      'kreativitas', 'kader', 'organisasi', 'pemudi', 'kepemimpinan',
    ],
  },
  '005': {
    name: 'Undangan',
    division: 'Sekretariat',
    words: [
      'undangan', 'rapat', 'audiensi', 'sosialisasi', 'seminar', 'hadir', 'kehadiran',
      'pembukaan', 'penutupan', 'acara', 'forum', 'koordinasi',
    ],
  },
  '800': {
    name: 'Kepegawaian',
    division: 'Sekretariat',
    words: ['tugas', 'pegawai', 'pns', 'asn', 'cuti', 'mutasi', 'diklat', 'sppd', 'jabatan', 'kenaikan'],
  },
  '900': {
    name: 'Keuangan',
    division: 'Sekretariat',
    words: ['spj', 'anggaran', 'dana', 'hibah', 'pencairan', 'tagihan', 'honor', 'pajak', 'belanja', 'kwitansi'],
  },
  '045': {
    name: 'Kearsipan',
    division: 'Sekretariat',
    words: ['arsip', 'naskah', 'retensi', 'dokumen', 'peminjaman', 'penyerahan', 'ekspedisi'],
  },
};

export function classifyText(text: string): ClassificationResult {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  let bestCode = '005';
  let bestScore = -1;

  for (const [code, cat] of Object.entries(CATEGORY_VOCAB)) {
    let score = 0;
    for (const token of tokens) {
      if (cat.words.includes(token)) score += 2;
      for (const w of cat.words) {
        if (token.includes(w) || w.includes(token)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCode = code;
    }
  }

  // Refine division if venue is mentioned
  let recommendedDivision = CATEGORY_VOCAB[bestCode].division;
  const lower = text.toLowerCase();
  if (
    lower.includes('gor') ||
    lower.includes('lapangan') ||
    lower.includes('stadion') ||
    lower.includes('kolam') ||
    lower.includes('sirkuit')
  ) {
    recommendedDivision = 'Sarana & Prasarana';
  } else if (lower.includes('senam') || lower.includes('rekreasi') || lower.includes('masyarakat')) {
    recommendedDivision = 'Pembudayaan Olahraga';
  }

  const confidence = bestScore > 0 ? Math.min(98, 60 + bestScore * 5) : 50;

  return {
    code: bestCode,
    name: CATEGORY_VOCAB[bestCode].name,
    division: recommendedDivision,
    confidence,
  };
}
