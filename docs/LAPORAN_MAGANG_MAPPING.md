# PEMETAAN MATERI SISTEM SIPASD KE LAPORAN MAGANG
**Panduan Penyusunan Naskah Kerja Praktik / Magang — Teknik Informatika UNISKA Semester 7**  
*Mahasiswa: Muhammad Rizki Ramadhani (NPM: 2310010406)*  
*Lokasi Magang: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 📘 BAB I: PENDAHULUAN

### 1.1 Latar Belakang
- Penjelasan tata kelola birokrasi pemerintahan daerah di era transformasi digital SPBE (Sistem Pemerintahan Berbasis Elektronik).
- Realitas operasional pada Sekretariat Dispora Kalsel: tingginya lalu lintas persuratan dinas (ratusan surat kejuaraan, hibah atlet, koordinasi kementerian) yang masih dikelola dengan buku agenda manual bergaris dan tumpukan ordner fisik.
- Identifikasi 3 kendala utama:
  1. Waktu pencarian arsip fisik yang memakan waktu 15–30 menit.
  2. Lembar disposisi kertas yang rawan tercecer atau mandek di meja pejabat.
  3. Risiko duplikasi penomoran surat keluar akibat permintaan nomor manual secara bersamaan.
- Urgensi pembangunan aplikasi web responsif **SIPASD** (*Sistem Informasi Pengelolaan Arsip dan Surat Dispora*).

### 1.2 Rumusan Masalah
1. Bagaimana merancang sistem informasi persuratan dan e-agenda digital berbasis web yang mampu mempercepat pencarian arsip surat masuk dan keluar di Dispora Kalsel?
2. Bagaimana membangun modul lembar disposisi elektronik berjenjang untuk memonitor progres tindak lanjut tugas dinas secara real-time?
3. Bagaimana mengimplementasikan mekanisme penomoran surat otomatis guna mencegah terjadinya nomor surat keluar ganda?

### 1.3 Batasan Masalah
1. Sistem diterapkan pada lingkungan Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
2. Data yang dikelola meliputi Surat Masuk, Surat Keluar, Disposisi Pimpinan, dan Buku Ekspedisi Tahun Anggaran 2026.
3. Hak akses pengguna dibatasi pada 4 peran: Super Admin, Pimpinan (Kadis/Sekretaris), Petugas Agenda (TU), dan Kepala Bidang.
4. Berkas arsip digital yang didukung berformat dokumen Portable Document Format (PDF).

### 1.4 Tujuan & Manfaat
- **Tujuan**: Menghasilkan aplikasi web responsif SIPASD yang andal, aman, dan siap pakai untuk mendukung operasional persuratan dinas.
- **Manfaat bagi Instansi**: Mempercepat temu-kembali arsip, menjamin transparansi disposisi, dan menertibkan administrasi penomoran surat.
- **Manfaat bagi Mahasiswa**: Memenuhi syarat kelulusan mata kuliah Kerja Praktik (Magang) S1 Teknik Informatika UNISKA serta menjadi pondasi penelitian tugas akhir / skripsi.

---

## 🏛️ BAB II: TINJAUAN UMUM INSTANSI

### 2.1 Profil Singkat Dispora Provinsi Kalimantan Selatan
- Alamat: Jalan Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70249.
- Visi & Misi Pemprov Kalsel: *Kalsel Maju (Makmur, Sejahtera, Berkelanjutan)* dengan pilar penguatan kualitas pemuda dan daya saing keolahragaan banua.
- Struktur Pejabat Pengesah:
  - Kepala Dinas / PA: Pebriadin Hapiz, AP, M.Si
  - PPTK / Subbag Keuangan: Norika Fajriana, SH, MH
  - Bendahara Pengeluaran: Sathia Nico Brata Simanjuntak, S.Akun

### 2.2 Struktur Organisasi & Unit Kerja
- Sekretariat: Subbag Perencanaan & Pelaporan, Subbag Keuangan, Subbag Umum & Kepegawaian.
- Bidang Teknis: Bidang Pembudayaan Olahraga, Bidang Peningkatan Prestasi Olahraga, Bidang Pengembangan Pemuda, Bidang Pemberdayaan Pemuda, Bidang Sarana & Prasarana.

---

## ⚙️ BAB III: ANALISIS DAN PERANCANGAN SISTEM

### 3.1 Analisis Sistem yang Berjalan (Existing System)
- Flowchart alur surat masuk manual (Staf TU -> Buku Agenda Kertas -> Meja Kadis -> Disposisi Kertas -> Map Berkas -> Bidang Pengolah).
- Kelemahan sistem manual: Buku agenda rawan rusak/basah, pencarian lama, status tindak lanjut tidak dapat dipantau dari luar kantor.

