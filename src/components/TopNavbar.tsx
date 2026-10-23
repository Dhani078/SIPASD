'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import ProfileDropdown from './ProfileDropdown';
import NotificationsFlyout from './NotificationsFlyout';
import WitaClock from './WitaClock';
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
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export default function TopNavbar({
  title,
  user,
  letters,
  onSelect,
  onSearch,
  onMenu,
  onExport,
  onNavigate = () => {},
  onLogout,
}: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
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
        setProfileOpen(false);
      }
    };
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(false);
        setNotices(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);

  const results = letters.filter((l) => matchesSearch(l, query)).slice(0, 5);

  return (
    <header className="topbar" ref={root}>
      <button className="icon-btn mobile-menu" aria-label="Buka navigasi" onClick={onMenu}>
        <Icon name="menu" />
      </button>
      <div className="breadcrumb">
        Workspace
        <Icon name="chevron" size={12} />
        <span>{title}</span>
      </div>
      <div className="top-actions">
        <WitaClock />
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
            <section className="search-results" aria-label="Hasil pencarian">
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
                    <b>{l.id} - {l.origin}</b>
                    <small>{l.subject}</small>
                  </span>
                </button>
              ))}
              {!results.length && <p>Arsip tidak ditemukan.</p>}
            </section>
          )}
        </div>
        <div className="header-divider" />
        <button
          className="notification icon-btn"
          aria-expanded={notices}
          aria-label={`Notifikasi, ${3 - read.length} belum dibaca`}
          onClick={() => {
            setNotices(!notices);
            setProfileOpen(false);
          }}
        >
          <Icon name="bell" />
          {read.length < 3 && <i />}
        </button>

        <button
          type="button"
          className="top-avatar cursor-pointer hover:ring-2 hover:ring-emerald-600 transition-all active:scale-95"
          title={`${user.name} - ${user.role} (Klik untuk menu profil)`}
          aria-label="Profil Pengguna"
          aria-expanded={profileOpen}
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotices(false);
          }}
        >
          {user.initials}
        </button>
      </div>

      {notices && (
        <NotificationsFlyout
          letters={letters}
          read={read}
          setRead={setRead}
          onSelect={onSelect}
          onExport={onExport}
          onClose={() => setNotices(false)}
        />
      )}

      {profileOpen && (
        <ProfileDropdown
          user={user}
          onClose={() => setProfileOpen(false)}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      )}
    </header>
  );
}