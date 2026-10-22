# DATABASE SCHEMA & DDL SPECIFICATION: SIPASD
**Sistem Informasi Pengelolaan Arsip Surat Dispora (Repositori E-Arsip Digital)**  
*RDBMS: TiDB Cloud Serverless / MySQL 8.0+ Compatible*  
*Engine: InnoDB | Collation: utf8mb4_unicode_ci | Timezone: Asia/Makassar (+08:00 WITA)*

---

## 1. Diagram Relasi Entitas (ERD E-Arsip)

```
+---------------------------------------------------------------------------------------------------+
|                                   RELASI DATABASE E-ARSIP SIPASD                                  |
+---------------------------------------------------------------------------------------------------+

     +-----------------------+                    +---------------------------+
     |         users         |                    |      bidang_dispora       |
     +-----------------------+                    +---------------------------+
     | PK id (UUID)          |                    | PK id (INT AUTO)          |
     |    nip (UNIQUE)       |                    |    kode_bidang (UNIQUE)   |
     |    nama_lengkap       |                    |    nama_bidang            |
     |    username (UNIQUE)  |                    |    nama_kepala            |
     |    password_hash      |                    |    nip_kepala             |
     |    role (ENUM)        |                    +-------------+-------------+
     |    jabatan            |                                  |
     |    unit_kerja         |                                  | 1:N
     +---+-------+-------+---+                                  |
         |       |       |                                      |
     1:N |   1:N |   1:N |                                      |
         |       |       |                                      |
         v       |       v                                      v
  +------+----+  |  +----+--------------+               +-------+-----------+
  | audit_logs|  |  |arsip_surat_keluar |               | riwayat_disposisi |
  +-----------+  |  +-------------------+               +-------------------+
                 |  | PK id             |               | PK id (UUID)      |
                 |  | FK indexed_by     |               | FK surat_masuk_id |
                 |  | FK klasifikasi_id |               |    pejabat_nama   |
                 |  | FK bidang_id      +<--------------+ FK kepada_bidang  |
                 |  +------+------------+               +---------+---------+
                 |         |                                      ^
                 |     1:1 |                                      |
                 |         v                                  1:N |
                 |  +------+--------+                             |
                 |  |buku_ekspedisi |                             |
                 |  +---------------+                             |
                 v                                                |
          +------+------------+                                   |
          | arsip_surat_masuk +-----------------------------------+
          +-------------------+
          | PK id (UUID)      |
          | FK indexed_by     |
          +-------------------+
```

---

## 2. Naskah SQL DDL Lengkap (Copy-Paste Ready)

