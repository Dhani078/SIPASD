import React from 'react';
import clsx from 'clsx';
import { SifatSurat } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    warning: 'bg-amber-50 text-amber-700 border-amber-300',
    danger: 'bg-red-50 text-red-700 border-red-300 font-bold',
    info: 'bg-blue-50 text-blue-700 border-blue-300',
    gold: 'bg-amber-100 text-amber-800 border-amber-400 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SifatBadge({ sifat }: { sifat: SifatSurat }) {
  if (sifat === 'KILAT') {
    return <Badge variant="danger" className="animate-pulse">⚡ KILAT</Badge>;
  }
  if (sifat === 'SEGERA') {
    return <Badge variant="warning">⏳ SEGERA</Badge>;
  }
  if (sifat === 'PENTING') {
    return <Badge variant="info">📌 PENTING</Badge>;
  }
  return <Badge variant="default">BIASA</Badge>;
}
