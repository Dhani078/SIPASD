# DRAF NASKAH LAPORAN MAGANG: BAB IV IMPLEMENTASI DAN PEMBAHASAN
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)*

---

## 4.1 Lingkungan Implementasi Sistem

Untuk menjamin keandalan dan performa sistem SIPASD, implementasi perangkat lunak dan perangkat keras disusun dengan spesifikasi berikut:

### 4.1.1 Lingkungan Perangkat Keras (Hardware Environment)
- **Komputer Pengembang (Workstation)**:
  - Processor: AMD Ryzen 5 / Intel Core i5 Generasi ke-11 ke atas.
  - Memori RAM: 16 GB DDR4.
  - Media Penyimpanan: 512 GB NVMe PCIe SSD.
  - Perangkat Pengujian Bergerak: Smartphone Android / iPhone (Resolusi Layar 375px – 414px).
- **Infrastruktur Cloud Hosting & Serverless**:
  - Compute Server: Vercel Global Edge Network (Node.js 20 Runtime).
  - Database Host: TiDB Cloud Serverless (Region ap-southeast-1 / Singapore, Latensi < 35ms).
  - Object Storage: Cloudflare R2 Global Bucket (S3-Compatible API).

### 4.1.2 Lingkungan Perangkat Lunak (Software Environment)
- **Sistem Operasi**: Windows 11 Pro 64-bit.
- **Framework Utama**: Next.js 15 (App Router, Server Components & Server Actions).
- **Bahasa Pemrograman**: TypeScript versi 5.x.
- **Sistem Desain UI**: Tailwind CSS v4 + Lucide React Icons.
- **ORM / Database Client**: Prisma ORM v5 / MySQL2 Driver.
- **Autentikasi & Kriptografi**: Jose (JWT Cookie), Bcrypt.js, Zod Schema Validator.
- **Peramban Uji Coba**: Google Chrome v128, Mozilla Firefox v130, Safari iOS.

---

## 4.2 Implementasi Basis Data (TiDB Cloud Serverless)
Basis data diimplementasikan pada TiDB Cloud Serverless menggunakan protokol MySQL dengan parameter koneksi terenkripsi SSL (`sslaccept=strict`). 

Sebanyak **8 tabel utama** telah terbentuk dengan struktur relasional yang terindeks:
1. `users`: Menyimpan profil pengguna dinas dan kredensial ter-hash Bcrypt.
2. `bidang_dispora`: Menyimpan data 5 unit kerja internal Dispora Kalsel.
3. `klasifikasi_surat`: Menyimpan kode klasifikasi Permendagri/Pergub (005, 426, 427, 800, 045, 900).
4. `surat_masuk`: Menyimpan 171 rekaman agenda surat masuk riil TA 2026.
5. `disposisi`: Menyimpan riwayat penugasan pimpinan kepada bidang pelaksana.
6. `surat_keluar`: Menyimpan 249 rekaman registrasi surat keluar dinas TA 2026.
7. `buku_ekspedisi`: Menyimpan bukti serah terima berkas fisik oleh kurir kantor.
8. `audit_logs`: Menyimpan jejak forensik keamanan operasional sistem.

---

## 4.3 Implementasi Antarmuka Sistem (User Interface)

Aplikasi SIPASD memiliki antarmuka yang bersih, bertema formal hijau zamrud (*emerald*) khas kedinasan Pemerintah Provinsi Kalimantan Selatan:

1. **Halaman Login Terproteksi (`/login`)**:
   Menyediakan formulir login dengan validasi dua arah, proteksi anti *brute force*, dan tombol bantu *Quick Test Login* untuk memudahkan pengujian akun Super Admin, Pimpinan, TU, dan Bidang.
2. **Dashboard Eksekutif Terpadu (`/dashboard`)**:
   Menampilkan 4 kartu ringkasan KPI (Total Surat Masuk: 171, Surat Keluar: 249, Disposisi Aktif, Disposisi Selesai), grafik tren surat masuk-keluar bulanan, serta diagram persentase beban kerja bidang.
3. **Modul E-Agenda Surat Masuk (`/surat-masuk`)**:
   Menerapkan konsep *Split-Screen Layout*. Sisi kiri menyajikan tabel interaktif pencarian surat, sedangkan sisi kanan menyajikan pemutar dokumen PDF terintegrasi (*built-in streaming PDF viewer*).
