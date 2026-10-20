# SPESIFIKASI DIAGRAM UML SISTEM SIPASD
**Materi Lengkap Bab III Analisis dan Perancangan — Laporan Magang TI UNISKA**  
*Mencakup skenario Use Case, Activity Diagram, Sequence Diagram, dan Class Diagram (Dilengkapi Kode PlantUML)*

---

## 1. Use Case Diagram

### A. Matriks Aktor dan Use Case

| Aktor | Deskripsi Peran | Use Case yang Dapat Diakses |
| :--- | :--- | :--- |
| **Super Admin** | Administrator Teknis IT Dispora | Kelola Data Pengguna, Kelola Master Dinas, Lihat Audit Trail, Akses Seluruh Modul. |
| **Pimpinan** | Kepala Dinas / Sekretaris Dinas | Telaah Surat Masuk, Pratinjau PDF, Terbitkan Disposisi, Monitoring Dashboard, Ekspor Laporan. |
| **Petugas Agenda** | Staf Subbag Umum & Kepegawaian (TU) | Rekam Surat Masuk, Unggah PDF, Booking Nomor Surat Keluar, Cetak Buku Ekspedisi & Agenda. |
| **Kepala Bidang** | Pimpinan Unit Kerja Pelaksana | Lihat Disposisi Masuk, Unduh PDF Lampiran, Perbarui Status Tindak Lanjut, Ambil Nomor Surat Keluar Bidang. |

### B. Deskripsi Tekstual Use Case Utama

#### Use Case: Menerbitkan Disposisi Surat Masuk
- **Aktor**: Pimpinan (Kepala Dinas / Sekretaris).
- **Prasyarat**: Pengguna telah terautentikasi dengan hak akses `PIMPINAN` dan terdapat surat masuk berstatus `MENUNGGU`.
- **Skenario Normal**:
  1. Pimpinan membuka modul Surat Masuk dan memilih surat yang akan ditelaah.
  2. Sistem menampilkan ringkasan metadata surat dan pratinjau PDF berkas fisik.
  3. Pimpinan menekan tombol **"Beri Disposisi"**.
  4. Sistem memunculkan jendela modal lembar disposisi.
  5. Pimpinan memilih Bidang Tujuan (misal: *Bidang Pembudayaan Olahraga*), menentukan tanggal batas waktu tindak lanjut, mencentang instruksi standar (*Tindak lanjuti / Koordinasikan / Hadiri*), dan mengetikkan catatan khusus.
  6. Pimpinan menekan tombol **"Kirim Disposisi"**.
  7. Sistem memvalidasi input, menyimpan data ke tabel `disposisi`, memperbarui status surat masuk menjadi `DIDISPOSISIKAN`, mencatat jejak di `audit_logs`, dan mengirim notifikasi visual ke akun Kepala Bidang.
- **Kondisi Akhir**: Disposisi tersimpan dan langsung muncul pada dashboard Kepala Bidang tujuan.

#### Use Case: Booking Nomor Surat Keluar (Anti-Nomor Dobel)
- **Aktor**: Petugas Agenda (TU) / Staf Bidang.
- **Prasyarat**: Pengguna terautentikasi dan memiliki draf surat dinas yang siap diberi nomor.
- **Skenario Normal**:
  1. Pengguna membuka modul Surat Keluar dan menekan tombol **"Ambil Nomor Surat Baru"**.
  2. Pengguna memilih Kode Klasifikasi (misal: `426` Keolahragaan), Bidang Pemrakarsa, tanggal surat, instansi tujuan, dan perihal surat.
  3. Pengguna menekan tombol **"Generate Nomor"**.
  4. Sistem memulai transaksi atomik database (`BEGIN TRANSACTION ... FOR UPDATE`).
  5. Sistem menghitung nomor urut tertinggi pada tahun berjalan untuk bidang tersebut (`MAX(nomor_urut) + 1`), menyusun format resmi: `426/0412-Sekr/DISPORA/2026`, dan menyimpan status sebagai `NOMOR_DIAMBIL`.
  6. Sistem melakukan `COMMIT` transaksi dan menampilkan nomor resmi di layar.
- **Kondisi Akhir**: Nomor surat resmi terkunci dan tidak dapat diambil oleh pengguna lain.

### C. Kode PlantUML: Use Case Diagram
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam handwritten false
skinparam monochrome true

actor "Super Admin" as Admin
actor "Pimpinan (Kadis/Sekr)" as Pimpinan
actor "Petugas Agenda (TU)" as TU
actor "Kepala Bidang" as Kabid

