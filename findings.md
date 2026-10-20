# FINDINGS & RECONNAISSANCE: SIPASD
**Catatan Hasil Riset, Analisis Berkas Riil & Struktur Kedinasan Dispora Kalsel**  
*Tanggal Analisis: 20 Oktober 2026*

---

## 1. Analisis Berkas Riil (Folder `C:\xampp\htdocs\Laporan Magang`)

Dari pemeriksaan langsung terhadap data arsip magang di komputer lokal, ditemukan inventaris berkas nyata sebagai berikut:

### A. Berkas Surat Masuk (`Surat Masuk 2026/`)
- **Total Berkas**: 171 file PDF.
- **Rentang Nomor Agenda**: Mulai nomor `0897` (3 Agustus 2026) hingga `1238` (7 Oktober 2026).
- **Pola Penamaan Berkas**: `[NoSurat]([Tanggal]).pdf` (contoh: `0973(14 Agustus 2026).pdf`, `1181(28 September 2026).pdf`, `1208(02 Oktober 2026).pdf`).
- **Instansi Pengirim Riil**: Kemenpora RI, KONI Kalsel, Bappeda Kalsel, BPKAD Kalsel, Dispora Kabupaten/Kota, Pengurus Cabang Olahraga, Ormas Pemuda, dan Panitia Kejuaraan Daerah.

### B. Berkas Surat Keluar (`Surat Keluar 2026/`)
- **Total Berkas**: 249 file PDF.
- **Rentang Nomor Surat**: Mulai nomor `3802` (Mei 2026) hingga `8757` (Oktober 2026).
- **Pola Penamaan Berkas**: Berisi kode penomoran resmi dinas, tanggal scan, dan keterangan perihal (contoh: `3868 S Pengantar Lap Arsip.pdf`, `3971 Teknis WFH Dispora.pdf`, `4065 workshop pengembangan budaya kerja.pdf`, `7480-82, 3 surat_20260902_0001.pdf`).
- **Temuan Masalah**: Terdapat nomor-nomor surat yang disisipkan tanda kurung dan tanggal karena pencatatan manual berulang, membuktikan tingginya kebutuhan akan generator nomor otomatis anti-dobel.

### C. Berkas Keuangan & Retribusi Venue (`Excel/` & `TBP/`)
- **Total Berkas**: 5 file Excel (.xlsx) dan 39 berkas PDF TBP.
- **Daftar 11 Fasilitas Olahraga (Venue) yang Dikelola Dispora Kalsel**:
  1. Kolam Renang GOR Hasanuddin HM
  2. GOR Hasanuddin HM
  3. Kolam Renang Mulawarman
  4. Lapangan Sepak Bola Mulawarman
  5. Lapangan Tenis Mulawarman
  6. Lapangan Tenis Dharma Praja
  7. Lapangan Sepak Bola Kayu Tangi
  8. Lapangan Golf Swargaloka
  9. Lapangan Volley Pasir
  10. Lapangan Voli Indoor SKB
  11. Lapangan Sepak Bola 17 Mei Banjarmasin
- **Identifikasi Masalah Kerahasiaan TBP**: Dokumen TBP memuat nomor rekening bank pihak ketiga, rincian SPJ belanja internal, dan kwitansi yang bersifat tertutup untuk laporan magang publik. Oleh karena itu, pengalihan fokus ke modul **Persuratan & Disposisi (SIPASD)** merupakan keputusan strategis yang tepat dan aman secara etika kedinasan.

---

## 2. Struktur Organisasi & Pejabat Riil Dispora Prov. Kalsel

Berdasarkan dokumen resmi BKU TA 2026 dan surat pengantar Dispora Kalsel:

- **Pengguna Anggaran (Kepala Dinas)**:  
  **Pebriadin Hapiz, AP, M.Si** (NIP. 19780214 199612 1 001)
- **Pejabat Pelaksana Teknis Kegiatan (PPTK) / Subbag Keuangan**:  
  **Norika Fajriana, SH, MH** (NIP. 19850421 201001 2 003)
- **Bendahara Pengeluaran**:  
  **Sathia Nico Brata Simanjuntak, S.Akun** (NIP. 19920815 201503 1 002)
- **Staf Subbag Keuangan / Pembimbing Lapangan**:  
  **Ibu Nur Dispora**

### Unit Kerja / Bidang di Lingkungan Dispora Kalsel:
1. **Sekretariat**:
   - Subbagian Perencanaan dan Pelaporan
   - Subbagian Keuangan (Tempat Mahasiswa Magang)
   - Subbagian Umum dan Kepegawaian (Pusat Tata Usaha & Pengendali Surat Masuk/Keluar)
2. **Bidang Pembudayaan Olahraga**
3. **Bidang Peningkatan Prestasi Olahraga**
4. **Bidang Pengembangan Pemuda**
5. **Bidang Pemberdayaan Pemuda**
6. **Bidang Sarana dan Prasarana**

---

## 3. Alur Kerja Eksisting (Sistem Berjalan) vs Sistem Usulan SIPASD

| Parameter Alur | Sistem Berjalan (Manual) | Sistem Usulan (SIPASD Web) |
| :--- | :--- | :--- |
| **Penerimaan Surat Masuk** | Ditulis tangan pada buku register besar bergaris oleh staf TU. | Diinput via form web digital dengan generate otomatis No. Agenda. |
| **Penyimpanan Berkas** | Scan PDF disimpan terpisah di komputer lokal acak tanpa keterkaitan database. | PDF diunggah langsung ke Cloudflare R2 dan terikat dengan ID surat di TiDB. |
| **Lembar Disposisi** | Mengetik manual / mencoret di kertas lembar disposisi fotokopi, rawan tercecer. | Pimpinan menelaah PDF di browser dan klik instruksi digital langsung terdistribusi ke akun Kabid. |
| **Monitoring Status** | TU harus menanyakan langsung via telepon atau tatap muka ke staf bidang. | Dashboard menampilkan status real-time (`Menunggu`, `Diproses`, `Selesai`) dan alert overdue. |
| **Penomoran Surat Keluar** | Booking nomor melalui catatan kertas atau chat WhatsApp, rawan nomor dobel. | Generator nomor otomatis berbasis kode urusan (Permendagri) mengunci nomor berikutnya. |
| **Pencarian Dokumen** | Membuka lemari ordner dan memeriksa lembar demi lembar (15–30 menit). | Mesin cari kata kunci instan (< 2 detik). |
