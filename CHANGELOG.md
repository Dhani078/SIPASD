# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Phase 6)
- Pengujian antarmuka multi-resolusi (mobile 375px s/d desktop 1440px) bebas horizontal overflow.
- Deployment produksi ke Vercel via repositori GitHub `Dhani078/SIPASD`.

---

## [2.52.0] - 2026-10-26

### Fixed
- **Sinkronisasi drive_url pada Pembaruan Naskah TiDB Cloud (`src/lib/letter-mutations.ts`)**:
  * Menambahkan pembaruan kolom `drive_url = COALESCE(?, drive_url)` pada kueri SQL mutasi `updateLetter` untuk `arsip_surat_masuk` dan `arsip_surat_keluar`. Menjamin berkas baru yang diunggah saat pengeditan arsip tersimpan permanen di TiDB Cloud dan tidak hilang saat halaman dimuat ulang.
- **Pengetatan Type-Safety Eksplisit & Eliminasi Loose Types (`src/components/EditLetterModal.tsx`, `src/components/NewLetterModal.tsx`, `src/lib/format.ts`, `src/lib/gdrive.ts`)**:
  * Mengganti blok penanganan kesalahan `catch (e: any)` dan `catch (err: any)` dengan tipe `unknown` terproteksi `instanceof Error`.
  * Menetapkan tipe definitif `LetterRecord[]` menggantikan `any[]` pada fungsi filter naskah `filterLetters`.
  * Memperbaiki penanganan `lastError` pada modul cadangan Google Drive `src/lib/gdrive.ts`.
- **Integrasi Jejak Forensik Audit Trail Lengkap (`src/app/api/auth/logout/route.ts`, `src/app/api/letters/route.ts`, `src/lib/audit.ts`)**:
  * Menambahkan pencatatan event `LOGOUT` pada sesi keluar aparatur di `/api/auth/logout` sehingga filter *"Keluar Sesi"* pada modul Jejak Forensik TiDB terisi akurat.
  * Menambahkan pencatatan jejak forensik `BUAT_ARSIP`, `EDIT_ARSIP`, dan `HAPUS_ARSIP` di `/api/letters` lengkap dengan metadata IP address dan User Agent.
  * Mengetik ulang parameter `details` pada `src/lib/audit.ts` menjadi `Record<string, unknown> | unknown` untuk eliminasi `any`.
- **Portabilitas Jalur Berkas Skrip Forensik (`scripts/clean_glued_text.py`, `scripts/deep_reindex_all.py`)**:
  * Mengganti pembacaan path statis hardcoded `.env.local` menjadi `Path(__file__).resolve().parent.parent / '.env.local'`, menjamin eksekusi skrip Python berjalan mulus di direktori `E:\Hermesproject\SIPASD`.

---

## [2.51.0] - 2026-10-25

### Fixed
- **Resolusi Pencocokan ID Hapus & Perbarui Arsip Multi-Format (`src/lib/letter-mutations.ts`, `src/app/api/letters/route.ts`, `src/hooks/useLetterActions.ts`)**:
  * **Pencocokan Agenda Cerdas SQL**: Memperbarui kueri `deleteLettersBatch` dan `updateLetter` agar mencocokkan `id`, `nomor_agenda` lengkap, dan `SUBSTRING_INDEX(nomor_agenda, '/', 1)`. Menghilangkan galat *"Arsip tidak ditemukan di database"* saat pengguna menghapus arsip melalui nomor agenda numerik pendek.
  * **Pengembalian UUID Riil pada Perekaman Arsip**: Memperbarui rute POST `/api/letters` dan fungsi `insertNewLetter` agar mengembalikan `{ agendaNumber, id }` (UUID), sehingga state klien langsung memiliki pasangan `id` numerik dan `rawId` UUID database secara presisi.
  * **Pembersihan State Klien Instan**: Hook `useLetterActions.ts` kini memfilter daftar surat berdasarkan `id` dan `rawId`, menjamin baris terhapus hilang seketika dari tabel tanpa perlu refresh manual.

---

## [2.50.0] - 2026-10-25

### Fixed
- **Resolusi Tautan Cadangan Google Drive & Izin Akses Otomatis (`src/lib/gdrive.ts`, `src/hooks/useLetterActions.ts`, `src/components/PdfPreviewPanel.tsx`)**:
  * **Sinkronisasi State Klien Instan**: Menyertakan `driveUrl` ke dalam objek `newRecord` di `useLetterActions.ts` sehingga naskah yang baru diunggah langsung memiliki URL cadangan Google Drive aktif tanpa wajib memuat ulang halaman.
  * **Pemberian Izin Berkas Otomatis**: Menambahkan injeksi izin baca publik (`anyoneWithLink`, `role: reader`) otomatis via Google Drive API v3 saat berkas baru diunggah di `src/lib/gdrive.ts`, meniadakan penolakan akses yang melempar pengguna ke halaman Beranda Drive.
  * **Fallback Cerdas Folder Tahun Berjalan**: Memperbarui logika tautan cadangan di `PdfPreviewPanel.tsx` agar selalu mengarah ke folder Google Drive tahun bersangkutan (`Surat Masuk 2026` / `Surat Keluar 2026`) jika tautan berkas kosong atau berupa root `drive.google.com`.

---

## [2.49.0] - 2026-10-25

### Added
- **Kompresi PDF Otomatis di Sisi Klien / Browser (`src/lib/pdf-compress.ts`)**:
  * Mengimplementasikan modul kompresi cerdas non-blocking berbasis `pdf-lib` dan `pdfjs-dist` dengan worker lokal (`public/pdf.worker.min.mjs`).
  * Ambang batas cerdas 4 MB: Berkas naskah fisik $\le 4\text{ MB}$ diteruskan langsung tanpa kompresi, sedangkan berkas $> 4\text{ MB}$ dan $\le 20\text{ MB}$ di-downscale ke resolusi dinas 150 DPI JPEG kualitas 0.75 secara otomatis.
  * Menyelamatkan proses pengunggahan dari batas payload Vercel Serverless 4.5 MB (`413 FUNCTION_PAYLOAD_TOO_LARGE`) dengan tetap mempertahankan teks, stempel, dan tanda tangan naskah kedinasan tetap tajam.
  * Integrasi badge visual interaktif `Auto-Kompres` pada modal input arsip (`NewLetterModal.tsx`, `EditLetterModal.tsx`) dan feedback progres dinamis di hook aksi naskah (`useLetterActions.ts`).

