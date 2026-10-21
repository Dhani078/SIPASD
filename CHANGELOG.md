# CHANGELOG: SIPASD

Semua perubahan pada proyek **SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)** didokumentasikan dalam berkas ini. Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/id/1.0.0/) dan menganut prinsip [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned (Phase 3 - Phase 6)
- Integrasi 18 komponen modular dari `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` ke rute Next.js 15 App Router.
- Penyambungan kueri real-time database TiDB Cloud Serverless ke antarmuka katalog surat masuk dan keluar.
- Implementasi ekspor Buku Agenda Excel (.xlsx) dinas via endpoint `/api/laporan/export-excel`.
- Pengujian akhir blackbox testing dan deployment produksi ke Vercel.

---

## [2.0.0-prod] - 2026-10-21

### Added
- **`PRD.md` (Product Requirements Document)**: Dokumen spesifikasi produk 100/100 Maxx Mode (36 KB, 529 baris) memuat analisis *Product Lens*, prioritisasi *ICE Score*, kontrak kapabilitas, kamus data 8 tabel, dan 15 matriks uji black box.
- **`CONSTRAINTS.md` (Quality Contract)**: Kontrak kualitas mutlak *The Floor*, batas kinerja kuantitatif, dan aturan invariant *Dual-Cloud Storage*.
- **Infrastruktur Database TiDB Cloud Serverless**: 8 tabel relasional berhasil dimigrasikan via `scripts/migrate-db.ts` dan diisi data awal via `scripts/seed-db.ts`.
- **Integrasi Penyimpanan Ganda (Dual-Cloud)**:
  * Primer: Cloudinary (`cloud_name: vqfpoekg`, API key `966426338749991`) untuk penampil dokumen PDF instan.
  * Sekunder: Google Drive folder `sistem magang` akun resmi `arsipdispora2026` via robot Service Account `sipasd-bot@sipasd.iam.gserviceaccount.com`.
- **Audit & Penyelarasan Prototipe UI Modular**: Memverifikasi 18 komponen modular hasil refactor Figma Make di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)`, lengkap dengan 36 data transaksi riil Dispora Kalsel, pemutar PDF dinamis `pdf.ts` (`jspdf` + `pdfjs-dist`), dan generator spreadsheet `exportExcel.ts` (`exceljs`).

### Changed
- **Penyelarasan Seluruh Naskah Laporan Magang**: Harmonisasi Bab I s/d Bab V, Daftar Pustaka APA 7th Edition, Deployment Guide, dan Security Audit dengan arsitektur Dual-Cloud (Cloudinary + Google Drive) tanpa kartu kredit.

---

## [1.1.0-earsipped] - 2026-10-20

### Changed
- **Penyelarasan Paradigma Repositori E-Arsip Digital**: Menyelaraskan seluruh spesifikasi sistem dan naskah laporan dari sistem workflow surat baru menjadi Repositori E-Arsip Terindeks untuk 420 berkas pindaian scan PDF yang tersimpan di Google Drive instansi (`arsipdispora2026 / sistem magang`).
- **Penyelarasan Draf Laporan Magang Bab I s/d Bab V**: Menyesuaikan latar belakang masalah, analisis PIECES, perancangan antarmuka, dan 15 skenario Black Box Testing agar fokus pada efisiensi temu-kembali arsip dari 15–30 menit menjadi < 2 detik.
- **Skema Database & DDL**: Mengubah struktur tabel menjadi fokus katalog arsip (`arsip_surat_masuk`, `arsip_surat_keluar`, `riwayat_disposisi`, `klasifikasi_arsip`, `buku_ekspedisi`, `audit_logs`).
- **Roadmap Skripsi S1**: Menegaskan pemanfaatan dataset 420 berkas scan PDF Google Drive sebagai korpus penelitian komputasi kecerdasan buatan (OCR Tesseract & Klasifikasi Teks Naive Bayes TF-IDF).
