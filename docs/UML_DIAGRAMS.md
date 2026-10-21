# SPESIFIKASI DIAGRAM UML SISTEM SIPASD
**Materi Lengkap Bab III Analisis dan Perancangan - Laporan Magang TI UNISKA**  
*Mencakup skenario Use Case, Activity Diagram, Sequence Diagram, dan Class Diagram E-Arsip Digital (Dilengkapi Kode PlantUML)*

---

## 1. Use Case Diagram E-Arsip

### A. Matriks Aktor dan Use Case

| Aktor | Deskripsi Peran | Use Case yang Dapat Diakses |
| :--- | :--- | :--- |
| **Super Admin** | Administrator Teknis IT Dispora | Kelola Akun Pengguna, Kelola Master Klasifikasi, Lihat Audit Trail, Akses Seluruh Arsip. |
| **Petugas Arsip (TU)** | Staf Subbag Umum & Kepegawaian (Tata Usaha) | Pengindeksan Berkas Pindaian PDF, Catat Riwayat Disposisi Fisik, Ekspor Agenda Excel. |
| **Pimpinan** | Kepala Dinas / Sekretaris Dinas | Temu-Kembali Arsip (< 2 Detik), Pratinjau Streaming PDF, Pantau Statistik Volume Arsip. |
| **Kepala Bidang** | Pimpinan Unit Kerja Pelaksana | Cari & Lihat Arsip Surat Masuk/Keluar Bidang, Unduh Dokumen PDF, Cetak Salinan Disposisi. |

### B. Deskripsi Tekstual Use Case Utama

#### Use Case: Temu-Kembali Dokumen & Pratinjau Streaming PDF (< 2 Detik)
- **Aktor**: Pimpinan / Kepala Bidang / Petugas Arsip.
- **Prasyarat**: Pengguna telah terautentikasi ke sistem web SIPASD.
- **Skenario Normal**:
  1. Pengguna membuka menu Katalog Arsip Surat Masuk atau Surat Keluar.
  2. Pengguna mengetikkan kata kunci pencarian (misal: `Kejuaraan Daerah` atau `0973`) pada kolom pencarian instan.
  3. Sistem melakukan kueri pencarian berindeks pada database TiDB Cloud dan menampilkan daftar arsip yang cocok dalam waktu kurang dari 1 detik.
  4. Pengguna menekan baris arsip atau tombol **"Pratinjau PDF"**.
  5. Sistem meminta presigned stream URL terenkripsi dari Cloudinary & Google Drive dan memuat berkas PDF langsung pada panel pemutar dokumen (*built-in streaming PDF viewer*) di samping tabel.
  6. Pengguna membaca dokumen PDF secara lengkap tanpa perlu mengunduh file fisik ke memori laptop/ponsel.
- **Kondisi Akhir**: Dokumen terbuka lancar di browser dan riwayat pencarian terekam di tabel `audit_logs`.

#### Use Case: Pengindeksan Berkas Pindaian PDF & Catat Disposisi Fisik
- **Aktor**: Petugas Arsip (TU).
- **Prasyarat**: Petugas memiliki berkas fisik surat yang telah dipindai menjadi PDF dari Google Drive.
- **Skenario Normal**:
  1. Petugas membuka menu **Pengindeksan Arsip Baru**.
  2. Petugas mengunggah berkas PDF pindaian (otomatis terkirim ke Cloudinary & Google Drive).
  3. Petugas menginputkan Nomor Surat, Tanggal Surat, Tanggal Diterima, Asal Instansi, Kode Klasifikasi, Perihal, dan Ringkasan Isi.
  4. Petugas mencatat dokumentasi coretan pimpinan yang tertera pada lembar kertas fisik: nama pejabat pendisposisi, tanggal disposisi, bidang tujuan, instruksi yang dicentang, dan arahan tertulis.
  5. Petugas menekan tombol **Simpan Indeks Arsip**.
  6. Sistem menerbitkan Nomor Agenda Tahunan otomatis dan menyimpan seluruh metadata ke basis data TiDB.
- **Kondisi Akhir**: Arsip terindeks sempurna dan siap ditemukan oleh seluruh pegawai berhak akses.