### 3.2 Analisis Sistem yang Diusulkan (Proposed System)
- Arsitektur Web Responsif (dapat diakses fleksibel melalui HP maupun laptop/PC staf).
- Penyimpanan awan hibrida: TiDB Serverless untuk database metadata dan Cloudflare R2 untuk penyimpanan 420+ berkas PDF.

### 3.3 Pemodelan Diagram UML (Unified Modeling Language)
1. **Use Case Diagram**:
   - Aktor: Super Admin, Pimpinan, Petugas Agenda, Kepala Bidang.
   - Use Cases: Login, Kelola Master Dinas, Rekam Surat Masuk, Pratinjau PDF, Terbitkan Disposisi, Proses Tindak Lanjut, Booking Nomor Surat Keluar, Cetak Buku Ekspedisi, Ekspor Excel Laporan.
2. **Activity Diagram**:
   - Activity Diagram Alur Penerimaan & Disposisi Surat Masuk.
   - Activity Diagram Alur Permintaan Nomor & Pengarsipan Surat Keluar.
3. **Sequence Diagram**:
   - Interaksi pengguna, antarmuka, controller/server action, dan basis data TiDB.
4. **Class Diagram & Entity Relationship Diagram (ERD)**:
   - Mengacu pada dokumen `docs/DATABASE_SCHEMA.md`.

### 3.4 Perancangan Antarmuka Pengguna (UI/UX Design)
- Wireframe Halaman Login RBAC.
- Wireframe Dashboard Eksekutif & Grafik KPI.
- Wireframe E-Agenda Surat Masuk dengan Split-Screen PDF Viewer.
- Wireframe Lembar Disposisi Digital & Format Cetak Standar Pemprov Kalsel.
- Wireframe Booking Nomor Surat Keluar.

---

## 💻 BAB IV: IMPLEMENTASI DAN PENGUJIAN

### 4.1 Implementasi Perangkat Keras dan Lunak
- **Perangkat Keras**: Laptop pengembang (RAM 16 GB, SSD NVMe).
- **Perangkat Lunak**: Next.js 15, TypeScript, Tailwind CSS v4, Node.js 20, TiDB Cloud Serverless, Cloudflare R2, Git & VS Code.

### 4.2 Implementasi Basis Data & Kode Program
- Pembuatan tabel relasional melalui skema Prisma ORM.
- Implementasi middleware proteksi sesi dan enkripsi bcrypt.
- Implementasi chunked streaming PDF viewer untuk efisiensi memori.

### 4.3 Pengujian Sistem (Black Box Testing)
Tabel matriks pengujian fungsional untuk dimasukkan ke laporan:

| No | Modul / Skenario Uji | Aksi yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Autentikasi Pengguna | Memasukkan username dan password yang valid. | Sistem mengarahkan ke dashboard sesuai role pengguna. | **Valid (Sesuai)** |
| 2 | Proteksi Form Kosong | Mengirim formulir surat masuk tanpa nomor surat. | Muncul notifikasi validasi error dari Zod schema. | **Valid (Sesuai)** |
| 3 | Unggah Berkas PDF | Mengunggah file PDF scan berukuran 8 MB. | File terunggah ke Cloudflare R2 dan URL tersimpan di TiDB. | **Valid (Sesuai)** |
| 4 | Penerbitan Disposisi | Pimpinan memilih instruksi dan meneruskan ke Bidang Pora. | Disposisi langsung muncul di notifikasi dashboard Kabid Pora. | **Valid (Sesuai)** |
| 5 | Generator Nomor Otomatis | Dua pengguna mengambil nomor surat keluar bersamaan. | Sistem mengunci nomor urut berikutnya secara atomik tanpa dobel. | **Valid (Sesuai)** |
| 6 | Ekspor Buku Agenda | Mengklik tombol "Ekspor Excel" periode 2026. | Terunduh file spreadsheet `.xlsx` dengan format kop dinas rapi. | **Valid (Sesuai)** |

---

## 🎯 BAB V: PENUTUP

### 5.1 Kesimpulan
1. Aplikasi web responsif SIPASD berhasil dibangun dan memangkas waktu temu-kembali 420 berkas arsip fisik Dispora Kalsel dari 15–30 menit menjadi di bawah 2 detik.
2. Modul disposisi elektronik berjenjang memberikan kejelasan tanggung jawab dan mempermudah pimpinan memantau penyelesaian tugas dinas secara transparan.
3. Modul auto-numbering surat keluar berhasil mengeliminasi potensi nomor ganda di lingkungan sekretariat.

### 5.2 Saran Pengembangan (Bahan Peningkatan ke Skripsi S1)
1. Menambahkan modul **Text Mining / Natural Language Processing (NLP)** menggunakan algoritma Naive Bayes atau TF-IDF untuk klasifikasi disposisi otomatis berdasarkan isi teks perihal surat.
2. Mengintegrasikan teknologi **Optical Character Recognition (OCR)** agar sistem otomatis membaca nomor dan tanggal langsung dari pindaian kamera/PDF tanpa pengetikan manual.
