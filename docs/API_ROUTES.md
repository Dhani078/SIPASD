# API & SERVER ACTIONS SPECIFICATION: SIPASD
**Sistem Informasi Pengelolaan Arsip dan Surat Dispora**  
*Arsitektur: Next.js 15 App Router (Route Handlers & Server Actions)*

---

## 🔒 1. Modul Autentikasi (Auth)

### `POST /api/auth/login`
- **Tujuan**: Memvalidasi kredensial pengguna dan menerbitkan cookie sesi terenkripsi.
- **Hak Akses**: Publik (tanpa login).
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "Password123!"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr_99812",
      "nama": "Administrator Dispora",
      "role": "SUPER_ADMIN",
      "unitKerja": "Sekretariat"
    }
  }
  ```
- **Set-Cookie**: `sipasd_session=<JWT_TOKEN>; HttpOnly; Secure; SameSite=Strict; Path=/`

### `POST /api/auth/logout`
- **Tujuan**: Menghapus token sesi aktif dan mencatat log aktivitas logout.
- **Hak Akses**: Terautentikasi (Semua Role).

---

## 📥 2. Modul Surat Masuk (Server Actions & Routes)

### Server Action: `createSuratMasukAction(formData)`
- **Tujuan**: Merekam surat masuk baru, upload berkas PDF ke Cloudflare R2, dan generate No. Agenda.
- **Hak Akses**: `SUPER_ADMIN`, `TU_UMUM`.
- **Payload Form**:
  - `nomorSurat` (string)
  - `tanggalSurat` (YYYY-MM-DD)
  - `tanggalDiterima` (YYYY-MM-DD)
  - `asalInstansi` (string)
  - `perihal` (string)
  - `ringkasanIsi` (string, opsional)
  - `sifatSurat` (enum: `BIASA`, `PENTING`, `SEGERA`, `KILAT`)
  - `filePdf` (File, max 25MB, application/pdf)

### `GET /api/surat-masuk`
- **Tujuan**: Mengambil daftar surat masuk dengan filter pencarian dan paginasi.
- **Query Params**:
  - `q`: Kata kunci (nomor, instansi, perihal)
  - `sifat`: Filter sifat surat
  - `status`: Filter status disposisi
  - `page`: Nomor halaman (default: 1)
  - `limit`: Jumlah data per halaman (default: 15)

### `GET /api/surat-masuk/[id]/stream`
- **Tujuan**: Menghasilkan presigned stream URL untuk membaca berkas PDF di browser secara chunked.
- **Hak Akses**: Terautentikasi (Semua Role).

---

## 🔀 3. Modul Disposisi Elektronik

### Server Action: `createDisposisiAction(formData)`
- **Tujuan**: Menerbitkan lembar disposisi digital oleh pimpinan dinas ke bidang tertentu.
- **Hak Akses**: `SUPER_ADMIN`, `PIMPINAN` (Kepala Dinas / Sekretaris).
- **Payload Form**:
  - `suratMasukId` (string UUID)
  - `kepadaBidangId` (integer)
  - `batasWaktu` (YYYY-MM-DD)
  - `instruksiStandar` (array string: *Tindak lanjuti, Hadiri, Pelajari, dll*)
  - `catatanKhusus` (string)

### Server Action: `updateTindakLanjutAction(formData)`
- **Tujuan**: Bidang pengolah memperbarui status disposisi dan mengisi keterangan hasil pelaksanaan.
- **Hak Akses**: `SUPER_ADMIN`, `BIDANG`.
- **Payload Form**:
  - `disposisiId` (string UUID)
  - `status` (enum: `SEDANG_DIPROSES`, `SELESAI`)
  - `catatanTindakLanjut` (string)

---

## 📤 4. Modul Surat Keluar & Penomoran

### Server Action: `bookingNomorSuratAction(payload)`
- **Tujuan**: Mengambil dan mengunci nomor surat keluar berikutnya secara atomik (mencegah nomor dobel).
- **Hak Akses**: `SUPER_ADMIN`, `TU_UMUM`, `BIDANG`.
- **Payload**:
  ```json
  {
    "kodeKlasifikasiId": 1,
    "bidangPemrakarsaId": 2,
    "perihal": "Undangan Rakor Pembinaan Atlet Daerah",
    "tujuanInstansi": "KONI Provinsi Kalimantan Selatan"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "nomorSurat": "426/0412-Sekr/DISPORA/2026",
    "tanggalBooking": "2026-10-20"
  }
  ```

### Server Action: `uploadFinalSuratKeluarAction(formData)`
- **Tujuan**: Mengunggah berkas scan PDF surat keluar yang sudah ditandatangani dan distempel basah.
- **Hak Akses**: `SUPER_ADMIN`, `TU_UMUM`.

---

## 📊 5. Modul Dashboard & Laporan

### `GET /api/dashboard/stats`
- **Tujuan**: Mengambil matriks agregasi angka untuk kartu ringkasan KPI dan grafik statistik.
- **Hak Akses**: Terautentikasi.
- **Response**:
  ```json
  {
    "totalSuratMasuk": 171,
    "totalSuratKeluar": 249,
    "disposisiAktif": 14,
    "disposisiSelesai": 157,
    "trenBulanan": [
      { "bulan": "Mei", "masuk": 12, "keluar": 35 },
      { "bulan": "Juni", "masuk": 24, "keluar": 52 },
      { "bulan": "Juli", "masuk": 38, "keluar": 48 },
      { "bulan": "Agustus", "masuk": 45, "keluar": 55 },
      { "bulan": "September", "masuk": 32, "keluar": 41 },
      { "bulan": "Oktober", "masuk": 20, "keluar": 18 }
    ],
    "bebanBidang": [
      { "bidang": "Sekretariat", "total": 42 },
      { "bidang": "Pembudayaan Olahraga", "total": 38 },
      { "bidang": "Peningkatan Prestasi", "total": 51 },
      { "bidang": "Sarana & Prasarana", "total": 40 }
    ]
  }
  ```

### `GET /api/laporan/export-excel?jenis=surat-masuk&tahun=2026`
- **Tujuan**: Mengunduh berkas spreadsheet `.xlsx` Buku Agenda Surat Masuk / Keluar resmi kedinasan.
- **Hak Akses**: `SUPER_ADMIN`, `PIMPINAN`, `TU_UMUM`.
