# BLUEPRINT PENINGKATAN KE SKRIPSI S1 TEKNIK INFORMATIKA
**Roadmap Akademik Upgrade SIPASD dari Kerja Praktik (KP) ke Tugas Akhir / Skripsi (Semester 8)**  
*Fakultas Teknologi Informasi — Universitas Islam Kalimantan (UNISKA) Muhammad Arsyad Al Banjari Banjarmasin*

---

## 🎯 Mengapa SIPASD Sangat Siap Naik ke Skripsi S1?

Standar kelulusan Skripsi S1 Teknik Informatika di UNISKA mensyaratkan adanya **metode ilmiah / algoritma komputasi**. Sistem informasi web murni (CRUD biasa) yang dibuat pada masa Kerja Praktik (KP) dapat langsung ditingkatkan menjadi skripsi bernilai A dengan mengimplementasikan satu lapisan kecerdasan buatan (*intelligence layer*) di atasnya.

Keuntungan strategis bagi mahasiswa:
1. **Lokasi Riset Sudah Ada**: Dispora Prov. Kalsel (izin penelitian dan surat keterangan selesai magang sudah di tangan).
2. **Dataset Riil Melimpah**: 420+ dokumen surat dinas TA 2026 (171 surat masuk dan 249 surat keluar) siap dijadikan data latih (*training data*) dan data uji (*testing data*).
3. **Pondasi Arsitektur Web Sudah Matang**: Sistem SIPASD (Next.js 15, TypeScript, TiDB, Cloudflare R2) sudah berjalan stabil.

---

## 💡 Pilihan 1: Klasifikasi Disposisi Otomatis Menggunakan Naive Bayes & TF-IDF (Paling Direkomendasikan)

### Judul Skripsi yang Diusulkan:
> **"Penerapan Algoritma Multinomial Naive Bayes Berbasis TF-IDF untuk Klasifikasi Otomatis Disposisi Surat Masuk pada Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan"**

### Permasalahan Ilmiah:
Ketika puluhan surat masuk dalam satu hari, staf TU sering ragu menentukan bidang mana yang paling tepat menangani surat tersebut (apakah *Pembudayaan Olahraga*, *Prestasi Olahraga*, atau *Sarana Prasarana*).

### Solusi Algoritma:
Sistem secara cerdas menganalisis kata-kata dalam judul perihal surat dan ringkasan isi, lalu merekomendasikan bidang tujuan disposisi secara otomatis.

### Tahapan Komputasi & Rumus Matematis:
1. **Text Preprocessing**:
   - *Case Folding*: Mengubah seluruh huruf menjadi huruf kecil.
   - *Tokenizing*: Memecah kalimat menjadi token kata individual.
   - *Filtering / Stopwords Removal*: Menghilangkan kata umum bahasa Indonesia yang tidak bernilai informasi (seperti: *yang, di, dari, kepada, untuk*).
   - *Stemming*: Mengubah kata berimbuhan ke kata dasar menggunakan algoritma Nazief-Adriani atau Sastrawi.
2. **Pembobotan Kata TF-IDF (Term Frequency - Inverse Document Frequency)**:
   $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{N}{\text{DF}(t)}\right)$$
   * $N$ = Total seluruh surat masuk pada dataset.
   * $\text{DF}(t)$ = Jumlah surat yang memuat kata $t$.
3. **Klasifikasi Multinomial Naive Bayes**:
   $$P(C_k \mid D) \propto P(C_k) \prod_{i=1}^{n} P(w_i \mid C_k)$$
   Dengan *Laplace Smoothing*:
   $$P(w_i \mid C_k) = \frac{\text{count}(w_i, C_k) + 1}{\sum_{w \in V} \text{count}(w, C_k) + |V|}$$
   * $C_k$ = Kategori Bidang Dispora (PORA, PRESTASI, PEMUDA, SAPRAS, SEKR).
   * $|V|$ = Jumlah kosakata unik dalam korpus.
4. **Evaluasi Model (Confusion Matrix)**:
   - Pengujian K-Fold Cross Validation ($K=5$ atau $K=10$).
   - Pengukuran metrik: *Accuracy*, *Precision*, *Recall*, dan *F1-Score*. Target akurasi: $\ge 85\%$.

---

## 💡 Pilihan 2: Ekstraksi Otomatis Metadata Surat Menggunakan OCR (Optical Character Recognition)

### Judul Skripsi yang Diusulkan:
> **"Implementasi Optical Character Recognition (OCR) Menggunakan Tesseract Engine untuk Ekstraksi Otomatis Metadata Surat Masuk Berbasis Web pada Dispora Kalsel"**

### Permasalahan Ilmiah:
Staf TU masih harus mengetik manual Nomor Surat, Tanggal Surat, dan Instansi Pengirim dari berkas scan kertas, yang rentan salah ketik (*human typo*) dan memakan waktu.

### Solusi Algoritma:
Staf cukup mengunggah pindaian berkas PDF / gambar. Mesin OCR otomatis mengenali teks, menerapkan *Regex Pattern Matching* untuk mengekstrak entitas nomor surat, tanggal, serta pengirim, dan mengisi formulir secara otomatis (*auto-fill*).

### Tahapan Komputasi:
1. **Image Preprocessing**: Grayscale conversion, Otsu Thresholding (Binarisasi), Deskewing (pelurusan sudut kemiringan pindaian kertas), dan Noise Reduction.
2. **Text Extraction**: Tesseract OCR engine (bahasa Indonesia).
3. **Information Extraction via Regular Expressions (Regex)**:
   - Pola Nomor Surat: `/(Nomor|No)\s*:\s*([0-9A-Za-z\.\/\-]+)/i`
   - Pola Tanggal: `/\b(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})\b/i`
4. **Pengukuran Akurasi**: Character Error Rate (CER) dan Word Error Rate (WER).

---

## 📅 Rencana Timeline Pelaksanaan Skripsi (Semester 8)

| Bulan | Target Luaran Akademik | Aksi Teknis pada Repositori SIPASD |
| :--- | :--- | :--- |
| **Bulan 1** | Penyusunan Proposal Skripsi (Bab I, II, III). | Labeling dataset 171 Surat Masuk ke 5 kategori bidang Dispora. |
| **Bulan 2** | Seminar Proposal Skripsi & Izin Riset Lanjutan. | Pembuatan modul machine learning / worker (Python FastAPI atau Node NLP). |
| **Bulan 3** | Implementasi Algoritma & Pelatihan Model. | Integrasi API model klasifikasi ke antarmuka Next.js 15 SIPASD. |
| **Bulan 4** | Pengujian Model, K-Fold Validation, & Uji Ahli. | Pengambilan metrik Confusion Matrix & pengujian usability UAT instansi. |
| **Bulan 5** | Penyusunan Bab IV (Hasil & Pembahasan) & Bab V. | Finalisasi naskah skripsi lengkap dan draf jurnal ilmiah nasional (SINTA). |
| **Bulan 6** | Sidang Munaqasyah / Pendadaran Skripsi S1. | Demo aplikasi SIPASD berbobot AI di depan dewan penguji UNISKA. |