### C. Kode PlantUML: Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam handwritten false
skinparam monochrome true

actor "Super Admin" as Admin
actor "Petugas Arsip (TU)" as TU
actor "Pimpinan (Kadis/Sekr)" as Pimpinan
actor "Kepala Bidang" as Kabid

rectangle "Repositori E-Arsip SIPASD" {
  usecase "Autentikasi Login & Logout" as UC_Auth
  usecase "Kelola Master Klasifikasi & User" as UC_Master
  usecase "Pencarian Multi-Filter (< 2 Detik)" as UC_Search
  usecase "Pratinjau In-Browser Streaming PDF" as UC_Viewer
  usecase "Indeks Berkas Pindaian Scan PDF" as UC_Indeks
  usecase "Perekaman Riwayat Disposisi Fisik" as UC_Disp_Record
  usecase "Cetak Salinan Lembar Disposisi" as UC_Disp_Print
  usecase "Ekspor Rekapitulasi Agenda Excel" as UC_Excel
  usecase "Monitoring Statistik Volume Arsip" as UC_Dashboard
  usecase "Audit Trail Akses Dokumen" as UC_Audit
}

Admin --> UC_Auth
Admin --> UC_Master
Admin --> UC_Audit
Admin --> UC_Dashboard

TU --> UC_Auth
TU --> UC_Search
TU --> UC_Viewer
TU --> UC_Indeks
TU --> UC_Disp_Record
TU --> UC_Disp_Print
TU --> UC_Excel

Pimpinan --> UC_Auth
Pimpinan --> UC_Search
Pimpinan --> UC_Viewer
Pimpinan --> UC_Disp_Print
Pimpinan --> UC_Dashboard
Pimpinan --> UC_Excel

Kabid --> UC_Auth
Kabid --> UC_Search
Kabid --> UC_Viewer
Kabid --> UC_Disp_Print
@enduml
```

---

## 2. Activity Diagram: Temu-Kembali Dokumen & Pratinjau PDF

```plantuml
@startuml
|Pengguna (Pimpinan / Staf)|
start
:Buka menu Katalog E-Arsip;
:Ketik kata kunci pencarian (Nomor/Perihal/Instansi);
:Pilih filter sifat surat atau kode klasifikasi;
|Sistem SIPASD (Next.js & TiDB)|
:Eksekusi kueri pencarian berindeks pada TiDB Cloud;
:Ambil daftar metadata arsip yang cocok (< 1 detik);
|Pengguna (Pimpinan / Staf)|
:Pilih dokumen surat dari tabel katalog;
:Klik 'Pratinjau PDF';
|Sistem SIPASD & Cloudinary & Google Drive|
:Minta presigned streaming URL ke Cloudinary & Google Drive;
:Alirkan data PDF ke built-in PDF viewer di layar;
:Catat aksi buka berkas ke tabel audit_logs;
|Pengguna (Pimpinan / Staf)|
:Membaca dokumen PDF pindaian langsung di layar;
stop
@enduml
```

---

## 3. Sequence Diagram: Streaming Viewer Berkas PDF

```plantuml
@startuml
autonumber
actor Pengguna
boundary "UI: Katalog E-Arsip" as UI
control "ArsipController" as Action
entity "TiDB Database" as DB
entity "Cloudinary & Google Drive" as R2
entity "AuditLogger" as Audit

Pengguna -> UI : Klik "Pratinjau PDF" pada baris surat
activate UI
UI -> Action : getStreamingUrl(fileId)
activate Action

Action -> DB : Cari metadata cloudinary_public_id berdasarkan fileId
activate DB
DB --> Action : Return cloudinary_public_id
deactivate DB

Action -> R2 : Generate presigned GET URL (Masa aktif 15 menit)
activate R2
R2 --> Action : Return presignedUrl
deactivate R2

Action -> Audit : logAction('LIHAT_PDF', 'arsip_surat', fileId)
activate Audit
Audit -> DB : INSERT INTO audit_logs (...)
Audit --> Action : OK
deactivate Audit

Action --> UI : Return { success: true, url: presignedUrl }
UI --> Pengguna : Tampilkan dokumen PDF di panel in-browser viewer
deactivate Action
deactivate UI
@enduml
```
