import { query, queryOne } from '@/lib/db';
import type { LetterRecord } from '@/types';
import { randomUUID } from 'crypto';

export async function insertNewLetter(
  data: Omit<LetterRecord, 'id'>,
  userId = 'usr-admin-01'
): Promise<string> {
  const id = randomUUID();
  const year = 2026;

  if (data.direction === 'in') {
    const maxRow = await queryOne<{ maxAgenda: any }>(`
      SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 1250) as maxAgenda
      FROM arsip_surat_masuk
    `);
    const nextAgendaNum = Number(maxRow?.maxAgenda || 1250) + 1;
    const nomorAgenda = `${nextAgendaNum}/SM/DISPORA/${year}`;

    await query(
      `INSERT INTO arsip_surat_masuk (
        id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima,
        asal_instansi, perihal, ringkasan_isi, sifat_surat, file_url,
        cloudinary_public_id, drive_url, file_name_original, indexed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        nomorAgenda,
        data.number,
        data.date,
        data.disposition?.date || data.date,
        data.origin,
        data.subject,
        data.subject,
        data.type.toUpperCase(),
        data.fileUrl || '',
        null,
        data.driveUrl || 'https://drive.google.com/drive/folders/1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n',
        `${nomorAgenda.replace(/\//g, '_')}.pdf`,
        userId,
      ]
    );

    const dispId = randomUUID();
    const instStr = data.disposition?.instructions?.join(', ') || 'Tindak Lanjuti';
    await query(
      `INSERT INTO riwayat_disposisi (
        id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi,
        kepada_bidang_id, instruksi_tercatat, catatan_tertulis, status_penyelesaian
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dispId,
        id,
        data.disposition?.official || '-',
        data.disposition?.date || data.date,
        1,
        instStr,
        data.disposition?.notes || '',
        'PROSES',
      ]
    );

    return nomorAgenda;
  } else {
    const maxRow = await queryOne<{ maxAgenda: any; maxUrut: any }>(`
      SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(nomor_agenda, '/', 1) AS UNSIGNED)), 7500) as maxAgenda,
             COALESCE(MAX(nomor_urut), 250) as maxUrut
      FROM arsip_surat_keluar
    `);
    const nextAgendaNum = Number(maxRow?.maxAgenda || 7500) + 1;
    const nextUrut = Number(maxRow?.maxUrut || 250) + 1;
    const nomorAgenda = `${nextAgendaNum}/SK/DISPORA/${year}`;

    await query(
      `INSERT INTO arsip_surat_keluar (
        id, nomor_agenda, nomor_surat, nomor_urut, tahun,
        kode_klasifikasi_id, bidang_pemrakarsa_id, tanggal_surat,
        tujuan_instansi, perihal, ringkasan_isi, file_url,
        cloudinary_public_id, drive_url, indexed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        nomorAgenda,
        data.number,
        nextUrut,
        year,
        2,
        1,
        data.date,
        data.origin,
        data.subject,
        data.subject,
        data.fileUrl || '',
        null,
        data.driveUrl || 'https://drive.google.com/drive/folders/1rgWCFwULt8awBCVIuomy7cELKqEtbdkx',
        userId,
      ]
    );

    return nomorAgenda;
  }
}

export async function deleteLetter(id: string, direction: 'in' | 'out'): Promise<boolean> {
  if (direction === 'in') {
    const sm = await queryOne<any>(
      'SELECT id FROM arsip_surat_masuk WHERE id = ? OR nomor_agenda LIKE ?',
      [id, `${id}/%`]
    );
    if (!sm) return false;
    await query('DELETE FROM riwayat_disposisi WHERE surat_masuk_id = ?', [sm.id]);
    await query('DELETE FROM arsip_surat_masuk WHERE id = ?', [sm.id]);
    return true;
  } else {
    const sk = await queryOne<any>(
      'SELECT id FROM arsip_surat_keluar WHERE id = ? OR nomor_agenda LIKE ?',
      [id, `${id}/%`]
    );
    if (!sk) return false;
    await query('DELETE FROM buku_ekspedisi WHERE surat_keluar_id = ?', [sk.id]);
    await query('DELETE FROM arsip_surat_keluar WHERE id = ?', [sk.id]);
    return true;
  }
}

export async function deleteLettersBatch(ids: string[], direction: 'in' | 'out'): Promise<number> {
  let count = 0;
  for (const id of ids) {
    const ok = await deleteLetter(id, direction);
    if (ok) count++;
  }
  return count;
}

export async function updateLetter(
  id: string,
  data: Partial<LetterRecord>,
  direction: 'in' | 'out' = 'in'
): Promise<boolean> {
  if (direction === 'in') {
    const sm = await queryOne<any>(
      'SELECT id FROM arsip_surat_masuk WHERE id = ? OR nomor_agenda LIKE ?',
      [id, `${id}/%`]
    );
    if (!sm) return false;

    const sets: string[] = [];
    const vals: any[] = [];
    if (data.number !== undefined) { sets.push('nomor_surat = ?'); vals.push(data.number); }
    if (data.origin !== undefined) { sets.push('asal_instansi = ?'); vals.push(data.origin); }
    if (data.subject !== undefined) { sets.push('perihal = ?'); vals.push(data.subject); }
    if (data.date !== undefined) { sets.push('tanggal_surat = ?'); vals.push(data.date); }
    if (data.type !== undefined) { sets.push('sifat_surat = ?'); vals.push(data.type.toUpperCase()); }
    if (data.fileUrl !== undefined) { sets.push('file_url = ?'); vals.push(data.fileUrl); }

    if (sets.length > 0) {
      vals.push(sm.id);
      await query(`UPDATE arsip_surat_masuk SET ${sets.join(', ')} WHERE id = ?`, vals);
    }

    if (data.disposition) {
      const d = data.disposition;
      const instStr = d.instructions?.join(', ') || 'Tindak Lanjuti';
      await query(
        `UPDATE riwayat_disposisi 
         SET pejabat_pendisposisi = COALESCE(?, pejabat_pendisposisi),
             instruksi_tercatat = ?,
             catatan_tertulis = ?,
             status_penyelesaian = COALESCE(?, status_penyelesaian)
         WHERE surat_masuk_id = ?`,
        [d.official, instStr, d.notes || '', d.status || 'SELESAI', sm.id]
      );
    }
    return true;
  } else {
    const sk = await queryOne<any>(
      'SELECT id FROM arsip_surat_keluar WHERE id = ? OR nomor_agenda LIKE ?',
      [id, `${id}/%`]
    );
    if (!sk) return false;

    const sets: string[] = [];
    const vals: any[] = [];
    if (data.number !== undefined) { sets.push('nomor_surat = ?'); vals.push(data.number); }
    if (data.origin !== undefined) { sets.push('tujuan_instansi = ?'); vals.push(data.origin); }
    if (data.subject !== undefined) { sets.push('perihal = ?'); vals.push(data.subject); }
    if (data.date !== undefined) { sets.push('tanggal_surat = ?'); vals.push(data.date); }
    if (data.fileUrl !== undefined) { sets.push('file_url = ?'); vals.push(data.fileUrl); }

    if (sets.length > 0) {
      vals.push(sk.id);
      await query(`UPDATE arsip_surat_keluar SET ${sets.join(', ')} WHERE id = ?`, vals);
    }
    return true;
  }
}
