# TASK PLAN: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)

## Goal
Membangun aplikasi sistem informasi persuratan dan disposisi berbasis web responsif (Next.js 15, TypeScript, Tailwind CSS, TiDB Serverless, Cloudflare R2) untuk Sekretariat Dispora Provinsi Kalimantan Selatan, lengkap dengan migrasi 420 berkas PDF riil dan naskah lengkap Laporan Magang Bab I - Bab V UNISKA.

## Current Phase
Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik (100% COMPLETE - MAXX MODE)

---

## Phases

### [x] Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik
- [x] Susun `README.md` berstandar instansi Pemprov Kalsel & UNISKA.
- [x] Susun `AGENT.md` direktif autonomous agent loop & zero-slop.
- [x] Susun `SPEC.md` spesifikasi teknis Spec-Driven Development.
- [x] Susun `task_plan.md`, `findings.md`, `progress.md`.
- [x] Susun dokumentasi teknis di `docs/`:
  - [x] `docs/HANDOFF.md` (Panduan operasional sesi)
  - [x] `docs/DATABASE_SCHEMA.md` (ERD, Kamus Data & DDL SQL TiDB)
  - [x] `docs/API_ROUTES.md` (Spesifikasi Server Actions & Route Handlers)
  - [x] `docs/UML_DIAGRAMS.md` (Use Case, Activity, Sequence, Class Diagram + PlantUML)
  - [x] `docs/SECURITY_AUDIT.md` (Matriks mitigasi kerentanan OWASP Top 10)
  - [x] `docs/SOP_KEDINASAN.md` (Standar Operasional Prosedur 5 alur dinas)
  - [x] `docs/SKRIPSI_UPGRADE_ROADMAP.md` (Blueprint peningkatan ke Skripsi S1)
  - [x] `docs/UI_UX_DESIGN_TOKENS.md` (Palet warna dinas, tipografi, 0 overflow mobile)
  - [x] `docs/DEPLOYMENT_GUIDE.md` (Zero-cost runbook: Vercel, TiDB, Cloudflare R2)
  - [x] `docs/IMPORT_MIGRATION_GUIDE.md` (Skrip ekstraksi 420 berkas riil PDF ke SQL)
- [x] Susun draf lengkap naskah Laporan Magang (UNISKA Ready):
  - [x] `docs/BAB_1_PENDAHULUAN_DRAFT.md` (Latar Belakang, Rumusan, Batasan, Tujuan, Manfaat)
  - [x] `docs/BAB_2_PROFIL_INSTANSI_DRAFT.md` (Dasar hukum, Visi Misi, Tupoksi, 11 Venue Olahraga)
  - [x] `docs/BAB_3_ANALISIS_PERANCANGAN_DRAFT.md` (Alur manual, PIECES, FURPS, UML, ERD 3NF)
  - [x] `docs/BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md` (Env spek, screenshot layout, 15 Blackbox tests)
  - [x] `docs/BAB_5_PENUTUP_DRAFT.md` (Kesimpulan tuntas & saran praktis/akademis)
  - [x] `docs/DAFTAR_PUSTAKA.md` (Daftar rujukan format APA 7th Edition)
  - [x] `docs/LAPORAN_MAGANG_MAPPING.md` (Matriks pemetaan bab)
- [x] Siapkan konfigurasi repositori GitHub:
  - [x] `.github/workflows/ci.yml`
  - [x] `.github/ISSUE_TEMPLATE/bug_report.md` & `feature_request.md`
  - [x] `.github/PULL_REQUEST_TEMPLATE.md`
  - [x] `.github/dependabot.yml`
  - [x] `CONTRIBUTING.md`
  - [x] `CHANGELOG.md`
- *Status: Complete (100/100 MAXX MODE)*

### [ ] Phase 2: Inisialisasi Proyek & Basis Data (TiDB / Prisma)
- [ ] Inisialisasi package.json Next.js 15 + TypeScript + Tailwind CSS v4.
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
3. **Modul Dokumen 100/100 Maxx Mode**: Menyusun seluruh dokumen Markdown (`.md`), mencakup draf lengkap Bab I s/d Bab V naskah Laporan Magang UNISKA beserta daftar pustaka, sehingga mahasiswa tinggal memindahkan ke template Word saat penyusunan laporan.
