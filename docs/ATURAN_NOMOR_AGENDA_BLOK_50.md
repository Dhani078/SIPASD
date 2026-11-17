# SPESIFIKASI DAN ATURAN SISTEM NOMOR AGENDA BLOK 50 (5 DIGIT)
**Sistem Informasi Pengelolaan Arsip Surat Dispora (SIPASD)**  
*Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*  
*Tahun Anggaran 2026 - Uji Kelayakan Implementasi 2027*

---

## 1. Latar Belakang & Filosofi Aturan

Sesuai instruksi pimpinan dan tata kelola kearsipan resmi di lingkungan Dispora Provinsi Kalsel:
1. **Hari Kerja Resmi (Senin s.d. Jumat)**:
   - Kuota nomor agenda dialokasikan murni per hari kerja (Senin sampai Jumat).
   - Hari Sabtu dan Minggu adalah hari libur (kuota 0). Naskah yang bertanggal akhir pekan otomatis digulirkan (*roll-forward*) ke hari kerja berikutnya (Senin terdekat).
   - Hari libur nasional pada hari kerja tetap dihitung slotnya dalam kalender kerja untuk menjaga konsistensi urutan nomor agenda yang mudah diprediksi dan stabil.

2. **Format 5 Digit Integer**:
   - Total hari kerja (Senin-Jumat) dalam satu tahun kalender (misal 2026) berjumlah 261 hari kerja.
   - Dengan alokasi 50 nomor per hari kerja, rentang nomor mencapai 13.050 naskah.
   - Format standar nomor agenda menggunakan 5 digit angka dengan *zero-padding* (`00001` s.d. `13050`), diikuti kode naskah dan tahun:
     - Surat Masuk: `{5_DIGIT}/SM/DISPORA/{TAHUN}` (contoh: `04351/SM/DISPORA/2026`)
     - Surat Keluar: `{5_DIGIT}/SK/DISPORA/{TAHUN}` (contoh: `04351/SK/DISPORA/2026`)

---

## 2. Rumus Alokasi Blok 50 Slot Harian

Setiap hari kerja ke-$N$ dalam tahun kalender memiliki rentang slot nomor agenda tetap:
- **Slot Awal**: $\text{startSlot} = (N - 1) \times 50 + 1$
- **Slot Akhir**: $\text{endSlot} = N \times 50$

### Contoh Perhitungan:
- **Hari Kerja 1** (Kamis, 01 Jan 2026): Nomor `00001` s.d. `00050`
- **Hari Kerja 2** (Jumat, 02 Jan 2026): Nomor `00051` s.d. `00100`
- **Hari Kerja 3** (Senin, 05 Jan 2026): Nomor `00101` s.d. `00150`
- **Hari Kerja 88** (Senin, 04 Mei 2026): Nomor `04351` s.d. `04400`
- **Hari Kerja 200** (Rabu, 07 Okt 2026): Nomor `09951` s.d. `10000`
- **Hari Kerja 261** (Kamis, 31 Des 2026): Nomor `13001` s.d. `13050`

---

## 3. Penanganan Underflow (Kuota Tidak Penuh)

Jika pada suatu hari kerja jumlah surat yang masuk atau keluar kurang dari 50 (misal hanya 30 naskah dari slot `00001` s.d. `00030`):
- Hari kerja berikutnya (misal Selasa) **tetap mulai dari slot hari kerjanya**, yaitu `00051`.
- Sisa slot yang belum terpakai pada hari sebelumnya (`00031` s.d. `00050`) tetap direservasi untuk hari tersebut.
- Jika ada surat susulan bertanggal sama di kemudian hari, sistem otomatis mengisi slot kosong berikutnya (`00031`, dst.) pada hari kerja tersebut tanpa menggeser nomor hari lain.

---

## 4. Penanganan Overflow (Kebutuhan Melebihi Kuota 50)

Jika pada satu hari kerja terdapat kebutuhan naskah dinas melebihi 50 surat:
- Naskah ke-1 s.d. ke-50 menggunakan nomor slot reguler (`startSlot` s.d. `endSlot`).
- Naskah ke-51 dan seterusnya menggunakan sub-indeks pecahan dari slot ke-50:
  - Naskah 51: `{endSlot}.01` (contoh: `00050.01`)
  - Naskah 52: `{endSlot}.02` (contoh: `00050.02`)
  - Naskah 53: `{endSlot}.03` (contoh: `00050.03`)
- Dengan mekanisme ini, nomor hari berikutnya tetap aman dan tidak pernah bertabrakan.

---

## 5. Status Migrasi Data Historis (Opsi B)

Seluruh data naskah dinas tahun 2026 pada database TiDB Cloud Serverless telah dimigrasikan secara penuh:
- **Surat Masuk**: 170 naskah berhasil ditata ulang sesuai urutan tanggal terima dan slot hari kerja 5 digit. Tingkat keunikan: 170/170 (100% unik, 0 duplikat).
- **Surat Keluar**: 253 naskah berhasil ditata ulang sesuai urutan tanggal terbit dan slot hari kerja 5 digit. Tingkat keunikan: 253/253 (100% unik, 0 duplikat).
- Cadangan prapembaharuan tersimpan di `scripts/backup_agendas_before_mig.json`.
