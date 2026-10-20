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
