# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# SIPASD: SISTEM INFORMASI PENGELOLAAN ARSIP SURAT DISPORA
**Klasifikasi Dokumen: Dokumen Persyaratan Produk Rekayasa Perangkat Lunak (PRD)**  
**Target Instansi: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan**  
**Afiliasi Akademik: Program Studi S1 Teknik Informatika, Fakultas Teknologi Informasi, UNISKA MAB Banjarmasin**  
**Penyusun: Muhammad Rizki Ramadhani (NPM: 2310010406)**  
**Versi Dokumen: 2.0.0-PROD (Final Release Baseline - 100/100 Maxx Mode)**  
**Status: Disetujui untuk Implementasi Produksi & Naskah Laporan Magang**

---

## 1. IKHTISAR EKSEKUTIF & DIAGNOSTIK PRODUK (EXECUTIVE SUMMARY & PRODUCT LENS)

### 1.1 Visi Produk
SIPASD (*Sistem Informasi Pengelolaan Arsip Surat Dispora*) adalah repositori e-arsip digital terindeks berbasis web responsif (*Progressive Web App-ready*) yang dirancang khusus untuk mengorganisasi, mengindeks, menelusuri, dan menyajikan 420+ dokumen fisik pindaian (*scan*) Surat Masuk dan Surat Keluar Tahun Anggaran 2026 di lingkungan Sekretariat Dispora Provinsi Kalimantan Selatan. 

Aplikasi ini memecahkan masalah mendasar tata kelola manual di Google Drive (`arsipdispora2026`), memangkas waktu temu-kembali (*information retrieval time*) dokumen dari **15-30 menit menjadi < 2 detik**, menyediakan *in-browser streaming PDF viewer* tanpa kewajiban mengunduh berkas mentah, merekam dokumentasi riwayat lembar disposisi fisik pimpinan, serta menghasilkan rekapitulasi Buku Agenda dinas resmi berformat spreadsheet Microsoft Excel (.xlsx) secara otomatis.

### 1.2 Masalah Bisnis & Realitas Lapangan (Problem Statement)
Pemeriksaan langsung pada akun Google Drive resmi instansi (`arsipdispora2026` folder `sistem magang`) dan folder lokal (`C:\xampp\htdocs\Laporan Magang`) membuktikan realitas operasional berikut:
1. **Penumpukan File Tanpa Indeks Metadata Terstruktur**:
   Sebanyak **420 berkas pindaian scan PDF** (171 Surat Masuk seberat 205,96 MB dan 249 Surat Keluar seberat 167,19 MB) hanya ditaruh di dalam direktori Google Drive tanpa atribut metadata baku: Asal Instansi Pengirim, Tanggal Diterima, Kode Klasifikasi Arsip, Ringkasan Isi Pokok, maupun Catatan Disposisi Fisik pimpinan.
2. **Pola Penamaan Berkas Acak & Bervariasi**:
   Nama berkas tersimpan secara tidak beraturan akibat pengetikan manual oleh staf yang berganti-ganti (contoh: `0973(14 Agustus 2026).pdf`, `1181(28 September 2026).pdf`, `3868 S Pengantar Lap Arsip.pdf`, `7480-82, 3 surat_20260902_0001.pdf`). Kondisi ini menggagalkan fungsi pencarian teks standar.
3. **Temu-Kembali Arsip yang Sangat Lambat (15-30 Menit)**:
   Ketika pimpinan dinas, staf teknis bidang, atau tim auditor (Inspektorat Daerah Kalsel / BPK) memerlukan pembuktian arsip naskah dinas lampau, staf tata usaha harus membuka dan membaca file PDF satu per satu di Google Drive.
4. **Terputusnya Jejak Disposisi Fisik Pimpinan**:
   Coretan instruksi pimpinan (Kepala Dinas / Sekretaris) hanya ada pada lembaran kertas fisik yang rentan rusak, tercecer di meja bidang, atau hilang saat berkas dipinjam. Tidak ada rekaman digital mengenai siapa yang mendisposisikan, tanggal instruksi, dan bidang yang ditugaskan.
5. **Ketiadaan Generator Buku Agenda Otomatis**:
   Google Drive tidak dapat mencetak buku agenda registrasi resmi berformat tabel kedinasan (.xlsx) yang diwajibkan sebagai lampiran Laporan Pertanggungjawaban (LPJ/SPJ) kearsipan daerah.

### 1.3 Diagnostik Produk 7 Pertanyaan Inti (Product Lens Diagnostic)
1. **Untuk Siapa Produk Ini Dibangun?**
   Pegawai di lingkungan Sekretariat Dispora Provinsi Kalimantan Selatan: Pengadministrasi Persuratan (Tata Usaha), Pimpinan (Kepala Dinas & Sekretaris), Pejabat Pelaksana Teknis Kegiatan (Subbag Keuangan), dan 5 Kepala Bidang teknis.
2. **Seberapa Akut Masalah yang Dihadapi?**
   Setiap minggu ada permohonan pembuktian arsip (surat hibah cabor, izin penggunaan 11 venue olahraga, surat tugas dinas luar daerah). Pencarian memakan waktu hingga 30 menit per surat dan menyita waktu produktif aparatur sipil negara.
3. **Mengapa Harus Dibangun Sekarang (Why Now)?**
   Dataset 420 berkas riil TA 2026 telah selesai dipindai (*scanned*) dan terkumpul lengkap di laptop magang dan Google Drive dinas. Momentum implementasi SPBE Pemprov Kalsel menuntut peralihan dari folder acak ke sistem e-arsip berindeks.
4. **Apa Visi 10-Bintang Produk Ini (The 10-Star Vision)?**
   Sistem e-arsip cerdas yang dilengkapi pembaca teks otomatis (OCR) dan klasifikasi otomatis berbasis kecerdasan buatan, terintegrasi penuh ke cloud tanpa server kantor yang harus menyala.
5. **Apa Definisi MVP (Minimum Viable Product)?**
   Web app responsif yang mampu mencari 420 dokumen PDF dalam waktu < 2 detik, menampilkan PDF langsung di browser, mencatat riwayat disposisi fisik, dan mengekspor buku agenda ke Excel.
