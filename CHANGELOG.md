# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Phase 6)
- Pengujian antarmuka multi-resolusi (mobile 375px s/d desktop 1440px) bebas horizontal overflow.
- Deployment produksi ke Vercel via repositori GitHub `Dhani078/SIPASD`.

---

## [2.7.0] - 2026-10-23

### Added
- **Proteksi Rute Middleware (`src/middleware.ts`)**: Penjaga rute Edge untuk proteksi `/dashboard`, `/arsip-masuk`, `/arsip-keluar`, dan `/master` dari akses tanpa autentikasi.
- **Micro-Component Jam WITA (`src/components/WitaClock.tsx`)**: Pemisahan jam digital zona waktu WITA agar tidak memicu re-render 1 detik pada seluruh `TopNavbar.tsx`.
- **Sinkronisasi URL Browser (`window.history.pushState` & `popstate`)**: Navigasi sidebar kini memperbarui URL peramban secara real-time dan mendukung navigasi Back/Forward serta refresh F5 tanpa terpental ke dashboard.

### Security
- **Pembersihan Total Secrets dari Repositori**: Menghapus seluruh plaintext database password dan Cloudinary secret dari file skrip (`fast_uploader.py`, `upload-cloudinary.ts`, `migrate-db.ts`, `seed-db.ts`, `seed-user-pengarsip.ts`, `db.ts`) dan dokumentasi (`PRD.md`, `DEEP_AUDIT_ROADMAP.md`).
- **Eliminasi `DEMO_PASSWORD` dari Client Bundle**: Menghapus password plaintext dari `users.ts` dan bundle frontend `LoginPage.tsx`. Opsi uji peran dialihkan ke verifikasi server via env `ALLOW_DEMO_LOGIN`.
- **Enforcement RBAC 4 Tingkat**: Pembatasan ketat pada endpoint mutasi data (`POST/PUT/DELETE /api/letters`, `POST /api/upload`, `POST /api/expedition`) khusus role `SUPER_ADMIN` dan `PETUGAS_ARSIP`.
- **Autentikasi Ekspedisi & Whitelist PDF**: Guard sesi pada `GET /api/expedition` dan validasi regex anti-path-traversal pada `GET /api/pdf`.

### Changed
- **Transaksi Database Atomik**: Fungsi `insertNewLetter` dan `deleteLettersBatch` kini dibungkus dalam transaksi database (`beginTransaction`, `commit`, `rollback`) dengan locking `FOR UPDATE` untuk mencegah race condition registrasi agenda.
- **Optimasi Batch Delete**: Menghapus operasi loop N+1 sekuensial menjadi kueri tunggal atomik dengan klausa `IN (?)` pada mysql2.
- **Kueri Parameterized Statis**: Kueri `updateLetter` diubah menjadi parameter statis murni dengan `COALESCE(?, column)`, mengeliminasi risiko injeksi SQL.
- **Aksesibilitas & Type Safety**: Penggantian seluruh unsafe cast `as any` dengan union types pada `EditLetterModal.tsx`, penambahan atribut `id` dan `htmlFor` pada form controls.
- **Optimasi Eager Loading**: Halaman `/login` tidak lagi memuat 411 arsip TiDB saat belum terautentikasi (`initialLetters={[]}`).

---

## [2.6.0] - 2026-10-23

