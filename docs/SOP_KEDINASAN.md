# STANDAR OPERASIONAL PROSEDUR (SOP) PENGELOLAAN E-ARSIP
**Tata Kelola Pengindeksan, Temu-Kembali, dan Pemeliharaan Arsip Digital SIPASD**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 📌 SOP-01: Pemindaian (*Scanning*) & Verifikasi Berkas Fisik

### Tujuan
Menstandarkan proses digitalisasi naskah dinas fisik yang telah selesai diproses pimpinan (bertanda tangan basah, stempel cap dinas, dan bertoreh disposisi kertas) sebelum diindeks ke sistem SIPASD.

### Pelaksana
- Staf Tata Usaha / Petugas Kearsipan Dispora Kalsel.

### Langkah Operasional
1. Petugas mengumpulkan seluruh berkas naskah dinas yang telah tuntas diproses pimpinan.
2. Memeriksa keabsahan berkas: stempel dinas, tanda tangan pejabat, dan kelengkapan lembar disposisi fisik.
3. Melakukan pemindaian dokumen menggunakan scanner resolusi optimal 200–300 DPI dengan format warna hitam-putih atau grayscale (format PDF).
4. Memastikan hasil pindaian tegak lurus, tidak buram, dan seluruh tulisan tangan disposisi terbaca jelas.

---

## 📌 SOP-02: Pengindeksan Metadata Arsip Surat Masuk ke SIPASD

### Tujuan
Memasukkan metadata lengkap berkas pindaian ke dalam basis data SIPASD agar dokumen dapat dicari dalam waktu < 2 detik.

### Pelaksana
- Petugas Arsip / Staf Tata Usaha.

### Langkah Operasional
1. Masuk ke aplikasi SIPASD menggunakan akun role `PETUGAS_ARSIP`.
2. Membuka menu **Katalog Surat Masuk -> Indeks Berkas Baru**.
3. Mengunggah berkas pindaian PDF (otomatis tersimpan aman di Cloudflare R2).
4. Mengisi kolom metadata:
   - Nomor Surat Instansi Pengirim.
   - Tanggal Surat & Tanggal Diterima di Dispora.
   - Asal Instansi Pengirim.
   - Kode Klasifikasi Arsip (Permendagri/Pergub).
   - Perihal & Ringkasan Pokok Isi Surat.
   - Sifat Surat (*Biasa, Penting, Segera, Kilat*).
5. Menyimpan data. Sistem menerbitkan **Nomor Agenda Tahunan** resmi secara otomatis.

---

## 📌 SOP-03: Dokumentasi Riwayat Disposisi Fisik Pimpinan

### Tujuan
Merekam bukti instruksi dan arahan pimpinan yang tertera pada lembar disposisi kertas fisik ke dalam sistem.

### Pelaksana
- Petugas Arsip / Staf Tata Usaha.

### Langkah Operasional
1. Pada detail arsip surat masuk yang baru diindeks, klik tombol **Rekam Riwayat Disposisi**.
2. Mengisi data sesuai coretan tulisan tangan asli pimpinan pada kertas:
   - Nama Pejabat Pendisposisi (contoh: *Pebriadin Hapiz, AP, M.Si*).
   - Tanggal Disposisi Diberikan.
   - Bidang Tujuan (Sekretariat, Pembudayaan Olahraga, Prestasi Olahraga, Pemuda, atau Sapras).
   - Instruksi Baku yang Dicentang (*Tindak lanjuti / Pelajari / Hadiri / Koordinasikan*).
   - Catatan Arahan Khusus yang Ditulis Tangan oleh Pimpinan.
3. Menyimpan data riwayat disposisi.
4. Sistem memungkinkan pencetakan salinan fisik lembar disposisi standar Pemprov Kalsel sewaktu-waktu dibutuhkan.

---

## 📌 SOP-04: Temu-Kembali Arsip & Pemanfaatan In-Browser Viewer

### Tujuan
Memberikan layanan pencarian arsip yang cepat, akurat, dan aman bagi pimpinan maupun staf bidang.

### Pelaksana
- Pimpinan Dinas, Kepala Bidang, atau Staf Berwenang.

### Langkah Operasional
1. Masuk ke aplikasi SIPASD melalui peramban laptop atau ponsel pintar.
2. Membuka menu **Katalog Arsip Surat Masuk** atau **Surat Keluar**.
3. Mengetikkan kata kunci pencarian pada kolom cari instan (dapat berupa nomor surat, nama instansi, kata perihal, atau kode klasifikasi).
4. Sistem menyajikan hasil pencarian dalam waktu < 2 detik.
5. Menekan tombol **Pratinjau PDF**. Dokumen pindaian langsung tampil utuh pada panel pemutar peramban (*built-in streaming PDF viewer*) tanpa perlu diunduh.
6. Seluruh riwayat pembukaan dan pengunduhan dokumen otomatis terekam pada audit trail sistem.

---

## 📌 SOP-05: Rekapitulasi & Ekspor Buku Agenda Kearsipan

### Tujuan
Menyediakan lembaran register Buku Agenda resmi untuk kelengkapan administrasi pertanggungjawaban dinas (SPJ/LPJ).

### Pelaksana
- Staf Tata Usaha / Petugas Kearsipan.

### Langkah Operasional
1. Membuka menu **Laporan & Buku Agenda**.
2. Memilih jenis buku agenda (Surat Masuk atau Surat Keluar) dan menentukan periode tahun anggaran (2026).
3. Menekan tombol **Ekspor ke Excel (.xlsx)**.
4. Sistem menghasilkan berkas spreadsheet lengkap dengan format kop dinas Dispora Prov. Kalsel, nomor urut agenda, tanggal, instansi, perihal, dan kode klasifikasi siap cetak.
