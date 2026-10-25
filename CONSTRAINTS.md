# CONSTRAINTS: SIPASD QUALITY & ARCHITECTURE CONTRACT
**Kontrak Standar Kualitas Rekayasa Perangkat Lunak & Batasan Sistem**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Pengembang: Muhammad Rizki Ramadhani (2310010406) - S1 TI UNISKA MAB Banjarmasin*

---

## 1. The Floor (Ambang Batas Kualitas Mutlak - Non-Negotiable)

1. **ATURAN MUTLAK KONEKSI DATABASE NYATA & PEMBERANTASAN DATA DUMMY (ZERO DUMMY DATA INVARIANT)**:
   - **Dilarang Keras Menggunakan Data Tiruan (Dummy Data)**: Dilarang menampilkan data tiruan statis yang di-hardcode di memori browser (seperti `const letters = Array.from(...)` atau array dummy tiruan di komponen React).
   - **Koneksi Basis Data Nyata Wajib (100% Real Database Connected)**: Seluruh tabel katalog, kartu metrik KPI, grafik volume korespondensi, dropdown filter unit kerja, pencarian kata kunci, dan riwayat disposisi **wajib terhubung dan mengambil data secara real-time dari basis data TiDB Cloud Serverless (`sipasd`)**.
   - **411 Dokumen Arsip Naskah Fisik Riil TA 2026 sebagai Sumber Kebenaran Tunggal**:
     * 170 Surat Masuk pindaian riil TA 2026 di tabel `arsip_surat_masuk`.
     * 241 Surat Keluar pindaian riil TA 2026 di tabel `arsip_surat_keluar`.
     * Seluruh dokumen pindaian PDF tertaut langsung ke URL penyimpanan Cloudinary aktif (`cloud_name: vqfpoekg`) dengan cadangan resmi 100% tersimpan di Google Drive akun dinas kuota 5 TB (subfolder `Surat Masuk` ID: `1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n` & `Surat Keluar` ID: `1rgWCFwULt8awBCVIuomy7cELKqEtbdkx`).
   - **Mutasi Data Nyata & Dual-Storage Otomatis**: Operasi tambah surat baru (*indeks arsip*) wajib mengeksekusi `INSERT` nyata ke tabel TiDB Cloud dan mengunggah berkas asli secara simultan ke Cloudinary (streaming pratinjau) dan Google Drive (cadangan resmi 5 TB). Operasi pencatatan disposisi wajib mengeksekusi `INSERT` ke tabel `riwayat_disposisi`.

2. **Zero Suppression Comments**:
   - Dilarang menambahkan komentar penekan kesalahan: `@ts-ignore`, `@ts-nocheck`, `eslint-disable`, `# noqa`, `# type: ignore`.
   - Kode harus lolos *typecheck* murni melalui `npx tsc --noEmit`.

3. **Zero Unimplemented Stubs & Empty Handlers**:
   - Dilarang membuat fungsi pura-pura yang melempar kesalahan: `throw new Error("Not implemented")`.
   - Dilarang membuat blok tangkapan kosong yang menelan galat secara diam-diam: `catch (e) {}`. Setiap error wajib dicatat atau ditangani dengan baik.

4. **Modularitas Maksimal (Maks 200 LOC per File)**:
   - Tidak ada satu file komponen UI atau Server Action yang melebihi batas 200 baris kode (kecuali file skema kamus data atau seeder data migrasi).
   - Seluruh prototipe antarmuka di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` telah dipecah menjadi 18 komponen modular dan wajib dipertahankan modularitasnya saat dihubungkan ke Next.js 15 App Router.

5. **Zero Secrets & Credentials Isolation in Git Repository**:
   - Tidak boleh ada password database, token Cloudinary, kunci OAuth, refresh token, atau kunci JWT di-hardcode dalam kode yang di-commit ke repositori Git publik.
   - Seluruh rahasia wajib diisolasi di `.env.local` dan direktori `credentials/` (termasuk `oauth-client.json`, `token.json`, `*service*account*.json`) serta dilindungi mutlak oleh `.gitignore`.

6. **Identitas Git Wajib**:
   - Seluruh komit wajib menggunakan akun pengembang resmi:
     ```bash
     git config user.name "Dhani078"
     git config user.email "dhanisepeda@gmail.com"
     ```
   - Menggunakan email asli ini adalah syarat mutlak agar kotak hijau kontribusi GitHub aktif. Dilarang memakai dummy email / noreply.

7. **Zero Em-Dashes**:
   - Dilarang keras menggunakan karakter em-dash pada seluruh teks antarmuka, judul, lencana, maupun dokumentasi. Gunakan tanda hubung biasa (`-`), tanda kurung, atau titik koma.

8. **Audit Visual Nyata Langsung di Google Chrome (Direct-to-Chrome Visual Audit Mandate)**:
   - Dilarang hanya mengandalkan unit test atau compiler output tanpa melihat hasil rendering nyata di peramban.
   - Setiap kali mengerjakan fitur baru atau memoles tampilan, agen wajib memvalidasi langsung ke Google Chrome nyata (`C:\Users\Anomali\AppData\Local\Google\Chrome\Application\chrome.exe` atau live `https://www.sipasd.my.id`).
   - Verifikasi wajib memastikan: layout hero berdampingan (*side-by-side*), 0 horizontal overflow (375px s/d 1440px), modal pop-up interaktif, dan penegakan hak akses RBAC.

