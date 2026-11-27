import { getDbPool, query, queryOne } from '@/lib/db';
import type { LetterRecord } from '@/types';
import { getGdriveFolderUrl } from '@/data/constants';
import { trashGoogleDriveFile, extractGoogleDriveFileId } from '@/lib/gdrive';
import { deletePdf } from '@/lib/cloudinary';
import { calculateNextWorkdayAgenda } from '@/lib/workday-slot';
import { parseBidangId, parseKlasifikasiId } from '@/lib/letter-helpers';
import { randomUUID } from 'crypto';

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
    const cleanVenue = data.venue && data.venue !== '-' ? data.venue : null;
    const kId = await parseKlasifikasiId(conn, data.classification);

    if (data.direction === 'in') {
      const receivedDate = data.receivedDate || data.disposition?.date || data.date || dateStr;
      const [rows] = await conn.query<any[]>(
        'SELECT nomor_agenda FROM arsip_surat_masuk WHERE nomor_agenda LIKE ? FOR UPDATE',
        [`%/${year}`]
      );
      const nomorAgenda = calculateNextWorkdayAgenda(receivedDate, 'in', rows.map((r) => r.nomor_agenda)).agendaNumber;

      await conn.query(
        'INSERT INTO arsip_surat_masuk (id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima, asal_instansi, perihal, ringkasan_isi, sifat_surat, kode_klasifikasi_id, venue, file_url, cloudinary_public_id, drive_url, file_name_original, indexed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, nomorAgenda, data.number, data.date, receivedDate, data.origin, data.subject, data.subject, data.type.toUpperCase(), kId, cleanVenue, data.fileUrl || '', data.cloudinaryPublicId || null, data.driveUrl || getGdriveFolderUrl('masuk', year), data.fileName || `${nomorAgenda.replace(/\//g, '_')}.pdf`, userId]
      );

      const dispId = randomUUID();
      const instStr = data.disposition?.instructions?.join(', ') || 'Tindak Lanjuti';
      const bId = parseBidangId(data.disposition?.division || data.division);
      const dStatus = data.disposition?.status || 'BELUM_DIPROSES';
      const dFile = data.dispositionFileUrl || data.disposition?.fileUrl || null;
      const dDrive = data.dispositionDriveUrl || data.disposition?.driveUrl || null;
      const dName = data.dispositionFileName || data.disposition?.fileName || null;
      await conn.query(
        'INSERT INTO riwayat_disposisi (id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi, kepada_bidang_id, instruksi_tercatat, catatan_tertulis, status_penyelesaian, file_disposisi_url, disposisi_drive_url, disposisi_file_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dispId, id, data.disposition?.official || '-', data.disposition?.date || receivedDate, bId, instStr, data.disposition?.notes || '', dStatus, dFile, dDrive, dName]
      );

      await conn.commit();
      return { agendaNumber: nomorAgenda, id };
    } else {
      const issuedDate = data.receivedDate || data.date || dateStr;
      const [rows] = await conn.query<any[]>(
        'SELECT nomor_agenda, nomor_urut FROM arsip_surat_keluar WHERE tahun = ? FOR UPDATE',
        [year]
      );
      const nomorAgenda = calculateNextWorkdayAgenda(issuedDate, 'out', rows.map((r) => r.nomor_agenda)).agendaNumber;
      const nextUrut = rows.reduce((max, r) => Math.max(max, Number(r.nomor_urut || 0)), 0) + 1;
      const pId = parseBidangId(data.division);

      await conn.query(
        'INSERT INTO arsip_surat_keluar (id, nomor_agenda, nomor_surat, nomor_urut, tahun, kode_klasifikasi_id, bidang_pemrakarsa_id, venue, tanggal_surat, tanggal_diterbitkan, tujuan_instansi, perihal, ringkasan_isi, file_url, cloudinary_public_id, drive_url, file_name_original, indexed_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, nomorAgenda, data.number, nextUrut, year, kId, pId, cleanVenue, data.date, issuedDate, data.origin, data.subject, data.subject, data.fileUrl || '', data.cloudinaryPublicId || null, data.driveUrl || getGdriveFolderUrl('keluar', year), data.fileName || `${nomorAgenda.replace(/\//g, '_')}.pdf`, userId]
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

  const pool = getDbPool();
  const kId = data.classification ? await parseKlasifikasiId(pool, data.classification) : null;
  const cleanVenue = data.venue !== undefined ? (data.venue && data.venue !== '-' ? data.venue : null) : undefined;

  if (isIn) {
    await query(
      'UPDATE arsip_surat_masuk SET nomor_surat = COALESCE(?, nomor_surat), asal_instansi = COALESCE(?, asal_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), tanggal_diterima = COALESCE(?, tanggal_diterima), sifat_surat = COALESCE(?, sifat_surat), kode_klasifikasi_id = COALESCE(?, kode_klasifikasi_id), venue = CASE WHEN ? = 1 THEN ? ELSE venue END, file_url = COALESCE(?, file_url), cloudinary_public_id = COALESCE(?, cloudinary_public_id), drive_url = COALESCE(?, drive_url), file_name_original = COALESCE(?, file_name_original) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, data.receivedDate ?? null, data.type ? data.type.toUpperCase() : null, kId, cleanVenue !== undefined ? 1 : 0, cleanVenue ?? null, data.fileUrl ?? null, data.cloudinaryPublicId ?? null, data.driveUrl ?? null, data.fileName ?? null, row.id]
    );
    if (data.disposition) {
      const d = data.disposition;
      const instStr = d.instructions?.join(', ') || 'Tindak Lanjuti';
      const bId = d.division || data.division ? parseBidangId(d.division || data.division) : null;
      const dFile = data.dispositionFileUrl || d.fileUrl || null;
      const dDrive = data.dispositionDriveUrl || d.driveUrl || null;
      const dName = data.dispositionFileName || d.fileName || null;
      await query(
        'UPDATE riwayat_disposisi SET pejabat_pendisposisi = COALESCE(?, pejabat_pendisposisi), tanggal_disposisi = COALESCE(?, tanggal_disposisi), kepada_bidang_id = COALESCE(?, kepada_bidang_id), instruksi_tercatat = ?, catatan_tertulis = ?, status_penyelesaian = COALESCE(?, status_penyelesaian), file_disposisi_url = COALESCE(?, file_disposisi_url), disposisi_drive_url = COALESCE(?, disposisi_drive_url), disposisi_file_name = COALESCE(?, disposisi_file_name) WHERE surat_masuk_id = ?',
        [d.official || null, d.date || null, bId, instStr, d.notes || '', d.status || 'SELESAI', dFile, dDrive, dName, row.id]
      );
    }
  } else {
    const pId = data.division ? parseBidangId(data.division) : null;
    await query(
      'UPDATE arsip_surat_keluar SET nomor_surat = COALESCE(?, nomor_surat), tujuan_instansi = COALESCE(?, tujuan_instansi), perihal = COALESCE(?, perihal), tanggal_surat = COALESCE(?, tanggal_surat), tanggal_diterbitkan = COALESCE(?, tanggal_diterbitkan), kode_klasifikasi_id = COALESCE(?, kode_klasifikasi_id), bidang_pemrakarsa_id = COALESCE(?, bidang_pemrakarsa_id), venue = CASE WHEN ? = 1 THEN ? ELSE venue END, file_url = COALESCE(?, file_url), cloudinary_public_id = COALESCE(?, cloudinary_public_id), drive_url = COALESCE(?, drive_url), file_name_original = COALESCE(?, file_name_original) WHERE id = ?',
      [data.number ?? null, data.origin ?? null, data.subject ?? null, data.date ?? null, data.receivedDate ?? null, kId, pId, cleanVenue !== undefined ? 1 : 0, cleanVenue ?? null, data.fileUrl ?? null, data.cloudinaryPublicId ?? null, data.driveUrl ?? null, data.fileName ?? null, row.id]
    );
  }
  return true;
}
