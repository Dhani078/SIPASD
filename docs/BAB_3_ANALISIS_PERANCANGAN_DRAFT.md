# DRAF NASKAH LAPORAN MAGANG: BAB III ANALISIS DAN PERANCANGAN SISTEM
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)*

---

## 3.1 Analisis Prosedur Sistem yang Sedang Berjalan

Prosedur administrasi persuratan pada Sekretariat Dispora Provinsi Kalimantan Selatan saat ini masih bertumpu pada pencatatan manual:

### 3.1.1 Prosedur Pengelolaan Surat Masuk Manual
1. Surat fisik diserahkan oleh kurir eksternal atau staf pengantar kepada Staf Subbagian Umum dan Kepegawaian (Tata Usaha).
2. Staf TU membuka amplop, memeriksa stempel basah pengirim, dan mencatat nomor surat, tanggal surat, instansi pengirim, dan perihal ke dalam **Buku Agenda Surat Masuk Fisik**.
3. Staf TU mengetik atau mencoret lembar disposisi kertas kosong, kemudian menjepitnya dengan klip kertas pada map surat fisik.
4. Berkas fisik diantarkan ke meja Sekretaris Dinas untuk diparaf, lalu diteruskan ke meja Kepala Dinas.
5. Kepala Dinas membaca surat, mencentang instruksi arahan pada lembar kertas, dan membubuhkan tanda tangan disposisi.
6. Berkas dikembalikan ke bagian TU untuk dicatat nomor tujuannya, kemudian diantarkan secara fisik oleh kurir kantor (*caraka*) ke ruangan Kepala Bidang terkait.
7. Kepala Bidang menerima berkas, membaca instruksi, dan menugaskan staf teknis pelaksana.

### 3.1.2 Prosedur Pengelolaan Surat Keluar Manual
1. Staf bidang pemrakarsa menyusun naskah draf surat dinas menggunakan Microsoft Word.
2. Staf menghubungi bagian TU secara lisan (tatap muka atau pesan WhatsApp) untuk menanyakan atau meminta (*booking*) nomor surat keluar.
3. Petugas TU memeriksa buku register fisik surat keluar dan menyebutkan nomor berikutnya.
4. Draf dicetak, diajukan untuk ditandatangani oleh Kepala Dinas/Sekretaris, kemudian distempel basah.
5. Satu lembar asli dikirim ke instansi luar via ekspedisi, sedangkan lembar arsip disimpan di lemari ordner.

---

## 3.2 Analisis Kelemahan Sistem Menggunakan Kerangka PIECES

Analisis kelemahan sistem berjalan dilakukan dengan metode PIECES (*Performance, Information, Economy, Control, Efficiency, Service*):

| Dimensi PIECES | Kondisi Sistem Berjalan (Manual) | Target Solusi pada Sistem SIPASD |
| :--- | :--- | :--- |
| **Performance (Kinerja)** | Pencarian berkas memakan waktu 15–30 menit. Alur disposisi fisik memerlukan waktu 1–3 hari kerja hingga sampai ke meja bidang. | Pencarian arsip digital < 2 detik. Disposisi pimpinan terkirim secara instan dalam hitungan detik. |
| **Information (Informasi)** | Status tindak lanjut surat tidak transparan; pimpinan tidak tahu apakah surat sudah dieksekusi atau belum. Data sering tidak mutakhir. | Dashboard analitik menyajikan status *real-time* (`Menunggu`, `Diproses`, `Selesai`) dengan indikator keterlambatan (*overdue badge*). |
| **Economy (Ekonomi)** | Biaya tinggi untuk pembelian lemari ordner, map ordner, kertas fotokopi lembar disposisi, dan toner printer. | Mengurangi konsumsi kertas secara signifikan (*paperless*) dan menghemat biaya belanja ATK kantor. |
| **Control (Pengendalian / Keamanan)** | Berkas fisik mudah dipinjam tanpa pencatatan yang tertib, rawan hilang, terbakar, rusak, atau dibaca oleh pihak yang tidak berhak. | Otentikasi RBAC 4 tingkat, penyimpanan terenkripsi Cloudflare R2, dan jejak forensik *audit trail* otomatis. |
| **Efficiency (Efisiensi)** | Petugas TU harus berulang kali mengantarkan map surat antar lantai dan ruangan; tenaga staf habis untuk urusan kurir internal. | Staf bidang langsung menerima dokumen PDF melalui sistem web tanpa perlu mobilisasi fisik berkas kerja. |
| **Service (Pelayanan)** | Respon terhadap surat permohonan izin venue atau dispensasi atlet lambat karena disposisi tertumpuk di meja pimpinan. | Pelayanan kedinasan menjadi cepat dan tanggap karena disposisi dapat diproses melalui smartphone pimpinan. |

