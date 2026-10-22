import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/drive']

def main():
    client_secrets_path = os.path.abspath('credentials/oauth-client.json')
    token_path = os.path.abspath('credentials/token.json')

    if not os.path.exists(client_secrets_path):
        print(f"Error: {client_secrets_path} not found.")
        return

    print("Memulai proses otorisasi Google Drive...")
    print("Browser default akan terbuka secara otomatis untuk konfirmasi akun Google.")

    flow = InstalledAppFlow.from_client_secrets_file(
        client_secrets_path,
        scopes=SCOPES
    )

    creds = flow.run_local_server(
        port=8085,
        open_browser=True,
        prompt='consent',
        access_type='offline'
    )

    with open(token_path, 'w', encoding='utf-8') as token_file:
        token_file.write(creds.to_json())

    print(f"\nOtorisasi berhasil! Token permanen disimpan di: {token_path}")

    # Test build drive service to verify user
    service = build('drive', 'v3', credentials=creds)
    about = service.about().get(fields='user, storageQuota').execute()
    user_info = about.get('user', {})
    quota = about.get('storageQuota', {})

    email = user_info.get('emailAddress', 'Unknown')
    name = user_info.get('displayName', 'Unknown')
    limit_gb = round(int(quota.get('limit', 0)) / (1024**3), 2)
    usage_gb = round(int(quota.get('usage', 0)) / (1024**3), 2)

    print(f"Akun Terhubung : {name} ({email})")
    print(f"Kapasitas Kuota: {usage_gb} GB terpakai dari {limit_gb} GB")

if __name__ == '__main__':
    main()