6. **Apa yang Menjadi Anti-Goal (Apa yang TIDAK Dibangun)?**
   Sistem ini BUKAN aplikasi pembuat surat baru (*no live drafting*), BUKAN gateway TTE bersertifikasi BSrE, dan BUKAN pembukuan SPJ keuangan internal.
7. **Bagaimana Mengetahui Sistem Ini Berhasil (Metrik Kuantitatif)?**
   Waktu pencarian turun dari 15-30 menit menjadi < 2 detik; 420 dokumen 100% terindeks; biaya operasional Rp 0,-; dan 0 horizontal scroll overflow di layar ponsel (375px) dan desktop (1440px).

---

## 2. KONTRAK KAPABILITAS & BATASAN SISTEM (PRODUCT CAPABILITY CONTRACT)

### 2.1 Pernyataan Kapabilitas (Capability Statement)
SIPASD memberikan kapabilitas bagi aparatur Sekretariat Dispora Kalsel untuk melakukan pencarian instan multi-kriteria terhadap 420+ naskah dinas pindaian TA 2026, membaca dokumen PDF secara teralir (*streaming*) langsung di dalam peramban, meninjau catatan instruksi disposisi fisik pimpinan, serta menerbitkan rekapitulasi Buku Agenda berformat resmi kedinasan (.xlsx) kapan saja dan di mana saja tanpa ketergantungan pada komputer server kantor.

### 2.2 Aturan Bisnis & Invarian Mutlak (Invariants & Fixed Rules)
1. **Invarian Integritas Dokumen**: Sistem dilarang memodifikasi atau menimpa berkas PDF asli yang sudah sah secara hukum (bertanda tangan basah dan berstempel cap dinas). Dokumen pindaian diperlakukan sebagai aset *read-only*.
2. **Invarian Penomoran Agenda**: Setiap arsip surat masuk wajib memiliki Nomor Agenda unik tahunan dengan format baku: `[NoUrut4Digit]/SM/DISPORA/2026`.
3. **Invarian Redundansi Ganda**: Berkas pindaian disimpan secara terpusat pada Cloudinary (penampil primer) dan memiliki cadangan resmi pada Google Drive instansi akun 5 TB (subfolder `Surat Masuk` ID: `1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n` & `Surat Keluar` ID: `1rgWCFwULt8awBCVIuomy7cELKqEtbdkx`).
4. **Invarian Batas Ukuran**: Seluruh berkas pindaian yang dikelola wajib berformat PDF dengan batas ukuran maksimal 10 MB per dokumen (total 420 dokumen riil saat ini hanya 373,15 MB, semuanya di bawah 10 MB).
5. **Invarian Nol Biaya (Zero-Cost Invariant)**: Sistem tidak boleh menggunakan arsitektur yang menuntut kartu kredit atau langganan berbayar. Seluruh layanan berjalan pada kuota resmi kedinasan dan tier cloud permanen (Vercel Edge, TiDB Cloud 25 GB, Cloudinary 25 kredit, Google Drive 5 TB).

### 2.3 Batasan Kepercayaan (Trust Boundaries)
```
[ Browser Klien / Publik ] 
        │
        ▼ (HTTPS Cookie HttpOnly Secure)
[ Boundary 1: Next.js 15 Middleware / Auth Guard ]
        │
        ▼ (Session Role Verification)
[ Boundary 2: Server Actions & Route Handlers ]
        │
        ▼ (Parameterized SQL / Parameter Binding)
[ Boundary 3: TiDB Cloud Serverless (MySQL SSL) ]
```

---

## 3. PERSONA PENGGUNA & MATRIKS HAK AKSES (RBAC 4 TINGKAT)

### 3.1 Profil Persona Pengguna

#### Persona 1: Petugas Kearsipan / Staf Tata Usaha (Operator Utama)
- **Nama Representatif**: Staf Agenda TU Dispora (`tu_umum`).
- **Tugas Harian**: Menerima pindaian PDF dari scanner, menginput metadata surat masuk dan surat keluar, mendokumentasikan catatan lembar disposisi pimpinan, mencetak buku agenda registrasi fisik.
- **Kebutuhan Utama**: Formulir input yang cepat, pratinjau instan dokumen, dan tombol ekspor Excel satu klik.

#### Persona 2: Pimpinan Dinas (Pengambil Keputusan)
- **Nama Representatif**: Pebriadin Hapiz, AP, M.Si (Kepala Dinas - `kadis`) & Sekretaris Dinas (`sekretaris`).
- **Tugas Harian**: Memeriksa riwayat surat masuk yang telah didisposisikan, meninjau arsip surat keluar, membaca isi surat melalui ponsel dinas saat bertugas luar.
- **Kebutuhan Utama**: Dasbor statistik yang bersih, pencarian instan < 2 detik, dan penampil PDF yang nyaman di ponsel pintar (*smartphone*).

#### Persona 3: Pejabat Subbag Keuangan & Perencanaan (Verifikator Dokumen)
- **Nama Representatif**: Norika Fajriana, SH, MH (PPTK / Kasubbag Keuangan - `subbag_keuangan`).
- **Tugas Harian**: Menelusuri arsip surat tugas dinas (SPT 800), surat permohonan penggunaan 11 venue olahraga (426), dan surat pengantar SPJ/retribusi (900).
- **Kebutuhan Utama**: Filter cepat berdasarkan kode klasifikasi kearsipan dan nama instansi luar.

#### Persona 4: Kepala Bidang Teknis (Pelaksana Tugas)
- **Nama Representatif**: Budiono, S.Pd, M.AP (Kabid Pembudayaan Olahraga - `kabid_pora`) & Kabid lainnya.
- **Tugas Harian**: Memeriksa berkas surat yang didisposisikan ke bidangnya (misal: permohonan izin kejuaraan daerah atau jambore pemuda).
- **Kebutuhan Utama**: Filter daftar surat masuk berdasarkan unit kerja bidang penerima disposisi.

#### Persona 5: Administrator Sistem (Super Admin)
- **Nama Representatif**: Administrator IT Dispora (`admin`).
- **Tugas Harian**: Mengelola data akun pegawai, mengatur master kode klasifikasi arsip, memantau log keamanan sistem (*audit trail*).

### 3.2 Matriks Hak Akses Modul (RBAC Enforcement)

