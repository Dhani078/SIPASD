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
