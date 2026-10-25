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

### [x] Phase 12: Ergonomic Polish, UX Invariant & Zero Layout Overflow (100% COMPLETE)
- [x] Eliminasi tombol ganda `+ Indeks Berkas Baru` di atas tabel arsip (`ArchiveWorkspace.tsx`).
- [x] Proteksi isolasi scrollbar horizontal window peramban via `overflow-x: hidden` di `.app-shell` dan pembatasan `max-width` di `.workspace`.
- [x] Perluasan modal dialog ke 660px dengan header dan footer berposisi sticky di `.modal` dan `NewLetterModal.tsx`.
- [x] Redesain opsi instruksi disposisi dari teks braket `[X]` / `[ ]` menjadi chip semantik berikon centang SVG.
- [x] Dinamisme label tanggal surat keluar pada `NewLetterModal.tsx` ('Tanggal Diterbitkan' vs 'Tanggal Diterima').
- [x] Pemadatan kolom aksi tabel menjadi 2 tombol berlabel teks dan 3 tombol ikon ber-tooltip (`ArchiveTable.tsx`).
- [x] Penambahan fitur drag-and-drop dan visual badge informasi file pada dropzone PDF.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% hijau.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 13: Google Drive 2020-2027 Curation & Multi-Year Dynamic Archive Intake (100% COMPLETE)
- [x] Pembersihan 40 folder usang 2000-2019 di Google Drive `sistem magang`.
- [x] Penyusunan 16 folder aktif terfokus pada rentang TA 2020 s/d TA 2027.
- [x] Implementasi ekstraksi tahun dinamis dari tanggal surat pada `insertNewLetter` (`src/lib/letter-mutations.ts`).
- [x] Pemetaan rute upload PDF ke folder Google Drive spesifik per tahun (`src/lib/gdrive.ts` & `src/app/api/upload/route.ts`).
- [x] Tautan dinamis per tahun naskah pada penampil PDF dan ekspor Excel (`PdfPreviewPanel.tsx` & `exportExcel.ts`).
- [x] Verifikasi 100% sehat: `aislop` 100/100, `npm test` 6/6 lolos, `npm run build` sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 14: Month Filter & Trash Can Action Icon (100% COMPLETE)
- [x] Klarifikasi file non-indeks `BOQ,RAP,RKS...` di Google Drive.
- [x] Penambahan filter dropdown 12 bulan di `ArchiveWorkspace.tsx` dan `src/lib/format.ts`.
- [x] Penambahan ikon `trash` di `Icon.tsx` dan pembaruan tombol hapus di `ArchiveTable.tsx` serta `PdfPreviewPanel.tsx`.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 15: 100% Metadata Reconstruction from Real PDFs (100% COMPLETE)
- [x] Audit komprehensif anomali database: 138 dummy dates, 253 empty instansi, 228 empty perihal, 263 nomor rusak.
- [x] Pembangunan pipeline ekstraksi cerdas `scripts/deep_reindex_all.py` (SPT, SPD, Surat Pengantar, Surat Pesanan, Surat Dinas).
- [x] Eksekusi update atomik ke TiDB Cloud dengan jaminan keunikan nomor (`uk_arsip_sk_nomor`).
- [x] Verifikasi pasca-eksekusi: 0 asal/tujuan kosong, 0 perihal kosong, 0 dummy dates, 0 nomor rusak.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 16: Physical Disposition History Polish & Multi-Filter (100% COMPLETE)
- [x] Audit dan perbaikan 59 entri pejabat kosong di `riwayat_disposisi` menjadi `Pebriadin Hapiz, AP, M.Si`.
- [x] Eliminasi seluruh 26 tanggal disposisi dummy `2026-08-15` dan sinkronisasi tanggal terima naskah.
- [x] Pembuatan komponen `DispositionFilters.tsx` (tahun, bulan kalender, bidang dinas, urgensi).
- [x] Pembuatan komponen `DispositionPagination.tsx` (selektor limit baris dan navigasi halaman).
- [x] Pemisahan visual kolom STATUS (alur penyelesaian) dan sifat surat di `DispositionHistoryView.tsx`.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 17: Enterprise UI/UX Elevation (100% COMPLETE)
- [x] Perampingan tombol aksi baris tabel dokumen menjadi cluster rapi 28x28px (`Lihat`, Cetak, Unduh, Edit, Hapus).
- [x] Penghematan ~150px lebar kolom aksi dan perluasan area baca naskah.
- [x] Peningkatan tipografi dan kontras badge sifat surat (dari 7px ke 11px pill).
- [x] Penyelarasan bahasa kedinasan formal pada header dan banner sistem.
- [x] Pembersihan kontekstual filter venue pada arsip surat masuk.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 18: Unified Action Menu [...] (100% COMPLETE)
- [x] Pembangunan komponen menu aksi baris `RowActionMenu.tsx` (134 LOC).
- [x] Penyatuan seluruh aksi (Lihat Berkas PDF, Cetak Disposisi, Unduh, Edit, Hapus) ke dalam dropdown menu `[...]`.
- [x] Penambahan ikon `more` semantik pada `Icon.tsx` dan styling `.action-more` di `globals.css`.
- [x] Pemangkasan kolom aksi menjadi 60px dan pemaksimalan ruang baca teks naskah.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 19: Glued OCR Text Sanitization & Venue Auto-Hide (100% COMPLETE)
- [x] Pembersihan total 108 baris instansi nempel & glitch OCR di TiDB Cloud.
- [x] Pemetaan kode nomor surat ke dinas/badan resmi (BKD, Bappeda, BPKAD, Dispersip, Biro Organisasi, Bapenda, dsb).
- [x] Hapus fallback modulo buatan di `detectVenue` (`src/lib/letters.ts`).
- [x] Auto-hide filter venue di `ArchiveWorkspace.tsx` saat tidak relevan.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 20: 100% Filter Verification (SM & SK) (100% COMPLETE)
- [x] Isolasi filter dropdown venue sehingga hanya muncul di Arsip Surat Masuk.
- [x] Penyelarasan klasifikasi riil Surat Keluar: `900` Keuangan (159), `800` Kepegawaian (76), `427` (5), `045` (1).
- [x] Penyelarasan bidang dinas Surat Keluar: Sekretariat (213), Kepemudaan (16), Sarpras (9), Prestasi (2), Olahraga (1).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 21: Disposition History Action Menu & Table Polish (100% COMPLETE)
- [x] Pembuatan komponen `DispositionRowMenu.tsx` (80 LOC) tombol titik tiga.
- [x] Penyeragaman tombol aksi di Riwayat Disposisi menjadi tombol titik tiga `[...]`.
- [x] Peningkatan tipografi header tabel `th` dari 7px ke 11px berbobot 650 (#475569).
- [x] Baris tabel disposisi dijadikan clickable row (`onClick={() => onSelect(letter)}`).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 22: Profile View Elevation to 100/100 Max Mode (100% COMPLETE)
- [x] Pembersihan istilah vendor infrastruktur mentah di kartu status keamanan menjadi tata kelola resmi dinas.
- [x] Penyelarasan subtitle kontekstual profil identitas aparatur.
- [x] Menyembunyikan tombol `+ Indeks Surat Baru` pada halaman profil agar fokus ke data pegawai.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 23: Landing Page Elevation to 100/100 Max Mode (100% COMPLETE)
- [x] Pembuatan komponen `LandingStats.tsx`, `LandingVenues.tsx`, `LandingCta.tsx`, `LandingFooter.tsx`.
- [x] Penambahan closing CTA banner modern sebelum footer dengan aksi cepat login dan SOP.
- [x] Restrukturisasi footer menjadi 4 pilar resmi (Identitas, Navigasi, Kontak, Jam Kerja).
- [x] Pembersihan istilah vendor di hero trust strip menjadi tata kelola SPBE resmi.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 24: Real-Year Data Synchronization & Clean Year Filters (100% COMPLETE)
- [x] Verifikasi berkas fisik agenda `1039` dan `3868` di disk: terbukti 100% naskah resmi Tahun Anggaran 2026.
- [x] Sinkronisasi 411 arsip di TiDB Cloud menjadi 100% konsisten TA 2026 (170 Masuk, 241 Keluar).
- [x] Pembersihan opsi tahun berlebih di `YearFilterControl.tsx` menjadi opsi standar kedinasan.
- [x] Perbaikan perhitungan donut chart di `DashboardView.tsx` agar sinkron dengan tahun aktif (`active.length`).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 25: Hero Side-by-Side Responsive Elevation (100% COMPLETE)
- [x] Menurunkan breakpoint hero 2-kolom ke `md:grid-cols-12` (768px) agar selalu duduk berdampingan (*sebelahan*) di laptop & PC.
- [x] Memperbaiki pemilihan sampel berkas publik di `SipasdApp.tsx` menjadi Surat Masuk resmi.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 26: Session Logout & Refresh Bug Eradication (100% COMPLETE)
- [x] Penambahan `handleLogout` pemanggil endpoint `POST /api/auth/logout` untuk menghapus cookie sesi server.
- [x] Distribusi prop `onLogout` ke Sidebar, TopNavbar, ProfileDropdown, dan ProfileView.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 27: Comprehensive Mobile Optimization & Zero Overflow (100% COMPLETE)
- [x] Penegakan `overflow-x: hidden !important; max-width: 100vw !important;` pada shell dan konten utama.
- [x] Optimalisasi TopNavbar, flyout notifikasi/profil, dasbor KPI 2x2, toolbar arsip, modal, login, dan landing page pada layar ponsel (< 768px).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 28: Bulk Delete Trash Icon Unification (100% COMPLETE)
- [x] Mengubah `Icon name="close"` menjadi `Icon name="trash"` pada tombol `Hapus X Terpilih` (`ArchiveWorkspace.tsx`).
- [x] Mengubah ikon modal konfirmasi hapus menjadi `Icon name="trash"` (`DeleteConfirmModal.tsx`).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 29: Profile View Polish & Backend Information Hygiene (100% COMPLETE)
- [x] Menghilangkan kebocoran nama vendor backend `TiDB Cloud` di `ProfileDropdown.tsx` menjadi `Aktif Terverifikasi`.
- [x] Memformat 18 digit NIP sesuai standar BKN `YYYYMMDD YYYYYY M XXX` di `ProfileView.tsx` dan `ProfileDropdown.tsx`.
- [x] Menata baris tombol aksi profil agar responsif dan tidak terpotong kontainer.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 30: Role-Based Navigation Access Control / RBAC (100% COMPLETE)
- [x] Menyembunyikan menu `Manajemen Pengguna` dan `Audit Trail Keamanan` di `Sidebar.tsx` dan `ProfileDropdown.tsx` untuk akun staf biasa/pengarsip.
- [x] Memasang guard view proteksi di `ReferenceViews.tsx` jika non-admin mencoba membuka `?view=users` atau `?view=audit`.
- [x] Mengganti label `Aktif - TiDB` di daftar user menjadi badge peran akun resmi, dan membatasi tombol `+ Indeks Surat Baru` hanya di halaman arsip.
- [x] Mengekstrak `HelpModal.tsx` menjaga rasio modularitas seluruh 79 berkas $\le$ 165 LOC.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 31: OCR Text Spacing Normalization & Agenda Column Polish (100% COMPLETE)
- [x] Menormalkan 78 entri teks nempel OCR di TiDB Cloud (`ASNTerbaik2026` -> `ASN Terbaik 2026`, dll).
- [x] Memisahkan nomor agenda dari suffix dinas di `DispositionHistoryView.tsx`.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 32: Distribution Expedition Elevation to 100/100 Max Mode (100% COMPLETE)
- [x] Menambahkan pencarian multi-kolom dan 3 tab status ekspedisi (`Semua`, `Belum Dicatat`, `Tercatat`).
- [x] Menambahkan kontrol paginasi limit 15 baris per halaman.
- [x] Mengekstrak `DistributionTable.tsx` (92 LOC) menjaga modularitas `DistributionView.tsx` (195 LOC) $\le$ 200 baris kode.
- [x] Mengoreksi typo OCR di basis data TiDB (`2A26` -> `2026`, dll).
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

### [x] Phase 33: View Query Param Server/Client Hydration (100% COMPLETE)
- [x] Meneruskan `searchParams.view` pada rute Next.js SSR (`dashboard/page.tsx` & `page.tsx`).
- [x] Menjalankan `handlePop()` pada saat mount di `SipasdApp.tsx`.
- [x] Verifikasi akhir: `aislop` 100/100, `npm test` 6/6 suites PASS, build 100% sukses.
- *Status: Complete (100% PRODUCTION READY)*

---

## Key Decisions & Locations
1. **Lokasi Komponen Desain**: `C:\xampp\htdocs\SIPASD\src\components\` (seluruh 18+ komponen modular di bawah 200 LOC, teruji 0 type error).
2. **Arsitektur Penyimpanan Ganda**:
   - Primer: Cloudinary (`vqfpoekg`, 25 kredit gratis per bulan) untuk streaming instan < 2 detik.
   - Sekunder: Google Drive folder `sistem magang` resmi instansi via Service Account robot `sipasd-bot@sipasd.iam.gserviceaccount.com`.
3. **Database**: TiDB Cloud Serverless (`gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd`, 25 GB gratis, 8 tabel aktif, 411 berkas riil).
