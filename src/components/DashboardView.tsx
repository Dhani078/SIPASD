'use client';

import { useState } from 'react';
import Icon, { type IconName } from './Icon';
import ArchiveTable from './ArchiveTable';
import CorrespondenceChart from './CorrespondenceChart';
import { venues, divisions } from '@/data/constants';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  go: (page: string) => void;
  setFilter: (filter: string) => void;
  setModal: (modal: string) => void;
  exportData: () => void;
  onSelect: (letter: LetterRecord) => void;
  onVenue: (venue: string) => void;
  onDivision: (division: string) => void;
}

export default function DashboardView({
  letters,
  go,
  setFilter,
  setModal,
  exportData,
  onSelect,
  onVenue,
  onDivision,
}: Props) {
  const [year, setYear] = useState('2026');
  const active = year === 'Semua' ? letters : letters.filter((l) => l.date.startsWith(year));
  const incoming = active.filter((l) => l.direction === 'in').length;
  const urgent = active.filter((l) => ['Kilat', 'Segera'].includes(l.type)).length;
  const stats: [IconName, string, number, string, string][] = [
    ['in', 'Surat Masuk', incoming, 'dokumen', 'green'],
    ['out', 'Surat Keluar', active.length - incoming, 'dokumen', 'gold'],
    ['file', 'Total Dokumen Digital', active.length, 'berkas', 'blue'],
    ['clock', 'Sifat Kilat & Segera', urgent, 'berkas', 'red'],
  ];

  let offset = 0;
  const counts = divisions.map((d) => active.filter((l) => l.division === d).length);
  const colors = ['#146c51', '#51977e', '#98bbaa', '#d6ab61', '#e4d3ae'];
  const segments = counts.map((count, i) => {
    const start = offset;
    offset += active.length ? (count / active.length) * 100 : 0;
    return `${colors[i]} ${start}% ${offset}%`;
  });

  return (
    <>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Tahun:</span>
          <div className="flex gap-1">
            {['Semua', '2026', '2025', '2024'].map((y) => (
              <button key={y} type="button" className={`btn py-0.5 px-2.5 text-xs ${year === y ? 'primary' : 'outline'}`} onClick={() => setYear(y)}>
                {y === 'Semua' ? 'Semua Tahun' : `TA ${y}`}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-500">{active.length} arsip {year === 'Semua' ? 'seluruh periode' : `TA ${year}`}</span>
      </div>

      <section className="metrics">
        {stats.map(([icon, title, total, unit, color], i) => (
          <button className={`metric ${color}`} key={title} onClick={() => { go(i === 1 ? 'out' : 'in'); if (i === 3) setFilter('Urgent'); }}>
            <div className="metric-top">
              <span className={`metric-icon ${color}`}><Icon name={icon} size={19} /></span>
              <span>{title}</span>
              <Icon name="chevron" size={14} />
            </div>
            <div className="metric-value">
              {total}<small>{unit}</small>
              {i === 3 && <span className="urgent-dot" />}
            </div>
            <div className="metric-foot">
              <b>{i === 2 ? '100%' : i === 3 ? 'Prioritas' : year === 'Semua' ? 'Semua TA' : `TA ${year}`}</b>
              <span>{i === 2 ? 'terindeks TiDB' : i === 3 ? 'perlu tindak lanjut' : 'arsip dinas'}</span>
            </div>
            <div className="mini-bars">
              {[3, 5, 4, 7, 5, 8, 6, 9, 7, 10, 9, 12].map((n, j) => (<i key={j} style={{ height: n * 2 }} />))}
            </div>
          </button>
        ))}
      </section>

      <div className="dashboard-columns">
        <div className="primary-column">
          <CorrespondenceChart letters={active} onExport={exportData} selectedYear={year} />
          <section className="panel recent-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Surat Terbaru
                  <span className="small-count">{Math.min(5, letters.length)}</span>
                </h2>
                <p>Arsip terbaru yang memerlukan perhatian Anda</p>
              </div>
              <button className="text-btn" onClick={() => go('in')}>
                Lihat semua
                <Icon name="arrow" size={15} />
              </button>
            </div>
            <ArchiveTable letters={letters.slice(0, 5)} compact onSelect={onSelect} />
            <div className="table-bottom">
              <Icon name="shield" size={13} />
              <span>TiDB Cloud Serverless Live</span>
              <span className="mono">{letters.length} arsip terindeks</span>
            </div>
          </section>
        </div>

        <div className="secondary-column">
          <section className="panel workload">
            <div className="panel-heading">
              <div>
                <h2>Distribusi per Bidang</h2>
                <p>Beban persuratan unit kerja</p>
              </div>
              <button className="icon-btn" aria-label="Rincian distribusi" onClick={() => go('distribution')}>
                <Icon name="chevron" size={16} />
              </button>
            </div>
            <div
              className="donut"
              style={{ background: `conic-gradient(${segments.join(',')})` }}
              role="img"
              aria-label={`Distribusi ${letters.length} berkas di lima bidang`}
            >
              <div>
                <strong>{letters.length}</strong>
                <span>Total berkas</span>
              </div>
            </div>
            <div className="division-list">
              {divisions.map((division, i) => (
                <button key={division} onClick={() => onDivision(division)}>
                  <i className={`division-dot d${i}`} />
                  <span>{division}</span>
                  <b className="mono">{counts[i]}</b>
                  <small>{letters.length ? Math.round((counts[i] / letters.length) * 100) : 0}%</small>
                </button>
              ))}
            </div>
          </section>

          <section className="panel venue-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  <Icon name="pin" size={17} />
                  Venue Olahraga
                </h2>
                <p>Filter arsip berdasarkan lokasi</p>
              </div>
              <span className="small-count">11</span>
            </div>
            <div className="venue-chips">
              {venues.map((venue) => (
                <button key={venue} onClick={() => onVenue(venue)}>
                  <Icon name="pin" size={12} />
                  {venue}
                </button>
              ))}
            </div>
          </section>

          <div className="help-panel">
            <span className="help-icon">
              <Icon name="file" size={20} />
            </span>
            <div>
              <h3>Butuh panduan persuratan?</h3>
              <p>Pelajari alur indeks dan disposisi.</p>
              <button onClick={() => setModal('sop')}>
                Buka Panduan SOP
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
