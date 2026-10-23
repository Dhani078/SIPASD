# Pengisian Metadata Surat dari Dataset PDF
**SIPASD - Sistem Informasi Pengelolaan Arsip Surat Dispora Kalsel**

Dokumen ini mencatat cara kolom metadata surat (nomor surat, tanggal surat, asal/tujuan instansi, perihal) diisi dari berkas PDF asli Dispora, menggantikan nilai placeholder hasil seed.

---

## 1. Masalah yang Ditemukan

Audit 22 Oktober 2026 menemukan metadata surat masuk dan surat keluar masih berisi nilai buatan yang sama untuk hampir semua baris:

| Kolom | Nilai placeholder | Jumlah baris |
|---|---|---|
| `arsip_surat_masuk.nomor_surat` | `NOMOR/<agenda>/DISPORA/2026` | 170 dari 170 |
| `arsip_surat_masuk.perihal` | `Surat Masuk Terkait Agenda No. <agenda> Dispora Prov. Kalsel` | 167 dari 170 |
| `arsip_surat_masuk.asal_instansi` | `Instansi Pemerintah / Pengprov Cabang Olahraga Kalsel` | 168 dari 170 |
| `arsip_surat_masuk.ringkasan_isi` | nama berkas (contoh `0897(3agus).pdf`) | 170 dari 170 |
| `arsip_surat_keluar.perihal` | `Surat Keluar Dispora: <agenda>` | 241 dari 241 |
| `arsip_surat_keluar.tujuan_instansi` | `KONI Kalsel / Pengurus Cabang Olahraga / Instansi Terkait` | 241 dari 241 |

Nilai ini tidak berasal dari berkas surat, sehingga tidak bisa dipertanggungjawabkan saat audit arsip.

---

## 2. Sumber dan Cara Baca

Seluruh 423 berkas PDF dataset Dispora (174 surat masuk, 249 surat keluar) dibaca dalam dua jalur:

1. **Lapisan teks (`pymupdf`)**: 134 berkas punya teks langsung, termasuk berkas hasil pindai yang sudah pernah di-OCR oleh pengolah sebelumnya.
2. **OCR (`rapidocr-onnxruntime`)**: 289 berkas pindai di-OCR pada 150 DPI, halaman 1 saja, dijalankan 4 proses paralel (mesin 8 core). Hasil untuk 145 berkas surat masuk dan 144 berkas surat keluar.

Teks hasil OCR sering menempelkan kata (contoh `kepaladinaskepemudaan`), sehingga setiap pola pencocokan dinormalisasi lebih dulu: huruf kecil, tanpa spasi dan tanda baca.

---

## 3. Aturan Pengambilan Tiap Kolom

| Kolom | Pola yang dipakai | Catatan |
|---|---|---|
| Nomor surat | `Nomor : <nomor>` dengan syarat mengandung `/` dan angka, panjang 6 sampai 44 karakter | Dipotong pada kata pertama `Lampiran`, `Sifat`, `Tanggal`, `Hal` |
| Tanggal surat | `Banjarmasin/Banjarbaru/Martapura, <tgl> <bulan> <tahun>` lebih diutamakan, lalu pola tanggal umum | Hanya tahun 2025 dan 2026 yang diterima |
| Perihal | `Hal : <isi>` atau `Perihal : <isi>` dengan varian OCR (`Hat`, `HaI`) | Dipotong pada `Yth`, `Kepada`, `Sifat`, `Lampiran`, `Tembusan` |
| Asal instansi (surat masuk) | Blok kop surat bagian atas, dicocokkan ke daftar nama instansi baku | Contoh: `SEKRETARIAT DAERAH` menjadi `Sekretariat Daerah Prov. Kalimantan Selatan` |
| Tujuan instansi (surat keluar) | Blok `Yth.` atau `Kepada`, lalu dicocokkan ke daftar nama instansi baku | Nilai yang hanya berisi `PIHAK KEDUA`, `Yth`, atau nama terlalu pendek dibuang |

