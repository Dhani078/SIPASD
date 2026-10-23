import os
import re
import uuid
import ssl
import pymysql
import cloudinary
import cloudinary.uploader
from concurrent.futures import ThreadPoolExecutor

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

SOURCE_BASE = 'C:/xampp/htdocs/Laporan Magang'
SM_DIR = os.path.join(SOURCE_BASE, 'Surat Masuk/Surat Masuk 2026')
SK_DIR = os.path.join(SOURCE_BASE, 'Surat Keluar/Surat Keluar 2026')

def parse_date(filename):
    months = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
        'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08', 'agt': '08', 'agus': '08',
        'september': '09', 'sept': '09', 'septemner': '09', 'oktober': '10', 'okt': '10',
        'november': '11', 'desember': '12'
    }
    match = re.search(r'(\d{1,2})\s*([a-zA-Z]+)(?:\s*(\d{4}))?', filename.lower())
    if match:
        day = match.group(1).zfill(2)
        m_str = match.group(2).lower()
        month = months.get(m_str, '08')
        year = match.group(3) if match.group(3) else '2026'
        return f"{year}-{month}-{day}"
    return "2026-08-15"

def get_conn():
    ctx = ssl.create_default_context()
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        import urllib.parse
        p = urllib.parse.urlparse(db_url)
        return pymysql.connect(
            host=p.hostname or 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
            port=p.port or 4000,
            user=p.username or '2MyeDkP7MjFas9U.root',
            password=p.password or '',
            database=(p.path or '/sipasd').lstrip('/'),
            ssl=ctx,
            autocommit=True
        )
    return pymysql.connect(
        host=os.getenv('TIDB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
        port=int(os.getenv('TIDB_PORT', 4000)),
        user=os.getenv('TIDB_USER', '2MyeDkP7MjFas9U.root'),
        password=os.getenv('TIDB_PASSWORD', ''),
        database=os.getenv('TIDB_DATABASE', 'sipasd'),
        ssl=ctx,
        autocommit=True
    )

def upload_sm_item(filename, idx):
    full_path = os.path.join(SM_DIR, filename)
    num_match = re.findall(r'^\d+', filename)
    raw_num = num_match[0] if num_match else str(idx).zfill(4)
    no_agenda = f"{raw_num.zfill(4)}/SM/DISPORA/2026"
    no_surat = f"NOMOR/{rawNum if 'rawNum' in locals() else raw_num}/DISPORA/2026"
    tgl = parse_date(filename)
    size = os.path.getsize(full_path)
    public_id = f"sm_{raw_num}_{uuid.uuid4().hex[:6]}"

    try:
        res = cloudinary.uploader.upload(
            full_path,
            resource_type='raw',
            folder='sipasd/surat_masuk',
            public_id=public_id,
            overwrite=True
        )
        url = res['secure_url']
        sifat = 'KILAT' if raw_num.endswith(('7', '9')) else ('SEGERA' if raw_num.endswith('5') else 'BIASA')
        
        conn = get_conn()
        with conn.cursor() as cur:
            record_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO arsip_surat_masuk 
                (id, nomor_agenda, nomor_surat, tanggal_surat, tanggal_diterima, asal_instansi, perihal, ringkasan_isi, sifat_surat, file_url, cloudinary_public_id, file_name_original, file_size_bytes, indexed_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), cloudinary_public_id = VALUES(cloudinary_public_id);
            """, (record_id, no_agenda, no_surat, tgl, tgl, 'Instansi Pemerintah / Pengprov Cabor Kalsel', f"Surat Masuk Agenda No. {raw_num} Dispora Prov. Kalsel", filename, sifat, url, res['public_id'], filename, size, 'usr-admin-01'))
            
            disp_id = str(uuid.uuid4())
            bidang_id = (int(raw_num) % 4) + 2 if raw_num.isdigit() else 2
            cur.execute("""
                INSERT INTO riwayat_disposisi
                (id, surat_masuk_id, pejabat_pendisposisi, tanggal_disposisi, kepada_bidang_id, batas_waktu, instruksi_tercatat, catatan_tertulis, status_penyelesaian)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (disp_id, record_id, 'Pebriadin Hapiz, AP, M.Si', tgl, bidang_id, tgl, 'Tindak lanjuti & Fasilitasi', 'Segera koordinasikan dengan bidang terkait.', 'SELESAI'))
        conn.close()
        return True, filename
    except Exception as e:
        return False, f"{filename}: {str(e)}"