---

## 3.3 Analisis Kebutuhan Sistem (System Requirements)

### 3.3.1 Kebutuhan Fungsional (Functional Requirements)
- **FR-01 (Autentikasi & RBAC)**: Sistem harus mampu memvalidasi login pengguna dan membatasi akses menu berdasarkan 4 role: Super Admin, Pimpinan, TU Umum, dan Bidang.
- **FR-02 (Pencatatan Surat Masuk)**: Sistem harus dapat mencatat metadata surat masuk, menghasilkan Nomor Agenda tahunan otomatis, dan mengunggah berkas scan PDF.
- **FR-03 (Pratinjau PDF di Browser)**: Sistem harus menyediakan *in-browser viewer* untuk membaca berkas PDF tanpa mengharuskan pengguna mengunduh berkas ke memori lokal.
- **FR-04 (Disposisi Elektronik Berjenjang)**: Pimpinan dapat menelaah surat, memilih bidang tujuan, menentukan batas waktu, mencentang instruksi standar, dan mengirim disposisi secara digital.
- **FR-05 (Pemantauan & Feedback Tindak Lanjut)**: Bidang penerima dapat memperbarui status progres dan melampirkan keterangan penyelesaian tugas.
- **FR-06 (Auto-Numbering Surat Keluar)**: Sistem harus mengunci dan menerbitkan nomor urut surat keluar resmi secara atomik berbasis kode klasifikasi dinas untuk mencegah nomor ganda.
- **FR-07 (Buku Ekspedisi Digital)**: Sistem harus dapat mencatat identitas kurir, tanggal pengiriman fisik, dan foto bukti tanda terima instansi luar.
- **FR-08 (Dashboard Analitik & Ekspor Excel)**: Sistem harus menampilkan statistik volume surat per bulan, distribusi beban bidang, dan mengekspor buku agenda ke format spreadsheet `.xlsx`.

### 3.3.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)
- **Usability**: Antarmuka responsif (Tailwind CSS v4) yang dapat diakses nyaman melalui ponsel pintar (375px) dan komputer desktop (1440px) tanpa *horizontal overflow*.
- **Reliability & Availability**: Berjalan pada arsitektur serverless (TiDB Cloud & Cloudflare R2) dengan garansi uptime 99.9% tanpa ketergantungan pada server PC kantor yang harus menyala 24 jam.
- **Performance**: Waktu muat halaman pertama < 1.5 detik, dan transmisi streaming dokumen PDF < 2 detik pada jaringan 4G/WiFi standar.
- **Security**: Kepatuhan OWASP Top 10 (Password hash Bcrypt salt 12, parameterized SQL queries, sanitasi XSS, token sesi HttpOnly Secure, dan proteksi anti path traversal).

---

## 3.4 Perancangan Pemodelan UML (Unified Modeling Language)

Perancangan berorientasi objek dimodelkan menggunakan 4 diagram standar rekayasa perangkat lunak:
*(Detail spesifikasi dan skrip PlantUML lengkap terdokumentasi pada `docs/UML_DIAGRAMS.md`)*.

1. **Use Case Diagram**: Menggambarkan 12 fungsi use case utama yang dihubungkan dengan 4 aktor sistem (Super Admin, Pimpinan, Petugas Agenda, dan Kepala Bidang).
2. **Activity Diagram**: Memodelkan 2 alur aktivitas bisnis utama:
   - Alur Penerimaan Surat Masuk dan Penerbitan Lembar Disposisi Digital.
   - Alur Booking Nomor Registrasi Surat Keluar (Anti-Nomor Dobel).
3. **Sequence Diagram**: Memetakan interaksi kronologis antara User Interface, Controller Server Actions, Database TiDB, dan Audit Logger pada saat pimpinan mendisposisikan surat.
4. **Class Diagram**: Menggambarkan struktur kelas perangkat lunak, atribut tipe data, method operasi, serta relasi kardinalitas (User, BidangDispora, KlasifikasiSurat, SuratMasuk, Disposisi, SuratKeluar, BukuEkspedisi, AuditLog).

