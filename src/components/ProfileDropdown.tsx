'use client';

import Icon from './Icon';
import type { DemoUser } from '@/types';

interface Props {
  user: DemoUser;
  onClose: () => void;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

function formatNip(nip?: string) {
  if (!nip || nip === '-') return '-';
  const c = nip.replace(/\s+/g, '');
  return c.length === 18 ? `${c.slice(0, 8)} ${c.slice(8, 14)} ${c.slice(14, 15)} ${c.slice(15)}` : c;
}

export default function ProfileDropdown({ user, onClose, onNavigate, onLogout }: Props) {
  return (
    <div
      className="profile-flyout absolute right-6 top-[58px] w-80 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-3 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
      role="menu"
      aria-label="Menu Profil Pengguna"
    >
      <div className="flex items-center gap-3 p-2 bg-emerald-50/70 border border-emerald-100 rounded-md mb-2">
        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-xs text-emerald-950 truncate">{user.name}</p>
          <p className="text-[10px] text-emerald-800 truncate">{user.role}</p>
          <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded">
            {user.label}
          </span>
        </div>
      </div>

      <div className="space-y-1 py-1 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex justify-between px-2 py-0.5">
          <span className="text-slate-400">NIP / ID:</span>
          <span className="font-mono text-slate-700">{formatNip(user.nip)}</span>
        </div>
        <div className="flex justify-between px-2 py-0.5">
          <span className="text-slate-400">Unit Kerja:</span>
          <span className="text-slate-700 font-medium truncate max-w-[160px] text-right">
            {user.unitKerja || 'Dispora Kalsel'}
          </span>
        </div>
        <div className="flex justify-between px-2 py-0.5">
          <span className="text-slate-400">Status:</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Aktif Terverifikasi
          </span>
        </div>
      </div>

      <div className="pt-2 mt-1 border-t border-slate-100 space-y-1">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded transition-colors text-left"
          onClick={() => {
            onClose();
            onNavigate('profile');
          }}
        >
          <Icon name="users" size={14} />
          <span>Buka Kartu Profil Lengkap</span>
        </button>

        {(user.label === 'Super Admin' || user.label === 'Developer' || user.username === 'admin' || user.username === 'developer') && (
          <button
            type="button"
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded transition-colors text-left"
            onClick={() => {
              onClose();
              onNavigate('audit');
            }}
          >
            <Icon name="shield" size={14} />
            <span>Jejak Audit Aktivitas Sesi</span>
          </button>
        )}

        <button
          type="button"
          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded transition-colors text-left font-medium"
          onClick={() => {
            onClose();
            if (onLogout) onLogout();
            else onNavigate('login');
          }}
        >
          <Icon name="logout" size={14} />
          <span>Keluar Sesi (Logout)</span>
        </button>
      </div>
    </div>
  );
}