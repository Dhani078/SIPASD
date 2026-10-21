'use client';

import { useState } from 'react';
import Icon from './Icon';
import Crest from './Crest';
import { demoUsers, DEMO_PASSWORD } from '@/data/users';
import type { DemoUser } from '@/types';

export default function LoginPage({
  onLoginSuccess,
  onBack,
}: {
  onLoginSuccess: (user: DemoUser) => void;
  onBack: () => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitLogin = async (usr: string, pwd: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, password: pwd }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Kredensial tidak valid');
        setLoading(false);
        return;
      }
      const matched = demoUsers.find((u) => u.username === usr) || {
        username: data.user.username,
        name: data.user.namaLengkap,
        role: data.user.jabatan,
        label: data.user.role,
        initials: data.user.namaLengkap.slice(0, 2).toUpperCase(),
      };
      onLoginSuccess(matched);
    } catch {
      setError('Koneksi database terganggu. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="back-link" onClick={onBack}>
        &larr; Kembali ke portal publik
      </button>
      <div className="login-card">
        <div className="login-brand">
          <Crest />
          <span className="eyebrow">
            PEMERINTAH PROVINSI KALIMANTAN SELATAN
          </span>
          <h1>
            SIPASD<span>.</span>
          </h1>
          <h2>
            Arsip tertata.
            <br />
            Pelayanan prima.
          </h2>
          <p>
            Sistem Informasi Pengelolaan Arsip Surat
            <br />
            Dinas Kepemudaan dan Olahraga
          </p>
          <div className="login-security">
            <span>
              <Icon name="shield" />
              Akses kedinasan berbasis peran (RBAC)
            </span>
            <span>
              <Icon name="file" />
              TiDB Serverless &amp; Cloudinary Storage
            </span>
          </div>
          <small>PORTAL KEDINASAN - TA 2026</small>
        </div>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitLogin(username.trim(), password);
          }}
        >
          <div className="eyebrow">AKSES TERBATAS KEDINASAN</div>
          <h2>Masuk ke Akun Kedinasan</h2>
          <p>Gunakan NIP atau username resmi yang terdaftar.</p>

          <label htmlFor="login-user">Username / NIP</label>
          <div className="field">
            <Icon name="users" />
            <input
              id="login-user"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username atau NIP"
            />
            <button
              className="icon-btn"
              type="button"
              aria-label="Hapus username"
              onClick={() => setUsername('')}
            >
              <Icon name="close" size={15} />
            </button>
          </div>

          <label htmlFor="login-password">Kata Sandi</label>
          <div className="field">
            <Icon name="shield" />
            <input
              id="login-password"
              autoComplete="current-password"
              type={show ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
            />
            <button
              className="icon-btn"
              type="button"
              aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              onClick={() => setShow(!show)}
            >
              <Icon name="eye" />
            </button>
          </div>

          <label className="remember">
            <input type="checkbox" defaultChecked /> Ingat sesi kerja pada peramban ini
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button disabled={loading} className="btn primary login-submit">
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            <Icon name="arrow" />
          </button>

          <div className="demo-label">
            AKUN RESMI DISPORA - 1 KLIK UJI PERAN
          </div>
          <div className="tester">
            {demoUsers.map((user) => (
              <button
                key={user.username}
                disabled={loading}
                className={username === user.username ? 'active' : ''}
                type="button"
                onClick={() => {
                  setUsername(user.username);
                  setPassword(DEMO_PASSWORD);
                  submitLogin(user.username, DEMO_PASSWORD);
                }}
              >
                {user.label}
              </button>
            ))}
          </div>
          <small className="demo-note">
            Terhubung langsung ke TiDB Cloud Serverless 8 tabel relasional.
          </small>
        </form>
      </div>
      <small>
        (c) 2026 Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan
      </small>
    </div>
  );
}
