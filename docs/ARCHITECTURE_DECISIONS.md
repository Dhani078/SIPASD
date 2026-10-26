# ARCHITECTURE DECISION RECORDS (ADR): SIPASD
**Sistem Informasi Pengelolaan Arsip Surat Dispora Provinsi Kalimantan Selatan**  
*Format: Michael Nygard Architecture Decision Record (MADR 3.0.0)*  
*Penyusun: Muhammad Rizki Ramadhani (NPM: 2110010078 / Dhani078)*  
*Institusi: Program Studi Teknik Informatika, FTI UNISKA Muhammad Arsyad Al Banjari Banjarmasin*  
*Mitra Magang: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## Ringkasan Matriks Keputusan Arsitektur

| Nomor ADR | Topik Keputusan | Status | Dampak Utama |
|---|---|---|---|
| ADR-001 | Pemilihan Framework Fullstack Next.js 15 App Router | ACCEPTED | Hybrid SSR, Route Handlers, Zero API Overhead |
| ADR-002 | Pemilihan Basis Data TiDB Cloud Serverless | ACCEPTED | MySQL Wire-Compatible, Distribusi Global, Skalabilitas Instan |
| ADR-003 | Strategi Penyimpanan Ganda Cloudinary CDN & Google Drive 5 TB | ACCEPTED | Streaming Cepat <2 Detik & Cadangan Permanen Instansi |
| ADR-004 | Kompresi Naskah PDF Otomatis pada Sisi Klien (Browser-Side) | ACCEPTED | Pematuhan Ambang Payload 4.5 MB Vercel Serverless |
| ADR-005 | Otentikasi Sesi Stateless Cookie HttpOnly JWT & RBAC 4 Tingkat | ACCEPTED | Imunitas XSS/CSRF & Otorisasi Ketat Berbasis Peran Dinas |
| ADR-006 | Transaksi Atomik Database dengan Baris Terkunci (FOR UPDATE) | ACCEPTED | Eliminasi Tabrakan Nomor Agenda Persuratan (Zero Race Condition) |
| ADR-007 | Strategi Pencocokan Multi-Format Agenda (UUID, Full, Short Numeric) | ACCEPTED | Ketahanan Mutasi Data & Zero 404 pada Penghapusan Parsial |

---

## ADR-001: Pemilihan Framework Fullstack Next.js 15 App Router dan React 19

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Sekretariat Dispora Kalsel membutuhkan portal repositori persuratan dinas yang dapat diakses secara instan oleh pimpinan melalui peramban mobile (smartphone pejabat) serta oleh petugas pengarsip melalui komputer kerja kantor. Sistem membutuhkan kecepatan muat halaman beranda publik, keamanan Server-Side Rendering untuk otentikasi data aparatur, dan keringanan pemeliharaan infrastruktur tanpa perlu menyewa VPS mandiri yang membutuhkan konfigurasi web server Nginx/Apache manual.

### Alternatif yang Dipertimbangkan
1. **Single Page Application (Vite + React 18) + Backend Terpisah (Express/NestJS)**:
   - Kelebihan: Pemisahan repositori frontend dan backend secara independen.
   - Kekurangan: Memerlukan dua hosting terpisah, timbul masalah konfigurasi CORS, dan pemuatan awal lambat (blank screen saat mengunduh bundle JavaScript besar di jaringan seluler).
2. **Framework Monolitik PHP (Laravel 11 / Native)**:
   - Kelebihan: Familiar bagi lingkungan instansi daerah.
   - Kekurangan: Pemuatan interaktif viewer PDF dan manipulasi dropzone dokumen terasa kaku tanpa dukungan ekosistem React modern.
3. **Next.js 15 App Router + React 19 + TypeScript**:
   - Kelebihan: Pustaka React modern terpadu, Route Handlers menggantikan server backend mandiri, dukungan edge middleware untuk keamanan sesi, dan integrasi mulus dengan Vercel Zero-Cost Serverless.

### Keputusan
Mengadopsi **Next.js 15 (App Router) dengan TypeScript dan React 19**.

### Konsekuensi
- Seluruh endpoint API beroperasi sebagai Route Handlers (`src/app/api/`) dengan latensi edge rendah.
- Batasan modularitas ketat diterapkan: seluruh berkas komponen antarmuka dan utilitas dibatasi maksimal 200 baris kode (LOC) guna mencegah kompleksitas kognitif god-file.
- Tipe data statis TypeScript memverifikasi integritas payload input sebelum query database dieksekusi.

