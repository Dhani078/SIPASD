# TASK PLAN: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)

## Goal
Membangun aplikasi repositori e-arsip persuratan berbasis web responsif (Next.js 15, TypeScript, Tailwind CSS, TiDB Serverless, Cloudinary & Google Drive) untuk Sekretariat Dispora Provinsi Kalimantan Selatan, menggantikan penyimpanan manual Google Drive (171 Surat Masuk & 249 Surat Keluar TA 2026) dengan katalog berindeks cepat, viewer PDF bawaan, pencatatan disposisi fisik, dan ekspor agenda Excel.

## Current Phase
Phase 2: Inisialisasi Proyek, Basis Data TiDB & Storage Cloud (In Progress -> Complete)

---

## Phases

### [x] Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik
- [x] Susun `README.md` berstandar instansi Pemprov Kalsel & UNISKA (Model E-Arsip).
- [x] Susun `AGENT.md` direktif autonomous agent loop & zero-slop.
- [x] Susun `SPEC.md` spesifikasi teknis Spec-Driven Development.
- [x] Susun `CONSTRAINTS.md` kontrak kualitas mutlak (The Floor, budgets, invariant).
- [x] Susun `PRD.md` Product Requirements Document 100/100 Maxx Mode.
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
  - [x] `docs/DEPLOYMENT_GUIDE.md` (Zero-cost runbook: Vercel, TiDB, Cloudinary, Drive)
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
- *Status: Complete (100/100 MAXX MODE)*

### [x] Phase 2: Inisialisasi Proyek, Basis Data TiDB & Storage Cloud
- [x] Inisialisasi `package.json` Next.js 15 + TypeScript + Tailwind CSS v4 dan pasang dependensi.
- [x] Buat skrip migrasi database `scripts/migrate-db.ts` dan eksekusi pembentukan 8 tabel di TiDB Cloud Serverless.
- [x] Buat skrip seeder `scripts/seed-db.ts` untuk akun resmi pejabat Dispora & master kode klasifikasi arsip.
- [x] Konfigurasi penyimpanan primer Cloudinary (`vqfpoekg`, API key `966426338749991`) dan uji upload/delete.
- [x] Konfigurasi penyimpanan sekunder Google Drive (`sistem magang`) via Service Account `sipasd-bot@sipasd.iam.gserviceaccount.com`.
- [x] Verifikasi dan audit prototipe antarmuka di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` (18 komponen modular).
- *Status: Complete*

### [ ] Phase 3: Modul Autentikasi & RBAC 4 Tingkat
- [ ] Buat utilitas verifikasi JWT sesi cookie HttpOnly di `src/lib/auth.ts`.
- [ ] Buat route handler `/api/auth/login` dan `/api/auth/logout`.
- [ ] Pasang antarmuka Login (`src/app/login/page.tsx`) dengan tombol tester 1-klik 5 peran.
- [ ] Buat proteksi middleware rute (`middleware.ts`).
- *Status: Pending*

### [ ] Phase 4: Porting Komponen Modular ke Next.js 15 App Router & TiDB
- [ ] Pindahkan komponen dari `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` ke `src/components/`.
- [ ] Hubungkan katalog surat masuk (`/arsip-masuk`) ke kueri database TiDB Cloud Serverless secara real-time.
- [ ] Hubungkan katalog surat keluar (`/arsip-keluar`) ke kueri database TiDB Cloud Serverless.
- [ ] Pasang penampil dokumen PDF bawaan (*streaming viewer*) dengan tombol cadangan Google Drive.
- [ ] Buat modal rekam indeks surat baru yang menyimpan metadata ke TiDB dan berkas ke Cloudinary.
- *Status: Pending*

### [ ] Phase 5: Modul Cetak Disposisi & Ekspor Buku Agenda Excel
- [ ] Pasang halaman cetak disposisi standar Pemprov Kalsel ukuran F4/A4 (`@media print`).
- [ ] Pasang endpoint API ekspor Buku Agenda Surat Masuk dan Keluar ke format spreadsheet Excel (.xlsx) via `exceljs`.
- *Status: Pending*

### [ ] Phase 6: Verifikasi Akhir & Deploy Publik Vercel
- [ ] Jalankan audit typecheck `npx tsc --noEmit` (0 error).
- [ ] Jalankan audit build produksi `npm run build` (0 error).
- [ ] Verifikasi antarmuka mobile (375px) dan desktop (1440px) bebas horizontal scroll overflow.
- [ ] Lakukan commit akhir dan deploy ke Vercel via GitHub `Dhani078/SIPASD`.
- *Status: Pending*

---

## Key Decisions & Locations
1. **Lokasi Prototipe Desain**: `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` (18 file komponen modular, teruji E2E).
2. **Arsitektur Penyimpanan Ganda**:
   - Primer: Cloudinary (`vqfpoekg`, 25 kredit gratis per bulan) untuk streaming instan < 2 detik.
   - Sekunder: Google Drive folder `sistem magang` resmi instansi via Service Account robot `sipasd-bot@sipasd.iam.gserviceaccount.com`.
3. **Database**: TiDB Cloud Serverless (`gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd`, 25 GB gratis, 8 tabel aktif).
