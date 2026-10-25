'use client';

import { useEffect, useState, useMemo } from 'react';
import Icon from './Icon';
import DistributionTable, { type ExpeditionRecord } from './DistributionTable';
import ExpeditionFormModal from './ExpeditionFormModal';
import ExpeditionInfoModal from './ExpeditionInfoModal';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  onExport: () => void;
}

export default function DistributionView({ letters, onExport }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LetterRecord | null>(null);
  const [records, setRecords] = useState<Record<string, ExpeditionRecord>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'DONE' | 'PENDING'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const suratKeluar = useMemo(() => letters.filter((l) => l.direction === 'out'), [letters]);
  const tercatat = Object.keys(records).length;

  const parseRecords = (list: ExpeditionRecord[]) => {
    const map: Record<string, ExpeditionRecord> = {};
    for (const r of list) map[r.surat_keluar_id] = r;
    return map;
  };

  const refreshRecords = async () => {
    try {
      const res = await fetch('/api/expedition');
      const data = await res.json();
      if (data?.success) setRecords(parseRecords(data.records));
    } catch { /* fallback */ }
  };

  useEffect(() => {
    let ignore = false;
    fetch('/api/expedition')
      .then((res) => res.json())
      .then((data) => { if (!ignore && data?.success) setRecords(parseRecords(data.records)); })
      .catch(() => {});
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => {
    return suratKeluar.filter((l) => {
      const isDone = Boolean(l.rawId && records[l.rawId]);
      if (status === 'DONE' && !isDone) return false;
      if (status === 'PENDING' && isDone) return false;
      if (query) {
        const q = query.toLowerCase();
        const rec = l.rawId ? records[l.rawId] : undefined;
        return (
          l.id.toLowerCase().includes(q) ||
          l.origin.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          Boolean(rec?.kurir_pengirim?.toLowerCase().includes(q)) ||
          Boolean(rec?.penerima_nama?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [suratKeluar, records, status, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const curPage = Math.min(page, totalPages);
  const paged = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  return (
    <section className="panel">
      <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2>Buku Ekspedisi Surat Keluar</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
              onClick={() => setShowInfo(true)}
              title="Klik untuk melihat penjelasan fungsi buku ekspedisi"
            >
              <Icon name="shield" size={12} />
              <span>Info SOP</span>
            </button>
            <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Tercatat: {tercatat}/{suratKeluar.length}
            </span>
          </div>
          <p>Catatan distribusi fisik &amp; tanda terima kurir resmi kedinasan</p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
          <button className="btn outline justify-center" onClick={onExport} type="button">
            <Icon name="download" /> Ekspor Excel
          </button>
          <button className="btn primary justify-center" onClick={() => { setSelectedLetter(null); setNotice(null); setShowForm(true); }} type="button">
            <Icon name="plus" /> Catat Distribusi
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="field flex-1 min-w-[220px]">
          <Icon name="search" />
          <input
            placeholder="Cari nomor, tujuan, perihal, kurir, atau penerima..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full text-xs"
          />
        </div>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
          {(['ALL', 'PENDING', 'DONE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              className={`px-2.5 py-1.5 rounded text-xs border font-medium cursor-pointer text-center ${
                status === st ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => { setStatus(st); setPage(1); }}
            >
              {st === 'ALL' ? `Semua (${suratKeluar.length})` : st === 'PENDING' ? `Belum (${suratKeluar.length - tercatat})` : `Tercatat (${tercatat})`}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="p-2.5 m-3 rounded text-xs border bg-emerald-50 border-emerald-200 text-emerald-900 font-medium">
          {notice}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">Tidak ada surat keluar yang cocok dengan kriteria pencarian.</div>
      ) : (
        <DistributionTable
          letters={paged}
          records={records}
          onSelect={(letter) => { setSelectedLetter(letter); setNotice(null); setShowForm(true); }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border-t border-slate-200 text-xs text-slate-600 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <span>Menampilkan {paged.length > 0 ? (curPage - 1) * pageSize + 1 : 0} - {Math.min(curPage * pageSize, filtered.length)} dari {filtered.length} surat keluar</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 cursor-pointer"
          >
            {[10, 15, 25, 50].map((n) => (<option key={n} value={n}>{n} baris</option>))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button
            type="button"
            disabled={curPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn outline"
          >
            Sebelumnya
          </button>
          <span className="px-2 font-medium text-slate-700 whitespace-nowrap">{curPage} / {totalPages}</span>
          <button
            type="button"
            disabled={curPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn outline"
          >
            Berikutnya
          </button>
        </div>
      </div>

      {showForm && (
        <ExpeditionFormModal
          letter={selectedLetter}
          initial={selectedLetter?.rawId ? records[selectedLetter.rawId] : undefined}
          onClose={() => { setShowForm(false); setSelectedLetter(null); }}
          onSaved={async () => {
            await refreshRecords();
            setNotice('Catatan distribusi ekspedisi berhasil disimpan ke TiDB.');
          }}
        />
      )}

      {showInfo && <ExpeditionInfoModal tercatat={tercatat} total={suratKeluar.length} onClose={() => setShowInfo(false)} />}
    </section>
  );
}
