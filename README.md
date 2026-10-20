# SIPASD — Sistem Informasi Pengelolaan Arsip dan Surat Dispora
**Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan**  
*Klasifikasi: Rekayasa Perangkat Lunak Web Responsif — Kerja Praktik / Magang Teknik Informatika UNISKA Semester 7*

[![CI Status](https://github.com/Dhani078/SIPASD/actions/workflows/ci.yml/badge.svg)](https://github.com/Dhani078/SIPASD/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js 15](https://img.shields.io/badge/Framework-Next.js%2015-black.svg)](https://nextjs.org/)
[![Database: TiDB Serverless](https://img.shields.io/badge/Database-TiDB%20Serverless-blue.svg)](https://tidb.cloud/)
[![Storage: Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-orange.svg)](https://cloudflare.com/)

---

## 🏛️ Latar Belakang & Profil Instansi
Aplikasi **SIPASD** dirancang untuk mendigitalkan dan mengotomasi seluruh alur tata kelola persuratan dinas di lingkungan **Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan** (Jalan Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70249).

Pada sistem konvensional, pencatatan surat masuk dan surat keluar masih mengandalkan buku agenda fisik dan lemari ordner manual. Hal ini menimbulkan sejumlah kendala operasional:
1. Pencarian arsip fisik surat memakan waktu **15–30 menit** per berkas.
2. Disposisi pimpinan (Kepala Dinas / Sekretaris) rentan mandek di meja tanpa transparansi status tindak lanjut bidang.
3. Terjadinya nomor surat ganda (*duplikasi penomoran*) akibat permintaan nomor keluar secara bersamaan dari berbagai subbagian.
4. Risiko kerusakan fisik atau kehilangan berkas penting dokumen negara.

**SIPASD** mengintegrasikan 420+ dokumen riil (171 Surat Masuk dan 249 Surat Keluar TA 2026) langsung ke dalam basis data cloud dan penyimpanan objek terenkripsi, memangkas waktu temu-kembali informasi menjadi **< 2 detik**.

---

## 👥 Matriks Hak Akses Pengguna (RBAC 4 Tingkat)

| Role | Identitas Akun | Peruntukan Jabatan | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | Administrator IT Dispora | Kelola akun pegawai, master kode dinas, konfigurasi sistem, dan pemantauan audit trail. |
| **Pimpinan** | `kadis` / `sekretaris` | Kepala Dinas / Sekretaris Dinas | Penelaahan surat masuk, penerbitan lembar disposisi digital, dan pemantauan dashboard eksekutif. |
| **Petugas Agenda** | `tu_umum` | Staf Subbag Umum & Kepegawaian | Perekaman surat masuk/keluar, booking nomor surat keluar otomatis, cetak buku ekspedisi & agenda. |
| **Bidang / Seksi** | `kabid_pora` / `kabid_prestasi` / `kabid_pemuda` / `subbag_keuangan` | Kepala Bidang / Kasubbag | Penerimaan disposisi surat masuk, pengunggahan progres tindak lanjut, dan unduh berkas lampiran. |

---

## 🚀 Fitur Utama Sistem

### 1. Modul Buku Agenda Surat Masuk Digital
- Perekaman metadata lengkap: No. Agenda (otomatis), No. Surat Dinas, Tanggal Surat, Tanggal Diterima, Asal Instansi Pengirim, Perihal, Ringkasan Isi, dan Sifat Surat (*Biasa, Penting, Segera, Amat Segera/Kilat*).
- Tautan langsung ke berkas scan PDF (Cloudflare R2 Storage).
- Pratinjau langsung PDF di layar peramban (*built-in streaming PDF viewer*).
- Cetak Lembar Disposisi standar Pemprov Kalsel siap tempel di map berkas fisik.

### 2. Modul Disposisi Elektronik Berjenjang
- Alur disposisi formal: `Pimpinan (Kadis/Sekr) -> Kepala Bidang -> Staf Pelaksana`.
- Pilihan instruksi resmi: *Tindak lanjuti, Pelajari/Telaah, Hadiri/Wakili, Fasilitasi, Koordinasikan, Siapkan Bahan/Draft, Arsipkan*.
- Pelacakan status real-time: `Menunggu Telaah` -> `Didisposisikan` -> `Sedang Diproses` -> `Selesai`.
- Batas waktu penyelesaian (*due date*) dengan indikator peringatan keterlambatan (*overdue badge*).

### 3. Modul Surat Keluar & Registrasi Penomoran Otomatis
- **Anti-Nomor Dobel**: Generator nomor surat dinas terintegrasi per subbagian/bidang.
  * Format baku: `[KodeKlasifikasi]/[NoUrut]-Sekr/DISPORA/[Tahun]`
- Klasifikasi kode urusan dinas standar Permendagri / Pergub Kalsel (misal: `426` Keolahragaan, `005` Undangan, `800` Kepegawaian).
- Buku Ekspedisi Digital: Rekam tanggal kirim, instansi tujuan, dan tanda terima kurir internal.

### 4. Dashboard Eksekutif & Statistik Interaktif
- Kartu KPI: Total Surat Masuk, Surat Keluar, Disposisi Aktif, Disposisi Selesai.
- Grafik volume surat bulanan (Januari - Desember).
- Diagram distribusi beban disposisi antar bidang.
- Daftar 5 instansi pengirim paling aktif bersurat ke Dispora Kalsel.
- Notifikasi surat kategori *Segera / Kilat* yang belum ditindaklanjuti.

### 5. Keamanan & Kepatuhan Standar (OWASP Top 10)
- **Prepared Statements**: Seluruh kueri basis data 100% menggunakan parameter binding anti SQL Injection.
- **XSS Sanitization**: Penyaringan ketat entitas teks input pengguna.
- **CSRF Protection**: Token kriptografi acak pada setiap mutasi data formulir.
- **Anti Directory Traversal**: Validasi ketat nama file dan akses berkas PDF.
- **Audit Trail Terperinci**: Pencatatan riwayat setiap aksi pengguna (Login, Buka PDF, Unduh Berkas, Mutasi Data) di tabel `audit_logs`.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Frontend & Fullstack Framework**: Next.js 15 (App Router, React 19, TypeScript).
- **Styling & Desain**: Tailwind CSS v4 (Sistem Desain Modern, Responsif Mobile & Desktop).
- **Basis Data**: TiDB Cloud Serverless (MySQL Compatible, SSL Terenkripsi, Skalabilitas Tinggi).
- **Penyimpanan Berkas**: Cloudflare R2 (S3-Compatible Object Storage, Zero Egress Fee).
- **Deployment**: Vercel Edge Network (Global CDN, HTTPS Otomatis).

---

## 📦 Struktur Proyek

```
SIPASD/
├── .github/
│   ├── workflows/ci.yml             # Workflow CI GitHub Actions (Lint, Test, Typecheck)
│   ├── ISSUE_TEMPLATE/              # Templat Pelaporan Masalah & Fitur
│   ├── PULL_REQUEST_TEMPLATE.md     # Standar Pengajuan Pull Request
│   └── dependabot.yml               # Otomasi Pembaruan Dependensi
├── docs/
│   ├── HANDOFF.md                   # Panduan Operasional & Status Sesi Agen
│   ├── DATABASE_SCHEMA.md           # Kamus Data & Relasi ERD
│   ├── API_ROUTES.md                # Spesifikasi Endpoint & Server Actions
│   └── LAPORAN_MAGANG_MAPPING.md    # Pemetaan Sistem ke Bab I-V Laporan Magang
├── AGENT.md                         # Direktif Eksekusi Otomatis AI Agent
├── SPEC.md                          # Dokumen Spesifikasi Resmi (Spec-Driven Dev)
├── CHANGELOG.md                     # Riwayat Perubahan (Keep a Changelog standard)
├── CONTRIBUTING.md                  # Panduan Kontribusi & Konvensi Git
├── task_plan.md                     # File Perencanaan Tugas Bertahap
├── findings.md                      # Hasil Riset & Analisis Berkas Riil 420 PDF
├── progress.md                      # Catatan Log Progres Sesi Aktif
└── README.md                        # Dokumentasi Utama Sistem
```

---

## 💻 Panduan Menjalankan Sistem Lokal

### Prasyarat
- Node.js versi 20.x atau terbaru
- Manajer paket `npm` atau `pnpm`
- Git

### Langkah Instalasi
1. Kloning repositori:
   ```bash
   git clone https://github.com/Dhani078/SIPASD.git
   cd SIPASD
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Konfigurasi berkas lingkungan `.env.local`:
   ```env
   DATABASE_URL="mysql://<user>:<password>@<tidb_host>:4000/sipasd?sslaccept=strict"
   R2_ACCOUNT_ID="your_account_id"
   R2_ACCESS_KEY_ID="your_access_key"
   R2_SECRET_ACCESS_KEY="your_secret_key"
   R2_BUCKET_NAME="sipasd-files"
   NEXTAUTH_SECRET="your_generated_secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Jalankan migrasi dan seeder database:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
6. Buka peramban pada alamat `http://localhost:3000`.

---

## 👤 Pengembang & Hak Cipta
- **Penyusun**: Muhammad Rizki Ramadhani (NPM: 2310010406)
- **Program Studi**: S1 Teknik Informatika — Fakultas Teknologi Informasi
- **Perguruan Tinggi**: Universitas Islam Kalimantan (UNISKA) Muhammad Arsyad Al Banjari Banjarmasin
- **Lokasi Magang**: Subbagian Keuangan & Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan
- **Tahun**: 2026
