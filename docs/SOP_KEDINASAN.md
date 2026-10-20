# STANDAR OPERASIONAL PROSEDUR (SOP) PERSURATAN DINAS
**Tata Kelola Korespondensi & Disposisi Elektronik Berbasis SIPASD**  
*Instansi: Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 📌 SOP-01: Penerimaan & Registrasi Agenda Surat Masuk

### Tujuan
Menstandarkan alur penerimaan surat dinas dari instansi luar hingga tercatat secara elektronik di sistem SIPASD dalam waktu maksimal 10 menit setelah berkas fisik tiba.

### Pelaksana
- Pengadministrasi Umum / Staf Tata Usaha (Subbagian Umum & Kepegawaian).

### Langkah Operasional
1. Staf TU menerima berkas fisik surat masuk dari kurir/ekspedisi luar.
2. Staf TU memeriksa kelengkapan fisik berkas: keaslian tanda tangan, stempel basah, dan lampiran.
3. Staf TU melakukan pemindaian (*scanning*) berkas menggunakan scanner mesin resolusi minimal 200 DPI (format PDF).
4. Staf TU membuka aplikasi SIPASD, memilih menu **Surat Masuk -> Rekam Surat Baru**.
5. Mengisi data formulir:
   - Nomor Surat Instansi Pengirim.
   - Tanggal Surat & Tanggal Berkas Diterima.
   - Asal Instansi Pengirim.
   - Perihal & Ringkasan Isi Pokok Surat.
   - Sifat Surat (*Biasa*, *Penting*, *Segera*, *Amat Segera / Kilat*).
6. Mengunggah pindaian berkas PDF (otomatis disimpan ke Cloudflare R2).
7. Menekan tombol **Simpan Agenda**. Sistem secara otomatis menerbitkan **Nomor Agenda Masuk Tahunan**.
8. Menempelkan stiker/cap agenda fisik pada pojok kanan atas lembar pertama surat dengan menuliskan Nomor Agenda yang diterbitkan sistem.

---

## 📌 SOP-02: Penelaahan & Penerbitan Disposisi Pimpinan

### Tujuan
Memastikan pimpinan dinas (Kepala Dinas / Sekretaris) dapat menelaah dan memberikan arahan disposisi secara tepat waktu tanpa menunggu fisik berkas berpindah meja.

### Pelaksana
- Kepala Dinas / Sekretaris Dinas.

### Langkah Operasional
1. Pimpinan masuk ke akun SIPASD melalui laptop dinas atau perangkat seluler (*mobile browser*).
2. Pimpinan membuka menu **Disposisi -> Menunggu Telaah**. Surat berkategori *Kilat / Segera* secara visual ditandai lencana merah dan berada di urutan teratas.
3. Pimpinan menekan tombol **Pratinjau PDF** untuk membaca dokumen lengkap di layar.
4. Menekan tombol **Beri Disposisi**:
   - Memilih Bidang Tujuan (Sekretariat, Pembudayaan Olahraga, Prestasi Olahraga, Pemuda, atau Sarana Prasarana).
   - Menetapkan tanggal batas waktu penyelesaian (*due date*).
   - Memilih instruksi baku (*Tindak lanjuti / Pelajari / Hadiri / Koordinasikan / Fasilitasi / Siapkan Bahan*).
   - Menambahkan catatan instruksi khusus (jika diperlukan arahan spesifik).
5. Menekan tombol **Kirim Disposisi**.
6. Sistem langsung memperbarui status surat menjadi `DIDISPOSISIKAN` dan menyajikan notifikasi tugas pada dasbor Kepala Bidang yang dituju.

---

## 📌 SOP-03: Tindak Lanjut oleh Unit Kerja / Bidang Pelaksana

### Tujuan
Memastikan arahan pimpinan segera dieksekusi oleh pejabat pelaksana teknis dan terekam progresnya secara transparan.

### Pelaksana
- Kepala Bidang / Kepala Subbagian / Pejabat Fungsional Terkait.

### Langkah Operasional
1. Kepala Bidang menerima pemberitahuan disposisi baru pada antarmuka SIPASD.
2. Membuka detail disposisi dan mencetak **Lembar Disposisi Standar Pemprov Kalsel** untuk disematkan pada map berkas kerja.
3. Menugaskan staf teknis untuk menyusun telaahan staf, menghadiri rapat, atau menyiapkan draf balasan.
4. Setelah tugas berproses atau selesai, Kepala Bidang membuka kembali SIPASD:
   - Mengubah status disposisi menjadi `SEDANG_DIPROSES` atau `SELESAI`.
   - Mengetikkan rangkuman laporan pelaksanaan pada kolom *Catatan Tindak Lanjut*.
   - Mengunggah berkas bukti laporan (foto kegiatan, notula rapat, atau draf surat balasan).
5. Sistem secara otomatis memperbarui status surat di dashboard pimpinan menjadi tuntas.

---

## 📌 SOP-04: Registrasi & Penomoran Surat Keluar (Anti-Nomor Dobel)

### Tujuan
Mencegah terjadinya nomor surat ganda atau selisih tanggal penomoran antar subbagian di lingkungan Dispora Kalsel.

### Pelaksana
- Konseptor Surat Bidang & Petugas Penomoran TU.

### Langkah Operasional
1. Konseptor surat menyiapkan draf naskah dinas yang telah disetujui pimpinan.
2. Konseptor membuka menu **Surat Keluar -> Ambil Nomor Surat Baru**.
3. Memilih Kode Klasifikasi Arsip (misal: `426` Keolahragaan, `005` Undangan, `800` Kepegawaian).
4. Memilih Bidang Pemrakarsa, tanggal penerbitan surat, tujuan instansi, dan perihal.
5. Menekan tombol **Booking Nomor**.
6. Sistem mengunci nomor urut terbaru melalui transaksi basis data atomik dan menghasilkan format nomor surat resmi:
   `[KodeKlasifikasi]/[NoUrut]-Sekr/DISPORA/[Tahun]`
7. Konseptor menyalin nomor tersebut ke dokumen naskah dinas untuk dicetak dan ditandatangani basah oleh pimpinan.
8. Setelah ditandatangani dan distempel basah, pindaian PDF surat final diunggah ke SIPASD sebagai dokumen arsip resmi negara.

---

## 📌 SOP-05: Pendistribusian Berkas & Buku Ekspedisi Digital

### Tujuan
Merekam bukti penyerahan berkas fisik surat keluar kepada instansi penerima secara tertib administrasi.

### Pelaksana
- Staf Ekspedisi / Kurir Internal Dispora Kalsel.

### Langkah Operasional
1. Petugas ekspedisi membuka menu **Buku Ekspedisi** pada aplikasi SIPASD.
2. Memilih surat keluar yang akan dikirimkan.
3. Mencatat tanggal pengiriman fisik dan nama kurir penanggung jawab.
4. Mengantarkan berkas fisik ke instansi tujuan.
5. Meminta tanda tangan, nama terang, dan cap stempel penerima pada lembar tanda terima fisik.
6. Memotret lembar tanda terima fisik dan mengunggahnya ke menu ekspedisi SIPASD.
7. Sistem menandai status pengiriman surat keluar menjadi `TERKIRIM & DIARSIPKAN`.
