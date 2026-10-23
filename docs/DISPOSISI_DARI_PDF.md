# Penetapan Pejabat Pendisposisi dari Dataset PDF
**SIPASD - Sistem Informasi Pengelolaan Arsip Surat Dispora Kalsel**

Dokumen ini mencatat cara kolom `riwayat_disposisi.pejabat_pendisposisi` diisi ulang supaya sesuai isi berkas PDF asli Dispora (bukan nilai seragam hasil seed).

---

## 1. Masalah yang Ditemukan

Sebelum perbaikan (audit 22 Oktober 2026):

| Temuan | Angka |
|---|---|
| Baris `riwayat_disposisi` | 172 |
| Nilai `pejabat_pendisposisi` unik | 1 (`Pebriadin Hapiz, AP, M.Si`) |
| Baris di backup SQL dengan nama sama | 173 |

Artinya seluruh 172 baris memakai satu nama hasil seed (`docs/DATABASE_SIPASD_BACKUP_2026.sql`), tidak diturunkan dari berkas surat. Tiga titik kode juga masih memasang fallback nama yang sama, sehingga surat tanpa data disposisi tetap tampil atas nama Kepala Dinas:

- `src/lib/letters.ts` (surat masuk dan surat keluar)
- `src/lib/letter-mutations.ts`
- `src/components/PrintDisposisiModal.tsx`

Fallback di ketiga titik sudah diganti menjadi `-` (tampil sebagai `Belum terverifikasi`).

---

## 2. Sumber Data

| Sumber | Jumlah |
|---|---|
| Folder Google Drive `Surat Masuk` | 174 PDF |
| Folder Google Drive `Surat Keluar` | 249 PDF |
| Total berkas diunduh | 423 PDF |

Setelah pengunduhan, tiap PDF diperiksa lapisan teksnya:

| Kondisi | Jumlah |
|---|---|
| Punya lapisan teks (langsung dibaca) | 134 |
| Scan gambar murni (perlu OCR) | 289 |
| Memuat kata "disposisi" di halaman mana pun | 6 |

Karena hanya 6 berkas yang benar-benar memuat halaman lembar disposisi (dan paraf di dalamnya tulisan tangan), pejabat pendisposisi diturunkan dari bagian surat yang bisa dibaca mesin, yaitu blok alamat tujuan (`Yth.` / `Kepada`) dan badan surat.

---

## 3. Proses OCR

1. Rasterisasi halaman 1 setiap berkas scan dengan PyMuPDF pada 150 DPI.
2. OCR dengan `rapidocr-onnxruntime` (4 proses paralel, 8 core).
3. Hasil OCR disimpan bertahap ke JSON agar aman kalau proses terputus.
4. Teks dinormalisasi (spasi dan tanda baca dibuang) karena hasil OCR sering menempelkan kata (contoh `kepaladinaskpemudaan`).

Hasil: 145 berkas scan surat masuk selesai di-OCR, teks tersedia untuk 165 dari 173 berkas (8 berkas sisanya kosong atau gagal).

---

## 4. Aturan Penetapan

Nama diambil dari blok alamat surat lebih dulu, badan surat dipakai sebagai cadangan. Urutan prioritas:

| Prioritas | Pola bukti | Hasil |
|---|---|---|
| 1 | Alamat tujuan memuat nama bidang | Kabid terkait |
| 2 | Alamat tujuan memuat `sekretaris` | Denny Saputra, S.STP |
| 3 | Alamat tujuan memuat `PPK` / `PPTK` / `bendahara` / `penatausahaan` / `kasubbag umum` | Norika Fajriana, SH, MH |
| 4 | Alamat tujuan memuat `kepala dinas` / `kadis` / `kepala SKPD` / `pimpinan Dispora` | Pebriadin Hapiz, AP, M.Si |
| 5 | Badan surat memuat nama bidang | Kabid terkait |
| 6 | Badan surat memuat `sekretaris dispora` / `sekretaris dinas` | Denny Saputra, S.STP |
| 7 | Badan surat memuat peran keuangan dan kata `dispora` | Norika Fajriana, SH, MH |
| 8 | Badan surat memuat `dispora` / `kepemudaan dan olahraga` | Pebriadin Hapiz, AP, M.Si |
| 9 | Tidak ada bukti | `-` (belum terverifikasi) |

Nama yang diizinkan sebagai pendisposisi (sesuai konfirmasi pengguna): Kepala Dinas, Sekretaris, Kasubbag Umum dan Kepegawaian (PPK/PPTK/Bendahara), dan para Kepala Bidang.

---

## 5. Hasil Setelah Penerapan

Pemetaan berkas ke baris basis data memakai nomor agenda pada nama berkas (contoh `0897_3agus_.pdf` ke `0897/SM/DISPORA/2026`).

| Keterangan | Jumlah |
|---|---|
| Baris surat masuk di basis data | 171 |
| Berhasil dicocokkan ke berkas PDF | 170 |
| Baris diubah | 83 |
| Baris disposisi baru dibuat (surat belum punya catatan disposisi) | 2 |
| Berkas PDF tidak ditemukan padanannya | 1 |