### Added
- **5 Tombol Aksi Dokumen Tabel**: Penambahan tombol `Edit` (aksen amber emas `#fffbeb` / `#d97706`) bersanding dengan `Lihat PDF`, `Unduh`, `Disposisi`, dan `Hapus` pada `src/components/ArchiveTable.tsx`.
- **Fitur Edit Arsip & Mutasi TiDB**: Endpoint `PUT /api/letters` dan fungsi mutasi `updateLetter` di `src/lib/letter-mutations.ts` untuk pembaruan metadata (nomor surat, tanggal naskah, asal/tujuan instansi, perihal, sifat, unggah ulang PDF fisik) serta sinkronisasi data lembar disposisi pimpinan.
- **Komponen Modal Edit (`src/components/EditLetterModal.tsx`)**: Formulir dialog pengeditan metadata arsip surat dan status disposisi terisolasi (< 200 LOC).
- **Filter Tahun Anggaran Cerdas**: Komponen `src/components/YearFilterControl.tsx` dan fungsi `matchYearFilter` di `src/lib/format.ts` mendukung tahun berjalan (2026, 2025, 2024), tahun masa depan (2027-2200), rentang historis (2000-2020, < 2000), dan input kustom bebas.
- **Modal Popup Ringkas Info Fungsi**: Mengganti banner besar pada Riwayat Disposisi dan Buku Ekspedisi menjadi tombol pil ringkas `Info Fungsi` (`DispositionInfoModal.tsx` dan `ExpeditionInfoModal.tsx`).
- **Landing Page Modern & Berdaya Saing**: Komponen `src/components/LandingFeatures.tsx` (3 pilar keunggulan SPBE), lencana status live pulse dot, pintasan cepat kata kunci pencarian, dan sampel dokumen autentik agenda 0899.
- **Maxx Mode Responsif Smartphone & iPad**: Breakpoint drawer navigasi 992px (iPad mode potret mendapat 100% lebar kerja penuh), kanvas penampil PDF 100vw x 100dvh pada smartphone, tombol sentuh ramah jari 34px-40px, tipografi seluler 11px-14px, dan proteksi nol overflow horizontal.

### Fixed
- **Pembersihan Logout Sesi Permanen (Hard Cookie Deletion)**: Fungsi `clearSessionCookie` di `src/lib/auth.ts` kini menetapkan `maxAge: 0`, `expires: new Date(0)`, `path: '/'`, dan `httpOnly: true`. Handler logout di Sidebar, ProfileDropdown, dan ProfileView memanggil `POST /api/auth/logout` lalu mengarahkan ke root `/`, mengatasi masalah memantul (*bouncing*) kembali ke dashboard saat direfresh.
- **Koreksi Data Tahun 2025 pada Agenda 1039**: Memperbaiki tanggal surat agenda 1039 ke tanggal naskah asli (28 Agustus 2026), memastikan 100% arsip berada pada TA 2026.
- **Pembersihan Anomali OCR**: Menghilangkan teks pengotor pada perihal, instansi, dan nomor surat keluar di TiDB.

---

## [2.3.0-security-audit] - 2026-10-22

### Added
- **Security Headers Standard Industri**: Konfigurasi `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Permissions-Policy` pada `next.config.ts`.
- **Loading Skeleton & UI States**: Penambahan `src/app/loading.tsx` dengan animasi shimmer CSS untuk rendering transisi halus saat fetching TiDB Cloud.
- **Error Boundary & 404 Pages**: Penambahan `src/app/error.tsx` dan `src/app/not-found.tsx` untuk penanganan kegagalan koneksi atau rute tak terdaftar secara elegan.
- **PDF Viewer Loading Spinner**: State indikator visual saat streaming dokumen dari Cloudinary CDN pada `PdfPreviewPanel.tsx`.
- **Toast Status Feedback**: Ikon visual status dan animasi slide-up pada pesan status `SipasdApp.tsx`.
- **Expanded Test Suite (6 Skenario)**: Penambahan audit otomatis security headers, API route auth guards, dan zero secret invariant pada `scripts/verify-system.ts`.
- **Deep Audit & Roadmap Document**: Panduan komprehensif `docs/DEEP_AUDIT_ROADMAP.md`.

### Security
- **Auth Guard Enforcement**: Pengamanan endpoint `POST` dan `DELETE` pada `/api/letters` wajib memiliki sesi aktif (`getSession()`), mencegah manipulasi atau penghapusan arsip tanpa otorisasi.
- **Server-Side Input Sanitization**: Pembersihan tag HTML dan pemangkasan panjang karakter pada input nomor surat, instansi asal, dan perihal untuk menangkal serangan XSS.
- **Zero Secrets In Code**: Menghapus seluruh hardcoded secret fallbacks di `src/lib/auth.ts`, `src/app/api/pdf/route.ts`, dan `src/lib/cloudinary.ts`.

