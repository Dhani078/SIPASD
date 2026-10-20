# TASK PLAN: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)

## Goal
Membangun aplikasi repositori e-arsip persuratan berbasis web responsif (Next.js 15, TypeScript, Tailwind CSS, TiDB Serverless, Cloudflare R2) untuk Sekretariat Dispora Provinsi Kalimantan Selatan, menggantikan penyimpanan manual Google Drive (171 Surat Masuk & 249 Surat Keluar TA 2026) dengan katalog berindeks cepat, viewer PDF bawaan, pencatatan disposisi fisik, dan ekspor agenda Excel.

## Current Phase
Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik (100% COMPLETE - E-ARSIP MODEL)

---

## Phases

### [x] Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik
- [x] Susun `README.md` berstandar instansi Pemprov Kalsel & UNISKA (Model E-Arsip).
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
  - [x] `docs/BAB_1_PENDAHULUAN_DRAFT.md` (Latar Belakang Google Drive, Rumusan, Batasan, Tujuan, Manfaat)
  - [x] `docs/BAB_2_PROFIL_INSTANSI_DRAFT.md` (Dasar hukum, Visi Misi, Tupoksi, 11 Venue Olahraga)
  - [x] `docs/BAB_3_ANALISIS_PERANCANGAN_DRAFT.md` (Evaluasi PIECES, UML, ERD 3NF)
  - [x] `docs/BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md` (Env spek, screenshot layout, 15 Blackbox tests)
  - [x] `docs/BAB_5_PENUTUP_DRAFT.md` (Kesimpulan tuntas & saran praktis/akademis)
  - [x] `docs/DAFTAR_PUSTAKA.md` (Daftar rujukan format APA 7th Edition)
  - [x] `docs/LAPORAN_MAGANG_MAPPING.md` (Matriks pemetaan bab)
- [x] Siapkan konfigurasi repositori GitHub:
  - [x] `.github/workflows/ci.yml`
  - [x] `.github/ISSUE_TEMPLATE/`
  - [x] `.github/PULL_REQUEST_TEMPLATE.md`
  - [x] `.github/dependabot.yml`
  - [x] `CONTRIBUTING.md`
  - [x] `CHANGELOG.md`
- *Status: Complete (100/100 MAXX MODE - E-ARSIP)*

### [ ] Phase 2: Inisialisasi Proyek & Basis Data (TiDB / Prisma)
- [ ] Inisialisasi package.json Next.js 15 + TypeScript + Tailwind CSS v4.
- [ ] Buat skema Prisma (`prisma/schema.prisma`) untuk tabel users, arsip_surat_masuk, arsip_surat_keluar, riwayat_disposisi, klasifikasi_arsip, bidang_dispora, audit_logs.
- [ ] Buat modul database client singleton (`src/lib/db.ts`).
- [ ] Buat seeder data dinas (`prisma/seed.ts`): akun pejabat (Kadis, Sekr, PPTK, Bendahara, TU) & kode klasifikasi baku Kalsel.
- *Status: Pending*

### [ ] Phase 3: Modul Autentikasi & RBAC
- [ ] Buat modul hashing password (bcrypt) & sesi terenkripsi (Jose / JWT HttpOnly cookie).
- [ ] Buat middleware rute (`middleware.ts`) untuk proteksi akses Admin, Pimpinan, TU, dan Bidang.
- [ ] Buat antarmuka Login (`src/app/(auth)/login/page.tsx`) dengan tombol akun cepat pengujian.
- *Status: Pending*

### [ ] Phase 4: Modul E-Arsip Surat Masuk & Integrasi PDF Viewer
- [ ] Buat halaman katalog surat masuk dengan filter pencarian instan (< 2 detik), filter sifat surat, dan paginasi.
- [ ] Buat formulir pengindeksan surat masuk baru + validasi Zod.
- [ ] Buat komponen PDF Streaming Viewer bawaan browser (membaca 171 PDF Surat Masuk Google Drive).
- *Status: Pending*

### [ ] Phase 5: Modul Pencatatan Riwayat Disposisi Fisik
- [ ] Buat modal pencatatan riwayat disposisi fisik pimpinan (pejabat, tanggal, instruksi, catatan tertulis).
- [ ] Buat fitur cetak ulang salinan Lembar Disposisi standar Pemprov Kalsel (tampilan siap cetak A4/F4).
- *Status: Pending*

### [ ] Phase 6: Modul E-Arsip Surat Keluar & Pengindeksan Klasifikasi
- [ ] Buat halaman katalog surat keluar dengan filter kode klasifikasi (005, 426, 427, 800, 045, 900).
- [ ] Buat formulir pengindeksan surat keluar + tautan berkas PDF (249 PDF Surat Keluar).
- *Status: Pending*

### [ ] Phase 7: Dashboard Statistik Arsip & Ekspor Buku Agenda
- [ ] Bangun komponen kartu KPI (Volume total arsip, rasio masuk/keluar, arsip per bidang).
- [ ] Bangun grafik tren volume arsip bulanan (Chart.js / SVG).
- [ ] Buat fitur ekspor Buku Agenda Surat Masuk & Keluar ke format Microsoft Excel (.xlsx).
- *Status: Pending*

### [ ] Phase 8: Batch Ingestion 420 Berkas Riil PDF & Verifikasi Akhir
- [ ] Buat script importer otomatis membaca 171 file PDF Surat Masuk dan 249 file PDF Surat Keluar.
- [ ] Jalankan audit pengujian antarmuka mobile (375px) dan desktop (1440px).
- [ ] Verifikasi seluruh alur blackbox testing untuk Bab IV Laporan Magang.
- *Status: Pending*

---

## Key Decisions
1. **Model Sistem E-Arsip Murni**: Menetapkan fokus sistem sebagai repositori katalog digital berindeks untuk menggantikan penumpukan manual di Google Drive (`arsipdispora2026`), bukan simulasi alur kantor aktif.
2. **Relevansi Akademik Penuh**: Sangat solid untuk Laporan Magang TI UNISKA semester 7 dan memiliki jalur upgrade teruji ke Skripsi S1 semester 8 (OCR Tesseract & Text Mining Naive Bayes).
3. **Arsitektur Cloud Zero-Cost**: TiDB Serverless (25 GB) + Cloudflare R2 (10 GB) + Vercel Edge.
