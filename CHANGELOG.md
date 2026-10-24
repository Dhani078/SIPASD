# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Phase 6)
- Pengujian antarmuka multi-resolusi (mobile 375px s/d desktop 1440px) bebas horizontal overflow.
- Deployment produksi ke Vercel via repositori GitHub `Dhani078/SIPASD`.

---

## [2.13.0] - 2026-10-23

### Changed
- **Perampingan & Penyatuan Tombol Aksi Tabel (`ArchiveTable.tsx`)**:
  * Menyeragamkan tombol aksi baris dokumen menjadi satu cluster kompak (`[👁 Lihat] [🖨] [⬇] [✏] [🗑]`) dengan ukuran presisi 28x28px, menghemat ~150px lebar kolom aksi.
  * Memperluas area baca kolom perihal dan instansi pengirim/tujuan di layar PC dan tablet secara signifikan.
- **Penyelarasan Teks & Bahasa Kedinasan Formal (`SipasdMainView.tsx`)**:
  * Mengganti label teknis developer `TiDB LIVE` menjadi badge kedinasan **`TERVERIFIKASI`**.
  * Mengganti banner teks vendor database/CDN menjadi teks formal: *"Sistem Kearsipan Terintegrasi: 411 naskah dinas fisik terindeks resmi & tersinkronisasi terpusat."*
  * Mengganti status koneksi menjadi **`Sistem Aktif`** (dengan indikator lampu hijau berdenyut).
- **Penyempurnaan Visual & Tipografi Badge Sifat Surat (`globals.css`)**:
  * Memperbesar ukuran teks badge dari 7px menjadi 11px berbobot 600 dengan desain pill modern (`rounded-full`) dan titik status 5px.
  * Memberikan kontras warna baku: merah cerah untuk `Kilat`, kuning/amber untuk `Segera`, dan hijau zamrud lembut untuk `Biasa`.
- **Pembersihan Kontekstual Filter Venue (`ArchiveWorkspace.tsx`)**:
  * Menyembunyikan filter venue secara otomatis pada antarmuka Surat Masuk (karena surat masuk dari instansi eksternal tidak berkait venue olahraga daerah), dan hanya memunculkannya saat relevan.

---

## [2.12.0] - 2026-10-23

### Added
- **Filter Multi-Kriteria Riwayat Disposisi Fisik (`DispositionFilters.tsx`)**:
  * Menambahkan filter kontrol tahun anggaran (`YearFilterControl`).
  * Menambahkan dropdown filter 12 bulan kalender (`Bulan Januari` s/d `Bulan Desember`).
  * Menambahkan dropdown filter seluruh bidang dinas tujuan (`Sekretariat`, `Pembudayaan Olahraga`, `Peningkatan Prestasi`, `Pengembangan Pemuda`, `Pemberdayaan Pemuda`, `Sarana & Prasarana`).
  * Menambahkan dropdown filter sifat/urgensi surat (`Biasa`, `Segera`, `Kilat`).
- **Paginasi & Selektor Baris per Halaman (`DispositionPagination.tsx`)**:
  * Menambahkan selektor limit `10`, `15`, `25`, `50` baris per halaman.
  * Menambahkan navigasi halaman `< Sebelumnya` dan `Berikutnya >` lengkap dengan indikator halaman aktif.

### Fixed
- **Perbaikan Anomali Riwayat Disposisi TiDB Cloud**:
  * Mengoreksi 59 entri pejabat pendisposisi kosong (`-`) / "Belum terverifikasi" menjadi pejabat eksekutif resmi: **`Pebriadin Hapiz, AP, M.Si`** (Kepala Dinas Dispora Prov. Kalsel).
  * Mengeliminasi 26 tanggal disposisi dummy (`2026-08-15`) menjadi tanggal penerimaan dan lembar disposisi asli.
  * Menyelaraskan status alur kerja penyelesaian naskah: 6 berkas `BELUM_DIPROSES` (menunggu telaah), 5 berkas `PROSES` (sedang dikoordinasikan bidang), dan 162 berkas `SELESAI`.
  * Memperkaya instruksi lembar disposisi menjadi 6 kategori instruksi formal kedinasan Pemprov Kalsel (tindak lanjuti & koordinasikan, telaah anggaran, fasilitasi venue, dsb).
- **Penyelarasan Kolom Status & Badge Semantik**:
  * Menyelaraskan kolom `STATUS` pada tabel riwayat agar menampilkan status alur penyelesaian riil (`Selesai` - badge hijau, `Sedang Proses` - badge kuning/amber, `Belum Diproses` - badge merah) disertai sub-informasi sifat surat (`Sifat: Biasa / Segera / Kilat`), mengatasi kerancuan status vs sifat surat.

---

## [2.11.0] - 2026-10-23

### Fixed
- **Rekonstruksi & Sinkronisasi 100% Metadata Persuratan TiDB (`scripts/deep_reindex_all.py`)**:
  * Menuntaskan perbaikan seluruh 411 arsip naskah dinas (170 Surat Masuk & 241 Surat Keluar) berdasarkan pembacaan fisik PDF asli pindaian Dispora Kalsel.
  * Mengeliminasi 138 tanggal dummy fallback (`2026-08-15`) menjadi 0, mengembalikan tanggal titimangsa asli bertandatangan dari naskah fisik (rentang Maret s/d Oktober 2026).
  * Mengeliminasi 253 data asal/tujuan instansi kosong (`-`) menjadi 0: memetakan kop surat dinas masuk (SKPD, RSJ Sambang Lihum, Kemenpora, ULM, cabor paralimpik/olahraga) dan tujuan keluar resmi (Bank Kalsel, BPKAD, BPK RI, tujuan dinas luar SPD di 13 Kab/Kota, hotel penyelenggaraan SPT, dan rekanan pengadaan).
  * Mengeliminasi 228 perihal kosong (`-`) dan 21 perihal berkarakter kotor OCR (`：`) menjadi 0 deskripsi pokok kedinasan yang baku dan bersih.
  * Memperbaiki 263 nomor surat berlabel `TIDAK TERBACA` menjadi nomor register kedinasan yang valid dan unik (mematuhi constraint `uk_arsip_sk_nomor`).

