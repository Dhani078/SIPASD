# PANDUAN PENGGUNA RESMI (USER MANUAL)
# SISTEM INFORMASI PENGELOLAAN ARSIP SURAT DISPORA (SIPASD)
**Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan**  
*Alamat: Jalan Pramuka No. 4, Pemurus Luar, Kec. Banjarmasin Timur, Kota Banjarmasin, Kalimantan Selatan 70249*  
*Versi Aplikasi: 2.0.0-PROD | Platform: Web Responsif (Desktop & Mobile PWA)*

---

## 1. PENDAHULUAN & TUJUAN BUKU PANDUAN

Buku Panduan Pengguna (*User Manual*) ini disusun sebagai pedoman operasional resmi bagi seluruh aparatur di lingkungan Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan dalam memanfaatkan aplikasi **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)**. 

Aplikasi SIPASD berfungsi sebagai repositori e-arsip digital terindeks yang mengorganisasi seluruh pindaian (*scan*) dokumen Surat Masuk dan Surat Keluar Tahun Anggaran 2026. Dengan sistem ini, proses temu-kembali arsip dinas yang sebelumnya memakan waktu **15 hingga 30 menit** di lemari ordner fisik atau folder manual Google Drive kini dapat diselesaikan dalam waktu **kurang dari 2 detik** langsung melalui peramban komputer kerja maupun ponsel pintar (*smartphone*).

---

## 2. PERSYARATAN PERANGKAT & CARA MENGAKSES SISTEM

### 2.1 Persyaratan Perangkat Keras & Peramban
Sistem ini berbasis web modern murni (*Cloud-Native Web Application*), sehingga tidak memerlukan instalasi perangkat lunak khusus di komputer pengguna:
- **Perangkat Komputer / Laptop**: Mendukung sistem operasi Windows, macOS, atau Linux dengan resolusi layar minimal 1024x768 (direkomendasikan 1440x900 untuk mode kerja *Split-Screen*).
- **Perangkat Ponsel Pintar / Tablet**: Mendukung Android dan iOS dengan resolusi layar mulai dari 375px (otomatis menyesuaikan tata letak kartu tanpa geser horizontal).
- **Peramban Web yang Didukung**: Google Chrome (versi 110+), Mozilla Firefox (versi 110+), Microsoft Edge (versi 110+), atau Apple Safari (iOS 16+).

### 2.2 Tautan Akses Sistem
Buka peramban web dan masukkan alamat tautan resmi sistem:
```
https://sipasd.vercel.app
```
*(Untuk pengujian lokal di lingkungan jaringan kantor, gunakan: `http://localhost:3000`)*.

---

## 3. PANDUAN MASUK KE SISTEM (LOGIN & HAK AKSES)

### 3.1 Prosedur Login Akun
1. Buka tautan sistem. Pada halaman depan portal publik (*Landing Page*), klik tombol hijau **"Masuk ke Sistem (Login) ->"** di pojok kanan atas.
2. Anda akan diarahkan ke halaman login terproteksi (`/login`).
3. Masukkan **Username / NIP** resmi yang terdaftar pada kolom isian pertama.
4. Masukkan **Kata Sandi** pada kolom isian kedua. Klik ikon mata untuk melihat atau menyembunyikan karakter kata sandi.
5. Centang opsi *"Ingat saya selama jam kerja (8 jam)"* jika menggunakan komputer kerja pribadi dinas.
6. Klik tombol **"Masuk ke Sistem"**. Sistem akan memverifikasi kredensial dan mengarahkan Anda ke Dasbor Eksekutif sesuai wewenang jabatan.

### 3.2 Fitur Cepat Pengujian Akun Demonstrasi (One-Click Tester)
Untuk mempermudah demonstrasi, evaluasi pimpinan, dan pengujian sidang, tersedia bilah tombol cepat (*Tester Bar*) di bawah formulir login:
- Klik tombol **`[Kadispora]`**: Otomatis mengisi akun Kepala Dinas (**Pebriadin Hapiz, AP, M.Si**).
- Klik tombol **`[Petugas TU]`**: Otomatis mengisi akun Pengadministrasi Persuratan Subbag Umum & Kepegawaian (`tu_umum`).
- Klik tombol **`[Kasubbag Keuangan]`**: Otomatis mengisi akun PPTK Subbag Keuangan (**Norika Fajriana, SH, MH**).
- Klik tombol **`[Kabid Olahraga]`**: Otomatis mengisi akun Kepala Bidang Pembudayaan Olahraga (**Budiono, S.Pd, M.AP**).
- Klik tombol **`[Super Admin]`**: Otomatis mengisi akun Administrator IT Sistem (`admin`).
*(Kata sandi default untuk seluruh akun pengujian adalah: `Dispora2026!`)*.

