# PEMETAAN MATERI SISTEM SIPASD KE LAPORAN MAGANG
**Panduan Penyusunan Naskah Kerja Praktik / Magang - Teknik Informatika UNISKA Semester 7**  
*Mahasiswa: Muhammad Rizki Ramadhani (NPM: 2310010406)*  
*Lokasi Magang: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 📘 BAB I: PENDAHULUAN

### 1.1 Latar Belakang
- Penjelasan tata kelola birokrasi pemerintahan daerah di era transformasi digital SPBE (Perpres No. 95 Tahun 2018).
- Realitas operasional pada Sekretariat Dispora Kalsel: dokumen surat yang telah selesai diproses (ditandatangani pimpinan, dicap basah, dan bertoreh disposisi fisik) telah dipindai dan disimpan di Google Drive (`arsipdispora2026 / sistem magang`), namun penumpukannya tidak terstruktur (171 Surat Masuk & 249 Surat Keluar TA 2026).
- Identifikasi 4 kendala utama:
  1. Penamaan file acak dan ketiadaan metadata terstruktur.
  2. Waktu temu-kembali dokumen sangat lambat (15-30 menit membuka file satu per satu).
  3. Catatan disposisi fisik pimpinan tidak terdata secara sistematis.
  4. Google Drive tidak dapat menghasilkan rekapitulasi Buku Agenda resmi berformat Excel untuk SPJ/LPJ dinas.
- Urgensi pembangunan aplikasi web repositori e-arsip **SIPASD** (*Sistem Informasi Pengelolaan Arsip Surat Dispora*).

### 1.2 Rumusan Masalah
1. Bagaimana menganalisis dan merancang repositori e-arsip surat digital berbasis web responsif untuk menggantikan penyimpanan manual Google Drive di Dispora Kalsel?
2. Bagaimana membangun modul pencarian cepat multi-filter dan pemutar dokumen bawaan (*in-browser PDF streaming viewer*) agar 420+ berkas PDF arsip dapat ditemukan dalam waktu < 2 detik?
3. Bagaimana mengimplementasikan pencatatan metadata riwayat disposisi fisik pimpinan beserta fitur cetak salinan lembar disposisi standar Pemprov Kalsel?
4. Bagaimana merancang modul generator ekspor Buku Agenda Surat Masuk dan Keluar berformat spreadsheet Microsoft Excel (.xlsx) sesuai format resmi dinas?

### 1.3 Batasan Masalah
1. Sistem diterapkan pada lingkungan Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
2. Data yang dikelola merupakan **arsip statis digital (selesai diproses)** hasil scan naskah dinas sah Tahun Anggaran 2026 (171 Surat Masuk dan 249 Surat Keluar dari folder lokal `C:\xampp\htdocs\Laporan Magang`).
3. Hak akses pengguna dibatasi pada 4 peran: Super Admin, Petugas Arsip/TU, Pimpinan, dan Bidang/Seksi.
4. Format berkas arsip yang didukung adalah *Portable Document Format* (PDF) dengan batas ukuran maksimal 25 MB.
5. Sistem tidak mencakup pembuatan surat dinamis baru dan tidak mencakup modul penganggaran keuangan (TBP/SPJ).

### 1.4 Tujuan & Manfaat
- **Tujuan**: Membangun aplikasi web responsif SIPASD sebagai repositori e-arsip terindeks pengganti folder manual Google Drive untuk mempercepat temu-kembali arsip menjadi < 2 detik.
- **Manfaat bagi Instansi**: Mempercepat pelayanan dokumen, efisiensi waktu staf tata usaha, dan mengamankan arsip digital negara.
- **Manfaat bagi Mahasiswa**: Menguasai rekayasa web skala produksi (*cloud-native*) dan membangun pondasi penelitian Skripsi S1 semester 8.

---

## 🏛️ BAB II: TINJAUAN UMUM INSTANSI

### 2.1 Profil Singkat Dispora Provinsi Kalimantan Selatan
- Alamat: Jalan Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70249.
- Visi & Misi Pemprov Kalsel: *Kalsel Maju (Makmur, Sejahtera, Berkelanjutan)*.
- Dasar Hukum Pembentukan: Perda No. 11 Tahun 2016 dan Pergub Kalsel No. 072 Tahun 2016.
- Struktur Pejabat Pengesah:
  - Kepala Dinas / PA: Pebriadin Hapiz, AP, M.Si
  - PPTK / Subbag Keuangan: Norika Fajriana, SH, MH
  - Bendahara Pengeluaran: Sathia Nico Brata Simanjuntak, S.Akun

