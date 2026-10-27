'use client';

import { useState, useMemo } from 'react';
import Icon from './Icon';
import Modal from './Modal';
import { demoUsers } from '@/data/users';
import type { DemoUser } from '@/types';

interface Props {
  currentUser: DemoUser;
  onNavigate: (page: string) => void;
}

function formatNip(nip?: string): string {
  if (!nip) return '-';
  return nip.length === 18 ? `${nip.slice(0, 8)} ${nip.slice(8, 14)} ${nip.slice(14, 15)} ${nip.slice(15)}` : `ID: ${nip}`;
}

export default function UsersManagementView({ currentUser }: Props) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);

  const isDev = currentUser.username === 'developer' || currentUser.label === 'Developer';

  const filtered = useMemo(() => demoUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.label !== roleFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) ||
        (isDev && u.nip && u.nip.includes(q)) || u.role.toLowerCase().includes(q) ||
        (u.unitKerja && u.unitKerja.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
    }
    return true;
  }), [query, roleFilter, isDev]);

  const roles = useMemo(() => Array.from(new Set(demoUsers.map((u) => u.label))), []);

  return (
    <div className="space-y-4">
      <section className="panel">
        <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2>Manajemen Akun Terdaftar</h2>
              <span className="small-count">{filtered.length} Akun</span>
            </div>
            <p>Otorisasi akses, hak peran kedinasan, dan data aparatur pengelola arsip Dispora Kalsel</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            <Icon name="shield" size={13} /> RBAC SPBE Aktif
          </span>
        </div>

        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="field flex-1 min-w-[220px]">
            <Icon name="search" />
            <input
              placeholder="Cari nama, NIP, username, jabatan, atau unit..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full text-xs"
            />
            {query && (<button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 text-xs">Reset</button>)}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              aria-label="Filter peran pengguna"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-700 w-full sm:w-auto cursor-pointer"
            >
              <option value="ALL">Semua Peran Kedinasan</option>
              {roles.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
            {roleFilter !== 'ALL' && (<button type="button" onClick={() => setRoleFilter('ALL')} className="text-emerald-800 hover:text-emerald-900 text-xs font-medium">Reset</button>)}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((account) => {
            const isMe = account.username === currentUser.username;
            return (
              <div key={account.username} className="account-row p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="top-avatar shrink-0 mt-0.5">{account.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-slate-900 text-sm font-semibold">{account.name}</b>
                      {isMe && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Sesi Anda</span>}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{account.role} &bull; <span className="font-medium text-slate-500">{account.unitKerja}</span></p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                      {isDev && <span className="mono text-emerald-800 font-medium">NIP: {formatNip(account.nip)}</span>}
                      <span className="mono">@{account.username}</span>
                      {account.email && <span className="text-slate-400">{account.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                  <span className={`badge ${account.label === 'Developer' ? 'kilat' : account.label === 'Super Admin' || account.label === 'Pengelola Arsip Digital' ? 'penting' : 'biasa'}`}>{account.label}</span>
                  <button type="button" onClick={() => setSelectedUser(account)} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer">
                    Rincian
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedUser && (
        <Modal title="Rincian Otorisasi Aparatur" onClose={() => setSelectedUser(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="top-avatar">{selectedUser.initials}</div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500">@{selectedUser.username}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs border-y border-slate-100 py-3">
              {isDev && (
                <div className="flex justify-between py-1"><span className="text-slate-500">NIP BKN:</span><span className="mono font-semibold text-slate-800">{formatNip(selectedUser.nip)}</span></div>
              )}
              <div className="flex justify-between py-1"><span className="text-slate-500">Jabatan:</span><span className="font-medium text-slate-800 text-right">{selectedUser.role}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Unit Kerja:</span><span className="font-medium text-slate-800">{selectedUser.unitKerja}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Email Kedinasan:</span><span className="font-medium text-emerald-800">{selectedUser.email || '-'}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Otorisasi:</span><span className="font-bold text-slate-900">{selectedUser.label}</span></div>
              <div className="flex justify-between py-1"><span className="text-slate-500">Status Akun:</span><span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Aktif Terverifikasi</span></div>
            </div>
            <div className="flex justify-end pt-1"><button type="button" className="btn primary text-xs" onClick={() => setSelectedUser(null)}>Tutup</button></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