---

## 3.5 Perancangan Basis Data & Normalisasi

### 3.5.1 Tahapan Normalisasi Basis Data
1. **Bentuk Tidak Normal (Unnormalized Form - UNF)**:
   Data buku agenda fisik dicatat dalam satu lembar buku besar yang mencampuradukkan data surat, data bidang, arahan disposisi berulang, dan data kurir dalam kolom tak beraturan.
2. **Bentuk Normal Pertama (1NF)**:
   Menghilangkan perulangan grup data (*repeating groups*). Setiap kolom bernilai atomik (satu nilai tunggal) dan menetapkan Primary Key unik pada setiap entitas.
3. **Bentuk Normal Kedua (2NF)**:
   Memastikan seluruh atribut non-kunci bergantung secara fungsional penuh pada Primary Key (*Full Functional Dependency*). Atribut bidang dipisahkan ke tabel `bidang_dispora`, dan kode klasifikasi dipisahkan ke `klasifikasi_surat`.
4. **Bentuk Normal Ketiga (3NF)**:
   Menghilangkan ketergantungan transitif (*Transitive Dependency*), di mana atribut non-kunci tidak boleh bergantung pada atribut non-kunci lainnya. Data pencatat surat dan data pimpinan yang mendisposisikan merujuk ke relasi tabel induk `users`.

### 3.5.2 Struktur Relasi Tabel Fisik
*(Lihat naskah SQL DDL lengkap pada `docs/DATABASE_SCHEMA.md`)*:
- `users` (Manajemen akun, NIP, jabatan, password hash, role).
- `bidang_dispora` (Unit kerja: Sekretariat, Pora, Prestasi, Pemuda, Sapras).
- `klasifikasi_surat` (Kode surat: 005, 426, 427, 800, 045, 900).
- `surat_masuk` (Agenda masuk, nomor surat, tanggal, asal, perihal, sifat, file_key R2).
- `disposisi` (Relasi 1:N dari surat masuk, pimpinan, bidang tujuan, batas waktu, instruksi).
- `surat_keluar` (Nomor tergenerate otomatis, nomor urut, tahun, instansi tujuan).
- `buku_ekspedisi` (Relasi 1:1 surat keluar, kurir, tanggal serah, bukti terima).
- `audit_logs` (Forensik keamanan: user_id, action, resource, IP address, user_agent).

---

## 3.6 Perancangan Antarmuka Pengguna (UI/UX Wireframes)

Antarmuka SIPASD dirancang dengan filosofi tata letak modern berwibawa:

1. **Tata Letak Dashboard Eksekutif**:
   - Bagian Atas: Header salam dinas, status koneksi database, dan profil pengguna aktif.
   - Bagian Tengah: 4 Kartu KPI Utama (Total Surat Masuk, Surat Keluar, Disposisi Aktif, Disposisi Selesai).
   - Bagian Bawah: Grafik tren korespondensi bulanan (Jan–Des) bersanding dengan diagram beban kerja per bidang dinas.
2. **Antarmuka E-Agenda Surat Masuk (Split-Screen Viewer)**:
   - Panel Kiri: Tabel daftar surat masuk dengan filter pencarian instan dan penanda warna sifat surat (*badge* merah untuk Kilat, kuning untuk Segera, hijau untuk Biasa).
   - Panel Kanan: Pemutar dokumen PDF bawaan (*built-in streaming PDF viewer*) sehingga pimpinan dapat langsung membaca surat tanpa membuka tab baru.
3. **Modal Lembar Disposisi Digital**:
   - Dropdown pemilihan bidang tujuan (otomatis memuat 5 bidang Dispora).
   - Input tanggal batas waktu tindak lanjut (*due date picker*).
   - Kotak centang instruksi baku standar kedinasan Pemprov Kalsel.
   - Kolom teks catatan instruksi khusus dari pimpinan.
4. **Halaman Format Cetak Disposisi (Standar Pemprov Kalsel)**:
   - Didesain pas pada satu lembar kertas ukuran A4 atau F4 (Folio).
   - Memuat Kop Surat Resmi Pemerintah Provinsi Kalimantan Selatan - Dinas Kepemudaan dan Olahraga, garis ganda pembatas, tabel disposisi resmi, dan kotak tanda tangan pejabat.