---

## 4. MENGENAL STRUKTUR ANTARMUKA KERJA (LAYOUT NAVIGASI)

Setelah berhasil masuk, layar kerja terbagi menjadi dua area utama:

```
+----------------------------------------------------------------------------------------------------+
| [SIDEBAR KIRI (260px)]          | [AREA KERJA UTAMA]                                               |
| - Lambang Kalsel & SIPASD       | - Bilah Atas: Breadcrumb, Pencarian Global, Jam WITA, Notifikasi |
| - Profil Pengguna Aktif (Kadis) | - 4 Kartu Metrik KPI Dokumen (171 Masuk, 249 Keluar, 420 Total)   |
| - Menu: Dashboard               | - Grafik Bulanan & Diagram Sebaran Unit Kerja Dispora            |
| - Menu: Arsip Surat Masuk (171) | - Tabel Akses Cepat Dokumen Mendesak (Kilat & Segera)             |
| - Menu: Arsip Surat Keluar (249)|                                                                  |
| - Menu: Riwayat Disposisi Fisik |                                                                  |
| - Menu: Buku Agenda Excel       |                                                                  |
| - Menu: Master Klasifikasi & Log|                                                                  |
| - Tombol Keluar (Logout)        |                                                                  |
+----------------------------------------------------------------------------------------------------+
```

1. **Bilah Samping Kiri (Permanent Left Sidebar)**:
   - Berwarna hijau zamrud resmi kedinasan (`#064E3B`).
   - Memuat profil pejabat yang sedang aktif (Nama, Jabatan, dan status online).
   - Pengelompokan menu:
     * **UTAMA**: Dasbor Eksekutif.
     * **ARSIP KEDINASAN**: Katalog Surat Masuk, Katalog Surat Keluar, Riwayat Disposisi Fisik.
     * **REKAPITULASI**: Buku Agenda Excel (.xlsx), Buku Ekspedisi.
     * **PENGATURAN**: Master Klasifikasi Arsip, Manajemen Pengguna, Jejak Forensik (Audit Trail).
2. **Bilah Header Atas (Top Navbar)**:
   - Kolom Pencarian Cepat Global (Tekan pintasan tombol keyboard `Ctrl + K` untuk mencari dari layar mana saja).
   - Penunjuk waktu dinas resmi Waktu Indonesia Tengah (WITA).
   - Ikon lonceng notifikasi untuk surat-surat yang berkategori mendesak (*Kilat/Segera*).
   - Tombol cepat **"+ Indeks Surat Baru"**.

---

## 5. PANDUAN MODUL KATALOG ARSIP SURAT MASUK (SPLIT-SCREEN WORKSPACE)

Modul ini digunakan untuk menelusuri 171 dokumen surat masuk pindaian yang diterima Dispora Kalsel sepanjang TA 2026.

### 5.1 Cara Menemukan Dokumen Surat Masuk (< 2 Detik)
1. Klik menu **"Arsip Surat Masuk"** pada sidebar kiri.
2. Pada bilah penyaring di atas tabel, Anda dapat melakukan pencarian dengan 3 cara:
   - **Ketik Kata Kunci**: Masukkan nomor surat (misal: `0973`), nama instansi (misal: `KONI`), atau perihal (misal: `Kejuaraan`) pada kolom pencarian. Hasil akan tersaring secara otomatis dalam waktu seketika tanpa perlu menekan tombol Enter.
   - **Pilih Sifat Surat**: Gunakan dropdown untuk menyaring dokumen berkategori *Kilat*, *Segera*, *Penting*, atau *Biasa*.
   - **Pilih Kode Klasifikasi**: Saring dokumen berdasarkan rumpun urusan dinas (contoh: `426` untuk urusan Keolahragaan atau `005` untuk Undangan).

