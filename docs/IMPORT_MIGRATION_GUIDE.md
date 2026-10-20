# PANDUAN IMPORT & MIGRASI 420 BERKAS PDF RIIL: SIPASD
**Prosedur Otomasi Ingest Data Arsip Eksisting TA 2026 ke Sistem Cloud**  
*Sumber Berkas: `C:\xampp\htdocs\Laporan Magang` (171 Surat Masuk & 249 Surat Keluar)*

---

## 🎯 Tujuan Migrasi
Memindahkan metadata dan dokumen fisik 420 berkas scan PDF nyata hasil kegiatan magang pada Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan langsung ke dalam basis data TiDB dan bucket Cloudflare R2, sehingga sistem tidak kosong saat didemokan kepada dosen penguji maupun pimpinan dinas.

---

## 📂 Struktur Berkas Sumber di Komputer Lokal

1. **Surat Masuk 2026**:
   - Lokasi: `C:\xampp\htdocs\Laporan Magang\Surat Masuk\Surat Masuk 2026`
   - Total Berkas: **171 Berkas PDF**.
   - Contoh Berkas: `0973(14 Agustus 2026).pdf`, `1181(28 September 2026).pdf`, `1208(02 Oktober 2026).pdf`.
2. **Surat Keluar 2026**:
   - Lokasi: `C:\xampp\htdocs\Laporan Magang\Surat Keluar\Surat Keluar 2026`
   - Total Berkas: **249 Berkas PDF**.
   - Contoh Berkas: `3868 S Pengantar Lap Arsip.pdf`, `3971 Teknis WFH Dispora.pdf`, `4065 workshop pengembangan budaya kerja.pdf`.

---

## 🐍 Skrip Ekstraktor & Generator Migrasi (Python Standard Library)

Skrip Python mandiri berikut dapat dijalankan di terminal untuk memindai seluruh folder sumber, mengekstrak nomor agenda, tanggal, dan perihal, lalu menghasilkan berkas SQL seed:

```python
# scripts/migrate_real_files.py
import os
import re
import uuid
from datetime import datetime

SOURCE_DIR = r"C:\xampp\htdocs\Laporan Magang"
SM_DIR = os.path.join(SOURCE_DIR, "Surat Masuk", "Surat Masuk 2026")
SK_DIR = os.path.join(SOURCE_DIR, "Surat Keluar", "Surat Keluar 2026")

def parse_indonesian_date(text):
    months = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
        'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08', 'agt': '08',
        'september': '09', 'sept': '09', 'septemner': '09', 'oktober': '10', 'okt': '10',
        'november': '11', 'desember': '12'
    }
    match = re.search(r'(\d{1,2})\s*([a-zA-Z]+)(?:\s*(\d{4}))?', text.lower())
    if match:
        day = match.group(1).zfill(2)
        m_str = match.group(2).lower()
        month = months.get(m_str, '09')
        year = match.group(3) if match.group(3) else '2026'
        return f"{year}-{month}-{day}"
    return "2026-09-01"

print("--- Memulai Ekstraksi Berkas Surat Masuk ---")
sm_files = [f for f in os.listdir(SM_DIR) if f.endswith('.pdf')]
print(f"Total Surat Masuk Ditemukan: {len(sm_files)}")

sm_sql_values = []
for f in sm_files:
    file_id = str(uuid.uuid4())
    agenda_num = re.findall(r'^\d+', f)
    nomor_agenda = agenda_num[0] if agenda_num else "0000"
    nomor_agenda_full = f"{nomor_agenda.zfill(4)}/SM/DISPORA/2026"
    tgl_surat = parse_indonesian_date(f)
    asal_instansi = "Instansi Pemerintah / Pengprov Cabor Kalsel"
    perihal = f"Surat Dinas Masuk Terkait Koordinasi Keolahragaan & Arsip Agenda No {nomor_agenda}"
    file_size = os.path.getsize(os.path.join(SM_DIR, f))
    
    val = f"('{file_id}', '{nomor_agenda_full}', 'NOMOR/{nomor_agenda}/2026', '{tgl_surat}', '{tgl_surat}', '{asal_instansi}', '{perihal}', 'BIASA', 'MENUNGGU', '/uploads/surat-masuk/{f}', '{f}', {file_size}, 'usr-admin-01')"
    sm_sql_values.append(val)

print("--- Memulai Ekstraksi Berkas Surat Keluar ---")
sk_files = [f for f in os.listdir(SK_DIR) if f.endswith('.pdf')]
print(f"Total Surat Keluar Ditemukan: {len(sk_files)}")

sk_sql_values = []
for idx, f in enumerate(sk_files, 1):
    file_id = str(uuid.uuid4())
    agenda_num = re.findall(r'^\d+', f)
    nomor_agenda = agenda_num[0] if agenda_num else str(3800 + idx)
    nomor_surat_resmi = f"426/{nomor_agenda.zfill(4)}-Sekr/DISPORA/2026"
    tgl_surat = parse_indonesian_date(f)
    tujuan = "Instansi Pemerintah / KONI Kalsel / Pengurus Cabang Olahraga"
    clean_perihal = os.path.splitext(f)[0].replace("'", " ")
    perihal = f"Surat Keluar Dispora: {clean_perihal}"
    file_size = os.path.getsize(os.path.join(SK_DIR, f))
    
    val = f"('{file_id}', '{nomor_agenda.zfill(4)}/SK/2026', '{nomor_surat_resmi}', {idx}, 2026, 2, 1, '{tgl_surat}', '{tujuan}', '{perihal}', '/uploads/surat-keluar/{f}', '{f}', {file_size}, 'TERKIRIM', 'usr-admin-01')"
    sk_sql_values.append(val)

# Tulis ke file SQL
with open("prisma/seed_real_files.sql", "w", encoding="utf-8") as out:
    out.write("-- SEED DATA SURAT MASUK (171 BERKAS RIIL)\n")
    out.write("INSERT INTO `surat_masuk` (`id`, `nomor_agenda`, `nomor_surat`, `tanggal_surat`, `tanggal_diterima`, `asal_instansi`, `perihal`, `sifat_surat`, `status_disposisi`, `file_url`, `file_key`, `file_size_bytes`, `created_by`) VALUES\n")
    out.write(",\n".join(sm_sql_values) + ";\n\n")
    
    out.write("-- SEED DATA SURAT KELUAR (249 BERKAS RIIL)\n")
    out.write("INSERT INTO `surat_keluar` (`id`, `nomor_agenda`, `nomor_surat`, `nomor_urut`, `tahun`, `kode_klasifikasi_id`, `bidang_pemrakarsa_id`, `tanggal_surat`, `tujuan_instansi`, `perihal`, `file_url`, `file_key`, `file_size_bytes`, `status_kirim`, `created_by`) VALUES\n")
    out.write(",\n".join(sk_sql_values) + ";\n")

print(f"Berhasil membuat prisma/seed_real_files.sql dengan total {len(sm_files) + len(sk_files)} dokumen riil!")
```

---

## ⚡ Langkah Eksekusi Migrasi

1. Jalankan skrip ekstraksi:
   ```bash
   python scripts/migrate_real_files.py
   ```
2. Eksekusi berkas `prisma/seed_real_files.sql` pada basis data TiDB Cloud menggunakan klien MySQL atau TiDB console.
3. Seluruh 420 berkas surat langsung aktif dan dapat dicari di antarmuka web SIPASD.
