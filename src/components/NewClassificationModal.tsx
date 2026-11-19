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
    <Modal title="Tambah Kode Klasifikasi Arsip Baru" onClose={onClose} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3.5 p-1">
        {error && (
          <div className="p-2.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="cls-code" className="block text-[11px] font-semibold text-slate-700 mb-1">
              Kode Klasifikasi <span className="text-red-500">*</span>
            </label>
            <input
              id="cls-code"
              type="text"
              required
              placeholder="Contoh: 428"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-xs font-mono font-bold"
              maxLength={10}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="cls-title" className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nama / Judul Klasifikasi <span className="text-red-500">*</span>
            </label>
            <input
              id="cls-title"
              type="text"
              required
              placeholder="Contoh: Kewirausahaan Pemuda"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-semibold"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cls-desc" className="block text-[11px] font-semibold text-slate-700 mb-1">
            Uraian / Deskripsi Ringkas
          </label>
          <textarea
            id="cls-desc"
            rows={2}
            placeholder="Uraikan jenis naskah atau urusan yang masuk ke kode klasifikasi ini..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div>
          <label htmlFor="cls-scope" className="block text-[11px] font-semibold text-slate-700 mb-1">
            Ruang Lingkup Kegiatan
          </label>
          <input
            id="cls-scope"
            type="text"
            placeholder="Contoh: Pelatihan wirausaha muda, inkubasi bisnis..."
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        <div className="p-2.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] flex items-center gap-2">
          <span className="shrink-0 text-emerald-700">
            <Icon name="shield" size={14} />
          </span>
          <span>Otorisasi khusus: Hanya akun Developer dan akun Rana (Pengelola Arsip) yang berwenang.</span>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            {loading ? (
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name="plus" size={12} />
            )}
            <span>{loading ? 'Menyimpan...' : 'Simpan Klasifikasi'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