### 5.2 Cara Membaca Dokumen PDF Langsung di Layar (Tanpa Mengunduh)
1. Klik pada baris surat yang diinginkan pada tabel sebelah kiri.
2. Baris yang dipilih akan menyala dengan warna latar hijau muda (*highlight* `#ECFDF5`).
3. Pada panel kanan (*Split-Screen Viewer*), dokumen pindaian asli PDF akan langsung dimuat secara otomatis.
4. Anda dapat menggunakan tombol kontrol di atas dokumen:
   - **Ikon Kaca Pembesar (+ / -)**: Memperbesar atau memperkecil teks dokumen.
   - **Ikon Unduh**: Mengunduh berkas pindaian asli ke komputer Anda.
   - **Tombol "Buka Cadangan di Google Drive"**: Membuka salinan arsip pada folder Google Drive resmi instansi jika terjadi kendala akses.

---

## 6. PANDUAN PEREKAMAN RIWAYAT DISPOSISI FISIK PIMPINAN

Fitur ini digunakan oleh staf tata usaha untuk mendokumentasikan catatan tulisan tangan pimpinan dari lembar disposisi kertas fisik ke dalam sistem.

### 6.1 Langkah Mencatat Disposisi Fisik
1. Pada baris surat masuk yang bersangkutan, klik tombol **"Riwayat Disposisi"** (ikon jam kerja).
2. Jendela formulir modal disposisi akan muncul di layar.
3. Masukkan informasi berikut sesuai coretan asli pimpinan pada kertas:
   - **Pejabat Pendisposisi**: Pilih nama pimpinan (*Pebriadin Hapiz, AP, M.Si* atau *Sekretaris Dinas*).
   - **Tanggal Disposisi**: Tanggal pembubuhan paraf fisik pimpinan.
   - **Diteruskan Kepada**: Pilih bidang kerja yang ditugaskan (contoh: *Bidang Pembudayaan Olahraga* atau *Subbag Keuangan*).
   - **Instruksi yang Dicentang**: Centang opsi yang sesuai (*Tindak lanjuti*, *Pelajari/Telaah*, *Hadiri/Wakili*, *Koordinasikan*, *Fasilitasi*, atau *Siapkan Bahan*).
   - **Catatan Khusus Pimpinan**: Ketikkan arahan tertulis tangan pimpinan secara persis (contoh: *"Fasilitasi venue lapangan tenis dan siapkan surat izin peminjaman"*).
4. Klik tombol hijau **"Simpan Catatan Disposisi"**.
5. Sistem akan menyimpan riwayat disposisi ke database TiDB Cloud dan menyematkan lencana status pada tabel.

---

## 7. PANDUAN CETAK SALINAN LEMBAR DISPOSISI STANDAR PEMPROV KALSEL

Ketika berkas fisik dipinjam atau map kerja dinas memerlukan lampiran lembar disposisi resmi, sistem dapat mencetak salinan berstandar baku kedinasan:

1. Pada baris surat masuk yang diinginkan, klik tombol **"Cetak Disposisi"** (ikon printer).
2. Layar akan menampilkan pratinjau lembaran cetak resmi ukuran F4/A4 yang memuat Kop Surat Resmi Pemerintah Provinsi Kalimantan Selatan - Dinas Kepemudaan dan Olahraga, garis ganda pembatas, tabel isian agenda, kotak tanda centang instruksi, catatan tulisan tangan, serta kotak tanda tangan Kepala Dinas lengkap dengan NIP dan ruang cap basah.
3. Klik tombol **"Cetak Dokumen (Print)"** di bagian bawah.
4. Dialog cetak peramban akan terbuka. Pastikan setelan:
   - **Tujuan (Destination)**: Pilih printer fisik Anda atau pilih *"Save as PDF"*.
   - **Ukuran Kertas (Paper Size)**: A4 atau Folio (F4).
   - **Margin**: Default atau Minimum (1 cm).
5. Klik **Print**. Dokumen akan tercetak presisi pas dalam 1 lembar kertas tanpa terpotong.

---

## 8. PANDUAN KATALOG ARSIP SURAT KELUAR & KODE KLASIFIKASI

