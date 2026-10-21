# ANALISIS MENDALAM 420 BERKAS PERSURATAN ASLI DISPORA KALSEL (TA 2026)
**Laporan Investigasi Komprehensif Data Riil Google Drive Kearsipan Kedinasan**  
*Instansi: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Lokasi Sumber Asli: `C:\xampp\htdocs\Laporan Magang`*  
*Penyusun: Muhammad Rizki Ramadhani (NPM: 2310010406) - S1 Teknik Informatika UNISKA Banjarmasin*

---

## 1. Ringkasan Eksekutif Metrik Berkas Fisik

Berdasarkan analisis byte-level dan inspeksi struktur berkas PDF menggunakan PyMuPDF (1.28.2), inventaris arsip fisik Dispora Kalsel TA 2026 menghasilkan temuan kuantitatif:

| Parameter Metrik | Surat Masuk 2026 | Surat Keluar 2026 | Total Gabungan |
| :--- | :--- | :--- | :--- |
| **Jumlah Berkas Dokumen** | 171 Berkas PDF | 249 Berkas PDF | **420 Berkas PDF** |
| **Total Kapasitas Penyimpanan** | 205,96 MB | 167,19 MB | **373,15 MB** |
| **Total Akumulasi Halaman** | 331 Halaman | 359 Halaman | **690 Halaman** |
| **Rata-rata Halaman per Berkas**| 1,94 Halaman / Surat | 1,44 Halaman / Surat | 1,64 Halaman / Surat |
| **Dokumen Murni Citra Pindaian**| 143 Berkas (83,6%) | 144 Berkas (57,8%) | **287 Berkas (68,3%)** |
| **Dokumen Berlapis Teks Digital**| 28 Berkas (16,4%) | 105 Berkas (42,2%) | **133 Berkas (31,7%)** |
| **Rentang Waktu Korespondensi** | 3 Agustus - 7 Oktober 2026 | 12 Mei - 2 Oktober 2026 | **12 Mei - 7 Oktober 2026** |

---

## 2. Analisis Anatomi & Karakteristik Citra Pindaian

### 2.1 Struktur Multi-Halaman Surat Masuk
Sebagian besar berkas Surat Masuk berformat multi-halaman (2 hingga 7 halaman, dengan rekor tertinggi 16 halaman):
- **Halaman 1**: Berupa lembar disposisi cetak kedinasan atau stempel kendali agenda yang telah diisi paraf dan instruksi disposisi tulisan tangan Kepala Dinas (`Pebriadin Hapiz, AP, M.Si`).
- **Halaman 2 s/d selesai**: Naskah surat fisik pengirim, proposal kegiatan, rincian susunan panitia, atau jadwal pertandingan cabang olahraga.

### 2.2 Resolusi Citra dan Jejak Perangkat Keras Pemindai
Berdasarkan pembacaan metadata PDF internal (`Producer` & `Creator`):
1. **Mesin Pemindai Utama Kantor TU**: `Canon SC1011` menggunakan perangkat lunak `IJ Scan Utility`. Citra dipindai pada resolusi ~300 DPI berdimensi rata-rata $2102 \times 3000$ piksel (format JPEG dalam kontainer PDF).
2. **Pemindai Bergerak Staf Lapangan**: Ditemukan metadata `ClearScanner` dan `intsig.com (CamScanner)` yang digunakan pegawai saat menerima surat audiensi langsung di luar kantor atau venue olahraga.
3. **Perangkat Bergerak Pejabat**: Metadata `iOS Quartz PDFContext` menunjukkan dokumen dipindai langsung menggunakan kamera iPhone/iPad pimpinan.
4. **Alat Penggabung & Kompresi**: Metadata `iLovePDF` membuktikan staf tata usaha sering melakukan penggabungan beberapa lembar surat dan kompresi file secara manual di web eksternal sebelum disimpan ke Google Drive.

---

## 3. Taksonomi Anomali Penamaan Berkas Google Drive Eksisting

Hasil penelusuran membuktikan alasan mendasar mengapa sistem temu-kembali arsip di Google Drive memakan waktu 15 hingga 30 menit per surat:

1. **Pola Variasi Tanggal Manual Acak (Surat Masuk - 142 Berkas)**:
   - Pola: `[Nomor Agenda]([Tanggal]).pdf`
   - Contoh nyata: `0897(3agus).pdf`, `0903(4agustus).pdf`, `1184(29 september 2026).pdf`.
   - Adanya kesalahan pengetikan manusia (*human typo*): `1104(9septemner).pdf` ("septemner" alih-alih september).
