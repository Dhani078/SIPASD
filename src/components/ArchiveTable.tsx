'use client';

import Icon from './Icon';
import Badge from './Badge';
import { shortDate } from '@/lib/format';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  compact?: boolean;
  selectedId?: string;
  onSelect: (letter: LetterRecord) => void;
  onPrint?: (letter: LetterRecord) => void;
  onDelete?: (letter: LetterRecord) => void;
  page?: number;
  onPage?: (page: number) => void;
}

export default function ArchiveTable({
  letters,
  compact = false,
  selectedId,
  onSelect,
  onPrint,
  onDelete,
  page = 1,
  onPage,
}: Props) {
  const pages = Math.max(1, Math.ceil(letters.length / 15));
  const current = Math.min(page, pages);
  const visible = letters.slice(
    compact ? 0 : (current - 1) * 15,
    compact ? 5 : current * 15
  );

  return (
    <>
      <div className="table-wrap">
        <table aria-label={compact ? 'Surat terbaru' : 'Daftar arsip surat'}>
          <thead>
            <tr>
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
            {visible.map((letter) => (
              <tr
                key={letter.id}
                className={selectedId === letter.id ? 'selected' : ''}
                tabIndex={0}
                aria-label={`Buka surat ${letter.id}: ${letter.subject}`}
                onClick={() => onSelect(letter)}
                onKeyDown={(e) => {
                  if (
                    e.target === e.currentTarget &&
                    (e.key === 'Enter' || e.key === ' ')
                  ) {
                    e.preventDefault();
                    onSelect(letter);
                  }
                }}
              >
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
                      type="button"
                      className="table-action-btn action-view"
                      aria-label={`Buka PDF ${letter.id}`}
                      title={`Buka Dokumen PDF ${letter.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(letter);
                      }}
                    >
                      <Icon name="eye" size={15} />
                      {!compact && <span>Lihat PDF</span>}
                    </button>
                    {!compact && onPrint && (
                      <button
                        type="button"
                        className="table-action-btn action-print"
                        aria-label={`Cetak Disposisi ${letter.id}`}
                        title={`Cetak Lembar Disposisi ${letter.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrint(letter);
                        }}
                      >
                        <Icon name="print" size={14} />
                        <span>Disposisi</span>
                      </button>
                    )}
                    {!compact && onDelete && (
                      <button
                        type="button"
                        className="table-action-btn action-delete"
                        aria-label={`Hapus Arsip ${letter.id}`}
                        title={`Hapus Arsip ${letter.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(letter);
                        }}
                      >
                        <Icon name="close" size={13} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <div className="empty">
            Tidak ada arsip yang sesuai dengan filter. Ubah atau hapus filter
            untuk melihat arsip lainnya.
          </div>
        )}
      </div>
      {!compact && onPage && (
        <div className="pagination">
          <span>
            Menampilkan {letters.length ? (current - 1) * 15 + 1 : 0} -{' '}
            {Math.min(current * 15, letters.length)} dari {letters.length} arsip
          </span>
          <div className="page-btns">
            <button
              disabled={current <= 1}
              onClick={() => onPage(current - 1)}
              aria-label="Halaman sebelumnya"
            >
              Sebelumnya
            </button>
            <span className="mono">
              {current} / {pages}
            </span>
            <button
              disabled={current >= pages}
              onClick={() => onPage(current + 1)}
              aria-label="Halaman berikutnya"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </>
  );
}
