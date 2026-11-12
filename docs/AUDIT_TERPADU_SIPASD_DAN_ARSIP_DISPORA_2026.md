AUDIT TERPADU: SIPASD + ARSIP PKL DISPORA KALSEL 2026
Sistem Informasi Pengelolaan Arsip Surat Dispora Provinsi Kalimantan Selatan
Mahasiswa: Muhammad Rizki Ramadhani (NPM 2310010406) - S1 Teknik Informatika UNISKA MAB
Tanggal audit: 11 November 2026
Sumber bukti: repositori E:\Hermesproject\SIPASD, folder E:\Hermesproject\Laporan Magang Dispora, kueri langsung ke TiDB Cloud, suite verifikasi npm test, dan uji HTTP host produksi.

--------------------------------------------------------------------------------
BAGIAN 1. HASIL CEK REPOSITORI SIPASD
--------------------------------------------------------------------------------

1.1 Status kerja
- Git: branch main, commit terakhir 6a4b66d "fix(security): kunci hak akses pusat laporan eksekutif khusus akun developer". Working tree bersih, tidak ada berkas belum di-commit.
- Catatan: branch main tidak memiliki upstream terdaftar (git status -sb hanya menampilkan "## main" tanpa origin/main), sehingga push harus memakai -u atau menyebut remote eksplisit.
- Tumpukan: Next.js 15.2, React 19, TypeScript, Tailwind CSS v4, mysql2 ke TiDB Cloud Serverless, Cloudinary + Google Drive untuk berkas, exceljs untuk ekspor, jose untuk JWT.

1.2 Hasil npm test (suite verifikasi sistem, dijalankan nyata)
- TiDB OK: 170 surat masuk, 253 surat keluar, 7 pengguna, 5 bidang, 6 klasifikasi.
- Cloudinary signed URL: OK (anti 401).
- Modularitas: 95 berkas di src/ semuanya di bawah 200 LOC.
- Zero em-dash: 0 pada 161 berkas proyek.
- Header keamanan + auth guard API: OK.
- Zero hardcoded secret di src/: OK.
- Kesimpulan suite: ALL VERIFICATION CHECKS PASSED.

1.3 Uji host produksi
- https://www.sipasd.my.id -> HTTP 200 dalam 2,32 detik.
- https://www.sipasd.my.id/laporan -> HTTP 200 (halaman ada, akses dibatasi ke akun developer).
- Rute produksi: 12 rute (landing, login, dashboard, arsip masuk, arsip keluar, riwayat disposisi, buku agenda, distribusi ekspedisi, master klasifikasi, manajemen pengguna, audit trail, laporan).
- Modul laporan: 5 laporan resmi + 1 cadangan audit trail: (1) Buku Agenda Surat Masuk, (2) Buku Agenda Surat Keluar, (3) Rekap Disposisi per Bidang, (4) Monitoring Kepatuhan Disposisi, (5) Rekap Volume per Klasifikasi, (6) Log Audit Trail Keamanan.

1.4 Data riil di TiDB (kueri read-only langsung, 11 Nov 2026)
- arsip_surat_masuk 170 baris, arsip_surat_keluar 253 baris, riwayat_disposisi 173 baris, users 7, bidang_dispora 5, klasifikasi_arsip 6, buku_ekspedisi 1, audit_logs 170.
- Sifat surat masuk: BIASA 119, KILAT 35, SEGERA 15, PENTING 1.
- Rentang tanggal diterima: 1 Maret 2026 sampai 7 Oktober 2026.
- Sebaran disposisi per bidang: Pembudayaan Olahraga 48, Sarana dan Prasarana 44, Pengembangan dan Pemberdayaan Pemuda 40, Peningkatan Prestasi 39, Sekretariat 2. Tidak ada disposisi tanpa bidang.
- Status penyelesaian disposisi: SELESAI 162, PROSES 5, BELUM_DIPROSES 6.

