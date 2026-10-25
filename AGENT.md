# AGENT DIRECTIVE: SIPASD PROJECT
**Standar Kerja & Panduan Agen Otonom (Autonomous Agent Directives)**  
*Repositori: Dhani078/SIPASD | Target: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 🧭 Prinsip Utama (Zero-Tolerance Rules)

1. **Zero AI Slop & Zero Dummy Data (Aturan Mutlak Koneksi Database Nyata)**:
   - Dilarang membuat kode mockup pura-pura, file pura-pura, fungsi setengah jadi, atau array data tiruan di memori frontend.
   - **Seluruh data tabel, kartu KPI, filter, dan modal WAJIB terkoneksi 100% secara real-time ke basis data TiDB Cloud Serverless (`sipasd`)**.
   - Dokumen yang disajikan adalah **411 berkas arsip naskah fisik nyata TA 2026** (170 Surat Masuk & 241 Surat Keluar) yang tertaut ke penyimpanan Cloudinary (`vqfpoekg`) dan cadangan resmi 100% di Google Drive akun dinas kuota 5 TB.
2. **Modularitas Maksimal (Maks 200 LOC per File)**:
   - Tidak boleh ada satu file komponen atau controller melebihi 200 baris kode. Pecah menjadi sub-komponen, *hooks*, modul utilitas, atau *server actions* yang terisolasi.
   - Mengacu pada 18 komponen modular di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)`.
3. **Identitas Git Wajib**:
   - `git config user.name "Dhani078"`
   - `git config user.email "dhanisepeda@gmail.com"`
   - Menggunakan email asli ini adalah syarat mutlak agar riwayat kontribusi (kotak hijau GitHub) aktif. Dilarang memakai dummy email / noreply.
4. **Verifikasi Berbasis Bukti (Evidence-First Verification)**:
   - Dilarang mengklaim fitur selesai sebelum ada hasil eksekusi riil dari terminal, build tools, atau verifikasi browser.
   - Periksa `task_plan.md`, `progress.md`, dan `docs/HANDOFF.md` di awal setiap sesi.
5. **Protokol Siklus Otonom (24h Autonomous Loop Protocol)**:
   - Jika pengguna memberi perintah berulang seperti *"start loop"*, *"lanjutkan"*, atau membuka sesi baru: **BACA & LAPORKAN STATE DAHULU**, jangan mengulang pekerjaan yang sudah selesai!
   - Perbarui file `progress.md`, `task_plan.md`, dan `CHANGELOG.md` setiap kali ada penambahan fitur atau perbaikan kode.
6. **Desain Kustom & Responsif (0 Horizontal Overflow)**:
   - Gunakan palet resmi Dispora Kalsel: Hijau Zamrud (`#064E3B`, `#047857`) dan Emas Banua (`#D97706`).
   - Antarmuka wajib diuji responsif pada resolusi Mobile (375px/390px) dan Desktop (1440px). Pastikan 0 horizontal scrollbar overflow pada tabel maupun layout dashboard.
7. **Isolasi Kredensial & Anti-Bocor Git**:
   - Seluruh berkas rahasia di direktori `credentials/` (`oauth-client.json`, `token.json`, `service_account.json`) dan `.env.local` wajib diisolasi mutlak dalam `.gitignore`. Dilarang keras melakukan commit berkas kredensial ke GitHub publik.
8. **Zero Em-Dashes**:
   - Seluruh teks antarmuka, notifikasi, dan dokumentasi dilarang menggunakan karakter em-dash. Gunakan tanda hubung biasa (`-`).
9. **Audit Visual Langsung ke Google Chrome Nyata (Direct-to-Chrome Visual Audit Mandate)**:
   - Setiap kali mengerjakan, memperbaiki, atau menambah fitur antarmuka, **DILARANG HANYA MENGASUMSIKAN KODE BENAR SECARA TEORI**.
   - Agen wajib memvalidasi langsung ke browser Google Chrome nyata (`C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe` atau live `https://www.sipasd.my.id`) menggunakan otomasi Playwright (`headless=False` jika user meminta melihat langsung di layar) untuk memastikan:
     * Tata letak hero landing page duduk berdampingan (*side-by-side*) presisi tanpa tumpuk vertikal.
     * Bebas dari horizontal scrollbar overflow (0 overflow pada resolusi mobile 375px s/d desktop 1440px).
     * Seluruh tombol aksi (titik tiga `[...]`, modal SOP/Klasifikasi, tombol hapus logo tong sampah) berfungsi interaktif saat diklik nyata.
     * Hak akses berbasis peran (RBAC): akun staf pengarsip (`Rana Nur Syifa`) terisolasi dari menu admin (`Manajemen Pengguna` dan `Audit Trail`).
     * Nol pesan galat di konsol peramban (`console.error = 0`).

