'use client';

import Icon from './Icon';
import Badge from './Badge';
import Pagination from './Pagination';
import RowActionMenu from './RowActionMenu';
import DispositionStatusBadge from './DispositionStatusBadge';
import { shortDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  compact?: boolean;
  selectedId?: string;
  selectedIds?: string[];
  onSelect: (letter: LetterRecord) => void;
  onSelectDisp?: (letter: LetterRecord) => void;
  onToggleSelect?: (id: string) => void;
  onToggleAll?: () => void;
  onPrint?: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onDelete?: (letter: LetterRecord) => void;
  page?: number;
  onPage?: (page: number) => void;
}

function downloadPdf(letter: LetterRecord, e: React.MouseEvent) {
  e.stopPropagation();
  const fileName = letter.fileName || `${letter.id.replace(/\/(SM|SK)\/.*$/i, '')}.pdf`;
  const a = document.createElement('a');
  a.href = letter.fileUrl ? `/api/pdf?url=${encodeURIComponent(letter.fileUrl)}&name=${encodeURIComponent(fileName)}` : '/placeholder-surat.pdf';
  a.download = fileName; a.target = '_blank'; a.click();
}

export default function ArchiveTable({
  letters, compact = false, selectedId, selectedIds = [],
  onSelect, onSelectDisp, onToggleSelect, onToggleAll,
  onPrint, onEdit, onDelete, page = 1, onPage,
}: Props) {
  const pages = Math.max(1, Math.ceil(letters.length / 15)), current = Math.min(page, pages);
  const visible = letters.slice(compact ? 0 : (current - 1) * 15, compact ? 5 : current * 15);
  const visibleIds = visible.map((l) => l.id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someChecked = visibleIds.some((id) => selectedIds.includes(id)) && !allChecked;
  const isAllOut = visible.length > 0 && visible.every((l) => l.direction === 'out');

  return (
    <>
      <div className="table-wrap">
        <table aria-label={compact ? 'Surat terbaru' : 'Daftar arsip surat'}>
          <thead>
            <tr>
              {!compact && onToggleSelect && onToggleAll && (
                <th scope="col" style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={onToggleAll}
                    aria-label="Pilih semua arsip di halaman ini"
                    title="Pilih semua arsip di halaman ini"
                  />
                </th>
              )}
              <th scope="col" style={{ minWidth: isAllOut ? '180px' : '110px' }}>
                {isAllOut ? 'NOMOR SURAT KELUAR' : 'NO. AGENDA'}
              </th>
              <th scope="col">ASAL / TUJUAN INSTANSI DAN PERIHAL</th>
              <th scope="col" style={{ minWidth: isAllOut ? '140px' : '150px' }}>
                {isAllOut ? 'BIDANG PEMRAKARSA' : 'POSISI DISPOSISI'}
              </th>
              <th scope="col" style={{ whiteSpace: 'nowrap' }}>
                TANGGAL <Icon name="down" size={11} />
              </th>
              <th scope="col">SIFAT</th>
              <th scope="col" style={{ textAlign: 'right', paddingRight: '14px', width: '72px', minWidth: '72px' }}>
                AKSI
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((letter) => {
              const isChecked = selectedIds.includes(letter.id);
              return (
                <tr
                  key={letter.id}
                  className={selectedId === letter.id ? 'selected' : ''}
                  tabIndex={0}
                  aria-label={`Buka surat ${letter.id}: ${letter.subject}`}
                  onClick={() => onSelect(letter)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSelect(letter);
                    }
                  }}
                >
                  {!compact && onToggleSelect && (
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(letter.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Pilih arsip ${letter.id}`}
                      />
                    </td>
                  )}
                  <td>
                    {letter.direction === 'out' ? (
                      <b className="mono agenda">
                        {letter.number || letter.id}
                        <span>Agenda #{letter.id}</span>
                      </b>
                    ) : (
                      <b className="mono agenda">
                        {letter.id}
                        <span>/SM/{letter.date ? letter.date.slice(0, 4) : '2026'}</span>
                      </b>
                    )}
                  </td>
                  <td>
                    <b className="text-slate-900 font-semibold">{letter.origin}</b>
                    <p title={letter.subject} className="text-slate-700 text-xs mt-0.5">{letter.subject}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {!compact && letter.direction === 'in' && (
                        <small className="mono text-[11px] text-slate-500">{letter.number}</small>
                      )}
                      {!letter.fileUrl && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300"
                          title="Arsip ini belum memiliki lampiran berkas digital (klik untuk melengkapi)"
                        >
                          <span>⚠️ Belum Ada Berkas</span>
                        </span>
                      )}
                      {letter.dispositionFileUrl && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectDisp) onSelectDisp(letter);
                            else onSelect(letter);
                          }}
                          title="Klik untuk membuka dokumen scan lembar disposisi fisik"
                        >
                          <Icon name="file" size={10} />
                          <span>Scan Disposisi (PDF)</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <DispositionStatusBadge letter={letter} />
                  </td>
                  <td className="mono date-cell">{shortDate(letter.date)}</td>
                  <td>
                    <Badge type={letter.type} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <RowActionMenu
                        letter={letter}
                        onSelect={onSelect}
                        onSelectDisp={onSelectDisp}
                        onPrint={onPrint}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDownload={downloadPdf}
                        compact={compact}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!compact && onPage && (
        <Pagination current={current} total={pages} totalItems={letters.length} onPage={onPage} />
      )}
    </>
  );
}
