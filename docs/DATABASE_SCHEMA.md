# DATABASE SCHEMA & DDL SPECIFICATION: SIPASD
**Sistem Informasi Pengelolaan Arsip dan Surat Dispora**  
*RDBMS: TiDB Cloud Serverless / MySQL 8.0+ Compatible*  
*Engine: InnoDB | Collation: utf8mb4_unicode_ci | Timezone: Asia/Makassar (+08:00 WITA)*

---

## 1. Diagram Relasi Entitas (ERD)

```
+---------------------------------------------------------------------------------------------------+
|                                      RELASI DATABASE SIPASD                                       |
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
     1:N |   1:N |   1:N | 1:N                                  |
         |       |       |                                      |
         v       |       v                                      v
  +------+----+  |  +----+--------+                     +-------+-----------+
  | audit_logs|  |  | surat_keluar|                     |     disposisi     |
  +-----------+  |  +-------------+                     +-------------------+
                 |  | PK id       |                     | PK id (UUID)      |
                 |  | FK user_id  |                     | FK surat_masuk_id |
                 |  | FK kode_id  |                     | FK dari_user_id   |
                 |  | FK bidang_id+<--------------------+ FK kepada_bidang  |
                 |  +------+------+                     +---------+---------+
                 |         |                                      ^
                 |     1:1 |                                      |
                 |         v                                  1:N |
                 |  +------+--------+                             |
                 |  |buku_ekspedisi |                             |
                 |  +---------------+                             |
                 v                                                |
          +------+--------+                                       |
          |  surat_masuk  +---------------------------------------+
          +---------------+
          | PK id (UUID)  |
          | FK created_by |
          +---------------+
```

---

## 2. Naskah SQL DDL Lengkap (Copy-Paste Ready)

Naskah DDL di bawah ini dapat langsung dieksekusi di TiDB Cloud console atau phpMyAdmin / MySQL CLI:

