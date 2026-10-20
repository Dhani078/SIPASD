# DRAF NASKAH LAPORAN MAGANG: BAB I PENDAHULUAN
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Penulis: Muhammad Rizki Ramadhani (NPM: 2310010406)*  
*Lokasi Magang: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 1.1 Latar Belakang Masalah
Perkembangan teknologi informasi dan komunikasi pada era Revolusi Industri 4.0 dan Society 5.0 telah mendorong transformasi tata kelola birokrasi pemerintahan menuju sistem yang terintegrasi, transparan, dan akuntabel. Pemerintah Republik Indonesia secara tegas telah mengamanatkan penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE) melalui Peraturan Presiden Nomor 95 Tahun 2018, yang menuntut instansi pemerintah pusat maupun daerah untuk meninggalkan tata kelola administrasi berbasis kertas (*paper-based administration*) beralih menuju tata kelola digital (*paperless electronic governance*).

Dinas Kepemudaan dan Olahraga (DISPORA) Provinsi Kalimantan Selatan, yang berkedudukan di Jalan Pramuka No. 4 Banjarmasin, merupakan unsur pelaksana urusan pemerintahan daerah di bidang kepemudaan dan keolahragaan. Sebagai instansi yang mengoordinasikan pembinaan atlet daerah, pengelolaan 11 sarana prasarana olahraga provinsi (seperti Gelanggang Olahraga Hasanuddin HM, Kolam Renang Mulawarman, dan Stadion 17 Mei), pembinaan organisasi kepemudaan, serta pelaksanaan event kejuaraan tingkat regional hingga nasional, Sekretariat Dispora Kalsel menghadapi volume lalu lintas korespondensi kedinasan yang sangat padat setiap harinya.

Berdasarkan hasil observasi dan keterlibatan langsung penulis selama melaksanakan Kerja Praktik (Magang) pada Subbagian Perencanaan dan Keuangan serta koordinasi bersama Subbagian Umum dan Kepegawaian (Tata Usaha) Sekretariat Dispora Prov. Kalsel, pengelolaan surat masuk dan surat keluar masih menghadapi sejumlah kendala mendasar:

1. **Pencatatan Konvensional yang Rentan Kerusakan dan Kehilangan**:
   Surat masuk dan surat keluar dicatat secara manual pada buku agenda fisik bergaris. Kondisi ini menimbulkan risiko pemudaran tinta, kerusakan fisik kertas akibat kelembapan udara, tumpahan air, hingga risiko kehilangan dokumen arsip penting negara saat dipinjamkan antar bidang.
2. **Lamanya Waktu Temu-Kembali Arsip Fisik (*Information Retrieval Time*)**:
   Pencarian arsip fisik surat pada lemari ordner memakan waktu antara **15 hingga 30 menit** per dokumen. Ketika pimpinan atau instansi pemeriksa (seperti Inspektorat Daerah atau BPK) membutuhkan berkas fisik pendukung secara mendesak, petugas kearsipan harus memeriksa lembar demi lembar buku register dan membongkar tumpukan map ordner di gudang arsip.
3. **Keterlambatan dan Tidak Terpantaunya Disposisi Pimpinan**:
   Proses penyampaian lembar disposisi dari Kepala Dinas atau Sekretaris Dinas ke Kepala Bidang pengolah masih menggunakan lembar kertas fisik yang ditempel pada map surat. Alur manual ini menyebabkan lembar disposisi sering tertumpuk di meja pejabat, tidak adanya indikator pengingat batas waktu (*deadline alert*), dan pimpinan tidak dapat memantau secara langsung (*real-time*) apakah arahan yang diberikan sudah ditindaklanjuti atau masih tertunda.
4. **Terjadinya Duplikasi Nomor Surat Keluar (*Race Condition Penomoran*)**:
   Penerbitan nomor surat keluar dilakukan secara manual melalui konfirmasi lisan atau pencatatan sementara pada buku register. Ketika beberapa subbagian mengajukan permohonan nomor surat dalam waktu yang bersamaan, kerap terjadi nomor surat ganda (*double numbering*) yang memicu kerancuan administrasi dan melanggar kaidah tata naskah dinas baku.

