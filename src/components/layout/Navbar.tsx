'use client';

import React from 'react';
import { UserSession } from '@/types';
import { LogOut, User, Shield, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  user: UserSession;
  onToggleSidebar?: () => void;
}

export function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'PIMPINAN': return 'Pimpinan';
      case 'PETUGAS_ARSIP': return 'Petugas Arsip (TU)';
      case 'BIDANG': return 'Bidang / Seksi';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-800 text-white font-bold text-sm shadow-sm">
            SP
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none sm:text-base">
              SIPASD DISPORA
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Provinsi Kalimantan Selatan
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-800 leading-tight">
            {user.namaLengkap}
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">
            {getRoleLabel(user.role)} • {user.unitKerja}
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <button
            onClick={handleLogout}
            title="Keluar dari sistem"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