---

## 2. Enforced with Numbers (Batasan Terukur dengan Perintah Uji)

| Dimensi Kualitas | Aturan & Ambang Batas | Diperiksa Menggunakan | Waktu Eksekusi |
| :--- | :--- | :--- | :--- |
| **Koneksi Database** | 100% Data ditarik dari TiDB Cloud (0 Dummy Data) | Kueri SQL langsung via `mysql2` | Setiap pemanggilan halaman |
| **Kesesuaian Tipe Data** | 0 Error kompilasi TypeScript | `npx tsc --noEmit` | Setiap perubahan kode |
| **Linter Kerapian Kode** | 0 Error kritis ESLint | `npm run lint` | Sebelum commit |
| **Kerahasiaan Berkas** | Berkas `.env.local` tidak terlacak Git | `git status --ignored` | Setiap commit |
| **Performa Kueri SQL** | Waktu eksekusi pencarian teks $\le$ 500 ms | TiDB Cloud Execution Profiler | Diuji pada 420 berkas |
| **Batas Ukuran Dokumen** | Berkas pindaian scan PDF $\le$ 10 MB per file | Skrip validasi ukuran berkas | Pra-unggah ke cloud |
| **Responsivitas Layar** | 0 Horizontal scrollbar overflow (375px s/d 1440px) | Audit peramban responsif | Pengujian UI |
| **Biaya Operasional** | Biaya bulanan tepat Rp 0,- (Zero Cost Guarantee) | Laporan penagihan Vercel, TiDB, Cloudinary | Selamanya |

---

## 3. Arsitektur Komponen Desain Terverifikasi

Prototipe antarmuka resmi telah dimodularisasi di direktori referensi:  
`C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)`

Daftar 18 Komponen Modular:
1. `src/components/LandingPage.tsx` - Halaman depan publik & lacak nomor agenda
2. `src/components/LoginPage.tsx` - Login dengan tombol tester 1-klik 5 role
3. `src/components/Sidebar.tsx` - Bilah navigasi kiri (#064E3B) & profil Kadis
4. `src/components/TopNavbar.tsx` - Bilah atas dengan pencarian global & jam WITA
5. `src/components/DashboardView.tsx` - 4 kartu KPI, grafik bulanan & donut beban bidang
6. `src/components/ArchiveTable.tsx` - Tabel data padat dengan paginasi 15 baris
7. `src/components/ArchiveWorkspace.tsx` - Panel kerja split-screen arsip surat
8. `src/components/PdfPreviewPanel.tsx` / `DocumentPreview.tsx` - Penampil PDF bawaan peramban
9. `src/components/PrintDisposisiModal.tsx` - Format cetak lembar disposisi A4/F4 Pemprov Kalsel
10. `src/components/NewLetterModal.tsx` - Modal rekam indeks surat baru
11. `src/components/Modal.tsx` - Komponen dialog generik aksesibel
12. `src/components/Badge.tsx` - Lencana status sifat surat berwarna
13. `src/components/Crest.tsx` - Lambang resmi Pemerintah Provinsi Kalimantan Selatan
14. `src/components/CorrespondenceChart.tsx` - Komponen grafik batang korespondensi bulanan
15. `src/components/Icon.tsx` - Koleksi ikon SVG terstandardisasi
16. `src/components/Letter.tsx` - Representasi visual naskah surat fisik kedinasan
17. `src/components/ReferenceViews.tsx` - Tampilan referensi klasifikasi & akun
18. `src/data/mockLetters.ts` - 36 rekaman transaksi nyata Dispora Kalsel (sebagai basis acuan UI sebelum koneksi live TiDB)

---

## 4. Dual-Cloud Storage Invariant

1. **Penyimpanan Primer**: Cloudinary (`cloud_name: vqfpoekg`, folder `sipasd/surat_masuk` dan `sipasd/surat_keluar`). Digunakan untuk streaming dokumen cepat di browser.
2. **Penyimpanan Sekunder**: Google Drive resmi instansi (`arsipdispora2026 / sistem magang`), diakses menggunakan Service Account `sipasd-bot@sipasd.iam.gserviceaccount.com` sebagai cadangan permanen.
