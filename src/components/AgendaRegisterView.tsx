'use client';

import { useState, useMemo } from 'react';
import Icon from './Icon';
import Badge from './Badge';
import YearFilterControl from './YearFilterControl';
import { monthsList } from '@/data/constants';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  onSelect: (letter: LetterRecord) => void;
  onPrint?: (letter: LetterRecord) => void;
  onExport: () => void;
}

export default function AgendaRegisterView({ letters, onSelect, onExport }: Props) {
  const [search, setSearch] = useState('');
  const [dir, setDir] = useState<'ALL' | 'in' | 'out'>('ALL');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);

  const filtered = useMemo(() => letters.filter((l) => {
    if (dir !== 'ALL' && l.direction !== dir) return false;
    if (year && (l.date ? l.date.slice(0, 4) : '2026') !== year) return false;
    if (month && l.date && l.date.slice(5, 7) !== month) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.id.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) || (l.number && l.number.toLowerCase().includes(q));
    }
    return true;
  }), [letters, dir, year, month, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const curPage = Math.min(page, totalPages);
  const paginated = useMemo(() => filtered.slice((curPage - 1) * size, curPage * size), [filtered, curPage, size]);

  const hasFilter = Boolean(search || dir !== 'ALL' || year || month);
  const resetFilters = () => { setSearch(''); setDir('ALL'); setYear(''); setMonth(''); setPage(1); };
  const inCount = useMemo(() => letters.filter((l) => l.direction === 'in').length, [letters]);
  const outCount = useMemo(() => letters.filter((l) => l.direction === 'out').length, [letters]);

  return (
    <section className="panel">
      <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2>Register Buku Agenda Surat</h2>
            <span className="small-count">{filtered.length} Naskah</span>
          </div>
          <p>Rekapitulasi resmi seluruh register surat masuk dan keluar Dispora Kalsel</p>
        </div>
        <button className="btn outline w-full sm:w-auto justify-center" onClick={onExport} type="button">
          <Icon name="download" /> Ekspor Excel (.xlsx)
        </button>
      </div>

      <div className="p-4 space-y-3 border-b border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3">
          <div className="field flex-1 min-w-[240px]">
            <Icon name="search" />
            <input
              placeholder="Cari nomor agenda, nomor surat, instansi, atau perihal..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
            {(['ALL', 'in', 'out'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => { setDir(key); setPage(1); }}
                className={`px-3 py-1.5 rounded text-xs border font-medium transition-colors cursor-pointer text-center ${
                  dir === key ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {key === 'ALL' ? `Semua (${letters.length})` : key === 'in' ? `Masuk (${inCount})` : `Keluar (${outCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="archive-filter-row flex flex-wrap gap-2 text-xs">
          <YearFilterControl value={year} onChange={(y) => { setYear(y); setPage(1); }} />
          <select
            aria-label="Filter bulan agenda"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(1); }}
            className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700"
          >
            <option value="">Semua Bulan</option>
            {monthsList.map(([code, label]) => (<option value={code} key={code}>Bulan {label}</option>))}
          </select>
          <span className="text-slate-500 self-center ml-2">{filtered.length} arsip cocok</span>
          {hasFilter && (
            <button type="button" className="text-btn text-xs text-emerald-800 hover:text-emerald-900 font-medium ml-auto inline-flex items-center gap-1 cursor-pointer" onClick={resetFilters}>
              <Icon name="close" size={13} /> Hapus Filter
            </button>
          )}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>NO. AGENDA</th>
              <th style={{ width: '37%' }}>ASAL / TUJUAN INSTANSI DAN PERIHAL</th>
              <th style={{ width: '18%' }}>NOMOR NASKAH DINAS</th>
              <th style={{ width: '16%' }}>TANGGAL</th>
              <th style={{ width: '14%', textAlign: 'right', paddingRight: '14px' }}>SIFAT &amp; JENIS</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((letter) => (
              <tr key={letter.id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onSelect(letter)}>
                <td>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${letter.direction === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {letter.direction === 'in' ? 'SM' : 'SK'}
                    </span>
                    <b className="mono text-emerald-900 text-xs font-bold">{letter.id}</b>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 mono">TA {letter.date ? letter.date.slice(0, 4) : '2026'}</span>
                </td>
                <td>
                  <b className="text-slate-900 font-semibold">{letter.origin}</b>
                  <p title={letter.subject} className="text-slate-700 text-xs mt-0.5">{letter.subject}</p>
                </td>
                <td><span className="mono text-slate-600 text-[11px] block">{letter.number || '-'}</span></td>
                <td><span className="mono text-slate-800 text-xs font-medium whitespace-nowrap">{letter.date ? formatDate(letter.date) : '-'}</span></td>
                <td style={{ textAlign: 'right', paddingRight: '14px' }}><Badge type={letter.type} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>Menampilkan {paginated.length > 0 ? (curPage - 1) * size + 1 : 0} - {Math.min(curPage * size, filtered.length)} dari {filtered.length} naskah</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }} className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 cursor-pointer">
            {[10, 15, 25, 50].map((n) => (<option key={n} value={n}>{n} baris</option>))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn outline" disabled={curPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Sebelumnya</button>
          <span className="text-xs font-medium text-slate-700 px-2">{curPage} / {totalPages}</span>
          <button type="button" className="btn outline" disabled={curPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Berikutnya</button>
        </div>
      </div>
    </section>
  );
}