| Modul & Fungsionalitas | Super Admin | Pimpinan | Petugas Arsip | Bidang / Seksi |
| :--- | :---: | :---: | :---: | :---: |
| Login & Kelola Sesi Aktif | ✅ | ✅ | ✅ | ✅ |
| Dashboard Statistik Volume E-Arsip | ✅ | ✅ | ✅ | ✅ |
| Pencarian & Temu-Kembali Surat Masuk | ✅ | ✅ | ✅ | ✅ |
| Pencarian & Temu-Kembali Surat Keluar | ✅ | ✅ | ✅ | ✅ |
| Pratinjau Dokumen PDF di Browser | ✅ | ✅ | ✅ | ✅ |
| Unduh Dokumen Asli (Cloudinary CDN) | ✅ | ✅ | ✅ | ✅ |
| Buka Cadangan di Google Drive | ✅ | ✅ | ✅ | ✅ |
| Pengindeksan Arsip Surat Masuk Baru | ✅ | ❌ | ✅ | ❌ |
| Perekaman Riwayat Disposisi Fisik | ✅ | ❌ | ✅ | ❌ |
| Pengindeksan Arsip Surat Keluar Baru | ✅ | ❌ | ✅ | ❌ |
| Cetak Salinan Disposisi Pemprov | ✅ | ✅ | ✅ | ✅ |
| Ekspor Buku Agenda ke Excel (.xlsx) | ✅ | ✅ | ✅ | ❌ |
| Manajemen Data Pengguna & Akun | ✅ | ❌ | ❌ | ❌ |
| Manajemen Master Klasifikasi Arsip | ✅ | ❌ | ❌ | ❌ |
| Pemantauan Jejak Forensik (Audit Trail) | ✅ | ❌ | ❌ | ❌ |

---

## 4. SIKLUS HIDUP DATA & DIAGRAM STATUS (LIFECYCLE & TRANSITIONS)

### 4.1 Siklus Hidup Arsip Surat Masuk
```
[ Berkas Fisik Selesai Diproses ] 
               │
               ▼ Pemindaian Scanner (Resolusi 200-300 DPI)
[ Berkas Digital PDF Terbentuk ]
               │
               ▼ Pengindeksan & Upload Cloudinary / Google Drive
[ Status: TERINDIKASI DI SIPASD ] ────> Nomor Agenda Terbit Otomatis
               │
               ▼ Perekaman Coretan Lembar Disposisi Kertas
[ Status: MEMILIKI RIWAYAT DISPOSISI ]
               │
               ▼ Kueri Temu-Kembali (< 2 Detik)
[ Pratinjau di Layar / Ekspor Buku Agenda Excel / Cetak Salinan ]
```

### 4.2 Siklus Hidup Arsip Surat Keluar
```
[ Surat Keluar Selesai TTD Basah & Stempel Cap Dinas ]
               │
               ▼ Pemindaian Scanner
[ Berkas PDF Surat Keluar ]
               │
               ▼ Pengindeksan & Klasifikasi Urusan Dinas (005, 426, 427, 800, 045, 900)
[ Status: TERARSIPKAN DIGITAL DI SIPASD ]
               │
               ▼ Perekaman Distribusi
[ Status: DICATAT PADA BUKU EKSPEDISI ]
```

---

## 5. PERSYARATAN FUNGSIONAL DETAIL (FUNCTIONAL REQUIREMENTS)

### 5.1 Modul FR-01: Autentikasi Pengguna & Manajemen Sesi
- **ID Kebutuhan**: `REQ-FR-01`
- **Tingkat Prioritas (ICE)**: High (Score: 8.5)
- **Spesifikasi**:
  - Menyediakan form login terenkripsi pada rute `/login`.
  - Memverifikasi hash Bcrypt (`bcryptjs` salt 10) terhadap kolom `password_hash` tabel `users`.
  - Menerbitkan token JWT terenkripsi HS256 (`jose`) yang disimpan pada cookie browser `sipasd_session`.
  - Atribut cookie: `HttpOnly`, `Secure` (saat produksi), `SameSite=Lax`, masa aktif 8 jam (`maxAge: 28800`).
  - Menyediakan tombol bantuan *Quick Test Login* untuk beralih peran cepat saat pengujian (Super Admin, Pimpinan, Petugas Arsip, Subbag Keuangan, Kabid Pora).
  - Endpoint logout `/api/auth/logout` yang menghapus cookie sesi dan merekam log aktivitas.

### 5.2 Modul FR-02: Dashboard Statistik & Analitik E-Arsip
- **ID Kebutuhan**: `REQ-FR-02`
- **Tingkat Prioritas (ICE)**: High (Score: 8.0)
- **Spesifikasi**:
  - Halaman `/dashboard` menampilkan 4 kartu KPI utama:
    1. **Total Surat Masuk Terindeks**: 171 dokumen.
    2. **Total Surat Keluar Terindeks**: 249 dokumen.
    3. **Total Dokumen Digital**: 420 dokumen.
    4. **Surat Sifat Segera / Kilat**: 28 dokumen.
  - **Grafik Tren Bulanan**: Visualisasi interaktif volume surat masuk dan keluar per bulan (Januari s/d Desember 2026).
  - **Diagram Distribusi Bidang**: Persentase dokumen berdasarkan 5 unit kerja Dispora (Sekretariat, Pembudayaan Olahraga, Prestasi Olahraga, Pemuda, Sarana Prasarana).
  - **Tabel Dokumen Mendesak**: Menampilkan 5 surat masuk berkategori *Kilat* dan *Segera* di posisi paling atas.

### 5.3 Modul FR-03: Katalog E-Arsip Surat Masuk & Mesin Cari Cepat (< 2 Detik)
- **ID Kebutuhan**: `REQ-FR-03`
- **Tingkat Prioritas (ICE)**: Critical (Score: 9.8)
- **Spesifikasi**:
  - Rute `/arsip-masuk` menyajikan katalog 171 dokumen pindaian surat masuk.
  - Mesin pencari instan berbasis *debounced input* (300 ms) yang menyaring berdasarkan:
    * Nomor Agenda (contoh: `0897/SM/DISPORA/2026`).
    * Nomor Surat Dinas (contoh: `NOMOR/0973/DISPORA/2026`).
    * Asal Instansi Pengirim (contoh: `KONI Kalsel`, `Kemenpora RI`).
    * Kata Kunci Perihal (contoh: `Kejuaraan Daerah`, `Dispensasi Atlet`).
  - Filter dropdown sifat surat: *Semua*, *Biasa*, *Penting*, *Segera*, *Kilat*.
  - Paginasi data dinamis (15 data per halaman) dengan informasi total dokumen yang cocok.
  - Indikator sifat surat berwarna (*badge* merah untuk Kilat, kuning untuk Segera, biru untuk Penting, abu-abu untuk Biasa).