Sebaran `pejabat_pendisposisi` setelah perubahan (174 baris, termasuk 1 baris catatan lama yang suratnya sudah tidak ada):

| Pejabat Pendisposisi | Jumlah baris |
|---|---|
| Pebriadin Hapiz, AP, M.Si (Kepala Dinas) | 93 |
| Belum terverifikasi (`-`) | 59 |
| Norika Fajriana, SH, MH (Kasubbag Umum dan Kepegawaian) | 16 |
| Denny Saputra, S.STP (Sekretaris) | 3 |
| Budiono, S.Pd, M.AP (Kabid Pembudayaan Olahraga) | 1 |
| H. Heru Susanto, SE, MM (Kabid Peningkatan Prestasi Olahraga) | 1 |
| Akhmad Syarif, ST, MT (Kabid Sarana dan Prasarana Olahraga) | 1 |

Catatan: 59 baris dibiarkan `-` karena tidak ada bukti yang cukup di berkas. Nilai ini tidak dikarang dan bisa diisi manual dari lembar disposisi kertas.

---

## 6. Keterbatasan

1. Sebagian besar berkas surat masuk adalah scan gambar, sehingga teks bergantung pada mutu OCR.
2. Hanya 6 berkas memuat halaman lembar disposisi, dan paraf serta tulisan tangan di dalamnya tidak terbaca mesin.
3. Folder Google Drive tidak memisahkan surat masuk dan surat keluar secara konsisten (sebagian surat keluar tersimpan di folder surat masuk), sehingga blok alamat sebuah berkas tidak selalu menandakan disposisi.
4. Baris dengan nilai `-` sebaiknya dilengkapi dari arsip fisik lembar disposisi.

### 6.1 Pemeriksaan Halaman Belakang untuk 59 Baris Tanpa Bukti

Untuk memastikan baris `-` memang tidak punya jejak disposisi, dilakukan pemeriksaan lanjutan:

1. Halaman terakhir 26 berkas (dari 59) yang punya lebih dari satu halaman di-OCR ulang.
2. 33 berkas sisanya hanya satu halaman, sehingga isinya sudah tercakup pada OCR halaman pertama.
3. Seluruh teks (halaman pertama + halaman terakhir) disaring dengan dua lapis pola: nama pejabat (tanpa peduli spasi, contoh `pebriadinhapiz`) dan pola longgar (`kepaladinaskepemudaan`, `disposisi`, `sekretaris`, `pptk|ppk|bendahara`).

Hasil pemeriksaan:

| Temuan pada 59 berkas | Jumlah berkas |
|---|---|
| Nama pejabat pendisposisi (Pebriadin, Denny Saputra, Norika Fajriana, Budiono, Heru Susanto, M. Fauzi, Akhmad Syarif) | 0 |
| Kata `disposisi` | 0 |
| Kata `sekretaris` (umumnya karena surat dari atau ditujukan ke Sekretariat) | 16 |
| Peran keuangan (`pptk`, `ppk`, `bendahara`) | 5 |
| Kata `kepala dinas` | 2 |
| Tidak ada pola sama sekali | 36 |

Kesimpulan: 59 baris tersebut tidak memuat bukti yang cukup di berkas PDF, sehingga nilainya tetap `-` (Belum terverifikasi) dan tidak dikarang. Pengisiannya menunggu arsip fisik lembar disposisi atau daftar dari petugas arsip.

---

## 7. Cara Menjalankan Ulang

```bash
# 1. Unduh dataset PDF dari Google Drive (butuh GOOGLE_* di .env.local)
node --env-file=.env.local --import tsx scripts/unduh-pdf-gdrive.mts

# 2. Lihat rencana perubahan tanpa menyentuh basis data
node --env-file=.env.local --import tsx scripts/apply-pejabat-pendisposisi.ts

# 3. Terapkan perubahan (backup nilai lama otomatis ke berkas JSON)
node --env-file=.env.local --import tsx scripts/apply-pejabat-pendisposisi.ts --apply
```

Berkas pendukung yang dihasilkan saat proses (di direktori sementara):

| Berkas | Isi |
|---|---|
| `sipasd_text.json` | Teks halaman pertama dan terakhir tiap PDF |
| `sipasd_ocr_sm_s*.json` | Hasil OCR tiap shard |
| `sipasd_map_sm.json` | Pemetaan berisi agenda, berkas, alamat tujuan, pejabat, dan aturan yang dipakai |
| `disp_plan.json` | Rencana perubahan (nilai lama ke nilai baru) |
| `disp_backup_<timestamp>.json` | Backup nilai `pejabat_pendisposisi` sebelum perubahan |

---

**Terakhir diperbarui**: 22 Oktober 2026
**Pelaksana**: Muhammad Rizki Ramadhani (NPM 2310010406, UNISKA)
**URL produksi**: https://www.sipasd.my.id