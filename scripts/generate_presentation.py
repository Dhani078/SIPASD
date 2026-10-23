import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Brand Colors
    EMERALD_DARK = RGBColor(6, 78, 59)    # #064E3B
    EMERALD_LIGHT = RGBColor(16, 185, 129) # #10B981
    GOLD = RGBColor(217, 119, 6)           # #D97706
    CANVAS_BG = RGBColor(248, 250, 252)    # #F8FAFC
    TEXT_MAIN = RGBColor(15, 23, 42)       # #0F172A
    TEXT_MUTED = RGBColor(71, 85, 105)     # #475569
    WHITE = RGBColor(255, 255, 255)

    def set_slide_background(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="SIDANG PRAKTIK KERJA LAPANGAN TI UNISKA"):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11), Inches(0.4))
        p_cat = cat_box.text_frame.paragraphs[0]
        r_cat = p_cat.add_run()
        r_cat.text = category.upper()
        r_cat.font.name = "Arial"
        r_cat.font.size = Pt(10)
        r_cat.font.bold = True
        r_cat.font.color.rgb = GOLD

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.5), Inches(0.8))
        p_title = title_box.text_frame.paragraphs[0]
        r_title = p_title.add_run()
        r_title.text = title
        r_title.font.name = "Arial"
        r_title.font.size = Pt(22)
        r_title.font.bold = True
        r_title.font.color.rgb = EMERALD_DARK

    def add_card(slide, x, y, w, h, bg_color=WHITE, line_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if line_color:
            card.line.color.rgb = line_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # ================= SLIDE 1: COVER =================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1, EMERALD_DARK)

    # Accent Gold Top Strip
    top_strip = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.15))
    top_strip.fill.solid()
    top_strip.fill.fore_color.rgb = GOLD
    top_strip.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.2), Inches(11.3), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    p0.text = "PEMERINTAH PROVINSI KALIMANTAN SELATAN | DISPORA KALSEL"
    p0.font.name = "Arial"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = GOLD
    p0.space_after = Pt(16)

    p1 = tf1.add_paragraph()
    p1.text = "SIPASD: Rancang Bangun Sistem Informasi Pengelolaan Arsip Surat Berbasis Repositori Digital Terindeks"
    p1.font.name = "Arial"
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    p1.space_after = Pt(14)

    p2 = tf1.add_paragraph()
    p2.text = "Studi Kasus: Pengelolaan 420 Dokumen Korespondensi Fisik TA 2026 Sekretariat Dispora Kalsel"
    p2.font.name = "Arial"
    p2.font.size = Pt(16)
    p2.font.color.rgb = RGBColor(197, 219, 210)
    p2.space_after = Pt(36)

    p3 = tf1.add_paragraph()
    p3.text = "Penyusun: Muhammad Rizki Ramadhani (NPM: 2310010406)\n" \
              "Program Studi S1 Teknik Informatika - Fakultas Teknologi Informasi\n" \
              "Universitas Islam Kalimantan (UNISKA) Muhammad Arsyad Al Banjari Banjarmasin | 2026"
    p3.font.name = "Arial"
    p3.font.size = Pt(12)
    p3.font.color.rgb = WHITE

    # ================= SLIDE 2: LATAR BELAKANG =================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2, CANVAS_BG)
    add_header(s2, "Latar Belakang & Masalah Riil Google Drive", "ANALISIS MASALAH")

    add_card(s2, 0.8, 1.8, 5.6, 5.0, WHITE)
    add_card(s2, 6.8, 1.8, 5.6, 5.0, WHITE)

    tb2_left = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf2_l = tb2_left.text_frame
    tf2_l.word_wrap = True
    p = tf2_l.paragraphs[0]
    p.text = "Kondisi Eksisting di Dispora Kalsel:"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = EMERALD_DARK
    p.space_after = Pt(12)

    bullets_l = [
        "420 berkas fisik scan PDF tersimpan di Google Drive dinas tanpa metadata terstruktur (171 Surat Masuk, 249 Surat Keluar).",
        "Penamaan file manual acak (contoh: '0973(14 Agustus 2026).pdf', '4302(1).pdf', '7480-82, 3 surat.pdf').",
        "Waktu temu-kembali arsip memakan 15 hingga 30 menit karena staf harus membuka satu per satu berkas PDF.",
        "Ketiadaan pencatatan riwayat disposisi fisik pimpinan dan tidak ada ekspor buku agenda resmi kedinasan."
    ]
    for b in bullets_l:
        p_b = tf2_l.add_paragraph()
        p_b.text = "- " + b
        p_b.font.name = "Arial"
        p_b.font.size = Pt(12)
        p_b.font.color.rgb = TEXT_MAIN
        p_b.space_after = Pt(8)

    tb2_right = s2.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.2), Inches(4.5))
    tf2_r = tb2_right.text_frame
    tf2_r.word_wrap = True
    p = tf2_r.paragraphs[0]
    p.text = "Solusi Melalui Sistem SIPASD:"
    p.font.name = "Arial"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = GOLD
    p.space_after = Pt(12)

    bullets_r = [
        "Katalog digital terindeks: Pencarian multi-kriteria memotong waktu temu-kembali menjadi < 2 detik.",
        "Penampil PDF bawaan (Built-in Viewer): Pembacaan dokumen langsung di browser tanpa unduh lokal.",
        "Digitalisasi Disposisi Fisik: Perekaman instruksi pimpinan dan cetak lembar disposisi standar Pemprov (A4/F4).",
        "Ekspor Buku Agenda Excel: Generator otomatis buku agenda persuratan dinas via exceljs.",
        "Arsitektur Zero Cost: Beroperasi gratis Rp 0,-/bulan pada TiDB Cloud Serverless dan Vercel Edge Network."
    ]
    for b in bullets_r:
        p_b = tf2_r.add_paragraph()
        p_b.text = "- " + b
        p_b.font.name = "Arial"
        p_b.font.size = Pt(12)
        p_b.font.color.rgb = TEXT_MAIN
        p_b.space_after = Pt(8)

    # ================= SLIDE 3: ARSITEKTUR CLOUD =================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3, CANVAS_BG)
    add_header(s3, "Arsitektur Sistem: Cloud Serverless (Zero Cost Guarantee)", "ARSITEKTUR & TEKNOLOGI")

    cols = [
        ("Frontend & Hosting", "Vercel Edge Network", "Next.js 15 App Router\nTailwind CSS v4\nTypeScript 5\nGlobal CDN Anycast\nDomain: sipasd.my.id"),
        ("Basis Data Relasional", "TiDB Cloud Serverless", "8 Tabel Relasional (3NF)\nRegion: Singapore\nLatensi: < 35 ms\nKuota Gratis: 25 GB\nZero Dummy Data"),
        ("Penyimpanan Ganda", "Dual-Cloud Storage", "Primer: Cloudinary CDN\n(Streaming PDF < 2s)\nSekunder: Google Drive\n(Backup Akun Resmi Dinas)\n411 Berkas PDF Riil"),
        ("Keamanan & Akses", "RBAC 4 Tingkat", "JWT Cookie HttpOnly\nBcrypt Hash Password\n4 Aktor Kedinasan\nAudit Trail Logging\nOWASP Top 10 Compliant")
    ]
    for i, (title, sub, desc) in enumerate(cols):
        cx = 0.8 + i * 2.95
        add_card(s3, cx, 1.8, 2.75, 5.0, WHITE)
        tbox = s3.shapes.add_textbox(Inches(cx + 0.15), Inches(2.0), Inches(2.45), Inches(4.5))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = EMERALD_DARK
        p1.space_after = Pt(4)

        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.name = "Arial"
        p2.font.size = Pt(11)
        p2.font.bold = True
        p2.font.color.rgb = GOLD
        p2.space_after = Pt(12)

        for line in desc.split("\n"):
            p_desc = tf.add_paragraph()
            p_desc.text = "- " + line
            p_desc.font.name = "Arial"
            p_desc.font.size = Pt(10)
            p_desc.font.color.rgb = TEXT_MUTED
            p_desc.space_after = Pt(4)

    # ================= SLIDE 4: BASIS DATA =================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4, CANVAS_BG)
    add_header(s4, "Skema Basis Data 8 Tabel Relasional (3NF - TiDB Cloud)", "DESAIN BASIS DATA")

    tables_info = [
        ("users", "5 Akun", "Data akun kedinasan, NIP, role RBAC, dan password hash."),
        ("bidang_dispora", "5 Bidang", "Struktur 5 unit kerja: Sekr, Pora, Prestasi, Pemuda, Sapras."),
        ("klasifikasi_arsip", "6 Kode", "Master kode: 005 (Undangan), 426 (Olahraga), 800 (Pegawai), dll."),
        ("arsip_surat_masuk", "170 Berkas", "Metadata surat masuk pindaian riil TA 2026 terhubung Cloudinary."),
        ("riwayat_disposisi", "Disposisi", "Perekaman riwayat disposisi pimpinan, arahan, dan batas waktu."),
        ("arsip_surat_keluar", "241 Berkas", "Metadata surat keluar terregistrasi dinas TA 2026."),
        ("buku_ekspedisi", "Ekspedisi", "Pencatatan tanda terima pengiriman fisik berkas keluar."),
        ("audit_logs", "Audit Trail", "Jejak rekaman aktivitas pengguna untuk kepatuhan keamanan.")
    ]

    for i, (tname, badge, tdesc) in enumerate(tables_info):
        row = i // 4
        col = i % 4
        cx = 0.8 + col * 2.95
        cy = 1.8 + row * 2.5
        add_card(s4, cx, cy, 2.75, 2.2, WHITE)
        tbox = s4.shapes.add_textbox(Inches(cx + 0.15), Inches(cy + 0.15), Inches(2.45), Inches(1.9))
        tf = tbox.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = tname
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = EMERALD_DARK

        p2 = tf.add_paragraph()
        p2.text = badge
        p2.font.name = "Arial"
        p2.font.size = Pt(10)
        p2.font.bold = True
        p2.font.color.rgb = GOLD
        p2.space_after = Pt(4)

        p3 = tf.add_paragraph()
        p3.text = tdesc
        p3.font.name = "Arial"
        p3.font.size = Pt(10)
        p3.font.color.rgb = TEXT_MUTED

    # ================= SLIDE 5: FITUR UTAMA =================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5, CANVAS_BG)
    add_header(s5, "Implementasi Fitur Utama Sistem SIPASD", "FITUR SISTEM")

    features = [
        ("Katalog & Pencarian Instan", "Temu-kembali 411 arsip persuratan dalam < 2 detik. Multi-filter berdasarkan nomor agenda, nomor surat, instansi, perihal, dan 11 venue olahraga Banua."),
        ("Split-Screen PDF Viewer", "Panel terbagi menyajikan daftar tabel di sisi kiri dan penampil dokumen PDF fisik asli di sisi kanan. Terhubung API streaming signed URL Cloudinary anti-401."),
        ("Cetak Disposisi Standar Pemprov", "Format cetak lembar disposisi ukuran F4 dan A4 presisi sesuai standar Pergub Kalsel. Lengkap dengan kop dinas, opsi teruskan 5 bidang, dan arahan tertulis."),
        ("Buku Agenda Excel Otomatis", "Ekspor data persuratan langsung ke format spreadsheet Excel (.xlsx) rapi dengan header resmi kedinasan via exceljs untuk kebutuhan SPJ dinas.")
    ]

    for i, (ftitle, fdesc) in enumerate(features):
        row = i // 2
        col = i % 2
        cx = 0.8 + col * 5.9
        cy = 1.8 + row * 2.5
        add_card(s5, cx, cy, 5.6, 2.2, WHITE)
        tbox = s5.shapes.add_textbox(Inches(cx + 0.25), Inches(cy + 0.2), Inches(5.1), Inches(1.8))
        tf = tbox.text_frame
        tf.word_wrap = True

        p1 = tf.paragraphs[0]
        p1.text = f"{i+1}. {ftitle}"
        p1.font.name = "Arial"
        p1.font.size = Pt(14)
        p1.font.bold = True
        p1.font.color.rgb = EMERALD_DARK
        p1.space_after = Pt(6)

        p2 = tf.add_paragraph()
        p2.text = fdesc
        p2.font.name = "Arial"
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MAIN

    # ================= SLIDE 6: PENGUJIAN & KESIMPULAN =================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6, EMERALD_DARK)

    # Accent Gold Top Strip
    top_strip = s6.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.15))
    top_strip.fill.solid()
    top_strip.fill.fore_color.rgb = GOLD
    top_strip.line.fill.background()

    tb6 = s6.shapes.add_textbox(Inches(1.0), Inches(1.0), Inches(11.3), Inches(5.5))
    tf6 = tb6.text_frame
    tf6.word_wrap = True

    p_head = tf6.paragraphs[0]
    p_head.text = "Hasil Pengujian & Kesimpulan Sidang Magang"
    p_head.font.name = "Arial"
    p_head.font.size = Pt(24)
    p_head.font.bold = True
    p_head.font.color.rgb = WHITE
    p_head.space_after = Pt(20)

    points = [
        "15 Skenario Uji Black Box Testing: 100% Valid dan Berhasil tanpa galat kompilasi (0 error).",
        "Kecepatan Temu-Kembali: Terpangkas dari 15-30 menit di Google Drive menjadi rata-rata 1,2 detik pada sistem SIPASD.",
        "Zero Dummy Data: 100% data riil 411 arsip TA 2026 terindeks dan tersambung ke basis data TiDB Cloud Serverless.",
        "Akses Publik Resmi: Sistem telah aktif dan live pada domain resmi https://www.sipasd.my.id dengan sertifikat SSL valid.",
        "Rencana Skripsi S1: Siap ditingkatkan dengan implementasi kecerdasan buatan OCR Tesseract dan Naive Bayes untuk klasifikasi surat otomatis."
    ]
    for pt in points:
        p_pt = tf6.add_paragraph()
        p_pt.text = "[V] " + pt
        p_pt.font.name = "Arial"
        p_pt.font.size = Pt(13)
        p_pt.font.color.rgb = RGBColor(220, 240, 230)
        p_pt.space_after = Pt(12)

    p_close = tf6.add_paragraph()
    p_close.text = "\nTerima Kasih - Dinas Kepemudaan dan Olahraga Provinsi Kalimantan Selatan & FTI UNISKA 2026"
    p_close.font.name = "Arial"
    p_close.font.size = Pt(12)
    p_close.font.bold = True
    p_close.font.color.rgb = GOLD

    out_path = os.path.abspath("docs/PRESENTASI_SIDANG_MAGANG_SIPASD.pptx")
    prs.save(out_path)
    print(f"Presentation deck saved: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == '__main__':
    create_deck()
