'use client';

import Icon from './Icon';
import Badge from './Badge';
import Pagination from './Pagination';
import { shortDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  compact?: boolean;
  selectedId?: string;
  selectedIds?: string[];
  onSelect: (letter: LetterRecord) => void;
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
  const a = document.createElement('a');
  a.href = letter.fileUrl ? `/api/pdf?url=${encodeURIComponent(letter.fileUrl)}` : '/placeholder-surat.pdf';
  a.download = `${letter.id.replace(/\/(SM|SK)\/.*$/i, '')}.pdf`;
  a.target = '_blank';
  a.click();
}

export default function ArchiveTable({
  letters,
  compact = false,
  selectedId,
  selectedIds = [],
  onSelect,
  onToggleSelect,
  onToggleAll,
  onPrint,
  onEdit,
  onDelete,
  page = 1,
  onPage,
}: Props) {
  const pages = Math.max(1, Math.ceil(letters.length / 15)), current = Math.min(page, pages);
  const visible = letters.slice(compact ? 0 : (current - 1) * 15, compact ? 5 : current * 15);
  const visibleIds = visible.map((l) => l.id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someChecked = visibleIds.some((id) => selectedIds.includes(id)) && !allChecked;

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
              <th scope="col">NO. AGENDA</th>
              <th scope="col">ASAL / TUJUAN INSTANSI DAN PERIHAL</th>
              <th scope="col">
                TANGGAL <Icon name="down" size={11} />
              </th>
              <th scope="col">SIFAT</th>
              <th scope="col" style={{ textAlign: 'right', paddingRight: '16px' }}>
                AKSI DOKUMEN
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
                    <td style={{ textAlign: 'center' }}>
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
                    <b className="mono agenda">
                      {letter.id}
                      <span>/{letter.direction === 'in' ? 'SM' : 'SK'}/2026</span>
                    </b>
                  </td>
                  <td>
                    <b>{letter.origin}</b>
                    <p title={letter.subject}>{letter.subject}</p>
                    {!compact && <small className="mono">{letter.number}</small>}
                  </td>
                  <td className="mono date-cell">{shortDate(letter.date)}</td>
                  <td>
                    <Badge type={letter.type} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button" className="table-action-btn action-view"
                        aria-label={`Buka PDF ${letter.id}`} title={`Buka Dokumen PDF ${letter.id}`}
                        onClick={(e) => { e.stopPropagation(); onSelect(letter); }}
                      >
                        <Icon name="eye" size={14} />
                        <span>Lihat PDF</span>
                      </button>
                      {!compact && onPrint && (
                        <button
                          type="button" className="table-action-btn action-print"
                          aria-label={`Cetak Disposisi ${letter.id}`} title={`Cetak Lembar Disposisi ${letter.id}`}
                          onClick={(e) => { e.stopPropagation(); onPrint(letter); }}
                        >
                          <Icon name="print" size={14} />
                          <span>Disposisi</span>
                        </button>
                      )}
                      {!compact && (
                        <button
                          type="button" className="table-action-btn action-download p-1.5"
                          aria-label={`Unduh berkas PDF ${letter.id}`} title={`Unduh Berkas Asli ${letter.id}`}
                          onClick={(e) => downloadPdf(letter, e)}
                        >
                          <Icon name="download" size={14} />
                        </button>
                      )}
                      {!compact && onEdit && (
                        <button
                          type="button" className="table-action-btn action-edit p-1.5"
                          aria-label={`Edit ${letter.id}`} title={`Edit Metadata Arsip ${letter.id}`}
                          onClick={(e) => { e.stopPropagation(); onEdit(letter); }}
                        >
                          <Icon name="edit" size={13} />
                        </button>
                      )}
                      {!compact && onDelete && (
                        <button
                          type="button" className="table-action-btn action-delete p-1.5"
                          aria-label={`Hapus Arsip ${letter.id}`} title={`Hapus Arsip ${letter.id}`}
                          onClick={(e) => { e.stopPropagation(); onDelete(letter); }}
                        >
                          <Icon name="close" size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <div className="empty">
            Tidak ada arsip yang sesuai dengan filter. Ubah atau hapus filter untuk melihat arsip lainnya.
          </div>
        )}
      </div>
      {!compact && onPage && (
        <Pagination current={current} total={pages} totalItems={letters.length} onPage={onPage} />
      )}
    </>
  );
}