def upload_sk_item(filename, idx):
    full_path = os.path.join(SK_DIR, filename)
    num_match = re.findall(r'^\d+', filename)
    raw_num = num_match[0] if num_match else str(3800 + idx)
    no_agenda = f"{raw_num}/SK/DISPORA/2026"
    no_surat = f"426/{raw_num.zfill(4)}-Sekr/DISPORA/2026"
    tgl = parse_date(filename)
    size = os.path.getsize(full_path)
    public_id = f"sk_{raw_num}_{uuid.uuid4().hex[:6]}"

    try:
        res = cloudinary.uploader.upload(
            full_path,
            resource_type='raw',
            folder='sipasd/surat_keluar',
            public_id=public_id,
            overwrite=True
        )
        url = res['secure_url']
        clean_perihal = os.path.splitext(filename)[0].replace('_', ' ')
        
        conn = get_conn()
        with conn.cursor() as cur:
            record_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO arsip_surat_keluar
                (id, nomor_agenda, nomor_surat, nomor_urut, tahun, kode_klasifikasi_id, bidang_pemrakarsa_id, tanggal_surat, tujuan_instansi, perihal, ringkasan_isi, file_url, cloudinary_public_id, file_size_bytes, indexed_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), cloudinary_public_id = VALUES(cloudinary_public_id);
            """, (record_id, no_agenda, no_surat, idx + 1, 2026, 2, 1, tgl, 'KONI Kalsel / Pengurus Cabang Olahraga / Instansi Terkait', f"Surat Keluar Dispora: {clean_perihal}", filename, url, res['public_id'], size, 'usr-admin-01'))
        conn.close()
        return True, filename
    except Exception as e:
        return False, f"{filename}: {str(e)}"

def main():
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute('SELECT file_name_original FROM arsip_surat_masuk;')
        existing_sm = set(r[0] for r in cur.fetchall() if r[0])
        cur.execute('SELECT ringkasan_isi FROM arsip_surat_keluar;')
        existing_sk = set(r[0] for r in cur.fetchall() if r[0])
    conn.close()

    sm_files = [f for f in os.listdir(SM_DIR) if f.lower().endswith('.pdf') and f not in existing_sm]
    sk_files = [f for f in os.listdir(SK_DIR) if f.lower().endswith('.pdf') and f not in existing_sk]

    print(f"Remaining to upload: {len(sm_files)} Surat Masuk, {len(sk_files)} Surat Keluar")

    print("\n--- Uploading Surat Masuk in Parallel (8 threads) ---")
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(upload_sm_item, f, i) for i, f in enumerate(sm_files, 1)]
        done = 0
        for fut in futures:
            ok, res = fut.result()
            done += 1
            if done % 15 == 0 or done == len(sm_files):
                print(f"[SM] {done}/{len(sm_files)} done ({res})")

    print("\n--- Uploading Surat Keluar in Parallel (8 threads) ---")
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(upload_sk_item, f, i) for i, f in enumerate(sk_files, 1)]
        done = 0
        for fut in futures:
            ok, res = fut.result()
            done += 1
            if done % 20 == 0 or done == len(sk_files):
                print(f"[SK] {done}/{len(sk_files)} done ({res})")

    print("\nALL UPLOADS FINISHED!")

if __name__ == '__main__':
    main()
