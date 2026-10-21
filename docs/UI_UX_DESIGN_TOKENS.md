# UI/UX DESIGN SYSTEM & DESIGN TOKENS: SIPASD
**Standar Desain Antarmuka Pemerintahan Modern & Aksesibel**  
*Tema: Identitas Resmi Pemprov Kalsel & Dispora (Emerald, Gold Banua, Slate Clean)*

---

## 🎨 1. Palet Warna Resmi (Color Tokens)

Aplikasi SIPASD menggunakan palet warna formal berwibawa yang mencerminkan identitas keolahragaan, kepemudaan, dan birokrasi hijau Pemerintah Provinsi Kalimantan Selatan:

| Token Name | Nilai HEX | Tailwind Class | Peruntukan Antarmuka |
| :--- | :--- | :--- | :--- |
| `--color-primary-900` | `#064E3B` | `bg-emerald-900` | Header navbar utama, sidebar pimpinan, kop dokumen cetak. |
| `--color-primary-700` | `#047857` | `bg-emerald-700` | Tombol aksi utama (*primary button*), link aktif, border fokus. |
| `--color-primary-500` | `#10B981` | `bg-emerald-500` | Status sukses, lencana selesai, indikator status online. |
| `--color-primary-50`  | `#ECFDF5` | `bg-emerald-50` | Latar belakang baris tabel aktif, highlight kartu terpilih. |
| `--color-accent-gold` | `#D97706` | `bg-amber-600` | Aksen lambang Banua Kalsel, kartu KPI surat keluar, badge segera. |
| `--color-danger-600`  | `#DC2626` | `bg-red-600` | Lencana sifat surat *KILAT*, peringatan *overdue*, tombol hapus. |
| `--color-warning-500` | `#F59E0B` | `bg-amber-500` | Lencana status *SEDANG DIPROSES*, sifat surat *PENTING*. |
| `--color-neutral-900` | `#0F172A` | `text-slate-900` | Teks judul utama (*headings*), teks tabel, teks cetak resmi. |
| `--color-neutral-600` | `#475569` | `text-slate-600` | Teks keterangan sekunder, label formulir, teks bantuan. |
| `--color-neutral-100` | `#F1F5F9` | `bg-slate-100` | Latar belakang kartu dashboard, header kolom tabel. |
| `--color-neutral-50`  | `#F8FAFC` | `bg-slate-50` | Latar belakang seluruh halaman aplikasi (*page canvas*). |

---

## 🔤 2. Tipografi Resmi (Typography Tokens)

Menggunakan keluarga huruf geometris modern yang memiliki keterbacaan tinggi di layar HP maupun cetak kertas:
- **Font Utama Antarmuka**: `Plus Jakarta Sans`, `Inter`, `system-ui`, `sans-serif`.
- **Font Dokumen Cetak / Naskah Dinas**: `Calibri`, `Segoe UI`, `Arial`, `sans-serif`.

### Skala Ukuran Tipografi:
- **Heading 1 (`text-2xl` / 24px - Bold)**: Judul halaman dashboard dan modul utama.
- **Heading 2 (`text-xl` / 20px - SemiBold)**: Judul kartu analitik, judul modal dialog.
- **Heading 3 (`text-lg` / 18px - Medium)**: Judul subbagian formulir, perihal surat ringkas.
- **Body Regular (`text-sm` / 14px - Regular)**: Teks isi data tabel, nilai input formulir, teks disposisi.
- **Caption / Meta (`text-xs` / 12px - Regular)**: Tanggal terima, NIP pejabat, petunjuk helper, timestamp audit.

---

## 📱 3. Titik Putus Responsif (Responsive Breakpoints) & Aturan 0 Overflow

Aplikasi wajib diuji dan terbebas dari kesalahan gulir horizontal (*0 horizontal scrollbar overflow*) pada seluruh resolusi:

| Device Target | Lebar Layar | Strategi Tata Letak Antarmuka |
| :--- | :--- | :--- |
| **Ponsel Kecil** | `375px - 414px` (`sm`) | Mode kartu tumpuk vertikal (*stacked cards*), tombol aksi penuh lebar (*full-width*), floating bottom navigation, modal fullscreen. |
| **Tablet / iPad** | `768px - 1023px` (`md`) | Sidebar melipat menjadi ikon ringkas (*collapsed sidebar*), tabel 2 kolom prioritas, drawer sliding untuk detail surat. |
| **Laptop Standar**| `1024px - 1439px` (`lg`) | Sidebar terbuka penuh (lebar 260px), tabel multi-kolom dengan sticky actions, viewer PDF dialog modal. |
| **Desktop / Layar Lebar** | `1440px+` (`xl`) | Layout *Split-Screen* (kiri: tabel agenda 60%, kanan: viewer streaming PDF 40% berdampingan). |

### Aturan Khusus Tabel Responsif:
Pada layar seluler (`< 768px`), tabel persuratan otomatis bertransformasi dari `<table>` menjadi kartu mini (*Card List View*) yang memuat Nomor Agenda, Asal Instansi, Badge Sifat Surat, dan tombol pintas satu sentuhan untuk **Pratinjau PDF** dan **Disposisi**.

---

## 🔘 4. Spesifikasi Komponen Desain Utama

### A. Lencana Sifat Surat (Urgency Badges)
- **KILAT**: `bg-red-100 text-red-800 border-red-300 font-bold animate-pulse`
- **SEGERA**: `bg-amber-100 text-amber-800 border-amber-300 font-semibold`
- **PENTING**: `bg-blue-100 text-blue-800 border-blue-300 font-medium`
- **BIASA**: `bg-slate-100 text-slate-700 border-slate-300 font-normal`

### B. Lencana Status Disposisi
- **MENUNGGU**: `bg-amber-50 text-amber-700 border-amber-200`
- **DIDISPOSISIKAN**: `bg-blue-50 text-blue-700 border-blue-200`
- **SEDANG DIPROSES**: `bg-purple-50 text-purple-700 border-purple-200`
- **SELESAI**: `bg-emerald-50 text-emerald-700 border-emerald-200`

### C. Pemutar Dokumen PDF (Built-in Split Screen Viewer)
- Tinggi kontainer: `h-[calc(100vh-140px)]`.
- Border: `1px solid var(--color-neutral-100)`.
- Sudut lengkung: `rounded-xl`.
- Kontrol bawaan: Pembesar dokumen (*Zoom In/Out*), ganti halaman, unduh berkas asli, dan cetak langsung.
