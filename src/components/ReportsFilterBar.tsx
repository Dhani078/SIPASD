'use client';

import Icon from './Icon';

interface Props {
  reportType: string;
  setReportType: (v: string) => void;
  periodPreset: string;
  onPresetChange: (p: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  actionFilter: string;
  setActionFilter: (v: string) => void;
  onRefresh: () => void;
}

export default function ReportsFilterBar({
  reportType,
  setReportType,
  periodPreset,
  onPresetChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  actionFilter,
  setActionFilter,
  onRefresh,
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Icon name="chart" size={18} /> Pusat Laporan &amp; Keluaran Sistem (5 Laporan + Audit Trail)
          </h2>
          <p className="text-xs text-slate-500">
            Pilih format laporan baku untuk mencetak berkas fisik atau mengekspor rekapitulasi data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-800 transition"
        >
          <Icon name="print" size={14} /> Cetak Laporan (Print / PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        <div>
          <label htmlFor="select-report-type" className="block text-slate-600 font-medium mb-1">Pilih Jenis Laporan:</label>
          <select
            id="select-report-type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50 font-medium focus:bg-white"
          >
            <option value="1">Laporan 1: Buku Agenda Surat Masuk</option>
            <option value="2">Laporan 2: Buku Agenda Surat Keluar</option>
            <option value="3">Laporan 3: Rekap Disposisi per Bidang</option>
            <option value="4">Laporan 4: Monitoring Kepatuhan Disposisi</option>
            <option value="5">Laporan 5: Rekap Volume per Klasifikasi</option>
            <option value="6">Laporan 6: Log Audit Trail Keamanan</option>
          </select>
        </div>

        <div>
          <label htmlFor="select-period-preset" className="block text-slate-600 font-medium mb-1">Periode Waktu:</label>
          <select
            id="select-period-preset"
            value={periodPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
          >
            <option value="all">Semua Periode (TA 2026)</option>
            <option value="today">Hari Ini</option>
            <option value="this_month">Bulan Berjalan</option>
            <option value="this_year">Tahun 2026 Penuh</option>
          </select>
        </div>

        <div>
          <label htmlFor="input-start-date" className="block text-slate-600 font-medium mb-1">Rentang Tanggal:</label>
          <div className="flex items-center gap-1">
            <input
              id="input-start-date"
              type="date"
              aria-label="Tanggal mulai"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-slate-800"
            />
            <span className="text-slate-400">-</span>
            <input
              id="input-end-date"
              type="date"
              aria-label="Tanggal akhir"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-1/2 px-2 py-1.5 border border-slate-300 rounded text-slate-800"
            />
          </div>
        </div>

        {reportType === '4' ? (
          <div>
            <label htmlFor="select-status-filter" className="block text-slate-600 font-medium mb-1">Filter Status:</label>
            <select
              id="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="BELUM_SELESAI">Belum Selesai (Proses / Belum)</option>
              <option value="SELESAI">Sudah Selesai</option>
            </select>
          </div>
        ) : reportType === '6' ? (
          <div>
            <label htmlFor="select-action-filter" className="block text-slate-600 font-medium mb-1">Filter Aksi Log:</label>
            <select
              id="select-action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 bg-slate-50"
            >
              <option value="SEMUA">Semua Tindakan</option>
              <option value="BUAT_ARSIP">Buat Arsip</option>
              <option value="EDIT_ARSIP">Edit Arsip</option>
              <option value="HAPUS_ARSIP">Hapus Arsip</option>
              <option value="LOGIN_SUCCESS">Login Sukses</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
        ) : null}

        <div className="flex items-end">
          <button
            type="button"
            onClick={onRefresh}
            className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition flex items-center justify-center gap-1.5 h-[34px]"
          >
            <Icon name="clock" size={14} /> Muat Ulang Data
          </button>
        </div>
      </div>
    </div>
  );
}
