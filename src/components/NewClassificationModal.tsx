'use client';

import { useState } from 'react';
import Modal from './Modal';
import Icon from './Icon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdded: (newItem: { code: string; title: string; desc: string; scope: string }) => void;
}

export default function NewClassificationModal({ isOpen, onClose, onAdded }: Props) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [scope, setScope] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim() || !title.trim()) {
      setError('Kode dan nama klasifikasi wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/classification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kode: code.trim(),
          nama_klasifikasi: title.trim(),
          uraian: desc.trim() || `${title.trim()} lingkungan Dispora Kalsel`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menambahkan klasifikasi.');
      }

      onAdded({
        code: code.trim(),
        title: title.trim(),
        desc: desc.trim() || `${title.trim()} lingkungan Dispora Kalsel`,
        scope: scope.trim() || 'Tata naskah kedinasan Dispora Prov. Kalimantan Selatan.',
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Tambah Kode Klasifikasi Arsip Baru" onClose={onClose} className="max-w-xl">
      <form onSubmit={handleSubmit}>
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <span className="text-red-500 shrink-0">
                <Icon name="close" size={14} />
              </span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label htmlFor="cls-code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kode Klasifikasi <span className="text-red-500">*</span>
              </label>
              <input
                id="cls-code"
                type="text"
                required
                placeholder="Contoh: 428"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                maxLength={10}
              />
              <p className="text-[10px] text-slate-400 mt-1">3 digit angka baku</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="cls-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama / Judul Klasifikasi <span className="text-red-500">*</span>
              </label>
              <input
                id="cls-title"
                type="text"
                required
                placeholder="Contoh: Kewirausahaan Pemuda & Inkubasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Urusan persuratan Dispora</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="cls-desc" className="block text-xs font-semibold text-slate-700">
                Uraian / Deskripsi Ringkas
              </label>
              <span className="text-[11px] text-slate-400">Cakupan Naskah Dinas</span>
            </div>
            <textarea
              id="cls-desc"
              rows={2}
              placeholder="Uraikan jenis naskah dinas atau urusan yang dicakup dalam kode klasifikasi ini..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="cls-scope" className="block text-xs font-semibold text-slate-700">
                Ruang Lingkup Kegiatan Dispora
              </label>
              <span className="text-[11px] text-slate-400">Sub-Kegiatan Teknis</span>
            </div>
            <input
              id="cls-scope"
              type="text"
              placeholder="Contoh: Pelatihan wirausaha muda, sentra bisnis, kemitraan pemuda..."
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg shadow-sm placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/80 text-emerald-950 border border-emerald-200 text-xs flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="shield" size={12} />
            </div>
            <div>
              <span className="font-semibold block mb-0.5">Sinkronisasi Basis Data TiDB</span>
              <span className="text-emerald-800 text-[11px] leading-relaxed">
                Hanya akun Developer dan akun Rana (Pengelola Arsip) yang berwenang menambah kode klasifikasi permanen.
              </span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Icon name="shield" size={13} /> Standar SPBE Pemprov Kalsel
          </span>
          <button
            type="button"
            className="btn outline"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name="plus" size={13} />
            )}
            <span>{loading ? 'Menyimpan ke TiDB...' : 'Simpan Klasifikasi'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
