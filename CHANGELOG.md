# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Tahap Berikutnya)
- Inisialisasi struktur Next.js 15 App Router + TypeScript di `C:\xampp\htdocs\SIPASD`.
- Integrasi skema tabel Prisma ORM ke basis data TiDB Cloud Serverless.
- Pembuatan komponen antarmuka responsif Tailwind CSS v4 untuk mobile dan desktop.
- Script migrasi batch membaca 171 PDF Surat Masuk dan 249 PDF Surat Keluar.

---

## [1.0.0-spec] - 2026-10-20

### Added
- **README.md**: Dokumentasi komprehensif sistem, latar belakang instansi Dispora Prov. Kalsel, RBAC 4 tingkat, arsitektur teknologi, dan panduan instalasi.
- **AGENT.md**: Direktif agen otonom (zero AI slop, modularitas maks 200 LOC per file, konfigurasi git wajib `Dhani078 / dhanisepeda@gmail.com`).
- **SPEC.md**: Dokumen spesifikasi rekayasa perangkat lunak resmi mengacu pada metode *Spec-Driven Development*.
- **task_plan.md**: Struktur perencanaan 8 fase menggunakan metode *planning-with-files*.
- **findings.md**: Hasil audit dan inventarisasi riil terhadap 420 berkas PDF surat dinas dan profil pejabat Dispora Kalsel.
- **progress.md**: Catatan log kronologis pengerjaan sesi 1.
- **docs/HANDOFF.md**: Berkas status operasional untuk resume sesi otonom berikutnya.
- **docs/DATABASE_SCHEMA.md**: Kamus data lengkap dan ERD relasi 8 tabel TiDB/MySQL.
- **docs/API_ROUTES.md**: Spesifikasi endpoint REST dan Server Actions Next.js 15.
- **docs/LAPORAN_MAGANG_MAPPING.md**: Panduan pemetaan fitur teknis ke naskah Bab I hingga Bab V Laporan Magang TI UNISKA.
- **CONTRIBUTING.md**: Panduan standar kontribusi kode dan format *Conventional Commits*.
- **.github/workflows/ci.yml**: Otomasi CI untuk typecheck, linting, dan build test.
- **.github/ISSUE_TEMPLATE/**: Templat standar pelaporan bug dan permintaan fitur.
- **.github/PULL_REQUEST_TEMPLATE.md**: Standar peninjauan kode pull request.
- **.github/dependabot.yml**: Konfigurasi pembaruan dependensi otomatis.
