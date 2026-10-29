# MATRIKS KOMPETENSI AKADEMIK & PERTANGGUNGJAWABAN ILMIAH
**Laporan Praktik Kerja Lapangan (PKL) / Magang Mahasiswa S1 Teknik Informatika**  
*Program Studi: Teknik Informatika, Fakultas Teknologi Informasi, UNISKA Banjarmasin*  
*Nama Mahasiswa: Muhammad Rizki Ramadhani (NPM: 2310010406)*  
*Judul Proyek: Rancang Bangun Sistem Informasi Pengelolaan Arsip Persuratan dan Disposisi Berbasis Web pada Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 1. Pendahuluan & Landasan Akademik

Matriks ini disusun sebagai dokumen pendukung resmi pembelaan karya ilmiah (*defense sheet*) di hadapan Dosen Pembimbing dan Dosen Penguji Sidang Magang/PKL FTI UNISKA. Dokumen ini menghubungkan setiap capaian pembelajaran mata kuliah (CPMK) kurikulum Teknik Informatika secara konkret dengan implementasi nyata pada kode sumber aplikasi SIPASD.

---

## 2. Pemetaan Mata Kuliah Kurikulum ke Artefak Kode Nyata

| No | Mata Kuliah Terkait | Capaian Kompetensi Ilmiah | Bukti Konkret pada Proyek SIPASD | File Bukti Kode |
|---|---|---|---|---|
| **1** | **Rekayasa Perangkat Lunak (RPL)** | Penerapan siklus hidup perangkat lunak terstandar, pemodelan sistem UML 2.5, evaluasi PIECES, dan arsitektur modular berorientasi objek/komponen. | - 18 diagram UML lengkap (Use Case, Activity, Sequence, Class Diagram).<br>- Evaluasi PIECES membandingkan Google Drive manual vs SIPASD.<br>- Prinsip Single Responsibility: 87 file di `src/` masing-masing <= 200 baris kode (LOC). | `docs/UML_DIAGRAMS.md`<br>`docs/BAB_3_ANALISIS_PERANCANGAN_DRAFT.md`<br>`src/components/` |
| **2** | **Basis Data & Basis Data Lanjut** | Perancangan skema relasional 3NF, integritas referensial foreign keys, pengindeksan performa tinggi, dan transaksi atomik ACID dengan proteksi persaingan data (*race condition*). | - 8 tabel relasional TiDB Cloud (InnoDB engine).<br>- Transaksi atomik `conn.beginTransaction()`, `commit()`, `rollback()`.<br>- Klausa `FOR UPDATE` untuk penguncian nomor agenda persuratan dinas agar tidak terjadi nomor ganda saat diakses simultan. | `docs/DATABASE_SCHEMA.md`<br>`scripts/migrate-db.ts`<br>`src/lib/letter-mutations.ts`<br>`src/lib/db.ts` |
| **3** | **Pemrograman Web Terdistribusi** | Pengembangan web modern Fullstack, Server-Side Rendering (SSR), RESTful Route Handlers, optimasi bundle klien, dan integrasi multi-cloud API. | - Next.js 15 App Router + React 19 + TypeScript.<br>- Integrasi Cloudinary REST API untuk streaming naskah PDF cepat.<br>- Integrasi Google Drive API v3 (OAuth 2.0 & Service Account) untuk brankas cadangan arsip daerah. | `src/app/api/letters/route.ts`<br>`src/lib/cloudinary.ts`<br>`src/lib/gdrive.ts`<br>`src/middleware.ts` |
| **4** | **Keamanan Informasi & Jaringan** | Penerapan mitigasi kerentanan OWASP Top 10, sanitasi input terhadap SQL Injection & XSS, imunitas pencurian sesi via cookie HttpOnly, dan jejak forensik audit trail. | - Proteksi injeksi SQL dengan kueri berparameter murni `?`.<br>- Validasi tipe data dan sanitasi karakter tag `<>` di boundary API.<br>- Enkripsi password menggunakan algoritma bcrypt salted hash.<br>- Header keamanan ketat (CSP, HSTS, X-Frame-Options: SAMEORIGIN).<br>- Modul rekaman jejak audit forensik dengan IP dan User Agent. | `docs/SECURITY_AUDIT.md`<br>`src/lib/rate-limit.ts`<br>`src/lib/auth.ts`<br>`src/lib/audit.ts`<br>`next.config.ts` |
| **5** | **Sistem Informasi Manajemen (SIM)** | Penerapan Standard Operating Procedure (SOP) tata kelola SPBE kearsipan persuratan dinas, alur lembar disposisi pimpinan, dan Buku Ekspedisi. | - Digitalisasi alur naskah dinas 5 tahap sesuai Permendagri No. 83 Tahun 2022.<br>- Modul penatausahan lembar disposisi fisik pimpinan terhubung 5 bidang dinas.<br>- Ekspor otomatis Buku Agenda format spreadsheet Microsoft Excel (.xlsx) bergaris batas dinas. | `docs/SOP_KEDINASAN.md`<br>`src/components/PrintDisposisiModal.tsx`<br>`src/lib/exportExcel.ts`<br>`src/app/api/expedition/route.ts` |
| **6** | **Pengujian Perangkat Lunak (Software QA)** | Penyusunan test suite otomatis, pengujian fungsionalitas Black Box, type safety static checking, dan audit performa browser nyata. | - Suite verifikasi otomatis 6 dimensi di `scripts/verify-system.ts`.<br>- Pengujian fungsional Black Box 15 skenario pada dokumen BAB 4.<br>- Uji regresi end-to-end multi-resolusi (layar 375px ponsel hingga desktop 1440px) tanpa layout overflow horizontal. | `docs/TESTING_REPORT.md`<br>`docs/BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md`<br>`scripts/verify-system.ts` |

