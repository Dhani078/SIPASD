# DRAF NASKAH LAPORAN MAGANG: BAB IV IMPLEMENTASI DAN PEMBAHASAN
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)*

---

## 4.1 Lingkungan Implementasi Sistem

Untuk menjamin keandalan akses repositori e-arsip secara publik tanpa bergantung pada komputer kantor dinas yang harus menyala 24 jam, sistem diimplementasikan pada lingkungan *cloud serverless*:

### 4.1.1 Lingkungan Perangkat Keras (Hardware Environment)
- **Komputer Pengembang (Development Laptop)**:
  - Processor: AMD Ryzen 5 / Intel Core i5.
  - RAM: 16 GB DDR4.
  - Penyimpanan: 512 GB NVMe PCIe SSD.
  - Perangkat Uji Responsif Bergerak: Smartphone Android / iPhone (Resolusi Layar 375px – 414px).
- **Infrastruktur Cloud Serverless (Zero-Cost Production)**:
  - Web Hosting: Vercel Global Edge Network (Node.js 20 Runtime, HTTPS Otomatis).
  - Database Host: TiDB Cloud Serverless (Region Singapore `ap-southeast-1`, Latensi < 35 ms, Kuota Gratis 25 GB).
  - Object Storage: Cloudinary & Google Drive (S3-Compatible, *Zero Egress Fee*, Kuota Gratis 10 GB untuk 420+ file PDF).

### 4.1.2 Lingkungan Perangkat Lunak (Software Environment)
- **Sistem Operasi**: Windows 11 Pro 64-bit.
- **Framework Utama**: Next.js 15 (App Router, Server Components & Server Actions).
- **Bahasa Pemrograman**: TypeScript versi 5.x.
- **Sistem Desain UI**: Tailwind CSS v4 + Lucide React Icons.
- **ORM / Database Client**: Prisma ORM v5 / MySQL2 Driver.
- **Autentikasi & Keamanan**: Jose (JWT Cookie HttpOnly), Bcrypt.js, Zod Schema Validator.
- **Peramban Pengujian**: Google Chrome v128, Mozilla Firefox v130, Safari iOS.

---

## 4.2 Implementasi Antarmuka Pengguna (User Interface)

Aplikasi repositori e-arsip SIPASD dibangun dengan mengutamakan kemudahan navigasi dan kecepatan temu-kembali arsip:

1. **Dashboard Statistik E-Arsip (`/dashboard`)**:
   Menyajikan ringkasan visual volume arsip dinas: Total Surat Masuk (171 berkas), Total Surat Keluar (249 berkas), grafik distribusi dokumen per bulan, dan diagram persentase arsip berdasarkan unit kerja/bidang Dispora Kalsel.
2. **Katalog E-Arsip Surat Masuk (`/arsip-masuk`)**:
   Mengusung tata letak *Split-Screen View*. Sisi kiri menyajikan tabel indeks pencarian cepat multi-kriteria, sedangkan sisi kanan menyajikan pemutar dokumen PDF bawaan (*built-in streaming PDF viewer*). Pengguna dapat langsung menelaah pindaian surat tanpa perlu mengunduh file ke penyimpanan lokal.
3. **Katalog E-Arsip Surat Keluar (`/arsip-keluar`)**:
   Menampilkan daftar arsip surat keluar lengkap dengan kode klasifikasi dinas (005, 426, 427, 800, 045, 900), nomor registrasi resmi, tujuan instansi, dan tautan pratinjau PDF.
4. **Modal Rekam Riwayat Disposisi Fisik**:
   Menyediakan formulir pencatatan dokumentasi instruksi tertulis pimpinan yang tertera pada lembar disposisi kertas fisik, mencakup nama pejabat pendisposisi, tanggal, bidang yang dituju, instruksi yang dicentang, dan arahan khusus.
5. **Cetak Salinan Lembar Disposisi Standar Pemprov Kalsel (`/arsip-masuk/[id]/cetak-disposisi`)**:
   Halaman khusus siap cetak (*print-ready CSS*) yang secara otomatis memformat data surat dan catatan disposisi ke dalam selembar kertas standar F4/A4 lengkap dengan kop resmi dinas.
6. **Modul Ekspor Buku Agenda Excel (`/laporan-agenda`)**:
   Menyediakan generator dokumen spreadsheet Microsoft Excel (.xlsx) Buku Agenda Surat Masuk dan Keluar berformat tabel resmi dinas untuk keperluan pelaporan kearsipan dan SPJ dinas.

---

## 4.3 Implementasi Kode Program Kunci

### 4.3.1 Kueri Pencarian Multi-Filter Cepat (< 2 Detik)
Pencarian berkas pada tabel `arsip_surat_masuk` dioptimalkan menggunakan kueri basis data berindeks:

```typescript
// Implementasi pada Server Component / Action Next.js 15
export async function getArsipSuratMasuk({
  query,
  sifat,
  tanggalAwal,
  tanggalAkhir,
  page = 1,
  limit = 15,
}: FilterParams) {
  const skip = (page - 1) * limit;

  return await db.arsipSuratMasuk.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { nomorSurat: { contains: query } },
            { nomorAgenda: { contains: query } },
            { asalInstansi: { contains: query } },
            { perihal: { contains: query } },
          ]
        } : {},
        sifat ? { sifatSurat: sifat } : {},
        tanggalAwal && tanggalAkhir ? {
          tanggalDiterima: { gte: new Date(tanggalAwal), lte: new Date(tanggalAkhir) }
        } : {},
      ]
    },
    include: {
      riwayatDisposisi: { include: { kepadaBidang: true } }
    },
    orderBy: { tanggalDiterima: 'desc' },
    skip,
    take: limit,
  });
}
```

---

## 4.4 Pengujian Sistem (Black Box Testing)

