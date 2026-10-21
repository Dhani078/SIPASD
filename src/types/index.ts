export type UserRole = 'SUPER_ADMIN' | 'PETUGAS_ARSIP' | 'PIMPINAN' | 'BIDANG';

export type SifatSurat = 'BIASA' | 'PENTING' | 'SEGERA' | 'KILAT';

export interface UserSession {
  id: string;
  nip: string;
  namaLengkap: string;
  username: string;
  email: string;
  role: UserRole;
  jabatan: string;
  unitKerja: string;
}

export interface ArsipSuratMasuk {
  id: string;
  nomor_agenda: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  asal_instansi: string;
  perihal: string;
  ringkasan_isi?: string | null;
  sifat_surat: SifatSurat;
  file_url: string;
  cloudinary_public_id?: string | null;
  drive_url?: string | null;
  file_name_original?: string | null;
  file_size_bytes?: number;
  indexed_by: string;
  created_at: string;
  pejabat_pendisposisi?: string | null;
  nama_bidang_disposisi?: string | null;
  instruksi_tercatat?: string | null;
  status_penyelesaian?: string | null;
}

export interface ArsipSuratKeluar {
  id: string;
  nomor_agenda: string;
  nomor_surat: string;
  nomor_urut: number;
  tahun: number;
  kode_klasifikasi_id: number;
  kode_klasifikasi?: string;
  nama_klasifikasi?: string;
  bidang_pemrakarsa_id: number;
  nama_bidang?: string;
  tanggal_surat: string;
  tujuan_instansi: string;
  perihal: string;
  ringkasan_isi?: string | null;
  file_url: string;
  cloudinary_public_id?: string | null;
  drive_url?: string | null;
  file_size_bytes?: number;
  indexed_by: string;
  created_at: string;
}

export interface RiwayatDisposisi {
  id: string;
  surat_masuk_id: string;
  pejabat_pendisposisi: string;
  tanggal_disposisi: string;
  kepada_bidang_id: number;
  nama_bidang?: string;
  batas_waktu?: string | null;
  instruksi_tercatat: string;
  catatan_tertulis?: string | null;
  status_penyelesaian: string;
  keterangan_tindak_lanjut?: string | null;
  created_at: string;
}

export interface KlasifikasiArsip {
  id: number;
  kode: string;
  nama_klasifikasi: string;
  uraian: string;
  retensi_aktif_tahun: number;
  retensi_inaktif_tahun: number;
}

export interface BidangDispora {
  id: number;
  kode_bidang: string;
  nama_bidang: string;
  nama_kepala: string;
  nip_kepala: string;
}
