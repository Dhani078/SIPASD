'use client';

import { useState, useEffect } from 'react';
import ReportsFilterBar from './ReportsFilterBar';
import { ReportTableMasuk, ReportTableKeluar, ReportTableDisposisiBidang } from './ReportTablesPrimary';
import { ReportTableKepatuhan, ReportTableKlasifikasi, ReportTableAudit } from './ReportTablesSecondary';
import { exportReportToExcel } from '@/lib/exportReportExcel';
import { formatDate } from '@/lib/format';
import type { DemoUser } from '@/types';

interface Props {
  currentUser: DemoUser;
}

export default function ReportsManagementView({ currentUser: _currentUser }: Props) {
  const [reportType, setReportType] = useState<string>('1');
  const [periodPreset, setPeriodPreset] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [actionFilter, setActionFilter] = useState<string>('SEMUA');
  const [divisionFilter, setDivisionFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);

  const handlePresetChange = (preset: string) => {
    setPeriodPreset(preset);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    if (preset === 'today') {
      const d = String(now.getDate()).padStart(2, '0');
      setStartDate(`${y}-${m}-${d}`);
      setEndDate(`${y}-${m}-${d}`);
    } else if (preset === 'this_month') {
      const lastDay = new Date(y, Number(m), 0).getDate();
      setStartDate(`${y}-${m}-01`);
      setEndDate(`${y}-${m}-${lastDay}`);
    } else if (preset === 'this_year') {
      setStartDate(`${y}-01-01`);
      setEndDate(`${y}-12-31`);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const p = new URLSearchParams();
        p.set('type', reportType);
        if (startDate) p.set('startDate', startDate);
        if (endDate) p.set('endDate', endDate);
        if (reportType === '4') p.set('status', statusFilter);
        if (reportType === '6') p.set('action', actionFilter);
        if (divisionFilter) p.set('division', divisionFilter);

        const res = await fetch(`/api/reports?${p.toString()}`);
        const json = await res.json();
        if (!ignore && json.success) {
          setData(json.data || []);
          setSummary(json.summary || null);
        }
      } catch {
        if (!ignore) setData([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    void load();
    return () => { ignore = true; };
  }, [reportType, startDate, endDate, statusFilter, actionFilter, divisionFilter, reloadKey]);

  const handleExportExcel = () => {
    if (data.length === 0) return;
    const label = startDate && endDate ? `${startDate}_sd_${endDate}` : periodPreset;
    void exportReportToExcel(reportType, data, label);
  };

  const todayStr = formatDate(new Date().toISOString().slice(0, 10));
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      <style>{`@media print { @page { size: landscape; margin: 8mm 10mm; } }`}</style>
      <ReportsFilterBar
        reportType={reportType}
        setReportType={setReportType}
        periodPreset={periodPreset}
        onPresetChange={handlePresetChange}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        divisionFilter={divisionFilter}
        setDivisionFilter={setDivisionFilter}
        onRefresh={() => setReloadKey((k) => k + 1)}
        onExportExcel={handleExportExcel}
        loading={loading}
        dataCount={data.length}
        onPrint={() => window.print()}
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="hidden print:flex items-center justify-between border-b-4 border-double border-slate-950 pb-2.5 mb-4">
          <div className="w-16 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-kalsel.svg" alt="Logo Pemprov Kalsel" className="w-14 h-16 object-contain" />
          </div>
          <div className="flex-1 text-center px-4">
            <h3 className="text-xs uppercase tracking-widest text-slate-800 font-bold">Pemerintah Provinsi Kalimantan Selatan</h3>
            <h2 className="text-base font-extrabold uppercase text-slate-950">Dinas Kepemudaan dan Olahraga</h2>
            <p className="text-[11px] text-slate-600">
              Jalan Pramuka No. 4 RT. 20, Kel. Sungai Lulut, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70238
            </p>
          </div>
          <div className="w-16 flex-shrink-0" />
        </div>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 print:border-none print:text-center print:pb-0 print:mb-3">
          <div>
            <h1 className="text-sm sm:text-base font-bold uppercase tracking-wide text-slate-900">
              {reportType === '1' && 'Buku Agenda Register Surat Masuk'}
              {reportType === '2' && 'Buku Agenda Register Surat Keluar Kedinasan'}
              {reportType === '3' && 'Laporan Rekapitulasi Distribusi Disposisi per Bidang'}
              {reportType === '4' && 'Laporan Pengawasan & Kepatuhan Batas Waktu Disposisi'}
              {reportType === '5' && 'Laporan Rekapitulasi Volume Naskah per Kode Klasifikasi'}
              {reportType === '6' && 'Laporan Rekapitulasi Riwayat Audit Trail Sistem'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {startDate && endDate ? `Periode: ${startDate} s/d ${endDate}` : `Periode: Tahun Anggaran ${currentYear}`}
            </p>
          </div>
          <div className="text-xs text-slate-500 print:hidden flex items-center gap-2">
            <span className="font-semibold text-slate-700">{data.length} Baris Data</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 print:hidden">
            <span className="inline-block w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Memuat data laporan kearsipan...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 print:text-slate-600">
            <p className="font-semibold text-slate-600">Tidak ada arsip yang cocok dengan filter yang dipilih.</p>
            <p className="text-[11px] text-slate-400 mt-1">Silakan pilih bidang lain atau perluas rentang tanggal periode.</p>
          </div>
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            {reportType === '1' && <ReportTableMasuk data={data} summary={summary} />}
            {reportType === '2' && <ReportTableKeluar data={data} />}
            {reportType === '3' && <ReportTableDisposisiBidang data={data} />}
            {reportType === '4' && <ReportTableKepatuhan data={data} />}
            {reportType === '5' && <ReportTableKlasifikasi data={data} />}
            {reportType === '6' && <ReportTableAudit data={data} />}
          </div>
        )}

        <div className="hidden print:grid grid-cols-2 gap-8 mt-8 text-xs text-slate-900 print:break-inside-avoid">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala Dinas Kepemudaan dan Olahraga</p>
            <p className="font-bold">Provinsi Kalimantan Selatan</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-950">Pebriadin Hapiz, AP, M.Si</p>
            <p className="text-[11px] text-slate-700">Pembina Utama Muda (IV/c)</p>
            <p className="text-[11px] font-mono text-slate-700">NIP. 19780214 199612 1 001</p>
          </div>
          <div className="text-right">
            <p>Banjarmasin, {todayStr}</p>
            <p className="font-bold">Pengelola Arsip Kedinasan</p>
            <p className="font-bold">Sekretariat Dispora Kalsel</p>
            <div className="h-16" />
            <p className="font-bold underline text-slate-950">Rana Nur Syifa</p>
            <p className="text-[11px] text-slate-700">Analis Anggaran &amp; Tata Usaha</p>
            <p className="text-[11px] font-mono text-slate-700">NIP. 19970101 202502 2 001</p>
          </div>
        </div>
      </div>
    </div>
  );
}
