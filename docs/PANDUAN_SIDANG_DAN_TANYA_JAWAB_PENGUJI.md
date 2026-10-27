# PANDUAN SIDANG MAGANG & SIMULASI TANYA JAWAB DOSEN PENGUJI
**Sistem Informasi Pengelolaan Arsip Surat Dispora (SIPASD)**  
*Pengembang: Muhammad Rizki Ramadhani (NPM: 2310010406) - S1 Teknik Informatika UNISKA Banjarmasin*  
*Instansi: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 1. Skenario Live Demo Sistem 5 Menit di Depan Penguji

Gunakan alur demonstrasi ini agar presentasi terlihat sistematis, percaya diri, dan memukau dewan penguji:

### Menit ke-1: Portal Publik & Latar Belakang Masalah
1. Buka peramban di alamat resmi: `https://www.sipasd.my.id`
2. Tunjukkan kepada penguji:
   - Identitas resmi Pemerintah Provinsi Kalimantan Selatan dan logo daerah.
   - Sampaikan masalah riil: *"Sebelumnya Dispora menyimpan 420 berkas scan PDF hanya ditumpuk di Google Drive tanpa metadata, sehingga staf memerlukan waktu 15 hingga 30 menit hanya untuk mencari satu surat."*
   - Coba fitur **Lacak Status Disposisi Berkas**: Masukkan nomor agenda `1099` atau `1238`, lalu tekan Cari. Tunjukkan bahwa sistem langsung mengarahkan ke dokumen dalam waktu < 2 detik.
   - Tunjukkan visualisasi aset **11 Venue Olahraga Banua** yang dikelola Dispora Kalsel.

### Menit ke-2: Otentikasi Terproteksi & RBAC 4 Tingkat
1. Klik tombol **Masuk ke Sistem** (mengarah ke `/login`).
2. Tunjukkan fitur **1-Klik Uji Peran Kedinasan**:
   - Jelaskan bahwa sistem menerapkan Role-Based Access Control (RBAC) 4 tingkat: Super Admin (`admin`), Pimpinan/Kadis (`kadis`), Petugas Arsip (`tu_umum`), dan Kepala Bidang teknis.
   - Klik tombol tester **Kadispora** (`kadis`) untuk langsung masuk ke sesi pimpinan dengan keamanan enkripsi JWT Cookie HttpOnly dan Bcrypt hash.

### Menit ke-3: Dasbor Eksekutif & Kueri Riil TiDB Cloud
1. Setelah login, sistem menampilkan halaman `/dashboard`.
2. Tunjukkan 4 kartu metrik KPI real-time:
   - Surat Masuk: **170 Dokumen**
   - Surat Keluar: **241 Dokumen**
   - Total Dokumen Digital: **411 Berkas Riil TA 2026**
   - Sifat Kilat & Segera: Dokumen prioritas tinggi
3. Tegaskan kepada penguji: *"Seluruh data ini 100% ditarik langsung secara real-time dari basis data TiDB Cloud Serverless tanpa dummy data atau array tiruan."*
4. Tunjukkan grafik batang aktivitas bulanan TA 2026 dan diagram donat distribusi beban persuratan di 5 bidang dinas.

### Menit ke-4: Katalog Surat Masuk & Split-Screen PDF Viewer Asli
1. Klik menu **Arsip Surat Masuk** pada bilah navigasi samping (`/arsip-masuk`).
2. Klik salah satu baris surat atau klik ikon mata pada baris surat.
3. Tunjukkan panel **Split-Screen View**:
   - Sisi kiri: Tabel filter multi-kriteria (nomor agenda, klasifikasi, sifat surat, dan venue).
   - Sisi kanan: Panel penampil dokumen PDF fisik asli yang di-streaming melalui Cloudinary CDN via endpoint signed URL anti-401 (`/api/pdf`).
   - Tunjukkan fitur zoom (`+` / `-`), buka tab baru, dan unduh berkas asli.

### Menit ke-5: Cetak Lembar Disposisi Standar Pemprov Kalsel & Ekspor Excel
1. Pada surat yang terbuka, klik tombol **Disposisi / Cetak Disposisi**.
2. Tunjukkan modal cetak lembar disposisi:
   - Pilih ukuran kertas **F4** atau **A4**.
   - Jelaskan bahwa tampilan cetak telah memenuhi format resmi kedinasan Pemprov Kalsel (kop dinas, tabel disposisi, pilihan 5 bidang, dan catatan pimpinan).
   - Tekan tombol **Cetak Disposisi** untuk memicu dialog print peramban (`@media print`).
3. Tutup modal, lalu klik tombol **Ekspor Excel** di toolbar atas.
4. Tunjukkan bahwa berkas `Buku-Agenda-Dispora-2026.xlsx` terunduh otomatis via pustaka `exceljs` lengkap dengan format sel yang rapi untuk pembukuan SPJ dinas.

---

## 2. Bedah Tanya Jawab Kritis Dosen Penguji (Q&A Defense)

### Pertanyaan 1: Mengapa membangun aplikasi baru dan tidak cukup menggunakan Google Drive yang sudah ada?
**Jawaban Mahasiswa:**
> *"Google Drive adalah penyimpanan berbasis folder (object storage murni), bukan sistem informasi tata kelola persuratan. Pada Google Drive dinas, 420 berkas pindaian hanya ditumpuk dengan nama file manual yang acak (misal: '0973(14 Agustus).pdf'). Staf tata usaha tidak bisa mencari berdasarkan perihal, kode klasifikasi kearsipan (Permendagri), maupun asal instansi, sehingga pencarian butuh waktu 15 hingga 30 menit. Selain itu, Google Drive tidak memiliki fitur pencatatan lembar disposisi pimpinan, cetak lembar disposisi A4/F4, maupun ekspor buku agenda persuratan untuk SPJ. Sistem SIPASD dibangun sebagai Repositori E-Arsip Digital Terindeks yang menyelesaikan seluruh kelemahan tersebut dengan memangkas waktu temu-kembali menjadi kurang dari 2 detik."*

