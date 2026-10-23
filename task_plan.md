# TASK PLAN: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)

## Goal
Membangun aplikasi repositori e-arsip persuratan berbasis web responsif (Next.js 15, TypeScript, Tailwind CSS, TiDB Serverless, Cloudinary & Google Drive) untuk Sekretariat Dispora Provinsi Kalimantan Selatan, menggantikan penyimpanan manual Google Drive (170 Surat Masuk & 241 Surat Keluar TA 2026 di TiDB) dengan katalog berindeks cepat, viewer PDF bawaan, pencatatan disposisi fisik, dan ekspor agenda Excel.

## Current Phase
Phase 6: Verifikasi Akhir & Deploy Publik Vercel (In Progress)

---

## Phases

### [x] Phase 1: Dokumen Spesifikasi, Arsitektur & Naskah Akademik (100% COMPLETE - MAXX MODE)
- [x] Susun `README.md` berstandar instansi Pemprov Kalsel & UNISKA (Model E-Arsip).
- [x] Susun `AGENT.md` direktif autonomous agent loop & zero-slop.
- [x] Susun `SPEC.md` spesifikasi teknis Spec-Driven Development.
- [x] Susun `CONSTRAINTS.md` kontrak kualitas mutlak (The Floor, budgets, invariant).
- [x] Susun `PRD.md` Product Requirements Document 100/100 Maxx Mode.
- [x] Susun `task_plan.md`, `findings.md`, `progress.md`.
- [x] Susun dokumentasi teknis di `docs/`:
  - [x] `docs/HANDOFF.md` (Panduan operasional sesi)
  - [x] `docs/PANDUAN_PENGGUNA.md` (User Manual operasional pegawai & pimpinan dinas)
  - [x] `docs/TESTING_REPORT.md` (Laporan pengujian Black Box 15 skenario & Playwright E2E)
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

### [x] Phase 3: Modul Autentikasi & RBAC 4 Tingkat
- [x] Buat utilitas verifikasi JWT sesi cookie HttpOnly di `src/lib/auth.ts`.
- [x] Buat route handler `/api/auth/login` dan `/api/auth/logout`.
- [x] Pasang antarmuka Login (`src/app/login/page.tsx`) dengan tombol tester 1-klik 5 peran.
- [x] Sambungkan otentikasi nyata langsung ke tabel `users` di TiDB Cloud Serverless via bcrypt.
- *Status: Complete*

### [x] Phase 4: Porting Komponen Modular ke Next.js 15 App Router & TiDB
- [x] Porting 18 komponen modular dari referensi UI ke `src/components/` dengan modularitas tinggi (< 200 LOC per file).
- [x] Hubungkan katalog surat masuk (`/arsip-masuk`) ke kueri database TiDB Cloud Serverless secara real-time (170 surat masuk riil).
- [x] Hubungkan katalog surat keluar (`/arsip-keluar`) ke kueri database TiDB Cloud Serverless secara real-time (241 surat keluar riil).
- [x] Pasang penampil dokumen PDF bawaan (*streaming viewer*) dengan URL Cloudinary CDN aktif dan tombol cadangan Google Drive dinas.
- [x] Buat modal rekam indeks surat baru (`NewLetterModal.tsx` & `NewLetterDisposisiFields.tsx`) terhubung API `/api/letters` yang mengeksekusi INSERT nyata ke TiDB.
- [x] Pasang endpoint `/api/upload` dan utilitas Cloudinary (`src/lib/cloudinary.ts`) untuk upload langsung berkas PDF fisik baru ke Cloudinary CDN.
- *Status: Complete*

### [x] Phase 5: Modul Cetak Disposisi & Ekspor Buku Agenda Excel
- [x] Pasang modal cetak lembar disposisi standar Pemprov Kalsel ukuran F4/A4 (`PrintDisposisiModal.tsx` & `@media print`).
- [x] Pasang fungsi ekspor Buku Agenda Surat Masuk dan Keluar ke format spreadsheet Excel (.xlsx) via `exceljs` (`src/lib/exportExcel.ts`).
- *Status: Complete*

