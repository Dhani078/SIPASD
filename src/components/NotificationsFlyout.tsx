'use client';

import Icon, { type IconName } from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  read: number[];
  setRead: React.Dispatch<React.SetStateAction<number[]>>;
  onSelect: (letter: LetterRecord) => void;
  onExport: () => void;
  onClose: () => void;
}

const ITEMS: { text: string; icon: IconName; time: string }[] = [
  { text: 'Surat kilat prioritas membutuhkan disposisi pimpinan', icon: 'shield', time: '2 menit yang lalu' },
  { text: 'Indeks naskah fisik surat masuk baru diperbarui', icon: 'file', time: '3 menit yang lalu' },
  { text: 'Laporan register buku agenda dinas siap diunduh', icon: 'download', time: '4 menit yang lalu' },
];

export default function NotificationsFlyout({
  letters,
  read,
  setRead,
  onSelect,
  onExport,
  onClose,
}: Props) {
  const unreadCount = 3 - read.length;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[0.5px] sm:bg-transparent"
        onClick={onClose}
        role="presentation"
      />
      <dialog open className="notifications z-50 m-0 border-0 bg-white" aria-label="Notifikasi Kedinasan">
        <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h3>Notifikasi</h3>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                {unreadCount} baru
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Semua dibaca</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 cursor-pointer p-0 border-none bg-transparent hover:bg-transparent w-auto"
              onClick={() => setRead([0, 1, 2])}
            >
              Tandai dibaca
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {ITEMS.map((item, i) => {
            const isUnread = !read.includes(i);
            return (
              <button
                key={item.text}
                type="button"
                className={`flex items-start gap-3 w-full p-3 text-left transition-colors cursor-pointer min-h-[48px] ${
                  isUnread ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'bg-white hover:bg-slate-50'
                }`}
                onClick={() => {
                  setRead((r) => (r.includes(i) ? r : [...r, i]));
                  onClose();
                  if (i === 2) {
                    onExport();
                  } else {
                    onSelect(letters.find((l) => l.type === 'Kilat') ?? letters[0]);
                  }
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUnread ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon name={item.icon} size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 leading-snug">{item.text}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.time}</p>
                </div>
                {isUnread && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1.5" />}
              </button>
            );
          })}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            className="w-full text-xs font-semibold text-emerald-800 hover:text-emerald-900 justify-center inline-flex items-center gap-1.5 cursor-pointer py-1 bg-transparent hover:bg-transparent border-none"
            onClick={() => {
              onClose();
              if (letters[0]) onSelect(letters[0]);
            }}
          >
            <span>Buka Berkas Arsip Terbaru</span>
            <Icon name="arrow" size={12} />
          </button>
        </div>
      </dialog>
    </>
  );
}
