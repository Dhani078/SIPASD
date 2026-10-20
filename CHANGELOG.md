# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Phase 2 - Phase 8)
- Inisialisasi struktur Next.js 15 App Router + TypeScript di `C:\xampp\htdocs\SIPASD`.
- Integrasi skema tabel Prisma ORM ke basis data TiDB Cloud Serverless.
- Pembuatan komponen antarmuka responsif Tailwind CSS v4 untuk mobile dan desktop.
- Script migrasi batch membaca 171 PDF Surat Masuk dan 249 PDF Surat Keluar.

---

## [1.0.0-spec-maxx] - 2026-10-20

### Added
- **Draf Naskah Lengkap Laporan Magang TI UNISKA (Bab I s/d Bab V)**:
  - `docs/BAB_1_PENDAHULUAN_DRAFT.md`: Naskah akademik lengkap Bab I (Latar Belakang SPBE, 4 Rumusan Masalah, 6 Batasan Masalah, Tujuan & Manfaat 3 Dimensi, Sistematika).
  - `docs/BAB_2_PROFIL_INSTANSI_DRAFT.md`: Naskah Bab II (Dasar hukum Perda 11/2016, Visi Kalsel Maju, Tupoksi Sekretariat & Keuangan, Profil Pejabat, Inventaris 11 Venue Olahraga).
  - `docs/BAB_3_ANALISIS_PERANCANGAN_DRAFT.md`: Naskah Bab III (Alur manual, Evaluasi PIECES, Kebutuhan FURPS, Use Case, Activity, Sequence, Class Diagram, Normalisasi 3NF, Wireframe).
  - `docs/BAB_4_IMPLEMENTASI_PENGUJIAN_DRAFT.md`: Naskah Bab IV (Hardware/Software env, implementasi antarmuka, kode transaksi atomik penomoran, 15 tabel Black Box Testing, perbandingan performa sebelum vs sesudah).
  - `docs/BAB_5_PENUTUP_DRAFT.md`: Naskah Bab V (5 kesimpulan berbasis bukti dan saran praktis dinas serta akademis).
  - `docs/DAFTAR_PUSTAKA.md`: 21 referensi akademik format APA 7th Edition (Peraturan pemerintah, software engineering, cloud architecture, dan jurnal ilmiah persuratan).
- **Dokumentasi Desain & Operasional Tingkat Lanjut**:
  - `docs/UI_UX_DESIGN_TOKENS.md`: Desain sistem lengkap palet Emerald Dispora (#047857), Gold Banua (#D97706), Slate, Tipografi Plus Jakarta Sans, dan aturan 0 horizontal overflow mobile.
  - `docs/DEPLOYMENT_GUIDE.md`: Runbook panduan deployment cloud gratis (Vercel, TiDB Cloud Serverless, Cloudflare R2).
  - `docs/IMPORT_MIGRATION_GUIDE.md`: Skrip Python mandiri ekstraksi 420 berkas riil PDF ke SQL seed.
- **Dokumentasi Inti & Spesifikasi Sistem**:
  - `README.md`, `AGENT.md`, `SPEC.md`, `task_plan.md`, `findings.md`, `progress.md`, `CONTRIBUTING.md`.
  - `docs/DATABASE_SCHEMA.md`: ERD, kamus data, dan SQL DDL 8 tabel TiDB/MySQL siap pakai.
  - `docs/API_ROUTES.md`: Spesifikasi REST endpoint dan Server Actions.
  - `docs/UML_DIAGRAMS.md`: Diagram UML lengkap berskenario dan kode PlantUML.
  - `docs/SECURITY_AUDIT.md`: Matriks kepatuhan OWASP Top 10.
  - `docs/SOP_KEDINASAN.md`: 5 Standar Operasional Prosedur kedinasan.
  - `docs/SKRIPSI_UPGRADE_ROADMAP.md`: Blueprint ilmiah peningkatan ke Skripsi S1 (metode Naive Bayes TF-IDF & OCR).
- **Konfigurasi GitHub**:
  - CI Pipeline (`.github/workflows/ci.yml`), Issue Templates, PR Template, Dependabot.