```sql
-- ============================================================================
-- NAMA SISTEM : SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)
-- INSTANSI    : Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan
-- TAHUN       : 2026
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `sipasd` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `sipasd`;

-- ----------------------------------------------------------------------------
-- 1. TABEL: users (Pengguna & Hak Akses RBAC 4 Tingkat)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `nip` VARCHAR(25) NOT NULL,
  `nama_lengkap` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'PIMPINAN', 'TU_UMUM', 'BIDANG') NOT NULL DEFAULT 'BIDANG',
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
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABEL: bidang_dispora (Unit Kerja / Bidang Internal)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bidang_dispora` (
  `id` INT AUTO_INCREMENT NOT NULL,
  `kode_bidang` VARCHAR(20) NOT NULL,
  `nama_bidang` VARCHAR(100) NOT NULL,
  `nama_kepala` VARCHAR(100) NOT NULL,
  `nip_kepala` VARCHAR(25) NOT NULL,
  `keterangan_tugas` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bidang_kode` (`kode_bidang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABEL: klasifikasi_surat (Kode Klasifikasi Permendagri / Pergub Kalsel)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `klasifikasi_surat` (
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

-- ----------------------------------------------------------------------------
-- 4. TABEL: surat_masuk (Buku Agenda Masuk & Pengarsipan Digital)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `surat_masuk` (
  `id` VARCHAR(36) NOT NULL,
  `nomor_agenda` VARCHAR(30) NOT NULL,
  `nomor_surat` VARCHAR(100) NOT NULL,
  `tanggal_surat` DATE NOT NULL,
  `tanggal_diterima` DATE NOT NULL,
  `asal_instansi` VARCHAR(150) NOT NULL,
  `perihal` VARCHAR(255) NOT NULL,
  `ringkasan_isi` TEXT NULL,
  `sifat_surat` ENUM('BIASA', 'PENTING', 'SEGERA', 'KILAT') NOT NULL DEFAULT 'BIASA',
  `status_disposisi` ENUM('MENUNGGU', 'DIDISPOSISIKAN', 'DIPROSES', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
  `file_url` VARCHAR(255) NULL,
  `file_key` VARCHAR(255) NULL,
  `file_name_original` VARCHAR(255) NULL,
  `file_size_bytes` BIGINT NULL DEFAULT 0,
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_surat_masuk_agenda` (`nomor_agenda`),
  INDEX `idx_surat_masuk_tgl_terima` (`tanggal_diterima`),
  INDEX `idx_surat_masuk_instansi` (`asal_instansi`),
  INDEX `idx_surat_masuk_sifat` (`sifat_surat`),
  INDEX `idx_surat_masuk_status` (`status_disposisi`),
  CONSTRAINT `fk_sm_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABEL: disposisi (Lembar Disposisi Elektronik Berjenjang)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `disposisi` (
  `id` VARCHAR(36) NOT NULL,
  `surat_masuk_id` VARCHAR(36) NOT NULL,
  `dari_user_id` VARCHAR(36) NOT NULL,
  `kepada_bidang_id` INT NOT NULL,
  `batas_waktu` DATE NOT NULL,
  `instruksi_standar` VARCHAR(255) NOT NULL,
  `catatan_khusus` TEXT NULL,
  `status` ENUM('MENUNGGU', 'SEDANG_DIPROSES', 'SELESAI') NOT NULL DEFAULT 'MENUNGGU',
  `catatan_tindak_lanjut` TEXT NULL,
  `tanggal_selesai` DATETIME NULL,
  `lampiran_tindak_lanjut_url` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_disp_surat` (`surat_masuk_id`),
  INDEX `idx_disp_bidang` (`kepada_bidang_id`),
  INDEX `idx_disp_status` (`status`),
  INDEX `idx_disp_batas_waktu` (`batas_waktu`),
  CONSTRAINT `fk_disp_surat` FOREIGN KEY (`surat_masuk_id`) REFERENCES `surat_masuk` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_disp_dari` FOREIGN KEY (`dari_user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_disp_bidang` FOREIGN KEY (`kepada_bidang_id`) REFERENCES `bidang_dispora` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TABEL: surat_keluar (Registrasi Penomoran Otomatis & Arsip)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `surat_keluar` (
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
  `isi_ringkas` TEXT NULL,
  `file_url` VARCHAR(255) NULL,
  `file_key` VARCHAR(255) NULL,
  `file_size_bytes` BIGINT NULL DEFAULT 0,
  `status_kirim` ENUM('DRAFT', 'NOMOR_DIAMBIL', 'TERKIRIM', 'DIARSIPKAN') NOT NULL DEFAULT 'NOMOR_DIAMBIL',
  `created_by` VARCHAR(36) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_surat_keluar_nomor` (`nomor_surat`),
  UNIQUE KEY `uk_surat_keluar_agenda` (`nomor_agenda`),
  INDEX `idx_sk_tahun_urut` (`tahun`, `nomor_urut`),
  INDEX `idx_sk_tgl` (`tanggal_surat`),
  INDEX `idx_sk_bidang` (`bidang_pemrakarsa_id`),
  CONSTRAINT `fk_sk_klasifikasi` FOREIGN KEY (`kode_klasifikasi_id`) REFERENCES `klasifikasi_surat` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sk_bidang` FOREIGN KEY (`bidang_pemrakarsa_id`) REFERENCES `bidang_dispora` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_sk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. TABEL: buku_ekspedisi (Tanda Terima Distribusi Fisik Surat Keluar)
-- ----------------------------------------------------------------------------
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
  INDEX `idx_ekspedisi_tgl` (`tanggal_kirim`),
  CONSTRAINT `fk_ekspedisi_sk` FOREIGN KEY (`surat_keluar_id`) REFERENCES `surat_keluar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. TABEL: audit_logs (Jejak Rekam Keamanan & Audit Trail Otomatis)
-- ----------------------------------------------------------------------------
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
  INDEX `idx_audit_resource` (`resource`),
  INDEX `idx_audit_tgl` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Data Awal Seeder Resmi (Seed Data Dispora Kalsel)

```sql
-- 1. SEED UNIT KERJA / BIDANG DISPORA KALSEL
INSERT INTO `bidang_dispora` (`id`, `kode_bidang`, `nama_bidang`, `nama_kepala`, `nip_kepala`) VALUES
(1, 'SEKR', 'Sekretariat Dispora', 'Pebriadin Hapiz, AP, M.Si', '19780214 199612 1 001'),
(2, 'PORA', 'Bidang Pembudayaan Olahraga', 'Budiono, S.Pd, M.AP', '19800315 200501 1 008'),
(3, 'PRESTASI', 'Bidang Peningkatan Prestasi Olahraga', 'H. Heru Susanto, SE, MM', '19750820 200212 1 003'),
(4, 'PEMUDA', 'Bidang Pengembangan & Pemberdayaan Pemuda', 'Drs. H. M. Fauzi, M.Si', '19711104 199803 1 005'),
(5, 'SAPRAS', 'Bidang Sarana dan Prasarana Olahraga', 'Akhmad Syarif, ST, MT', '19820612 200801 1 012');

-- 2. SEED MASTER KODE KLASIFIKASI SURAT DINAS (PERMENDAGRI / PERGUB KALSEL)
INSERT INTO `klasifikasi_surat` (`id`, `kode`, `nama_klasifikasi`, `uraian`, `retensi_aktif_tahun`, `retensi_inaktif_tahun`) VALUES
(1, '005', 'Undangan', 'Surat undangan rapat dinas, sosialisasi, seminar, dan audiensi', 1, 2),
(2, '426', 'Keolahragaan', 'Surat pembinaan atlet, kejuaraan daerah, hibah cabor, dan venue olahraga', 2, 5),
(3, '427', 'Kepemudaan', 'Surat kegiatan jambore, seleksi paskibraka, dan wirausaha muda', 2, 5),
(4, '800', 'Kepegawaian', 'Surat tugas dinas dalam/luar daerah, mutasi, cuti, dan kediklatan', 2, 10),
(5, '045', 'Kearsipan', 'Surat pengelolaan dokumen arsip, peminjaman, dan penyerahan berkas', 3, 10),
(6, '900', 'Keuangan', 'Surat pengantar SPJ, permohonan pencairan anggaran, dan retribusi', 5, 10);

-- 3. SEED PENGGUNA RESMI DISPORA KALSEL (Password default: Dispora2026! -> bcrypt $2a$12$...)
INSERT INTO `users` (`id`, `nip`, `nama_lengkap`, `username`, `email`, `password_hash`, `role`, `jabatan`, `unit_kerja`) VALUES
('usr-admin-01', '19990101 202401 1 001', 'Administrator IT Dispora', 'admin', 'admin.dispora@kalselprov.go.id', '$2a$12$442c56Y4xG4F5zUjQ80MpeXGz51LkmO0Q2K75YdKeq1v4xJb8jSsq', 'SUPER_ADMIN', 'Pranata Komputer Ahli Pertama', 'Sekretariat'),
('usr-kadis-01', '19780214 199612 1 001', 'Pebriadin Hapiz, AP, M.Si', 'kadis', 'pebriadin.kadis@kalselprov.go.id', '$2a$12$442c56Y4xG4F5zUjQ80MpeXGz51LkmO0Q2K75YdKeq1v4xJb8jSsq', 'PIMPINAN', 'Kepala Dinas Kepemudaan dan Olahraga', 'Pimpinan'),
('usr-tu-01', '19870312 201101 2 004', 'Staf Agenda TU Dispora', 'tu_umum', 'tu.dispora@kalselprov.go.id', '$2a$12$442c56Y4xG4F5zUjQ80MpeXGz51LkmO0Q2K75YdKeq1v4xJb8jSsq', 'TU_UMUM', 'Pengadministrasi Persuratan', 'Subbag Umum & Kepegawaian'),
('usr-keu-01', '19850421 201001 2 003', 'Norika Fajriana, SH, MH', 'subbag_keuangan', 'norika.keuangan@kalselprov.go.id', '$2a$12$442c56Y4xG4F5zUjQ80MpeXGz51LkmO0Q2K75YdKeq1v4xJb8jSsq', 'BIDANG', 'Kasubbag Perencanaan & Keuangan', 'Sekretariat'),
('usr-pora-01', '19800315 200501 1 008', 'Budiono, S.Pd, M.AP', 'kabid_pora', 'budiono.pora@kalselprov.go.id', '$2a$12$442c56Y4xG4F5zUjQ80MpeXGz51LkmO0Q2K75YdKeq1v4xJb8jSsq', 'BIDANG', 'Kepala Bidang Pembudayaan Olahraga', 'Bidang Pembudayaan Olahraga');
```