---

## ADR-002: Pemilihan Basis Data TiDB Cloud Serverless (MySQL Protocol)

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Sistem mengelola katalog 411 arsip naskah dinas fisik riil Tahun Anggaran 2026 dengan relasi ke data pegawai, bidang kerja, kode klasifikasi, riwayat disposisi, dan buku ekspedisi. Dibutuhkan basis data relasional ACID yang mendukung protokol SQL standar, memiliki proteksi SSL/TLS wajib, tidak mengalami cold-start lambat (seperti Supabase tier gratis saat idle), serta memiliki kapasitas kuota yang mencukupi tanpa biaya operasional dinas.

### Alternatif yang Dipertimbangkan
1. **Supabase (PostgreSQL Serverless)**:
   - Mengalami sleep/pause otomatis jika proyek tidak diakses dalam 7 hari pada tier gratis, berisiko menghentikan akses portal dinas saat awal pekan.
2. **MySQL Lokal XAMPP / MariaDB VPS**:
   - Membutuhkan port forwarding publik, IP publik statis instansi, dan rentan terhadap pemadaman listrik di ruang server kantor Dispora Kalsel.
3. **TiDB Cloud Serverless (PingCAP)**:
   - Kompatibel 100% dengan wire protocol MySQL 8.0 (`mysql2` Node.js driver), koneksi SSL terenkripsi wajib, kuota gratis 25 GB Storage dan 50 Juta Request Unit, serta arsitektur multi-AZ berkeandalan tinggi (region AWS Singapore / `ap-southeast-1`).

### Keputusan
Menggunakan **TiDB Cloud Serverless** sebagai basis data relasional tunggal SIPASD.

### Konsekuensi
- Kueri dapat menggunakan sintaks standar MySQL (`SELECT`, `LEFT JOIN`, `SUBSTRING_INDEX`, `COALESCE`, `UUID()`).
- Koneksi diatur melalui pooling terkelola (`mysql2/promise`) dengan parameter `ssl: { rejectUnauthorized: true }`.
- Zero cold-start: respon kueri tercatat stabil di bawah 45 ms dari edge Vercel Singapore.

---

## ADR-003: Strategi Penyimpanan Ganda Cloudinary CDN dan Google Drive 5 TB

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Arsip surat kedinasan memiliki karakteristik ganda:
1. Pimpinan membutuhkan akses visual instan naskah pindaian (<2 detik) langsung di layar ponsel tanpa harus mengunduh file besar atau membuka aplikasi pihak ketiga.
2. Regulasi kearsipan pemerintah mewajibkan dokumen tersimpan permanen pada penyimpanan awan resmi instansi (Google Drive akun `arsipdispora2026` dengan kuota 5 TB).

### Alternatif yang Dipertimbangkan
1. **Hanya Menggunakan Google Drive API**:
   - Pratinjau Google Drive sering memicu login wall akun Google pribadi pejabat, memblokir rendering iframe via `X-Frame-Options: DENY`, dan membatasi kuota download harian (*Google Drive Download Quota Exceeded*).
2. **Hanya Menggunakan Cloudinary CDN**:
   - Batas kuota gratis Cloudinary adalah 25 kredit per bulan. Menjadikannya satu-satunya arsip jangka panjang berisiko jika kuota bulanan melampaui batas saat audit dokumen BPK.
3. **Arsitektur Penyimpanan Ganda Simultan (Dual Cloud Storage)**:
   - Cloudinary bertindak sebagai CDN Pratinjau Cepat (*Streaming Engine*).
   - Google Drive bertindak sebagai Brankas Cadangan Permanen (*Official Government Archival Vault*).

### Keputusan
Menerapkan **Dual Cloud Storage** secara otomatis pada rute `/api/upload`:
- Berkas diunggah ke Cloudinary untuk memperoleh URL streaming instan.
- Berkas diunggah serentak ke Google Drive API v3 pada subfolder tahun dinas bersangkutan (`Surat Masuk 2026` / `Surat Keluar 2026`) dan diberikan hak akses publik `role: reader` otomatis.
- Database TiDB mencatat kedua tautan secara berpasangan (`file_url` dan `drive_url`).

### Konsekuensi
- Jika Cloudinary mengalami gangguan jaringan, tombol cadangan Google Drive di antarmuka tetap menyediakan akses unduh langsung.
- Beban streaming harian ditangani penuh oleh CDN tanpa membebani kuota API Google Drive instansi.