---

## [2.2.0-gdrive-sync] - 2026-10-22

### Added
- **Otomatisasi Penuh Google Drive 5 TB (Dual-Upload)**:
  * Unggah batch 420 berkas PDF fisik asli Dispora Kalsel (171 Surat Masuk & 249 Surat Keluar) ke subfolder resmi Google Drive dinas (`1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n` dan `1rgWCFwULt8awBCVIuomy7cELKqEtbdkx`).
  * Sinkronisasi 100% tautan berkas individual `drive_url` (170 Surat Masuk & 241 Surat Keluar) pada basis data TiDB Cloud Serverless.
  * Modul `src/lib/gdrive.ts` untuk pengunggahan otomatis berkas baru ke Google Drive via REST API multipart native tanpa dependensi tambahan.
  * Fitur Dual-Upload simultan pada endpoint `/api/upload`: setiap berkas surat baru otomatis diunggah ke Cloudinary (untuk pratinjau instan) dan Google Drive (sebagai cadangan resmi 5 TB).
- **Pengamanan Kredensial Kearsipan**:
  * Pengisolasian berkas kunci OAuth `credentials/oauth-client.json` dan `credentials/token.json` dari repositori publik dengan proteksi ketat `.gitignore`.

---

## [2.1.0-app-router] - 2026-10-21

### Added
- **Integrasi Penuh Komponen Modular ke Next.js 15 App Router**: Porting 18 komponen modular dari direktori referensi ke `src/components/`, seluruhnya dipecah memenuhi batas maksimal 200 LOC per file.
- **Koneksi TiDB Cloud Serverless Real-Time (Zero Dummy Data Invariant)**: Seluruh tabel katalog, kartu KPI, diagram korespondensi bulanan, dan filter unit kerja mengambil 411 berkas riil (170 Surat Masuk & 241 Surat Keluar) langsung dari basis data TiDB via `mysql2`.
- **Rute Aplikasi Terpadu**:
  * `/` & `/landing`: Portal publik dengan pencarian lacak nomor agenda dan visualisasi aset venue olahraga Banua.
  * `/login`: Portal login terproteksi dilengkapi 1-klik uji 5 peran kedinasan dan autentikasi sesi cookie HttpOnly.
  * `/dashboard`: Dasbor eksekutif dengan 4 metrik KPI riil, grafik korespondensi, dan sebaran beban kerja bidang.
  * `/arsip-masuk`: Katalog surat masuk terintegrasi panel pemutar PDF bawaan peramban berbasis URL Cloudinary dan tautan cadangan Google Drive dinas.
  * `/arsip-keluar`: Katalog surat keluar terindeks klasifikasi dinas.
  * `/api/letters`: REST API penarikan dan penambahan arsip baru dengan mutasi SQL riil.
  * `/api/pdf`: REST API penampil dokumen PDF bertanda-tangan digital (*signed URL stream*) yang mengatasi galat 401 ACL deny Cloudinary.
  * `/api/upload`: REST API unggah berkas PDF fisik langsung ke Cloudinary SDK (`multipart/form-data`) dengan validasi magic bytes `%PDF-` dan batasan ukuran 20 MB.
  * `/api/ai/suggest`: REST API rekomendasi otomatis kode klasifikasi kearsipan dan unit kerja bidang tujuan berbasis algoritma Multinomial Naive Bayes.
