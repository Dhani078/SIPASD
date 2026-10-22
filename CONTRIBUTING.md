# CONTRIBUTING & GIT CONVENTIONS: SIPASD

Pedoman standar kontribusi, tata kelola cabang git, dan format komit pada repositori **SIPASD**.

---

## 👤 Identitas Pengembang Tunggal (Sole Contributor Policy)

Repositori ini merupakan karya individual Kerja Praktik (Magang) mahasiswa Teknik Informatika UNISKA Banjarmasin. Seluruh perancangan, penulisan kode, pengujian, dan pemeliharaan dokumentasi dilakukan secara mandiri oleh satu kontributor tunggal:

* **Pengembang Tunggal**: Muhammad Rizki Ramadhani ([@Dhani078](https://github.com/Dhani078))
* **Email Resmi**: `dhanisepeda@gmail.com`
* **NPM**: 2310010406

Seluruh komit harus dilakukan menggunakan kredensial resmi agar tercatat pada riwayat kontribusi GitHub:
```bash
git config user.name "Dhani078"
git config user.email "dhanisepeda@gmail.com"
```
*Catatan: Dilarang menggunakan email anonim / akun lain agar indikator kontribusi (kotak hijau) aktif dan kepemilikan kode sumber terverifikasi.*

---

## 🌿 Strategi Percabangan (Branching Strategy)

- `main`: Cabang produksi yang stabil, selalu dapat dideploy dan teruji.
- `feat/<nama-fitur>`: Cabang pengembangan fitur baru (contoh: `feat/surat-masuk-viewer`).
- `fix/<nama-bug>`: Cabang perbaikan bug (contoh: `fix/disposisi-overdue-calc`).
- `docs/<topik>`: Cabang pembaruan dokumentasi (contoh: `docs/laporan-bab3`).

---

## 📝 Format Pesan Komit (Conventional Commits)

Format pesan komit mengikuti spesifikasi [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```
<tipe>(<lingkup>): <deskripsi singkat dalam bahasa indonesia>

[opsional badan pesan: alasan teknis dan rincian perubahan]

[opsional footer: referensi issue atau catatan breaking change]
```

### Tipe Komit yang Berlaku:
- `feat`: Penambahan fitur baru ke sistem.
- `fix`: Perbaikan kesalahan / bug pada kode.
- `docs`: Penambahan atau pembaruan berkas dokumentasi (.md).
- `style`: Penyesuaian tampilan tanpa mengubah logika (tata letak Tailwind, format).
- `refactor`: Rekayasa ulang struktur kode tanpa mengubah fungsionalitas.
- `perf`: Optimasi kinerja (kecepatan render, kueri database).
- `test`: Penambahan atau perbaikan unit test / black box testing.
- `chore`: Pemeliharaan dependensi, konfigurasi build, atau skrip pembantu.

### Contoh Komit Valid:
```bash
git commit -m "docs(spec): lengkapi pemetaan materi sistem ke bab 1-5 laporan magang"
git commit -m "feat(surat-masuk): buat komponen viewer pdf bawaan browser"
git commit -m "fix(disposisi): perbaiki kalkulasi status keterlambatan tindak lanjut"
```

---

## 🔍 Standar Kualitas Sebelum Komit (Pre-Commit Quality Gate)

Sebelum mengajukan perubahan ke cabang utama:
1. Pastikan tidak ada kesalahan kompilasi tipe data:
   ```bash
   npx tsc --noEmit
   ```
2. Pastikan linter lolos tanpa peringatan kritis:
   ```bash
   npm run lint
   ```
3. Pastikan pengujian build lolos:
   ```bash
   npm run build
   ```
4. Pastikan tidak ada file yang melebihi batas 200 baris kode.
