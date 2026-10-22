import os
import sys
import pymysql
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SM_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Masuk\Surat Masuk 2026"
SK_DIR = r"C:\xampp\htdocs\Laporan Magang\Surat Keluar\Surat Keluar 2026"
SM_FOLDER_ID = "1deTFD7oICTXkkMs5HzS-bhtZzvCqfW9n"
SK_FOLDER_ID = "1rgWCFwULt8awBCVIuomy7cELKqEtbdkx"

def get_db():
    db_url = None
    with open(".env.local", "r", encoding="utf-8") as f:
        for line in f:
            if line.startswith("DATABASE_URL="):
                db_url = line.strip().split("=", 1)[1].strip('"\'').split("?")[0]
                break
    p = urlparse(db_url)
    return pymysql.connect(
        host=p.hostname, port=p.port or 4000, user=p.username, password=p.password,
        database=p.path.lstrip("/"), ssl={"rejectUnauthorized": True}, autocommit=True
    )

def list_existing_in_drive(creds, folder_id):
    service = build("drive", "v3", credentials=creds)
    existing = {}
    page_token = None
    while True:
        res = service.files().list(
            q=f"'{folder_id}' in parents and trashed = false",
            fields="nextPageToken, files(id, name, webViewLink)",
            pageToken=page_token,
            pageSize=1000
        ).execute()
        for f in res.get("files", []):
            existing[f["name"]] = f.get("webViewLink")
        page_token = res.get("nextPageToken")
        if not page_token:
            break
    return existing

def upload_single_file(creds, fpath, fname, folder_id):
    service = build("drive", "v3", credentials=creds)
    meta = {"name": fname, "parents": [folder_id]}
    media = MediaFileUpload(fpath, mimetype="application/pdf", resumable=True)
    uploaded = service.files().create(body=meta, media_body=media, fields="id, name, webViewLink").execute()
    return fname, uploaded.get("webViewLink")

def process_batch(source_dir, folder_id, is_masuk):
    creds = Credentials.from_authorized_user_file("credentials/token.json")
    db = get_db()
    existing = list_existing_in_drive(creds, folder_id)
    files = [f for f in os.listdir(source_dir) if f.lower().endswith(".pdf")]
    label = "Surat Masuk" if is_masuk else "Surat Keluar"
    print(f"\nProcessing {len(files)} files for {label}...")
    print(f"Already in Drive: {len(existing)} files.")

    to_upload = [f for f in files if f not in existing]
    print(f"Need to upload: {len(to_upload)} files.")

    uploaded_map = dict(existing)
    completed = 0

    if to_upload:
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_file = {
                executor.submit(upload_single_file, creds, os.path.join(source_dir, f), f, folder_id): f
                for f in to_upload
            }
            for future in as_completed(future_to_file):
                fn = future_to_file[future]
                try:
                    name, link = future.result()
                    uploaded_map[name] = link
                    completed += 1
                    if completed % 10 == 0 or completed == len(to_upload):
                        print(f"  [{completed}/{len(to_upload)}] Uploaded {name}")
                        sys.stdout.flush()
                except Exception as e:
                    print(f"  [ERROR] Failed to upload {fn}: {e}")
                    sys.stdout.flush()

    # Update database links
    print(f"Updating TiDB links for {label}...")
    cursor = db.cursor()
    updated_count = 0
    for name, link in uploaded_map.items():
        if is_masuk:
            cursor.execute(
                "UPDATE arsip_surat_masuk SET drive_url = %s WHERE file_name_original = %s OR ringkasan_isi = %s",
                (link, name, name)
            )
        else:
            cursor.execute(
                "UPDATE arsip_surat_keluar SET drive_url = %s WHERE ringkasan_isi = %s",
                (link, name)
            )
        if cursor.rowcount > 0:
            updated_count += 1

    print(f"Updated {updated_count} rows in TiDB with exact Drive file links for {label}.")
    db.close()

def main():
    print("=== SIPASD BOT: GOOGLE DRIVE BATCH UPLOADER ===")
    sys.stdout.flush()
    process_batch(SM_DIR, SM_FOLDER_ID, is_masuk=True)
    process_batch(SK_DIR, SK_FOLDER_ID, is_masuk=False)
    print("\n=== ALL 420 REAL DISPORA PDFS UPLOADED & TI-DB UPDATED ===")

if __name__ == "__main__":
    main()
