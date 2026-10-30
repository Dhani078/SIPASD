'use client';

import { useState, useEffect } from 'react';
import ReportsFilterBar from './ReportsFilterBar';
import { ReportTableMasuk, ReportTableKeluar, ReportTableDisposisiBidang } from './ReportTablesPrimary';
import { ReportTableKepatuhan, ReportTableKlasifikasi, ReportTableAudit } from './ReportTablesSecondary';
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
  const [loading, setLoading] = useState<boolean>(false);
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
    return () => {
      ignore = true;
    };
  }, [reportType, startDate, endDate, statusFilter, actionFilter, reloadKey]);

  return (
    <div className="space-y-6">
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
        onRefresh={() => setReloadKey((k) => k + 1)}
      />

      {/* Sheet Laporan: Format Baku Panel Web & Print */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Kop Surat Cetak Resmi Pemprov Kalsel (Tampil elegan saat cetak, dan tersembunyi/minimal di web) */}
        <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-3 mb-6">
          <div className="w-16 flex-shrink-0 flex items-center justify-center">
            {/* Logo Kalsel Resmi */}
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

        {/* Judul Laporan Terpilih */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 print:border-none print:text-center print:pb-0">
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
              {startDate && endDate ? `Periode: ${startDate} s/d ${endDate}` : 'Periode: Tahun Anggaran 2026'}
            </p>
          </div>
          <div className="text-xs text-slate-500 print:hidden flex items-center gap-2">
            <span className="font-semibold text-slate-700">{data.length} Baris Data</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat data laporan kearsipan...</div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">Tidak ada arsip yang cocok dengan filter yang dipilih.</div>
        ) : (
          <div className="overflow-x-auto">
            {reportType === '1' && <ReportTableMasuk data={data} summary={summary} />}
            {reportType === '2' && <ReportTableKeluar data={data} />}
            {reportType === '3' && <ReportTableDisposisiBidang data={data} />}
            {reportType === '4' && <ReportTableKepatuhan data={data} />}
            {reportType === '5' && <ReportTableKlasifikasi data={data} />}
            {reportType === '6' && <ReportTableAudit data={data} />}
          </div>
        )}

        <div className="hidden print:grid grid-cols-2 gap-8 mt-12 text-xs text-slate-800">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Plt. Kepala Dinas Kepemudaan dan Olahraga</p>
            <p className="font-bold">Provinsi Kalimantan Selatan</p>
            <div className="h-16" />
            <p className="font-bold underline">Pebriadin Hapiz, AP, M.Si</p>
            <p>Pembina Utama Muda (IV/c)</p>
          </div>
          <div className="text-right">
            <p>Banjarmasin, 30 Oktober 2026</p>
            <p className="font-bold">Pengelola Arsip Kedinasan</p>
            <div className="h-16" />
            <p className="font-bold underline">Rana Nur Syifa</p>
            <p>Sekretariat Dispora Kalsel</p>
          </div>
        </div>
      </div>
    </div>
  );
}