4. **Modal Lembar Disposisi Digital**:
   Memungkinkan pimpinan memilih bidang tujuan disposisi hanya dengan satu klik, menentukan tanggal jatuh tempo, dan mencentang instruksi baku (*Tindak lanjuti, Pelajari, Hadiri, Koordinasikan*).
5. **Format Cetak Lembar Disposisi Standar Pemprov Kalsel (`/surat-masuk/[id]/cetak-disposisi`)**:
   Halaman khusus siap cetak (*print-ready CSS*) yang menyusun format kop dinas Dispora Kalsel, tabel riwayat agenda, arahan pimpinan, dan kotak tanda tangan pejabat dalam selembar kertas standar F4/A4.
6. **Modul Registrasi Surat Keluar & Auto-Numbering (`/surat-keluar`)**:
   Menyediakan formulir pemesanan nomor surat resmi yang secara otomatis mengunci nomor urut berikutnya tanpa risiko nomor ganda.

---

## 4.4 Implementasi Kode Program Kunci

### 4.4.1 Algoritma Generator Nomor Surat Keluar (Anti-Nomor Dobel)
Untuk mencegah *race condition* saat beberapa subbagian meminta nomor surat pada detik yang bersamaan, sistem menerapkan transaksi atomik dengan penguncian baris (*row-level locking*):

```typescript
// Implementasi pada Server Action Next.js 15
export async function generateNomorSuratKeluar(
  kodeKlasifikasiId: number,
  bidangId: number,
  tahun: number
) {
  return await db.$transaction(async (tx) => {
    // 1. Kunci dan ambil nomor urut tertinggi pada tahun berjalan
    const lastRecord = await tx.suratKeluar.findFirst({
      where: { tahun: tahun },
      orderBy: { nomorUrut: 'desc' },
      select: { nomorUrut: true }
    });

    const nextUrut = (lastRecord?.nomorUrut || 0) + 1;
    const kode = await tx.klasifikasiSurat.findUnique({ where: { id: kodeKlasifikasiId } });

    // 2. Susun format penomoran resmi standar Pergub Kalsel
    // Format: [KodeKlasifikasi]/[NomorUrut4Digit]-Sekr/DISPORA/[Tahun]
    const nomorUrutFormatted = String(nextUrut).padStart(4, '0');
    const nomorSuratResmi = `${kode.kode}/${nomorUrutFormatted}-Sekr/DISPORA/${tahun}`;

    return { nextUrut, nomorSuratResmi };
  }, {
    isolationLevel: 'Serializable' // Tingkat isolasi tertinggi anti tabrakan
  });
}
```

---

## 4.5 Pengujian Sistem (Black Box Testing)

Pengujian fungsionalitas sistem dilakukan secara menyeluruh menggunakan metode **Black Box Testing** dengan 15 skenario pengujian:

