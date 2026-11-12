DIMENSI BIDANG PADA SIPASD: DROPDOWN, FILTER, DAN LAPORAN

Dokumen ini mencatat keputusan teknis dan pemetaan data untuk dimensi bidang kerja (unit kerja internal) Dispora Provinsi Kalimantan Selatan pada aplikasi SIPASD. Disusun agar penelusuran arsip per bidang dapat dipertanggungjawabkan pada laporan magang dan tidak menimbulkan salah tafsir saat sidang.

1. STRUKTUR BIDANG RIIL DISPORA KALSEL

Berdasarkan dokumen profil instansi dan tabel bidang_dispora di TiDB, unit kerja internal yang dipakai sistem terdiri dari 9 baris:

- id 1: Sekretariat Dispora
- id 2: Bidang Pembudayaan Olahraga
- id 3: Bidang Peningkatan Prestasi Olahraga
- id 4: Bidang Pengembangan dan Pemberdayaan Pemuda (gabungan)
- id 5: Bidang Sarana dan Prasarana Olahraga
- id 6: Subbagian Keuangan
- id 7: Subbagian Umum dan Kepegawaian
- id 8: Subbagian Perencanaan dan Pelaporan
- id 9: Bidang Pemberdayaan Pemuda (berdiri sendiri)

Catatan penting: id 4 adalah bidang gabungan warisan data awal, sedangkan id 9 adalah bidang Pemberdayaan Pemuda yang berdiri sendiri. Keduanya hidup berdampingan di database. Seluruh disposisi riil saat ini masuk ke id 1 sampai id 5, sedangkan id 6 sampai id 9 baru terpakai pada surat keluar sebagai bidang pemrakarsa.

2. LABEL DROPDOWN YANG DITAMPILKAN KE PENGGUNA

Antarmuka memakai label ringkas agar muat pada layar ponsel. Daftar label berada di src/data/constants.ts dan dipakai bersama oleh modal entri, modal edit, filter arsip, grafik dashboard, dan filter laporan:

- Sekretariat
- Subbagian Umum dan Kepegawaian
- Subbagian Keuangan
- Subbagian Perencanaan dan Pelaporan
- Pembudayaan Olahraga
- Peningkatan Prestasi
- Pengembangan Pemuda
- Pemberdayaan Pemuda
- Sarana dan Prasarana

Label ringkas dipetakan bolak balik dengan nama panjang di database melalui dua fungsi:

- mapDivision(nama_panjang) mengubah nama kolom database menjadi label ringkas. Dipakai saat membaca data.
- parseBidangId(label_ringkas) mengubah label menjadi id numerik. Dipakai saat menulis data.

Aturan urutan pemeriksaan pada mapDivision sengaja dibuat berlapis: Pengembangan diperiksa lebih dulu, lalu Pemberdayaan, lalu Pemuda. Urutan ini mencegah label Pemberdayaan Pemuda salah terbaca sebagai Pengembangan Pemuda ketika nama database masih mengandung kata Pemuda.

3. TITIK PENGGUNAAN DIMENSI BIDANG

Entri arsip surat masuk: dropdown Diteruskan Kepada Bidang berada di blok Perekaman Lembar Disposisi Awal pada modal Indeks Berkas Baru. Nilai yang dipilih disimpan ke kolom kepada_bidang_id di tabel riwayat_disposisi.

Entri arsip surat keluar: dropdown Bidang Pemrakarsa muncul khusus ketika jenis arsip dipilih Surat Keluar. Nilai disimpan ke kolom bidang_pemrakarsa_id di tabel arsip_surat_keluar.

Edit arsip: modal edit menampilkan satu dropdown yang berubah label sesuai arah surat. Untuk surat masuk labelnya Bidang Tujuan Disposisi, untuk surat keluar labelnya Bidang Pemrakarsa. Perubahan langsung menyentuh kolom terkait, sehingga koreksi salah bidang tidak perlu hapus dan input ulang.

Tabel arsip: setiap baris menampilkan penanda bidang berwarna hijau di bawah nomor surat, sehingga operator dapat memastikan bidang tanpa membuka detail.

Filter arsip: halaman Arsip Surat Masuk dan Arsip Surat Keluar menyediakan pilihan Semua bidang untuk menyaring daftar per unit kerja.

Grafik dashboard: panel distribusi bidang memakai daftar label yang sama, lengkap dengan warna pembeda per bidang, dan dapat diklik untuk membuka arsip bidang tersebut.

4. LAPORAN YANG MEMAKAI DIMENSI BIDANG

Filter Bidang atau Unit Kerja tersedia pada Pusat Laporan untuk Laporan 1 sampai Laporan 4. Laporan 5 dan Laporan 6 tidak memakai dimensi bidang karena memang berbeda dimensi, yaitu klasifikasi urusan dan jejak audit.

- Laporan 1 Buku Agenda Surat Masuk kini memuat kolom Bidang Tujuan Disposisi. Nilai diambil dari disposisi terakhir pada setiap surat melalui subkueri, sehingga satu surat tetap muncul satu baris dan tidak menggandakan jumlah agenda.
- Laporan 2 Buku Agenda Surat Keluar memuat kolom Bidang Pemrakarsa dan ringkasan jumlah surat per bidang.
- Laporan 3 Rekap Disposisi per Bidang memakai bidang sebagai kunci utama agregasi.
- Laporan 4 Monitoring Kepatuhan Disposisi memuat kolom Bidang Penanggung Jawab beserta status batas waktu.

Perubahan ini menjaga syarat laporan magang: lima laporan wajib berbeda dimensi, bukan sekadar berbeda rentang tanggal.

5. VERIFIKASI DATA RIIL

Hasil pemeriksaan langsung ke TiDB pada saat perubahan ini dibuat:

- Surat masuk 170 baris, surat keluar 241 baris, disposisi 173 baris, pengguna 7 akun.
- Sebaran tujuan disposisi: id 2 sebanyak 48, id 5 sebanyak 44, id 4 sebanyak 40, id 3 sebanyak 39, id 1 sebanyak 2.
- Sebaran bidang pemrakarsa surat keluar: id 7 sebanyak 117, id 1 sebanyak 66, id 6 sebanyak 49, id 5 sebanyak 9, id 4 sebanyak 7, id 3 sebanyak 2, id 8 sebanyak 2, id 2 sebanyak 1.
- Uji pemetaan: nama Bidang Pengembangan dan Pemberdayaan Pemuda terbaca sebagai Pengembangan Pemuda, nama Sekretariat Dispora terbaca sebagai Sekretariat, dan penyaringan per bidang pada Laporan 1 mengembalikan jumlah baris yang konsisten dengan sebaran di atas.

6. BATASAN DAN RENCANA PERAPIAN

- Bidang gabungan id 4 sebaiknya dipecah pada tahun anggaran berikutnya agar Pengembangan Pemuda dan Pemberdayaan Pemuda berdiri sendiri. Pemecahan wajib disertai migrasi disposisi lama, bukan sekadar mengubah master bidang.
- Label ringkas sengaja dipakai pada antarmuka. Nama panjang tetap menjadi sumber kebenaran pada database dan pada kop laporan cetak.
- Penambahan bidang baru cukup dilakukan pada tabel bidang_dispora dan daftar label di src/data/constants.ts. Fungsi pemetaan perlu disesuaikan bila nama bidang baru tidak mengandung kata kunci yang sudah dikenali.