1.5 Berkas pendukung dokumentasi di repositori (docs/)
Tersedia 40+ dokumen: 5 draf bab laporan (BAB 1 sampai BAB 5), peta materi ke laporan magang, matriks kompetensi UNISKA, 7 ADR arsitektur, skema basis data 3NF, panduan pengguna, panduan sidang dan tanya-jawab penguji, laporan pengujian, runbook disaster recovery, analisis mendalam 420 arsip, pemetaan disposisi hasil OCR, serta dua CSV metadata hasil OCR (surat masuk 173 baris, surat keluar 250 baris).

--------------------------------------------------------------------------------
BAGIAN 2. DAFTAR BIDANG DI DISPORA KALSEL (HASIL BACA DOKUMEN)
--------------------------------------------------------------------------------

2.1 Struktur organisasi resmi (dokumen BAB II dan Pergub Kalsel 072/2016)
Kepala Dinas membawahkan 7 unit:

1. Sekretariat, dengan 3 subbagian:
   - Subbagian Perencanaan dan Pelaporan
   - Subbagian Keuangan (lokasi penempatan mahasiswa PKL)
   - Subbagian Umum dan Kepegawaian (pusat tata usaha dan kearsipan)
2. Bidang Pembudayaan Olahraga, 3 seksi: Olahraga Pendidikan dan Sentra Olahraga; Olahraga Rekreasi, Tradisional dan Layanan Khusus; Pembudayaan Olahraga Masyarakat.
3. Bidang Peningkatan Prestasi Olahraga, 3 seksi: Pembibitan, IPTEK Olahraga dan Tenaga Keolahragaan; Promosi Olahraga dan Olahraga Prestasi; Standardisasi dan Infrastruktur Olahraga Prestasi.
4. Bidang Pengembangan Pemuda, 3 seksi: Kepemimpinan dan Kepeloporan Pemuda; Kemitraan dan Penghargaan Pemuda; Kewirausahaan dan Organisasi Pemuda.
5. Bidang Pemberdayaan Pemuda, 3 seksi: Peningkatan IPTEK dan IMTAQ Pemuda; Peningkatan Kapasitas Pemuda dan Paskibraka; Wawasan Kebangsaan dan Ketahanan Pemuda.
6. Bidang Sarana dan Prasarana Olahraga, 2 seksi: Pengelolaan dan Pemanfaatan; Pemeliharaan dan Perawatan.

Total: 1 sekretariat (3 subbagian) + 5 bidang teknis (14 seksi).

2.2 Bentuk yang dipakai sistem SIPASD (tabel bidang_dispora, 5 baris)
1. SEKR - Sekretariat Dispora - kepala Pebriadin Hapiz, AP, M.Si
2. PORA - Bidang Pembudayaan Olahraga - Budiono, S.Pd, M.AP
3. PRESTASI - Bidang Peningkatan Prestasi Olahraga - H. Heru Susanto, SE, MM
4. PEMUDA - Bidang Pengembangan dan Pemberdayaan Pemuda - Drs. H. M. Fauzi, M.Si
5. SAPRAS - Bidang Sarana dan Prasarana Olahraga - Akhmad Syarif, ST, MT

Catatan penting: dua bidang pemuda (Pengembangan Pemuda dan Pemberdayaan Pemuda) digabung menjadi satu baris master. Struktur resmi memisahkannya, sistem menyatukannya. Ini pilihan sah untuk kebutuhan disposisi, tetapi harus dijelaskan di sidang agar tidak dianggap keliru membaca struktur.

2.3 Bidang yang benar-benar menerima disposisi surat (bukti 170 surat masuk)
Sumber ganda yang saling cocok, yaitu berkas Buku-Agenda-Dispora-Multi-Tahun.xlsx (kolom Bidang) dan tabel riwayat_disposisi di TiDB:
- Pembudayaan Olahraga 47-48 surat
- Sarana dan Prasarana 44 surat
- Peningkatan Prestasi 39 surat
- Pengembangan Pemuda 38-40 surat
- Sekretariat 2 surat
Artinya seluruh 5 unit di master bidang benar-benar terpakai, dengan beban terbesar di Pembudayaan Olahraga dan Sarana Prasarana.