Melihat urgensi permasalahan tersebut, diperlukan adanya suatu solusi rekayasa perangkat lunak yang komprehensif, modern, dan andal. Oleh karena itu, penulis merancang dan membangun **"Sistem Informasi Pengelolaan Arsip dan Surat Dispora (SIPASD)"** berbasis web responsif. Sistem ini menggabungkan pencatatan e-agenda otomatis, digitalisasi 420+ dokumen arsip nyata ke penyimpanan awan terenkripsi (*Cloudflare R2*), alur disposisi elektronik berjenjang, dan generator penomoran surat keluar otomatis anti-nomor ganda yang didukung basis data *TiDB Cloud Serverless*.

---

## 1.2 Rumusan Masalah
Berdasarkan latar belakang di atas, rumusan masalah dalam pelaksanaan magang dan pembangunan sistem ini adalah:
1. Bagaimana menganalisis dan merancang arsitektur sistem informasi pengelolaan arsip surat masuk dan keluar berbasis web responsif yang sesuai dengan tata kelola administrasi Sekretariat Dispora Provinsi Kalimantan Selatan?
2. Bagaimana mengimplementasikan modul disposisi elektronik berjenjang yang memungkinkan pimpinan dinas memberikan arahan serta memantau status tindak lanjut bidang secara *real-time*?
3. Bagaimana membangun mekanisme penomoran otomatis (*auto-numbering generator*) berbasis transaksi atomik untuk mencegah duplikasi nomor surat keluar kedinasan?
4. Bagaimana mengintegrasikan penyimpanan awan objek terenkripsi (*Cloudflare R2*) dan basis data *TiDB Cloud Serverless* agar dokumen digital dapat diakses secara cepat dan aman melalui perangkat bergerak (*smartphone*) maupun komputer kerja?

---

## 1.3 Batasan Masalah
Agar penelitian dan perancangan sistem ini terarah dan mendalam, penulis menetapkan batasan-batasan masalah sebagai berikut:
1. **Ruang Lingkup Instansi**: Sistem diterapkan secara khusus untuk lingkungan Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
2. **Cakupan Data**: Data yang dikelola mencakup Surat Masuk, Surat Keluar, Lembar Disposisi Elektronik, dan Buku Ekspedisi Pengiriman Fisik Tahun Anggaran 2026 (menggunakan dataset riil sebanyak 171 Surat Masuk dan 249 Surat Keluar).
3. **Format Dokumen**: Berkas digital surat yang didukung dibatasi pada format dokumen *Portable Document Format* (PDF) dengan batas ukuran maksimal 25 MB per dokumen.
4. **Hak Akses Pengguna (RBAC)**: Sistem membatasi wewenang operasional menjadi 4 tingkatan peran, yaitu *Super Admin*, *Pimpinan (Kepala Dinas / Sekretaris Dinas)*, *Petugas Agenda (Tata Usaha)*, dan *Kepala Bidang / Subbagian Pengolah*.
5. **Aspek Keamanan**: Keamanan sistem mengacu pada pedoman OWASP Top 10, mencakup proteksi SQL Injection via parameterized queries, proteksi Cross-Site Scripting (XSS), sanitasi nama file unggahan, dan pencatatan riwayat audit (*audit trail*).
6. **Batasan Pengecualian**: Sistem tidak mencakup integrasi gateway tanda tangan elektronik bersertifikat BSrE (Balai Sertifikasi Elektronik) dan tidak mencakup modul penganggaran keuangan internal (TBP/SPJ).

---

## 1.4 Tujuan Magang & Pengembangan Sistem

### 1.4.1 Tujuan Bagi Mahasiswa
1. Menerapkan ilmu rekayasa perangkat lunak, pemrograman web modern (Next.js 15, TypeScript, Tailwind CSS), dan arsitektur basis data cloud yang diperoleh selama perkuliahan pada studi kasus nyata instansi pemerintahan.
2. Memenuhi persyaratan akademik kelulusan mata kuliah Kerja Praktik (Magang) pada Program Studi S1 Teknik Informatika, Fakultas Teknologi Informasi, Universitas Islam Kalimantan (UNISKA) MAB Banjarmasin.
3. Memperoleh pengalaman profesional, etika kerja birokrasi, dan kemampuan pemecahan masalah (*problem solving*) di lingkungan instansi pemerintahan daerah.

