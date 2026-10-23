# DEEP AUDIT & ROADMAP PERBAIKAN SIPASD
**Tanggal**: 22 Oktober 2026
**Auditor / Pengembang**: Muhammad Rizki Ramadhani (Dhani078)
**Commit Awal**: `512278d` (branch: main)

---

## RINGKASAN EKSEKUTIF

Proyek SIPASD diaudit pada 5 dimensi: standar industri, fungsionalitas logic, clean architecture, reusability/dead code, dan animasi/UX. Hasil: **arsitektur solid, modularitas tinggi, 3 temuan kritis keamanan, 8 temuan medium UX/performa, 5 temuan minor**.

| Dimensi | Skor | Catatan |
|---------|------|---------|
| Standar Industri | 8/10 | Security headers hilang, DELETE tanpa auth |
| Fungsionalitas Logic | 9/10 | Semua alur CRUD + dual-upload berfungsi |
| Clean Architecture | 9/10 | 51 file, semua <= 200 LOC, separation of concerns baik |
| Reusability / Dead Code | 8.5/10 | Komponen reusable, sedikit duplikasi filter logic |
| Animasi & UX | 7.5/10 | Smooth transitions, tapi belum ada loading skeleton & error boundary |

---

## TEMUAN KRITIS (WAJIB DIPERBAIKI)

### K1. DELETE /api/letters TANPA AUTH CHECK
- **Severity**: KRITIS
- **File**: `src/app/api/letters/route.ts` (baris 38-61)
- **Masalah**: Endpoint `DELETE` tidak memverifikasi sesi. Siapa pun di internet bisa menghapus arsip.
- **Bukti**: `curl -X DELETE "https://www.sipasd.my.id/api/letters?id=test&direction=in"` mengembalikan response tanpa 401.
- **Perbaikan**: Tambahkan `getSession()` check di handler DELETE.
- **Status**: DIPERBAIKI SESI INI

### K2. POST /api/letters TANPA AUTH ENFORCEMENT
- **Severity**: KRITIS
- **File**: `src/app/api/letters/route.ts` (baris 19-36)
- **Masalah**: POST handler memanggil `getSession()` tapi tidak menolak jika null, malah fallback ke `'usr-admin-01'`.
- **Bukti**: Request POST tanpa cookie sesi tetap berhasil insert.
- **Perbaikan**: Return 401 jika `session` null.
- **Status**: DIPERBAIKI SESI INI

### K3. SECURITY HEADERS HILANG
- **Severity**: TINGGI
- **File**: `next.config.ts`
- **Masalah**: Tidak ada `X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`.
- **Bukti**: `curl -sI https://www.sipasd.my.id/ | grep -i x-frame` kosong.
- **Perbaikan**: Tambahkan security headers di `next.config.ts`.
- **Status**: DIPERBAIKI SESI INI

---

## TEMUAN MEDIUM (DIREKOMENDASIKAN)

### M1. JWT SECRET HARDCODED SEBAGAI FALLBACK
- **File**: `src/lib/auth.ts` (baris 6)
- **Masalah**: Fallback `'[REDACTED_JWT_SECRET]'` hardcoded dalam kode sumber.
- **Risiko**: Jika `.env.local` hilang, semua environment pakai key yang sama.
- **Perbaikan**: Throw error jika `JWT_SECRET` tidak di-set, jangan fallback.
- **Status**: DIPERBAIKI SESI INI

### M2. CLOUDINARY API SECRET DI SOURCE CODE
- **File**: `src/app/api/pdf/route.ts` (baris 7)
- **Masalah**: `api_secret` hardcoded dalam kode sumber sebagai nilai cadangan.
- **Risiko**: Secret terekspos di GitHub publik. Siapa pun bisa generate signed URL.
- **Perbaikan**: Hapus fallback hardcoded, gunakan `process.env.CLOUDINARY_API_SECRET` saja.
- **Status**: DIPERBAIKI SESI INI

### M3. LOADING STATE TANPA SKELETON
- **File**: Semua page (`page.tsx`)
- **Masalah**: Saat data dari TiDB dimuat, user melihat halaman kosong lalu konten muncul sekaligus.
- **Perbaikan**: Tambahkan `loading.tsx` dengan skeleton placeholder.
- **Status**: DIPERBAIKI SESI INI

### M4. ERROR BOUNDARY TIDAK ADA
- **Masalah**: Jika TiDB timeout atau Cloudinary down, user melihat error Next.js default.
- **Perbaikan**: Tambahkan `error.tsx` dan `not-found.tsx` dengan pesan informatif.
- **Status**: DIPERBAIKI SESI INI

### M5. TOAST TIDAK ADA IKON & ANIMASI MASUK
- **File**: `SipasdApp.tsx` baris 193, `globals.css` `.toast`
- **Masalah**: Toast muncul tanpa ikon sukses/error dan tanpa animasi slide-up.
- **Perbaikan**: Tambah ikon + `@keyframes toast-enter`.
- **Status**: DIPERBAIKI SESI INI

### M6. FORM VALIDASI HANYA CLIENT-SIDE
- **File**: `NewLetterModal.tsx`, `letter-mutations.ts`
- **Masalah**: Validasi input hanya di frontend. Server menerima apa pun.
- **Risiko**: XSS via field `subject` atau `origin` jika HTML disuntikkan.
- **Perbaikan**: Sanitasi input di server route handler sebelum INSERT.
- **Status**: DIPERBAIKI SESI INI