---

## ADR-004: Kompresi Naskah PDF Otomatis pada Sisi Klien (Browser-Side)

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Infrastruktur hosting Vercel Serverless memberlakukan batas keras muatan request HTTP (*Serverless Function Payload Limit*) sebesar 4.5 MB. Mesin scanner kantor Dispora Kalsel (Canon SC1011 / ClearScanner) sering menghasilkan berkas PDF warna 300 DPI dengan ukuran berkisar antara 5 MB hingga 10 MB. Jika diunggah langsung, Vercel akan memutus koneksi dengan galat fatal `413 Content Too Large`.

### Alternatif yang Dipertimbangkan
1. **Kompresi Server-Side di Node.js Runtime**:
   - Gagal karena berkas mentah berukuran 8 MB sudah ditolak oleh Vercel edge router sebelum mencapai fungsi serverless.
2. **Meminta Petugas Mengompresi Manual di Website Eksternal (iLovePDF)**:
   - Memperlambat alur kerja pegawai dan berisiko membocorkan rahasia naskah dinas ke server kompresi pihak ketiga gratisan di internet.
3. **Kompresi Otomatis pada Sisi Klien (Browser Canvas & PDF-Lib)**:
   - Menggunakan `pdfjs-dist` untuk merender tiap halaman PDF ke canvas browser pada resolusi teroptimasi (150 DPI), lalu menyusun ulang dokumen menggunakan `pdf-lib`.

### Keputusan
Mengimplementasikan modul utilitas `src/lib/pdf-compress.ts` di peramban klien:
- Sistem mendeteksi otomatis jika berkas yang dipilih petugas berukuran > 4 MB.
- Kompresi dieksekusi transparan di memori browser sebelum form submission dikirimkan.
- Ukuran berkas terpangkas rata-rata 60% s/d 75% (misal 9.77 MB menjadi 2.4 MB) tanpa penurunan keterbacaan teks dan stempel dinas.

### Konsekuensi
- Memastikan 100% berkas unggahan lolos dari ambang batas HTTP 413 Vercel.
- Menghemat konsumsi bandwidth jaringan internet kantor dan kuota penyimpanan Cloudinary.

---

## ADR-005: Otentikasi Sesi Stateless Cookie HttpOnly JWT dan RBAC 4 Tingkat

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Aplikasi persuratan dinas menangani dokumen penting dan rahasia. Akses terhadap berkas dan fungsi disposisi harus diproteksi dengan otentikasi ketat. Sistem harus kebal terhadap pencurian token sesi via serangan Cross-Site Scripting (XSS) dan pemalsuan permintaan antar-situs (CSRF).

### Alternatif yang Dipertimbangkan
1. **Penyimpanan Token di LocalStorage Peramban**:
   - Sangat rentan terhadap pencurian token oleh script berbahaya jika terjadi celah injeksi XSS pada salah satu library pihak ketiga.
2. **Stateful Session Database (Tabel Sesi MySQL)**:
   - Mengharuskan query tambahan ke basis data pada setiap request navigasi pengguna, membebani batas request unit TiDB Cloud.
3. **Stateless JWT Cookie HttpOnly dengan Proteksi Edge Middleware**:
   - Token ditandatangani secara kriptografis menggunakan algoritma HS256 (`jose` library) dan disimpan dalam cookie bertribut `HttpOnly; Secure; SameSite=Strict; Path=/`.

### Keputusan
Menerapkan **JWT Cookie HttpOnly Stateless** yang divalidasi pada gerbang `src/middleware.ts` dan fungsi otorisasi Server Components.

### Matriks Role-Based Access Control (RBAC):
- `SUPER_ADMIN` (Kepala Dinas / PPTK / Administrator IT): Akses penuh ke seluruh arsip, manajemen pengguna, jejak audit forensik, dan pengaturan sistem.
- `PETUGAS_ARSIP` (Staf Tata Usaha / Pengarsip): Hak pencatatan indeks surat baru, ubah data naskah, catat lembar disposisi, dan catat buku ekspedisi distribusi.
- `PIMPINAN` (Kepala Dinas / Sekretaris): Hak baca seluruh arsip, penelusuran riwayat disposisi pimpinan, dan pratinjau PDF.
- `BIDANG` (Kepala Bidang Kepemudaan / Olahraga / Sarpras): Hak baca naskah yang terdisposisi ke bidang terkait dan unduh berkas dinas.