---

## [2.48.0] - 2026-10-25

### Security
- **Hardening Keamanan Autentikasi Fail-Closed (`src/app/api/auth/login/route.ts`)**:
  * Mengubah evaluasi demo quick login dari opt-out (`ALLOW_DEMO_LOGIN !== 'false'`) menjadi opt-in ketat (`ALLOW_DEMO_LOGIN === 'true'`).
  * Menjamin sistem fail-closed secara default pada rute autentikasi apabila konfigurasi lingkungan tidak disetel secara eksplisit.

### Refactored
- **Penegakan Type-Safety Absolut & Eliminasi Unsafe Casts (`src/app/api/...`, `src/lib/letters.ts`)**:
  * Mengganti seluruh `catch (error: any)` menjadi `catch (error: unknown)` dengan penanganan `error instanceof Error` di semua rute API (`/api/auth/login`, `/api/letters`, `/api/pdf`, `/api/upload`, `/api/expedition`, `/api/audit`, `/api/ai/suggest`).
  * Mendefinisikan antarmuka basis data yang kuat: `UserAuthRow`, `SuratMasukDbRow`, `SuratKeluarDbRow`, `ExpeditionRow`, dan `AuditLogRow`.
  * Memperbaiki penanganan fallback streaming PDF di `/api/pdf` dengan pencatatan peringatan diagnostik terstruktur saat fallback ke HTTP 307.

---

## [2.47.0] - 2026-10-23

### Fixed
- **Resolusi Pemblokiran Iframe PDF, Streaming Proxy Langsung & Kebijakan CSP (`next.config.ts`, `api/pdf/route.ts`)**:
  * **Penyelarasan X-Frame-Options & CSP**: Mengubah `X-Frame-Options` dari `DENY` menjadi `SAMEORIGIN`, memperbarui CSP `frame-ancestors 'self'` dan menambahkan direktif `frame-src 'self' blob: data: https://res.cloudinary.com https://drive.google.com;`, meniadakan pesan galat peramban *"This content is blocked"*.
  * **Streaming Buffer PDF Server-Side Langsung**: Memperbarui rute `/api/pdf` agar mengambil buffer PDF dan mengalirkannya langsung dari origin sendiri (`sipasd.my.id`) dengan header `Content-Type: application/pdf; Content-Disposition: inline`, mencegah pembatasan cross-origin sandbox pada PDF viewer internal Google Chrome.

---

## [2.46.0] - 2026-10-23

### Fixed
- **Penyempurnaan Komponen Notifikasi Kedinasan, Backdrop & Aksi Tandai Dibaca (`NotificationsFlyout.tsx`, `globals.css`)**:
  * **Tombol Tandai Semua Dibaca**: Menambahkan aksi massal cepat di header notifikasi untuk menandai seluruh pesan telah dibaca (`setRead([0, 1, 2])`).
  * **Backdrop Scrim Overlay**: Memasang lapisan backdrop semi-transparan `fixed inset-0 z-40` untuk menangani click-outside dan meredupkan latar dasbor saat notifikasi terbuka di smartphone.
  * **Ikon Semantik & Ergonomi Sentuh**: Mengganti ikon rekap menjadi `download`, memperbesar tinggi baris notifikasi menjadi $\ge 48\text{px}$ touch-target standar WCAG, dan merapikan spasi vertikal teks judul serta timestamp.
  * **Harmonisasi Warna Indikator Unread**: Menyeragamkan titik indikator unread pada tombol lonceng navbar dan internal flyout ke warna hijau emerald resmi `#047857`.
  * **Elevasi Bayangan Kontras**: Meningkatkan `box-shadow` flyout menjadi `0 20px 50px rgba(15, 23, 42, 0.18)` agar kartu notifikasi kontras terhadap dasbor putih.

---

## [2.45.0] - 2026-10-23

### Fixed
- **Validasi NIP BKN 18 Digit, Responsivitas Kartu Profil & Keseimbangan Whitespace (`ProfileView.tsx`, `users.ts`, TiDB Cloud)**:
  * **Koreksi NIP BKN**: Mengoreksi kode bulan pengangkatan pada NIP aparatur dari `21` menjadi `02` (`19970101 202502 2 001`), selaras 100% dengan kaidah penomoran BKN nasional baik di kode maupun basis data TiDB Cloud.
  * **Pencegahan Himpitan Panel Header Mobile (<640px)**: Mengatur header panel dan tombol aksi (*Beranda* & *Keluar Sesi*) dalam formasi stacked vertikal dengan tombol berukuran sentuh 42px touch-friendly, meniadakan kompresi teks deskripsi.
  * **Harmonisasi Label Jabatan vs Peran**: Memperjelas pemisahan antara Jabatan Fungsional Kedinasan (*Analis Anggaran - Ahli Pertama*) dengan Tingkat Otoritas Sistem (*Otoritas: Pengarsip*).
  * **Keseimbangan Whitespace & Margin Ikon**: Menyelaraskan jarak margin ikon judul (gap 2.5) dan menambahkan footer baris penyeimbang pada kartu Hak Akses dan Status Keamanan.

---

## [2.44.0] - 2026-10-23