2. **Pola Default Mesin Scanner (Surat Keluar - 72 Berkas)**:
   - Pola: `[Nomor]_[YYYYMMDD]_[Urut].pdf`
   - Contoh nyata: `3829_20260519_0001.pdf`, `4009_20260602_0001(1).pdf`, `8551_20260930_0001.pdf`.
3. **Pola Bundel Multi-Surat Kolektif (Surat Keluar - 14 Berkas)**:
   - Satu berkas PDF berisi beberapa surat keluar dinas yang digabung sekaligus.
   - Contoh nyata:
     * `7480-82, 3 surat_20260902_0001.pdf` (berisi 3 surat dinas sekaligus).
     * `8035-43, 9 surat.pdf` (berisi 9 lembar surat tugas rapat koordinasi dinas).
     * `8355-59, 5 surat_20261001_0001.pdf` (berisi 5 usulan kepegawaian).
4. **Pola Penamaan Campuran Urusan Dinas**:
   - Contoh nyata: `4104 Mental spritual.pdf`, `3868 S Pengantar Lap Arsip.pdf`, `7673 (sek agt)_20260902_0001.pdf`.

---

## 4. Inventaris Entitas Instansi Terkait & Topik Riil

Berdasarkan ekstraksi teks dari berkas yang memiliki text-layer, teridentifikasi ekosistem korespondensi dinas:

### 4.1 Instansi Pemerintah Terkait:
- **Gubernur Kalimantan Selatan**: Laporan kinerja dan surat pertanggungjawaban program kepemudaan.
- **Inspektorat Daerah Provinsi Kalsel**: Surat Nomor `4215` perihal Hasil Penilaian Risiko Kecurangan/Fraud Tahun 2026.
- **BAPPEDA Provinsi Kalsel**: Permohonan narasumber perencanaan program keolahragaan daerah (Nomor `8461`).
- **Badan Kepegawaian Daerah (BKD) Kalsel**: Usulan peserta pelatihan fungsional perencana (Nomor `4303` & `4304`) serta penyesuaian jam kerja bencana kabut asap Karhutla (Nomor `7750`).
- **Dinas Perpustakaan dan Kearsipan (Dispersip) Kalsel**: Pengantar laporan audit kearsipan dan jadwal retensi arsip dinas (Nomor `3868` & `4750`).
- **Badan Riset dan Inovasi Daerah (BRIDA) Kalsel**: Koordinasi riset dan inovasi fasilitas venue olahraga (Nomor `4661`).
- **Biro Administrasi Pimpinan (Adpim) Setdaprov Kalsel**: Permohonan kehadiran pimpinan pada pembukaan event olahraga daerah.
- **Bank Kalsel**: Permohonan cetak rekening koran kas daerah untuk pertanggungjawaban bendahara pengeluaran (Nomor `3802`).

### 4.2 Lembaga Keolahragaan & Organisasi Pemuda:
- **KONI Provinsi Kalimantan Selatan**: Pengajuan rekomendasi pemusatan latihan atlet PON dan dispensasi atlet pelajar/mahasiswa.
- **Pengurus Provinsi Cabang Olahraga (PBVSI, PBSI, PSSI, PASI, PRSI)**: Permohonan izin penggunaan venue olahraga daerah (GOR Hasanuddin HM, Lapangan 17 Mei, Lapangan Tenis Dharma Praja).
- **Kwartir Daerah Gerakan Pramuka & DPD KNPI Kalsel**: Kegiatan jambore daerah dan pembinaan wirausaha muda.

---

## 5. Relevansi Strategis bagi Sistem SIPASD dan Skripsi S1

1. **Efektivitas Repositori Terindeks**: Fakta bahwa 68,3% berkas adalah gambar murni tanpa teks membuktikan bahwa fitur katalog metadata SIPASD di TiDB Cloud adalah satu-satunya cara bagi staf untuk menemukan dokumen dalam waktu < 2 detik tanpa harus membuka berkas satu per satu.
2. **Kebutuhan Streaming Signed URL**: Ukuran berkas rata-rata 1-5 MB dengan resolusi 300 DPI memerlukan arsitektur streaming CDN Cloudinary terotentikasi signature anti-401 agar peramban mobile staf tidak mengalami kehabisan memori (*out of memory*).
3. **Fondasi Dataset Skripsi AI**: Korpus 420 dokumen nyata ini menjadi dataset ideal untuk pelatihan modul OCR Tesseract dan Naive Bayes Classifier pada Semester 8 mendatang.