- **Modul Rekomendasi Cerdas AI (Skripsi S1 Preview)**: Integrasi mesin klasifikasi teks Naive Bayes di form perekaman surat baru (`NewLetterModal.tsx`) yang secara otomatis mendeteksi kode klasifikasi (005, 426, 427, 800, 045, 900) dan bidang tujuan disposisi secara real-time berdasarkan kata kunci perihal surat.
- **Modul Cetak Disposisi Standar Pemprov Kalsel**: Format cetak lembar disposisi ukuran F4 dan A4 sesuai format kedinasan Dispora Kalsel (`@media print`).
- **Modul Ekspor Spreadsheet Excel (.xlsx)**: Pembuatan buku agenda persuratan dinas secara otomatis menggunakan pustaka `exceljs`.

### Changed
- Refactor pemutar PDF dari kompilasi canvas berat menjadi pemutar PDF responsif berbasis streaming URL Cloudinary langsung, mencegah crash memori pada peramban mobile.
- Pembersihan total karakter em-dash (` - `) menjadi tanda hubung standar (`-`) di seluruh berkas.

---

## [2.0.0-prod] - 2026-10-21

### Added
- **`PRD.md` (Product Requirements Document)**: Dokumen spesifikasi produk 100/100 Maxx Mode (36 KB, 529 baris) memuat analisis *Product Lens*, prioritisasi *ICE Score*, kontrak kapabilitas, kamus data 8 tabel, dan 15 matriks uji black box.
- **`CONSTRAINTS.md` (Quality Contract)**: Kontrak kualitas mutlak *The Floor*, batas kinerja kuantitatif, dan aturan invariant *Dual-Cloud Storage*.
- **Infrastruktur Database TiDB Cloud Serverless**: 8 tabel relasional berhasil dimigrasikan via `scripts/migrate-db.ts` dan diisi data awal via `scripts/seed-db.ts`.
- **Integrasi Penyimpanan Ganda (Dual-Cloud)**:
  * Primer: Cloudinary (`cloud_name: vqfpoekg`, API key `966426338749991`) untuk penampil dokumen PDF instan.
  * Sekunder: Google Drive folder `sistem magang` akun resmi `arsipdispora2026` via robot Service Account `sipasd-bot@sipasd.iam.gserviceaccount.com`.
- **Audit & Penyelarasan Prototipe UI Modular**: Memverifikasi 18 komponen modular hasil refactor Figma Make di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)`, lengkap dengan 36 data transaksi riil Dispora Kalsel, pemutar PDF dinamis `pdf.ts` (`jspdf` + `pdfjs-dist`), dan generator spreadsheet `exportExcel.ts` (`exceljs`).

### Changed
- **Penyelarasan Seluruh Naskah Laporan Magang**: Harmonisasi Bab I s/d Bab V, Daftar Pustaka APA 7th Edition, Deployment Guide, dan Security Audit dengan arsitektur Dual-Cloud (Cloudinary + Google Drive) tanpa kartu kredit.

---

## [1.1.0-earsipped] - 2026-10-20

### Changed
- **Penyelarasan Paradigma Repositori E-Arsip Digital**: Menyelaraskan seluruh spesifikasi sistem dan naskah laporan dari sistem workflow surat baru menjadi Repositori E-Arsip Terindeks untuk 420 berkas pindaian scan PDF yang tersimpan di Google Drive instansi (`arsipdispora2026 / sistem magang`).
- **Penyelarasan Draf Laporan Magang Bab I s/d Bab V**: Menyesuaikan latar belakang masalah, analisis PIECES, perancangan antarmuka, dan 15 skenario Black Box Testing agar fokus pada efisiensi temu-kembali arsip dari 15-30 menit menjadi < 2 detik.
- **Skema Database & DDL**: Mengubah struktur tabel menjadi fokus katalog arsip (`arsip_surat_masuk`, `arsip_surat_keluar`, `riwayat_disposisi`, `klasifikasi_arsip`, `buku_ekspedisi`, `audit_logs`).
- **Roadmap Skripsi S1**: Menegaskan pemanfaatan dataset 420 berkas scan PDF Google Drive sebagai korpus penelitian komputasi kecerdasan buatan (OCR Tesseract & Klasifikasi Teks Naive Bayes TF-IDF).