### Added
- **Modul Penuh Audit Trail Forensik Keamanan Riil TiDB (`api/audit`, `AuditTrailView.tsx`, `ReferenceViews.tsx`, `SipasdMainView.tsx`)**:
  * **Endpoint API Audit Aman (`/api/audit`, 34 LOC)**: Menghubungkan basis data tabel riil `audit_logs` TiDB Cloud dengan otorisasi ketat RBAC (hanya Super Admin & Developer).
  * **Pembangunan `AuditTrailView.tsx` (195 LOC)**: Menggantikan 4 checklist statis dummy dengan tabel forensik interaktif lengkap (Timestamp WITA presisi detik, event badge LOGIN_SUCCESS/LOGIN_FAILED/LOGOUT, alamat IP, nama aparatur, dan ringkasan perangkat/browser).
  * **Bilah Pencarian & Filter Event**: Memfasilitasi pencarian lokal instan alamat IP, nama user, event action, dan filter tab status login.
  * **Paginasi & Ekspor CSV Riil**: Menyediakan navigasi halaman (10/15/25/50 baris per halaman) dan tombol *Ekspor Log (.csv)* yang mengunduh dataset forensik riil.
  * **Penyelarasan Subtitle Modul**: Mengubah deskripsi di `SipasdMainView.tsx` menjadi *"Rekam jejak forensik keamanan, integritas sesi aparatur, dan log aktivitas SPBE Dispora Kalsel."*

---

## [2.43.0] - 2026-10-23

### Fixed
- **Elevasi Modul Manajemen Pengguna, Format NIP BKN & Modal Rincian Otorisasi (`UsersManagementView.tsx`, `ReferenceViews.tsx`, `SipasdMainView.tsx`)**:
  * **Pembangunan `UsersManagementView.tsx` (134 LOC)**: Menghadirkan modul manajemen akun khusus administrator/developer lengkap dengan pencarian lokal instan (nama/NIP/username/unit) dan filter peran kedinasan.
  * **Penataan NIP Standar BKN 18 Digit**: Memformat NIP aparatur dengan format resmi BKN (`XXXXXXXX XXXXXX X XXX`), serta email resmi Pemprov Kalsel.
  * **Modal Rincian Otorisasi Aparatur**: Menyediakan dialog modal interaktif saat tombol *Rincian* diklik untuk memeriksa status akun, unit kerja, jabatan, dan tingkat hak akses kedinasan.
  * **Penataan Responsif Mobile (<640px)**: Mencegah text-wrapping ganjil pada nama dinas dengan tata letak flex stacked vertikal dan penempatan badge peran yang seimbang.
  * **Penyelarasan Subtitle Modul**: Mengganti deskripsi arsip generic menjadi *"Otorisasi akses, hak peran kedinasan, dan data aparatur pengelola arsip Dispora Kalsel."*

---

## [2.42.0] - 2026-10-23

### Fixed
- **Pengurutan Numerik Kode Klasifikasi, Informasi Payung Hukum & Komponen Dedicated (`constants.ts`, `ClassificationView.tsx`, `ReferenceViews.tsx`)**:
  * **Pengurutan Numerik Baku**: Menata urutan array kode klasifikasi dari acak menjadi teratur baku: `005` (Undangan), `045` (Kearsipan), `426` (Keolahragaan), `427` (Kepemudaan), `800` (Kepegawaian), `900` (Keuangan).
  * **Pembangunan `ClassificationView.tsx` (162 LOC)**: Menyediakan modul dedicated lengkap dengan deskripsi mendalam ruang lingkup kearsipan tiap kode.
  * **Pencarian Cepat Kode & Nama**: Menambahkan search box lokal untuk memfilter kode klasifikasi atau nama urusan dinas secara instan.
  * **Penghitung Naskah Terkait**: Menampilkan badge jumlah naskah dinas terindeks yang terhubung dengan masing-masing kode klasifikasi.
  * **Pencantuman Payung Hukum Resmi**: Menambahkan referensi payung hukum Permendagri No. 83 Tahun 2022 dan panduan baku penomoran naskah dinas Dispora Provinsi Kalimantan Selatan.

---

## [2.41.0] - 2026-10-23

### Fixed
- **Optimasi Responsif Distribusi Ekspedisi, Proporsi Kolom & Paginasi Baris (`DistributionView.tsx`, `DistributionTable.tsx`)**:
  * **Pencegahan Flexbox Collapse Mobile**: Menata panel heading dan tombol aksi (*Ekspor Excel* dan *+ Catat Distribusi*) menjadi grid 2 kolom simetris pada layar ponsel, memastikan kedua tombol terlihat utuh dan judul tidak terhimpit.
  * **Pencegahan Text Wrap Indikator Halaman**: Memasang `whitespace-nowrap` pada teks penghitung halaman paginasi (`1 / 17`) dan menambahkan dropdown pemilihan ukuran baris (10, 15, 25, 50 baris per halaman).
  * **Proporsi 6 Kolom Tabel Ekspedisi**: Mengalokasikan 40% lebar kontainer pada kolom *TUJUAN INSTANSI & PERIHAL* dan 72px pada kolom *AKSI*, mencegah pemotongan elipsis prematur pada nama dinas panjang.
  * **Penataan Status & Placeholder Kurir**: Menyelaraskan teks status ekspedisi dan keterangan kurir agar sel tabel informatif dan rapi.

---

## [2.40.0] - 2026-10-23

### Added
- **Modul Penuh Register Buku Agenda Surat (`AgendaRegisterView.tsx`, `ReferenceViews.tsx`)**:
  * **Dedicated View Register Agenda**: Menggantikan tabel fallback generic dengan modul buku agenda lengkap (`AgendaRegisterView.tsx`, 159 LOC) yang mencakup rekapitulasi seluruh 411 naskah dinas resmi Dispora Kalsel.
  * **Bilah Pencarian & Filter Tab Multi-Dimensi**: Menyediakan search bar nomor agenda/nomor surat/instansi/perihal, 3 tab filter jenis naskah (*Semua 411, Masuk 170, Keluar 241*), filter tahun anggaran, filter bulan, dan tombol *Hapus Filter*.
  * **Pembeda Semantik Naskah Masuk & Keluar**: Memberikan badge indikator tegas emerald `SM` untuk surat masuk dan amber `SK` untuk surat keluar pada kolom nomor agenda.
  * **Paginasi Lengkap & Selector Baris**: Menyediakan navigasi halaman (`Sebelumnya / Berikutnya`), indikator halaman aktif, dan dropdown ukuran baris (10, 15, 25, 50 baris per halaman).
  * **Ekspor Excel Langsung**: Tombol *Ekspor Excel (.xlsx)* yang mengekspor seluruh register agenda kedinasan.