2.4 Pejabat dan unit lain yang muncul di dokumen asli
- Kepala Dinas (Pengguna Anggaran): Pebriadin Hapiz, AP, M.Si.
- Sekretaris Dinas: Denny Saputra, S.STP.
- Kasubbag Umum dan Kepegawaian merangkap PPTK dan Bendahara Pengeluaran: Norika Fajriana, SH, MH (pada dokumen BAB II tertulis pada posisi PPTK/Subbag Keuangan).
- Bendahara Pengeluaran pada dokumen BAB II: Sathia Nico Brata Simanjuntak, S.Akun.
- Pembimbing lapangan mahasiswa: Ibu Nur (Subbagian Keuangan dan pengelolaan berkas dinas).
- Petugas di lapangan: Ibu Katrin (penyerah dokumen) dan Ibu Dany (Bidang Pembudayaan Olahraga), sesuai agenda harian PKL.

2.5 Unit kerja lain yang ikut mengelola berkas (dari Excel keuangan)
- Subbag Keuangan mengelola BKU, BKU storan, karcis parkir, dan laporan retribusi untuk 11 objek/venue: Kolam Renang GOR Hasanuddin HM, GOR Hasanuddin HM, Kolam Renang Mulawarman, Lapangan Sepak Bola Mulawarman, Lapangan Tenis Mulawarman, Lapangan Tenis Dharma Praja, Lapangan Sepak Bola Kayu Tangi, Lapangan Golf Swargaloka, Lapangan Volley Pasir, Lapangan Voli Indoor SKB Mulawarman, Lapangan Sepak Bola 17 Mei.
- Target penerimaan retribusi 2026 pada berkas pertanggungjawaban: Rp 1.406.560.000 (11 item), terbesar Lapangan Sepak Bola Mini Soccer SKB Mulawarman Rp 400.800.000 dan Lapangan Golf Rp 360.000.000.

--------------------------------------------------------------------------------
BAGIAN 3. HASIL CEK FOLDER LAPORAN MAGANG DISPORA
--------------------------------------------------------------------------------

3.1 Peta isi folder (133 berkas)
- Surat Masuk/Surat Masuk 2026: 171 PDF (nomor agenda 0897 dan seterusnya, pola nama seperti 0903(4agustus).pdf).
- Surat Keluar/Surat Keluar 2026: 249 PDF (pola mesin scanner 3829_20260519_0001.pdf sampai 8757, termasuk bundel kolektif seperti "8035-43, 9 surat.pdf").
- pdf/buat surat keluar saya scan: 12 PDF hasil pindai surat keluar (nomor 8710 sampai 9623), plus PEDOMAN-PKL-FTI-Versi-2.0 dan Buku-Agenda-Dispora-Multi-Tahun.xlsx.
- TBP: 39 berkas (38 PDF DOC-*.pdf plus satu ekspor obrolan WhatsApp dengan Ibu Nur Dispora).
- Excel: Berkas Kelengkapan Pertanggungjawaban Retribusi 2026, BKU-Tahun 2026, BUKU STORAN 2026 (12 sheet, satu per venue), KARCISPARKIR 2026, LAP.KARCIS-2026.
- Foto: 24 gambar (foto kegiatan dan tangkapan layar aplikasi).
- Tugas magang: 12 folder mingguan (pertama sampai Keduabelas, isi foto WhatsApp 29 Oktober 2026), ditambah folder terbaru (30 Oktober), terbarulagi (10 November), dan berkas Tugas Magang.docx serta beberapa berkas Foto QRIS.
- SIPASD Web Application UI (1): salinan purwarupa UI hasil Figma Make (React + Vite, mock data, 30+ berkas). Fungsinya sebagai bahan desain, bukan kode produksi.

