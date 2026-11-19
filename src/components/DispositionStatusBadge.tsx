'use client';

import type { LetterRecord } from '@/types';

export default function DispositionStatusBadge({ letter }: { letter: LetterRecord }) {
  if (letter.direction === 'out') {
    return (
      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
        {letter.division || 'Sekretariat'}
      </span>
    );
  }

  const st = letter.disposition?.status || 'BELUM_DIPROSES';
  const inst = letter.disposition?.instructions?.[0];
  const isPending = st === 'BELUM_DIPROSES' || inst === 'Diterima Persuratan';
  const isProcess = st === 'PROSES' || inst === 'Kepala Dinas';

  return (
    <div className="flex flex-col gap-0.5 items-start">
      {isPending ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>Diterima Persuratan</span>
        </span>
      ) : isProcess ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Kepala Dinas</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Selesai</span>
        </span>
      )}
      {letter.division && (
        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]" title={letter.division}>
          ke: {letter.division}
        </span>
      )}
    </div>
  );
}
