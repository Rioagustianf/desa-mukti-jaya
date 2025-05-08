// src/types/profil.ts
export interface ProfilDesa {
  _id: string;
  nama: string;
  deskripsi?: string;
  sejarahSingkat?: string;
  visi?: string;
  misi?: string[] | string; // Can be array or string
  kode_pos?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  luas_area?: string;
  jumlah_penduduk?: number | string; // Can be number or string
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  foto?: string;
}
