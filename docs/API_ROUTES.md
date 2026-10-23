# API & SERVER ACTIONS SPECIFICATION: SIPASD
**Sistem Informasi Pengelolaan Arsip Surat Dispora (Repositori E-Arsip Digital)**  
*Arsitektur: Next.js 15 App Router (Route Handlers & Server Actions)*

---

## 🔒 1. Modul Autentikasi (Auth)

### `POST /api/auth/login`
- **Tujuan**: Memvalidasi kredensial pengguna dan menerbitkan cookie sesi terenkripsi.
- **Request Body**:
  ```json
  {
    "username": "tu_umum",
    "password": "Password123!"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_99812",
      "nama": "Staf Pengelola Arsip TU",
      "role": "PETUGAS_ARSIP",
      "unitKerja": "Subbag Umum & Kepegawaian"
    }
  }
  ```
- **Set-Cookie**: `sipasd_session=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Path=/`

---

## 📥 2. Modul E-Arsip Surat Masuk

### `GET /api/arsip-masuk`
- **Tujuan**: Mengambil daftar arsip surat masuk dengan filter pencarian instan (< 2 detik) dan paginasi.
- **Query Params**:
  - `q`: Kata kunci pencarian (Nomor Surat, Agenda, Instansi, Perihal)
  - `sifat`: Filter sifat surat (`BIASA`, `PENTING`, `SEGERA`, `KILAT`)
  - `tgl_awal` & `tgl_akhir`: Filter rentang tanggal
  - `page`: Nomor halaman (default: 1)
  - `limit`: Jumlah data per halaman (default: 15)

### `POST /api/arsip-masuk/indeks` (Server Action)
- **Tujuan**: Mengindeks metadata berkas surat masuk pindaian baru dari Google Drive ke database TiDB.
- **Payload Form**:
  - `nomorSurat` (string)
  - `tanggalSurat` (YYYY-MM-DD)
  - `tanggalDiterima` (YYYY-MM-DD)
  - `asalInstansi` (string)
  - `perihal` (string)
  - `ringkasanIsi` (string, opsional)
  - `sifatSurat` (enum)
  - `filePdf` (File pindaian PDF)

### `GET /api/arsip-masuk/[id]/stream`
- **Tujuan**: Menghasilkan presigned URL untuk streaming dokumen PDF pindaian langsung di panel viewer peramban.

---

## 📝 3. Modul Riwayat Disposisi Fisik

### `POST /api/riwayat-disposisi/catat` (Server Action)
- **Tujuan**: Merekam dokumentasi coretan arahan lembar disposisi fisik yang tertera pada naskah surat pindaian.
- **Payload Form**:
  - `suratMasukId` (string UUID)
  - `pejabatPendisposisi` (string: contoh *Pebriadin Hapiz, AP, M.Si*)
  - `tanggalDisposisi` (YYYY-MM-DD)
  - `kepadaBidangId` (integer)
  - `instruksiTercatat` (string: *Tindak lanjuti / Pelajari / Hadiri / Koordinasikan*)
  - `catatanTertulis` (string: arahan tulisan tangan pimpinan)
  - `statusPenyelesaian` (enum: `BELUM_DIPROSES`, `PROSES`, `SELESAI`)

---

## 📤 4. Modul E-Arsip Surat Keluar

### `GET /api/arsip-keluar`
- **Tujuan**: Mengambil daftar arsip surat keluar dengan filter kode klasifikasi (005, 426, 427, 800, 045, 900) dan pencarian instan.

### `POST /api/arsip-keluar/indeks` (Server Action)
- **Tujuan**: Mengindeks metadata berkas pindaian surat keluar resmi yang telah ditandatangani dan distempel basah.

---

## 📊 5. Modul Dashboard & Ekspor Agenda Excel

### `GET /api/dashboard/stats`
- **Tujuan**: Mengambil ringkasan volume arsip digital (171 Surat Masuk, 249 Surat Keluar), grafik bulanan, dan persentase unit kerja.

### `GET /api/laporan/export-excel?jenis=surat-masuk&tahun=2026`
- **Tujuan**: Mengunduh berkas spreadsheet `.xlsx` Buku Agenda Surat Masuk / Keluar resmi kedinasan.

---

## 6. Endpoint yang Benar-Benar Aktif di Repositori

Daftar di bawah ini adalah rute yang terpasang pada kode saat ini (folder `src/app/api/`).

| Rute | Metode | Fungsi | Penjagaan Sesi |
|---|---|---|---|
| `/api/auth/login` | POST | Validasi kredensial, terbitkan cookie `sipasd_session` | Tidak perlu |
| `/api/auth/logout` | POST | Hapus cookie sesi | Tidak perlu |
| `/api/letters` | GET | Kirim seluruh arsip surat masuk dan keluar ke antarmuka | Tidak perlu untuk baca |
| `/api/letters` | POST | Tambah arsip surat baru (nomor, instansi, perihal wajib) | Wajib |
| `/api/letters` | DELETE | Hapus satu atau banyak arsip (`id`, `ids`, `direction`) | Wajib |
| `/api/expedition` | GET | Daftar catatan buku ekspedisi surat keluar | Tidak perlu |
| `/api/expedition` | POST | Catat atau ubah distribusi ekspedisi (upsert per surat keluar) | Wajib |
| `/api/pdf` | GET | Streaming PDF dari Cloudinary dengan tanda tangan anti-401 | Tidak perlu |
| `/api/upload` | POST | Unggah berkas ke Cloudinary dan cadangan ke Google Drive | Wajib |

### `POST /api/expedition`
- **Tujuan**: Menyimpan catatan distribusi fisik surat keluar ke tabel `buku_ekspedisi` (satu catatan per surat, `ON DUPLICATE KEY UPDATE`).
- **Request Body**:
  ```json
  {
    "surat_keluar_id": "0932b756-a103-43ec-9b70-1b0b0d34c538",
    "tanggal_kirim": "2026-10-22",
    "kurir_pengirim": "Staf TU",
    "penerima_nama": "Petugas Bank Kalsel",
    "penerima_telepon": "0812-0000-1111",
    "catatan_ekspedisi": "Diterima langsung di loket"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Distribusi surat 3802/SK/DISPORA/2026 berhasil dicatat",
    "nomor_agenda": "3802/SK/DISPORA/2026"
  }
  ```
- **Validasi**: `surat_keluar_id`, `tanggal_kirim` (format `YYYY-MM-DD`), `kurir_pengirim`, dan `penerima_nama` wajib; surat keluar harus ada di basis data; aksi dicatat ke `audit_logs` sebagai `CATAT_EKSPEDISI`.
