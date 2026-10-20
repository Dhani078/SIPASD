# DATABASE SCHEMA & DATA DICTIONARY: SIPASD
**Sistem Informasi Pengelolaan Arsip dan Surat Dispora**  
*RDBMS: TiDB Cloud Serverless / MySQL 8.0 Compatible | Engine: InnoDB | Collation: utf8mb4_unicode_ci*

---

## 📊 Entity Relationship Diagram (Relasi Antar Entitas)

```
[ users ] (1) ────< (N) [ disposisi ] (dari_user_id)
    │ (1)
    ├───< (N) [ surat_masuk ] (created_by)
    ├───< (N) [ surat_keluar ] (created_by)
    └───< (N) [ audit_logs ] (user_id)

[ bidang_dispora ] (1) ────< (N) [ disposisi ] (kepada_bidang_id)
[ bidang_dispora ] (1) ────< (N) [ surat_keluar ] (bidang_pemrakarsa_id)

[ klasifikasi_surat ] (1) ──< (N) [ surat_keluar ] (kode_klasifikasi_id)

[ surat_masuk ] (1) ────< (N) [ disposisi ] (surat_masuk_id)

[ surat_keluar ] (1) ───< (1) [ buku_ekspedisi ] (surat_keluar_id)
```

---

## 📑 Kamus Data (Data Dictionary)

### 1. Tabel `users` (Pengguna & Hak Akses)
Menyimpan kredensial autentikasi pegawai, NIP, jabatan, dan level wewenang sistem.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUID v4). |
| `nip` | VARCHAR(25) | Unique, Nomor Induk Pegawai resmi. |
| `nama_lengkap` | VARCHAR(100) | Nama lengkap pegawai beserta gelar. |
| `username` | VARCHAR(50) | Unique, nama login pengguna. |
| `password_hash` | VARCHAR(255) | Hash bcrypt kata sandi pengguna. |
| `role` | ENUM | `'SUPER_ADMIN'`, `'PIMPINAN'`, `'TU_UMUM'`, `'BIDANG'`. |
| `jabatan` | VARCHAR(100) | Contoh: *Kepala Dinas*, *Sekretaris*, *Kasubbag Keuangan*. |
| `unit_kerja` | VARCHAR(100) | Nama bidang atau subbagian penugasan. |
| `created_at` | DATETIME | Waktu pendaftaran akun (default `CURRENT_TIMESTAMP`). |
| `updated_at` | DATETIME | Waktu terakhir pembaruan profil. |

### 2. Tabel `bidang_dispora` (Unit Kerja & Bidang Internal)
Referensi unit organisasi di lingkungan Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | Primary Key. |
| `kode_bidang` | VARCHAR(20) | Unique, contoh: `SEKR`, `PORA`, `PRESTASI`, `PEMUDA`, `SAPRAS`. |
| `nama_bidang` | VARCHAR(100) | Nama lengkap bidang dinas. |
| `nama_kepala` | VARCHAR(100) | Nama Kepala Bidang / Sekretaris. |
| `nip_kepala` | VARCHAR(25) | NIP pejabat penanggung jawab bidang. |

### 3. Tabel `klasifikasi_surat` (Kode Klasifikasi Permendagri / Pergub)
Referensi kode penomoran surat kedinasan baku.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT | Primary Key. |
| `kode` | VARCHAR(20) | Unique, contoh: `005` (Undangan), `426` (Keolahragaan), `800` (Kepegawaian). |
| `uraian` | VARCHAR(255) | Deskripsi peruntukan surat dinas. |
| `retensi_aktif` | INT | Masa simpan aktif arsip (dalam tahun). |

### 4. Tabel `surat_masuk` (Agenda Surat Masuk Digital)
Menyimpan seluruh data metadata surat yang diterima dari instansi luar.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUID v4). |
| `nomor_agenda` | VARCHAR(20) | Unique, nomor urut agenda masuk tahunan (contoh: `0897/SM/2026`). |
| `nomor_surat` | VARCHAR(100) | Nomor surat resmi dari instansi pengirim. |
| `tanggal_surat` | DATE | Tanggal yang tertera pada surat fisik. |
| `tanggal_diterima` | DATE | Tanggal berkas fisik diterima di meja TU Dispora. |
| `asal_instansi` | VARCHAR(150) | Nama instansi pengirim surat. |
| `perihal` | VARCHAR(255) | Perihal atau pokok isi surat. |
| `ringkasan_isi` | TEXT | Rangkuman singkat atau catatan tambahan. |
| `sifat_surat` | ENUM | `'BIASA'`, `'PENTING'`, `'SEGERA'`, `'KILAT'`. |
| `status_disposisi` | ENUM | `'MENUNGGU'`, `'DIDISPOSISIKAN'`, `'DIPROSES'`, `'SELESAI'`. |
| `file_url` | VARCHAR(255) | URL akses berkas PDF (Cloudflare R2). |
| `file_key` | VARCHAR(255) | Kunci objek S3 pada bucket Cloudflare R2. |
| `file_size_bytes` | BIGINT | Ukuran berkas PDF dalam byte. |
| `created_by` | VARCHAR(36) | Foreign Key ke `users.id` (staf perekam). |
| `created_at` | DATETIME | Waktu pencatatan agenda. |
| `updated_at` | DATETIME | Waktu perubahan terakhir data. |

