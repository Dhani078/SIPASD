# SPEC: SIPASD (Sistem Informasi Pengelolaan Arsip Surat Dispora)
**Spesifikasi Rekayasa Perangkat Lunak Repositori E-Arsip Digital**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Pengembang: Muhammad Rizki Ramadhani (2310010406) - S1 TI UNISKA Banjarmasin*

---

## 1. Objective (Tujuan Pengembangan)
Membangun aplikasi sistem informasi repositori e-arsip berbasis web responsif untuk mendigitalkan, mengindeks, dan menata seluruh arsip berkas pindaian (*scan*) surat masuk dan keluar yang selama ini hanya tersimpan secara tidak terstruktur di Google Drive (`arsipdispora2026 / sistem magang`).

Sistem mencakup:
- Pengindeksan metadata terstruktur untuk 420+ dokumen PDF riil TA 2026 (171 Surat Masuk dan 249 Surat Keluar).
- Mesin pencari cepat multi-kriteria (nomor surat, tanggal, asal/tujuan, kode klasifikasi dinas, kata kunci perihal).
- Pemutar dokumen PDF bawaan (*in-browser streaming PDF viewer*) dengan dukungan split-screen.
- Pencatatan dokumentasi riwayat lembar disposisi fisik pimpinan beserta cetak salinan standar Pemprov Kalsel.
- Generator ekspor Buku Agenda Surat Masuk dan Keluar ke format Microsoft Excel (.xlsx) untuk pertanggungjawaban dinas.

---

## 2. Tech Stack (Tumpukan Teknologi)

| Komponen | Teknologi | Keterangan Versi |
| :--- | :--- | :--- |
| **Framework Fullstack** | Next.js 15 (App Router) | React 19, Server Actions, Route Handlers |
| **Bahasa Pemrograman** | TypeScript 5.x | Strict Mode (`noImplicitAny: true`) |
| **Styling & Desain** | Tailwind CSS v4 + Lucide Icons | Palet: Emerald Dinas, Gold Banua, Slate Clean |
| **Basis Data Relasional** | TiDB Cloud Serverless (MySQL) | SSL Strict, Serverless Autoscaling (25 GB Gratis) |
| **ORM / Query Builder** | Prisma ORM v5 | Type-safe Database Client |
| **Penyimpanan Berkas** | Cloudinary & Google Drive | S3-Compatible SDK (`@aws-sdk/client-s3`) (10 GB Gratis) |
| **Autentikasi & Keamanan** | Jose / NextAuth (Session Cookie) | HttpOnly, Secure, SameSite=Strict, Bcrypt |
| **Ekspor Dokumen** | ExcelJS | Generator Buku Agenda format .xlsx |

---

## 3. Project Structure (Struktur Direktori)

```
SIPASD/
├── prisma/
│   ├── schema.prisma              # Definisi skema tabel & relasi TiDB
│   └── seed.ts                    # Seeder data pengguna, master dinas & arsip
├── public/
│   ├── assets/logo-kalsel.png     # Logo Pemprov Kalsel & Dispora
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx  # Halaman login RBAC
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Layout navigasi & sidebar responsif
│   │   │   ├── page.tsx           # Dashboard statistik volume e-arsip
│   │   │   ├── arsip-masuk/       # Katalog, pencarian, pratinjau surat masuk
│   │   │   ├── arsip-keluar/      # Katalog, pencarian, pratinjau surat keluar
│   │   │   ├── riwayat-disposisi/ # Rekam jejak disposisi fisik pimpinan
│   │   │   ├── laporan-agenda/    # Ekspor rekapitulasi buku agenda Excel
│   │   │   └── master/            # Master klasifikasi surat, bidang & user
│   │   └── api/                   # Route handlers (streaming PDF, auth)
│   ├── components/                # Komponen modular UI (maks 200 LOC)
│   │   ├── ui/                    # Tombol, input, modal, badge, dropdown
│   │   ├── arsip/                 # Tabel katalog, viewer PDF, form indeks
│   │   └── dashboard/             # Grafik Chart.js, kartu statistik arsip
│   ├── lib/
│   │   ├── db.ts                  # Koneksi singleton TiDB / Prisma
│   │   ├── cloudinary.ts                  # Klien Cloudinary & Google Drive (presigned streaming)
│   │   ├── auth.ts                # Utilitas enkripsi & verifikasi sesi
│   │   └── audit.ts               # Perekaman jejak audit log otomatis
│   └── types/                     # Definisi antarmuka TypeScript
├── docs/                          # Dokumentasi arsitektur & naskah laporan magang
├── AGENT.md                       # Panduan eksekusi agen otomatis
├── SPEC.md                        # Dokumen spesifikasi ini
└── README.md                      # Dokumentasi utama repositori
```

---

## 4. Boundaries (Batasan Proyek)

- **Always (Wajib)**:
  - Gunakan parameterized query pada seluruh akses basis data.
  - Validasi tipe MIME asli berkas PDF sebelum pengindeksan.
  - Catat jejak audit (*user*, *action*, *IP address*, *timestamp*) untuk setiap operasi temu-kembali dan mutasi data.
  - Periksa tampilan mobile (375px) dan desktop (1440px) bebas dari horizontal scroll overflow.
- **Never (Dilarang)**:
  - Menyimpan file PDF lokal di server (wajib Cloudinary & Google Drive / link storage terpusat).
  - Mengubah isi dokumen PDF fisik yang sudah sah secara hukum negara.
  - Menyimpan *password* dalam teks polos (*plain text*).
