import os
import re
import pymupdf

SM_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Masuk\Surat Masuk 2026"
SK_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Keluar\Surat Keluar 2026"

def analyze_folder(folder_path, label):
    files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    total_size = sum(os.path.getsize(os.path.join(folder_path, f)) for f in files)
    
    total_pages = 0
    page_dist = {}
    has_text_count = 0
    scanned_image_only_count = 0
    
    naming_patterns = {
        "agenda_date": 0,    # e.g., 0973(14 Agustus 2026).pdf, 0897(3agus).pdf
        "numbered_seq": 0,    # e.g., 4302(1).pdf, 7476(sek).pdf
        "multi_surat": 0,     # e.g., 7480-82, 3 surat_20260902_0001.pdf
        "scanner_default": 0, # e.g., 4009_20260602_0001(1).pdf
        "other": 0
    }
    
    sample_files = []
    
    for i, f in enumerate(files):
        fpath = os.path.join(folder_path, f)
        fsize = os.path.getsize(fpath)
        
        # Categorize naming
        if re.search(r'\d+\s*surat', f, re.IGNORECASE) or re.search(r'\d+-\d+', f):
            naming_patterns["multi_surat"] += 1
        elif re.search(r'\d{8}_\d{4}', f):
            naming_patterns["scanner_default"] += 1
        elif re.search(r'\(\d+\s*(?:jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)', f, re.IGNORECASE):
            naming_patterns["agenda_date"] += 1
        elif re.search(r'\(\w+\)', f):
            naming_patterns["numbered_seq"] += 1
        else:
            naming_patterns["other"] += 1
            
        try:
            doc = pymupdf.open(fpath)
            pages = len(doc)
            total_pages += pages
            page_dist[pages] = page_dist.get(pages, 0) + 1
            
            # Check text
            full_text = ""
            for p in doc:
                full_text += p.get_text()
                
            if len(full_text.strip()) > 30:
                has_text_count += 1
            else:
                scanned_image_only_count += 1
                
            if i < 10 or i % 30 == 0:
                sample_files.append({
                    "name": f,
                    "size_kb": round(fsize / 1024, 1),
                    "pages": pages,
                    "has_text": len(full_text.strip()) > 30,
                    "text_len": len(full_text.strip())
                })
            doc.close()
        except Exception as e:
            print(f"Error reading {f}: {e}")
            
    return {
        "label": label,
        "count": len(files),
        "total_size_mb": round(total_size / (1024 * 1024), 2),
        "total_pages": total_pages,
        "avg_pages_per_doc": round(total_pages / len(files), 2) if files else 0,
        "page_distribution": sorted(page_dist.items()),
        "has_text_count": has_text_count,
        "scanned_image_only_count": scanned_image_only_count,
        "naming_patterns": naming_patterns,
        "samples": sample_files
    }

print("Analyzing Surat Masuk...")
sm_stats = analyze_folder(SM_DIR, "Surat Masuk 2026")
print("Analyzing Surat Keluar...")
sk_stats = analyze_folder(SK_DIR, "Surat Keluar 2026")

print("\n================== SUMMARY ==================")
import json
print(json.dumps({"surat_masuk": sm_stats, "surat_keluar": sk_stats}, indent=2))
