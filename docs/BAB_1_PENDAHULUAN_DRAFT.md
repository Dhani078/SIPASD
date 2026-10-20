# DRAF NASKAH LAPORAN MAGANG: BAB I PENDAHULUAN
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Penulis: Muhammad Rizki Ramadhani (NPM: 2310010406)*  
*Lokasi Magang: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan*

---

## 1.1 Latar Belakang Masalah
Penerapan Sistem Pemerintahan Berbasis Elektronik (SPBE) sesuai amanat Peraturan Presiden Nomor 95 Tahun 2018 menuntut instansi pemerintah untuk mengoptimalkan pemanfaatan teknologi informasi guna mewujudkan tata kelola kepemerintahan yang bersih, efektif, transparan, dan akuntabel.

Dinas Kepemudaan dan Olahraga (DISPORA) Provinsi Kalimantan Selatan, yang berkedudukan di Jalan Pramuka No. 4 Banjarmasin, merupakan unsur pelaksana urusan pemerintahan daerah di bidang kepemudaan dan keolahragaan. Sebagai instansi yang mengoordinasikan pembinaan atlet banua, perhelatan kejuaraan daerah hingga nasional, serta mengelola 11 fasilitas venue olahraga provinsi (seperti GOR Hasanuddin HM, Kolam Renang Mulawarman, dan Stadion 17 Mei), Sekretariat Dispora Kalsel mengelola ratusan berkas naskah dinas setiap bulannya.

Sebagai wujud inisiatif digitalisasi awal, pihak Subbagian Umum dan Kepegawaian (Tata Usaha) telah melakukan pemindaian (*scanning*) terhadap berkas surat fisik yang telah selesai diproses (surat yang telah ditandatangani pimpinan, distempel cap basah dinas, dan memiliki catatan coretan disposisi fisik), kemudian menyimpannya ke layanan penyimpanan awan Google Drive pada akun resmi `arsipdispora2026` di dalam folder `sistem magang`.

Namun, berdasarkan hasil observasi dan keterlibatan langsung penulis selama melaksanakan Kerja Praktik (Magang) pada Sekretariat Dispora Prov. Kalsel, penyimpanan arsip pindaian pada Google Drive saat ini menimbulkan kendala teknis dan operasional yang signifikan:

1. **Penumpukan Berkas Tanpa Indeks Metadata Terstruktur**:
   Sebanyak **420 berkas pindaian PDF** (terdiri atas 171 berkas pada subfolder `Surat Masuk 2026` dan 249 berkas pada subfolder `Surat Keluar 2026`) hanya ditumpuk dalam direktori Google Drive tanpa adanya kolom metadata penting, seperti Asal Instansi Pengirim, Tanggal Diterima, Kode Klasifikasi Arsip, Ringkasan Isi Pokok Surat, maupun Catatan Disposisi Fisik pimpinan.
2. **Pola Penamaan Berkas yang Tidak Konsisten dan Acak**:
   Penamaan berkas PDF pada Google Drive dilakukan secara manual dan bervariasi, seperti `0973(14 Agustus 2026).pdf`, `1181(28 September 2026).pdf`, `3868 S Pengantar Lap Arsip.pdf`, hingga `7480-82, 3 surat_20260902_0001.pdf`. Akibatnya, sistem pencarian bawaan Google Drive sering kali gagal menemukan berkas yang dicari.
3. **Lamanya Waktu Temu-Kembali Arsip (*Information Retrieval Time*)**:
   Ketika pimpinan dinas, staf teknis bidang, atau instansi auditor pengawas (Inspektorat Daerah / BPK) memerlukan salinan surat tertentu secara mendesak, petugas kearsipan harus membuka dan memeriksa file PDF satu per satu di peramban. Proses manual ini memakan waktu antara **15 hingga 30 menit** hanya untuk memastikan satu dokumen surat.
4. **Ketiadaan Fitur Rekapitulasi Buku Agenda Kedinasan**:
   Google Drive tidak dapat menghasilkan lembaran register Buku Agenda resmi berformat spreadsheet (*Microsoft Excel*) yang sesuai dengan format tata naskah dinas baku Pemerintah Provinsi Kalimantan Selatan untuk lampiran Laporan Pertanggungjawaban (LPJ/SPJ).

