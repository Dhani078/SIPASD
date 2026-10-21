import os
import re
import pymysql
from urllib.parse import urlparse

def get_db_connection():
    # Read DATABASE_URL from .env.local
    env_path = os.path.abspath(".env.local")
    db_url = None
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    db_url = line.strip().split("=", 1)[1].strip('"\'')
                    break

    if not db_url:
        raise ValueError("DATABASE_URL not found in .env.local")

    clean_url = db_url.split("?")[0]
    p = urlparse(clean_url)
    
    return pymysql.connect(
        host=p.hostname,
        port=p.port or 4000,
        user=p.username,
        password=p.password,
        database=p.path.lstrip("/"),
        ssl={"rejectUnauthorized": True},
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

def dump_database():
    conn = get_db_connection()
    out_file = os.path.abspath("docs/DATABASE_SIPASD_BACKUP_2026.sql")
    
    tables = [
        "users",
        "bidang_dispora",
        "klasifikasi_arsip",
        "arsip_surat_masuk",
        "riwayat_disposisi",
        "arsip_surat_keluar",
        "buku_ekspedisi",
        "audit_logs"
    ]

    with open(out_file, "w", encoding="utf-8") as f:
        f.write("-- ==========================================================\n")
        f.write("-- DATABASE DUMP: SIPASD (DISPORA PROVINSI KALIMANTAN SELATAN)\n")
        f.write("-- Sistem Informasi Pengelolaan Arsip Surat Dispora\n")
        f.write("-- Tanggal Backup: 21 Oktober 2026\n")
        f.write("-- Sumber: TiDB Cloud Serverless (ap-southeast-1.prod.aws.tidbcloud.com)\n")
        f.write("-- Mahasiswa: Muhammad Rizki Ramadhani (NPM: 2310010406)\n")
        f.write("-- ==========================================================\n\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("SET NAMES utf8mb4;\n\n")

        with conn.cursor() as cursor:
            for table in tables:
                print(f"Dumping table: {table}...")
                f.write(f"-- ---------------------------------------------------------\n")
                f.write(f"-- Struktur Tabel: `{table}`\n")
                f.write(f"-- ---------------------------------------------------------\n")
                cursor.execute(f"SHOW CREATE TABLE `{table}`")
                res = cursor.fetchone()
                create_sql = res.get("Create Table") or list(res.values())[1]
                f.write(f"DROP TABLE IF EXISTS `{table}`;\n")
                f.write(f"{create_sql};\n\n")

                # Dump rows
                cursor.execute(f"SELECT * FROM `{table}`")
                rows = cursor.fetchall()
                if rows:
                    f.write(f"-- Data untuk tabel: `{table}` ({len(rows)} baris)\n")
                    cols = list(rows[0].keys())
                    col_names = ", ".join([f"`{c}`" for c in cols])
                    
                    batch_size = 50
                    for i in range(0, len(rows), batch_size):
                        batch = rows[i:i + batch_size]
                        val_strings = []
                        for row in batch:
                            row_vals = []
                            for col in cols:
                                val = row[col]
                                if val is None:
                                    row_vals.append("NULL")
                                elif isinstance(val, (int, float)):
                                    row_vals.append(str(val))
                                else:
                                    escaped = conn.escape(str(val))
                                    row_vals.append(escaped)
                            val_strings.append(f"({', '.join(row_vals)})")
                        
                        f.write(f"INSERT INTO `{table}` ({col_names}) VALUES\n")
                        f.write(",\n".join(val_strings))
                        f.write(";\n\n")
                else:
                    f.write(f"-- Tabel `{table}` kosong.\n\n")

        f.write("SET FOREIGN_KEY_CHECKS = 1;\n")
        f.write("-- Selesai: Backup basis data SIPASD berhasil diekspor.\n")

    conn.close()
    size_kb = round(os.path.getsize(out_file) / 1024, 2)
    print(f"Dump completed: {out_file} ({size_kb} KB)")

if __name__ == "__main__":
    dump_database()
