# DRAF NASKAH LAPORAN MAGANG: BAB III ANALISIS DAN PERANCANGAN SISTEM
**Program Studi S1 Teknik Informatika - Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)*

---

## 3.1 Analisis Sistem yang Sedang Berjalan (Existing System)

### 3.1.1 Alur Pengelolaan Arsip Fisik dan Google Drive Saat Ini
1. Surat fisik yang telah selesai diproses oleh pimpinan (telah ditandatangani, dicap dinas, dan diberi lembar disposisi fisik) dikumpulkan di Subbagian Umum dan Kepegawaian (Tata Usaha).
2. Petugas memindai berkas fisik menggunakan mesin scanner menjadi dokumen digital berformat PDF.
3. Berkas PDF diunggah secara manual ke akun Google Drive dinas (`arsipdispora2026`), disimpan ke dalam folder `sistem magang` pada subfolder `Surat Masuk 2026` atau `Surat Keluar 2026`.
4. Berkas fisik asli kemudian disimpan ke dalam ordner kardus di lemari arsip kantor.
5. Saat seorang pegawai atau pimpinan membutuhkan arsip surat terdahulu, petugas harus membuka Google Drive, mencari nama file berdasarkan perkiraan tanggal/nomor, dan membuka file PDF satu demi satu untuk memastikan isinya.

---

## 3.2 Analisis Kelemahan Menggunakan Kerangka Kerja PIECES

| Dimensi PIECES | Kelemahan pada Google Drive Manual | Solusi pada Repositori Web SIPASD |
| :--- | :--- | :--- |
| **Performance (Kinerja)** | Pencarian lambat (15-30 menit) karena harus membuka file PDF satu per satu. File berukuran besar lambat dimuat. | Mesin cari cepat multi-filter menemukan berkas dalam waktu **< 2 detik**. Didukung *chunked streaming viewer*. |
| **Information (Informasi)** | Tidak memiliki metadata terstruktur (asal instansi, tanggal diterima, ringkasan perihal, dan catatan disposisi tidak tercatat). | Metadata tersimpan rapi dalam basis data relasional TiDB Cloud dengan relasi kode klasifikasi resmi dinas. |
| **Economy (Ekonomi)** | Penyimpanan Google Drive manual tidak memberikan nilai tambah data dan menyulitkan pembuatan rekapitulasi SPJ/LPJ dinas. | Menghemat waktu kerja aparatur secara signifikan dan menyediakan ekspor Buku Agenda otomatis tanpa biaya lisensi. |
| **Control (Pengendalian / Keamanan)** | Tidak ada jejak rekam akses (*audit trail*); tidak diketahui siapa saja yang melihat atau mengunduh arsip dokumen negara. | Hak akses RBAC 4 tingkat terproteksi dan setiap aktivitas temu-kembali dokumen tercatat di tabel `audit_logs`. |
| **Efficiency (Efisiensi)** | Petugas tata usaha menghabiskan waktu produktif hanya untuk mencari dan mencocokkan dokumen fisik dengan Google Drive. | Pengindeksan terpusat memudahkan pimpinan dan staf bidang mengakses dokumen langsung dari meja kerja atau ponsel. |
| **Service (Pelayanan)** | Pelayanan penyediaan data arsip ke pimpinan dinas atau instansi pemeriksa (Inspektorat/BPK) lambat dan kurang profesional. | Penyajian informasi arsip menjadi cepat, akurat, dan dapat dicetak sewaktu-waktu dalam format resmi kedinasan. |

---

## 3.3 Analisis Kebutuhan Sistem E-Arsip

