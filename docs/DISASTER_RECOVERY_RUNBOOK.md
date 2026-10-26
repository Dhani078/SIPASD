# DISASTER RECOVERY & MAINTENANCE RUNBOOK: SIPASD
**Sistem Informasi Pengelolaan Arsip Surat Dispora Provinsi Kalimantan Selatan**  
*Standar: Kerangka Kerja Keamanan SPBE Pemprov Kalsel & Standar ISO/IEC 27001*  
*Pengembang: Muhammad Rizki Ramadhani (Dhani078 / dhanisepeda@gmail.com)*  
*Lokasi Sistem: `E:\Hermesproject\SIPASD` & Live Host `https://www.sipasd.my.id`*

---

## 1. Parameter Sasaran Pemulihan (RTO & RPO)

Sesuai klasifikasi kearsipan dinas pemerintah daerah, sistem menetapkan batas toleransi henti layanan (*downtime*) dan kehilangan data sebagai berikut:

| Metrik Pemulihan | Nilai Target | Definisi Operasional |
|---|---|---|
| **RTO (Recovery Time Objective)** | **< 15 Menit** | Waktu maksimal yang dibutuhkan untuk mengembalikan sistem ke kondisi operasional penuh setelah terjadi insiden kegagalan primer. |
| **RPO (Recovery Point Objective)** | **< 1 Jam** | Batas maksimal data transaksi baru yang diperbolehkan hilang sejak titik sinkronisasi cadangan terakhir. |
| **Availability Target (SLA)** | **99.9%** | Tingkat ketersediaan layanan tahunan (toleransi total henti layanan tak terencana < 8.76 jam per tahun). |

---

## 2. Topologi Redundansi Infrastruktur

Sistem mengimplementasikan pemisahan lapisan independen tanpa single-point-of-failure:

```
[PENGGUNA / APARATUR]
        │
        ▼ (HTTPS / SSL TLS 1.3)
[VERCEL EDGE NETWORK] ──── failover ───► [CADANGAN STATIC MIRROR]
        │
        ├──► [API & Serverless Functions]
        │           │
        │           ├──► [TiDB Cloud Serverless (AWS Singapore multi-AZ)]
        │           │          │
        │           │          └──► [Daily Automated Snapshot & Point-in-Time Recovery]
        │           │
        │           ├──► [Cloudinary Media CDN (Primary Streaming)]
        │           │
        │           └──► [Google Drive 5 TB Kedinasan (Secondary Permanent Vault)]
```

---

## 3. Prosedur Pencadangan Mandiri (Backup Runbook)

### 3.1 Pencadangan Basis Data Relasional TiDB Cloud

Pencadangan data kearsipan (tabel `arsip_surat_masuk`, `arsip_surat_keluar`, `riwayat_disposisi`, `buku_ekspedisi`, `users`, `audit_logs`) dapat dieksekusi secara manual maupun terjadwal melalui antarmuka terminal developer.

#### Langkah Eksekusi Pencadangan SQL Lengkap:
```bash
# Pastikan terminal berada di direktori proyek
cd /e/Hermesproject/SIPASD

# Eksekusi skrip pencadangan database berstempel waktu WITA
node --env-file=.env.local -e '
const fs = require("fs");
const { getDbPool } = require("./src/lib/db");
async function backup() {
  const pool = getDbPool();
  const tables = ["users", "bidang_kerja", "kode_klasifikasi", "arsip_surat_masuk", "arsip_surat_keluar", "riwayat_disposisi", "buku_ekspedisi", "audit_logs"];
  const out = [];
  out.push("-- SIPASD DATABASE BACKUP " + new Date().toISOString());
  for (const t of tables) {
    const [rows] = await pool.query("SELECT * FROM " + t);
    out.push("\n-- TABLE: " + t + " (" + rows.length + " rows)");
    out.push("TRUNCATE TABLE `" + t + "`;");
    for (const r of rows) {
      const keys = Object.keys(r).map(k => "`" + k + "`").join(", ");
      const vals = Object.values(r).map(v => v === null ? "NULL" : typeof v === "number" ? v : "'" + String(v).replace(/'/g, "''") + "'").join(", ");
      out.push("INSERT INTO `" + t + "` (" + keys + ") VALUES (" + vals + ");");
    }
  }
  const dateStr = new Date().toISOString().slice(0, 10);
  const path = "docs/BACKUP_MANUAL_" + dateStr + ".sql";
  fs.writeFileSync(path, out.join("\n"), "utf8");
  console.log("Pencadangan sukses: " + path);
  process.exit(0);
}
backup();
'
```

### 3.2 Pencadangan Berkas Fisik PDF (Google Drive Dual-Vault)
Seluruh 411 berkas naskah PDF asli telah tersimpan aman di akun Google Drive resmi Dispora Kalsel (`arsipdispora2026`, folder `sistem magang`). Jika akun Cloudinary ditutup atau kuota habis:
1. Akses folder Google Drive melalui konsol administrator:
   - Folder Surat Masuk: `https://drive.google.com/drive/folders/1QzW_9rFqgegOhn--eLNb_rqu4jvz3q0`
   - Folder Surat Keluar: `https://drive.google.com/drive/folders/1w3qC-Z2d9p0B2sO_m4X7l8k_v1yN3qA`
