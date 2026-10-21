import { DemoUser } from '@/types';

export const demoUsers: DemoUser[] = [
  {
    username: 'admin',
    name: 'Administrator IT Dispora',
    role: 'Super Admin',
    label: 'Super Admin',
    initials: 'AD',
  },
  {
    username: 'kadis',
    name: 'Pebriadin Hapiz, AP, M.Si',
    role: 'Kepala Dinas / Pengguna Anggaran',
    label: 'Kadispora',
    initials: 'PH',
  },
  {
    username: 'tu_umum',
    name: 'Staf Agenda TU Dispora',
    role: 'Petugas TU Umum',
    label: 'Petugas TU',
    initials: 'TU',
  },
  {
    username: 'subbag_keuangan',
    name: 'Norika Fajriana, SH, MH',
    role: 'Kasubbag Keuangan',
    label: 'Kasubbag Keuangan',
    initials: 'NF',
  },
  {
    username: 'kabid_pora',
    name: 'Budiono, S.Pd, M.AP',
    role: 'Kabid Pembudayaan Olahraga',
    label: 'Kabid Pora',
    initials: 'BO',
  },
];

export const DEMO_PASSWORD = 'Dispora2026!';
