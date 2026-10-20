# FINDINGS & RECONNAISSANCE: SIPASD
**Catatan Hasil Riset, Analisis Berkas Riil & Struktur Kedinasan Dispora Kalsel**  
*Tanggal Analisis: 20 Oktober 2026*

---

## 1. Analisis Sumber Berkas Riil: Google Drive Akun `arsipdispora2026`

Berdasarkan pemeriksaan langsung pada penyimpanan awan resmi instansi (Google Drive akun `arsipdispora2026`, folder `sistem magang`):

- **Kapasitas Terpakai**: 101,51 GB dari total kuota 5 TB.
- **Dua Subfolder Utama**:
  1. `Surat Masuk 2026` (171 Berkas PDF)
  2. `Surat Keluar 2026` (249 Berkas PDF)
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

## 4. Evaluasi Kelayakan: Laporan Magang vs Skripsi S1 TI UNISKA

Keputusan menjadikan sistem ini sebagai **E-Arsip Digital Persuratan (Katalog Repositori Terindeks)** memiliki landasan akademik yang sangat kuat:

| Parameter | Posisi pada Laporan Magang (Semester 7) | Peluang Peningkatan ke Skripsi S1 (Semester 8) |
| :--- | :--- | :--- |
| **Objek Penelitian** | Pemecahan masalah temu-kembali 420 berkas scan Google Drive Dispora Kalsel. | Eksplorasi metode kecerdasan buatan (*AI & Machine Learning*) pada 420 berkas teks PDF. |
| **Metode Rekayasa** | Waterfall / Agile rekayasa perangkat lunak web responsif (Next.js 15 + TiDB + R2). | Algoritma **OCR Tesseract** (ekstraksi teks otomatis) atau **Multinomial Naive Bayes TF-IDF** (klasifikasi kategori otomatis). |
| **Data Penelitian** | 420 berkas riil sebagai basis data arsip sistem. | 420 berkas riil sebagai korpus data latih (*training*) dan data uji (*testing*). |
| **Kesiapan** | **100% Siap Diujikan pada Sidang Magang**. | **Tinggal menambahkan 1 modul algoritma di semester 8**. |
