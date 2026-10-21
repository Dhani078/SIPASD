# PANDUAN DEPLOYMENT CLOUD RESMI (ZERO-COST RUNBOOK): SIPASD
**Prosedur Publikasi Sistem Informasi Persuratan Dispora Kalsel 24 Jam Non-Stop**  
*Hosting: Vercel Edge Network | Database: TiDB Cloud Serverless | Storage: Cloudinary & Google Drive*

---

## ☁️ Arsitektur Cloud Tanpa Beban PC Kantor

Sistem SIPASD dirancang secara *Cloud-Native* sehingga tidak memerlukan server komputer fisik di kantor Dispora yang harus menyala 24 jam. Seluruh komponen berjalan di atas layanan *Serverless* bereputasi global dengan tingkat keandalan 99.9% dan biaya operasional **Rp 0,- (Gratis Selamanya)** dalam batas kuota gratis kedinasan:

```
[ Smartphone / Laptop Pengguna ]
                │
                ▼ (HTTPS / TLS 1.3)
      [ Vercel Edge Network ]
      (Next.js 15 App Router)
         │                 │
         │ (MySQL SSL)     │ (S3 API Presigned)
         ▼                 ▼
[ TiDB Cloud Serverless ] [ Cloudinary & Google Drive ]
(Basis Data 25 GB Gratis) (Penyimpanan 10 GB Gratis)
```

---

## 🛠️ Langkah 1: Setup Basis Data TiDB Cloud Serverless

1. Buka situs resmi **[https://tidbcloud.com](https://tidbcloud.com)** dan masuk menggunakan akun Google.
2. Buat klaster baru dengan memilih paket **Serverless (Free Tier)**.
   - Region: `ap-southeast-1` (Singapore) - untuk menjamin latensi paling rendah ke Kalimantan Selatan (< 35 ms).
   - Cluster Name: `cluster-sipasd-dispora`.
3. Setelah klaster siap (sekitar 30 detik), klik tombol **Connect**:
   - Pilih opsi **Prisma** atau **General MySQL**.
   - Generate kata sandi baru.
   - Salin string koneksi yang dihasilkan.
4. Format string koneksi:
   ```env
   DATABASE_URL="mysql://<USERNAME>:<PASSWORD>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd?sslaccept=strict"
   ```

---

## 📦 Langkah 2: Setup Penyimpanan Objek Cloudinary & Google Drive

1. Buka dasbor **[https://dash.cloudflare.com](https://dash.cloudflare.com)** dan pilih menu **R2**.
2. Klik tombol **Create Bucket**:
   - Bucket Name: `sipasd-dispora-files`.
   - Lokasi Penyimpanan: `Automatic (APAC)`.
3. Klik tab **Settings** pada bucket, lalu atur **CORS Policy** agar file PDF dapat dibaca oleh peramban web:
   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://*.vercel.app"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
4. Buka menu **Manage R2 API Tokens**, klik **Create API Token**:
   - Permissions: `Admin Read & Write`.
   - Dapatkan nilai:
     - `Account ID`
     - `Access Key ID`
     - `Secret Access Key`

---

## 🚀 Langkah 3: Deployment ke Vercel

1. Buka situs **[https://vercel.com](https://vercel.com)** dan masuk dengan akun GitHub (`Dhani078`).
2. Klik **Add New -> Project**, lalu pilih repositori **`Dhani078/SIPASD`**.
3. Pada bagian **Environment Variables**, masukkan seluruh konfigurasi rahasia:
   ```env
   DATABASE_URL="mysql://<user>:<pass>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sipasd?sslaccept=strict"
   R2_ACCOUNT_ID="your_cloudflare_account_id"
   R2_ACCESS_KEY_ID="your_r2_access_key_id"
   R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
   R2_BUCKET_NAME="sipasd-dispora-files"
   NEXTAUTH_SECRET="generate_random_secret_string_32_chars"
   NEXTAUTH_URL="https://sipasd.vercel.app"
   ```
4. Klik tombol **Deploy**.
5. Vercel akan otomatis melakukan kompilasi TypeScript, bundling aset Tailwind CSS, dan menghasilkan URL produksi HTTPS publik (misal: `https://sipasd.vercel.app`).

---

## 🔄 Langkah 4: Migrasi Skema & Seeding Data Awal

Setelah aplikasi terhubung ke TiDB Cloud, jalankan perintah migrasi skema dan pengisian data pejabat resmi dari terminal lokal:
```bash
# Push skema tabel ke TiDB Cloud
npx prisma db push

# Eksekusi seeder akun pejabat Dispora Kalsel
npm run db:seed
```

---

## 🔒 Ringkasan Jaminan Biaya Nol (Zero-Cost Guarantee)

| Layanan Cloud | Batas Kuota Gratis Bulanan | Estimasi Pemakaian SIPASD Dispora | Status Biaya |
| :--- | :--- | :--- | :--- |
| **Vercel Hosting** | 100 GB Bandwidth / bulan | 5 - 10 GB / bulan | **Rp 0,- (Gratis)** |
| **TiDB Serverless**| 25 GB Penyimpanan Relasional | ~500 MB (10.000 surat teks) | **Rp 0,- (Gratis)** |
| **Cloudinary & Google Drive**  | 10 GB Storage & Zero Egress Fee | 420 PDF = ~1.2 GB | **Rp 0,- (Gratis)** |