### 2.2 Struktur Organisasi & 11 Venue Olahraga
- Sekretariat: Subbag Perencanaan & Pelaporan, Subbag Keuangan, Subbag Umum & Kepegawaian.
- Bidang Teknis: Pembudayaan Olahraga, Prestasi Olahraga, Pengembangan Pemuda, Pemberdayaan Pemuda, Sarana & Prasarana.
- 11 Venue Olahraga yang dikelola: GOR Hasanuddin HM, Kolam Renang Hasanuddin, Kolam Renang Mulawarman, Lapangan Sepakbola Mulawarman, Lapangan Tenis Mulawarman, Lapangan Tenis Dharma Praja, Lapangan Sepakbola Kayu Tangi, Lapangan Golf Swargaloka, Lapangan Voli Pasir, Lapangan Voli Indoor SKB, Stadion 17 Mei.

---

## ⚙️ BAB III: ANALISIS DAN PERANCANGAN SISTEM

### 3.1 Analisis Sistem yang Berjalan (Existing System)
- Prosedur penumpukan file scan di Google Drive manual tanpa metadata.
- Evaluasi kelemahan menggunakan kerangka kerja PIECES (*Performance, Information, Economy, Control, Efficiency, Service*).

### 3.2 Analisis Sistem yang Diusulkan (Proposed System)
- Arsitektur Web Responsif (dapat diakses nyaman melalui HP maupun laptop/PC).
- Penyimpanan awan hibrida: TiDB Serverless (metadata relasional) dan Cloudinary & Google Drive (420 berkas PDF).

### 3.3 Pemodelan Diagram UML (Unified Modeling Language)
1. **Use Case Diagram**: Aktor (Super Admin, Petugas Arsip, Pimpinan, Kabid) dan 10 Use Cases inti e-arsip.
2. **Activity Diagram**: Alur Pengindeksan Berkas Scan PDF & Alur Temu-Kembali Dokumen.
3. **Sequence Diagram**: Interaksi streaming PDF presigned URL antara UI, Server Actions, TiDB, dan Cloudinary & Google Drive.
4. **Class Diagram & Entity Relationship Diagram (ERD)**: Mengacu pada model 3NF di `docs/DATABASE_SCHEMA.md`.

### 3.4 Perancangan Antarmuka Pengguna (UI/UX Design)
- Wireframe Halaman Login RBAC.
- Wireframe Dashboard Statistik Volume E-Arsip.
- Wireframe Katalog Surat Masuk dengan Split-Screen PDF Viewer.
- Wireframe Modal Pencatatan Disposisi Fisik & Halaman Cetak Salinan Disposisi Standar Pemprov.
- Wireframe Ekspor Buku Agenda Excel.

---

## 💻 BAB IV: IMPLEMENTASI DAN PENGUJIAN

### 4.1 Implementasi Perangkat Keras dan Lunak
- **Perangkat Keras**: Laptop pengembang (RAM 16 GB, SSD NVMe) dan perangkat uji seluler (layar 375px-414px).
- **Perangkat Lunak**: Next.js 15, TypeScript, Tailwind CSS v4, Node.js 20, TiDB Cloud Serverless, Cloudinary & Google Drive, Git & VS Code.

### 4.2 Implementasi Kode Kunci
- Kueri pencarian multi-filter cepat (< 2 detik) berbasis indexed fields.
- Helper streaming PDF presigned URL Cloudinary & Google Drive via AWS S3 SDK.

### 4.3 Pengujian Sistem (Black Box Testing)
Tabel matriks pengujian fungsional 15 skenario (Login, Filter Nomor, Filter Perihal, Filter Sifat, In-Browser Streaming Viewer, Rekam Indeks, Validasi Non-PDF, Catat Disposisi Fisik, Cetak Salinan, Filter Klasifikasi, Ekspor Excel, Audit Trail, Responsivitas Mobile 0 Overflow).

---

## 🎯 BAB V: PENUTUP

### 5.1 Kesimpulan
1. Aplikasi SIPASD berhasil menjadi repositori e-arsip digital terindeks untuk 420 dokumen riil TA 2026.
2. Waktu temu-kembali berkas fisik dipangkas dari 15-30 menit menjadi < 2 detik.
3. Dokumen pindaian dapat dibaca langsung di browser HP maupun PC tanpa unduh manual.
4. Lembar disposisi fisik terdokumentasi dan Buku Agenda dapat diekspor otomatis ke format Excel.
5. 15 skenario Black Box testing terbukti 100% valid.

### 5.2 Saran Pengembangan (Peningkatan ke Skripsi S1)
1. Penerapan **Tesseract OCR Engine** untuk ekstraksi otomatis nomor, tanggal, dan instansi dari berkas scan PDF (*auto-fill*).
2. Penerapan algoritma **Multinomial Naive Bayes & TF-IDF** untuk klasifikasi otomatis kode klasifikasi dinas (005, 426, 800) dan rekomendasi bidang disposisi.
