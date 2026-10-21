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
}: {
  drawer: boolean;
  page: string;
  go: (page: string) => void;
  user: DemoUser;
  counts: Record<'in' | 'out', number>;
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
        <div className="user-card">
          <div className="avatar">
            {user.initials}
            <span />
          </div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
          <button
            className="icon-btn"
            title="Keluar"
            onClick={() => go('login')}
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