### 5.4 Modul FR-04: In-Browser PDF Streaming Viewer (Split-Screen Layout)
- **ID Kebutuhan**: `REQ-FR-04`
- **Tingkat Prioritas (ICE)**: Critical (Score: 9.5)
- **Spesifikasi**:
  - Panel penampil dokumen pindaian scan PDF bawaan peramban (*in-browser viewer*) tanpa membuka aplikasi pembaca PDF eksternal.
  - **Tata Letak Layar Desktop ($\ge$ 1024px)**: Mode *Split-Screen* (60% tabel data di kiri, 40% penampil PDF di kanan yang terbuka langsung saat baris diklik).
  - **Tata Letak Layar Ponsel (< 768px)**: Dialog modal pratinjau PDF responsif layar penuh.
  - Fitur kontrol: Zoom In, Zoom Out, Buka Tab Baru, Unduh File Asli, dan tombol **"Buka Cadangan di Google Drive"**.

### 5.5 Modul FR-05: Perekaman Riwayat Disposisi Fisik
- **ID Kebutuhan**: `REQ-FR-05`
- **Tingkat Prioritas (ICE)**: High (Score: 8.8)
- **Spesifikasi**:
  - Modal pencatatan dokumentasi instruksi tertulis pimpinan yang tertera pada lembar kertas fisik surat masuk asli:
    * Pejabat Pendisposisi: Dropdown/teks nama pimpinan (*Pebriadin Hapiz, AP, M.Si* / *Sekretaris Dinas*).
    * Tanggal Disposisi Diberikan.
    * Bidang Tujuan Disposisi (Sekretariat, Pembudayaan Olahraga, Prestasi Olahraga, Pemuda, Sarana Prasarana).
    * Instruksi Baku yang Dicentang (*Tindak lanjuti / Pelajari / Hadiri / Koordinasikan / Fasilitasi / Siapkan Bahan*).
    * Catatan Tulisan Tangan Khusus Pimpinan.
    * Status Penyelesaian: `SELESAI`, `PROSES`, `BELUM_DIPROSES`.
  - Data tersimpan terhubung secara relasional di tabel `riwayat_disposisi`.

### 5.6 Modul FR-06: Cetak Salinan Lembar Disposisi Standar Pemprov Kalsel
- **ID Kebutuhan**: `REQ-FR-06`
- **Tingkat Prioritas (ICE)**: High (Score: 8.2)
- **Spesifikasi**:
  - Halaman siap cetak `/arsip-masuk/[id]/cetak-disposisi` yang memformat data ke dalam 1 lembar kertas ukuran F4/A4.
  - Memuat Kop Surat Resmi Pemerintah Provinsi Kalimantan Selatan - Dinas Kepemudaan dan Olahraga, alamat kantor Jalan Pramuka No. 4 Banjarmasin, garis ganda pembatas tebal-tipis.
  - Tabel Isian Disposisi: No. Agenda, Tingkat Keamanan, Tanggal Penerimaan, Nomor Surat, Tanggal Surat, Asal Surat, Perihal, Diteruskan Kepada, Instruksi/Informasi, Catatan Khusus, dan Kotak Tanda Tangan Pejabat.
  - Menerapkan CSS Print `@media print` murni: otomatis menyembunyikan navbar, tombol, dan sidebar saat dialog cetak terbuka (`window.print()`).

### 5.7 Modul FR-07: Katalog Arsip Surat Keluar & Pengindeksan Klasifikasi
- **ID Kebutuhan**: `REQ-FR-07`
- **Tingkat Prioritas (ICE)**: High (Score: 8.7)
- **Spesifikasi**:
  - Rute `/arsip-keluar` menampilkan katalog 249 berkas pindaian surat keluar dinas TA 2026.
  - Pengelompokan berdasarkan 6 Kode Klasifikasi Baku Permendagri / Pergub Kalsel:
    * `005` - Undangan Rapat & Pertemuan Dinas.
    * `426` - Urusan Keolahragaan & Venue Daerah.
    * `427` - Urusan Kepemudaan & Paskibraka.
    * `800` - Urusan Kepegawaian & Surat Perintah Tugas (SPT).
    * `045` - Urusan Kearsipan & Perpustakaan.
    * `900` - Urusan Keuangan, Retribusi & SPJ.
  - Filter berdasarkan unit kerja pemrakarsa surat.
  - Penampil berkas PDF pindaian bertanda tangan dan cap basah.

### 5.8 Modul FR-08: Generator Ekspor Buku Agenda Excel Resmi (.xlsx)
- **ID Kebutuhan**: `REQ-FR-08`
- **Tingkat Prioritas (ICE)**: High (Score: 8.5)
- **Spesifikasi**:
  - Endpoint `/api/laporan/export-excel` menghasilkan berkas spreadsheet Microsoft Excel (`.xlsx`) menggunakan pustaka `exceljs`.
  - Format visual baku kedinasan:
    * Baris 1-3: Kop Resmi Pemerintah Provinsi Kalimantan Selatan - Dinas Kepemudaan dan Olahraga.
    * Baris 4: Judul Dokumen (*REGISTER BUKU AGENDA SURAT MASUK / SURAT KELUAR TAHUN ANGGARAN 2026*).
    * Baris Header Tabel: Berlatar belakang warna hijau zamrud dinas (`#064E3B`), teks putih tebal, rata tengah.
    * Baris Data: Garis batas tipis (*thin border*), zebra striping abu-abu muda (`#F8FAFC`), perataan teks rapi sesuai tipe data (nomor & tanggal rata tengah, teks uraian rata kiri).
  - Waktu pembentukan berkas < 1.5 detik untuk ratusan baris data langsung terunduh otomatis ke peramban.

