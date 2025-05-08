export interface Lokasi {
  _id?: string;
  nama: string;
  alamat: string;
  koordinat: { lat: number; lng: number };
  deskripsi?: string;
}
