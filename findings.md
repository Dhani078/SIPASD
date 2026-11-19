# FINDINGS & RECONNAISSANCE: SIPASD
**Catatan Hasil Riset, Analisis Berkas Riil & Struktur Kedinasan Dispora Kalsel**  
*Tanggal Analisis: 20-21 Oktober 2026*

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
3. **Pencarian Dokumen yang Lambat (15-30 Menit)**:
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

## 5. Temuan Analisis Byte-Level 420 Berkas PDF (PyMuPDF Inspection)

Berdasarkan analisis byte-level langsung terhadap seluruh 420 berkas di `C:\xampp\htdocs\Laporan Magang`:

1. **Rasio Lapisan Teks vs Gambar Pindaian (Raster)**:
   - **Surat Masuk**: 143 dari 171 berkas (83,6%) adalah murni citra pemindaian fisik tanpa lapisan teks digital (0 karakter). Hanya 28 berkas yang memiliki text-layer.
   - **Surat Keluar**: 144 dari 249 berkas (57,8%) adalah murni citra pemindaian fisik, sementara 105 berkas memiliki lapisan teks digital (dihasilkan dari ekspor naskah dinas Word).
   - **Total**: Sebanyak **287 dari 420 berkas (68,3%)** tidak dapat dicari teksnya menggunakan pencarian standar Google Drive. Temuan ini menjadi dasar kuat urgensi repositori terindeks SIPASD dan roadmap skripsi AI OCR Tesseract.
2. **Jejak Perangkat Pemindai (Scanner Footprint)**:
   - Mesin Scanner Kantor TU: `Canon SC1011` / `IJ Scan Utility` (~300 DPI, resolusi rata-rata $2102 \times 3000$ px).
   - Aplikasi Mobile Lapangan: `ClearScanner` dan `CamScanner (intsig.com)`.
   - Perangkat Mobile Pejabat: `iOS Quartz PDFContext`.
   - Alat Kompresi & Gabung: `iLovePDF`.
3. **Anomali Berkas Multi-Surat Kolektif**:
   - Ditemukan 14 berkas Surat Keluar yang menggabungkan beberapa surat sekaligus dalam satu PDF (misal: `8035-43, 9 surat.pdf`, `7480-82, 3 surat.pdf`).
4. **Laporan Investigasi Lengkap**:
   - Analisis mendalam per berkas telah didokumentasikan pada: `docs/ANALISIS_MENDALAM_420_ARSIP_DISPORA.md`.

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
   - Folder: `sistem magang` resmi instansi (ID: `1QzW_9rFogegOhn--eLNb_rqu4jvz3oj0`).
   - Subfolder: `Surat Masuk` (ID: `1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n`) dan `Surat Keluar` (ID: `1rgWCFwULt8awBCVIuomy7cELKqEtbdkx`).
   - Sinkronisasi Berkas Fisik: Sebanyak 420 dari 420 berkas riil (171 Surat Masuk & 249 Surat Keluar) 100% tersimpan di Google Drive dinas via otorisasi OAuth 2.0 akun dinas berkuota 5 TB.
   - Sinkronisasi Database: 100% baris arsip di TiDB Cloud Serverless memiliki tautan langsung berkas Google Drive (`drive.google.com/file/d/...`).
   - Dual-Upload Real-Time: Integrasi `/api/upload` dan `src/lib/gdrive.ts` otomatis mengunggah setiap arsip baru secara simultan ke Cloudinary CDN dan Google Drive.

---

## 6. Evaluasi Kelayakan: Laporan Magang vs Skripsi S1 TI UNISKA

| Parameter | Posisi pada Laporan Magang (Semester 7) | Peluang Peningkatan ke Skripsi S1 (Semester 8) |
| :--- | :--- | :--- |
| **Objek Penelitian** | Pemecahan masalah temu-kembali 420 berkas scan Google Drive Dispora Kalsel. | Eksplorasi metode kecerdasan buatan (*AI & Machine Learning*) pada 420 berkas teks PDF. |
| **Metode Rekayasa** | Waterfall / Agile rekayasa web responsif (Next.js 15 + TiDB + Cloudinary). | Algoritma **OCR Tesseract** (ekstraksi teks otomatis) atau **Multinomial Naive Bayes TF-IDF** (klasifikasi kategori otomatis). |
| **Data Penelitian** | 420 berkas riil sebagai basis data arsip sistem. | 420 berkas riil sebagai korpus data latih (*training*) dan data uji (*testing*). |
| **Kesiapan** | **100% Siap Diujikan pada Sidang Magang**. | **Tinggal menambahkan 1 modul algoritma di semester 8**. |

---

## 7. Temuan Kebutuhan Lapangan: Pemindaian Multi-Foto & Fleksibilitas Lampiran Berkas

