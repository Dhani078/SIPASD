# API & ROUTE HANDLERS SPECIFICATION: SIPASD
**Sistem Informasi Pengelolaan Arsip Surat Dispora Provinsi Kalimantan Selatan**  
*Arsitektur: Next.js 15 App Router Production Route Handlers*  
*Base URL Produksi: `https://www.sipasd.my.id/api`*  
*Pengembang: Muhammad Rizki Ramadhani (Dhani078 / dhanisepeda@gmail.com)*

---

## Ringkasan Matriks Endpoint API Produksi

| No | Rute Endpoint | Metode HTTP | Deskripsi Fungsionalitas | Otorisasi RBAC | Efek Audit Trail |
|---|---|---|---|---|---|
| **1** | `/api/auth/login` | `POST` | Validasi kredensial pengguna, anti-brute force, terbitkan cookie JWT | Publik (Guest) | `LOGIN_SUCCESS`, `LOGIN_FAILED` |
| **2** | `/api/auth/logout` | `POST`, `GET` | Hapus cookie sesi terenkripsi dan log sesi keluar | Sesi Aktif | `LOGOUT` |
| **3** | `/api/letters` | `GET` | Ambil 411 arsip digital riil TA 2026 dari TiDB Cloud | Publik / Aparatur | Tidak ada |
| **4** | `/api/letters` | `POST` | Rekam indeks naskah dinas baru dengan transaksi atomik `FOR UPDATE` | `SUPER_ADMIN`, `PETUGAS_ARSIP` | `BUAT_ARSIP` |
| **5** | `/api/letters` | `PUT` | Perbarui metadata naskah dinas, file CDN/Drive, dan disposisi | `SUPER_ADMIN`, `PETUGAS_ARSIP` | `EDIT_ARSIP` |
| **6** | `/api/letters` | `DELETE` | Hapus tunggal/massal arsip via ID multi-format (UUID/Agenda) | `SUPER_ADMIN`, `PETUGAS_ARSIP` | `HAPUS_ARSIP` |
| **7** | `/api/upload` | `POST` | Unggah ganda (Dual-Upload) berkas PDF ke Cloudinary CDN & Google Drive | `SUPER_ADMIN`, `PETUGAS_ARSIP` | `UNGGAH_BERKAS` |
| **8** | `/api/pdf` | `GET` | Penyalur streaming buffer PDF aman dari Cloudinary (SAMEORIGIN) | Publik / Aparatur | Tidak ada |
| **9** | `/api/expedition` | `GET` | Ambil seluruh rekam jejak distribusi fisik surat keluar dinas | Sesi Aktif | Tidak ada |
| **10** | `/api/expedition` | `POST` | Catat atau perbarui bukti distribusi fisik surat keluar (Upsert) | `SUPER_ADMIN`, `PETUGAS_ARSIP` | `CATAT_EKSPEDISI` |
| **11** | `/api/audit` | `GET` | Ekstraksi 100 log forensik aktivitas sistem dari TiDB Cloud | `SUPER_ADMIN` (Strict) | Tidak ada |
| **12** | `/api/ai/suggest` | `POST` | Klasifikasi teks perihal dinas berbasis Permendagri No. 83/2022 | Publik / Staf | Tidak ada |

---

## 1. Modul Otentikasi & Keamanan Sesi

### `POST /api/auth/login`
- **Tujuan**: Memverifikasi kredensial aparatur, menerapkan rate limiting mitigasi serangan brute-force, dan menetapkan cookie sesi terenkripsi.
- **Proteksi Brute Force**: Dibatasi maksimal 5 kali kegagalan per nama pengguna atau 15 kali kegagalan per alamat IP dalam jendela 15 menit.
- **Header Permintaan**: `Content-Type: application/json`
- **Body Permintaan**:
  ```json
  {
    "username": "admin",
    "password": "Dispora2026!"
  }
  ```
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-admin-01",
      "username": "admin",
      "namaLengkap": "Pebriadin Hapiz, AP, M.Si",
      "role": "SUPER_ADMIN",
      "jabatan": "Kepala Dinas",
      "unitKerja": "Sekretariat",
      "nip": "19780214 199612 1 001",
      "email": "kadispora@kalselprov.go.id"
    }
  }
  ```
- **Header Set-Cookie**:
  `sipasd_session=<JWT_TOKEN>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
- **Respon Gagal**:
  - `HTTP 400 Bad Request`: `{"success": false, "message": "Nama pengguna dan kata sandi wajib diisi."}`
  - `HTTP 401 Unauthorized`: `{"success": false, "message": "Nama pengguna atau kata sandi tidak valid."}`
  - `HTTP 429 Too Many Requests`: `{"success": false, "message": "Terlalu banyak percobaan masuk yang gagal. Silakan coba kembali dalam 15 menit."}`

