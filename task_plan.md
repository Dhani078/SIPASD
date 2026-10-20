# TASK PLAN: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)

## Goal
Membangun aplikasi sistem informasi persuratan dan disposisi berbasis web responsif (Next.js 15, TypeScript, Tailwind CSS, TiDB Serverless, Cloudflare R2) untuk Sekretariat Dispora Provinsi Kalimantan Selatan, lengkap dengan migrasi 420 berkas PDF riil dan keselarasan dokumen Laporan Magang UNISKA.

## Current Phase
Phase 1: Dokumen Spesifikasi, Arsitektur & State Awal (In Progress -> Complete)

---

## Phases

### [x] Phase 1: Dokumen Spesifikasi, Arsitektur & State Awal
- [x] Susun `README.md` berstandar instansi Pemprov Kalsel & UNISKA.
- [x] Susun `AGENT.md` direktif autonomous agent loop & zero-slop.
- [x] Susun `SPEC.md` spesifikasi teknis Spec-Driven Development.
- [x] Susun `task_plan.md`, `findings.md`, `progress.md`.
- [x] Susun dokumentasi pelengkap di `docs/`:
  - [x] `docs/HANDOFF.md`
  - [x] `docs/DATABASE_SCHEMA.md`
  - [x] `docs/API_ROUTES.md`
  - [x] `docs/LAPORAN_MAGANG_MAPPING.md`
- [x] Siapkan konfigurasi repositori GitHub:
  - [x] `.github/workflows/ci.yml`
  - [x] `.github/ISSUE_TEMPLATE/`
  - [x] `.github/PULL_REQUEST_TEMPLATE.md`
  - [x] `.github/dependabot.yml`
  - [x] `CONTRIBUTING.md`
  - [x] `CHANGELOG.md`
- *Status: Complete*

### [ ] Phase 2: Inisialisasi Proyek & Basis Data (TiDB / Prisma)
- [ ] Inisialisasi package.json Next.js 15 + TypeScript + Tailwind CSS.
- [ ] Buat skema Prisma (`prisma/schema.prisma`) untuk tabel users, surat_masuk, surat_keluar, disposisi, klasifikasi_surat, bidang_dispora, audit_logs.
- [ ] Buat modul database client singleton (`src/lib/db.ts`).
- [ ] Buat seeder data dinas (`prisma/seed.ts`): akun pejabat (Kadis, Sekr, PPTK, Bendahara, TU) & kode dinas baku Kalsel.
- *Status: Pending*

### [ ] Phase 3: Modul Autentikasi & RBAC 4 Tingkat
- [ ] Buat modul hashing password (bcrypt) & sesi terenkripsi (Jose / JWT HttpOnly cookie).
- [ ] Buat middleware rute (`middleware.ts`) untuk proteksi akses Admin, Pimpinan, TU, dan Bidang.
- [ ] Buat antarmuka Login (`src/app/(auth)/login/page.tsx`) dengan tombol akun cepat pengujian.
- *Status: Pending*

### [ ] Phase 4: Modul Surat Masuk & Integrasi PDF Viewer
- [ ] Buat halaman daftar surat masuk dengan fitur pencarian, filter sifat surat, dan paginasi.
- [ ] Buat formulir rekam surat masuk baru + validasi Zod.
- [ ] Buat komponen PDF Streaming Viewer bawaan browser (membaca 171 PDF Surat Masuk).
- [ ] Buat fitur cetak Lembar Disposisi standar Pemprov Kalsel (tampilan siap cetak A4/F4).
- *Status: Pending*

### [ ] Phase 5: Modul Disposisi Elektronik Berjenjang
- [ ] Buat modal form disposisi khusus pimpinan (instruksi standar Kadis + catatan).
- [ ] Buat alur distribusi ke bidang terkait (Sekretariat, Pora, Prestasi, Pemuda, Sapras).
- [ ] Buat antarmuka dashboard tindak lanjut untuk akun Kepala Bidang / Seksi.
- [ ] Buat indikator batas waktu dan penanda terlambat (*overdue*).
- *Status: Pending*

### [ ] Phase 6: Modul Surat Keluar, Auto-Numbering & Ekspedisi
- [ ] Buat generator nomor surat otomatis anti-nomor dobel per bidang.
- [ ] Buat formulir pencatatan surat keluar + unggah berkas PDF bertanda tangan (249 PDF Surat Keluar).
- [ ] Buat modul Buku Ekspedisi digital untuk pencatatan tanda terima kurir.
- *Status: Pending*

### [ ] Phase 7: Dashboard Eksekutif, Analitik & Ekspor Laporan
- [ ] Bangun komponen kartu KPI (Volume surat, disposisi aktif, overdues).
- [ ] Bangun grafik tren bulanan & grafik beban kerja bidang (Chart.js / SVG).
- [ ] Buat fitur ekspor Buku Agenda Surat Masuk & Keluar ke format Microsoft Excel (.xlsx).
- *Status: Pending*

### [ ] Phase 8: Batch Importer 420 Berkas PDF & Verifikasi Akhir
- [ ] Buat script importer otomatis membaca 171 file PDF Surat Masuk dan 249 file PDF Surat Keluar.
- [ ] Jalankan audit pengujian antarmuka mobile (375px/390px) dan desktop (1440px).
- [ ] Verifikasi seluruh alur blackbox testing untuk Bab IV Laporan Magang.
- *Status: Pending*

---

## Key Decisions
1. **Pemberian Nama**: Menggunakan akronim **SIPASD** (*Sistem Informasi Pengelolaan Arsip dan Surat Dispora*) karena formal, mencerminkan gaya SIPD, unik (0 bentrok pencarian Google), dan relevan 100% dengan kebutuhan kantor Dispora Kalsel.
2. **Arsitektur Penyimpanan**: Menggunakan TiDB Cloud Serverless untuk metadata relasional berkapasitas besar dan Cloudflare R2 untuk penyimpanan 420+ file scan PDF tanpa biaya egress.
3. **Modul Dokumen**: Menyusun seluruh dokumen Markdown (`.md`) dan standar GitHub terlebih dahulu agar arsitektur dan state kerja terdokumentasi rapi sebelum penulisan kode fungsional.