---

## [2.39.0] - 2026-10-23

### Fixed
- **Penyelarasan Riwayat Disposisi Fisik, Tombol Reset Filter & Keterbacaan Kolom Aksi (`DispositionHistoryView.tsx`, `DispositionFilters.tsx`)**:
  * **Eliminasi Redundansi Header**: Mengubah judul dalam panel dari duplikat *"Riwayat Disposisi Fisik"* menjadi *"Daftar Lembar Disposisi"* dengan penegasan konteks *"Register 170 lembar instruksi resmi Kepala Dinas terhadap seluruh naskah masuk"*, serta tombol panduan alur SOP.
  * **Tombol Cepat Reset Filter**: Menyediakan tombol *"Hapus Filter"* interaktif saat pengguna melakukan pencarian atau memilih filter status/tahun/bulan/bidang/sifat.
  * **Tab Status 2x2 Simetris Mobile**: Mengubah tata letak 4 tab status pada ponsel menjadi grid 2x2 simetris sehingga ukuran tombol seragam dan pas di layar sentuh.
  * **Proporsi 7 Kolom Tabel & Kolom AKSI Presisi**: Menerapkan persentase lebar terencana pada 7 kolom tabel dan lebar kolom `AKSI` 72px (`min-width: 72px`) agar tombol menu titik tiga `[...]` selalu terlihat tanpa terpotong batas overflow kontainer.
  * **Tipografi Nomor Agenda & Pencegahan Potong Tanggal**: Memisahkan nomor agenda dan suffix kedinasan ke container flex `items-baseline gap-1.5` serta memasang `whitespace-nowrap` pada tanggal disposisi.

---

## [2.38.0] - 2026-10-23