Melihat permasalahan di atas, diperlukan sebuah sistem repositori e-arsip berbasis web responsif yang mampu mengorganisasi, mengindeks, dan menampilkan kembali 420+ berkas PDF pindaian tersebut secara instan. Oleh karena itu, penulis merancang dan membangun **"Sistem Informasi Pengelolaan Arsip Surat Dispora (SIPASD)"** berbasis web responsif menggunakan *Next.js 15, TypeScript, Tailwind CSS, TiDB Cloud Serverless, dan Cloudflare R2*. Sistem ini memangkas waktu pencarian dokumen dari belasan menit menjadi kurang dari 2 detik serta dapat diakses secara fleksibel melalui komputer kerja maupun ponsel pintar (*smartphone*).

---

## 1.2 Rumusan Masalah
1. Bagaimana menganalisis dan merancang sistem repositori e-arsip surat digital berbasis web responsif untuk menggantikan penyimpanan manual Google Drive di Dispora Kalsel?
2. Bagaimana membangun modul pencarian cepat multi-filter dan pemutar dokumen bawaan (*in-browser PDF streaming viewer*) agar 420+ berkas PDF arsip dapat ditemukan dalam waktu < 2 detik?
3. Bagaimana mengimplementasikan pencatatan metadata riwayat disposisi fisik pimpinan beserta fitur cetak salinan lembar disposisi standar Pemprov Kalsel?
4. Bagaimana merancang modul generator ekspor Buku Agenda Surat Masuk dan Keluar berformat spreadsheet Microsoft Excel (.xlsx) sesuai format resmi dinas?

---

## 1.3 Batasan Masalah
1. **Ruang Lingkup Instansi**: Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan.
2. **Karakteristik Dokumen**: Berkas yang dikelola merupakan **arsip statis digital (selesai diproses)** hasil pindaian naskah dinas fisik yang sah bertanda tangan dan cap stempel pada Tahun Anggaran 2026.
3. **Dataset Pengujian**: Menggunakan 420 berkas PDF riil eksisting dari Google Drive instansi (171 berkas Surat Masuk dan 249 berkas Surat Keluar).
4. **Format & Batasan Berkas**: Dokumen berformat *Portable Document Format* (PDF) dengan batas ukuran file maksimal 25 MB.
5. **Hak Akses Pengguna (RBAC)**: Dibagi menjadi 4 tingkat peran: Super Admin, Petugas Arsip/TU, Pimpinan, dan Bidang/Seksi.
6. **Batasan Pengecualian**: Sistem tidak mencakup pembuatan surat draf baru (bukan sistem live mail composition) dan tidak mencakup modul transaksi keuangan internal (TBP/SPJ).

---

## 1.4 Tujuan & Manfaat

### 1.4.1 Tujuan
1. Membangun aplikasi web responsif SIPASD sebagai repositori e-arsip terindeks pengganti folder manual Google Drive.
2. Mempercepat waktu temu-kembali (*retrieval time*) berkas arsip surat menjadi < 2 detik melalui ponsel maupun laptop.
3. Menyediakan pencatatan riwayat disposisi fisik dan ekspor Buku Agenda format Excel baku secara otomatis.
4. Memenuhi syarat kelulusan mata kuliah Kerja Praktik (Magang) S1 Teknik Informatika UNISKA Banjarmasin.

### 1.4.2 Manfaat
1. **Bagi Instansi**: Memberikan kemudahan temu-kembali dokumen, efisiensi waktu staf tata usaha, dan keamanan arsip digital negara.
2. **Bagi Mahasiswa**: Memperdalam keahlian rekayasa web modern skala produksi (*cloud-native*) dan membangun pondasi penelitian Skripsi S1 semester 8.
3. **Bagi Akademik**: Menjadi sumbangsih nyata perguruan tinggi dalam mendukung digitalisasi SPBE di lingkungan Pemerintah Provinsi Kalimantan Selatan.