3.2 Isi agenda kegiatan PKL (DAFTAR_HADIR_DAN_AGENDA_KEGIATAN_PKL.docx)
- Periode: 14 September sampai 14 November 2026, 43 kegiatan, dibagi 9 minggu, dengan kolom paraf pembimbing per minggu.
- Pola pekerjaan: pemindaian arsip, penggandaan dan distribusi dokumen, registrasi penomoran surat keluar umum (SKU), rekapitulasi pembukuan SKU ke Excel, pengelolaan bukti bayar retribusi QRIS (82 berkas pada 29 Oktober), rapat pembinaan mental spiritual bersama KH. Muslimin, serta pengembangan SIPASD (wireframe, login, dashboard, formulir surat masuk, pratinjau PDF, ekspor Excel, pengujian black box, UAT, manual book).
- Penutupan: 14 November 2026, penyerahan master berkas digital ke Subbagian Umum.

3.3 Isi metadata hasil OCR (bahan mentah laporan)
- METADATA_SURAT_MASUK_2026.csv: 173 baris; 100 baris belum terbaca nomor suratnya, sisanya berhasil dibaca; 36 instansi unik.
- Instansi pengirim terbanyak: Sekretariat Daerah Prov. Kalsel 20, Dispora sendiri 12, IKASI Kalsel 5, DPRD Kalsel 5, Kementerian Pendidikan Tinggi 4, UIN Antasari 4, Inspektorat Daerah 4, ULM 4.
- DISPOSISI_MAPPING_2026.csv: 171 baris berisi alamat tujuan, pejabat hasil OCR, dan aturan penetapan.
- Dua berkas .txt di folder pdf (9802e7e442dca8ec.txt dan e2de0d227543363a.txt) bukan dokumen dinas, isinya notifikasi pesanan layanan aktivasi pihak ketiga. Keduanya tidak relevan dan sebaiknya dihapus dari folder laporan.

--------------------------------------------------------------------------------
BAGIAN 4. TEMUAN KRITIS DAN KETIDAKSESUAIAN
--------------------------------------------------------------------------------

4.1 Angka arsip tidak konsisten antar dokumen
- Draf BAB I dan dokumen peta laporan memakai 420 berkas (171 surat masuk + 249 surat keluar).
- Backup basis data 21 Oktober 2026 memuat 170 + 241.
- Kondisi live 11 November 2026: 170 surat masuk + 253 surat keluar.
- Rekomendasi: satu angka saja untuk seluruh naskah. Usulan: 170 surat masuk dan 253 surat keluar per 7 Oktober 2026, atau ubah menjadi kalimat "lebih dari 420 berkas" agar aman terhadap pengujian berkas baru.

4.2 Seluruh 253 surat keluar masih seragam
Semua baris arsip_surat_keluar memakai bidang_pemrakarsa_id = 1 (Sekretariat Dispora) dan kode klasifikasi 426 (Keolahragaan). Akibatnya Laporan 2 (Register Surat Keluar dengan kolom bidang dan klasifikasi) dan Laporan 5 (Rekap Volume per Klasifikasi) belum menunjukkan variasi riil, karena secara data hanya ada satu nilai. Ini titik paling rawan ditanya penguji.

4.3 Riwayat disposisi belum mencerminkan hasil OCR
- Dokumen DISPOSISI_DARI_PDF.md menyatakan nilai pejabat_pendisposisi sudah diperbaiki: 83 baris diubah, sisanya terbagi ke Norika Fajriana 16, Denny Saputra 3, dan tiga kepala bidang masing-masing 1, serta 59 baris ditandai belum terverifikasi.
- Kueri live menunjukkan 173 dari 173 baris masih bernama "Pebriadin Hapiz, AP, M.Si" (Kepala Dinas).
- Artinya perubahan itu belum masuk ke basis data produksi, atau ada pengembalian nilai ke seed. Ini harus diselesaikan sebelum sidang, karena Laporan 3 dan 4 bergantung pada kolom tersebut.

