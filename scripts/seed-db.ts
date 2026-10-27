import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is required');
  console.log('Connecting to TiDB Cloud for seeding...');
  
  const connection = await mysql.createConnection({
    uri: url,
    ssl: { rejectUnauthorized: true }
  });

  console.log('Seeding Master Data Bidang Dispora...');
  const bidangList = [
    [1, 'SEKR', 'Sekretariat Dispora', 'Pebriadin Hapiz, AP, M.Si', '19780214 199612 1 001'],
    [2, 'PORA', 'Bidang Pembudayaan Olahraga', 'Budiono, S.Pd, M.AP', '19800315 200501 1 008'],
    [3, 'PRESTASI', 'Bidang Peningkatan Prestasi Olahraga', 'H. Heru Susanto, SE, MM', '19750820 200212 1 003'],
    [4, 'PEMUDA', 'Bidang Pengembangan & Pemberdayaan Pemuda', 'Drs. H. M. Fauzi, M.Si', '19711104 199803 1 005'],
    [5, 'SAPRAS', 'Bidang Sarana dan Prasarana Olahraga', 'Akhmad Syarif, ST, MT', '19820612 200801 1 012']
  ];

  for (const b of bidangList) {
    await connection.query(
      `INSERT INTO bidang_dispora (id, kode_bidang, nama_bidang, nama_kepala, nip_kepala)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nama_bidang = VALUES(nama_bidang), nama_kepala = VALUES(nama_kepala), nip_kepala = VALUES(nip_kepala);`,
      b
    );
  }

  console.log('Seeding Master Klasifikasi Arsip...');
  const klasifikasiList = [
    [1, '005', 'Undangan', 'Surat undangan rapat dinas, sosialisasi, seminar, dan audiensi', 1, 2],
    [2, '426', 'Keolahragaan', 'Surat pembinaan atlet, kejuaraan daerah, hibah cabor, dan venue olahraga', 2, 5],
    [3, '427', 'Kepemudaan', 'Surat kegiatan jambore, seleksi paskibraka, dan wirausaha muda', 2, 5],
    [4, '800', 'Kepegawaian', 'Surat tugas dinas dalam/luar daerah, mutasi, cuti, dan kediklatan', 2, 10],
    [5, '045', 'Kearsipan', 'Surat pengelolaan dokumen arsip, peminjaman, dan penyerahan berkas', 3, 10],
    [6, '900', 'Keuangan', 'Surat pengantar SPJ, permohonan pencairan anggaran, dan retribusi', 5, 10]
  ];

  for (const k of klasifikasiList) {
    await connection.query(
      `INSERT INTO klasifikasi_arsip (id, kode, nama_klasifikasi, uraian, retensi_aktif_tahun, retensi_inaktif_tahun)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nama_klasifikasi = VALUES(nama_klasifikasi), uraian = VALUES(uraian);`,
      k
    );
  }

  console.log('Seeding Official Users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(process.env.SEED_DEFAULT_PASSWORD || 'Dispora2026!', salt);

  const usersList = [
    [
      'usr-admin-01',
      '19990101 202401 1 001',
      'Administrator IT Dispora',
      'admin',
      'admin.dispora@kalselprov.go.id',
      passwordHash,
      'SUPER_ADMIN',
      'Pranata Komputer Ahli Pertama',
      'Sekretariat'
    ],
    [
      'usr-kadis-01',
      '19780214 199612 1 001',
      'Pebriadin Hapiz, AP, M.Si',
      'kadis',
      'pebriadin.kadis@kalselprov.go.id',
      passwordHash,
      'PIMPINAN',
      'Kepala Dinas Kepemudaan dan Olahraga',
      'Pimpinan'
    ],
    [
      'usr-tu-01',
      '19870312 201101 2 004',
      'Staf Agenda TU Dispora',
      'tu_umum',
      'tu.dispora@kalselprov.go.id',
      passwordHash,
      'PETUGAS_ARSIP',
      'Pengadministrasi Persuratan',
      'Subbag Umum & Kepegawaian'
    ],
    [
      'usr-keu-01',
      '19850421 201001 2 003',
      'Norika Fajriana, SH, MH',
      'subbag_keuangan',
      'norika.keuangan@kalselprov.go.id',
      passwordHash,
      'BIDANG',
      'Kasubbag Perencanaan & Keuangan',
      'Sekretariat'
    ],
    [
      'usr-pora-01',
      '19800315 200501 1 008',
      'Budiono, S.Pd, M.AP',
      'kabid_pora',
      'budiono.pora@kalselprov.go.id',
      passwordHash,
      'BIDANG',
      'Kepala Bidang Pembudayaan Olahraga',
      'Bidang Pembudayaan Olahraga'
    ]
  ];

  for (const u of usersList) {
    await connection.query(
      `INSERT INTO users (id, nip, nama_lengkap, username, email, password_hash, role, jabatan, unit_kerja)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap), password_hash = VALUES(password_hash), role = VALUES(role);`,
      u
    );
  }

  console.log('Seeder completed successfully! Official user accounts initialized.');
  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
