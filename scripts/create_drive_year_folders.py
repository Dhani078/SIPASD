import os
import sys
import time
import json
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

PARENT_FOLDER_ID = '1QzW_9rFogegOhn--eLNb_rqu4jvz3oj0'  # sistem magang
TOKEN_PATH = os.path.abspath('credentials/token.json')
MAPPING_OUT = os.path.abspath('docs/GOOGLE_DRIVE_FOLDERS_MAPPING.json')

def main():
    print('=== SIPASD BOT: GOOGLE DRIVE YEAR FOLDERS GENERATOR (2000 - 2025) ===')
    if not os.path.exists(TOKEN_PATH):
        print(f'Error: {TOKEN_PATH} not found.')
        return

    creds = Credentials.from_authorized_user_file(TOKEN_PATH)
    service = build('drive', 'v3', credentials=creds)

    print(f'Fetching existing folders in parent: {PARENT_FOLDER_ID}...')
    existing = {}
    page_token = None
    while True:
        res = service.files().list(
            q=f"'{PARENT_FOLDER_ID}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'",
            fields='nextPageToken, files(id, name)',
            pageToken=page_token,
            pageSize=100
        ).execute()
        for f in res.get('files', []):
            existing[f['name']] = f['id']
        page_token = res.get('nextPageToken')
        if not page_token:
            break

    print(f'Existing folders in Drive: {len(existing)}')
    for name, fid in existing.items():
        print(f'  ✓ {name}: {fid}')

    folders_map = dict(existing)
    years = list(range(2025, 1999, -1))  # 2025 down to 2000

    created_count = 0
    for y in years:
        for prefix in ['Surat Masuk', 'Surat Keluar']:
            folder_name = f'{prefix} {y}'
            if folder_name in folders_map:
                print(f'[EXISTS] {folder_name}')
                continue

            try:
                meta = {
                    'name': folder_name,
                    'mimeType': 'application/vnd.google-apps.folder',
                    'parents': [PARENT_FOLDER_ID]
                }
                folder = service.files().create(body=meta, fields='id, name').execute()
                fid = folder.get('id')
                folders_map[folder_name] = fid
                created_count += 1
                print(f'[{created_count}] Created: {folder_name} -> {fid}')
                time.sleep(0.15)  # gentle rate limit
            except Exception as e:
                print(f'[ERROR] Failed to create {folder_name}: {e}')
                time.sleep(1)

    os.makedirs(os.path.dirname(MAPPING_OUT), exist_ok=True)
    with open(MAPPING_OUT, 'w', encoding='utf-8') as f:
        json.dump(folders_map, f, indent=2)

    print(f'\nDone! Total {created_count} new folders created in Google Drive "sistem magang".')
    print(f'Mapping recorded to: {MAPPING_OUT}')

if __name__ == '__main__':
    main()
