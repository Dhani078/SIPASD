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

export const GDRIVE_YEAR_FOLDERS: Record<string, string> = {
  sm_2027: '1yoXQAdEkDldDvRNL6SlmAR0cnN7pYu18',
  sk_2027: '1P6DbjRGRiZP3UpnIsCHBjQzHmuz-w0dl',
  sm_2026: '1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n',
  sk_2026: '1rgWCFwULt8awBCVIuomy7cELKqEtbdkx',
  sm_2025: '1u64297om4a92l3tFB8HBS2Itls3DKUTA',
  sk_2025: '1doEpMbWeoq_fJx-NfAAcJRkGWaKA6UML',
  sm_2024: '1L0Gx0Pkr5jeUJYiOhM305XuxfYxnKhds',
  sk_2024: '1ClmwDS7rcAS0Vi6M3uHJ9CjyYyIHKDa5',
  sm_2023: '1vTw8SbzrpH1Dym3vggRIOYCAG05XhtdL',
  sk_2023: '1IsndMj2O_xg35FoxK7-y3TVahelBDMhF',
  sm_2022: '17PFBeIMQgGI9WY_5_xKCgt5wCXcc8Ujv',
  sk_2022: '1rmmQxSeNaMOqXrHWtEclm44kTd6qHNzR',
  sm_2021: '1IdPV89EMJikhdu-OS_DTfjHSAXPqZwFV',
  sk_2021: '1y4kd-DZ4jKo5S6x1by_er7PpNmWy8CRH',
  sm_2020: '1GNBB_08p3oAwqmFi5d8HI92tsiqPJR-l',
  sk_2020: '1k_1bA1z4UcSuB8QVCL0ZTObwB6H1eZf0',
};

export function getGdriveFolderId(type: 'masuk' | 'keluar', year: string | number = 2026): string {
  const key = `${type === 'masuk' ? 'sm' : 'sk'}_${year}`;
  return GDRIVE_YEAR_FOLDERS[key] || (type === 'masuk' ? GDRIVE_FOLDERS.smId : GDRIVE_FOLDERS.skId);
}

export function getGdriveFolderUrl(type: 'masuk' | 'keluar', year: string | number = 2026): string {
  const id = getGdriveFolderId(type, year);
  return `https://drive.google.com/drive/folders/${id}`;
}
