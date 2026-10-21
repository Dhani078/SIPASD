import os
import zipfile

def create_bundle():
    zip_path = os.path.abspath("docs/SIPASD_BERKAS_MAGANG_LENGKAP_2026.zip")
    
    files_to_pack = [
        "docs/LAPORAN_MAGANG_SIPASD_DISPORA_KALSEL.docx",
        "docs/PRESENTASI_SIDANG_MAGANG_SIPASD.pptx",
        "docs/PRESENTASI_SIDANG_MAGANG_SIPASD.html",
        "docs/PANDUAN_SIDANG_DAN_TANYA_JAWAB_PENGUJI.md",
        "docs/DATABASE_SIPASD_BACKUP_2026.sql",
        "docs/PANDUAN_PENGGUNA.md",
        "docs/TESTING_REPORT.md",
        "docs/SOP_KEDINASAN.md",
        "docs/DATABASE_SCHEMA.md",
        "docs/UML_DIAGRAMS.md",
        "docs/SECURITY_AUDIT.md",
        "docs/SKRIPSI_UPGRADE_ROADMAP.md",
        "README.md"
    ]

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file in files_to_pack:
            if os.path.exists(file):
                arcname = os.path.basename(file)
                zipf.write(file, arcname)
                print(f"Added to ZIP: {arcname}")
            else:
                print(f"Warning: {file} not found!")

    size_kb = round(os.path.getsize(zip_path) / 1024, 2)
    print(f"\nZIP Bundle created: {zip_path} ({size_kb} KB)")

if __name__ == "__main__":
    create_bundle()