### [x] Phase 6: Verifikasi Akhir & Deploy Publik Vercel
- [x] Jalankan audit typecheck `npx tsc --noEmit` (0 error).
- [x] Jalankan audit build produksi `npm run build` (0 error).
- [x] Verifikasi zero em-dashes di seluruh kode dan dokumen.
- [x] Verifikasi seluruh 46 file kode di bawah 200 LOC.
- [x] Pasang pemantauan performa `@vercel/analytics` dan `@vercel/speed-insights`.
- [x] Hubungkan domain kustom dinas `sipasd.my.id` & `www.sipasd.my.id` dengan SSL aktif.
- [x] Lakukan deploy ke Vercel via GitHub `Dhani078/SIPASD` (Status: Live Production).
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 7: Sinkronisasi Google Drive 5 TB & Dual-Upload Otomatis
- [x] Otorisasi OAuth 2.0 Desktop Client untuk akun kuota 5 TB `dhanisepeda@gmail.com`.
- [x] Unggah batch 420 berkas riil asli Dispora Kalsel ke folder Google Drive (171 Surat Masuk, 249 Surat Keluar).
- [x] Sinkronisasi 100% tautan individual `drive_url` pada 411 arsip di basis data TiDB Cloud Serverless.
- [x] Implementasi modul native `src/lib/gdrive.ts` untuk upload otomatis via refresh token.
- [x] Integrasi fitur Dual-Upload simultan pada `/api/upload` dan `useLetterActions.ts` (Cloudinary + Google Drive).
- [x] Isolasi penuh kredensial di `credentials/` dan proteksi `.gitignore` anti-leaked ke GitHub.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 8: Deep Audit Keamanan, UX/Performa & Pengujian Ekstensif (100% COMPLETE)
- [x] Pasang security headers di `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- [x] Pasang pengaman autentikasi sesi dan sanitasi input server-side pada route `/api/letters` (POST dan DELETE).
- [x] Bersihkan seluruh hardcoded secrets dan fallback credentials di `src/lib/auth.ts`, `src/app/api/pdf/route.ts`, dan `src/lib/cloudinary.ts`.
- [x] Buat komponen loading skeleton `src/app/loading.tsx` dengan animasi shimmer.
- [x] Buat komponen error boundary `src/app/error.tsx` dan not-found `src/app/not-found.tsx`.
- [x] Tambahkan state indikator spinner loading pada penampil PDF `src/components/PdfPreviewPanel.tsx`.
- [x] Sempurnakan animasi masuk dan ikon status pada toast notifikasi di `src/components/SipasdApp.tsx`.
- [x] Ekspansi test suite `scripts/verify-system.ts` menjadi 6 pengujian otomatis (TiDB, Cloudinary, Modular 200 LOC, Zero Em-Dash, Security Headers & Auth Guards, Zero Secrets).
- [x] Buat dokumen laporan audit dan roadmap perbaikan di `docs/DEEP_AUDIT_ROADMAP.md`.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 9: Ekstraksi OCR Nyata PDF, Pejabat Pendisposisi Riil & Buku Ekspedisi
- [x] Unduh 423 berkas PDF riil dari Google Drive resmi dinas.
- [x] Ekstraksi RapidOCR latar belakang 4 worker pada berkas pindaian.
- [x] Pemetaan pejabat pendisposisi riil (Kadis, Sekretaris, Kabid, Kasubbag) dan dokumentasi bukti di `docs/DISPOSISI_DARI_PDF.md`.
- [x] Implementasi fitur Buku Ekspedisi Surat Keluar (`src/app/api/expedition/route.ts`, `ExpeditionFormModal.tsx`, `DistributionView.tsx`).
- [x] Pembersihan anomali OCR perihal, instansi, dan nomor surat keluar di TiDB.
- [x] Koreksi tanggal agenda 1039 ke TA 2026 sah.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 10: 5 Tombol Aksi Tabel, Modal Edit, Filter Tahun Cerdas, Maxx Mode Mobile, dan Hard Logout Cookie
- [x] Implementasi 5 tombol aksi dokumen tabel: `Lihat PDF`, `Unduh`, `Disposisi`, `Edit`, `Hapus` pada `ArchiveTable.tsx`.
- [x] Implementasi endpoint `PUT /api/letters` dan fungsi mutasi `updateLetter` di `src/lib/letter-mutations.ts`.
- [x] Pembuatan komponen modal edit terisolasi `src/components/EditLetterModal.tsx` (< 200 LOC).
- [x] Implementasi filter tahun cerdas `YearFilterControl.tsx` dan fungsi `matchYearFilter` di `src/lib/format.ts` (dukungan 2027-2200, 2000-2020, dan input kustom).
- [x] Pembuatan modal pop-up ringkas info fungsi disposisi (`DispositionInfoModal.tsx`) dan ekspedisi (`ExpeditionInfoModal.tsx`).
- [x] Redesain Landing Page publik modern dan berdaya saing (`LandingFeatures.tsx`, status SPBE live pulse dot, pintasan kata kunci cepat, sampel autentik 0899).
- [x] Penerapan Maxx Mode Responsif pada smartphone (<768px) dan iPad/tablet (768px-1024px) dengan drawer breakpoint 992px, 100vw x 100dvh PDF viewer, dan proteksi nol overflow horizontal.
- [x] Perbaikan tuntas logout bersih: fungsi `clearSessionCookie` (maxAge 0, path '/') di `src/lib/auth.ts`, endpoint `GET/POST /api/auth/logout`, dan integrasi tombol logout di seluruh komponen navigasi tanpa loop bouncing kembali ke dashboard saat direfresh.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 11: Full Audit Spektrum, Zero Secrets, RBAC 4 Tingkat, Transaksi Database & Sinkronisasi Router URL
- [x] Pembersihan total seluruh password TiDB, Cloudinary secret, dan JWT fallback dari seluruh berkas skrip dan markdown (`scripts/`, `docs/`, `PRD.md`).
- [x] Eliminasi konstanta `DEMO_PASSWORD` dari frontend `src/data/users.ts` dan bundle klien `LoginPage.tsx`.
- [x] Pembuatan `src/middleware.ts` untuk proteksi rute Server Components terhadap akses tanpa sesi.
- [x] Penegakan RBAC 4 tingkat pada API mutasi (`/api/letters`, `/api/upload`, `/api/expedition`).
- [x] Implementasi transaksi atomik (`beginTransaction`, `commit`, `rollback`) dengan locking `FOR UPDATE` pada registrasi nomor agenda di `src/lib/letter-mutations.ts`.
- [x] Eliminasi N+1 loop sekuensial pada batch delete menjadi kueri atomik `IN (?)`.
- [x] Eliminasi risiko injeksi SQL dengan beralih ke parameter statis murni `COALESCE(?, column)`.
- [x] Pembuatan komponen `src/components/WitaClock.tsx` untuk menghentikan re-render 1 detik pada bilah navigasi atas.
- [x] Penerapan sinkronisasi URL peramban dengan `window.history.pushState` dan listener `popstate` di `SipasdApp.tsx`.
- [x] Resolusi type safety (0 `as any`) dan aksesibilitas `id`/`htmlFor` pada `EditLetterModal.tsx`.
- [x] Verifikasi kepatuhan: `npm test` 6/6 lolos, `npm run typecheck` 0 error, `npm run build` sukses 100%, skor `aislop` 100/100 (0 error, 0 warning, 0 vuln).
- *Status: Complete (100% PRODUCTION READY)*

---

## Key Decisions & Locations
1. **Lokasi Komponen Desain**: `C:\xampp\htdocs\SIPASD\src\components\` (seluruh 18+ komponen modular di bawah 200 LOC, teruji 0 type error).
2. **Arsitektur Penyimpanan Ganda**:
   - Primer: Cloudinary (`vqfpoekg`, 25 kredit gratis per bulan) untuk streaming instan < 2 detik.
   - Sekunder: Google Drive folder `sistem magang` resmi instansi via Service Account robot `sipasd-bot@sipasd.iam.gserviceaccount.com`.
3. **Database**: TiDB Cloud Serverless (`gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd`, 25 GB gratis, 8 tabel aktif, 411 berkas riil).
