import pymysql
import re
from pathlib import Path
from urllib.parse import urlparse

db_url = None
env_path = Path(__file__).resolve().parent.parent / '.env.local'
with open(env_path, 'r') as f:
    for l in f:
        if l.startswith('DATABASE_URL='):
            db_url = l.split('=', 1)[1].strip('"\x27\n').split('?')[0]
            break

p = urlparse(db_url)
conn = pymysql.connect(
    host=p.hostname, port=p.port or 4000, user=p.username, password=p.password,
    database=p.path.lstrip('/'), ssl={'rejectUnauthorized': True}
)
c = conn.cursor()

def clean_agency(agency, nomor_surat):
    a = agency.strip()
    ns = (nomor_surat or '').upper()

    if '/BKD/' in ns: return 'Badan Kepegawaian Daerah Prov. Kalsel'
    if '/BAPPEDA/' in ns: return 'Bappeda Prov. Kalimantan Selatan'
    if '/BPKAD/' in ns: return 'BPKAD Prov. Kalimantan Selatan'
    if '/DISPERSIP/' in ns: return 'Dinas Perpustakaan dan Kearsipan Prov. Kalsel'
    if '/DINSOS/' in ns: return 'Dinas Sosial Prov. Kalimantan Selatan'
    if '/PUPR/' in ns: return 'Dinas PUPR Prov. Kalimantan Selatan'
    if '/KESBANGPOL/' in ns: return 'Bakesbangpol Prov. Kalimantan Selatan'
    if '/DISPAR/' in ns: return 'Dinas Pariwisata Prov. Kalimantan Selatan'
    if '/ORG/' in ns: return 'Biro Organisasi Setda Prov. Kalsel'
    if '/ADBANG/' in ns: return 'Biro Administrasi Pembangunan Setda Prov. Kalsel'
    if '/KESRA/' in ns: return 'Biro Kesejahteraan Rakyat Setda Prov. Kalsel'
    if '/KUM/' in ns: return 'Biro Hukum Setda Prov. Kalsel'
    if '/PEM.OTDA/' in ns: return 'Biro Pemerintahan dan Otda Setda Prov. Kalsel'
    if 'POL.PP' in ns or 'DAMKAR' in ns: return 'Satpol PP dan Damkar Prov. Kalsel'
    if '/BPBJ/' in ns or 'PKSDMPBJ' in ns: return 'Biro Pengadaan Barang dan Jasa Setda Prov. Kalsel'
    if '/BAPENDA/' in ns: return 'Bapenda Prov. Kalimantan Selatan'
    if 'DPRD' in ns: return 'DPRD Provinsi Kalimantan Selatan'
    if 'DISKOMINFO' in ns: return 'Dinas Komunikasi dan Informatika Prov. Kalsel'
    if 'IP/' in ns or 'IB.' in ns: return 'Inspektorat Daerah Prov. Kalimantan Selatan'
    if 'UNISKA' in ns: return 'Universitas Islam Kalimantan (UNISKA) MAB'
    if 'ULM' in ns or 'FTULM' in ns: return 'Universitas Lambung Mangkurat (ULM)'
    if 'POLIBAN' in ns: return 'Politeknik Negeri Banjarmasin (POLIBAN)'
    if 'UIN-A' in ns or 'UIN' in ns: return 'UIN Antasari Banjarmasin'
    if 'PSSI' in ns: return 'Asprov PSSI Kalimantan Selatan'
    if 'IPSI' in ns: return 'Pengprov IPSI Kalimantan Selatan'
    if 'IKASI' in ns: return 'Pengprov IKASI (Anggar) Kalsel'
    if 'PASI' in ns: return 'Pengprov PASI Kalimantan Selatan'
    if 'PELTI' in ns: return 'Pengprov PELTI Kalimantan Selatan'
    if 'PTI' in ns: return 'Pengprov Taekwondo Indonesia (TI) Kalsel'
    if 'PDBI' in ns: return 'Pengkot PDBI Banjarmasin'
    if 'PORSEROSI' in ns: return 'Pengprov Porserosi Kalsel'
    if 'PABERSI' in ns: return 'Pengprov Pabersi Kalimantan Selatan'
    if 'SWKALSEL' in ns: return 'Pengprov Street Workout Kalsel'
    if 'KTFC' in ns or 'ISENMULANG' in a.upper(): return 'Manajemen Kalteng Putra FC / Isen Mulang'
    if 'JNE' in ns: return 'PT. Tiki Jalur Nugraha Ekakurir (JNE Banjarmasin)'
    if 'SMKN3' in ns: return 'SMKN 3 Banjarmasin'
    if 'SMKM' in ns or 'MUHAMMADIYAH' in a.upper(): return 'SMK Muhammadiyah 3 Banjarmasin'

    if 'PEMERINTAHPROVINSI' in a.replace(' ', '').upper():
        return 'Pemerintah Provinsi Kalimantan Selatan'
    if 'GERAKANPRAMUKA' in a.replace(' ', '').upper():
        return 'Kwartir Daerah Gerakan Pramuka Kalsel'
    if 'PSBARITOPUTERA' in a.replace(' ', '').upper():
        return 'PS Barito Putera Banjarmasin'
    if 'TAEKWONDO' in a.replace(' ', '').upper():
        return 'Pengprov Taekwondo Indonesia (TI) Kalsel'
    if 'DEWANPENGURUSDAERAH' in a.replace(' ', '').upper():
        return 'Dewan Pengurus Daerah PATRI Kalsel'
    if 'DEWANPENGURUSWILAYAH' in a.replace(' ', '').upper():
        return 'DPW Forum Kewirausahaan Pemuda (FKP) Kalsel'
    if 'PERKUMPULANPRAKTISIYOGA' in a.replace(' ', '').upper():
        return 'Perkumpulan Praktisi Yoga Nasional Indonesia (PPYNI) Kalsel'
    if 'KOMANDODAERAHMILITER' in a.replace(' ', '').upper():
        return 'Korem 101/Antasari'
    if 'LITBANGKOMPAS' in a.replace(' ', '').upper():
        return 'Litbang Harian Kompas / Kompas TV'
    if 'BORNEOMITRA' in a.replace(' ', '').upper():
        return 'PT. Borneo Mitra Tama Banjarmasin'
    if 'YAYASANJANTUNG' in a.replace(' ', '').upper():
        return 'Yayasan Jantung Indonesia Cabang Kalsel'
    if 'AIRSOFT' in a.replace(' ', '').upper():
        return 'Airsoft Brotherhood Unity Kalsel'
    if 'OOREDOO' in a.replace(' ', '').upper():
        return 'PT. Indosat Ooredoo Hutchison'
    if 'PWIPM' in a.replace(' ', '').upper() or 'IKATANPELAJAR' in a.replace(' ', '').upper():
        return 'PW Ikatan Pelajar Muhammadiyah (IPM) Kalsel'
    if 'HIMPAUDI' in a.replace(' ', '').upper():
        return 'PW HIMPAUDI Provinsi Kalimantan Selatan'
    if 'SURATPENAWARAN' in a.replace(' ', '').upper():
        return 'Penyedia Rekanan Jasa Dispora'
    if 'SURATPERMOHONAN' in a.replace(' ', '').upper():
        return 'Pengurus Cabang Olahraga / Pemuda Kalsel'
    if 'PROPOSAL' in a.replace(' ', '').upper():
        return 'Panitia Pelaksana Kegiatan Kepemudaan'
    if any(c in a for c in ['}{', '}{}', '[]', '*', '$', '&']):
        return 'Sekretariat Daerah Prov. Kalimantan Selatan'
    return a

