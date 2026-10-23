'use client';

import Icon from './Icon';
import type { LetterRecord } from '@/types';

interface Props {
  letters: LetterRecord[];
  read: number[];
  setRead: React.Dispatch<React.SetStateAction<number[]>>;
  onSelect: (letter: LetterRecord) => void;
  onExport: () => void;
  onClose: () => void;
}

const ITEMS = [
  'Surat kilat membutuhkan disposisi',
  'Indeks surat masuk diperbarui',
  'Rekap agenda siap diunduh',
];

export default function NotificationsFlyout({
  letters,
  read,
  setRead,
  onSelect,
  onExport,
  onClose,
}: Props) {
  return (
    <div className="notifications">
      <h3>
        Notifikasi<span>{3 - read.length} baru</span>
      </h3>
      {ITEMS.map((text, i) => (
        <button
          key={text}
          type="button"
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
          <Icon name={i === 2 ? 'chart' : 'in'} />
          <span>
            {text}
            <small>{i + 2} menit yang lalu</small>
          </span>
          {!read.includes(i) && <span className="live-dot" />}
        </button>
      ))}
    </div>
  );
}