### 3.3.1 Kebutuhan Fungsional (Functional Requirements)
- **FR-01 (Autentikasi & RBAC)**: Validasi login terenkripsi dengan pemisahan wewenang peran (Super Admin, Petugas Arsip, Pimpinan, dan Bidang).
- **FR-02 (Katalog & Pencarian Instan)**: Mesin cari instan berdasarkan kata kunci nomor, perihal, asal/tujuan instansi, kode klasifikasi, dan tanggal.
- **FR-03 (Built-in In-Browser PDF Streaming Viewer)**: Pratinjau langsung berkas scan PDF di layar peramban dengan efisiensi memori (dukungan split-screen).
- **FR-04 (Perekaman Riwayat Disposisi Fisik)**: Dokumentasi catatan tertulis, arahan, dan pejabat yang mendisposisikan pada naskah fisik surat masuk.
- **FR-05 (Cetak Salinan Disposisi)**: Menghasilkan lembaran cetak disposisi resmi standar Pemprov Kalsel siap lampir.
- **FR-06 (Ekspor Buku Agenda Excel)**: Menghasilkan berkas spreadsheet `.xlsx` rekapitulasi buku agenda surat masuk dan surat keluar berstandar dinas.
- **FR-07 (Audit Trail & Logging)**: Perekaman otomatis setiap aksi pencarian, pembukaan PDF, pengunduhan, dan mutasi metadata arsip.

### 3.3.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)
- **Responsivitas**: Desain antarmuka fleksibel (Tailwind CSS v4) yang bebas dari horizontal scrollbar overflow pada resolusi ponsel (375px) dan desktop (1440px).
- **Keandalan Cloud-Native**: Sistem berjalan di atas TiDB Cloud Serverless dan Cloudinary & Google Drive tanpa memerlukan komputer server kantor menyala 24 jam.
- **Keamanan OWASP**: Proteksi SQL Injection via parameterized queries, proteksi XSS, cookie sesi HttpOnly Secure, dan validasi berkas PDF.

---

## 3.4 Pemodelan Diagram UML (Unified Modeling Language)

*(Mengacu pada spesifikasi lengkap dan script PlantUML pada `docs/UML_DIAGRAMS.md`)*:

1. **Use Case Diagram E-Arsip**:
   - Aktor: Super Admin, Petugas Arsip (TU), Pimpinan, Kepala Bidang.
   - Use Cases: Login, Cari Arsip Surat, Pratinjau Streaming PDF, Indeks Metadata Baru, Catat Riwayat Disposisi, Cetak Salinan Disposisi, Ekspor Agenda Excel, dan Monitoring Statistik Volume Arsip.
2. **Activity Diagram**:
   - Aktivitas Pengindeksan Berkas Pindaian Scan PDF ke Repositori Cloud.
   - Aktivitas Temu-Kembali Dokumen & Pratinjau PDF di Peramban.
3. **Sequence Diagram**:
   - Alur temu-kembali data arsip: Interaksi User Interface $\rightarrow$ Query Database TiDB $\rightarrow$ Generate Presigned Streaming URL Cloudinary & Google Drive $\rightarrow$ Tampilan Layar.
4. **Class Diagram**:
   - Relasi entitas: User, BidangDispora, KlasifikasiArsip, ArsipSuratMasuk, RiwayatDisposisi, ArsipSuratKeluar, BukuEkspedisi, AuditLog.

---

## 3.5 Perancangan Basis Data & Normalisasi 3NF

Basis data dirancang memenuhi kaidah **Third Normal Form (3NF)**:
- **Tabel `users`**: Menampung kredensial akun, NIP, jabatan, dan level peran.
- **Tabel `bidang_dispora`**: Master referensi unit kerja di lingkungan Dispora Kalsel.
- **Tabel `klasifikasi_arsip`**: Master kode klasifikasi surat Permendagri/Pergub (005, 426, 427, 800, 045, 900) beserta masa retensi aktif dan inaktif.
- **Tabel `arsip_surat_masuk`**: Katalog metadata 171 dokumen surat masuk beserta tautan berkas PDF di Cloudinary & Google Drive.
- **Tabel `riwayat_disposisi`**: Dokumentasi arahan fisik lembar disposisi pimpinan (relasi 1:N dari surat masuk).
- **Tabel `arsip_surat_keluar`**: Katalog metadata 249 dokumen surat keluar beserta nomor registrasi dan kode klasifikasi dinas.
- **Tabel `buku_ekspedisi`**: Catatan tanda terima distribusi fisik surat keluar oleh kurir dinas.
- **Tabel `audit_logs`**: Jejak rekam forensik akses dokumen dan keamanan operasional sistem.