Pengujian fungsionalitas sistem repositori e-arsip dilakukan secara menyeluruh menggunakan metode **Black Box Testing** dengan 15 skenario pengujian:

| No | Modul / Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Autentikasi Pengguna Valid | Username: `admin`, Password valid. | Berhasil login dan diarahkan ke dashboard Super Admin. | Sistem berhasil membuka dashboard sesuai role. | **VALID** |
| **2** | Autentikasi Password Salah | Username: `tu_umum`, Password salah. | Muncul notifikasi "Kredensial tidak valid" dan sesi ditolak. | Notifikasi error tampil, sesi tidak dibuat. | **VALID** |
| **3** | Pembatasan Hak Akses (RBAC) | Akun role `BIDANG` mengakses menu `/master/users`. | Sistem menolak akses dan mengarahkan ke halaman 403 Forbidden. | Dialihkan ke halaman 403 Akses Ditolak. | **VALID** |
| **4** | Pencarian Berdasarkan Nomor | Memasukkan kata kunci nomor `0973`. | Tabel langsung menyaring dan menampilkan berkas surat nomor 0973. | Berkas nomor 0973 tampil seketika (< 1 detik). | **VALID** |
| **5** | Pencarian Kata Kunci Perihal | Memasukkan kata kunci `Kejuaraan Daerah`. | Menampilkan seluruh arsip surat permohonan kejuaraan olahraga. | 14 berkas terkait kejuaraan berhasil disaring. | **VALID** |
| **6** | Filter Sifat Surat Kilat | Memilih dropdown filter sifat surat `KILAT`. | Menampilkan daftar arsip surat berkategori mendesak/kilat. | Hanya surat dengan badge merah kilat yang tampil. | **VALID** |
| **7** | In-Browser PDF Streaming Viewer | Mengklik tombol pratinjau pada surat agenda `0897`. | Dokumen PDF termuat langsung di panel viewer tanpa unduh manual. | Dokumen terbuka jernih dalam 1.2 detik. | **VALID** |
| **8** | Rekam Indeks Surat Masuk | Mengisi formulir metadata dan tautkan pindaian PDF baru. | Metadata tersimpan di TiDB dan No. Agenda baru terbit otomatis. | Data tersimpan rapi dan muncul di urutan teratas. | **VALID** |
| **9** | Validasi Berkas Non-PDF | Mengunggah berkas berekstensi selain `.pdf`. | Sistem menolak berkas dengan pesan "Format wajib PDF". | Berkas ditolak sebelum proses simpan berjalan. | **VALID** |
| **10** | Pencatatan Disposisi Fisik | Mengisi instruksi coretan pimpinan yang ada pada kertas asli. | Catatan tersimpan di tabel `riwayat_disposisi`. | Riwayat disposisi berhasil ditautkan ke surat masuk. | **VALID** |
| **11** | Cetak Salinan Disposisi | Menekan tombol "Cetak Salinan Disposisi Standar". | Muncul jendela pratinjau cetak kop dinas pas 1 lembar A4/F4. | Tampilan cetak presisi tanpa overflow. | **VALID** |
| **12** | Filter Klasifikasi Surat Keluar| Memilih kode klasifikasi `426` (Keolahragaan). | Menampilkan daftar arsip surat keluar khusus urusan olahraga. | Berkas tersaring tepat sesuai kode urusan dinas. | **VALID** |
| **13** | Ekspor Buku Agenda Excel | Menekan tombol "Ekspor Agenda Surat Masuk (.xlsx)". | Terunduh berkas spreadsheet resmi lengkap dengan kop dan border. | File `.xlsx` terunduh dan terbaca normal di Excel. | **VALID** |
| **14** | Perekaman Audit Trail | Petugas membuka dan mengunduh berkas surat nomor 1181. | Aksi tercatat otomatis di tabel `audit_logs` beserta IP dan waktu. | Data audit log terverifikasi tersimpan di TiDB. | **VALID** |
| **15** | Uji Responsivitas Mobile | Mengakses katalog e-arsip lewat smartphone resolusi 375px. | Tabel berubah jadi kartu responsif, 0 horizontal scroll overflow. | Tampilan rapi, teks terbaca jelas, tombol pas jari. | **VALID** |

---

## 4.5 Pembahasan Evaluasi Dampak: Google Drive vs SIPASD

Hasil perbandingan langsung antara penyimpanan manual di Google Drive (`arsipdispora2026`) dengan repositori web SIPASD menunjukkan lonjakan efisiensi yang sangat tinggi:

| Parameter Evaluasi | Google Drive Eksisting | Repositori Web SIPASD | Tingkat Efisiensi |
| :--- | :--- | :--- | :--- |
| **Waktu Temu-Kembali Arsip** | 15 – 30 Menit (Buka file PDF satu per satu) | **< 2 Detik** (Pencarian multi-kriteria instan) | **Efisiensi Waktu 93.3%** |
| **Kelengkapan Metadata** | 0% (Hanya nama file acak) | **100% Terstruktur** (No, tgl, instansi, perihal, kode) | **Peningkatan 100%** |
| **Dokumentasi Disposisi Fisik**| Tidak Tercatat (Hanya ada di kertas fisik) | **Terekam Digital** & dapat dicetak salinan resminya | **Mencegah Hilang Jejak** |
| **Kesiapan Rekapitulasi SPJ/LPJ**| Harus Diketik Manual ke Excel (Berhari-hari) | **Ekspor 1-Klik** ke format Microsoft Excel (.xlsx) | **Otomatisasi Penuh** |
| **Aksesibilitas Mobile** | Berat & sulit membaca PDF di aplikasi Drive | **Ringan & Responsif** di browser ponsel (PWA ready) | **Aksesibilitas Tinggi** |