Berdasarkan observasi operasional persuratan langsung di Subbagian Umum dan Kepegawaian Dispora:

1. **Pemindaian Lembar Naskah Menggunakan Kamera Seluler (Multi-Halaman)**:
   - Staf kearsipan sering menerima naskah dinas fisik yang terdiri atas beberapa lembar kertas (2 s.d. 5 halaman).
   - Saat scanner flatbed kantor sedang antre atau mati lampu, staf memotret lembar demi lembar naskah fisik menggunakan kamera ponsel pintar (*smartphone*).
   - Dibutuhkan fitur pemindai cerdas (*Smart Document Scanner*) yang mampu menerima banyak foto JPG/PNG sekaligus, membersihkan bayangan kertas, memotong tepi (*crop*), dan mengemas seluruh lembar foto menjadi satu berkas PDF ukuran A4 resmi.
2. **Pencatatan Surat Masuk/Keluar Tanpa Menunggu Berkas Selesai Dipindai**:
   - Dalam alur kerja dinas yang padat, nomor surat atau agenda sering kali harus segera diterbitkan atau diagendakan terlebih dahulu oleh pengadministrasi persuratan, sementara dokumen fisik masih dibawa pimpinan untuk paraf atau sedang dalam proses pindaian.
   - Perekaman naskah surat harus dapat disimpan tanpa file lampiran fisik terlebih dahulu (lampiran opsional).
   - Diperlukan penanda visual yang tegas pada tabel arsip (`⚠️ Belum Ada Berkas`) agar arsiparis dapat mengetahui naskah mana yang belum memiliki lampiran berkas digital, serta tombol langsung untuk mengunggah berkas kapan saja via formulir edit.
3. **Penyelarasan Kolom Posisi Disposisi & Format Nomor Surat Keluar**:
   - Surat Masuk dan Surat Keluar memiliki sifat penomoran yang berbeda: Surat Masuk berasal dari pihak eksternal dengan format nomor acak sehingga pencatatan nomor agenda kedinasan Dispora (`/SM/2026`) menjadi identitas registrasi utama di kolom pertama.
   - Surat Keluar merupakan produk hukum resmi yang diterbitkan Dispora sendiri, sehingga nomor surat lengkap (misal `005/11502/DISPORA/2026`) harus langsung dipajang secara tegas pada kolom pertama sebagai identitas utama naskah, didampingi subteks nomor slot agenda.
   - Posisi perjalanan naskah dan disposisi fisik pimpinan (apakah masih di frontdesk, di meja pimpinan, atau sudah didistribusikan ke bidang teknis) sangat vital untuk diketahui secara sekilas. Oleh karena itu, penempatan kolom khusus `POSISI DISPOSISI` / `BIDANG PEMRAKARSA` tepat di antara kolom perihal dan tanggal menjadi konfigurasi paling ergonomis dan informatif bagi pegawai dinas.
4. **Pemekaran Kode Klasifikasi Arsip Dinamis (Hak Akses Developer & Rana)**:
   - Permendagri No. 83 Tahun 2022 mengatur bahwa urusan pemerintahan daerah yang berkembang dapat memerlukan penambahan sub-klasifikasi persuratan baru (misal: kewirausahaan pemuda, sentra olahraga disabilitas).
   - Penambahan kode klasifikasi baru tidak boleh sembarangan dilakukan oleh seluruh staf umum guna mencegah kekacauan skema penomoran surat dinas.
   - Ditetapkan kebijakan otorisasi ketat: Hanya akun Developer (`developer`) dan akun Rana (`pengarsip` / Rana Nur Syifa) selaku Pengelola Arsip Digital yang memiliki hak akses menambah kode klasifikasi baru ke basis data TiDB Cloud.
5. **Diferensiasi Tugas Magang: Pemisahan Akun Magang Surat Masuk vs Surat Keluar**:
   - Di lingkungan Sekretariat Dispora Kalsel, mahasiswa/siswa magang sering dibagi ke dalam dua pos tugas berbeda: satu orang ditugaskan khusus menerima, mencatat, dan mendokumentasikan Surat Masuk beserta lembar disposisi pimpinan; sementara satu orang lainnya bertugas mengagendakan, mencetak penomoran, dan mencatat ekspedisi Surat Keluar.
   - Untuk mencegah kesalahan input data silang atau akses naskah di luar tanggung jawab pos tugasnya, sistem menerapkan pembatasan hak akses berbasis akun terisolasi: Akun `magang_masuk` hanya dapat melihat dan merekam Surat Masuk, sedangkan Akun `magang_keluar` hanya dapat melihat dan merekam Surat Keluar.
   - Isolasi diterapkan multi-lapis: bilah navigasi, route guard pengalihan URL, penguncian formulir modal, hingga penolakan mutasi API 403 Forbidden.
