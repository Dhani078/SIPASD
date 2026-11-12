import { getDbPool, query, queryOne } from '@/lib/db';
import type { LetterRecord } from '@/types';
import { getGdriveFolderUrl } from '@/data/constants';
import { trashGoogleDriveFile, extractGoogleDriveFileId } from '@/lib/gdrive';
import { deletePdf } from '@/lib/cloudinary';
import { randomUUID } from 'crypto';

function parseBidangId(name?: string): number {
  const s = (name || '').toLowerCase();
  if (s.includes('keuangan')) return 6;
  if (s.includes('umum') || s.includes('kepegawaian')) return 7;
  if (s.includes('perencanaan') || s.includes('pelaporan')) return 8;
  if (s.includes('pemberdayaan')) return 9;
  if (s.includes('pembudayaan')) return 2;
  if (s.includes('prestasi')) return 3;
  if (s.includes('pemuda') || s.includes('pengembangan')) return 4;
  if (s.includes('sarana') || s.includes('prasarana')) return 5;
  return 1;
}

function parseKlasifikasiId(code?: string): number {
  const map: Record<string, number> = { '005': 1, '045': 2, '426': 3, '427': 4, '800': 5, '900': 6 };
  return (code && map[code]) || 1;
}

export async function insertNewLetter(
  data: Omit<LetterRecord, 'id'>,
  userId = 'usr-admin-01'
): Promise<{ agendaNumber: string; id: string }> {
  const id = randomUUID();
  const dateStr = String(data.date || '');
  const parsedYear = parseInt(dateStr.slice(0, 4), 10);
  const year = !isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2200 ? parsedYear : 2026;
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    if (data.direction === 'in') {
      const [maxRows] = await conn.query<any[]>(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 1250) as maxAgenda FROM arsip_surat_masuk WHERE nomor_agenda LIKE ? FOR UPDATE",
        [`%/${year}`]
      );
      const nextAgenda = Number(maxRows[0]?.maxAgenda || 1250) + 1;
      const nomorAgenda = `${nextAgenda}/SM/DISPORA/${year}`;

      await conn.query(
        'INSERT INTO arsip_surat_masuk (id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima, asal_instansi, perihal, ringkasan_isi, sifat_surat, file_url, cloudinary_public_id, drive_url, file_name_original, indexed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)',
        [id, nomorAgenda, data.number, data.date, data.disposition?.date || data.date, data.origin, data.subject, data.subject, data.type.toUpperCase(), data.fileUrl || '', data.driveUrl || getGdriveFolderUrl('masuk', year), data.fileName || `${nomorAgenda.replace(/\//g, '_')}.pdf`, userId]
      );

      const dispId = randomUUID();
      const instStr = data.disposition?.instructions?.join(', ') || 'Tindak Lanjuti';
      const kId = parseBidangId(data.disposition?.division || data.division);
      await conn.query(
        'INSERT INTO riwayat_disposisi (id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi, kepada_bidang_id, instruksi_tercatat, catatan_tertulis, status_penyelesaian) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [dispId, id, data.disposition?.official || '-', data.disposition?.date || data.date, kId, instStr, data.disposition?.notes || '', 'PROSES']
      );

      await conn.commit();
      return { agendaNumber: nomorAgenda, id };
    } else {
      const [maxRows] = await conn.query<any[]>(
        "SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 7500) as maxAgenda, COALESCE(MAX(nomor_urut), 250) as maxUrut FROM arsip_surat_keluar WHERE tahun = ? FOR UPDATE",
        [year]
      );
      const nextAgenda = Number(maxRows[0]?.maxAgenda || 7500) + 1;
      const nextUrut = Number(maxRows[0]?.maxUrut || 250) + 1;
      const nomorAgenda = `${nextAgenda}/SK/DISPORA/${year}`;
      const pId = parseBidangId(data.division);
      const kId = parseKlasifikasiId(data.classification);

      await conn.query(
        'INSERT INTO arsip_surat_keluar (id, nomor_agenda, nomor_surat, nomor_urut, tahun, kode_klasifikasi_id, bidang_pemrakarsa_id, tanggal_surat, tujuan_instansi, perihal, ringkasan_isi, file_url, cloudinary_public_id, drive_url, file_name_original, indexed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)',
        [id, nomorAgenda, data.number, nextUrut, year, kId, pId, data.date, data.origin, data.subject, data.subject, data.fileUrl || '', data.driveUrl || getGdriveFolderUrl('keluar', year), data.fileName || `${nomorAgenda.replace(/\//g, '_')}.pdf`, userId]
      );

      await conn.commit();
      return { agendaNumber: nomorAgenda, id };
    }
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function purgeTargetRecords(
  conn: any,
  isMasuk: boolean,
  ids: string[]
): Promise<{ id: string; cloudinary_public_id?: string; drive_url?: string }[]> {
  const selectSql = isMasuk
    ? "SELECT id, cloudinary_public_id, drive_url FROM arsip_surat_masuk WHERE id IN (?) OR nomor_agenda IN (?) OR SUBSTRING_INDEX(nomor_agenda, '/', 1) IN (?)"
    : "SELECT id, cloudinary_public_id, drive_url FROM arsip_surat_keluar WHERE id IN (?) OR nomor_agenda IN (?) OR SUBSTRING_INDEX(nomor_agenda, '/', 1) IN (?)";

  const [rows] = await conn.query(selectSql, [ids, ids, ids]);
  const targetIds = rows.map((r: any) => r.id);

  if (targetIds.length > 0) {
    if (isMasuk) {
      await conn.query('DELETE FROM riwayat_disposisi WHERE surat_masuk_id IN (?)', [targetIds]);
      await conn.query('DELETE FROM arsip_surat_masuk WHERE id IN (?)', [targetIds]);
    } else {
      await conn.query('DELETE FROM buku_ekspedisi WHERE surat_keluar_id IN (?)', [targetIds]);
      await conn.query('DELETE FROM arsip_surat_keluar WHERE id IN (?)', [targetIds]);
    }
  }
  return rows;
}

