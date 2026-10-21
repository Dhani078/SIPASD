# DRAF NASKAH LAPORAN MAGANG: BAB V PENUTUP
**Program Studi S1 Teknik Informatika - Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)*

---

## 5.1 Kesimpulan

Berdasarkan seluruh tahapan analisis, perancangan, implementasi, dan pengujian sistem repositori e-arsip yang telah dilaksanakan selama kegiatan Kerja Praktik (Magang) pada Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan, dapat ditarik kesimpulan sebagai berikut:

1. **Digitalisasi Repositori E-Arsip Terindeks**:
   Aplikasi web responsif **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)** telah berhasil dibangun menggunakan tumpukan teknologi modern *Next.js 15, TypeScript, Tailwind CSS v4, TiDB Cloud Serverless, dan Cloudinary & Google Drive*. Sistem ini sukses menjadi solusi pengganti penyimpanan manual Google Drive (`arsipdispora2026`), mengorganisasi 420 berkas PDF riil TA 2026 (171 Surat Masuk dan 249 Surat Keluar) ke dalam basis data terindeks.
2. **Peningkatan Drastis Kecepatan Temu-Kembali Arsip**:
   Pengujian fungsional membuktikan bahwa SIPASD memangkas waktu pencarian dokumen arsip surat dari sebelumnya **15 hingga 30 menit** di Google Drive menjadi **kurang dari 2 detik** melalui mesin pencari multi-filter berbasis nomor, tanggal, instansi, perihal, dan kode klasifikasi dinas.
3. **Kemudahan Akses Dokumen via In-Browser Streaming Viewer**:
   Fitur *built-in in-browser PDF streaming viewer* memungkinkan pimpinan dan staf menelaah dokumen pindaian secara langsung di layar peramban komputer kerja maupun ponsel pintar (*smartphone*) tanpa kewajiban mengunduh berkas fisik ke memori lokal.
4. **Dokumentasi Disposisi Fisik dan Ekspor Buku Agenda Otomatis**:
   Sistem berhasil mendokumentasikan catatan lembar disposisi fisik yang telah ditorehkan pimpinan serta menyediakan fitur ekspor Buku Agenda Surat Masuk dan Keluar ke format Microsoft Excel (.xlsx) dengan tata letak resmi kedinasan untuk mempermudah pelaporan pertanggungjawaban (SPJ/LPJ).
5. **Keberhasilan Validasi Pengujian Black Box**:
   Pengujian fungsionalitas menggunakan metode *Black Box Testing* pada 15 skenario kunci membuktikan bahwa seluruh fitur (Autentikasi RBAC, Pencarian, Pratinjau PDF, Dokumentasi Disposisi, Ekspor Excel, dan Responsivitas Mobile 0 Overflow) berjalan **100% valid** dan siap digunakan di kantor Dispora Prov. Kalsel.

---

## 5.2 Saran

Demi pengembangan sistem yang berkelanjutan, penulis menyampaikan sejumlah saran strategis:

### 5.2.1 Saran untuk Instansi (Dispora Provinsi Kalimantan Selatan)
1. **Pemeliharaan Pengindeksan Berkas Secara Berkala**:
   Disarankan agar staf tata usaha melakukan pengindeksan metadata secara konsisten setiap kali selesai memindai berkas surat fisik baru, sehingga repositori e-arsip selalu mutakhir (*up-to-date*).
2. **Optimalisasi Tata Letak Penyimpanan Cloud**:
   Disarankan memanfaatkan kuota gratis Cloudinary & Google Drive (10 GB) dan TiDB Cloud Serverless (25 GB) secara optimal dengan melakukan kompresi berkas PDF sebelum diunggah agar kapasitas penyimpanan awan dapat bertahan untuk pemakaian bertahun-tahun tanpa biaya.

### 5.2.2 Saran Pengembangan Akademis (Peningkatan ke Skripsi S1)
Karakteristik data 420 berkas pindaian scan PDF yang tersimpan pada SIPASD merupakan objek data penelitian (*dataset testbed*) yang sangat sempurna untuk ditingkatkan menjadi Skripsi S1 Teknik Informatika di UNISKA Banjarmasin pada semester 8:
1. **Penerapan Algoritma OCR (Optical Character Recognition)**:
   Mengintegrasikan *Tesseract OCR Engine* pada modul pengindeksan agar sistem mampu membaca gambar pindaian PDF secara otomatis, mengekstrak entitas nomor surat, tanggal surat, dan instansi pengirim via *Regex*, sehingga mengeliminasi proses pengetikan manual oleh staf (*auto-fill metadata*).
2. **Penerapan Algoritma Text Mining / NLP**:
   Mengimplementasikan algoritma **Multinomial Naive Bayes berbasis pembobotan TF-IDF** untuk melakukan klasifikasi otomatis kode arsip dinas (005, 426, 427, 800, 045, 900) dan rekomendasi bidang disposisi berdasarkan analisis teks perihal dan isi surat masuk.
