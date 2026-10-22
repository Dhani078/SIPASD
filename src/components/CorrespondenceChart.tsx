'use client';

import { useState } from 'react';
import type { LetterRecord } from '@/types';

export default function CorrespondenceChart({
  letters,
  onExport,
  selectedYear = '2026',
}: {
  letters: LetterRecord[];
  onExport: () => void;
  selectedYear?: string;
}) {
  const [period, setPeriod] = useState(1);
  const [hover, setHover] = useState<number | null>(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const groups = Array.from({ length: 12 / period }, (_, i) => {
    const records = letters.filter(
      (l) => Math.floor((Number(l.date.slice(5, 7)) - 1) / period) === i
    );
    return {
      label:
        period === 1
          ? months[i]
          : period === 3
          ? `TW ${i + 1}`
          : `Semester ${i + 1}`,
      incoming: records.filter((l) => l.direction === 'in').length,
      outgoing: records.filter((l) => l.direction === 'out').length,
    };
  });

  const max = Math.max(4, ...groups.flatMap((g) => [g.incoming, g.outgoing]));
  const limit = Math.ceil(max / 4) * 4;

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <h2>Aktivitas Persuratan</h2>
          <p>Distribusi arsip kedinasan riil {selectedYear === 'Semua' ? 'seluruh periode' : `TA ${selectedYear}`}</p>
        </div>
        <select
          aria-label="Periode grafik"
          value={period}
          onChange={(e) => {
            setPeriod(Number(e.target.value));
            setHover(null);
          }}
        >
          <option value={1}>Bulanan</option>
          <option value={3}>Triwulanan</option>
          <option value={6}>Semesteran</option>
        </select>
      </div>
      <div className="chart-legend">
        <span>
          <i className="green-key" />
          Surat Masuk
        </span>
        <span>
          <i className="gold-key" />
          Surat Keluar
        </span>
        <span className="chart-year">{selectedYear === 'Semua' ? 'Semua TA' : `TA ${selectedYear}`}</span>
      </div>
      <div className="bar-chart">
        <div className="y-labels">
          {[4, 3, 2, 1, 0].map((v) => (
            <span key={v}>{(limit * v) / 4}</span>
          ))}
        </div>
        <div className="chart-plot">
          <div className="grid-lines">
            {[0, 1, 2, 3, 4].map((v) => (
              <i key={v} />
            ))}
          </div>
          <div className="bars">
            {groups.map((g, i) => (
              <button
                key={g.label}
                className={`bar-group ${
                  g.incoming + g.outgoing ? 'current' : 'future'
                }`}
                aria-label={`${g.label}: ${g.incoming} surat masuk, ${g.outgoing} surat keluar`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                onClick={() => setHover(hover === i ? null : i)}
              >
                <div className="bar-pair">
                  <i
                    style={{
                      height: `${Math.max(1, (g.incoming / limit) * 100)}%`,
                    }}
                  />
                  <i
                    style={{
                      height: `${Math.max(1, (g.outgoing / limit) * 100)}%`,
                    }}
                  />
                </div>
                <span>{g.label}</span>
                {hover === i && (
                  <div role="tooltip" className="chart-tooltip">
                    <b>{g.label} 2026</b>
                    <div>Masuk: {g.incoming}</div>
                    <div>Keluar: {g.outgoing}</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
