import { downloadBlob } from './download';
import { todayWitaString } from './format';

export async function exportReportToExcel(
  reportType: string,
  data: Record<string, unknown>[],
  periodLabel?: string
) {
  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  workbook.creator = 'SIPASD Dispora Kalsel';

  let title = 'Laporan';
  let sheetName = 'Laporan';
  let columns: { header: string; key: string; width: number }[] = [];
  let rows: Record<string, unknown>[] = [];

  if (reportType === '1') {
    title = 'Buku-Agenda-Surat-Masuk';
    sheetName = 'Surat Masuk';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'No. Agenda', key: 'agenda', width: 16 },
      { header: 'Tgl Terima', key: 'tglTerima', width: 14 },
      { header: 'Nomor Surat', key: 'nomorSurat', width: 28 },
      { header: 'Tgl Surat', key: 'tglSurat', width: 14 },
      { header: 'Asal Instansi', key: 'asal', width: 35 },
      { header: 'Perihal', key: 'perihal', width: 60 },
      { header: 'Bidang Tujuan', key: 'bidang', width: 25 },
      { header: 'Sifat Surat', key: 'sifat', width: 14 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      agenda: String(r.nomor_agenda || ''),
      tglTerima: String(r.tanggal_diterima || '').slice(0, 10),
      nomorSurat: String(r.nomor_surat || ''),
      tglSurat: String(r.tanggal_surat || '').slice(0, 10),
      asal: String(r.asal_instansi || ''),
      perihal: String(r.perihal || ''),
      bidang: r.bidang_tujuan ? String(r.bidang_tujuan) : '-',
      sifat: String(r.sifat_surat || ''),
    }));
  } else if (reportType === '2') {
    title = 'Buku-Agenda-Surat-Keluar';
    sheetName = 'Surat Keluar';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'No. Agenda', key: 'agenda', width: 16 },
      { header: 'Nomor Surat Dinas', key: 'nomorSurat', width: 30 },
      { header: 'Tgl Surat', key: 'tglSurat', width: 14 },
      { header: 'Tgl Terbit', key: 'tglTerbit', width: 14 },
      { header: 'Klasifikasi', key: 'klasifikasi', width: 25 },
      { header: 'Bidang Pemrakarsa', key: 'bidang', width: 25 },
      { header: 'Tujuan Instansi', key: 'tujuan', width: 35 },
      { header: 'Perihal', key: 'perihal', width: 60 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      agenda: String(r.nomor_agenda || ''),
      nomorSurat: String(r.nomor_surat || ''),
      tglSurat: String(r.tanggal_surat || '').slice(0, 10),
      tglTerbit: String(r.tanggal_diterbitkan || r.tanggal_surat || '').slice(0, 10),
      klasifikasi: `${r.kode_klasifikasi || ''} - ${r.nama_klasifikasi || ''}`,
      bidang: String(r.bidang_pemrakarsa || ''),
      tujuan: String(r.tujuan_instansi || ''),
      perihal: String(r.perihal || ''),
    }));
  } else if (reportType === '3') {
    title = 'Rekap-Disposisi-per-Bidang';
    sheetName = 'Disposisi Bidang';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Bidang Kedinasan', key: 'bidang', width: 30 },
      { header: 'Jumlah Surat', key: 'jumlah', width: 14 },
      { header: 'Instruksi Terbanyak', key: 'instruksi', width: 35 },
      { header: 'Selesai', key: 'selesai', width: 12 },
      { header: 'Proses', key: 'proses', width: 12 },
      { header: 'Belum Proses', key: 'belum', width: 14 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      bidang: String(r.nama_bidang || ''),
      jumlah: Number(r.jumlah_surat || 0),
      instruksi: String(r.instruksi_terbanyak || '-'),
      selesai: Number(r.selesai || 0),
      proses: Number(r.proses || 0),
      belum: Number(r.belum_diproses || 0),
    }));
  } else if (reportType === '4') {
    title = 'Monitoring-Kepatuhan-Disposisi';
    sheetName = 'Kepatuhan';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'No. Agenda', key: 'agenda', width: 16 },
      { header: 'Perihal Surat', key: 'perihal', width: 50 },
      { header: 'Bidang Penanggung Jawab', key: 'bidang', width: 25 },
      { header: 'Pejabat Pendisposisi', key: 'pejabat', width: 25 },
      { header: 'Batas Waktu', key: 'batas', width: 14 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Pemantauan', key: 'monitoring', width: 22 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      agenda: String(r.nomor_agenda || ''),
      perihal: String(r.perihal || ''),
      bidang: String(r.bidang_tujuan || ''),
      pejabat: String(r.pejabat_pendisposisi || ''),
      batas: r.batas_waktu ? String(r.batas_waktu).slice(0, 10) : '-',
      status: String(r.status_penyelesaian || ''),
      monitoring: String(r.status_monitoring || ''),
    }));
  } else if (reportType === '5') {
    title = 'Rekap-Volume-Klasifikasi';
    sheetName = 'Klasifikasi';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Kode Urusan', key: 'kode', width: 14 },
      { header: 'Nama Klasifikasi Kearsipan', key: 'nama', width: 45 },
      { header: 'Total Surat Keluar', key: 'total', width: 20 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      kode: String(r.kode || ''),
      nama: String(r.nama_klasifikasi || ''),
      total: Number(r.total_surat_keluar || 0),
    }));
  } else if (reportType === '6') {
    title = 'Log-Audit-Trail-Sistem';
    sheetName = 'Audit Trail';
    columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Waktu Akses', key: 'waktu', width: 22 },
      { header: 'Nama Aparatur', key: 'nama', width: 25 },
      { header: 'Peran', key: 'role', width: 16 },
      { header: 'Tindakan', key: 'action', width: 22 },
      { header: 'Modul', key: 'modul', width: 18 },
      { header: 'Alamat IP', key: 'ip', width: 18 },
      { header: 'User Agent', key: 'ua', width: 50 },
    ];
    rows = data.map((r, i) => ({
      no: i + 1,
      waktu: String(r.waktu_akses || '').replace('T', ' ').slice(0, 19),
      nama: String(r.nama_pegawai || ''),
      role: String(r.role_pengguna || ''),
      action: String(r.tindakan || ''),
      modul: String(r.modul_target || ''),
      ip: String(r.ip_address || ''),
      ua: String(r.user_agent || ''),
    }));
  }

  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns;
  rows.forEach((r) => sheet.addRow(r));

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF064E3B' },
  };
  sheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const safePeriod = (periodLabel || todayWitaString()).replace(/\s+/g, '-');
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${title}-${safePeriod}.xlsx`
  );
}
