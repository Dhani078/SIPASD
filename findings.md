# FINDINGS & RECONNAISSANCE: SIPASD
**Catatan Hasil Riset, Analisis Berkas Riil & Struktur Kedinasan Dispora Kalsel**  
*Tanggal Analisis: 20–21 Oktober 2026*

---

## 1. Analisis Sumber Berkas Riil: Google Drive Akun `arsipdispora2026`

Berdasarkan pemeriksaan langsung pada penyimpanan awan resmi instansi (Google Drive akun `arsipdispora2026`, folder `sistem magang`):

- **Kapasitas Terpakai**: 101,51 GB dari total kuota 5 TB.
- **Dua Subfolder Utama**:
  1. `Surat Masuk 2026` (171 Berkas PDF / 205,96 MB)
  2. `Surat Keluar 2026` (249 Berkas PDF / 167,19 MB)
  3. Total Berkas Riil: **420 Berkas PDF seberat 373,15 MB**. Seluruh berkas berukuran di bawah 10 MB (file terbesar `0907(4agustus).pdf` berukuran 9,77 MB).
- **Status Berkas**: Berkas merupakan **dokumen arsip statis (selesai diproses)**. Seluruh dokumen telah ditandatangani basah oleh pimpinan, distempel cap resmi instansi, terdapat coretan/catatan disposisi fisik pada kertas aslinya, lalu dipindai (*scan*) menjadi berkas digital PDF.

---

## 2. Identifikasi Masalah pada Penggunaan Google Drive Manual

Meskipun berkas fisik telah dipindai dan disimpan di Google Drive, tata kelola saat ini menimbulkan masalah operasional yang nyata bagi pegawai Dispora:

1. **Penamaan Berkas yang Tidak Konsisten & Acak**:
   - Berkas Surat Masuk dinamai berdasarkan format nomor dan tanggal: `0973(14 Agustus 2026).pdf`, `1181(28 September 2026).pdf`, `1208(02 Oktober 2026).pdf`.
   - Berkas Surat Keluar dinamai campuran antara nomor, perihal singkat, dan nama kegiatan: `3868 S Pengantar Lap Arsip.pdf`, `3971 Teknis WFH Dispora.pdf`, `4065 workshop pengembangan budaya kerja.pdf`, `7480-82, 3 surat_20260902_0001.pdf`.
2. **Ketiadaan Metadata Terstruktur**:
   - Google Drive hanya membaca nama file dan teks terbatas jika tidak ter-OCR sempurna.
   - Tidak ada kolom untuk Instansi Pengirim, Tanggal Terima, Kode Klasifikasi Arsip, Ringkasan Isi, dan Catatan Disposisi Fisik.
3. **Pencarian Dokumen yang Lambat (15–30 Menit)**:
   - Staf yang membutuhkan arsip surat tertentu harus menggulir ratusan file PDF di browser, membuka dan menutup file satu per satu untuk memastikan isi surat.
4. **Tidak Ada Rekapitulasi Buku Agenda Kedinasan**:
   - Google Drive tidak dapat menghasilkan lembaran register Buku Agenda format Microsoft Excel yang diwajibkan untuk keperluan laporan pertanggungjawaban (LPJ/SPJ) kearsipan daerah.

---

## 3. Struktur Kedinasan & Pejabat Sah Dispora Kalsel

Berdasarkan dokumen resmi BKU TA 2026 dan berkas surat pengantar:

- **Pengguna Anggaran (Kepala Dinas)**:  
  **Pebriadin Hapiz, AP, M.Si** (NIP. 19780214 199612 1 001)
- **Pejabat Pelaksana Teknis Kegiatan (PPTK) / Subbag Keuangan**:  
  **Norika Fajriana, SH, MH** (NIP. 19850421 201001 2 003)
- **Bendahara Pengeluaran**:  
  **Sathia Nico Brata Simanjuntak, S.Akun** (NIP. 19920815 201503 1 002)
- **Staf Subbag Keuangan / Pembimbing Lapangan**:  
  **Ibu Nur Dispora**