### M7. MOBILE BOTTOM NAV BELUM HIGHLIGHT HALAMAN AKTIF
- **File**: `SipasdApp.tsx` - mobile bottom bar dibuat di `Sidebar.tsx`
- **Masalah**: Tidak ada indikator visual halaman aktif di bottom nav mobile.
- **Catatan**: Bottom nav sudah ada di CSS (`.mobile-bottom`) tapi belum dirender di komponen.
- **Status**: DIPERBAIKI SESI INI

### M8. PDF PREVIEW TANPA LOADING INDICATOR
- **File**: `PdfPreviewPanel.tsx`
- **Masalah**: iframe PDF tidak menampilkan spinner saat memuat. User tidak tahu apakah PDF sedang dimuat.
- **Perbaikan**: Tambahkan state loading + spinner overlay.
- **Status**: DIPERBAIKI SESI INI

---

## TEMUAN MINOR (NICE-TO-HAVE)

### N1. CSS `globals.css` 3920 BARIS
- **Masalah**: Satu file CSS monolitik. Tidak melanggar 200 LOC (hanya berlaku `src/`), tapi sulit dimaintain.
- **Rekomendasi**: Pertimbangkan split per section di masa depan. Tidak prioritas untuk sidang.

### N2. `prefers-reduced-motion` SUDAH DITERAPKAN
- **Status**: Sudah ada di baris 3711-3718. Baik.

### N3. PRINT STYLES SUDAH LENGKAP
- **Status**: `@media print` di baris 3138-3198 dan 3720-3743. Format A4/F4 sudah ditangani.

### N4. DUPLIKASI `transition` DECLARATION
- **File**: `globals.css` baris 25-29 dan baris 3206-3211.
- **Masalah**: Properti `transition` di-declare dua kali untuk elemen yang sama.
- **Perbaikan**: Hapus salah satu.
- **Status**: DIPERBAIKI SESI INI

### N5. `import React` TIDAK PERLU DI REACT 19
- **File**: `ArchiveTable.tsx` baris 3, `SipasdMainView.tsx` baris 3.
- **Masalah**: `import React from 'react'` tidak diperlukan sejak React 17+ dengan JSX transform baru.
- **Perbaikan**: Hapus import yang tidak dipakai.
- **Status**: DIPERBAIKI SESI INI

---

## ARSITEKTUR & CLEAN CODE ASSESSMENT

### Positif
1. **Separation of concerns**: `lib/` untuk logic, `components/` untuk UI, `hooks/` untuk state, `types/` untuk contracts, `data/` untuk constants. Benar-benar terpisah.
2. **Modularitas**: 51 file, semua <= 200 LOC. Tertinggi `TopNavbar.tsx` (198 LOC). Tidak ada god-component.
3. **Reusable components**: `Modal.tsx` dipakai oleh 5 modal berbeda. `Badge.tsx`, `Icon.tsx`, `Crest.tsx` dipakai di mana-mana.
4. **Type safety**: `types/index.ts` mendefinisikan semua interface. Tidak ada `any` di komponen (hanya di catch blocks dan API responses).
5. **Accessibility**: `role="dialog"`, `aria-modal`, `aria-label`, `aria-expanded`, focus trap di Modal, keyboard navigation di ArchiveTable. Solid.
6. **Responsive design**: 6 breakpoint (1500px, 1200px, 1000px, 760px, print). Mobile bottom nav, drawer sidebar. 0 horizontal overflow.
7. **Dual-upload architecture**: Cloudinary + Google Drive simultan, dengan fallback jika Drive gagal.

### Area Perbaikan
1. **Auth enforcement tidak konsisten** antar endpoint (K1, K2).
2. **Secret management** tidak strict (M1, M2).
3. **No server-side validation** pada mutasi data (M6).
4. **Missing error/loading UI states** (M3, M4).

---

## PRIORITAS EKSEKUSI PERBAIKAN

| No | Temuan | Prioritas | Estimasi |
|----|--------|-----------|----------|
| 1 | K1: DELETE auth check | P0 - Kritis | 5 menit |
| 2 | K2: POST auth enforcement | P0 - Kritis | 5 menit |
| 3 | K3: Security headers | P0 - Kritis | 10 menit |
| 4 | M2: Cloudinary secret hardcode | P1 - Tinggi | 5 menit |
| 5 | M1: JWT secret fallback | P1 - Tinggi | 5 menit |
| 6 | M6: Server-side validation | P1 - Tinggi | 10 menit |
| 7 | M3: Loading skeleton | P2 - Medium | 10 menit |
| 8 | M4: Error boundary | P2 - Medium | 10 menit |
| 9 | M5: Toast enhancement | P2 - Medium | 5 menit |
| 10 | M7: Mobile bottom nav | P2 - Medium | 10 menit |
| 11 | M8: PDF loading spinner | P2 - Medium | 5 menit |
| 12 | N4: Duplikasi transition | P3 - Minor | 2 menit |
| 13 | N5: Unused React import | P3 - Minor | 2 menit |

**Total estimasi**: ~84 menit

---

## PENGUJIAN TAMBAHAN YANG DIJALANKAN

| Test | Hasil | Catatan |
|------|-------|---------|
| `npm test` (4 suite) | PASS | TiDB, Cloudinary, modular, em-dash |
| `npx tsc --noEmit` | 0 error | TypeScript strict |
| `npm run build` | 100% sukses | 11 routes, 125 kB First Load |
| Live site HTTP 200 | OK | TTFB ~5.6s (Vercel cold start) |
| Unauthenticated DELETE | VULN | Siapa pun bisa hapus arsip |
| Unauthenticated POST | VULN | Siapa pun bisa insert arsip |
| Security headers | MISSING | Tidak ada X-Frame, CSP, dll |
| HSTS | OK | `max-age=63072000` aktif |
| SSL/TLS | OK | TLS 1.3 via Vercel |