### 5.9 Modul FR-09: Integrasi Redundansi Penyimpanan Ganda (Dual-Cloud Strategy)
- **ID Kebutuhan**: `REQ-FR-09`
- **Tingkat Prioritas (ICE)**: Critical (Score: 9.0)
- **Spesifikasi**:
  - **Penyimpanan Primer**: Cloudinary (`cloud_name: vqfpoekg`, folder `sipasd/surat_masuk` dan `sipasd/surat_keluar`) sebagai penyedia aset *fast in-browser streaming*.
  - **Penyimpanan Sekunder**: Google Drive resmi instansi akun 5 TB (folder `sistem magang`, subfolder `Surat Masuk` dan `Surat Keluar`). Sebanyak 420 dari 420 berkas pindaian asli tersimpan 100% dan terhubung ke setiap baris TiDB Cloud.
  - **Dual-Upload Otomatis**: Endpoint `/api/upload` dan `src/lib/gdrive.ts` otomatis mengunggah setiap arsip baru secara simultan ke Cloudinary CDN dan Google Drive.
  - Di antarmuka pengguna: Tersedia tombol primer **"Pratinjau PDF (Cepat)"** dan tombol sekunder **"Buka Cadangan di Google Drive"**.

### 5.10 Modul FR-10: Perekaman Jejak Forensik (Audit Trail)
- **ID Kebutuhan**: `REQ-FR-10`
- **Tingkat Prioritas (ICE)**: Medium (Score: 7.5)
- **Spesifikasi**:
  - Modul otomatis di `src/lib/audit.ts` yang mencatat setiap aksi pengguna ke tabel `audit_logs`.
  - Aksi yang terekam: `LOGIN`, `CARI_ARSIP`, `LIHAT_PDF`, `UNDUH_PDF`, `INDEKS_BARU`, `CATAT_DISPOSISI`, `EKSPOR_EXCEL`, `LOGOUT`.
  - Menyimpan informasi: `user_id`, `action`, `resource`, `resource_id`, `ip_address`, `user_agent`, `created_at`.
  - Rute khusus Super Admin `/master/audit-logs` untuk meninjau log keamanan kearsipan.

---

## 6. PRIORITISASI FITUR MENGGUNAKAN METODE ICE (ICE PRIORITIZATION)

Metode ICE (*Impact, Confidence, Effort*) dengan skala 1-10 digunakan untuk menentukan urutan implementasi modul:

$$\text{ICE Score} = \frac{\text{Impact} \times \text{Confidence}}{\text{Effort}}$$

| Modul | Nama Modul / Fitur | Impact (1-10) | Confidence (1-10) | Effort (1-10) | ICE Score | Peringkat Prioritas |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **FR-03** | Katalog & Pencarian Multi-Filter (< 2s) | 10 | 10 | 3 | **33.3** | **Peringkat 1 (Critical)** |
| **FR-04** | In-Browser PDF Streaming Viewer | 10 | 9 | 3 | **30.0** | **Peringkat 2 (Critical)** |
| **FR-01** | Autentikasi RBAC 4 Tingkat & Sesi | 9 | 10 | 3 | **30.0** | **Peringkat 3 (High)** |
| **FR-08** | Generator Ekspor Buku Agenda Excel | 9 | 9 | 3 | **27.0** | **Peringkat 4 (High)** |
| **FR-05** | Perekaman Riwayat Disposisi Fisik | 8 | 9 | 3 | **24.0** | **Peringkat 5 (High)** |
| **FR-07** | Katalog Surat Keluar & Klasifikasi | 8 | 9 | 3 | **24.0** | **Peringkat 6 (High)** |
| **FR-09** | Dual-Cloud Storage (Cloudinary + Drive) | 9 | 8 | 4 | **18.0** | **Peringkat 7 (High)** |
| **FR-02** | Dashboard Statistik & Kartu KPI | 7 | 9 | 3 | **21.0** | **Peringkat 8 (Medium)** |
| **FR-06** | Cetak Salinan Disposisi Pemprov | 7 | 9 | 3 | **21.0** | **Peringkat 9 (Medium)** |
| **FR-10** | Audit Trail & Rekam Jejak Forensik | 6 | 9 | 2 | **27.0** | **Peringkat 10 (Medium)** |

---

## 7. PERSYARATAN NON-FUNGSIONAL & BATASAN KUALITAS (CONSTRAINTS & QUALITY GATES)

Mengacu pada pedoman *Constraint-Driven Development*, berikut adalah batas kualitas mutlak yang tidak boleh diturunkan:

### 7.1 Ambang Batas Kualitas Mutlak (The Floor)
1. **Zero Suppression Comments**: Dilarang menggunakan komentar penutup kesalahan seperti `@ts-ignore`, `eslint-disable`, atau `# type: ignore`.
2. **Zero Unimplemented Stubs**: Tidak boleh ada fungsi kosong yang melempar kesalahan pura-pura (`throw new Error("Not implemented")`) atau blok tangkapan kosong (`catch {}`).
3. **Modularitas Maksimal 200 Baris Kode (200 LOC)**: Tidak ada satu file komponen atau rute yang melebihi batas 200 baris kode.
4. **Zero Secrets in Repository**: Kredensial TiDB Cloud, API Key Cloudinary, dan JWT Secret wajib diisolasi di `.env.local` dan dilindungi oleh `.gitignore`.
5. **Identitas Git Wajib**: Seluruh komit wajib menggunakan akun pengembang `Dhani078` dengan email resmi `dhanisepeda@gmail.com` agar indikator kontribusi GitHub aktif.

### 7.2 Angka Target Kinerja (Performance Budgets)