---

## 🛠️ Tumpukan Teknologi & Arsitektur

- **Framework**: Next.js 15 (App Router, Server Components + Client Components terpisah).
- **Bahasa**: TypeScript (Strict mode, no `any`, type safety menyeluruh).
- **Gaya Visual**: Tailwind CSS v4 (Desain formal birokrasi berwibawa, palet hijau zamrud / emerald khas Dispora & Pemprov Kalsel, slate, putih bersih).
- **Basis Data**: TiDB Cloud Serverless (MySQL Driver, 8 Tabel Relasional, SSL strict).
- **Penyimpanan Berkas**: Cloudinary CDN (primer untuk streaming pratinjau instan) & Google Drive (sekunder via OAuth 2.0 akun dinas kuota 5 TB untuk cadangan permanen 420 berkas fisik).
- **Keamanan**: OWASP Top 10 (CSRF protection, XSS escaping, parameter binding PDO/mysql2, MIME validation pada berkas unggahan).

---

## 📋 Struktur Dokumentasi State (In-Repo State Tracking)

Setiap agen yang bekerja pada repositori ini wajib mematuhi pembaruan berkas status berikut:

| Berkas | Fungsi Utama | Waktu Pembaruan |
| :--- | :--- | :--- |
| `task_plan.md` | Rencana tahapan kerja, dependensi modul, dan status checklist (`pending`, `in_progress`, `complete`). | Setiap pergantian fase pengerjaan. |
| `CONSTRAINTS.md`| Kontrak kualitas mutlak *The Floor*, batasan kuantitatif, dan aturan invariant. | Saat penetapan standar kualitas. |
| `PRD.md` | Product Requirements Document komprehensif acuan fitur dan arsitektur produk. | Setiap pembaruan spesifikasi. |
| `findings.md` | Catatan riset, analisis berkas nyata (420 file PDF), struktur data dinas, dan keputusan arsitektur. | Setiap menemukan anomali atau data penting baru. |
| `progress.md` | Log catatan kronologis pekerjaan yang sudah dieksekusi beserta bukti hasil uji. | Sepanjang sesi pengerjaan. |
| `docs/HANDOFF.md` | Ringkasan estafet antar sesi agen: status terakhir, file yang baru disentuh, dan instruksi langkah berikutnya. | Di akhir setiap sesi sebelum handoff. |
| `CHANGELOG.md` | Log rilis resmi mengikuti standar *Keep a Changelog* dan *Conventional Commits*. | Setiap kali sebuah fitur selesai diimplementasikan. |

---

## 🔄 Prosedur Resume Sesi (Session Catch-Up)

Saat sesi baru dimulai:
1. Jalankan `git status` dan periksa `git diff --stat` untuk melihat perubahan berkas yang belum ter-commit.
2. Baca `docs/HANDOFF.md`, `CONSTRAINTS.md`, dan `task_plan.md` untuk mengetahui fase mana yang sedang berjalan.
3. Lanjutkan pengerjaan pada fase tersebut tanpa mengulang analisis dari nol.
4. Setelah pengerjaan selesai, lakukan pengujian build (`npm run build`), pastikan `npm test` lulus 6/6 dan file `src/` <= 200 LOC, lalu commit dengan identitas `Dhani078 <dhanisepeda@gmail.com>` dan mutakhirkan `CHANGELOG.md`.

---

## 📌 Catatan Khusus Fitur Terpasang (Jangan Buat Ulang)
- **5 Tombol Aksi Tabel**: `Lihat PDF`, `Unduh`, `Disposisi`, `Edit`, `Hapus` sudah aktif di `ArchiveTable.tsx`.
- **Edit Modal**: `EditLetterModal.tsx` sudah terhubung ke `PUT /api/letters` dan mutasi TiDB `updateLetter`.
- **Logout**: Logout server-side sudah bersih menggunakan `clearSessionCookie` (maxAge 0, path '/') di `src/lib/auth.ts` dan `GET/POST /api/auth/logout`.
- **Filter Tahun Cerdas**: `YearFilterControl.tsx` sudah menangani masa depan `2027-2200`, rentang historis `2000-2020`, dan input kustom via `matchYearFilter` di `src/lib/format.ts`.
- **Responsif Maxx Mode**: Breakpoint drawer sidebar diatur pada `992px` (iPad portrait dapat 100% lebar kerja tanpa terhimpit sidebar).
- **Landing Page Modern**: `LandingFeatures.tsx` dan `LandingPage.tsx` sudah memiliki live pulse status SPBE, pintasan kata kunci cepat, dan sampel naskah riil 0899.