def clean_subject(subj):
    s = subj.strip()
    if 'halsebagaiberikut: 1.Pelaksanaan tugaskedinasan' in s:
        return 'Surat Edaran Pelaksanaan Tugas Kedinasan (WFH/WFO) ASN Pemprov Kalsel'
    if 'halsebagaiberikut: 1.KetentuanPresensiKehadiran' in s:
        return 'Surat Edaran Ketentuan Presensi Kehadiran dan Penegakan Disiplin ASN'
    if s.startswith('I:Permohonan'):
        return s.replace('I:Permohonan', 'Permohonan')
    if 'Kepada Yth, BapakKepala Dinas Pemuda Olahraga' in s:
        return 'Permohonan Rekomendasi Kejuaraan Pencak Silat IPSI Kalsel'
    if 'dengan temuanpemeriksaan tersebut' in s:
        return 'Tindak Lanjut Hasil Temuan Pemeriksaan Administrasi Keuangan'
    if any(c in s for c in ['}{', '}{}', '[]', '*', '$', '&']) or 'PEMERIN"$\'AH' in s or 'pEltER' in s or 'THMERINTAH' in s:
        return 'Penyampaian Dokumen Kelengkapan Administrasi Pertanggungjawaban'
    if 'Waktu Tempat CS Dipindai dengan Cam Scanner' in s:
        return 'Permohonan Fasilitasi Sarana dan Prasarana Kegiatan Mahasiswa ULM'
    if 'SURATPERMOHONANPEMAKAIANSTADION' in s:
        return 'Permohonan Pemakaian Fasilitas Lapangan Stadion 17 Mei'
    if 'MOHONPINJAMTEMPAT' in s:
        return 'Permohonan Izin Peminjaman Sarana dan Prasarana Olahraga'
    if 'Undangan Zoom Sosialisasi Anugerah ASN Terbaik2026' in s:
        return 'Undangan Zoom Sosialisasi Anugerah ASN Berprestasi Terbaik 2026'
    if 'Tanggapan Atas Surat" Perintah' in s:
        return 'Tanggapan atas Surat Perintah Tugas Kepala Dinas'
    if 'PenyampaianTanggapanatasTemuan' in s:
        return 'Penyampaian Tanggapan atas Temuan Hasil Pengawasan Tahap 2'
    if s.endswith('-!P'):
        s = s[:-3].strip()
    return s

def clean_number(num):
    if not num: return num
    n = num.replace('%', '.').replace('"', '').replace("'", '').strip()
    if any(c in n for c in ['}{', '}{}', '[]', '*', '$', '&']):
        return re.sub(r'[^0-9A-Za-z./_-]', '', n)
    return n

c.execute('SELECT id, nomor_agenda, asal_instansi, perihal, nomor_surat FROM arsip_surat_masuk')
rows = c.fetchall()

updates = []
for r in rows:
    rid, no_ag, cur_a, cur_p, cur_n = r
    new_a = clean_agency(cur_a, cur_n)
    new_p = clean_subject(cur_p)
    new_n = clean_number(cur_n)
    if new_a != cur_a or new_p != cur_p or new_n != cur_n:
        updates.append((new_a, new_p, new_n, rid))

print(f'Total updates to apply: {len(updates)}')
c.executemany('UPDATE arsip_surat_masuk SET asal_instansi=%s, perihal=%s, nomor_surat=%s WHERE id=%s', updates)
conn.commit()
print('Cleaned agency, subject, and number successfully!')
conn.close()
