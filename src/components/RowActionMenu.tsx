'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  onSelect: (letter: LetterRecord) => void;
  onPrint?: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
  onDelete?: (letter: LetterRecord) => void;
  onDownload: (letter: LetterRecord, e: React.MouseEvent) => void;
  compact?: boolean;
}

export default function RowActionMenu({
  letter,
  onSelect,
  onPrint,
  onEdit,
  onDelete,
  onDownload,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={menuRef}>
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
        <Icon name="eye" size={13} />
        <span>Lihat</span>
      </button>

      {!compact && (
        <button
          type="button"
          className="table-action-btn action-more"
          aria-label={`Menu aksi ${letter.id}`}
          title="Menu Aksi Lainnya"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <Icon name="more" size={14} />
        </button>
      )}

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          onKeyDown={(_e) => _e.stopPropagation()}
          onClick={(_e) => _e.stopPropagation()}
        >
          {onPrint && (
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              onClick={() => {
                setOpen(false);
                onPrint(letter);
              }}
            >
              <span className="text-slate-500"><Icon name="print" size={14} /></span>
              <span>Cetak Lembar Disposisi</span>
            </button>
          )}

          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
            onClick={(e) => {
              setOpen(false);
              onDownload(letter, e);
            }}
          >
            <span className="text-teal-600"><Icon name="download" size={14} /></span>
            <span>Unduh Berkas Asli (PDF)</span>
          </button>

          {onEdit && (
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              onClick={() => {
                setOpen(false);
                onEdit(letter);
              }}
            >
              <span className="text-amber-600"><Icon name="edit" size={14} /></span>
              <span>Ubah Metadata Arsip</span>
            </button>
          )}

          {onDelete && (
            <>
              <div className="border-t border-slate-100 my-1" />
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer font-medium"
                onClick={() => {
                  setOpen(false);
                  onDelete(letter);
                }}
              >
                <span className="text-rose-600"><Icon name="trash" size={14} /></span>
                <span>Hapus Berkas dari Sistem</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
