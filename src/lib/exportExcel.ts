import type { LetterRecord } from '@/types';
import { downloadBlob } from './download';

export async function exportExcel(letters: LetterRecord[]) {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  workbook.creator = 'SIPASD Dispora Kalsel';
  const years = Array.from(new Set(letters.map((l) => l.date ? l.date.slice(0, 4) : '2026'))).filter(Boolean);
  const yearLabel = years.length === 1 ? years[0] : 'Multi-Tahun';
  const sheet = workbook.addWorksheet(`Buku Agenda ${yearLabel}`);
  sheet.columns = [
    { header: 'No. Agenda', key: 'id', width: 20 },
    { header: 'Jenis', key: 'direction', width: 15 },
    { header: 'Nomor Surat', key: 'number', width: 30 },
    { header: 'Tanggal', key: 'date', width: 16 },
    { header: 'Asal / Tujuan Instansi', key: 'origin', width: 45 },
    { header: 'Perihal', key: 'subject', width: 85 },
    { header: 'Sifat', key: 'type', width: 12 },
    { header: 'Venue', key: 'venue', width: 30 },
    { header: 'Bidang', key: 'division', width: 28 },
    { header: 'Instruksi', key: 'instructions', width: 35 },
    { header: 'Catatan Disposisi', key: 'notes', width: 60 },
  ];

  letters.forEach((l) =>
    sheet.addRow({
      ...l,
      direction: l.direction === 'in' ? 'Surat Masuk' : 'Surat Keluar',
      instructions: l.disposition?.instructions?.join(', ') || '-',
      notes: l.disposition?.notes || '-',
    })
  );

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF064E3B' },
  };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: `K${letters.length + 1}` };

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `Buku-Agenda-Dispora-${yearLabel}.xlsx`
  );
}
