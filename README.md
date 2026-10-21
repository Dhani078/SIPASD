# SIPASD - Sistem Informasi Pengelolaan Arsip Surat Dispora
**Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan**  
*Klasifikasi: Repositori E-Arsip Surat Digital Berbasis Web Responsif - Kerja Praktik TI UNISKA*

[![CI Status](https://github.com/Dhani078/SIPASD/actions/workflows/ci.yml/badge.svg)](https://github.com/Dhani078/SIPASD/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Framework: Next.js 15](https://img.shields.io/badge/Framework-Next.js%2015-black.svg)](https://nextjs.org/)
[![Database: TiDB Serverless](https://img.shields.io/badge/Database-TiDB%20Serverless-blue.svg)](https://tidb.cloud/)
[![Storage: Cloudinary & Google Drive](https://img.shields.io/badge/Storage-Cloudinary%20%26%20Drive-blue.svg)](https://cloudflare.com/)

---

## 🏛️ Latar Belakang & Masalah Riil Google Drive
Sekretariat Dispora Provinsi Kalimantan Selatan (Jalan Pramuka No. 4 Banjarmasin) menyimpan arsip surat hasil pindaian (*scan*) pada akun Google Drive `arsipdispora2026` (folder `sistem magang`). 

Kondisi eksisting penyimpanan Google Drive:
1. Berkas PDF hanya ditumpuk dalam folder `Surat Masuk 2026` (171 file) dan `Surat Keluar 2026` (249 file) tanpa metadata terstruktur.
2. Penamaan file manual acak (contoh: `0973(14 Agustus 2026).pdf`, `4302(1).pdf`, `7480-82, 3 surat_20260902_0001.pdf`).
3. Google Drive tidak memiliki filter klasifikasi dinas (Permendagri/Pergub), tidak ada pencatatan riwayat disposisi fisik pimpinan, dan tidak bisa mengekspor buku agenda resmi kedinasan.
4. Temu-kembali dokumen memakan waktu **15-30 menit** karena staf harus membuka satu per satu file PDF untuk mengetahui isinya.

**SIPASD** hadir sebagai **Katalog Repositori E-Arsip Digital Terindeks**. Sistem mengintegrasikan seluruh 420+ arsip riil TA 2026 ke dalam basis data cloud berindeks, memotong waktu temu-kembali dokumen menjadi **< 2 detik** via peramban HP dan PC.

---

## 👥 Matriks Hak Akses Pengguna (RBAC)

| Role | Identitas Akun | Peruntukan Jabatan | Hak Akses & Wewenang |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | Administrator IT Dispora | Manajemen akun, master klasifikasi surat, konfigurasi sistem, audit trail. |
| **Petugas Arsip** | `tu_umum` | Staf Tata Usaha / Arsiparis | Pengindeksan arsip surat baru, input metadata disposisi fisik, ekspor buku agenda. |
| **Pimpinan** | `kadis` / `sekretaris` | Kepala Dinas / Sekretaris | Pencarian cepat dokumen, monitoring volume arsip dinas, rekapitulasi agenda. |
| **Bidang / Seksi** | `kabid_pora` / `subbag_keuangan` | Kepala Bidang / Kasubbag | Pencarian dan pratinjau arsip surat disposisi sesuai bidang tugasnya. |

---

## 🚀 Fitur Utama Sistem E-Arsip

### 1. Katalog & Pencarian Multi-Filter Instan (< 2 Detik)
- Mesin pencari cepat berbasis kata kunci: Nomor Surat, Nomor Agenda, Asal/Tujuan Instansi, Perihal, Ringkasan, dan Kode Klasifikasi.
- Filter berdasarkan rentang tanggal surat/diterima dan status sifat surat (*Biasa, Penting, Segera, Kilat*).

### 2. Built-in In-Browser PDF Streaming Viewer
- Membaca dokumen PDF pindaian langsung di layar peramban tanpa wajib mengunduh file fisik.
- Dukungan mode *Split-Screen View* pada komputer kerja (tabel metadata di kiri, viewer PDF di kanan).
- Mode kartu responsif dan pratinjau nyaman di layar ponsel pintar (*smartphone*).

### 3. Dokumentasi Riwayat Disposisi Fisik
- Mencatat dokumentasi lembar disposisi kertas yang sudah ditandatangani basah pimpinan: pejabat pendisposisi, tanggal disposisi, bidang tujuan, instruksi tertulis, dan catatan khusus.
- Fitur cetak ulang salinan Lembar Disposisi standar Pemprov Kalsel.

### 4. Manajemen Klasifikasi & Jadwal Retensi Arsip (JRA)
- Pengelompokan kode klasifikasi dinas standar Permendagri / Pergub Kalsel:
  * `005` (Undangan)
  * `426` (Keolahragaan)
  * `427` (Kepemudaan)
  * `800` (Kepegawaian)
  * `045` (Kearsipan)
  * `900` (Keuangan)
- Informasi masa retensi aktif dan inaktif dokumen arsip negara.

### 5. Ekspor Buku Agenda Otomatis (Format Excel .xlsx)
- Ekspor rekapitulasi Buku Agenda Surat Masuk dan Surat Keluar ke format spreadsheet Microsoft Excel resmi sesuai format baku laporan pertanggungjawaban dinas.

---

## 🛠️ Tumpukan Teknologi (Cloud-Native & Zero Cost)

- **Frontend & Fullstack**: Next.js 15 (App Router, React 19, TypeScript).
- **Styling**: Tailwind CSS v4 (Responsif Mobile & PC, 0 Horizontal Overflow).
- **Basis Data**: TiDB Cloud Serverless (MySQL Compatible, SSL Strict, Gratis 25 GB).
- **Penyimpanan Dokumen**: Cloudinary & Google Drive (S3 API, Zero Egress Fee, Gratis 10 GB).
- **Hosting Publik**: Vercel Edge Network (HTTPS Otomatis, Aktif 24 Jam Tanpa Komputer Kantor).

---

## 📦 Struktur Repositori

```
SIPASD/
├── docs/
│   ├── BAB_1_PENDAHULUAN_DRAFT.md    # Naskah Laporan Magang Bab I
│   ├── BAB_2_PROFIL_INSTANSI_DRAFT.md# Naskah Laporan Magang Bab II
│   ├── BAB_3_ANALISIS_PERANCANGAN_DRAFT.md # Naskah Laporan Magang Bab III
│   ├── BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md # Naskah Laporan Magang Bab IV
│   ├── BAB_5_PENUTUP_DRAFT.md        # Naskah Laporan Magang Bab V
│   ├── DAFTAR_PUSTAKA.md             # Rujukan Format APA 7th Edition
│   ├── DATABASE_SCHEMA.md            # Kamus Data & SQL DDL 8 Tabel
│   ├── UML_DIAGRAMS.md               # Use Case, Activity, Sequence, Class Diagram
│   ├── SECURITY_AUDIT.md             # Matriks OWASP Top 10 & Validasi PDF
│   ├── SOP_KEDINASAN.md              # 5 SOP Pengelolaan Arsip Dispora
│   ├── SKRIPSI_UPGRADE_ROADMAP.md    # Blueprint Skripsi S1 (OCR & Naive Bayes)
│   ├── DEPLOYMENT_GUIDE.md           # Panduan Deployment Cloud Zero Cost
│   └── IMPORT_MIGRATION_GUIDE.md     # Skrip Import 420 Berkas Riil PDF
├── AGENT.md                          # Panduan Agen Otonom & Aturan Zero-Slop
├── SPEC.md                           # Dokumen Spesifikasi Resmi
├── task_plan.md                      # Rencana Kerja Bertahap
├── findings.md                       # Analisis Data Riil Google Drive Dispora
├── progress.md                       # Log Catatan Kronologis Pengerjaan
└── README.md                         # Dokumentasi Utama Ini
```

---

## 👤 Informasi Mahasiswa
- **Nama**: Muhammad Rizki Ramadhani
- **NPM**: 2310010406
- **Program Studi**: S1 Teknik Informatika - Fakultas Teknologi Informasi
- **Perguruan Tinggi**: Universitas Islam Kalimantan (UNISKA) MAB Banjarmasin
- **Instansi Magang**: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan
- **Tahun**: 2026