4.4 Distribusi kelas surat tidak seperti yang ditulis di naskah
Naskah menyebut distribusi kelas 005/426/427/800. Data live surat masuk hanya punya 6 baris klasifikasi master dan surat keluar 100 persen kode 426. Tabel klasifikasi urusan pada naskah perlu diselaraskan dengan angka nyata.

4.5 Bundel multi-surat belum dipecah
Sebanyak 14 berkas surat keluar berisi beberapa surat sekaligus (contoh "8035-43, 9 surat.pdf", "7763,7807-11, 6 surat.pdf", "7480-82, 3 surat_20260902_0001.pdf"). Pada laporan register, satu nomor agenda mewakili banyak nomor surat. Perlu kolom keterangan bundel agar jumlah naskah di laporan tidak salah hitung.

4.6 Berkas pindaian ganda
Folder Surat Keluar memuat pasangan berkas kembar (misal 4009_20260602_0001.pdf dan 4009_20260602_0001(1).pdf, 4302.pdf dan 4302(1).pdf). Ini menyulitkan pencocokan nomor agenda ke berkas saat impor ulang.

4.7 Sisa kebersihan berkas
- Berkas kunci sementara Microsoft Word (~$toqristerbaru.docx, ~$gas Magang.docx) masih ada di folder laporan dan sebaiknya dihapus.
- Folder SIPASD Web Application UI (1) berisi AGENTS.md dan CLAUDE.md (berkas bantu alat AI). Karena aturan repo hanya boleh memuat identitas Dhani078, berkas itu tidak boleh ikut ke lampiran laporan atau arsip yang diserahkan.

4.8 Cabang git belum tersambung ke remote
Branch main tanpa upstream; perlu git push -u origin main agar sinkronisasi terjaga, sesuai kebiasaan commit langsung ke GitHub.

4.9 Sumber laporan yang harus dipastikan sebelum sidang
- Kelima laporan resmi ada dan bisa diakses; namun Laporan 2 dan 5 bergantung pada data yang masih seragam (butir 4.2), dan Laporan 3 serta 4 bergantung pada kolom pejabat disposisi (butir 4.3). Perbaiki data dulu, baru cetak lampiran laporan.

--------------------------------------------------------------------------------
BAGIAN 5. LANGKAH PERBAIKAN BERURUTAN
--------------------------------------------------------------------------------

1. Satukan angka arsip di semua naskah (BAB I, BAB III, BAB V, peta laporan, presentasi) dan pada angka yang tampil di aplikasi.
2. Jalankan ulang skrip penetapan pejabat pendisposisi (scripts/apply-pejabat-pendisposisi.ts) ke basis data produksi, lalu verifikasi dengan kueri yang sama seperti audit ini.
3. Isi bidang_pemrakarsa_id dan kode_klasifikasi_id surat keluar dari bukti fisik (kode pada nomor surat seperti 400.x, 421.x, 426, 800.1.x, 900.1.x sudah tersedia pada nama berkas), lalu cek ulang Laporan 2 dan 5.
4. Tambahkan penanda bundel untuk 14 berkas multi-surat.
5. Bersihkan berkas sementara, pasangan ganda, dan dua berkas txt yang tidak relevan.
6. Hapus AGENTS.md dan CLAUDE.md dari salinan purwarupa UI yang akan dilampirkan; simpan hanya kode Sumber Daya Manusia (sumber, komponen, publik) yang memang karya sendiri.
7. Set upstream branch dan push: git push -u origin main.
8. Regenerasi naskah Word laporan setelah butir 1 sampai 3 selesai, agar lampiran tabel cocok dengan keluaran aplikasi saat demonstrasi sidang.

Status ringkas: aplikasi produksi sehat (200 OK, suite verifikasi lulus, 95 berkas di bawah 200 LOC, 0 em-dash, tanpa secret ter-hardcode). Yang belum sehat ada di sisi data: keseragaman surat keluar dan kolom pejabat disposisi. Perbaiki data sebelum sidang.
