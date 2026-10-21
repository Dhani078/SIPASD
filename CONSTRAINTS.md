# CONSTRAINTS: SIPASD QUALITY & ARCHITECTURE CONTRACT
**Kontrak Standar Kualitas Rekayasa Perangkat Lunak & Batasan Sistem**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Pengembang: Muhammad Rizki Ramadhani (2310010406) - S1 TI UNISKA MAB Banjarmasin*

---

## 1. The Floor (Ambang Batas Kualitas Mutlak - Non-Negotiable)

1. **Zero Suppression Comments**:
   - Dilarang menambahkan komentar penekan kesalahan: `@ts-ignore`, `@ts-nocheck`, `eslint-disable`, `# noqa`, `# type: ignore`.
   - Kode harus lolos *typecheck* murni melalui `npx tsc --noEmit`.
2. **Zero Unimplemented Stubs & Empty Handlers**:
   - Dilarang membuat fungsi pura-pura yang melempar kesalahan: `throw new Error("Not implemented")`.
   - Dilarang membuat blok tangkapan kosong yang menelan galat secara diam-diam: `catch (e) {}`. Setiap error wajib dicatat atau ditangani dengan baik.
3. **Modularitas Maksimal (Maks 200 LOC per File)**:
   - Tidak ada satu file komponen UI atau Server Action yang melebihi batas 200 baris kode (kecuali file skema kamus data atau seeder data migrasi).
   - Seluruh prototipe antarmuka di `C:\xampp\htdocs\Laporan Magang\SIPASD Web Application UI (1)` telah dipecah menjadi 18 komponen modular.
4. **Zero Secrets in Git Repository**:
   - Tidak boleh ada password database, token Cloudinary, atau kunci JWT di-hardcode dalam kode yang di-commit ke repositori Git publik.
   - Seluruh rahasia wajib diisolasi di `.env.local` dan dilindungi oleh `.gitignore`.
5. **Identitas Git Wajib**:
   - Seluruh komit wajib menggunakan akun pengembang resmi:
     ```bash
     git config user.name "Dhani078"
     git config user.email "dhanisepeda@gmail.com"
     ```
   - Menggunakan email asli ini adalah syarat mutlak agar kotak hijau kontribusi GitHub aktif. Dilarang memakai dummy email / noreply.
6. **Zero Em-Dashes (` - `)**:
   - Dilarang menggunakan karakter em-dash (` - `) pada seluruh teks antarmuka, judul, lencana, maupun dokumentasi. Gunakan tanda hubung biasa (`-`), tanda kurung, atau titik koma.

---

## 2. Enforced with Numbers (Batasan Terukur dengan Perintah Uji)

| Dimensi Kualitas | Aturan & Ambang Batas | Diperiksa Menggunakan | Waktu Eksekusi |
| :--- | :--- | :--- | :--- |
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
18. `src/data/mockLetters.ts` - 36 rekaman transaksi nyata Dispora Kalsel

---

## 4. Dual-Cloud Storage Invariant

1. **Penyimpanan Primer**: Cloudinary (`cloud_name: vqfpoekg`, folder `sipasd/surat_masuk` dan `sipasd/surat_keluar`). Digunakan untuk streaming dokumen cepat di browser.
2. **Penyimpanan Sekunder**: Google Drive resmi instansi (`arsipdispora2026 / sistem magang`), diakses menggunakan Service Account `sipasd-bot@sipasd.iam.gserviceaccount.com` sebagai cadangan permanen.
