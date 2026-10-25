'use client';

import { useEffect, useState, useMemo } from 'react';
import Icon from './Icon';
import type { DemoUser } from '@/types';

interface AuditLogItem {
  id: number;
  action: string;
  ip_address: string;
  user_agent: string | null;
  created_at: string;
  username: string;
  nama_lengkap: string;
  role: string;
}

interface Props {
  currentUser: DemoUser;
}

function parseDevice(ua: string | null): string {
  if (!ua) return 'Perangkat Tidak Dikenal';
  if (ua.includes('Windows')) return 'Windows Desktop';
  if (ua.includes('Macintosh')) return 'Mac Desktop';
  if (ua.includes('Android')) return 'Android Mobile';
  if (ua.includes('iPhone')) return 'iOS Mobile';
  if (ua.includes('Linux')) return 'Linux System';
  return 'Desktop Web';
}

function formatWita(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }) + ' WITA';
}

export default function AuditTrailView({ currentUser: _currentUser }: Props) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(15);

  useEffect(() => {
    let ignore = false;
    fetch('/api/audit')
      .then((r) => r.json())
      .then((d) => {
        if (!ignore && d?.success && Array.isArray(d.logs)) {
          setLogs(d.logs);
        }
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const filtered = useMemo(() => logs.filter((l) => {
    if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return l.action.toLowerCase().includes(q) || l.ip_address.includes(q) ||
        l.username.toLowerCase().includes(q) || l.nama_lengkap.toLowerCase().includes(q);
    }
    return true;
  }), [logs, actionFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const curPage = Math.min(page, totalPages);
  const paged = filtered.slice((curPage - 1) * size, curPage * size);

  const exportCsv = () => {
    const rows = [['ID', 'Timestamp (WITA)', 'Action', 'Username', 'Nama Aparatur', 'IP Address', 'User Agent']];
    for (const l of filtered) {
      rows.push([String(l.id), formatWita(l.created_at), l.action, l.username, l.nama_lengkap, l.ip_address, l.user_agent || '']);
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((x) => `"${x.replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `audit_trail_dispora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="panel">
      <div className="panel-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2>Jejak Forensik Audit Trail</h2>
            <span className="small-count">{filtered.length} Catatan</span>
          </div>
          <p>Rekam jejak forensik keamanan, integritas sesi aparatur, dan log aktivitas SPBE Dispora Kalsel</p>
        </div>
        <button className="btn outline w-full sm:w-auto justify-center" onClick={exportCsv} type="button">
          <Icon name="download" /> Ekspor Log (.csv)
        </button>
      </div>

      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="field flex-1 min-w-[220px]">
          <Icon name="search" />
          <input
            placeholder="Cari aksi, alamat IP, nama aparatur, atau username..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="w-full text-xs"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 w-full sm:w-auto">
          {(['ALL', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT'] as const).map((act) => (
            <button
              key={act}
              type="button"
              className={`px-2.5 py-1.5 rounded text-xs border font-medium cursor-pointer text-center ${
                actionFilter === act ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => { setActionFilter(act); setPage(1); }}
            >
              {act === 'ALL' ? 'Semua Log' : act === 'LOGIN_SUCCESS' ? 'Sukses Masuk' : act === 'LOGIN_FAILED' ? 'Gagal Masuk' : 'Keluar Sesi'}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '18%' }}>TIMESTAMP (WITA)</th>
              <th style={{ width: '16%' }}>EVENT / AKSI</th>
              <th style={{ width: '22%' }}>APARATUR / PENGGUNA</th>
              <th style={{ width: '16%' }}>ALAMAT IP</th>
              <th style={{ width: '28%' }}>PERANGKAT &amp; USER AGENT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">Memuat rekaman log forensik dari TiDB Cloud...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">Tidak ada rekam jejak audit yang sesuai dengan filter pencarian.</td></tr>
            ) : (
              paged.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="mono text-xs text-slate-700 whitespace-nowrap">{formatWita(log.created_at)}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                      log.action === 'LOGIN_SUCCESS'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : log.action === 'LOGIN_FAILED'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${log.action === 'LOGIN_SUCCESS' ? 'bg-emerald-600' : log.action === 'LOGIN_FAILED' ? 'bg-rose-600' : 'bg-slate-500'}`} />
                      {log.action === 'LOGIN_SUCCESS' ? 'LOGIN SUCCESS' : log.action === 'LOGIN_FAILED' ? 'LOGIN FAILED' : log.action}
                    </span>
                  </td>
                  <td>
                    <b className="text-slate-900 text-xs block font-semibold">{log.nama_lengkap}</b>
                    <span className="mono text-[11px] text-slate-500">@{log.username} &bull; {log.role}</span>
                  </td>
                  <td><code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono">{log.ip_address}</code></td>
                  <td>
                    <span className="text-xs text-slate-800 font-medium block">{parseDevice(log.user_agent)}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-xs" title={log.user_agent || ''}>{log.user_agent || '-'}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 border-t border-slate-200 text-xs text-slate-600 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <span>Menampilkan {paged.length > 0 ? (curPage - 1) * size + 1 : 0} - {Math.min(curPage * size, filtered.length)} dari {filtered.length} log</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }} className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-700 cursor-pointer">
            {[10, 15, 25, 50].map((n) => (<option key={n} value={n}>{n} baris</option>))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          <button type="button" disabled={curPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn outline">Sebelumnya</button>
          <span className="px-2 font-medium text-slate-700 whitespace-nowrap">{curPage} / {totalPages}</span>
          <button type="button" disabled={curPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="btn outline">Berikutnya</button>
        </div>
      </div>
    </section>
  );
}