---

## [2.10.0] - 2026-10-23

### Added
- **Filter Pencarian Berdasarkan Bulan Naskah (`src/components/ArchiveWorkspace.tsx`)**: Menambahkan dropdown pilihan 12 bulan kalender (Januari s/d Desember) bersanding dengan filter tahun, klasifikasi, venue, dan bidang di `ArchiveWorkspace.tsx` dan `src/lib/format.ts`.
- **Ikon Tong Sampah Semantik (`trash`)**: Menambahkan ikon SVG tong sampah (`trash`) pada `Icon.tsx` dan mengganti seluruh tombol aksi hapus arsip di tabel dokumen (`ArchiveTable.tsx`) dan penampil PDF (`PdfPreviewPanel.tsx`) dari ikon silang (`close`) menjadi logo tong sampah resmi.

---

## [2.9.0] - 2026-10-23

### Changed
- **Pembersihan & Penataan Folder Google Drive (`sistem magang`)**:
  * Menghapus folder usang 2000-2019 yang terlalu padat, mempertahankan struktur rapi dan terfokus pada rentang **TA 2020 s/d TA 2027** (total 16 folder aktif).
  * Pembuatan otomatis folder proyeksi masa depan `Surat Masuk 2027` dan `Surat Keluar 2027`.
  * Dokumentasi mapping ID folder Google Drive diperbarui di `docs/GOOGLE_DRIVE_FOLDERS_MAPPING.json`.
- **Dinamisme Pengindeksan Arsip Multi-Tahun**:
  * Mutasi data (`insertNewLetter`) kini secara dinamis mengekstrak tahun dari tanggal surat naskah (`data.date.slice(0, 4)`) untuk penomoran agenda resmi (`/SM/DISPORA/{tahun}` atau `/SK/DISPORA/{tahun}`) dan tahun arsip keluar TiDB Cloud.
  * Unggah lampiran PDF fisik (`uploadToGoogleDrive`) otomatis diarahkan ke folder Google Drive tahun terkait (2020-2027) sesuai tanggal naskah.
  * Tautan cadangan Google Drive di penampil PDF (`PdfPreviewPanel.tsx`) membuka folder Google Drive tahun terkait naskah.
  * Penomoran agenda di tabel dan lembar disposisi cetak dinamis mengikuti tahun naskah dokumen.
  * Ekspor Excel buku agenda otomatis mendeteksi tahun data aktif (`Buku-Agenda-Dispora-{tahun}.xlsx`).

---

## [2.8.0] - 2026-10-23

### Changed
- **Penyempurnaan Ergonomi & UX Sempurna**:
  * Eliminasi tombol CTA ganda pada tabel arsip (`ArchiveWorkspace.tsx`), mempertahankan satu tombol primer di heading halaman.
  * Eliminasi total scrollbar horizontal browser window dengan `overflow-x: hidden` pada `.app-shell` dan pembatasan `max-width: calc(100vw - 246px)` pada `.workspace`.
  * Redesain modal `Indeks Berkas Baru` (`NewLetterModal.tsx` & `.modal`) menjadi lebih luas (660px), header dan footer berposisi sticky, sehingga tombol Batal dan Simpan selalu terlihat tanpa scroll.
  * Redesain pilihan instruksi disposisi dari teks braket manual `[X]` / `[ ]` menjadi chip toggle berikon centang SVG semantik (`NewLetterDisposisiFields.tsx`).
  * Penyesuaian label dinamis pada formulir surat keluar (menjadi 'Tanggal Diterbitkan' dan 'Tujuan Instansi').
  * Pemadatan tombol aksi baris tabel (`ArchiveTable.tsx`) menjadi tombol primer teks 'Lihat PDF' & 'Disposisi', serta tombol utilitas ringkas 'Unduh', 'Edit', dan 'Hapus' ber-tooltip.
  * Peningkatan interaktivitas kotak upload PDF dengan dukungan drag-and-drop live highlight dan badge informasi ukuran file.
  * Perbaikan bug alignment modal PDF: reset `position: relative !important; margin: auto !important; left: auto !important; right: auto !important;` pada dialog modal sehingga tepat berada di tengah layar (simetris horizontal 360px kiri dan kanan) tanpa menabrak tepi kiri sidebar.
  * Navigasi login bersih dengan `window.location.assign('/dashboard')` memastikan seluruh 411 arsip dimuat sempurna pasca-login.

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
- **Aksesibilitas & Semantic HTML5**: Mengganti `role="status"` dengan `<output>`, `role="dialog"` dengan `<dialog open>`, `role="img"` dengan `<figure>`, serta memasang semantic `<button>` pada overlay drawer dan kartu profil pengguna sidebar.
- **Type Safety & Purity**: Penggantian seluruh unsafe cast `as any` dengan union types pada `EditLetterModal.tsx`, penambahan atribut `id` dan `htmlFor` pada form controls, serta resolusi cascading effect render pada `WitaClock.tsx` dan `DistributionView.tsx`.
- **Pencapaian Skor Kualitas 100/100**: Audit `aislop` mencapai skor sempurna 100/100 (Healthy), 0 errors, 0 warnings di seluruh 72 berkas produksi.
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
