import os
import zipfile

def pack_source():
    out_zip = os.path.abspath("docs/SIPASD_SOURCE_CODE_2026.zip")
    base_dir = os.path.abspath(".")

    exclude_dirs = {".git", ".next", "node_modules", ".vercel", "__pycache__"}
    exclude_files = {".env.local", "tsconfig.tsbuildinfo"}

    print("Packing source code for UNISKA CD-ROM / Flashdisk submission...")
    file_count = 0

    with zipfile.ZipFile(out_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files or file.endswith(".pyc") or file.endswith(".log"):
                    continue
                # Do not re-pack the zip itself if in docs/
                if file.endswith(".zip"):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                zipf.write(full_path, rel_path)
                file_count += 1

    size_kb = round(os.path.getsize(out_zip) / 1024, 2)
    print(f"Source Code ZIP created: {out_zip}")
    print(f"Total files packed: {file_count} ({size_kb} KB)")

if __name__ == "__main__":
    pack_source()