### 5. Tabel `disposisi` (Lembar Disposisi Elektronik)
Menyimpan riwayat instruksi dari pimpinan kepada bidang pelaksana.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUID v4). |
| `surat_masuk_id` | VARCHAR(36) | Foreign Key ke `surat_masuk.id`. |
| `dari_user_id` | VARCHAR(36) | Foreign Key ke `users.id` (Kadis atau Sekretaris). |
| `kepada_bidang_id`| INT | Foreign Key ke `bidang_dispora.id`. |
| `batas_waktu` | DATE | Tanggal tenggat penyelesaian tindak lanjut. |
| `instruksi_standar`| VARCHAR(255) | Instruksi baku: *Tindak lanjuti, Pelajari, Hadiri/Wakili, dll*. |
| `catatan_khusus` | TEXT | Arahan spesifik dari pimpinan. |
| `status` | ENUM | `'MENUNGGU'`, `'SEDANG_DIPROSES'`, `'SELESAI'`. |
| `catatan_tindak_lanjut` | TEXT | Keterangan penyelesaian tugas oleh bidang terkait. |
| `tanggal_selesai`| DATETIME | Waktu bidang menandai disposisi telah tuntas. |
| `created_at` | DATETIME | Waktu penerbitan lembar disposisi. |

### 6. Tabel `surat_keluar` (Registrasi Surat Keluar & Auto-Numbering)
Menyimpan penomoran dan arsip berkas surat yang diterbitkan oleh Dispora Kalsel.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUID v4). |
| `nomor_agenda` | VARCHAR(20) | Unique, nomor register keluar internal. |
| `nomor_surat` | VARCHAR(100) | Unique, nomor surat dinas tergenerate resmi. |
| `kode_klasifikasi_id` | INT | Foreign Key ke `klasifikasi_surat.id`. |
| `bidang_pemrakarsa_id` | INT | Foreign Key ke `bidang_dispora.id`. |
| `tanggal_surat` | DATE | Tanggal penerbitan surat. |
| `tujuan_instansi`| VARCHAR(150) | Instansi atau pihak tujuan surat. |
| `perihal` | VARCHAR(255) | Perihal surat dinas. |
| `file_url` | VARCHAR(255) | URL berkas PDF bertanda tangan di Cloudflare R2. |
| `file_key` | VARCHAR(255) | Kunci objek S3 Cloudflare R2. |
| `status_kirim` | ENUM | `'DRAFT'`, `'NOMOR_DIAMBIL'`, `'TERKIRIM'`, `'DIARSIPKAN'`. |
| `created_by` | VARCHAR(36) | Foreign Key ke `users.id`. |
| `created_at` | DATETIME | Waktu pencatatan. |

### 7. Tabel `buku_ekspedisi` (Tanda Terima Pengiriman Fisik)
Menyimpan bukti tanda terima penyerahan berkas fisik surat keluar.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | VARCHAR(36) | Primary Key (UUID v4). |
| `surat_keluar_id` | VARCHAR(36) | Unique, Foreign Key ke `surat_keluar.id`. |
| `tanggal_kirim` | DATE | Tanggal pengiriman fisik melalui kurir. |
| `kurir_pengirim` | VARCHAR(100) | Nama staf atau kurir internal pengantar surat. |
| `penerima_nama` | VARCHAR(100) | Nama petugas penerima di instansi tujuan. |
| `bukti_terima_url`| VARCHAR(255) | Foto tanda terima / cap basah eksternal. |
| `created_at` | DATETIME | Waktu perekaman tanda terima. |

### 8. Tabel `audit_logs` (Jejak Rekam Keamanan)
Mencatat seluruh interaksi penting pengguna ke dalam sistem untuk akuntabilitas.

| Kolom | Tipe Data | Keterangan / Batasan |
| :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | Primary Key. |
| `user_id` | VARCHAR(36) | Foreign Key ke `users.id` (Nullable jika belum login). |
| `action` | VARCHAR(50) | Contoh: `'LOGIN'`, `'INPUT_SURAT'`, `'DISPOSISI'`, `'BUKA_PDF'`. |
| `resource` | VARCHAR(50) | Tabel atau modul yang diakses (misal: `surat_masuk`). |
| `resource_id` | VARCHAR(50) | ID objek terkait yang mengalami mutasi. |
| `ip_address` | VARCHAR(45) | Alamat IP pengguna. |
| `user_agent` | VARCHAR(255) | Identitas browser atau perangkat pengakses. |
| `details` | JSON | Detail atribut payload perubahan (format JSON). |
| `created_at` | DATETIME | Waktu kejadian pencatatan audit. |
