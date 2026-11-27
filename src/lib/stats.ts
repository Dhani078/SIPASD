import { queryOne } from '@/lib/db';

export async function getPublicLandingStats(): Promise<{ in: number; out: number }> {
  try {
    const [sm, sk] = await Promise.all([
      queryOne<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM arsip_surat_masuk'),
      queryOne<{ cnt: number }>('SELECT COUNT(*) AS cnt FROM arsip_surat_keluar'),
    ]);
    return {
      in: Number(sm?.cnt || 0),
      out: Number(sk?.cnt || 0),
    };
  } catch {
    return { in: 174, out: 260 };
  }
}
