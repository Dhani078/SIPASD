'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import type { LetterRecord, DemoUser } from '@/types';
import { matchesSearch } from '@/lib/format';

interface Props {
  title: string;
  user: DemoUser;
  letters: LetterRecord[];
  onSelect: (letter: LetterRecord) => void;
  onSearch: (query: string) => void;
  onMenu: () => void;
  onExport: () => void;
}

export default function TopNavbar({
  title,
  user,
  letters,
  onSelect,
  onSearch,
  onMenu,
  onExport,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const [now, setNow] = useState(new Date());
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (document.querySelector('[role="dialog"]')) return;
        input.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setNotices(false);
      }
    };
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        setNotices(false);
      }
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      clearInterval(tick);
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);

  const results = letters.filter((l) => matchesSearch(l, query)).slice(0, 5);

  return (
    <header className="topbar" ref={root}>
      <button
        className="icon-btn mobile-menu"
        aria-label="Buka navigasi"
        onClick={onMenu}
      >
        <Icon name="menu" />
      </button>
      <div className="breadcrumb">
        Workspace
        <Icon name="chevron" size={12} />
        <span>{title}</span>
      </div>
      <div className="top-actions">
        <time className="wita-clock mono" dateTime={now.toISOString()}>
          {new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Makassar',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }).format(now)}{' '}
          <small>WITA</small>
        </time>
        <button
          className="icon-btn mobile-search-toggle"
          aria-label="Buka pencarian arsip"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name="search" />
        </button>
        <div className={`global-search ${open ? 'is-open' : ''}`}>
          <Icon name="search" size={16} />
          <input
            ref={input}
            aria-label="Cari seluruh arsip"
            placeholder="Cari di seluruh arsip..."
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(query);
                setOpen(false);
              }
            }}
          />
          <kbd>Ctrl K</kbd>
          {open && query && (
            <div
              className="search-results"
              role="region"
              aria-label="Hasil pencarian"
            >
              {results.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    onSelect(l);
                    setOpen(false);
                  }}
                >
                  <Icon name="file" />
                  <span>
                    <b>
                      {l.id} - {l.origin}
                    </b>
                    <small>{l.subject}</small>
                  </span>
                </button>
              ))}
              {!results.length && <p>Arsip tidak ditemukan.</p>}
            </div>
          )}
        </div>
        <div className="header-divider" />
        <button
          className="notification icon-btn"
          aria-expanded={notices}
          aria-label={`Notifikasi, ${3 - read.length} belum dibaca`}
          onClick={() => setNotices(!notices)}
        >
          <Icon name="bell" />
          {read.length < 3 && <i />}
        </button>
        <div className="top-avatar" title={`${user.name} - ${user.role}`}>
          {user.initials}
        </div>
      </div>
      {notices && (
        <div className="notifications">
          <h3>
            Notifikasi<span>{3 - read.length} baru</span>
          </h3>
          {[
            'Surat kilat membutuhkan disposisi',
            'Indeks surat masuk diperbarui',
            'Rekap agenda siap diunduh',
          ].map((text, i) => (
            <button
              key={text}
              onClick={() => {
                setRead((r) => (r.includes(i) ? r : [...r, i]));
                setNotices(false);
                if (i === 2) onExport();
                else
                  onSelect(
                    letters.find((l) => l.type === 'Kilat') ?? letters[0]
                  );
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
      )}
    </header>
  );
}
