# SECURITY AUDIT & OWASP TOP 10 MITIGATION: SIPASD
**Standar Keamanan Rekayasa Perangkat Lunak Instansi Pemerintahan**  
*Target: Dispora Provinsi Kalimantan Selatan | Kepatuhan: OWASP Top 10 & SPBE Kominfo*

---

## 🛡️ Matriks Mitigasi Kerentanan OWASP Top 10

| Kode OWASP | Kategori Risiko | Potensi Ancaman di Sistem Persuratan | Langkah Mitigasi Teknis di SIPASD | Status Pengujian |
| :--- | :--- | :--- | :--- | :--- |
| **A01:2021** | Broken Access Control | Staf bidang mengakses atau mengubah disposisi milik bidang lain. | Verifikasi RBAC ganda pada middleware URL dan Server Actions menggunakan sesi terenkripsi. | **Terproteksi (PASS)** |
| **A02:2021** | Cryptographic Failures | Kebocoran kata sandi pegawai atau transmisi data tanpa enkripsi. | Hash kata sandi menggunakan Bcrypt (salt factor 12) + transmisi HTTPS TLS 1.3 & TiDB SSL Strict. | **Terproteksi (PASS)** |
| **A03:2021** | Injection (SQLi / XSS) | Penyerang memasukkan skrip SQL pada nomor surat atau pencarian. | 100% Parameterized Queries (Prisma/TiDB) + React auto-escaping anti XSS + Zod sanitization. | **Terproteksi (PASS)** |
| **A04:2021** | Insecure Design | Duplikasi nomor surat akibat race condition pada penomoran simultan. | Kunci transaksi atomik database (`SELECT ... FOR UPDATE` / Serializable Isolation) pada generator nomor. | **Terproteksi (PASS)** |
| **A05:2021** | Security Misconfiguration | Terbukanya direktori berkas rahasia atau pesan error detail ke publik. | Penonaktifan header `X-Powered-By`, penanganan error terpusat (generic error), dan Cloudflare R2 private bucket. | **Terproteksi (PASS)** |
| **A06:2021** | Vulnerable Components | Modul Node.js atau paket dependensi usang yang memiliki celah CVE. | Pengawasan otomatis GitHub Dependabot mingguan + pemeriksaan `npm audit` pada alur CI. | **Terproteksi (PASS)** |
| **A07:2021** | Identification & Auth Failures | Percobaan brute force login pimpinan atau pembajakan sesi cookie. | Cookie sesi bertanda `HttpOnly`, `Secure`, `SameSite=Strict`, pembatasan rate-limiting login. | **Terproteksi (PASS)** |
| **A08:2021** | Software & Data Integrity | Pengunggahan file script jahat (.php/.exe) berkamuflase sebagai PDF. | Validasi ganda: ekstensi nama file + pemeriksaan magic byte MIME (`application/pdf`) via file-type. | **Terproteksi (PASS)** |
| **A09:2021** | Security Logging Failures | Tidak adanya jejak forensik jika terjadi penghapusan atau kebocoran surat. | Modul `audit_logs` otomatis merekam User ID, IP Address, User-Agent, Aksi, dan Timestamp. | **Terproteksi (PASS)** |
| **A10:2021** | Server-Side Request Forgery | Manipulasi URL pratinjau dokumen untuk memindai jaringan lokal dinas. | URL akses berkas PDF dibatasi ketat hanya pada domain bucket Cloudflare R2 yang terdaftar. | **Terproteksi (PASS)** |

---

## 🔒 Standar Keamanan Berkas Unggah (PDF Scanner & Attachments)

Berkas pindaian surat dinas yang diunggah staf wajib melewati 4 lapis pemeriksaan ketat sebelum disimpan ke Cloudflare R2:

1. **Pemeriksaan Ekstensi & MIME Header**:
   - Hanya ekstensi `.pdf` yang diizinkan.
   - Header `Content-Type` wajib bernilai `application/pdf`.
2. **Pemeriksaan Magic Bytes (Signature File)**:
   - Buffer byte awal wajib diawali dengan `%PDF-` (`0x25 0x50 0x44 0x46`).
3. **Pembatasan Ukuran Maksimal**:
   - Berkas dibatasi maksimal **25 MB** per dokumen untuk mencegah serangan Denial of Service (DoS) pada bandwidth server.
4. **Sanitasi Nama Berkas (Anti Path Traversal)**:
   - Nama asli dibersihkan dari karakter berbahaya (`../`, `\`, null bytes `%00`).
   - Berkas disimpan di Cloudflare R2 dengan nama UUID unik acak (`UUIDv4.pdf`), sehingga struktur folder server lokal tidak pernah terekspos ke publik.

---

## 📋 Kebijakan Keamanan Cookie Sesi (Session Cookie Policy)

Konfigurasi atribut cookie autentikasi SIPASD:
```typescript
{
  name: 'sipasd_session',
  httpOnly: true,     // Mencegah pencurian token melalui serangan Cross-Site Scripting (XSS)
  secure: true,       // Mewajibkan transmisi hanya melalui koneksi terenkripsi HTTPS
  sameSite: 'strict', // Mencegah serangan Cross-Site Request Forgery (CSRF) dari situs eksternal
  maxAge: 60 * 60 * 8, // Sesi kedaluwarsa otomatis setelah 8 jam (standar jam kerja kantor)
  path: '/'
}
```
