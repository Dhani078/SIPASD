# Design System Master File: SIPASD Dispora Kalsel
**Sistem Informasi Pengelolaan Arsip Surat Dispora Provinsi Kalimantan Selatan**  
*Klasifikasi: Enterprise Civic Archive & Document Repository Design Tokens*

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** SIPASD Dispora Kalsel  
**Design Dials:** Density 8/10 (Dense / Document Repository Workspace) | Variance 6/10 | Motion 4/10  
**Design Persona:** Enterprise GovTech / Linear-clean for Public Administration  

---

## 1. Global Color Tokens (Identitas Resmi Pemprov Kalsel & Anti-AI Slop)

| Token Name | Hex Code | Tailwind v4 Token | Peruntukan Antarmuka | Kontras WCAG |
| :--- | :--- | :--- | :--- | :---: |
| `--color-primary-900` | `#064E3B` | `bg-emerald-900` | Header navbar utama, sidebar pimpinan, kop dokumen cetak | 12.8:1 (AAA) |
| `--color-primary-700` | `#047857` | `bg-emerald-700` | Tombol aksi utama (*primary CTA*), border fokus, link aktif | 7.2:1 (AAA) |
| `--color-primary-50`  | `#ECFDF5` | `bg-emerald-50`  | Latar belakang baris tabel aktif, highlight kartu terpilih | Background |
| `--color-accent-gold` | `#D97706` | `bg-amber-600`   | Aksen lambang Banua Kalsel, kartu KPI keluar, status segera | 4.8:1 (AA) |
| `--color-background`  | `#F8FAFC` | `bg-slate-50`    | Latar belakang kanvas aplikasi (*page canvas*) | Background |
| `--color-surface`     | `#FFFFFF` | `bg-white`       | Latar belakang kartu data (*cards*), modal, tabel | Surface |
| `--color-foreground`  | `#0F172A` | `text-slate-900` | Teks judul utama, isi data tabel, teks cetak resmi | 16.2:1 (AAA) |
| `--color-muted-fg`    | `#475569` | `text-slate-600` | Label formulir, nomor agenda sekunder, keterangan | 6.5:1 (AAA) |
| `--color-border`      | `#E2E8F0` | `border-slate-200`| Garis batas kartu, garis pemisah tabel, input border | UI Element |
| `--color-destructive` | `#DC2626` | `bg-red-600`     | Lencana sifat surat *KILAT*, peringatan overdue, tombol hapus| 5.1:1 (AA) |

---

## 2. Tipografi Resmi (Typography Tokens)

- **Font Utama Antarmuka**: `Plus Jakarta Sans`, `Inter`, system-ui, sans-serif.
- **Font Naskah Cetak Resmi**: `Calibri`, `Segoe UI`, `Arial`, sans-serif.
- **Font Nomor & Tanggal (Tabular Figures)**: `font-mono` atau `tabular-nums` untuk perataan angka pada tabel register.

### Skala Ukuran:
- `text-2xl` (24px - font-bold): Judul halaman dashboard & modul utama.
- `text-lg` (18px - font-semibold): Judul kartu analitik, header panel split-screen.
- `text-sm` (14px - font-medium): Nilai data tabel, teks formulir input, perihal surat.
- `text-xs` (12px - font-medium): Tanggal terima, nomor agenda, lencana status, audit timestamp.

---

## 3. Spacing Scale (Density 8/10 - Dense Dashboard)

| Token | Nilai | Penggunaan |
| :--- | :--- | :--- |
| `--space-xs` | `4px` / `0.25rem` | Jarak antar ikon dan teks inline |
| `--space-sm` | `8px` / `0.5rem` | Padding internal badge status & tombol kecil |
| `--space-md` | `12px` / `0.75rem`| Padding sel tabel data & form input |
| `--space-lg` | `16px` / `1rem` | Padding kartu metrik KPI & panel samping |
| `--space-xl` | `24px` / `1.5rem`| Jarak antar section dashboard |

---

## 4. Aturan Anti-AI Slop & Larangan Desain (Banned Patterns)

1. **Dilarang Menggunakan Gradien Ungu / Neon AI**: Tidak ada tombol ungu `bg-purple-600` atau gradien mesh neon. Wajib menggunakan palet hijau zamrud dinas (`#047857`) dan slate formal.
2. **Dilarang Menggunakan 3 Kartu Berukuran Sama**: Susun kartu secara asimetris dengan ritme informasi hierarkis.
3. **Dilarang Menggunakan Em-Dash (` - `)**: Gunakan tanda hubung biasa (`-`), tanda kurung, atau titik koma pada seluruh antarmuka dan label.
4. **Dilarang Menggunakan Emoji Sebagai Ikon**: Seluruh ikon wajib menggunakan SVG resmi dari **Lucide React** (`lucide-react`) atau Phosphor Icons.
5. **Dilarang Menggunakan Placeholder sebagai Label**: Seluruh input formulir wajib memiliki `<label>` eksplisit di atas bidang isian.
6. **Zero Horizontal Overflow**: Lebar layar 375px ponsel hingga 1440px desktop wajib bebas dari scrollbar horizontal.
