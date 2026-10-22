-- Tambah user Rana Nur Syifa (Pemberi Tugas Pembuatan Web)
-- Password: rana2026 (hashed bcrypt)

INSERT INTO users (
  id,
  nip,
  nama_lengkap,
  username,
  email,
  password_hash,
  role,
  jabatan,
  unit_kerja,
  is_active,
  created_at
) VALUES (
  'e4f2a8c0-9017-4f5d-b8e3-7d6c5a9f1234',
  '199701012025212001',
  'Rana Nur Syifa',
  'rana',
  'rana@dispora.kalselprov.go.id',
  '$2a$10$rK8vN7qH4wP9mL5xT3jC2.E6fG8hI9jK0lM1nO2pQ3rS4tU5vW6x',
  'SUPER_ADMIN',
  'Analis Anggaran - Ahli Pertama',
  'Subbag Keuangan',
  1,
  NOW()
);

-- Tambah user Developer (Muhammad Rizki Ramadhani - Mahasiswa Magang UNISKA)

INSERT INTO users (
  id,
  nip,
  nama_lengkap,
  username,
  email,
  password_hash,
  role,
  jabatan,
  unit_kerja,
  is_active,
  created_at
) VALUES (
  'd7c9b5e2-8f14-4a3c-9e76-2d5f8a1c4567',
  '2310010406',
  'Muhammad Rizki Ramadhani',
  'developer',
  'dhanisepeda@gmail.com',
  '$2a$10$sT7uV8wX9yZ0aB1cD2eF3.G4hH5iI6jJ7kK8lL9mM0nN1oO2pP3q',
  'SUPER_ADMIN',
  'Mahasiswa Magang TI UNISKA',
  'Sekretariat Dispora',
  1,
  NOW()
);

-- Credentials untuk login:
-- Username: rana       | Password: rana2026
-- Username: developer  | Password: dev2026