```sql
CREATE DATABASE IF NOT EXISTS `sipasd` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `sipasd`;

-- 1. TABEL: users (Pengguna & Hak Akses)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `nip` VARCHAR(25) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'PETUGAS_ARSIP', 'PIMPINAN', 'BIDANG') NOT NULL DEFAULT 'BIDANG',
  `jabatan` VARCHAR(100) NOT NULL,
  `unit_kerja` VARCHAR(100) NOT NULL,
  `nomor_wa` VARCHAR(20) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_nip` (`nip`),
  UNIQUE KEY `uk_users_username` (`username`),
  UNIQUE KEY `uk_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL: bidang_dispora (Unit Kerja / Bidang Internal)
CREATE TABLE IF NOT EXISTS `bidang_dispora` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `kode_bidang` VARCHAR(20) NOT NULL,
  `nama_bidang` VARCHAR(100) NOT NULL,
  `nama_kepala` VARCHAR(100) NOT NULL,
  `nip_kepala` VARCHAR(25) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bidang_kode` (`kode_bidang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL: klasifikasi_arsip (Kode Permendagri / Pergub Kalsel)
CREATE TABLE IF NOT EXISTS `klasifikasi_arsip` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `kode` VARCHAR(20) NOT NULL,
  `nama_klasifikasi` VARCHAR(100) NOT NULL,
  `uraian` TEXT NOT NULL,
  `retensi_aktif_tahun` INT NOT NULL DEFAULT 2,
  `retensi_inaktif_tahun` INT NOT NULL DEFAULT 5,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_klasifikasi_kode` (`kode`),
  INDEX `idx_klasifikasi_nama` (`nama_klasifikasi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL: arsip_surat_masuk (Katalog 171 PDF Surat Masuk Google Drive)
CREATE TABLE IF NOT EXISTS `arsip_surat_masuk` (
  `id` VARCHAR(36) NOT NULL,
  `nomor_agenda` VARCHAR(30) NOT NULL,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `tanggal_diterima` DATE NOT NULL,
  `asal_instansi` VARCHAR(150) NOT NULL,
  `perihal` VARCHAR(255) NOT NULL,
  `ringkasan_isi` TEXT NULL,
  `sifat_surat` ENUM('BIASA', 'PENTING', 'SEGERA', 'KILAT') NOT NULL DEFAULT 'BIASA',
  `file_url` VARCHAR(255) NOT NULL,
  `cloudinary_public_id` VARCHAR(255) NULL,
  `drive_url` VARCHAR(255) NULL,
  `file_key` VARCHAR(255) NOT NULL,
  `file_name_original` VARCHAR(255) NULL,
  `file_size_bytes` BIGINT NULL DEFAULT 0,
  `indexed_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_arsip_sm_agenda` (`nomor_agenda`),
  INDEX `idx_arsip_sm_tgl_terima` (`tanggal_diterima`),
  INDEX `idx_arsip_sm_instansi` (`asal_instansi`),
  INDEX `idx_arsip_sm_sifat` (`sifat_surat`),
  CONSTRAINT `fk_sm_indexed_by` FOREIGN KEY (`indexed_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL: riwayat_disposisi (Catatan Fisik Lembar Disposisi Kertas)
CREATE TABLE IF NOT EXISTS `riwayat_disposisi` (
  `id` VARCHAR(36) NOT NULL,
  `surat_masuk_id` VARCHAR(36) NOT NULL,
  `pejabat_pendisposisi` VARCHAR(100) NOT NULL,
  `tanggal_disposisi` DATE NOT NULL,
  `kepada_bidang_id` INT NOT NULL,
  `batas_waktu` DATE NULL,
  `instruksi_tercatat` VARCHAR(255) NOT NULL,
  `catatan_tertulis` TEXT NULL,
  `status_penyelesaian` ENUM('BELUM_DIPROSES', 'PROSES', 'SELESAI') NOT NULL DEFAULT 'SELESAI',
  `keterangan_tindak_lanjut` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_disp_surat` (`surat_masuk_id`),
  INDEX `idx_disp_bidang` (`kepada_bidang_id`),
  CONSTRAINT `fk_disp_surat` FOREIGN KEY (`surat_masuk_id`) REFERENCES `arsip_surat_masuk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_disp_bidang` FOREIGN KEY (`kepada_bidang_id`) REFERENCES `bidang_dispora` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL: arsip_surat_keluar (Katalog 249 PDF Surat Keluar Google Drive)
CREATE TABLE IF NOT EXISTS `arsip_surat_keluar` (
  `id` VARCHAR(36) NOT NULL,
  `nomor_agenda` VARCHAR(30) NOT NULL,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `nomor_urut` INT NOT NULL,
  `tahun` INT NOT NULL,
  `kode_klasifikasi_id` INT NOT NULL,
  `bidang_pemrakarsa_id` INT NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `tujuan_instansi` VARCHAR(150) NOT NULL,
  `perihal` VARCHAR(255) NOT NULL,
  `ringkasan_isi` TEXT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `cloudinary_public_id` VARCHAR(255) NULL,
  `drive_url` VARCHAR(255) NULL,
  `file_key` VARCHAR(255) NOT NULL,
  `file_size_bytes` BIGINT NULL DEFAULT 0,
  `indexed_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_arsip_sk_nomor` (`nomor_surat`),
  UNIQUE KEY `uk_arsip_sk_agenda` (`nomor_agenda`),
  INDEX `idx_sk_tahun_urut` (`tahun`, `nomor_urut`),
  INDEX `idx_sk_tgl` (`tanggal_surat`),
  CONSTRAINT `fk_sk_klasifikasi` FOREIGN KEY (`kode_klasifikasi_id`) REFERENCES `klasifikasi_arsip` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sk_bidang` FOREIGN KEY (`bidang_pemrakarsa_id`) REFERENCES `bidang_dispora` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sk_indexed_by` FOREIGN KEY (`indexed_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL: buku_ekspedisi (Bukti Distribusi Fisik Surat Keluar)
CREATE TABLE IF NOT EXISTS `buku_ekspedisi` (
  `id` VARCHAR(36) NOT NULL,
  `surat_keluar_id` VARCHAR(36) NOT NULL,
  `tanggal_kirim` DATE NOT NULL,
  `kurir_pengirim` VARCHAR(100) NOT NULL,
  `penerima_nama` VARCHAR(100) NOT NULL,
  `penerima_telepon` VARCHAR(20) NULL,
  `bukti_terima_url` VARCHAR(255) NULL,
  `catatan_ekspedisi` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ekspedisi_sk` (`surat_keluar_id`),
  CONSTRAINT `fk_ekspedisi_sk` FOREIGN KEY (`surat_keluar_id`) REFERENCES `arsip_surat_keluar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. TABEL: audit_logs (Jejak Temu-Kembali & Keamanan)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `user_id` VARCHAR(36) NULL,
  `action` VARCHAR(50) NOT NULL,
  `resource` VARCHAR(50) NOT NULL,
  `resource_id` VARCHAR(50) NULL,
  `ip_address` VARCHAR(45) NOT NULL,
  `user_agent` VARCHAR(255) NULL,
  `details` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_tgl` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
