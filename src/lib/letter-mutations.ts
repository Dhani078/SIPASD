import { getDbPool, query, queryOne } from '@/lib/db';
import type { LetterRecord } from '@/types';
import { GDRIVE_FOLDERS } from '@/data/constants';
import { randomUUID } from 'crypto';

export async function insertNewLetter(
  data: Omit<LetterRecord, 'id'>,
  userId = 'usr-admin-01'
): Promise<string> {
  const id = randomUUID();
  const year = 2026;
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    if (data.direction === 'in') {
      const [maxRows] = await conn.query<any[]>(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 1250) as maxAgenda FROM arsip_surat_masuk FOR UPDATE"
      );
      const nextAgenda = Number(maxRows[0]?.maxAgenda || 1250) + 1;
      const nomorAgenda = `${nextAgenda}/SM/DISPORA/${year}`;

      await conn.query(
        'INSERT INTO arsip_surat_masuk (id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima, asal_instansi, perihal, ringkasan_isi, sifat_surat, file_url, cloudinary_public_id, drive_url, file_name_original, indexed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)',
        [id, nomorAgenda, data.number, data.date, data.disposition?.date || data.date, data.origin, data.subject, data.subject, data.type.toUpperCase(), data.fileUrl || '', data.driveUrl || GDRIVE_FOLDERS.smUrl, `${nomorAgenda.replace(/\//g, '_')}.pdf`, userId]
      );

      const dispId = randomUUID();
      const instStr = data.disposition?.instructions?.join(', ') || 'Tindak Lanjuti';
      await conn.query(
        'INSERT INTO riwayat_disposisi (id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi, kepada_bidang_id, instruksi_tercatat, catatan_tertulis, status_penyelesaian) VALUES (?, ?, ?, ?, 1, ?, ?, ?)',
        [dispId, id, data.disposition?.official || '-', data.disposition?.date || data.date, instStr, data.disposition?.notes || '', 'PROSES']
      );

      await conn.commit();
      return nomorAgenda;
    } else {
      const [maxRows] = await conn.query<any[]>(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 7500) as maxAgenda, COALESCE(MAX(nomor_urut), 250) as maxUrut FROM arsip_surat_keluar FOR UPDATE"
      );
      const nextAgenda = Number(maxRows[0]?.maxAgenda || 7500) + 1;
      const nextUrut = Number(maxRows[0]?.maxUrut || 250) + 1;
      const nomorAgenda = `${nextAgenda}/SK/DISPORA/${year}`;

      await conn.query(
        'INSERT INTO arsip_surat_keluar (id, nomor_agenda, nomor_surat, nomor_urut, tahun, kode_klasifikasi_id, bidang_pemrakarsa_id, tanggal_surat, tujuan_instansi, perihal, ringkasan_isi, file_url, cloudinary_public_id, drive_url, indexed_by) VALUES (?, ?, ?, ?, ?, 2, 1, ?, ?, ?, ?, ?, NULL, ?, ?)',
        [id, nomorAgenda, data.number, nextUrut, year, data.date, data.origin, data.subject, data.subject, data.fileUrl || '', data.driveUrl || GDRIVE_FOLDERS.skUrl, userId]
      );

      await conn.commit();
      return nomorAgenda;
    }
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteLetter(id: string, direction: 'in' | 'out'): Promise<boolean> {
  const count = await deleteLettersBatch([id], direction);
  return count > 0;
}

export async function deleteLettersBatch(ids: string[], direction: 'in' | 'out'): Promise<number> {
  if (!ids.length) return 0;
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    let targetIds: string[] = [];

    if (direction === 'in') {
      const [rows] = await conn.query<any[]>(
        'SELECT id FROM arsip_surat_masuk WHERE id IN (?) OR nomor_agenda IN (?)',
        [ids, ids]
      );
      targetIds = rows.map((r: any) => r.id);
      if (targetIds.length > 0) {
        await conn.query('DELETE FROM riwayat_disposisi WHERE surat_masuk_id IN (?)', [targetIds]);
        await conn.query('DELETE FROM arsip_surat_masuk WHERE id IN (?)', [targetIds]);
      }
    } else {
      const [rows] = await conn.query<any[]>(
        'SELECT id FROM arsip_surat_keluar WHERE id IN (?) OR nomor_agenda IN (?)',
        [ids, ids]
      );
      targetIds = rows.map((r: any) => r.id);
      if (targetIds.length > 0) {
        await conn.query('DELETE FROM buku_ekspedisi WHERE surat_keluar_id IN (?)', [targetIds]);
        await conn.query('DELETE FROM arsip_surat_keluar WHERE id IN (?)', [targetIds]);
      }
    }
    await conn.commit();
    return targetIds.length;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function updateLetter(
  id: string,
  data: Partial<LetterRecord>,
  direction: 'in' | 'out' = 'in'
): Promise<boolean> {
  const isIn = direction === 'in';
  const row = await queryOne<any>(
    isIn
      ? 'SELECT id FROM arsip_surat_masuk WHERE id = ? OR nomor_agenda = ?'
      : 'SELECT id FROM arsip_surat_keluar WHERE id = ? OR nomor_agenda = ?',
    [id, id]
  );
  if (!row) return false;

  if (isIn) {
    await query(
      'UPDATE arsip_surat_masuk SET nomor_surat = COALESCE(?, nomor_surat), asal_instansi = COALESCE(?, asal_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), sifat_surat = COALESCE(?, sifat_surat), file_url = COALESCE(?, file_url) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, data.type ? data.type.toUpperCase() : null, data.fileUrl ?? null, row.id]
    );
    if (data.disposition) {
      const d = data.disposition;
      const instStr = d.instructions?.join(', ') || 'Tindak Lanjuti';
      await query(
        'UPDATE riwayat_disposisi SET pejabat_pendisposisi = COALESCE(?, pejabat_pendisposisi), instruksi_tercatat = ?, catatan_tertulis = ?, status_penyelesaian = COALESCE(?, status_penyelesaian) WHERE surat_masuk_id = ?',
        [d.official || null, instStr, d.notes || '', d.status || 'SELESAI', row.id]
      );
    }
  } else {
    await query(
      'UPDATE arsip_surat_keluar SET nomor_surat = COALESCE(?, nomor_surat), tujuan_instansi = COALESCE(?, tujuan_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), file_url = COALESCE(?, file_url) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, data.fileUrl ?? null, row.id]
    );
  }
  return true;
}