### 1.4.2 Tujuan Bagi Instansi
1. Menghadirkan aplikasi web responsif SIPASD yang siap pakai untuk mendigitalisasi buku agenda fisik surat masuk dan keluar di Dispora Kalsel.
2. Mempercepat waktu temu-kembali (*retrieval time*) berkas arsip fisik dari 15–30 menit menjadi kurang dari 2 detik.
3. Menciptakan transparansi dan percepatan tindak lanjut disposisi pimpinan dinas kepada bidang-bidang pelaksana tugas.
4. Meniadakan insiden nomor surat ganda pada penomoran surat dinas keluar.

---

## 1.5 Manfaat Magang & Pengembangan Sistem

### 1.5.1 Manfaat Bagi Mahasiswa
1. Mengasah kompetensi teknis dalam membangun arsitektur perangkat lunak skala produksi berbasis cloud (*cloud-native architecture*).
2. Membangun portofolio rekayasa perangkat lunak yang teruji dengan data nyata instansi.
3. Menjadi pijakan awal yang kokoh untuk penyusunan Tugas Akhir / Skripsi pada semester 8.

### 1.5.2 Manfaat Bagi Instansi (Dispora Kalsel)
1. **Efisiensi Operasional**: Menghemat ruang penyimpanan lemari ordner dan menghemat penggunaan kertas (*paperless office*).
2. **Akuntabilitas & Pengawasan**: Pimpinan dapat mengawasi beban kerja masing-masing bidang secara objektif melalui grafik dasbor analitik.
3. **Keamanan Arsip Negara**: Dokumen surat tersimpan aman dalam media awan terenkripsi yang terlindung dari risiko bencana fisik, kebakaran, atau banjir.

### 1.5.3 Manfaat Bagi Universitas (UNISKA Banjarmasin)
1. Terjalinnya kemitraan strategis antara Fakultas Teknologi Informasi UNISKA dengan Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
2. Menjadi referensi akademik bagi mahasiswa lain dalam perancangan aplikasi persuratan pemerintahan berstandar modern.

---

## 1.6 Sistematika Penulisan Laporan
Laporan Kerja Praktik ini disusun dengan sistematika penulisan sebagai berikut:

- **BAB I PENDAHULUAN**: Menguraikan latar belakang permasalahan tata kelola surat di Dispora Kalsel, rumusan masalah, batasan masalah, tujuan dan manfaat kegiatan magang, serta sistematika penulisan laporan.
- **BAB II TINJAUAN UMUM INSTANSI**: Menjelaskan profil instansi Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan, visi dan misi, struktur organisasi, fungsi tugas pokok Sekretariat dan Subbagian Keuangan, serta tinjauan sarana prasarana olahraga yang dikelola.
- **BAB III ANALISIS DAN PERANCANGAN SISTEM**: Membahas analisis prosedur sistem berjalan, evaluasi kelemahan menggunakan kerangka kerja PIECES, analisis kebutuhan sistem usulan, pemodelan diagram UML (Use Case, Activity, Sequence, Class Diagram), perancangan antarmuka pengguna (*wireframing*), dan perancangan arsitektur basis data (ERD & kamus data).
- **BAB IV IMPLEMENTASI DAN PEMBAHASAN**: Menguraikan lingkungan perangkat keras dan perangkat lunak yang digunakan, implementasi antarmuka aplikasi SIPASD, penulisan kode program kunci, serta hasil pengujian sistem menggunakan metode *Black Box Testing*.
- **BAB V PENUTUP**: Berisi kesimpulan akhir dari hasil pembangunan dan pengujian sistem SIPASD serta saran-saran strategis bagi pengembangan sistem selanjutnya (rencana peningkatan ke Skripsi S1).