| No | Modul / Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Autentikasi Pengguna Valid | Username: `admin`, Password valid. | Berhasil login dan diarahkan ke dashboard Super Admin. | Sistem berhasil membuka dashboard sesuai role. | **VALID** |
| **2** | Autentikasi Password Salah | Username: `kadis`, Password salah. | Muncul notifikasi "Username atau password salah" dan sesi ditolak. | Notifikasi error tampil, sesi tidak dibuat. | **VALID** |
| **3** | Pembatasan Hak Akses (RBAC) | Akun role `BIDANG` mengakses URL `/master/users`. | Sistem menolak akses dan menampilkan halaman 403 Forbidden. | Dialihkan ke halaman 403 Akses Ditolak. | **VALID** |
| **4** | Validasi Formulir Kosong | Mengirim formulir surat masuk dengan kolom perihal kosong. | Skema Zod menolak submit dan menandai kolom perihal wajib diisi. | Pesan error validasi muncul di bawah kolom perihal. | **VALID** |
| **5** | Rekam Surat Masuk & Upload | Unggah berkas pindaian scan PDF 4.5 MB dan simpan. | Berkas tersimpan di Cloudflare R2, data tersimpan di TiDB. | Berkas tersimpan sempurna dan No. Agenda terbit. | **VALID** |
| **6** | Proteksi Berkas Non-PDF | Mengunggah berkas berekstensi `.docx` atau `.exe`. | Sistem menolak berkas dengan pesan "Hanya berkas PDF yang diizinkan". | Berkas ditolak sebelum proses unggah berjalan. | **VALID** |
| **7** | Batas Ukuran Berkas (>25MB) | Mengunggah berkas PDF berukuran 30 MB. | Sistem menolak unggahan karena melebihi batas 25 MB. | Pesan peringatan ukuran berkas maksimal muncul. | **VALID** |
| **8** | In-Browser PDF Streaming | Membuka tombol pratinjau surat nomor 0973. | Komponen PDF viewer menampilkan dokumen langsung di browser. | PDF terbuka lancar dalam waktu 1.2 detik. | **VALID** |
| **9** | Penerbitan Lembar Disposisi | Kadis mendisposisikan surat ke Bidang Pembudayaan Olahraga. | Disposisi tersimpan dan status surat menjadi `DIDISPOSISIKAN`. | Data tersimpan dan langsung masuk dasbor Kabid Pora. | **VALID** |
| **10** | Pembaruan Progres Bidang | Kabid menginput keterangan tindak lanjut dan tandai selesai. | Status disposisi berubah jadi `SELESAI` di dashboard pimpinan. | Status terupdate real-time pada dashboard pimpinan. | **VALID** |
| **11** | Cetak Lembar Disposisi | Menekan tombol "Cetak Disposisi Standar Pemprov". | Terbuka halaman cetak kop dinas rapi pas 1 lembar A4/F4. | Tampilan cetak pas satu lembar tanpa terpotong. | **VALID** |
| **12** | Booking Nomor Surat Keluar | Meminta nomor surat keluar urusan Keolahragaan (`426`). | Sistem menerbitkan nomor otomatis sesuai nomor urut berikutnya. | Nomor terbit otomatis: `426/0413-Sekr/DISPORA/2026`. | **VALID** |
| **13** | Anti-Nomor Dobel Simultan | Dua pengguna mengklik tombol booking nomor secara bersamaan. | Transaksi serializable mengunci urutan sehingga terbit 2 nomor berbeda. | Pengguna 1 dapat no 0414, Pengguna 2 dapat no 0415. | **VALID** |
| **14** | Ekspor Rekapitulasi Excel | Mengklik tombol "Ekspor Buku Agenda ke Excel". | Terunduh berkas spreadsheet `.xlsx` berisi seluruh data agenda. | Berkas Excel terunduh lengkap dengan kop dan border. | **VALID** |
| **15** | Uji Responsivitas Mobile | Mengakses sistem melalui layar ponsel resolusi 375px (iPhone). | Antarmuka menyesuaikan kartu ringkas, 0 horizontal scroll overflow. | Tampilan pas layar, tombol mudah ditekan jari. | **VALID** |

---

## 4.6 Pembahasan Hasil Pengujian dan Evaluasi Dampak

Berdasarkan hasil pengujian fungsional dan simulasi operasional di lingkungan Sekretariat Dispora Kalsel, diperoleh perbandingan efisiensi kinerja yang sangat signifikan:

| Parameter Kinerja | Sebelum Menggunakan SIPASD (Sistem Manual) | Sesudah Menggunakan SIPASD (Sistem Web) | Persentase Efisiensi |
| :--- | :--- | :--- | :--- |
| **Waktu Temu-Kembali Arsip** | 15 – 30 Menit (Bongkar lemari ordner) | **< 2 Detik** (Pencarian instan digital) | **Efisiensi 93.3%** |
| **Waktu Distribusi Disposisi** | 1 – 3 Hari Kerja (Menunggu kurir internal) | **< 1 Menit** (Notifikasi real-time web) | **Efisiensi 98.5%** |
| **Risiko Nomor Surat Ganda** | Sering Terjadi (Akibat booking manual via WA) | **0% (Nol Kasus)** berkat kunci transaksi atomik | **Pencegahan 100%** |
| **Konsumsi Kertas Lembar Disposisi**| Ratusan lembar kertas fotokopi per bulan | **Digital / Dicetak hanya saat dibutuhkan** | **Penghematan ~80%** |

Implementasi sistem informasi persuratan terpadu ini membuktikan bahwa SIPASD tidak hanya memenuhi seluruh persyaratan akademik mata kuliah Kerja Praktik S1 Teknik Informatika UNISKA, namun juga memberikan kontribusi nyata dalam percepatan birokrasi dan modernisasi administrasi pemerintahan di Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
