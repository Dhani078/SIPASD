'use client';

import Icon from './Icon';
import { formatDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

export interface ExpeditionRecord {
  id: string;
  surat_keluar_id: string;
  tanggal_kirim: string;
  kurir_pengirim: string;
  penerima_nama: string;
  penerima_telepon: string | null;
  catatan_ekspedisi: string | null;
}

interface Props {
  letters: LetterRecord[];
  records: Record<string, ExpeditionRecord>;
  onSelect: (letter: LetterRecord) => void;
}

export default function DistributionTable({ letters, records, onSelect }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col" style={{ width: '14%' }}>NO. AGENDA</th>
            <th scope="col" style={{ width: '40%' }}>TUJUAN INSTANSI &amp; PERIHAL</th>
            <th scope="col" style={{ width: '15%' }}>TANGGAL</th>
            <th scope="col" style={{ width: '16%' }}>STATUS &amp; KURIR</th>
            <th scope="col" style={{ width: '15%' }}>PENERIMA</th>
            <th scope="col" style={{ width: '72px', minWidth: '72px', textAlign: 'right', paddingRight: '14px' }}>AKSI</th>
          </tr>
        </thead>
        <tbody>
          {letters.map((letter) => {
            const rec = letter.rawId ? records[letter.rawId] : undefined;
            return (
              <tr key={letter.id} className="hover:bg-slate-50 transition-colors">
                <td>
                  <b className="mono text-emerald-800 text-xs font-bold block">
                    {letter.id} <span className="font-normal text-slate-400 text-[11px]">/SK/{letter.date ? letter.date.slice(0, 4) : '2026'}</span>
                  </b>
                </td>
                <td>
                  <b className="text-slate-900 font-semibold">{letter.origin}</b>
                  <p title={letter.subject} className="text-slate-700 text-xs mt-0.5">{letter.subject}</p>
                </td>
                <td className="text-xs text-slate-700 font-medium whitespace-nowrap">{formatDate(letter.date)}</td>
                <td>
                  {rec ? (
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Kurir: {rec.kurir_pengirim}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{formatDate(rec.tanggal_kirim)}</span>
                    </div>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      Belum dicatat
                    </span>
                  )}
                </td>
                <td>
                  {rec ? (
                    <span className="text-xs text-slate-800 font-medium">
                      {rec.penerima_nama} {rec.penerima_telepon ? `(${rec.penerima_telepon})` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">Belum ada</span>
                  )}
                </td>
                <td style={{ textAlign: 'right', paddingRight: '14px' }}>
                  <button
                    type="button"
                    className="table-action-btn action-view inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 cursor-pointer font-medium"
                    onClick={() => onSelect(letter)}
                  >
                    <Icon name={rec ? 'edit' : 'plus'} size={13} />
                    <span>{rec ? 'Ubah' : 'Catat'}</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