Setiap nilai melewati penyaring mutu (`is_clean`): menolak teks bergaris baca OCR (`*`, `{}`, `\`), teks yang lebih dari 40 persen angkanya, teks tanpa spasi sepanjang lebih dari 24 karakter, dan teks dengan rasio huruf vokal di bawah 25 persen.

---

## 4. Hasil

### Surat Masuk (170 baris)

| Kolom | Terisi dari PDF | Persentase |
|---|---|---|
| `nomor_surat` | 73 | 43% |
| `tanggal_surat` | 76 | 45% |
| `asal_instansi` | 99 | 58% |
| `perihal` | 110 | 65% |

Baris yang tidak terbaca diberi tanda `-` (tampil sebagai `Belum terverifikasi` pada antarmuka), bukan nilai karangan.

### Surat Keluar (241 baris)

| Kolom | Terisi dari PDF | Persentase |
|---|---|---|
| `nomor_surat` | 61 (sisanya penanda `TIDAK TERBACA/<agenda>` atau nilai lama untuk 16 surat tanpa berkas cocok) | 25% |
| `tanggal_surat` | 106 | 44% |
| `tujuan_instansi` | 81 | 34% |
| `perihal` | 71 | 29% |

Catatan: `arsip_surat_keluar.nomor_surat` bersifat unik dan tidak boleh kosong, sehingga baris tanpa hasil ekstraksi memakai penanda `TIDAK TERBACA/<nomor agenda>`.

### Contoh hasil

| Nomor agenda | Nomor surat | Tanggal | Asal / tujuan | Perihal |
|---|---|---|---|---|
| 0899/SM/DISPORA/2026 | 400.8.1/01549/Kesra/2026 | 2026-07-31 | Sekretariat Daerah Prov. Kalimantan Selatan | Pelaksanaan Kegiatan Bersih-Bersih Masjid dalam Rangka Hari Jadike-76Provinsi Kalimantan Selatan |
| 0900/SM/DISPORA/2026 | 002/07/BKS/2026 | 2026-07-23 | BBoy Kalimantan Selatan Association | Permohonan Bantuan Akomodasi Keberangkatan Atlit Bboy Kal Sel |
| 3802/SK/DISPORA/2026 | 900/38oL/Dispora/2026 | 2026-03-01 | Bank Kalsel | Permohonan Cetak Rekening Koran |
| 4304/SK/DISPORA/2026 | 800.2.2/4304/DISPORA/2026 | 2026-05-20 | Badan Kepegawaian Daerah Prov. Kalimantan Selatan | Usulan Peserta Pelatihan Fungsional Perencana |

Contoh di atas sengaja ditampilkan apa adanya, termasuk sisa derau OCR pada perihal surat 0899 (`Hari Jadike-76Provinsi`), supaya jelas bahwa nilai belum dirapikan manual.

Jejak lengkap per baris ada di `docs/METADATA_SURAT_MASUK_2026.csv` dan `docs/METADATA_SURAT_KELUAR_2026.csv` (kolom `terbaca` menunjukkan berapa kolom yang berhasil diisi dari berkas).

---

## 5. Keterbatasan

1. 289 dari 423 berkas adalah pindai tanpa lapisan teks, sehingga hasil bergantung mutu OCR; sebagian nilai masih mengandung sisa derau OCR (contoh `900/ SSot /Disporai2026`) dan perlu dikoreksi manual.
2. Sebagian berkas tidak memuat kepala surat lengkap (berkas dimulai dari lampiran atau proposal), sehingga nomor, asal, dan perihal tidak bisa diambil.
3. `ringkasan_isi` masih berisi nama berkas dan belum diisi ulang; untuk mengisinya perlu peringkasan isi surat, bukan sekadar pencocokan pola.
4. Kolom `tahun`, `nomor_urut`, dan `kode_klasifikasi` pada surat keluar belum ditinjau ulang.

---

## 6. Cara Menjalankan Ulang

```bash
# 1. Unduh dataset PDF dari Google Drive
node --env-file=.env.local --import tsx scripts/unduh-pdf-gdrive.mts

# 2. Ekstraksi teks dan OCR (skrip di direktori kerja sementara, lihat bagian 7)

# 3. Lihat rencana perubahan tanpa menyentuh basis data
node --env-file=.env.local --import tsx scripts/apply-meta-dari-pdf.ts sm
node --env-file=.env.local --import tsx scripts/apply-meta-dari-pdf.ts sk

# 4. Terapkan (backup nilai lama otomatis ke berkas JSON di direktori sementara)
node --env-file=.env.local --import tsx scripts/apply-meta-dari-pdf.ts sm --apply
node --env-file=.env.local --import tsx scripts/apply-meta-dari-pdf.ts sk --apply
```

---

## 7. Berkas Pendukung di Direktori Sementara

| Berkas | Isi |
|---|---|
| `sipasd_all/sm`, `sipasd_all/sk` | 423 berkas PDF hasil unduhan |
| `sipasd_text.json` | Teks halaman pertama dan terakhir tiap berkas |
| `sipasd_ocr_sm_s*.json`, `sipasd_ocr_sk_s*.json` | Hasil OCR per shard |
| `sipasd_meta_sm.json`, `sipasd_meta_sk.json` | Hasil ekstraksi metadata per berkas |
| `meta_plan_*.json` | Rencana perubahan per tabel |
| `meta_backup_*_<timestamp>.json` | Backup nilai lama sebelum perubahan |

---

## 8. Dokumen Terkait

- `docs/DISPOSISI_DARI_PDF.md` - pengisian kolom pejabat pendisposisi dari berkas PDF
- `docs/DATABASE_SCHEMA.md` - kamus data tabel `arsip_surat_masuk` dan `arsip_surat_keluar`
- `docs/DISPOSISI_MAPPING_2026.csv` - jejak pemetaan pejabat pendisposisi

---

**Terakhir diperbarui**: 22 Oktober 2026
**Pelaksana**: Muhammad Rizki Ramadhani (NPM 2310010406, UNISKA)
**URL produksi**: https://www.sipasd.my.id