| Dimensi | Parameter Kualitas | Ambang Batas Maksimal / Minimal | Alat Ukur / Pemeriksa |
| :--- | :--- | :--- | :--- |
| **Kompatibilitas Tipe Data** | Error Kompilasi TypeScript | **0 Error (`tsc --noEmit`)** | `npm run typecheck` |
| **Linter Kebersihan Kode** | Peringatan ESLint | **0 Error / 0 Warning Kritis** | `npm run lint` |
| **Kecepatan Kueri Pencarian** | Durasi Eksekusi SQL | **$\le$ 500 ms per kueri** | TiDB Query Profiler |
| **Kecepatan First Contentful Paint** | Waktu Tampil Pertama | **$\le$ 1.2 detik (Koneksi 4G)** | Chrome DevTools Lighthouse |
| **Responsivitas Layar** | Horizontal Scrollbar Overflow | **0 Overflow (375px s/d 1440px)** | Playwright Viewport Audit |
| **Keamanan Kueri** | SQL Injection Mitigation | **100% Parameterized Queries** | Source Code AST Inspection |

---

## 8. SPESIFIKASI BASIS DATA LENGKAP & KAMUS DATA (DATA MODEL)

Basis data relasional diimplementasikan pada **TiDB Cloud Serverless** dengan skema 8 tabel ternormalisasi memenuhi kaidah *Third Normal Form (3NF)*:

```
[ users ] (1) ──────────< (N) [ arsip_surat_masuk ] (indexed_by)
    │ (1)
    ├───< (N) [ arsip_surat_keluar ] (indexed_by)
    └───< (N) [ audit_logs ] (user_id)

[ bidang_dispora ] (1) ──< (N) [ riwayat_disposisi ] (kepada_bidang_id)
[ bidang_dispora ] (1) ──< (N) [ arsip_surat_keluar ] (bidang_pemrakarsa_id)

[ klasifikasi_arsip ] (1)< (N) [ arsip_surat_keluar ] (kode_klasifikasi_id)

[ arsip_surat_masuk ] (1)< (N) [ riwayat_disposisi ] (surat_masuk_id)

[ arsip_surat_keluar ] (1)──< (1) [ buku_ekspedisi ] (surat_keluar_id)
```

### Kamus Kolom 8 Tabel Fisik:
1. **`users`**:
   - `id` (VARCHAR(36) PK): UUID unik akun.
   - `nip` (VARCHAR(25) UQ): Nomor Induk Pegawai dinas.
   - `nama_lengkap` (VARCHAR(100)): Nama lengkap beserta gelar resmi.
   - `username` (VARCHAR(50) UQ): Nama login sistem.
   - `email` (VARCHAR(100) UQ): Alamat email resmi dinas.
   - `password_hash` (VARCHAR(255)): Hash Bcrypt kata sandi.
   - `role` (ENUM): `'SUPER_ADMIN'`, `'PETUGAS_ARSIP'`, `'PIMPINAN'`, `'BIDANG'`.
   - `jabatan` (VARCHAR(100)): Jabatan kedinasan.
   - `unit_kerja` (VARCHAR(100)): Unit kerja / bidang tugas.
2. **`bidang_dispora`**:
   - `id` (INT AUTO PK): ID unik bidang.
   - `kode_bidang` (VARCHAR(20) UQ): Kode bidang (`SEKR`, `PORA`, `PRESTASI`, `PEMUDA`, `SAPRAS`).
   - `nama_bidang` (VARCHAR(100)): Nama lengkap bidang dinas.
   - `nama_kepala` (VARCHAR(100)): Nama pejabat Kepala Bidang / Sekretaris.
   - `nip_kepala` (VARCHAR(25)): NIP pejabat penanggung jawab.
3. **`klasifikasi_arsip`**:
   - `id` (INT AUTO PK): ID unik klasifikasi.
   - `kode` (VARCHAR(20) UQ): Kode dinas (`005`, `426`, `427`, `800`, `045`, `900`).
   - `nama_klasifikasi` (VARCHAR(100)): Judul urusan dinas.
   - `uraian` (TEXT): Rincian deskripsi peruntukan surat.
   - `retensi_aktif_tahun` (INT): Masa simpan aktif arsip.
   - `retensi_inaktif_tahun` (INT): Masa simpan inaktif arsip.
4. **`arsip_surat_masuk`**:
   - `id` (VARCHAR(36) PK): UUID unik surat masuk.
   - `nomor_agenda` (VARCHAR(30) UQ): Format `0897/SM/DISPORA/2026`.
   - `nomor_surat` (VARCHAR(100)): Nomor surat instansi pengirim.
   - `tanggal_surat` (DATE): Tanggal surat fisik.
   - `tanggal_diterima` (DATE): Tanggal berkas fisik diterima di Dispora.
   - `asal_instansi` (VARCHAR(150)): Nama instansi/pengurus cabor pengirim.
   - `perihal` (VARCHAR(255)): Pokok isi surat.
   - `ringkasan_isi` (TEXT): Catatan isi ringkas / nama file asli.
   - `sifat_surat` (ENUM): `'BIASA'`, `'PENTING'`, `'SEGERA'`, `'KILAT'`.
   - `file_url` (VARCHAR(255)): URL akses berkas di Cloudinary.
   - `cloudinary_public_id` (VARCHAR(255)): ID publik aset Cloudinary.
   - `drive_url` (VARCHAR(255)): Tautan cadangan ke Google Drive dinas.
   - `file_name_original` (VARCHAR(255)): Nama file asli saat dipindai.
   - `file_size_bytes` (BIGINT): Ukuran berkas dalam byte.
   - `indexed_by` (VARCHAR(36) FK): Pengguna yang mencatat.
5. **`riwayat_disposisi`**:
   - `id` (VARCHAR(36) PK): UUID unik riwayat disposisi.
   - `surat_masuk_id` (VARCHAR(36) FK): Relasi ke surat masuk.
   - `pejabat_pendisposisi` (VARCHAR(100)): Nama pimpinan yang mendisposisikan.
   - `tanggal_disposisi` (DATE): Tanggal pencatatan instruksi fisik.
   - `kepada_bidang_id` (INT FK): Bidang tujuan disposisi.
   - `batas_waktu` (DATE): Tanggal tenggat tindak lanjut fisik.
   - `instruksi_tercatat` (VARCHAR(255)): Instruksi baku yang dicentang.
   - `catatan_tertulis` (TEXT): Arahan tertulis khusus pimpinan.
   - `status_penyelesaian` (ENUM): `'BELUM_DIPROSES'`, `'PROSES'`, `'SELESAI'`.
