# SPEC: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)
**Spesifikasi Rekayasa Perangkat Lunak Resmi**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Pengembang: Muhammad Rizki Ramadhani (2310010406) — S1 TI UNISKA Banjarmasin*

---

## 1. Objective (Tujuan Pengembangan)
Membangun aplikasi sistem informasi berbasis web responsif untuk mendigitalisasi, mengotomasi, dan menata seluruh siklus korespondensi dinas di lingkungan Sekretariat Dispora Provinsi Kalimantan Selatan. Sistem mencakup:
- Pencatatan buku agenda surat masuk dan keluar secara elektronik.
- Alur disposisi pimpinan berjenjang (Kadis/Sekretaris ke Kepala Bidang).
- Registrasi dan generator penomoran surat keluar otomatis anti-nomor dobel.
- Integrasi penyimpanan awan terenkripsi untuk 420+ berkas PDF riil (171 Surat Masuk, 249 Surat Keluar TA 2026).
- Dashboard analitik eksekutif dan ekspor laporan format resmi kedinasan.

---

## 2. Tech Stack (Tumpukan Teknologi)

| Komponen | Teknologi | Keterangan Versi |
| :--- | :--- | :--- |
| **Framework Fullstack** | Next.js 15 (App Router) | React 19, Server Actions, Route Handlers |
| **Bahasa Pemrograman** | TypeScript 5.x | Strict Mode (`noImplicitAny: true`) |
| **Styling & Desain** | Tailwind CSS v4 + Lucide Icons | Palet: Emerald/Teal (Dinas), Slate, Clean White |
| **Basis Data Relasional** | TiDB Cloud Serverless (MySQL) | SSL Strict, Serverless Autoscaling |
| **ORM / Query Builder** | Prisma ORM atau Drizzle ORM | Type-safe Database Client |
| **Penyimpanan Berkas** | Cloudflare R2 | S3-Compatible SDK (`@aws-sdk/client-s3`) |
| **Autentikasi & Keamanan** | Jose / NextAuth (Session Cookie) | HttpOnly, Secure, SameSite, Bcrypt |
| **Ekspor Dokumen** | ExcelJS / SheetJS | Generator Buku Agenda format .xlsx |

---

## 3. Commands (Perintah Eksekusi)

```bash
# Instalasi dependensi
npm install

# Lingkungan pengembangan
npm run dev

# Sinkronisasi skema database ke TiDB Cloud
npx prisma db push
# atau
npm run db:push

# Seeder data awal (akun pengguna, master bidang, kode klasifikasi)
npm run db:seed

# Verifikasi linting dan tipe data
npm run lint
npx tsc --noEmit

# Uji coba build produksi
npm run build

# Menjalankan build produksi secara lokal
npm start
```

---

## 4. Project Structure (Struktur Direktori)

```
SIPASD/
├── prisma/
│   ├── schema.prisma              # Definisi skema tabel & relasi TiDB
│   └── seed.ts                    # Seeder data pengguna & master dinas
├── public/
│   ├── assets/logo-kalsel.png     # Logo Pemprov Kalsel & Dispora
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx  # Halaman login RBAC 4 tingkat
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Layout navigasi & sidebar responsif
│   │   │   ├── page.tsx           # Dashboard analitik & kartu KPI
│   │   │   ├── surat-masuk/       # Daftar, input, pratinjau surat masuk
│   │   │   ├── surat-keluar/      # Daftar, booking nomor, ekspedisi
│   │   │   ├── disposisi/         # Alur telaah & tindak lanjut pimpinan
│   │   │   ├── laporan/           # Generator ekspor buku agenda Excel
│   │   │   └── master/            # Master kode surat, bidang, & pegawai
│   │   └── api/                   # Route handlers (streaming PDF, auth)
│   ├── components/                # Komponen modular UI (maks 200 LOC)
│   │   ├── ui/                    # Tombol, input, modal, badge, dropdown
│   │   ├── surat/                 # Tabel agenda, viewer PDF, form modal
│   │   └── dashboard/             # Grafik Chart.js, kartu statistik
│   ├── lib/
│   │   ├── db.ts                  # Koneksi singleton TiDB / Prisma
│   │   ├── r2.ts                  # Klien Cloudflare R2 (presigned URL)
│   │   ├── auth.ts                # Utilitas enkripsi & verifikasi sesi
│   │   └── audit.ts               # Perekaman jejak audit log otomatis
│   └── types/                     # Definisi antarmuka TypeScript
├── docs/                          # Dokumentasi arsitektur & laporan magang
├── .github/                       # Alur kerja CI & templat issue/PR
├── AGENT.md                       # Panduan eksekusi agen otomatis
├── SPEC.md                        # Dokumen spesifikasi ini
└── README.md                      # Dokumentasi utama repositori
```