---

### `POST /api/auth/logout` dan `GET /api/auth/logout`
- **Tujuan**: Mengakhiri sesi aparatur, mencatat event `LOGOUT` ke tabel `audit_logs` bersama alamat IP dan User Agent, serta menghapus cookie sesi di peramban.
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logout berhasil"
  }
  ```
- **Header Set-Cookie**:
  `sipasd_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`

---

## 2. Modul Pengelolaan Arsip Naskah Dinas (`/api/letters`)

### `GET /api/letters`
- **Tujuan**: Menarik seluruh katalog naskah dinas riil (170 Surat Masuk & 241 Surat Keluar) dari TiDB Cloud dengan urutan nomor agenda menurun (*descending*).
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "letters": [
      {
        "id": "1250",
        "rawId": "e2c3b8a1-4d5e-4f6a-8b9c-0d1e2f3a4b5c",
        "number": "005/1045/Dispora/2026",
        "origin": "Bappeda Prov. Kalimantan Selatan",
        "subject": "Undangan Rapat Koordinasi Penyusunan RKPD TA 2027",
        "date": "2026-10-15",
        "type": "Penting",
        "direction": "in",
        "classification": "005",
        "venue": "-",
        "division": "Sekretariat",
        "fileUrl": "https://res.cloudinary.com/vqfpoekg/raw/upload/v1729.../1250.pdf",
        "driveUrl": "https://drive.google.com/file/d/1abc.../view?usp=drivesdk",
        "disposition": {
          "official": "Pebriadin Hapiz, AP, M.Si",
          "date": "2026-10-16",
          "division": "Sekretariat",
          "instructions": ["Tindak Lanjuti", "Hadiri"],
          "notes": "Wakilkan ke Kabid terkait",
          "status": "SELESAI"
        }
      }
    ]
  }
  ```

---

### `POST /api/letters`
- **Tujuan**: Mencatat indeks naskah dinas baru ke basis data TiDB Cloud menggunakan transaksi atomik dengan penguncian baris (`FOR UPDATE`).
- **Otorisasi**: Memerlukan sesi `SUPER_ADMIN` atau `PETUGAS_ARSIP`.
- **Body Permintaan**:
  ```json
  {
    "direction": "in",
    "number": "426/0921/KONI-KS/2026",
    "origin": "Komite Olahraga Nasional Indonesia (KONI) Prov. Kalsel",
    "subject": "Permohonan Bantuan Fasilitas Sarana Pertandingan PON Bela Diri",
    "date": "2026-10-20",
    "type": "Segera",
    "fileUrl": "https://res.cloudinary.com/vqfpoekg/raw/upload/v1729.../new.pdf",
    "driveUrl": "https://drive.google.com/file/d/1xyz.../view?usp=drivesdk",
    "venue": "GOR Hasanuddin HM",
    "division": "Bidang Sarana dan Prasarana",
    "disposition": {
      "official": "Pebriadin Hapiz, AP, M.Si",
      "date": "2026-10-21",
      "instructions": ["Tindak Lanjuti"],
      "notes": "Koordinasikan ketersediaan jadwal venue."
    }
  }
  ```
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Arsip berhasil disimpan",
    "agendaNumber": "1251/SM/DISPORA/2026",
    "id": "a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d"
  }
  ```

---

### `PUT /api/letters`
- **Tujuan**: Memperbarui metadata arsip, menyinkronkan tautan berkas pengganti Cloudinary & Google Drive, dan memperbarui catatan disposisi pimpinan.
- **Body Permintaan**:
  ```json
  {
    "id": "a8b9c0d1-e2f3-4a5b-6c7d-8e9f0a1b2c3d",
    "direction": "in",
    "number": "426/0921/KONI-KS/2026-REV",
    "origin": "KONI Prov. Kalimantan Selatan",
    "subject": "Permohonan Bantuan Fasilitas Venue PON Bela Diri (Revisi Jadwal)",
    "date": "2026-10-21",
    "type": "Kilat",
    "fileUrl": "https://res.cloudinary.com/vqfpoekg/raw/upload/v1729.../revised.pdf",
    "driveUrl": "https://drive.google.com/file/d/1newdrive.../view",
    "disposition": {
      "official": "Pebriadin Hapiz, AP, M.Si",
      "status": "SELESAI",
      "notes": "Disetujui untuk pemakaian GOR."
    }
  }
  ```
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Arsip berhasil diperbarui di TiDB Cloud"
  }
  ```

---

