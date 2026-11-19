import { query, queryOne } from '@/lib/db';
import type { ResultSetHeader } from 'mysql2/promise';

export interface ClassificationRecord {
  id: number;
  kode: string;
  nama_klasifikasi: string;
  uraian: string;
  retensi_aktif_tahun: number;
  retensi_inaktif_tahun: number;
  created_at?: string;
}

export async function getAllClassifications(): Promise<ClassificationRecord[]> {
  return query<ClassificationRecord>(
    'SELECT id, kode, nama_klasifikasi, uraian, retensi_aktif_tahun, retensi_inaktif_tahun, created_at FROM klasifikasi_arsip ORDER BY kode ASC'
  );
}

export async function insertClassification(data: {
  kode: string;
  nama_klasifikasi: string;
  uraian: string;
  retensi_aktif_tahun?: number;
  retensi_inaktif_tahun?: number;
}): Promise<ClassificationRecord> {
  const existing = await queryOne<{ id: number }>(
    'SELECT id FROM klasifikasi_arsip WHERE kode = ? LIMIT 1',
    [data.kode]
  );
  if (existing) {
    throw new Error(`Kode klasifikasi '${data.kode}' sudah terdaftar di sistem.`);
  }

  const retAktif = data.retensi_aktif_tahun ?? 2;
  const retInaktif = data.retensi_inaktif_tahun ?? 5;

  const res = await query<ResultSetHeader>(
    'INSERT INTO klasifikasi_arsip (kode, nama_klasifikasi, uraian, retensi_aktif_tahun, retensi_inaktif_tahun) VALUES (?, ?, ?, ?, ?)',
    [data.kode, data.nama_klasifikasi, data.uraian, retAktif, retInaktif]
  );

  return {
    id: (res as unknown as ResultSetHeader).insertId || 0,
    kode: data.kode,
    nama_klasifikasi: data.nama_klasifikasi,
    uraian: data.uraian,
    retensi_aktif_tahun: retAktif,
    retensi_inaktif_tahun: retInaktif,
  };
}