### Konsekuensi
- JavaScript sisi klien tidak memiliki akses baca terhadap token sesi (kebal eksfiltrasi token).
- Seluruh endpoint API mutasi (`POST /api/letters`, `PUT /api/letters`, `DELETE /api/letters`, `POST /api/upload`) memeriksa sesi dan menolak akses ilegal dengan kode `HTTP 401 Unauthorized` atau `HTTP 403 Forbidden`.

---

## ADR-006: Transaksi Atomik Database dengan Baris Terkunci (FOR UPDATE) untuk Nomor Agenda

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Dalam administrasi pemerintahan, nomor urut agenda persuratan dinas bersifat legal dan sakral. Dua petugas yang mencatat surat masuk atau keluar secara bersamaan tidak boleh menghasilkan nomor agenda kembar (*duplicate agenda number*) atau melompati urutan.

### Alternatif yang Dipertimbangkan
1. **Auto Increment ID Kolom MySQL Saja**:
   - Nomor agenda dinas memiliki format terstruktur gabungan: `<Nomor Urut>/<SM|SK>/DISPORA/<Tahun>` (contoh: `1251/SM/DISPORA/2026`). Kolom auto-increment numerik tunggal tidak mampu mengisolasi siklus per tahun dan per jenis surat.
2. **Pengecekan Maksimum Tanpa Transaksi (`SELECT MAX() ...`)**:
   - Rentan terhadap kondisi balapan (*race condition*). Jika dua request tiba dalam selisih milidetik, keduanya akan membaca nilai maksimum yang sama dan menghasilkan nomor agenda duplikat.
3. **Transaksi Atomik Terisolasi dengan Row-Level Locking (`FOR UPDATE`)**:
   - Membuka transaksi database (`conn.beginTransaction()`), mengunci baris pembacaan agenda terakhir dengan klausa `FOR UPDATE`, menghitung nomor urut berikutnya, mengeksekusi `INSERT`, dan melakukan `conn.commit()`.

### Keputusan
Menerapkan **Transaksi Atomik Database dengan Baris Terkunci (`FOR UPDATE`)** pada fungsi `insertNewLetter` di `src/lib/letter-mutations.ts`.

### Konsekuensi
- Menjamin nomor urut agenda persuratan dinas selalu unik, berurutan, dan bebas dari benturan kompetisi data (*zero concurrency race*).
- Jika terjadi kegagalan sistem di tengah proses, fungsi secara otomatis menjalankan `conn.rollback()` untuk menjaga konsistensi integritas data.

---

## ADR-007: Strategi Pencocokan Multi-Format Agenda (UUID, Full String, Short Numeric)

### Status
ACCEPTED (2026-10)

### Konteks Kebutuhan
Katalog antarmuka SIPASD menampilkan nomor agenda numerik ramah baca (contoh: `0973` atau `1181`), sedangkan rute integrasi backend dan entitas relasional TiDB Cloud menggunakan UUID standar RFC 4122 (contoh: `f47ac10b-58cc-4372-a567-0e02b2c3d479`), dan naskah resmi menyimpan nomor agenda kedinasan lengkap (contoh: `0973/SM/DISPORA/2026`). Operasi penghapusan atau pembaruan arsip yang dikirimkan klien dapat membawa salah satu dari ketiga format pengenal tersebut.

### Alternatif yang Dipertimbangkan
1. **Memaksa Klien Hanya Mengirimkan UUID Database**:
   - Menimbulkan kegagalan jika komponen klien atau tautan eksternal hanya memiliki referensi nomor agenda fisik dari buku register manual.
2. **Pencocokan Multi-Kondisi Terindeks via SQL `SUBSTRING_INDEX`**:
   - Kueri SQL memeriksa kesesuaian target pada 3 level pengenal:
     `WHERE id = ? OR nomor_agenda = ? OR SUBSTRING_INDEX(nomor_agenda, '/', 1) = ?`

### Keputusan
Menerapkan **Pencocokan Multi-Kondisi Terindeks** pada fungsi mutasi `deleteLettersBatch` dan `updateLetter` di `src/lib/letter-mutations.ts`.

### Konsekuensi
- Menghilangkan galat *"Arsip tidak ditemukan di database"* (HTTP 404) ketika pengguna menghapus arsip melalui nomor agenda pendek dari tabel.
- State klien hook `useLetterActions.ts` menyimpan pasangan `id` numerik dan `rawId` UUID database, menjamin baris terhapus hilang seketika dari layar tanpa perlu memuat ulang peramban.