---

## 3. Garis Pertahanan Ujian Sidang Magang (FAQ Penguji & Jawaban Terstruktur)

### Pertanyaan 1: Mengapa membangun sistem web baru jika dinas sudah memiliki Google Drive?
**Jawaban Mahasiswa**:
"Google Drive hanya berfungsi sebagai media penyimpanan file pasif (*raw cloud storage*). Berdasarkan analisis kami pada 420 berkas riil Dispora Kalsel di Bab 3, sebanyak 68.3% berkas pindaian scanner TU tidak memiliki text-layer digital sehingga Google Drive tidak dapat mencari isi surat tersebut. Selain itu, Google Drive tidak memiliki metadata instansi, nomor agenda terstruktur, alur disposisi pimpinan, dan tidak dapat menghasilkan laporan Buku Agenda format Microsoft Excel yang diwajibkan dalam LPJ Kearsipan Daerah. SIPASD hadir sebagai katalog berindeks cepat dengan penampil PDF terintegrasi, bukan sekadar tempat menaruh berkas."

### Pertanyaan 2: Bagaimana Anda menjamin nomor agenda surat tidak bentrok jika dua petugas TU menginput bersamaan?
**Jawaban Mahasiswa**:
"Pada modul `src/lib/letter-mutations.ts`, kami tidak menggunakan query `SELECT MAX()` biasa yang rentan terhadap kondisi balapan (*race condition*). Kami membungkus pembuatan nomor agenda dalam transaksi atomik ACID dengan klausa `FOR UPDATE` pada basis data TiDB Cloud Serverless. Transaksi ini mengunci baris agenda terakhir secara eksklusif di level database engine sampai nomor urut baru ter-generate dan proses `commit` selesai. Jika terjadi kegagalan jaringan di tengah jalan, sistem menjalankan `rollback` otomatis sehingga nomor agenda dinas dijamin selalu konsisten, urut, dan bebas duplikasi."

### Pertanyaan 3: Bagaimana sistem mengamankan dokumen rahasia kedinasan dari akses ilegal?
**Jawaban Mahasiswa**:
"Keamanan diimplementasikan berlapis (*defense-in-depth*):
1. **Lapisan Otentikasi**: Sesi pengguna menggunakan token JWT terenkripsi yang disimpan dalam cookie bertribut `HttpOnly; Secure; SameSite=Strict`, sehingga kebal terhadap pencurian token oleh serangan XSS di peramban.
2. **Lapisan Otorisasi (RBAC 4 Tingkat)**: Setiap rute mutasi API memeriksa peran pengguna (`SUPER_ADMIN`, `PETUGAS_ARSIP`, `PIMPINAN`, `BIDANG`). Staf biasa tidak diizinkan menghapus data atau mengubah hak akses.
3. **Lapisan Penyimpanan Dokumen**: Streaming PDF diakses melalui rute `/api/pdf` yang memvalidasi whitelist folder dinas dan memblokir upaya *path traversal*.
4. **Jejak Forensik**: Setiap aktivitas login, perubahan data, pencatatan ekspedisi, dan logout dicatat ke tabel `audit_logs` bersama alamat IP dan identitas peramban aparatur."

### Pertanyaan 4: Apakah aplikasi ini sudah diuji pada perangkat smartphone pimpinan?
**Jawaban Mahasiswa**:
"Sudah diuji secara menyeluruh. Kami menerapkan prinsip responsive mobile-first dengan batas `overflow-x: hidden` dan pembatasan kontainer `max-width: 100vw` di seluruh antarmuka. Kami telah menguji rendering antarmuka pada viewport smartphone 375x667 px (standar iPhone SE), 390x844 px (iPhone 14/15), dan layar tablet/iPad 768 px. Hasil pengujian menunjukkan nol piksel overflow horizontal, touch-target tombol tindakan memenuhi standar WCAG (minimal 42x42 px), dan penampil PDF dapat dibuka secara proporsional di layar gawai pimpinan."
