# DRAF NASKAH LAPORAN MAGANG: BAB V PENUTUP
**Program Studi S1 Teknik Informatika — Fakultas Teknologi Informasi UNISKA MAB Banjarmasin**  
*Sistem: SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)*

---

## 5.1 Kesimpulan

Berdasarkan seluruh tahapan analisis, perancangan, implementasi, dan pengujian sistem informasi persuratan yang telah dilaksanakan selama kegiatan Kerja Praktik (Magang) pada Sekretariat Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan, dapat ditarik kesimpulan sebagai berikut:

1. **Digitalisasi Pengelolaan Arsip yang Efisien**:
   Aplikasi web responsif **SIPASD (Sistem Informasi Pengelolaan Arsip dan Surat Dispora)** telah berhasil dirancang dan dibangun menggunakan teknologi mutakhir *Next.js 15, TypeScript, Tailwind CSS v4, TiDB Cloud Serverless, dan Cloudflare R2*. Sistem ini berhasil menggantikan buku agenda fisik bergaris dan memangkas waktu temu-kembali (*retrieval time*) berkas fisik dari sebelumnya **15 hingga 30 menit** menjadi **kurang dari 2 detik** untuk 420+ dokumen riil TA 2026.
2. **Optimalisasi Alur Disposisi Elektronik Berjenjang**:
   Modul disposisi elektronik terbukti mempermudah pimpinan dinas (Kepala Dinas dan Sekretaris Dinas) dalam memberikan arahan disposisi secara fleksibel melalui perangkat seluler (*smartphone*) tanpa terhambat keberadaan fisik di meja kerja. Distribusi disposisi ke 5 unit kerja dinas berlangsung secara *real-time* (< 1 menit), dilengkapi indikator batas waktu (*overdue alert*) yang meningkatkan transparansi dan akuntabilitas penanganan surat.
3. **Pemberantasan Duplikasi Nomor Surat Keluar**:
   Penerapan algoritma generator penomoran otomatis dengan tingkat isolasi transaksi basis data *Serializable* terbukti berhasil mencegah terjadinya nomor surat keluar ganda (*anti-nomor dobel*) yang sebelumnya sering terjadi akibat pemesanan nomor secara manual via pesan singkat atau komunikasi lisan.
4. **Keandalan Arsitektur Cloud Tanpa Beban Perangkat Kantor**:
   Penggunaan basis data *TiDB Cloud Serverless* dan penyimpanan objek *Cloudflare R2* menjamin sistem dapat diakses secara publik selama 24 jam dengan biaya infrastruktur nol (*zero cost*), tanpa membebani komputer kantor dinas untuk menyala terus-menerus, serta memiliki ketahanan data tinggi terhadap risiko bencana fisik.
5. **Validitas Pengujian Black Box**:
   Pengujian fungsionalitas menggunakan metode *Black Box Testing* pada 15 skenario kunci membuktikan bahwa seluruh modul (Autentikasi RBAC, E-Agenda Masuk, Viewer PDF, Disposisi, Auto-Numbering Keluar, Buku Ekspedisi, dan Ekspor Excel) berjalan **100% valid** sesuai dengan spesifikasi kebutuhan yang ditetapkan.

---

## 5.2 Saran

Demi penyempurnaan sistem dan keberlanjutan pemanfaatannya di masa mendatang, penulis memberikan saran-saran strategis sebagai berikut:

### 5.2.1 Saran untuk Instansi (Dispora Provinsi Kalimantan Selatan)
1. **Sosialisasi dan Pembiasaan Staf**:
   Disarankan agar Sekretariat Dispora Kalsel melakukan pelatihan singkat bagi seluruh staf tata usaha dan perwakilan bidang untuk membiasakan alur kerja paperless melalui SIPASD secara konsisten.
2. **Penyediaan Perangkat Scanner Kecepatan Tinggi (*High-Speed ADF Scanner*)**:
   Untuk mempercepat digitalisasi surat fisik yang tebal (surat perjanjian sewa atau laporan kegiatan kejuaraan olahraga), disarankan penyediaan mesin pemindai dokumen otomatis (*Automatic Document Feeder*) pada Subbagian Umum.
3. **Penerapan Tanda Tangan Elektronik Tersertifikasi (TTE)**:
   Ke depan, sistem dapat diintegrasikan dengan modul TTE tersertifikasi dari Balai Sertifikasi Elektronik (BSrE) Badan Siber dan Sandi Negara (BSSN) agar surat keluar tidak memerlukan penandatanganan dan cap stempel basah secara manual.

### 5.2.2 Saran Pengembangan Akademis (Peningkatan ke Skripsi S1)
Bagi mahasiswa atau peneliti berikutnya yang hendak melanjutkan penelitian ini menjadi Skripsi S1 Teknik Informatika di UNISKA Banjarmasin, disarankan menambahkan lapisan kecerdasan buatan (*intelligence computing layer*):
1. **Penerapan Algoritma Text Mining / NLP**:
   Mengimplementasikan algoritma **Multinomial Naive Bayes berbasis pembobotan TF-IDF** untuk melakukan klasifikasi otomatis bidang tujuan disposisi berdasarkan analisis teks perihal dan isi surat masuk, sehingga sistem dapat memberikan rekomendasi tujuan disposisi tanpa perlu dipilih manual oleh staf TU.
2. **Integrasi Optical Character Recognition (OCR)**:
   Mengimplementasikan modul OCR (*Optical Character Recognition*) menggunakan Tesseract Engine untuk membaca gambar pindaian surat masuk dan mengekstrak nomor surat, tanggal surat, serta instansi pengirim secara otomatis (*auto-filling metadata*).
3. **Penerapan Metode Sistem Pendukung Keputusan (SPK)**:
   Menerapkan metode SPK seperti **TOPSIS atau Simple Additive Weighting (SAW)** untuk menentukan tingkat prioritas penanganan surat masuk berdasarkan parameter batas waktu, sifat surat, dan ketersediaan anggaran dinas.