---

## 5. Code Style (Konvensi Kode)

1. **Batas Ukuran Berkas**: Maksimal 200 baris kode per berkas. Jika melebihi, wajib didekomposisi ke komponen pembantu.
2. **Pola Server Component vs Client Component**:
   - Jadikan halaman *Server Component* secara default untuk kueri data langsung.
   - Tambahkan arahan `'use client'` hanya pada komponen interaktif (formulir dinamis, tombol modal, pemutar PDF).
3. **Contoh Cuplikan Standar Kode**:
```typescript
// src/lib/actions/surat-masuk.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SuratMasukSchema = z.object({
  nomorSurat: z.string().min(1, 'Nomor surat wajib diisi'),
  asalInstansi: z.string().min(1, 'Asal instansi wajib diisi'),
  tanggalSurat: z.string(),
  perihal: z.string().min(3, 'Perihal minimal 3 karakter'),
  sifatSurat: z.enum(['BIASA', 'PENTING', 'SEGERA', 'KILAT']),
});

export async function createSuratMasuk(formData: FormData) {
  // 1. Validasi input
  // 2. Insert via db dengan prepared statements
  // 3. Catat audit log
  // 4. Revalidasi path
}
```

---

## 6. Testing Strategy (Strategi Pengujian)

1. **Static Analysis & Typecheck**:
   - `tsc --noEmit` untuk memastikan 100% type-safety tanpa *compiler error*.
   - ESLint untuk kepatuhan tata letak kode Next.js.
2. **Black Box Functional Testing** (Untuk Dokumen Bab IV Laporan Magang):
   - Uji skenario Login: Kredensial valid vs Kredensial salah vs Proteksi brute force.
   - Uji Perekaman Surat: Validasi form kosong, unggah berkas >25MB, penomoran ganda.
   - Uji Disposisi: Alur penerusan dari Kadis ke Kabid dan pembaruan status.
   - Uji Ekspor Excel: Kecocokan data rekapitulasi buku agenda dengan database.

---

## 7. Boundaries (Batasan Proyek)

- **Always (Wajib Selalu Dilakukan)**:
  - Gunakan parameterized query pada seluruh akses basis data.
  - Validasi tipe MIME asli berkas yang diunggah (`application/pdf`).
  - Catat jejak audit (*user*, *action*, *IP address*, *timestamp*) untuk setiap operasi mutasi data.
  - Periksa tampilan mobile (375px/390px) dan desktop (1440px) bebas dari horizontal scroll overflow.
- **Ask First (Minta Izin Pengguna Dahulu)**:
  - Mengubah skema tabel inti database yang sudah berisi data riil.
  - Menghapus berkas arsip PDF permanen.
- **Never (Dilarang Keras)**:
  - Menyimpan *password* dalam teks polos (*plain text*). Wajib hash bcrypt.
  - Melakukan *hardcoding* kredensial API atau token rahasia ke dalam berkas repositori.
  - Menggunakan dummy email pada konfigurasi git (wajib `dhanisepeda@gmail.com`).

---

## 8. Success Criteria (Kriteria Keberhasilan)

1. **Fungsional Penuh**: 420 berkas PDF riil (171 Surat Masuk, 249 Surat Keluar) terhubung ke sistem dan dapat dibuka melalui viewer peramban dalam waktu < 2 detik.
2. **Keandalan Penomoran**: Fitur auto-numbering surat keluar menjamin 0% risiko duplikasi nomor antar bidang.
3. **Penyelarasan Disposisi**: Pimpinan dapat menelaah dan meneruskan lembar disposisi digital dalam waktu < 1 menit.
4. **Siap Uji Sidang**: Seluruh fungsionalitas memiliki dokumen pemetaan ke Bab III & Bab IV Laporan Magang TI UNISKA.