rectangle "Sistem Informasi SIPASD" {
  usecase "Autentikasi Login & Logout" as UC_Auth
  usecase "Kelola Master Dinas & Pegawai" as UC_Master
  usecase "Rekam Agenda Surat Masuk" as UC_SM_Input
  usecase "Pratinjau Berkas PDF" as UC_Viewer
  usecase "Terbitkan Lembar Disposisi" as UC_Disp_Create
  usecase "Tindak Lanjut Disposisi" as UC_Disp_Update
  usecase "Cetak Lembar Disposisi" as UC_Disp_Print
  usecase "Booking Nomor Surat Keluar" as UC_SK_Booking
  usecase "Rekam Buku Ekspedisi" as UC_Ekspedisi
  usecase "Monitoring Dashboard & Statistik" as UC_Dashboard
  usecase "Ekspor Rekapitulasi Excel" as UC_Excel
  usecase "Audit Trail & Keamanan" as UC_Audit
}

Admin --> UC_Auth
Admin --> UC_Master
Admin --> UC_Audit
Admin --> UC_Dashboard

Pimpinan --> UC_Auth
Pimpinan --> UC_Viewer
Pimpinan --> UC_Disp_Create
Pimpinan --> UC_Disp_Print
Pimpinan --> UC_Dashboard
Pimpinan --> UC_Excel

TU --> UC_Auth
TU --> UC_SM_Input
TU --> UC_Viewer
TU --> UC_Disp_Print
TU --> UC_SK_Booking
TU --> UC_Ekspedisi
TU --> UC_Excel

Kabid --> UC_Auth
Kabid --> UC_Viewer
Kabid --> UC_Disp_Update
Kabid --> UC_SK_Booking
Kabid --> UC_Dashboard
@enduml
```

---

## 2. Activity Diagram

### A. Alur Penerimaan Surat Masuk dan Disposisi Pimpinan
```plantuml
@startuml
|Petugas Agenda (TU)|
start
:Menerima berkas fisik surat masuk;
:Pindai (scan) berkas menjadi format PDF;
:Input metadata surat pada formulir SIPASD;
:Unggah berkas PDF;
:Simpan data agenda masuk;
|Sistem SIPASD|
:Generate Nomor Agenda otomatis;
:Simpan berkas ke Cloudflare R2;
:Simpan metadata ke TiDB Cloud;
:Ubah status menjadi 'MENUNGGU DISPOSISI';
|Pimpinan (Kadis/Sekr)|
:Buka menu Surat Masuk;
:Buka pratinjau PDF surat;
:Telaah pokok surat dan tentukan arahan;
:Pilih Bidang Tujuan disposisi;
:Pilih instruksi standar & catatan;
:Kirim lembar disposisi digital;
|Sistem SIPASD|
:Simpan lembar disposisi;
:Ubah status surat menjadi 'DIDISPOSISIKAN';
|Kepala Bidang|
:Menerima notifikasi disposisi baru;
:Buka lembar disposisi dan unduh PDF;
:Tugaskan staf untuk tindak lanjut;
:Isi catatan hasil tindak lanjut pada SIPASD;
:Tandai status 'SELESAI';
stop
@enduml
```

### B. Alur Permintaan Nomor Surat Keluar (Anti-Nomor Dobel)
```plantuml
@startuml
|Pemohon (Staf / TU)|
start
:Buka menu Surat Keluar;
:Klik 'Ambil Nomor Surat Baru';
:Pilih Kode Klasifikasi (Permendagri);
:Pilih Bidang Pemrakarsa;
:Isi tanggal, tujuan, dan perihal surat;
:Klik 'Booking Nomor';
|Sistem SIPASD (Database TiDB)|
:Kunci tabel penomoran (SELECT FOR UPDATE);
:Hitung nomor urut terakhir tahun berjalan;
:Nomor Urut Baru = Max(No_Urut) + 1;
:Susun format nomor surat resmi;
:Insert data surat keluar (Status: NOMOR_DIAMBIL);
:Bebaskan kunci transaksi (COMMIT);
|Pemohon (Staf / TU)|
:Salin nomor surat ke dokumen fisik/Word;
:Cetak dan proses tanda tangan basah pimpinan;
:Pindai surat bertanda tangan jadi PDF;
:Unggah PDF final ke sistem SIPASD;
:Catat data ekspedisi pengiriman kurir;
stop
@enduml
```

---

## 3. Sequence Diagram

### Sequence Diagram: Penerbitan Disposisi oleh Pimpinan
```plantuml
@startuml
autonumber
actor Pimpinan
boundary "UI: Modal Disposisi" as UI
control "DisposisiAction" as Action
entity "TiDB Database" as DB
entity "AuditLogger" as Audit