export async function deleteLetter(id: string, direction: 'in' | 'out', trashDrive = false): Promise<boolean> {
  const count = await deleteLettersBatch([id], direction, trashDrive);
  return count > 0;
}

export async function deleteLettersBatch(ids: string[], direction: 'in' | 'out', trashDrive = false): Promise<number> {
  if (!ids.length) return 0;
  const pool = getDbPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();
    const isMasuk = direction === 'in';
    const targetRows = await purgeTargetRecords(conn, isMasuk, ids);
    await conn.commit();

    if (trashDrive && targetRows.length > 0) {
      for (const row of targetRows) {
        if (row.drive_url) {
          const fileId = extractGoogleDriveFileId(row.drive_url);
          if (fileId) await trashGoogleDriveFile(fileId).catch(() => false);
        }
        if (row.cloudinary_public_id) {
          await deletePdf(row.cloudinary_public_id).catch(() => false);
        }
      }
    }

    return targetRows.length;
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
      ? 'SELECT id FROM arsip_surat_masuk WHERE id = ? OR nomor_agenda = ? OR SUBSTRING_INDEX(nomor_agenda, \'/\', 1) = ?'
      : 'SELECT id FROM arsip_surat_keluar WHERE id = ? OR nomor_agenda = ? OR SUBSTRING_INDEX(nomor_agenda, \'/\', 1) = ?',
    [id, id, id]
  );
  if (!row) return false;

  if (isIn) {
    await query(
      'UPDATE arsip_surat_masuk SET nomor_surat = COALESCE(?, nomor_surat), asal_instansi = COALESCE(?, asal_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), sifat_surat = COALESCE(?, sifat_surat), file_url = COALESCE(?, file_url), drive_url = COALESCE(?, drive_url), file_name_original = COALESCE(?, file_name_original) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, data.type ? data.type.toUpperCase() : null, data.fileUrl ?? null, data.driveUrl ?? null, data.fileName ?? null, row.id]
    );
    if (data.disposition) {
      const d = data.disposition;
      const instStr = d.instructions?.join(', ') || 'Tindak Lanjuti';
      const kId = d.division || data.division ? parseBidangId(d.division || data.division) : null;
      await query(
        'UPDATE riwayat_disposisi SET pejabat_pendisposisi = COALESCE(?, pejabat_pendisposisi), kepada_bidang_id = COALESCE(?, kepada_bidang_id), instruksi_tercatat = ?, catatan_tertulis = ?, status_penyelesaian = COALESCE(?, status_penyelesaian) WHERE surat_masuk_id = ?',
        [d.official || null, kId, instStr, d.notes || '', d.status || 'SELESAI', row.id]
      );
    }
  } else {
    const pId = data.division ? parseBidangId(data.division) : null;
    await query(
      'UPDATE arsip_surat_keluar SET nomor_surat = COALESCE(?, nomor_surat), tujuan_instansi = COALESCE(?, tujuan_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), bidang_pemrakarsa_id = COALESCE(?, bidang_pemrakarsa_id), file_url = COALESCE(?, file_url), drive_url = COALESCE(?, drive_url), file_name_original = COALESCE(?, file_name_original) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, pId, data.fileUrl ?? null, data.driveUrl ?? null, data.fileName ?? null, row.id]
    );
  }
  return true;
}
