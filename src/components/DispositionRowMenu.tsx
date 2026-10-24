'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letter: LetterRecord;
  onSelect: (letter: LetterRecord) => void;
  onEdit?: (letter: LetterRecord) => void;
}

export default function DispositionRowMenu({ letter, onSelect, onEdit }: Props) {
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
    <div className="relative inline-flex items-center justify-end" ref={menuRef}>
      <button
        type="button"
        className="table-action-btn action-more"
        aria-label={`Menu aksi ${letter.id}`}
        title={`Aksi untuk Disposisi ${letter.id}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <Icon name="more" size={15} />
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          onKeyDown={(_e) => _e.stopPropagation()}
          onClick={(_e) => _e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 hover:bg-slate-50 text-left transition-colors cursor-pointer font-medium"
            onClick={() => {
              setOpen(false);
              onSelect(letter);
            }}
          >
            <span className="text-emerald-700"><Icon name="eye" size={14} /></span>
            <span>Detail Disposisi</span>
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
              <span>Ubah Disposisi</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