6. **`arsip_surat_keluar`**:
   - `id` (VARCHAR(36) PK): UUID unik surat keluar.
   - `nomor_agenda` (VARCHAR(30) UQ): Nomor register keluar.
   - `nomor_surat` (VARCHAR(100) UQ): Nomor resmi surat dinas.
   - `nomor_urut` (INT): Nomor urut tahun berjalan.
   - `tahun` (INT): Tahun anggaran (2026).
   - `kode_klasifikasi_id` (INT FK): Relasi ke klasifikasi kearsipan.
   - `bidang_pemrakarsa_id` (INT FK): Bidang pembuat surat.
   - `tanggal_surat` (DATE): Tanggal naskah diterbitkan.
   - `tujuan_instansi` (VARCHAR(150)): Pihak / instansi tujuan surat.
   - `perihal` (VARCHAR(255)): Pokok isi surat dinas.
   - `ringkasan_isi` (TEXT): Catatan ringkas / nama file asli.
   - `file_url` (VARCHAR(255)): URL berkas scan PDF bertanda tangan di Cloudinary.
   - `cloudinary_public_id` (VARCHAR(255)): ID publik aset Cloudinary.
   - `file_size_bytes` (BIGINT): Ukuran berkas dalam byte.
   - `indexed_by` (VARCHAR(36) FK): Pengguna yang mencatat.
7. **`buku_ekspedisi`**:
   - `id` (VARCHAR(36) PK): UUID unik tanda terima ekspedisi.
   - `surat_keluar_id` (VARCHAR(36) FK UQ): Relasi ke surat keluar.
   - `tanggal_kirim` (DATE): Tanggal penyerahan fisik melalui kurir.
   - `kurir_pengirim` (VARCHAR(100)): Nama kurir internal Dispora.
   - `penerima_nama` (VARCHAR(100)): Nama petugas penerima di instansi tujuan.
   - `bukti_terima_url` (VARCHAR(255)): Foto lembar tanda terima fisik berstempel.
8. **`audit_logs`**:
   - `id` (BIGINT AUTO PK): ID log unik.
   - `user_id` (VARCHAR(36) FK): Pengguna pengakses.
   - `action` (VARCHAR(50)): Jenis aksi sistem.
   - `resource` (VARCHAR(50)): Entitas yang diakses.
   - `resource_id` (VARCHAR(50)): Kunci objek yang dimutasi/dilihat.
   - `ip_address` (VARCHAR(45)): Alamat IP pengguna.
   - `user_agent` (VARCHAR(255)): Browser dan perangkat pengakses.
   - `created_at` (DATETIME): Timestamp waktu pencatatan.

---

## 9. INVENTARISASI DATASET REALISTIS (420 BERKAS PDF TA 2026)

Dataset yang dikelola oleh SIPASD bersumber dari data arsip asli instansi:

### 9.1 Berkas Surat Masuk TA 2026 (171 Berkas PDF / 205,96 MB)
- **Rentang Nomor Agenda**: Nomor `0897` (3 Agustus 2026) s/d `1238` (7 Oktober 2026).
- **Contoh Berkas Riil**:
  * `0907(4agustus).pdf` (9,77 MB - Berkas terbesar)
  * `0905(4agustus).pdf` (8,70 MB)
  * `0973(14 Agustus 2026).pdf` (804 KB)
  * `1181(28 September 2026).pdf` (1,2 MB)
  * `1208(02 Oktober 2026).pdf` (1,4 MB)
- **Instansi Pengirim Dominan**: Kemenpora RI, Sekretariat Daerah Prov. Kalsel, KONI Kalsel, BPKAD Kalsel, Dispora Kabupaten/Kota se-Kalsel, Pengurus Cabang Olahraga, dan Panitia Pelaksana Kejurda.

### 9.2 Berkas Surat Keluar TA 2026 (249 Berkas PDF / 167,19 MB)
- **Rentang Nomor Surat**: Nomor `3802` (Mei 2026) s/d `8757` (Oktober 2026).
- **Contoh Berkas Riil**:
  * `3868 S Pengantar Lap Arsip.pdf`
  * `3971 Teknis WFH Dispora.pdf`
  * `4065 workshop pengembangan budaya kerja.pdf`
  * `7762,7801-06, 7 surat.pdf` (7,38 MB)
  * `8035-43, 9 surat.pdf` (7,05 MB)

### 9.3 Inventarisasi 11 Sarana Prasarana (Venue) Olahraga Terkait
Surat-surat permohonan sewa dan pemeliharaan pada SIPASD mencakup 11 venue resmi yang dikelola Dispora Kalsel:
1. Kolam Renang GOR Hasanuddin HM
2. GOR Hasanuddin HM (Gelanggang Olahraga Remaja)
3. Kolam Renang Mulawarman
4. Lapangan Sepak Bola Mulawarman
5. Lapangan Tenis Mulawarman
6. Lapangan Tenis Dharma Praja
7. Lapangan Sepak Bola Kayu Tangi
8. Lapangan Golf Swargaloka (Landasan Ulin)
9. Lapangan Volley Pasir
10. Lapangan Voli Indoor SKB (Sentra Kepemudaan & Keolahragaan)
11. Lapangan Sepak Bola 17 Mei Banjarmasin

---

## 10. PEMETAAN DRAF LAPORAN MAGANG TI UNISKA & BLUEPRINT SKRIPSI S1

Dokumen PRD ini memayungi seluruh bab dalam naskah laporan akademik mahasiswa:

| Bab Laporan Magang | Materi yang Dijelaskan dari PRD Ini | Dokumen Sumber Terkait |
| :--- | :--- | :--- |
| **BAB I: PENDAHULUAN** | Latar belakang SPBE Perpres 95/2018, masalah penumpukan Google Drive, 4 rumusan masalah, 6 batasan, tujuan & manfaat 3 dimensi. | `docs/BAB_1_PENDAHULUAN_DRAFT.md` |
| **BAB II: TINJAUAN INSTANSI** | Dasar hukum Perda 11/2016, Visi Kalsel Maju, Tupoksi Sekretariat & Keuangan, profil pejabat sah, 11 venue olahraga. | `docs/BAB_2_PROFIL_INSTANSI_DRAFT.md` |
| **BAB III: ANALISIS & DESAIN** | Evaluasi kelemahan PIECES, kebutuhan FURPS, Use Case, Activity, Sequence, Class Diagram, normalisasi data 3NF. | `docs/BAB_3_ANALISIS_PERANCANGAN_DRAFT.md` |
| **BAB IV: IMPLEMENTASI & UJI** | Lingkungan cloud serverless, kode kueri pencarian < 2 detik, 15 tabel Black Box Testing, analisis lonjakan efisiensi 93.3%. | `docs/BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md` |
| **BAB V: PENUTUP** | 5 kesimpulan terukur berbasis data nyata dan saran praktis dinas serta arah riset skripsi. | `docs/BAB_5_PENUTUP_DRAFT.md` |
| **DAFTAR PUSTAKA** | 21 referensi akademik format baku APA 7th Edition (hukum, software engineering, cloud, jurnal persuratan). | `docs/DAFTAR_PUSTAKA.md` |