Modul ini mengelola 249 berkas surat keluar dinas yang diterbitkan Dispora Kalsel sepanjang TA 2026.

### 8.1 Cara Menelusuri Surat Keluar
1. Klik menu **"Arsip Surat Keluar"** pada sidebar kiri.
2. Anda dapat melihat daftar surat keluar yang telah terindeks dengan kode klasifikasi kearsipan:
   - `005`: Surat Undangan Pertemuan & Rapat Dinas.
   - `426`: Surat Rekomendasi Atlet, Hibah Cabor, dan Sewa 11 Venue Olahraga Daerah.
   - `427`: Surat Kegiatan Organisasi Pemuda & Jambore.
   - `800`: Surat Perintah Tugas (SPT) Perjalanan Dinas Staf.
   - `045`: Surat Pengantar Kearsipan & Pengiriman Berkas.
   - `900`: Surat Pengantar Pertanggungjawaban Keuangan & SPJ.
3. Klik tombol **"Lihat Dokumen"** pada baris surat untuk membaca pindaian surat yang telah bertanda tangan dan berstempel basah.

---

## 9. PANDUAN EKSPOR BUKU AGENDA KE FORMAT EXCEL (.XLSX)

Untuk keperluan penyusunan Laporan Pertanggungjawaban (LPJ/SPJ) kearsipan tahunan, petugas tidak perlu lagi mengetik ulang ratusan nomor surat ke spreadsheet:

1. Klik menu **"Buku Agenda Excel"** pada sidebar kiri (atau klik tombol **"Ekspor Excel"** pada bilah atas katalog).
2. Pilih jenis register yang ingin diekspor:
   - **Buku Agenda Surat Masuk (TA 2026)**
   - **Buku Agenda Surat Keluar (TA 2026)**
3. Klik tombol hijau **"Unduh Berkas Excel (.xlsx)"**.
4. Dalam waktu 1–2 detik, berkas spreadsheet resmi dengan nama `Buku-Agenda-Surat-Masuk-Dispora-2026.xlsx` akan terunduh otomatis ke komputer Anda.
5. Buka berkas tersebut di Microsoft Excel atau Google Sheets. Seluruh data telah tertata rapi lengkap dengan Kop Dinas resmi, baris judul tabel berwarna hijau zamrud, garis batas sel (*border*), dan kolom yang terkunci (*freeze panes*).

---

## 10. PANDUAN PENGOPERASIAN PADA PONSEL PINTAR (MOBILE PWA)

Aplikasi SIPASD dioptimalkan penuh untuk aparatur yang sedang bertugas di luar kantor:

1. Buka peramban Google Chrome atau Safari di ponsel pintar Anda dan akses tautan sistem.
2. Tampilan akan otomatis bertransformasi ke mode kartu (*Card Stack Layout*):
   - Tabel padat berganti menjadi daftar kartu yang mudah dibaca.
   - Tombol sentuh dirancang berukuran minimal 44x44 piksel agar nyaman ditekan menggunakan jari.
   - Bilah navigasi bawah (*Bottom Navigation Bar*) memudahkan perpindahan antara Beranda, Surat Masuk, Surat Keluar, dan Profil.
3. Untuk membaca dokumen PDF, cukup ketuk salah satu kartu surat. Dokumen akan terbuka langsung dalam panel layar penuh responsif tanpa membuat memori penyimpanan ponsel Anda penuh.
4. Tidak ada bilah geser ke samping (*0 horizontal scrollbar overflow*), menjamin keterbacaan naskah dinas 100% nyaman.

---

## 11. BANTUAN TEKNIS & LAYANAN PENGGUNA

Jika Anda mengalami kendala teknis, lupa kata sandi akun kedinasan, atau memerlukan penambahan hak akses bidang baru, silakan menghubungi:

- **Pengelola Teknis Sistem**: Subbagian Perencanaan dan Keuangan / Subbag Umum & Kepegawaian.
- **Pranata Komputer / Pengembang**: Muhammad Rizki Ramadhani (NPM: 2310010406).
- **Lokasi Kantor**: Kantor Dispora Provinsi Kalimantan Selatan, Jalan Pramuka No. 4 Banjarmasin.
- **Email Layanan**: `admin.dispora@kalselprov.go.id` / `dhanisepeda@gmail.com`.