2. Seluruh baris di database TiDB telah memiliki tautan langsung `drive_url` yang tidak bergantung pada server Cloudinary.

---

## 4. Prosedur Pemulihan Bencana (Disaster Recovery Runbook)

### Skenario 1: Kerusakan Data atau Salah Hapus Massal di TiDB Cloud
Jika terjadi kesalahan manusia (human error) seperti terhapusnya baris arsip:
1. Buka berkas SQL snapshot resmi di `docs/DATABASE_SIPASD_BACKUP_2026.sql`.
2. Jalankan skrip migrasi ulang:
   ```bash
   npm run db:migrate
   ```
3. Lakukan injeksi data dari berkas cadangan melalui MySQL Client / TiDB Cloud Web Console:
   ```bash
   mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com -P 4000 -u [USER] -p[PASS] --ssl-mode=REQUIRED sipasd < docs/DATABASE_SIPASD_BACKUP_2026.sql
   ```
4. Verifikasi jumlah arsip pasca-pemulihan:
   ```bash
   npm test
   ```
   *Ekspektasi: 170 Surat Masuk, 241 Surat Keluar (Total 411 naskah).*

### Skenario 2: Gangguan Layanan Hosting Vercel (Edge Outage)
Jika Vercel mengalami gangguan global:
1. Repositori kode berada dalam kondisi bersih dan mandiri di `E:\Hermesproject\SIPASD`.
2. Sistem dapat dijalankan langsung di jaringan lokal kantor Dispora Kalsel (Server TU / Laptop Admin):
   ```bash
   npm run build
   npm run start -- -p 3000
   ```
3. Petugas dapat mengakses aplikasi melalui IP lokal kantor: `http://192.168.1.xxx:3000`.

### Skenario 3: Penolakan Akses API Cloudinary (Limit Quota Terlampaui)
Jika kredit gratis Cloudinary (25 kredit/bulan) habis di akhir bulan:
1. Penampil dokumen PDF di `src/components/PdfPreviewPanel.tsx` telah dilengkapi logika fallback otomatis.
2. Saat iframe Cloudinary gagal dimuat, sistem menampilkan tombol primer:
   `"Buka Dokumen Asli di Google Drive Dinas"`.
3. Dokumen tetap dapat dibaca dan diunduh 100% tanpa hambatan operasional.

---

## 5. Prosedur Rotasi Kredensial Berkala (Credential Rotation SOP)

Untuk mematuhi audit keamanan informasi SPBE, rotasi kredensial dilakukan setiap 6 bulan atau segera jika dicurigai terjadi kebocoran:

1. **Rotasi Kunci JWT Sesi (`JWT_SECRET`)**:
   - Buat kunci rahasia baru acak 64 karakter:
     ```bash
     node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
     ```
   - Perbarui nilai `JWT_SECRET` pada file `.env.local` dan Dashboard Vercel Environment Variables.
   - Dampak: Seluruh sesi aparatur yang sedang aktif akan otomatis ter-logout dan diminta login kembali (aman tanpa data hilang).

2. **Rotasi Kredensial Google Drive Service Account**:
   - Masuk ke Google Cloud Console proyek `sipasd`.
   - Masuk ke menu IAM & Admin -> Service Accounts -> `sipasd-bot@sipasd.iam.gserviceaccount.com`.
   - Buka tab *Keys* -> *Add Key* -> *Create new key* (JSON).
   - Perbarui isi file `credentials/service-account.json`.

3. **Rotasi Password Database TiDB Cloud**:
   - Masuk ke TiDB Cloud Console -> Cluster -> Security -> SQL Users.
   - Reset password pengguna, perbarui string `DATABASE_URL` di Vercel dan lokal `.env.local`.

---

## 6. Daftar Kontak Tanggap Darurat Kedinasan

| Jabatan / Peran | Nama Personel | Kontak Operasional | Tanggung Jawab |
|---|---|---|---|
| **Pengembang Utama / IT Lead** | Muhammad Rizki Ramadhani | dhanisepeda@gmail.com | Infrastruktur, Kode Sumber & Basis Data |
| **Pembimbing Lapangan TU** | Ibu Nur Dispora | Kantor Dispora Prov. Kalsel | Verifikasi Berkas Fisik & Agenda Disposisi |
| **Bendahara Pengeluaran** | Sathia Nico Brata S., S.Akun | Subbag Keuangan Dispora | Otorisasi Akses Dokumen SPJ Keuangan |
| **PPTK / Subbag Keuangan** | Norika Fajriana, SH, MH | Subbag Keuangan Dispora | Kebijakan Penomoran Surat Masuk/Keluar |
| **Kepala Dinas** | Pebriadin Hapiz, AP, M.Si | Ruang Kadispora Kalsel | Otorisasi Penandatanganan & Disposisi Naskah |