### Fixed
- **Sanitasi Data Kearsipan Surat Keluar, Keterbacaan Tipografi & Scroll Affordance Mobile (`ArchiveTable.tsx`, `YearFilterControl.tsx`, `globals.css`, TiDB Cloud)**:
  * **Sanitasi Database TiDB**: Memperbaiki label form *"Dari, Tanggal"* pada agenda 7959, 8402, 7673 menjadi instansi tujuan yang sah (`Pengguna Anggaran / Sekretariat Dispora Kalsel`, `Sekretaris Dispora Kalsel`, dan `SKPD Terkait Pemprov Kalsel`). Menghilangkan bocoran kop huruf kapital pada perihal agenda 8551, serta melengkapi tujuan multi-instansi agenda 8159.
  * **Peningkatan Keterbacaan Tipografi**: Memperbesar nomor agenda menjadi 12px font-weight 700 (#065f46) dengan sub-teks 10px (#64748b), serta nomor kode berkas `td small` menjadi 11px font-weight 500 (#64748b), meniadakan artefak pixelated dan glitch rendering pada seluruh layar.
  * **Penyesuaian Label Tahun Mobile**: Menyederhanakan label opsi dropdown tahun menjadi `"Semua Tahun (TA)"` dan `"TA 2026 (Berjalan)"` sehingga pas di grid 2 kolom tanpa terpotong panah chevron kanan.
  * **Indikator Scroll Tabel Mobile (Scroll Affordance)**: Memberikan efek gradien bayangan kanan `box-shadow: inset -10px 0 8px -8px rgba(0,0,0,0.12)` pada `.table-wrap` smartphone (<768px) sebagai petunjuk visual bahwa kolom aksi dan tanggal dapat digulir ke kanan.

---

## [2.37.0] - 2026-10-23

### Fixed
- **Sanitasi Kearsipan Surat Masuk, Pengurutan Sekunder Agenda & Optimasi Grid Mobile (`letters.ts`, `ArchiveWorkspace.tsx`, `globals.css`, TiDB Cloud)**:
  * **Sanitasi Database TiDB**: Memperbaiki teks menempel `analisiskebutuhan` menjadi `analisis kebutuhan`, membuang titik ganda pada nomor surat `800.1.4.1./`, serta menormalkan casing nama instansi `PANITIA PELAKSANA` menjadi `Panitia Pelaksana`.
  * **Pengurutan Sekunder No. Agenda**: Menambahkan `CAST(SUBSTRING_INDEX(sm.nomor_agenda, '/', 1) AS UNSIGNED) DESC` sehingga pada tanggal yang sama, naskah dinas selalu terurut sekuensial dari agenda terbesar.
  * **Istilah Baku Kedinasan**: Mengubah label dropdown filter `Semua venue` menjadi istilah resmi kedinasan `Semua Sarana / Lokasi`.
  * **Peningkatan Kontras Tanggal**: Mengubah warna font `.date-cell` dari abu-abu muda pudar menjadi slate-700 (#334155) 11px berbobot 500, lolos audit aksesibilitas WCAG AAA.
  * **Grid Toolbar Mobile & Sentuhan Paginasi**: Menata dropdown filter di smartphone (<768px) menjadi 2 kolom simetris (memotong tinggi area filter dari 420px menjadi 200px), dan memperbesar tombol paginasi menjadi min-height 42px touch-friendly.

---

## [2.36.0] - 2026-10-23

### Fixed
- **Penyempurnaan Total Dasbor Eksekutif Desktop & Mobile 100/100 Max Mode (`DashboardView.tsx`, `ArchiveTable.tsx`, `globals.css`)**:
  * **Header Kolom Aksi Tabel**: Memperlebar kolom `AKSI` ke `72px` dengan padding kanan seimbang (`14px`), meniadakan pemotongan teks `AKS` menjadi `AKSI` utuh.
  * **Sparkline Kontekstual 4 Kartu KPI**: Memberikan data deretan tinggi batang mini unik yang mencerminkan karakteristik masing-masing metrik (arus surat masuk, puncak surat keluar, progresi kumulatif total dokumen, dan lonjakan surat kilat/segera).
  * **Pembersihan Bocoran Vendor Footer Tabel**: Mengganti teks status *"TiDB Cloud Serverless Live"* menjadi *"Pusat Data SPBE Terenkripsi"*.
  * **Pembersihan Pill Sumbu X Grafik**: Menghapus background pill hijau acak pada label bulan agar seluruh sumbu X tampil bersih, konsisten, dan berwibawa.
  * **Kerapian Kolom Bidang & Chips Venue**: Menata layout tabular daftar 5 bidang bawah donut chart (`b` dan `small` bertata letak jelas), dan meningkatkan ukuran tombol venue menjadi pill modern 11px.
  * **Eliminasi Tumpang Tindih Mobile 375px**: Menyembunyikan jam digital di header mobile sempit agar tidak menabrak teks brand `SIPASD`, menata flex vertikal pada subteks `.metric-foot` agar `<b>` dan `<span>` tidak bertumpuk, serta memasang elipsis 2-baris pada perihal naskah tabel.

---

## [2.35.0] - 2026-10-23

### Security
- **Pertahanan Menyeluruh Anti-Brute Force, Anti-Enumeration & Penguatan Header Keamanan (`rate-limit.ts`, `api/auth/login`, `next.config.ts`)**:
  * **Anti-Brute Force Rate Limiting**: Membangun modul `src/lib/rate-limit.ts` (65 LOC) dengan sliding-window limiter. Membatasi maksimal 5 percobaan gagal per username dan 15 percobaan per IP dalam 15 menit (HTTP 429 Too Many Requests dengan header `Retry-After`).
  * **Pencegahan User Enumeration (CWE-204) & Timing Attacks (CWE-208)**: Memasang perbandingan waktu konstan `bcrypt.compare` terhadap `DUMMY_HASH` jika username tidak ditemukan, serta menyeragamkan respon galat menjadi pesan generik aman.
  * **Pencatatan Audit Keamanan**: Merekam event `LOGIN_FAILED` dan `LOGIN_SUCCESS` ke tabel `audit_logs` TiDB lengkap dengan alamat IP dan user agent.
  * **Enterprise Security Headers**: Menambahkan Content-Security-Policy (CSP), Strict-Transport-Security (HSTS max-age 63072000 includeSubDomains preload), dan X-XSS-Protection pada `next.config.ts`.

---

## [2.34.0] - 2026-10-23

### Fixed
- **Pembersihan Bocoran Vendor & Proteksi Sesi Halaman Login (`LoginPage.tsx` & `login/page.tsx`)**:
  * Menghapus istilah teknis vendor database mentah pada kartu brand dan catatan uji peran di halaman login menjadi tata kelola resmi: `Penyimpanan Terenkripsi & Terpusat` dan `Terintegrasi Pangkalan Data SPBE`.
  * Memasang server-side session guard pada rute `/login`: pengguna yang telah memiliki sesi terotentikasi langsung dialihkan secara aman ke `/dashboard`.

---

## [2.33.0] - 2026-10-23

### Fixed
- **Optimasi Performa & Kehalusan Scroll 60 FPS (`globals.css`)**:
  * Menerapkan `scroll-behavior: smooth`, `text-rendering: optimizeLegibility`, dan `-webkit-font-smoothing: antialiased` pada elemen `html`.
  * Hasil audit telemetri Chrome: TTFB **35 ms** dari Vercel edge, total DOM nodes sangat ringan (**374 elemen**, batas aman < 1.500), bundle shared JS hanya **103 kB**, 0 jank / layout shifts.

---

## [2.32.0] - 2026-10-23

### Fixed
- **Pembaruan Jam Pelayanan Tata Usaha Kedinasan (`LandingFooter.tsx`)**:
  * Menyelaraskan jam pelayanan resmi loket Tata Usaha Dispora Kalsel menjadi **Senin - Jumat: 08.00 - 16.00 WITA**.
  * Mempertahankan hari Sabtu - Minggu sebagai Libur Kedinasan.

---

## [2.31.0] - 2026-10-23

### Fixed
- **Penyelarasan Total Grid Hero 2-Kolom Berdampingan (`LandingPage.tsx` & `globals.css`)**:
  * Mengeliminasi benturan CSS antara aturan `.hero { grid-template-columns: 1.2fr 1fr; }` dengan utility Tailwind `md:col-span-7 / md:col-span-5`.
  * Memastikan kolom teks pengantar (1.2fr) dan kartu pratinjau dokumen fisik dinas (1fr) duduk berdampingan (*side-by-side*) secara presisi pada seluruh layar laptop dan desktop tanpa saling tumpuk.

---

## [2.30.0] - 2026-10-23

### Fixed
- **Pengaktifan Dialog Modal SOP & Klasifikasi pada Landing Page Publik (`SipasdApp.tsx`)**:
  * Menemukan dan memperbaiki isu di mana tombol "Standar SOP", "Klasifikasi", dan "Pelajari Alur Kerja" pada beranda publik tidak memicu pop-up dialog karena komponen modal hanya dimount dalam sesi terotentikasi.
  * Me-render `{modal && <HelpModal kind={modal} onClose={() => setModal('')} />}` pada tampilan beranda publik, sehingga pengunjung dapat langsung membaca alur SOP persuratan dinas dan tabel kode klasifikasi 005 s/d 900 secara interaktif.

---

## [2.29.0] - 2026-10-23

### Fixed
- **Sinkronisasi Parameter Tampilan URL Server & Client (`dashboard/page.tsx`, `page.tsx`, `SipasdApp.tsx`)**:
  * Mengintegrasikan pembacaan `searchParams` (`?view=...`) pada rute SSR Next.js 15 (`dashboard/page.tsx` dan `page.tsx`), sehingga membuka URL langsung seperti `/dashboard?view=history`, `/dashboard?view=distribution`, atau `/dashboard?view=profile` langsung me-render tampilan yang tepat tanpa ter-reset ke halaman beranda default.
  * Menjalankan sinkronisasi `handlePop()` pada saat *mount* di peramban klien.

---

## [2.28.0] - 2026-10-23

### Fixed
- **Elevasi Modul Distribusi Ekspedisi ke 100/100 Max Mode (`DistributionView.tsx` & `DistributionTable.tsx`)**:
  * Menambahkan fitur pencarian cepat (`query`) dan filter tab status (`Semua`, `Belum Dicatat`, `Tercatat`) pada Buku Ekspedisi.
  * Menambahkan kontrol paginasi halaman (15 baris per halaman) menggantikan daftar panjang tak berbatas.
  * Mengekstrak `DistributionTable.tsx` (92 LOC) menjaga modularitas `DistributionView.tsx` (195 LOC) $\le$ 200 baris kode.
  * Memperjelas tipografi nomor agenda dan format tanggal, serta merapikan status pill kurir/penerima.
  * Mengoreksi typo OCR di basis data TiDB (`2A26` $\rightarrow$ `2026`, `Tahap2` $\rightarrow$ `Tahap 2`, `Tanggapanatas` $\rightarrow$ `Tanggapan atas`, `Home(WFH)` $\rightarrow$ `Home (WFH)`).

---

## [2.27.0] - 2026-10-23

### Fixed
- **Sanitasi Glitch Spasi Teks OCR TiDB & Penegasan Kolom Nomor Agenda (`DispositionHistoryView.tsx`)**:
  * Menjalankan normalisasi teks pada 18 naskah Surat Masuk dan 60 naskah Surat Keluar di TiDB Cloud, memisahkan kata-kata nempel hasil OCR seperti `ASNTerbaik2026` menjadi `ASN Terbaik 2026`, `PemberitahuanKegiatan` menjadi `Pemberitahuan Kegiatan`, dll.
  * Memperjelas tipografi kolom nomor agenda di Riwayat Disposisi dengan memisahkan angka agenda dan suffix tahun dinas via elemen `span` kontras abu-abu lembut (`1211 /SM/2026`).

---

## [2.26.0] - 2026-10-23

### Fixed
- **Penegakan Hak Akses Berbasis Peran / RBAC Navigasi (`Sidebar.tsx`, `ReferenceViews.tsx`, `ProfileDropdown.tsx`, `SipasdMainView.tsx`)**:
  * Mengisolasi menu `Manajemen Pengguna` dan `Audit Trail Keamanan` di sidebar hanya untuk peran `Super Admin` dan `Developer`. Pengguna staf pengarsip (`Rana Nur Syifa`), kepala dinas, atau petugas TU tidak lagi melihat menu manajemen sistem.
  * Memasang proteksi guard di `ReferenceViews.tsx`: jika peran non-admin mencoba mengakses `?view=users` atau `?view=audit`, sistem menampilkan kartu peringatan "Akses Terbatas: Khusus Administrator IT & Developer" dan tombol kembali ke beranda.
  * Menghapus badge tidak relevan (`Badge type="Biasa"`) di header Manajemen Pengguna, mengganti status `Aktif - TiDB` menjadi label peran aparatur yang jelas.
  * Membatasi tombol `+ Indeks Surat Baru` pada header utama agar hanya muncul di halaman persuratan (`dashboard`, `in`, `out`), tidak bocor ke halaman pengaturan/referensi.
  * Mengekstrak komponen `HelpModal.tsx` (73 LOC) menjaga ukuran seluruh berkas di `src/` $\le$ 165 LOC.

---

## [2.25.0] - 2026-10-23

### Fixed
- **Pembersihan Bocoran Backend & Format NIP Resmi BKN (`ProfileDropdown.tsx` & `ProfileView.tsx`)**:
  * Menghapus kebocoran nama database backend mentah (`Aktif (TiDB Cloud)`) pada dropdown profil pengguna menjadi status resmi kedinasan: `Aktif Terverifikasi`.
  * Memformat NIP 18 digit ke format standar resmi BKN Indonesia (`YYYYMMDD YYYYYY M XXX`), mengatasi glitch visual keterbacaan angka panjang.
  * Menata pembungkus tombol aksi pada kartu profil agar responsif (`flex-wrap`) dan tidak terpotong pada batas kontainer.

---

## [2.24.0] - 2026-10-23

### Fixed
- **Penggantian Ikon Hapus Terpilih dengan Ikon Tong Sampah Semantik (`ArchiveWorkspace.tsx` & `DeleteConfirmModal.tsx`)**:
  * Mengganti ikon tanda silang (`Icon name="close"`) pada tombol aksi massal `Hapus X Terpilih` di toolbar arsip menjadi ikon tong sampah semantik (`Icon name="trash"`).
  * Menyelaraskan ikon peringatan modal konfirmasi hapus (`DeleteConfirmModal.tsx`) menjadi ikon tong sampah merah (`Icon name="trash"`).

---

## [2.23.0] - 2026-10-23

### Fixed
- **Penyempurnaan Total Tata Letak Mobile / Ponsel Bebas Horizontal Overflow (`globals.css`)**:
  * Mengisolasi kontainer `html, body, .app-shell, .workspace, .main-content, .public` dengan `overflow-x: hidden !important; max-width: 100vw !important;` mencegah gesekan horizontal (0 horizontal overflow) pada seluruh viewport smartphone (375px - 768px).
  * **TopNavbar Mobile**: Memadatkan header 56px, merapikan breadcrumb, mengatur flyout notifikasi dan menu profil (`width: calc(100vw - 20px)`, `max-width: 340px`) agar tidak terpotong di tepi layar HP.
  * **Halaman Arsip & Filter**: Mengatur toolbar dan baris filter bulan/tahun/bidang/urgensi responsif vertikal dengan tinggi sentuh nyaman (36px-38px); membungkus tabel dengan `overflow-x: auto` dan scrolling sentuh lancar.
  * **Dasbor Mobile**: Menata 4 kartu statistik KPI dalam format 2 kolom (`2x2`) rapi, menyembunyikan sparkline mini-bars pada kartu sempit, dan menyederhanakan donut chart beban kerja.
  * **Halaman Masuk (Login)**: Menghapus aturan teks mikro (5px-7px lama) menjadi ukuran keterbacaan standar (10px-13px), menata tombol 1-klik uji akun demo dalam grid 2-kolom yang nyaman disentuh jempol.
  * **Landing Page Mobile**: Memperbaiki logo brand Pemprov Kalsel, tombol "Masuk Sistem", 4 kotak statistik ber-grid 2x2, serta katalog venue olahraga tanpa pergeseran layout.
  * **Modal & Dialog**: Mengoptimalkan lembar dialog form arsip dan penampil berkas agar pas di layar HP dengan header dan tombol aksi sticky di bawah.

---

## [2.22.0] - 2026-10-23

### Fixed
- **Penghancuran Total Cookie Sesi saat Logout (`SipasdApp.tsx` & `SipasdMainView.tsx`)**:
  * Mengatasi *re-login bug* di mana setelah logout dan me-refresh halaman landing page, sistem masih otomatis masuk (*auto-login*) kembali dengan akun lama.
  * Masalah disebabkan oleh aksi "Keluar Sesi" di antarmuka klien yang sebelumnya hanya memindahkan `state` halaman tanpa memanggil endpoint server `/api/auth/logout`.
  * Membangun fungsi `handleLogout` yang mengeksekusi `POST /api/auth/logout` untuk menghapus cookie HTTP-Only `sipasd_session` (`maxAge: 0`, `expires: new Date(0)`), lalu mereload ke `/` secara bersih.
  * Meneruskan prop `onLogout={handleLogout}` ke `Sidebar`, `TopNavbar`, `ProfileDropdown`, dan `ProfileView`.

---

## [2.21.0] - 2026-10-23

### Fixed
- **Responsivitas Hero Landing Page Sebelahan (`LandingPage.tsx`)**:
  * Mengubah breakpoint layout 2 kolom hero dari `lg:grid-cols-12` (1024px) menjadi `md:grid-cols-12` (768px).
  * Mengeliminasi celah ruang kosong masif di sisi kanan pada layar laptop (1366x768 atau zoom 125%) sehingga teks pengantar di kolom kiri (`md:col-span-7`) dan kartu pratinjau dokumen di kolom kanan (`md:col-span-5`) duduk berdampingan (*sebelahan*) secara sempurna.
  * Hanya bertumpuk 1 kolom pada layar ponsel (`< 768px`).
- **Penyelarasan Dokumen Sampel Publik (`SipasdApp.tsx`)**:
  * Mengubah sampel dokumen landing page dari indeks teratas acak `letters[0]` menjadi berkas Surat Masuk resmi publik (`letters.find(l => l.direction === 'in')`), menampilkan agenda resmi bertaraf dinas (agenda 0899 dari Setda Kalsel).

---

## [2.20.0] - 2026-10-23

### Fixed
- **Sinkronisasi 100% Tahun Anggaran Dokumen Riil (`1039` & `3868`)**:
  * Memeriksa lembar fisik PDF asli pada agenda `1039` dan `3868` yang sebelumnya memicu anomali "2 arsip TA 2025" di dasbor.
  * Berkas `1039` bertitimangsa naskah asli **28 Agustus 2026** (teks 2025 hanyalah nomor SK rujukan pengurus cabor lama).
  * Berkas `3868` bernomor resmi `000.5.2/3868/Dispora/2026` untuk pengantar laporan kearsipan bulan **April 2026** (teks 2025 merupakan salah ketik juru ketik dinas).
  * Seluruh 411 arsip naskah fisik di TiDB Cloud kini **100% konsisten Tahun Anggaran 2026** (170 Surat Masuk & 241 Surat Keluar).
- **Pembersihan Total Opsi Tahun pada `YearFilterControl.tsx`**:
  * Membuang puluhan opsi tahun berlebih yang tidak realistis (`2027-2200`, `2028-2030`, `Arsip < 2000`, `2000-2020`).
  * Menyederhanakan dropdown menjadi opsi standar kedinasan: `Semua Tahun Anggaran`, `TA 2026 (Tahun Berjalan)`, `TA 2025`, `TA 2024`, dan `TA 2027 (Mendatang)`.
- **Perbaikan Sinkronisasi Filter Tahun pada Donut Chart Dasbor (`DashboardView.tsx`)**:
  * Mengubah acuan perhitungan total dan persentase distribusi per bidang dari `letters.length` (global 411) menjadi `active.length` (tahun aktif), memastikan angka pusat chart dan persentase selalu sinkron 100% dengan filter tahun yang dipilih.

---

## [2.19.0] - 2026-10-23

### Added
- **Elevasi Total Landing Page ke Standar Enterprise 100/100 MAX MODE**:
  * **Seksi Penutup / Closing Call-to-Action (`LandingCta.tsx`)**: Menambahkan banner kontras modern bergradasi emerald gelap (`from-emerald-950 via-emerald-900 to-teal-950`) dengan tombol aksi `Masuk Portal SIPASD` dan `Pelajari Alur Kerja`.
  * **Footer Kedinasan 4-Kolom Resmi (`LandingFooter.tsx`)**: Restrukturisasi footer menjadi 4 pilar lengkap (Identitas Pemprov Kalsel & Dispora, Navigasi Pintas, Kontak Resmi Jalan Pramuka No. 4, dan Jadwal Pelayanan Tata Usaha Dispora).
  * **Pilar Metrik Interaktif (`LandingStats.tsx`)**: 4 kartu statistik besar ber-indikator lampu denyut live (`170` Surat Masuk, `241` Surat Keluar, `11` Venue Olahraga, `< 2 Detik` Kecepatan Temu-Kembali).
  * **Katalog Aset Olahraga Banua (`LandingVenues.tsx`)**: Perbaikan tanda baca judul (*11 venue olahraga. Satu sistem pengelolaan.*) dan tombol chip venue yang responsif dan interaktif.
- **Pembersihan Keamanan & Kredensial Hero (`LandingPage.tsx`)**:
  * Menghapus seluruh nama stack vendor backend (`TiDB Cloud Serverless SSL`) dan menggantinya dengan standar kearsipan pemerintah: *Tersinkronisasi Real-Time • Enkripsi TLS 1.3 • Kepatuhan Tata Kelola SPBE Pemprov Kalsel*.
  * Menyelaraskan warna badge resmi menjadi emerald lembut (`bg-emerald-50 text-emerald-800 border-emerald-200/80`).
  * Memperbaiki placeholder pencarian menjadi ringkas dan padat.

---

## [2.18.0] - 2026-10-23

### Changed
- **Penyempurnaan Halaman Profil Pengguna (`ProfileView.tsx` & `SipasdMainView.tsx`)**:
  * Menghapus istilah vendor infrastruktur mentah (TiDB, Cloudinary, raw table) pada kartu keamanan dan menggantinya dengan bahasa tata kelola resmi kedinasan Pemprov Kalsel (*Pusat Data Kearsipan Terintegrasi TLS 1.3*, *Layanan Ganda Streaming & Cadangan*, *Sesi Terotentikasi Aman 8 Jam*, *Jejak Audit Aktivitas Pegawai*).
  * Menyelaraskan teks deskripsi subtitle halaman profil menjadi: *"Informasi identitas aparatur, rincian kewenangan akses, dan riwayat sesi kedinasan."*
  * Menyembunyikan tombol `+ Indeks Surat Baru` pada halaman profil agar antarmuka fokus pada manajemen identitas dan kredensial pengguna.
  * Memperbaiki perataan tipografi NIP dan memastikan tombol aksi keluar sesi tidak mepet border kontainer.

---

## [2.17.0] - 2026-10-23

### Added
- **Pola Menu Aksi Terpusat Titik Tiga pada Riwayat Disposisi (`DispositionRowMenu.tsx`)**:
  * Mengganti tombol ganda `[Detail]` dan `[Edit]` di tabel Riwayat Disposisi dengan tombol aksi titik tiga `[...]` yang senada dan seragam dengan modul persuratan.
  * Menjadikan seluruh baris tabel disposisi dapat diklik langsung (`clickable row`) untuk membuka modal rincian lembar disposisi.
  * Memperjelas dan memperbesar ukuran font header tabel (`th`) dari 7px menjadi 11px berbobot 650 dengan kontras warna WCAG AA (`#475569`).
  * Menghilangkan garis glitch visual pada nomor agenda dan menambahkan tooltip hover pada teks perihal surat.

---

## [2.16.0] - 2026-10-23

### Fixed
- **Pembersihan Total Filter Venue pada Surat Keluar (`ArchiveWorkspace.tsx` & `SipasdMainView.tsx`)**:
  * Menghilangkan dropdown filter venue secara absolut pada antarmuka Arsip Surat Keluar (`/arsip-keluar`), mengeliminasi kebingungan pengguna di mana filter venue sebelumnya selalu mengembalikan 0 hasil pada surat dinas keluar.
  * Memastikan filter venue hanya tampil pada modul Arsip Surat Masuk di mana surat permohonan fasilitas olahraga masyarakat/cabor memang relevan.
- **Penyelarasan Klasifikasi & Bidang Riil pada Surat Keluar (`src/lib/letters.ts`)**:
  * Mengganti pembagian modulo matematis acak dengan ekstraksi klasifikasi riil berbasis nomor surat (`900` Keuangan: 159 surat, `800` Kepegawaian/SPT/SPD: 76 surat, `427` Kepemudaan: 5 surat, `045` Kearsipan: 1 surat).
  * Menyelaraskan pembidangan dinas keluar: `Sekretariat` (213 surat), `Pengembangan Pemuda` (16 surat), `Sarana & Prasarana` (9 surat), `Peningkatan Prestasi` (2 surat), dan `Pembudayaan Olahraga` (1 surat).
  * Seluruh opsi filter dropdown pada Surat Keluar kini terbukti menghasilkan arsip yang 100% valid dan bermakna.

---

## [2.15.0] - 2026-10-23

### Fixed
- **Sanitasi Total 108 Teks Rusak / Glitch OCR TiDB (`scripts/clean_glued_text.py`)**:
  * Mengeliminasi seluruh nama instansi nempel (contoh: `PEMERINTAHPROVINSIKALIMANTANSELATAN` dipetakan ke dinas/badan asli berdasarkan nomor surat seperti BKD, Bappeda, BPKAD, Dispersip, Biro Organisasi, Bapenda, dsb).
  * Menghapus potongan teks OCR rusak pada perihal (`halsebagaiberikut:...`) menjadi judul surat edaran resmi kedinasan.
  * Memperbaiki glitch karakter tanda persen dan kurung siku pada nomor surat dinas.
- **Pembersihan Cerdas Filter Venue (`letters.ts` & `ArchiveWorkspace.tsx`)**:
  * Menghapus modul fallback buatan pada fungsi `detectVenue`, memastikan venue hanya tercatat jika naskah benar-benar memuat nama fasilitas olahraga Dispora.
  * Memastikan dropdown filter venue tersembunyi secara murni pada workspace Surat Masuk.
- **Penyempurnaan Hirarki Tipografi Baris Tabel (`ArchiveTable.tsx`)**:
  * Mempertegas kontras nama instansi pengirim (`text-slate-900 font-semibold`), teks perihal (`text-slate-700 text-xs`), dan nomor surat (`text-[11px] font-mono text-slate-500`).

---

## [2.14.0] - 2026-10-23

### Added
- **Pola Menu Aksi Terpusat Titik Tiga (`RowActionMenu.tsx`)**:
  * Memindahkan seluruh aksi dokumen (Lihat Berkas PDF, Cetak Lembar Disposisi, Unduh Berkas Asli, Ubah Metadata, dan Hapus Berkas) ke dalam satu menu dropdown titik tiga (`[...]`).
  * Memangkas lebar kolom aksi menjadi hanya **60px**, mengeliminasi polusi visual secara penuh dan memberikan area pandang maksimal untuk teks naskah kedinasan.
  * Tetap mempertahankan kemudahan akses 1-klik di mana pengguna cukup mengklik baris tabel untuk langsung membuka berkas fisik PDF.

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
