-- Seed User Pengarsip (Rana Nur Syifa) & Developer
-- Login pakai username generik, nama tampilan web tetap nama asli pegawai.

-- 1. PENGGARSIP: Rana Nur Syifa (pemberi tugas pembuatan web)
INSERT INTO users (
  id, nip, nama_lengkap, username, email, password_hash,
  role, jabatan, unit_kerja, is_active
) VALUES (
  'e4f2a8c0-9017-4f5d-b8e3-7d6c5a9f1234',
  '199701012025212001',
  'Rana Nur Syifa',
  'pengarsip',
  'rana@dispora.kalselprov.go.id',
  '$2a$10$EZ.Ytx12ZndicpNXKmA5/Oh81BvrCo.3HFTGogObl1GCbbT0/VWGG',
  'SUPER_ADMIN',
  'Analis Anggaran - Sekretariat',
  'Sekretariat',
  1
)
ON DUPLICATE KEY UPDATE
  nama_lengkap = VALUES(nama_lengkap),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  jabatan = VALUES(jabatan),
  unit_kerja = VALUES(unit_kerja),
  is_active = 1;

-- 2. DEVELOPER: Muhammad Rizki Ramadhani (mahasiswa magang UNISKA)
INSERT INTO users (
  id, nip, nama_lengkap, username, email, password_hash,
  role, jabatan, unit_kerja, is_active
) VALUES (
  'd7c9b5e2-8f14-4a3c-9e76-2d5f8a1c4567',
  '2310010406',
  'Muhammad Rizki Ramadhani',
  'developer',
  'dhanisepeda@gmail.com',
  '$2a$10$J1zHKD/E1d9W81qc6RWJLuG0yZiER8/BOUMChn3q20Y.HSs0VJ6je',
  'SUPER_ADMIN',
  'Mahasiswa Magang TI UNISKA',
  'Sekretariat Dispora',
  1
)
ON DUPLICATE KEY UPDATE
  nama_lengkap = VALUES(nama_lengkap),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  is_active = 1;

-- Credentials:
-- pengarsip / dispora2026  -> tampil di web sebagai "Rana Nur Syifa"
-- developer / dev2026      -> tampil di web sebagai "Muhammad Rizki Ramadhani"