### Pertanyaan 2: Mengapa memilih Next.js 15 App Router dan TiDB Cloud Serverless dibanding stack konvensional PHP/MySQL XAMPP?
**Jawaban Mahasiswa:**
> *"Pemilihan stack ini didasarkan pada prinsip modernisasi SPBE dan efisiensi biaya operasional:
> 1. Next.js 15 App Router memanfaatkan Server Components dan Streaming, sehingga beban komputasi penarikan metadata 411 dokumen terjadi di server edge, menghasilkan skor performa Core Web Vitals yang sangat tinggi dan responsif di ponsel maupun PC.
> 2. TiDB Cloud Serverless adalah basis data NewSQL terkelola penuh (fully-managed) yang kompatibel 100% dengan protokol MySQL, memiliki latensi rendah (< 35 ms dari region Singapura), dan memberikan kuota gratis permanen sebesar 25 GB.
> 3. Jika menggunakan PHP/MySQL di localhost XAMPP komputer kantor, sistem tidak bisa diakses publik saat pimpinan dinas dinas luar daerah atau komputer kantor mati. Dengan kombinasi Vercel Edge dan TiDB Cloud, sistem aktif 24 jam non-stop dengan biaya operasional tepat Rp 0,- (Zero Cost Guarantee)."*

### Pertanyaan 3: Bagaimana mekanisme penyimpanan berkas PDF fisiknya? Apakah disimpan di database TiDB?
**Jawaban Mahasiswa:**
> *"Berkas PDF fisik tidak disimpan di dalam basis data (tidak disimpan sebagai tipe BLOB), karena menyimpan ratusan megabyte file biner di basis data akan menurunkan performa kueri dan menghabiskan memori database. 
> Sistem menerapkan arsitektur Dual-Cloud Storage:
> - Penyimpanan Primer: Cloudinary CDN untuk streaming dokumen PDF cepat ke peramban pengguna melalui endpoint terproteksi /api/pdf yang menggunakan signed signature.
> - Penyimpanan Sekunder: Google Drive resmi dinas (folder sistem magang) sebagai cadangan permanen institusi.
> Di dalam basis data TiDB, sistem hanya menyimpan URL berkas, public ID, dan metadata terindeks seperti nomor surat, tanggal, asal instansi, perihal, dan riwayat disposisi."*

### Pertanyaan 4: Bagaimana sistem memastikan keamanan data dari akses yang tidak berhak?
**Jawaban Mahasiswa:**
> *"Keamanan sistem dirancang berlapis mengacu pada standar OWASP Top 10:
> 1. Otentikasi menggunakan JSON Web Token (JWT) yang disimpan di dalam cookie peramban dengan atribut HttpOnly, Secure, dan SameSite=Lax. Ini mencegah serangan pencurian token melalui celah Cross-Site Scripting (XSS).
> 2. Seluruh kata sandi pengguna dienkripsi menggunakan algoritma hashing satu arah Bcrypt dengan salt rounds 10.
> 3. Hak akses dibatasi secara ketat menggunakan Role-Based Access Control (RBAC) 4 tingkat: Super Admin, Petugas Arsip, Pimpinan, dan Bidang Teknis.
> 4. Validasi berkas unggahan dilakukan ganda: memeriksa ekstensi .pdf, memeriksa ukuran maksimal 20 MB, dan memeriksa magic bytes biner (%PDF-) untuk mencegah injeksi malware.
> 5. Seluruh aktivitas transaksi persuratan dicatat secara otomatis ke dalam tabel audit_logs."*

### Pertanyaan 5: Apa rencana pengembangan sistem ini untuk diangkat ke Skripsi S1 Teknik Informatika?
**Jawaban Mahasiswa:**
> *"Sistem SIPASD ini telah memiliki dataset riil sebanyak 420 berkas dokumen persuratan kedinasan TA 2026. Untuk Skripsi S1, sistem ini akan di-upgrade menjadi sistem cerdas dengan dua metode kecerdasan buatan:
> 1. Optical Character Recognition (OCR Tesseract / Vision AI) untuk mengekstraksi teks isi surat fisik secara otomatis tanpa staf perlu mengetik perihal manual.
> 2. Text Mining dengan Algoritma Naive Bayes Classifier dan pembobotan TF-IDF untuk memprediksi disposisi bidang tujuan secara otomatis berdasarkan kata kunci isi surat.
> Blueprint dan roadmap peningkatan ini telah didokumentasikan secara lengkap pada berkas docs/SKRIPSI_UPGRADE_ROADMAP.md di repositori proyek."*

---

## 3. Checklist Kesiapan Teknis Sebelum Sidang
- [x] Laptop terhubung koneksi internet stabil (bisa tethering ponsel).
- [x] Buka peramban di tab utama: `https://www.sipasd.my.id`.
- [x] Siapkan file presentasi `docs/PRESENTASI_SIDANG_MAGANG_SIPASD.pptx` atau buka cadangan `docs/PRESENTASI_SIDANG_MAGANG_SIPASD.html`.
- [x] Cetak naskah `docs/LAPORAN_MAGANG_SIPASD_DISPORA_KALSEL.docx` yang sudah dijilid rapi.
- [x] Akun demo pimpinan siap digunakan via tombol akses cepat satu-klik.
