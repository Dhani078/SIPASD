import os
import re
import sys
import pymupdf

SM_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Masuk\Surat Masuk 2026"
SK_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Keluar\Surat Keluar 2026"

def inspect_text_contents():
    print("Extracting insights from text-bearing PDFs...")
    
    agencies = set()
    subjects = []
    classifications_found = {}
    
    for folder, label in [(SM_DIR, "Surat Masuk"), (SK_DIR, "Surat Keluar")]:
        for f in os.listdir(folder):
            if not f.lower().endswith('.pdf'):
                continue
            path = os.path.join(folder, f)
            try:
                doc = pymupdf.open(path)
                text = ""
                for p in doc:
                    text += p.get_text() + "\n"
                doc.close()
                
                if len(text.strip()) < 40:
                    continue
                
                # Check nomor surat
                no_match = re.search(r'(?:Nomor|No\.?)\s*:\s*([0-9A-Za-z\.\/\-]+)', text)
                
                # Check perihal / hal
                hal_match = re.search(r'(?:Perihal|Hal)\s*:\s*([^\n\r]+(?:\n[^\n\r]+)?)', text, re.IGNORECASE)
                if hal_match:
                    clean_hal = re.sub(r'\s+', ' ', hal_match.group(1)).strip()
                    if len(clean_hal) > 10 and len(clean_hal) < 120:
                        subjects.append((label, f, clean_hal))
                
                # Check tujuan / kepda
                yth_match = re.search(r'Yth\.?\s*([^\n\r]+)', text, re.IGNORECASE)
                if yth_match:
                    clean_yth = re.sub(r'\s+', ' ', yth_match.group(1)).strip()
                    if len(clean_yth) > 5 and len(clean_yth) < 80:
                        agencies.add(clean_yth)
                        
                # Check klasifikasi
                code_match = re.search(r'\b(005|426|427|800|045|900)\b', text)
                if code_match:
                    c = code_match.group(1)
                    classifications_found[c] = classifications_found.get(c, 0) + 1
                    
            except Exception as err:
                sys.stderr.write(f"Warning: {f}: {err}\n")
                continue
                
    print(f"\nExtracted {len(subjects)} real subjects, {len(agencies)} destination agencies.")
    print("Classification Codes Occurrence in Text:", classifications_found)
    
    print("\nSample Real Senders/Recipients (Yth):")
    for a in list(agencies)[:15]:
        print("  *", a)
        
    print("\nSample Real Perihal (Subject):")
    for s in subjects[:20]:
        print(f"  [{s[0]}] {s[1]}: {s[2]}")

if __name__ == '__main__':
    inspect_text_contents()