### Unit Kerja / Bidang yang Sering Dituju Disposisi:
1. **Sekretariat** (Subbag Perencanaan & Pelaporan, Subbag Keuangan, Subbag Umum & Kepegawaian).
2. **Bidang Pembudayaan Olahraga** (Olahraga rekreasi, tradisional, dan olahraga masyarakat).
3. **Bidang Peningkatan Prestasi Olahraga** (Pembinaan atlet, PPLP, kejuaraan daerah).
4. **Bidang Pengembangan Pemuda** (Kepemudaan, kewirausahaan pemuda).
5. **Bidang Pemberdayaan Pemuda** (Pelatihan, wawasan kebangsaan, Paskibraka).
6. **Bidang Sarana dan Prasarana** (Pengelolaan 11 venue olahraga daerah).

---

## 4. Evaluasi Prototipe Desain Antarmuka (Figma Make V2)

Prototipe antarmuka resmi telah dibangun dan disimpan pada:  
`C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)`

Temuan audit desain:
- **Modularitas Tinggi (18 Komponen)**: Tidak ada lagi file monolitik 1.700 baris. Komponen utama terisolasi rapi: `LandingPage.tsx`, `LoginPage.tsx`, `Sidebar.tsx`, `TopNavbar.tsx`, `DashboardView.tsx`, `ArchiveTable.tsx`, `ArchiveWorkspace.tsx`, `PdfPreviewPanel.tsx`, `PrintDisposisiModal.tsx`, `NewLetterModal.tsx`.
- **Pengujian E2E Otomatis**: Dilengkapi test runner Playwright (`tests/interactions.cjs`) yang memverifikasi navigasi publik, tester login 5 role, filter tabel per venue, pembukaan modal, dan ekspor spreadsheet.
- **Ekspor Excel Asli**: Menggunakan pustaka `exceljs` untuk menghasilkan berkas `.xlsx` dengan kop dinas dan garis batas tabel penuh.
- **Penampil Dokumen PDF Nyata**: Menggunakan `jspdf` dan `pdfjs-dist` untuk streaming dokumen langsung di layar peramban.

---

## 5. Status Infrastruktur Cloud Terverifikasi Aktif

1. **TiDB Cloud Serverless (MySQL Protocol)**:
   - Host: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000`
   - Database: `sipasd` (8 tabel relasional telah terbentuk dan terindeks).
   - Akun Pengguna & Master Klasifikasi telah ter-seed.
2. **Penyimpanan Primer Cloudinary**:
   - Cloud Name: `vqfpoekg`, API Key: `966426338749991`.
   - Kuota 25 kredit gratis/bulan. Pengunggahan dan penghapusan uji coba terbukti berhasil 100%.
3. **Penyimpanan Sekunder Google Drive**:
   - Folder: `sistem magang` resmi instansi.
   - Hak akses Editor telah diberikan kepada robot Service Account: `sipasd-bot@sipasd.iam.gserviceaccount.com`.

---

## 6. Evaluasi Kelayakan: Laporan Magang vs Skripsi S1 TI UNISKA

| Parameter | Posisi pada Laporan Magang (Semester 7) | Peluang Peningkatan ke Skripsi S1 (Semester 8) |
| :--- | :--- | :--- |
| **Objek Penelitian** | Pemecahan masalah temu-kembali 420 berkas scan Google Drive Dispora Kalsel. | Eksplorasi metode kecerdasan buatan (*AI & Machine Learning*) pada 420 berkas teks PDF. |
| **Metode Rekayasa** | Waterfall / Agile rekayasa web responsif (Next.js 15 + TiDB + Cloudinary). | Algoritma **OCR Tesseract** (ekstraksi teks otomatis) atau **Multinomial Naive Bayes TF-IDF** (klasifikasi kategori otomatis). |
| **Data Penelitian** | 420 berkas riil sebagai basis data arsip sistem. | 420 berkas riil sebagai korpus data latih (*training*) dan data uji (*testing*). |
| **Kesiapan** | **100% Siap Diujikan pada Sidang Magang**. | **Tinggal menambahkan 1 modul algoritma di semester 8**. |