Pimpinan -> UI : Buka modal disposisi & input arahan
activate UI
Pimpinan -> UI : Klik "Kirim Disposisi"
UI -> Action : createDisposisi(formData)
activate Action

Action -> Action : Validasi Zod schema & session role
alt Validasi Gagal
    Action --> UI : Return { success: false, error: "Data tidak valid" }
else Validasi Sukses
    Action -> DB : INSERT INTO disposisi (id, surat_id, bidang_id, ...)
    activate DB
    DB --> Action : Sukses Insert
    deactivate DB

    Action -> DB : UPDATE surat_masuk SET status_disposisi = 'DIDISPOSISIKAN'
    activate DB
    DB --> Action : Sukses Update
    deactivate DB

    Action -> Audit : logAction('DISPOSISI', 'surat_masuk', surat_id)
    activate Audit
    Audit -> DB : INSERT INTO audit_logs (...)
    Audit --> Action : OK
    deactivate Audit

    Action --> UI : Return { success: true, message: "Disposisi terkirim" }
end

UI --> Pimpinan : Tampilkan notifikasi sukses & perbarui tabel
deactivate Action
deactivate UI
@enduml
```

---

## 4. Class Diagram

```plantuml
@startuml
skinparam classAttributeIconSize 0

class User {
  - id: String (UUID)
  - nip: String
  - namaLengkap: String
  - username: String
  - email: String
  - passwordHash: String
  - role: RoleEnum
  - jabatan: String
  - unitKerja: String
  + authenticate(password: String): Boolean
  + hasPermission(requiredRole: RoleEnum): Boolean
}

class BidangDispora {
  - id: Integer
  - kodeBidang: String
  - namaBidang: String
  - namaKepala: String
  - nipKepala: String
  + getDaftarDisposisiAktif(): List
}

class KlasifikasiSurat {
  - id: Integer
  - kode: String
  - namaKlasifikasi: String
  - uraian: String
  - retensiAktifTahun: Integer
  - retensiInaktifTahun: Integer
}

class SuratMasuk {
  - id: String (UUID)
  - nomorAgenda: String
  - nomorSurat: String
  - tanggalSurat: Date
  - tanggalDiterima: Date
  - asalInstansi: String
  - perihal: String
  - ringkasanIsi: String
  - sifatSurat: SifatEnum
  - statusDisposisi: StatusDisposisiEnum
  - fileUrl: String
  - fileSize: Long
  + create(data: SuratMasukInput): SuratMasuk
  + generateNomorAgenda(): String
  + updateStatus(status: StatusDisposisiEnum): Void
}

class Disposisi {
  - id: String (UUID)
  - suratMasukId: String
  - dariUserId: String
  - kepadaBidangId: Integer
  - batasWaktu: Date
  - instruksiStandar: String
  - catatanKhusus: String
  - status: StatusTindakLanjutEnum
  - catatanTindakLanjut: String
  - tanggalSelesai: DateTime
  + submitTindakLanjut(catatan: String): Void
}

class SuratKeluar {
  - id: String (UUID)
  - nomorAgenda: String
  - nomorSurat: String
  - nomorUrut: Integer
  - tahun: Integer
  - tanggalSurat: Date
  - tujuanInstansi: String
  - perihal: String
  - fileUrl: String
  - statusKirim: StatusKirimEnum
  + generateNomorSurat(kodeId: Integer, bidangId: Integer): String
}

class BukuEkspedisi {
  - id: String (UUID)
  - suratKeluarId: String
  - tanggalKirim: Date
  - kurirPengirim: String
  - penerimaNama: String
  - buktiTerimaUrl: String
}

class AuditLog {
  - id: Long
  - userId: String
  - action: String
  - resource: String
  - resourceId: String
  - ipAddress: String
  - userAgent: String
  - createdAt: DateTime
  + record(action: String, res: String, id: String): Void
}

User "1" -- "0..*" SuratMasuk : mencatat >
User "1" -- "0..*" Disposisi : menerbitkan >
User "1" -- "0..*" SuratKeluar : membuat >
User "1" -- "0..*" AuditLog : menghasilkan >

SuratMasuk "1" *-- "0..*" Disposisi : memiliki >
BidangDispora "1" -- "0..*" Disposisi : menerima >
BidangDispora "1" -- "0..*" SuratKeluar : memprakarsai >

KlasifikasiSurat "1" -- "0..*" SuratKeluar : mengklasifikasikan >
SuratKeluar "1" -- "0..1" BukuEkspedisi : dicatat pada >
@enduml
```
