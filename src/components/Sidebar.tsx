'use client';

import Icon, { type IconName } from './Icon';
import Crest from './Crest';
import { groups } from '@/data/navigation';
import type { DemoUser } from '@/types';

export default function Sidebar({
  drawer,
  page,
  go,
  user,
  counts,
  onLogout,
}: {
  drawer: boolean;
  page: string;
  go: (page: string) => void;
  user: DemoUser;
  counts: Record<'in' | 'out', number>;
  onLogout?: () => void;
}) {
  return (
    <aside className={`sidebar ${drawer ? 'open' : ''}`}>
      <button className="sidebar-brand" onClick={() => go('dashboard')}>
        <Crest />
        <span>
          <strong>
            SIPASD<span className="brand-dot">.</span>
          </strong>
          <small>DISPORA PROV. KALSEL</small>
        </span>
        <span className="version">v2.0</span>
      </button>
      <div className="workspace-label">
        <span className="live-dot" /> WORKSPACE KEDINASAN{' '}
        <Icon name="down" size={13} />
      </div>
      <nav className="side-nav">
        {groups.map((g) => (
          <div className="nav-group" key={g.title}>
            <div className="nav-label">{g.title}</div>
            {g.items.map(([label, icon, id, count]) => (
              <button
                className={`nav-item ${page === id ? 'active' : ''}`}
                onClick={() => go(id)}
                key={id}
              >
                <Icon name={icon as IconName} />
                <span>{label}</span>
                {count && (
                  <span className="nav-count">
                    {id === 'in' ? counts.in : counts.out}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="portal-link" onClick={() => go('landing')}>
          <Icon name="building" size={16} />
          Portal Publik
          <Icon name="arrow" size={15} />
        </button>
        <div className="user-card hover:bg-white/5 transition-all rounded p-1 -m-1 flex items-center">
          <button
            type="button"
            className="flex items-center gap-2 min-w-0 flex-1 text-left bg-transparent border-0 p-0 text-inherit cursor-pointer"
            title="Buka Kartu Profil Pengguna"
            onClick={() => go('profile')}
          >
            <div className="avatar">
              {user.initials}
              <span />
            </div>
            <div className="min-w-0 flex-1">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </div>
          </button>
          <button
            type="button"
            className="icon-btn hover:text-red-400 transition-colors"
            title="Keluar Sesi (Logout)"
            onClick={() => {
              if (onLogout) onLogout();
              else go('login');
            }}
          >
            <Icon name="logout" size={16} />
          </button>
        </div>
        <div className="sidebar-foot">
          <Icon name="shield" size={12} /> Sistem internal pemerintah daerah
        </div>
      </div>
    </aside>
  );
}