### Jalur Peningkatan ke Skripsi S1 (Semester 8 Roadmap):
Korpus 420 pindaian scan PDF yang tersimpan di SIPASD menjadi objek data penelitian (*dataset*) untuk mengimplementasikan algoritma kecerdasan buatan:
- **Jalur A (OCR)**: *Tesseract Engine* untuk ekstraksi teks otomatis nomor dan tanggal surat dari gambar scan PDF (*auto-filling*).
- **Jalur B (NLP / Text Mining)**: *Multinomial Naive Bayes & TF-IDF* untuk klasifikasi otomatis kode klasifikasi surat dinas (005, 426, 800) dan rekomendasi bidang disposisi.

---

## 11. MATRIKS VERIFIKASI PENGUJIAN BLACK BOX (15 SKENARIO)

| No | Modul / Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Status Hasil |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Autentikasi Pengguna Valid | Username: `admin`, Password valid | Login sukses, cookie sesi diterbitkan, redirect ke dashboard. | **PASS (Valid)** |
| **2** | Autentikasi Password Salah | Username: `kadis`, Password salah. | Menolak akses dengan pesan HTTP 401 "Kredensial tidak valid". | **PASS (Valid)** |
| **3** | Pembatasan Hak Akses (RBAC) | Akun role `BIDANG` mengakses menu `/master/users`. | Sistem menolak akses dan mengarahkan ke halaman 403 Forbidden. | **PASS (Valid)** |
| **4** | Pencarian Instan Berdasarkan Nomor | Memasukkan kata kunci `0973`. | Menyaring dan menampilkan berkas nomor 0973 dalam < 1 detik. | **PASS (Valid)** |
| **5** | Pencarian Kata Kunci Perihal | Memasukkan kata kunci `Kejuaraan Daerah`. | Menampilkan seluruh arsip surat permohonan kejuaraan olahraga. | **PASS (Valid)** |
| **6** | Filter Sifat Surat Kilat | Memilih dropdown sifat surat `KILAT`. | Menampilkan daftar arsip surat berkategori mendesak dengan badge merah. | **PASS (Valid)** |
| **7** | In-Browser PDF Streaming Viewer | Mengklik tombol pratinjau pada surat agenda `0897`. | Dokumen PDF termuat langsung di panel viewer tanpa unduh manual. | **PASS (Valid)** |
| **8** | Rekam Indeks Surat Masuk | Mengisi formulir metadata dan tautkan pindaian PDF baru. | Metadata tersimpan di TiDB dan No. Agenda baru terbit otomatis. | **PASS (Valid)** |
| **9** | Validasi Berkas Non-PDF | Mengunggah berkas selain `.pdf` (misal `.exe`). | Sistem menolak berkas dengan pesan "Format wajib PDF". | **PASS (Valid)** |
| **10** | Pencatatan Disposisi Fisik | Mengisi instruksi coretan pimpinan yang ada pada kertas asli. | Catatan tersimpan di tabel `riwayat_disposisi` terhubung ke surat. | **PASS (Valid)** |
| **11** | Cetak Salinan Disposisi | Menekan tombol "Cetak Salinan Disposisi Standar". | Muncul jendela pratinjau cetak kop dinas pas 1 lembar A4/F4. | **PASS (Valid)** |
| **12** | Filter Klasifikasi Surat Keluar| Memilih kode klasifikasi `426` (Keolahragaan). | Menampilkan daftar arsip surat keluar khusus urusan olahraga. | **PASS (Valid)** |
| **13** | Ekspor Buku Agenda Excel | Menekan tombol "Ekspor Agenda Surat Masuk (.xlsx)". | Terunduh berkas spreadsheet resmi lengkap dengan kop dan border. | **PASS (Valid)** |
| **14** | Perekaman Audit Trail | Petugas membuka dan mengunduh berkas surat nomor 1181. | Aksi tercatat otomatis di tabel `audit_logs` beserta IP dan waktu. | **PASS (Valid)** |
| **15** | Uji Responsivitas Mobile | Mengakses katalog e-arsip lewat smartphone resolusi 375px. | Tabel berubah jadi kartu responsif, 0 horizontal scroll overflow. | **PASS (Valid)** |

---

## 12. RUNBOOK DEPLOYMENT PRODUKSI CLOUD (ZERO-COST RUNBOOK)

1. **Deploy ke Vercel Edge**:
   - Hubungkan repositori GitHub `Dhani078/SIPASD` ke Vercel.
   - Atur *Environment Variables* di Vercel Dashboard:
     ```env
     DATABASE_URL="mysql://username:password@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd?sslaccept=strict"
     CLOUDINARY_CLOUD_NAME="your_cloud_name"
     CLOUDINARY_API_KEY="your_api_key"
     CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
     CLOUDINARY_URL="cloudinary://your_api_key:your_cloudinary_api_secret@your_cloud_name"
     NEXTAUTH_SECRET="your_nextauth_secure_key_min_32_characters"
     JWT_SECRET="your_jwt_secret_key_minimum_32_characters"
     ```
   - Klik **Deploy**. Vercel akan menghasilkan URL produksi HTTPS publik aktif 24 jam gratis.

---
*Dokumen PRD ini menjadi acuan spesifikasi tunggal (*Single Source of Truth*) bagi rekayasa perangkat lunak sistem SIPASD dan penyusunan laporan magang resmi di Universitas Islam Kalimantan (UNISKA) MAB Banjarmasin.*
