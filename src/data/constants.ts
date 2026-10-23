export const venues = [
  'GOR Hasanuddin HM',
  'Kolam Renang Mulawarman',
  'Lapangan 17 Mei',
  'Lap. Golf Swargaloka',
  'Lap. Tenis Dharma Praja',
  'GOR Paman Birin',
  'Stadion Demang Lehman',
  'Gedung Sultan Suriansyah',
  'Lapangan SKB',
  'BMX Sungai Ulin',
  'Sirkuit Balipat',
];

export const divisions = [
  'Sekretariat',
  'Pembudayaan Olahraga',
  'Peningkatan Prestasi',
  'Pengembangan Pemuda',
  'Sarana & Prasarana',
];

export const classifications = [
  ['005', 'Undangan'],
  ['426', 'Keolahragaan'],
  ['427', 'Kepemudaan'],
  ['800', 'Kepegawaian'],
  ['045', 'Kearsipan'],
  ['900', 'Keuangan'],
] as const;

export const defaultSampleLetter = {
  id: '0899',
  number: '400.8.1/01549/Kesra/2026',
  origin: 'Sekretariat Daerah Prov. Kalimantan Selatan',
  subject: 'Pelaksanaan Kegiatan Bersih-Bersih Masjid dalam Rangka Hari Jadi ke-76 Provinsi Kalimantan Selatan',
  date: '2026-07-31',
  type: 'Kilat' as const,
  direction: 'in' as const,
  classification: '005',
  venue: 'Lap. Tenis Dharma Praja',
  division: 'Sekretariat',
  disposition: {
    official: 'Pebriadin Hapiz, AP, M.Si',
    date: '2026-07-31',
    division: 'Sekretariat',
    instructions: ['Tindak Lanjuti', 'Koordinasikan'],
    notes: 'Segera koordinasikan persiapan dengan panitia daerah.',
  },
};

export const GDRIVE_FOLDERS = {
  smId: '1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n',
  skId: '1rgWCFwULt8awBCVIuomy7cELKqEtbdkx',
  smUrl: 'https://drive.google.com/drive/folders/1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n',
  skUrl: 'https://drive.google.com/drive/folders/1rgWCFwULt8awBCVIuomy7cELKqEtbdkx',
  fileViewPrefix: 'https://drive.google.com/file/d/',
};
