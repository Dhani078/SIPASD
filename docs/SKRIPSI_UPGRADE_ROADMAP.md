# BLUEPRINT PENINGKATAN KE SKRIPSI S1 TEKNIK INFORMATIKA
**Roadmap Akademik Upgrade SIPASD dari Kerja Praktik (KP) ke Tugas Akhir / Skripsi (Semester 8)**  
*Fakultas Teknologi Informasi - Universitas Islam Kalimantan (UNISKA) Muhammad Arsyad Al Banjari Banjarmasin*

---

## 🎯 Mengapa Berkas Arsip Pindaian PDF Dispora Adalah "Tambang Emas" untuk Skripsi S1?

Dalam sidang Kerja Praktik (KP) semester 7, fokus pengujian adalah **rekayasa perangkat lunak sistem informasi** (bagaimana web responsif SIPASD berhasil memecahkan masalah Google Drive yang berantakan dan lambat).

Namun, untuk **Skripsi S1 Teknik Informatika (Semester 8)**, dewan penguji UNISKA mewajibkan adanya **metode komputasi / algoritma kecerdasan buatan**. 

Kondisi arsip Dispora Kalsel (berkas pindaian scan PDF yang teksnya terkunci dalam bentuk gambar dokumen di Google Drive `arsipdispora2026`) merupakan **objek penelitian (*dataset*) yang paling ideal di bidang Informatika**, karena:
1. **Bukan Data Dummy**: Merupakan 420 dokumen nyata instansi pemerintah daerah.
2. **Izin Riset Sudah Dimiliki**: Mahasiswa telah menyelesaikan magang di Dispora Kalsel, sehingga surat permohonan penelitian lanjutan dan pengambilan data skripsi sangat mudah diterbitkan.
3. **Pondasi Sistem Sudah Jadi**: Arsitektur SIPASD (Next.js 15, TiDB, Cloudflare R2) sudah siap; mahasiswa tinggal menaruh modul algoritma cerdas di atasnya.

---

## 💡 Pilihan Riset Skripsi A: Ekstraksi Otomatis Metadata Surat Menggunakan OCR (Optical Character Recognition)

### Judul Skripsi yang Diusulkan:
> **"Implementasi Optical Character Recognition (OCR) Menggunakan Tesseract Engine Berbasis Web untuk Ekstraksi Otomatis Metadata Arsip Surat Masuk pada Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan"**

### Masalah Ilmiah:
Staf tata usaha saat ini harus membaca berkas scan PDF dengan mata telanjang, lalu mengetikkan satu per satu Nomor Surat, Tanggal, dan Asal Instansi ke dalam form web. Hal ini rawan salah ketik (*human typo*) dan memakan waktu sekitar 3-5 menit per surat.

### Solusi Komputasi:
Sistem dilengkapi modul OCR. Saat petugas mengunggah berkas scan PDF dari Google Drive, mesin OCR mengekstrak lapisan teks gambar, lalu menerapkan *Regular Expression (Regex)* untuk mengisi kolom formulir secara otomatis (*auto-fill*).

### Tahapan Algoritma:
1. **Konversi Dokumen**: Mengubah halaman pertama berkas PDF menjadi citra resolusi tinggi (PNG/TIFF, 300 DPI).
2. **Image Preprocessing**:
   - *Grayscale Conversion*: Mengubah citra warna ke derajat keabuan (0-255).
   - *Otsu Thresholding (Binarisasi)*: Memisahkan teks hitam dari latar belakang kertas putih berdasarkan nilai ambang optimal.
   - *Deskewing*: Mendeteksi dan memperbaiki kemiringan sudut kertas hasil pemindaian scanner.
3. **OCR Engine**: Tesseract OCR (Traineddata: Bahasa Indonesia `ind.traineddata`).
4. **Pattern Recognition (Regex)**:
   - Pola Nomor Surat: `/(Nomor|No)\s*:\s*([0-9A-Za-z\.\/\-]+)/i`
   - Pola Tanggal: `/\b(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/i`
5. **Evaluasi Pengujian**:
   - Pengukuran *Character Error Rate* (CER) dan *Word Error Rate* (WER).
   - Uji akurasi ekstraksi pada 171 berkas riil surat masuk Dispora.

---

## 💡 Pilihan Riset Skripsi B: Klasifikasi Otomatis Kode Arsip & Bidang Menggunakan Naive Bayes & TF-IDF

### Judul Skripsi yang Diusulkan:
> **"Penerapan Algoritma Multinomial Naive Bayes Berbasis TF-IDF untuk Klasifikasi Otomatis Kode Klasifikasi dan Rekomendasi Disposisi Surat pada Dispora Provinsi Kalimantan Selatan"**

### Masalah Ilmiah:
Penentuan kode klasifikasi dinas (misal: apakah surat masuk termasuk urusan `426` Keolahragaan, `427` Kepemudaan, atau `005` Undangan) sering membingungkan staf baru, sehingga arsip sering salah kategori.

### Solusi Komputasi:
Sistem menganalisis kata-kata dalam judul perihal dan ringkasan surat menggunakan pembobotan kata TF-IDF dan memprediksi kode klasifikasi dinas serta bidang tujuan disposisi secara otomatis.

### Tahapan Algoritma & Rumus:
1. **Text Preprocessing**:
   - *Case Folding* $\rightarrow$ *Tokenizing* $\rightarrow$ *Stopwords Removal* (Kamus Tala) $\rightarrow$ *Stemming* (Algoritma Nazief-Adriani).
2. **Pembobotan TF-IDF**:
   $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{N}{\text{DF}(t)}\right)$$
3. **Multinomial Naive Bayes dengan Laplace Smoothing**:
   $$P(C_k \mid D) \propto P(C_k) \prod_{i=1}^{n} \frac{\text{count}(w_i, C_k) + 1}{\sum_{w \in V} \text{count}(w, C_k) + |V|}$$
4. **Evaluasi Model**:
   - *Confusion Matrix*: Menghitung Accuracy, Precision, Recall, dan F1-Score menggunakan 10-Fold Cross Validation.

---

## 📅 Rencana Timeline Pelaksanaan Skripsi (Semester 8)

| Bulan | Target Luaran Akademik | Aksi Teknis pada Repositori SIPASD |
| :--- | :--- | :--- |
| **Bulan 1** | Penyusunan Proposal Skripsi (Bab I, II, III). | Labeling dataset 420 arsip surat Google Drive menjadi dataset CSV. |
| **Bulan 2** | Seminar Proposal Skripsi di UNISKA. | Pembuatan modul machine learning / worker (Python FastAPI atau Node.js OCR). |
| **Bulan 3** | Implementasi Algoritma & Pelatihan Model. | Integrasi modul algoritma ke antarmuka Next.js 15 SIPASD. |
| **Bulan 4** | Pengujian Model, Cross Validation & Uji Lapangan. | Pengambilan metrik evaluasi (CER/WER untuk OCR, F1-Score untuk Naive Bayes). |
| **Bulan 5** | Penyusunan Naskah Lengkap Bab IV & Bab V. | Finalisasi naskah skripsi dan draf artikel jurnal ilmiah nasional (SINTA). |
| **Bulan 6** | Sidang Munaqasyah / Pendadaran Skripsi S1. | Demo aplikasi SIPASD berbobot AI di depan dewan penguji UNISKA. |