### `DELETE /api/letters`
- **Tujuan**: Menghapus satu atau banyak naskah dinas dari TiDB Cloud via query string (`?id=...&direction=in`) atau JSON body batch (`{"ids": ["0899", "0901"], "direction": "in"}`).
- **Pencocokan Cerdas**: Mendukung penghapusan via UUID database, nomor agenda lengkap (`0899/SM/DISPORA/2026`), atau nomor urut pendek (`0899`).
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "message": "1 arsip berhasil dihapus dari TiDB"
  }
  ```

---

## 3. Modul Penyimpanan & Penyalur Berkas

### `POST /api/upload`
- **Tujuan**: Mengunggah berkas PDF secara simultan ke Cloudinary CDN (pratinjau instan) dan Google Drive (brankas cadangan kedinasan).
- **Validasi Keamanan**:
  - Ukuran berkas maksimal 20 MB.
  - Ekstensi nama berkas wajib `.pdf`.
  - Validasi magic byte: 5 byte pertama berkas wajib bernilai `%PDF-`.
- **Payload**: `multipart/form-data`
  - `file`: Berkas PDF fisik
  - `folder`: `surat_masuk` atau `surat_keluar`
  - `year`: Tahun Anggaran (contoh: `2026`)
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Berkas PDF berhasil diunggah ke Cloudinary dan Google Drive",
    "url": "https://res.cloudinary.com/vqfpoekg/raw/upload/v1729.../naskah.pdf",
    "publicId": "sipasd/surat_masuk/1251.pdf",
    "driveUrl": "https://drive.google.com/file/d/1GoogleDriveId.../view?usp=drivesdk"
  }
  ```

---

### `GET /api/pdf`
- **Tujuan**: Menyalurkan buffer dokumen PDF langsung ke elemen `<iframe>` peramban dengan header keamanan `SAMEORIGIN`.
- **Parameter Query**: `?url=...` atau `?public_id=...`
- **Keamanan**:
  - Whitelist pola public ID: `^sipasd/(surat_masuk|surat_keluar|test)/[a-zA-Z0-9_.-]+\.pdf$`.
  - Pemblokiran karakter path traversal `..`.
- **Header Respon**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: inline; filename="naskah-dinas.pdf"`
  - `X-Frame-Options: SAMEORIGIN`
  - `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400`

---

## 4. Modul Distribusi Fisik & Buku Ekspedisi

### `GET /api/expedition`
- **Tujuan**: Menampilkan seluruh riwayat distribusi tanda terima fisik naskah dinas surat keluar.
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "records": [
      {
        "id": "e4b5c6d7-8a9b-0c1d-2e3f-4a5b6c7d8e9f",
        "surat_keluar_id": "0932b756-a103-43ec-9b70-1b0b0d34c538",
        "nomor_agenda": "3802/SK/DISPORA/2026",
        "tanggal_kirim": "2026-10-22",
        "kurir_pengirim": "Staf TU",
        "penerima_nama": "Loket BPKAD Prov. Kalsel",
        "penerima_telepon": "0511-3301234",
        "catatan_ekspedisi": "Diterima lengkap dengan lampiran SPJ"
      }
    ]
  }
  ```

---

### `POST /api/expedition`
- **Tujuan**: Mencatat bukti tanda terima naskah surat keluar ke tabel `buku_ekspedisi` (upsert berdasarkan `surat_keluar_id`).
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Distribusi surat 3802/SK/DISPORA/2026 berhasil dicatat",
    "nomor_agenda": "3802/SK/DISPORA/2026"
  }
  ```

---

## 5. Modul Jejak Forensik Audit Trail (`/api/audit`)

### `GET /api/audit`
- **Tujuan**: Mengambil 100 catatan log keamanan forensik terkini dari tabel `audit_logs` TiDB Cloud.
- **Otorisasi Ketat**: Khusus akun terotentikasi dengan peran `SUPER_ADMIN`.
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "logs": [
      {
        "id": 142,
        "action": "LOGIN_SUCCESS",
        "resource": "users",
        "ip_address": "114.125.42.18",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
        "created_at": "2026-10-26T07:15:22.000Z",
        "username": "admin",
        "nama_lengkap": "Pebriadin Hapiz, AP, M.Si",
        "role": "SUPER_ADMIN"
      }
    ]
  }
  ```

---

## 6. Modul Klasifikasi AI Heuristik (`/api/ai/suggest`)

### `POST /api/ai/suggest`
- **Tujuan**: Merekomendasikan kode klasifikasi naskah dinas 3 digit berdasarkan teks perihal sesuai Permendagri No. 83 Tahun 2022.
- **Batas Keamanan**: Panjang teks dibatasi maksimal 5.000 karakter.
- **Body Permintaan**:
  ```json
  {
    "text": "Laporan Pertanggungjawaban Realisasi Anggaran Pengadaan Sarana Olahraga Daerah Triwulan III"
  }
  ```
- **Respon Sukses (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "suggestion": {
      "code": "900",
      "name": "Keuangan (Anggaran, SPJ, Pajak, Kas)",
      "confidence": 0.95
    }
  }
  ```
