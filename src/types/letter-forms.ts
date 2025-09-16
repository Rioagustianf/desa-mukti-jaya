import * as z from "zod";

// Base schema for common fields
const baseSchema = {
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  teleponWA: z.string().min(10, "Nomor telepon WA minimal 10 digit"),
};

// Universal required documents for most letters
const universalUploads = {
  fotoKTP: z.string().min(1, "Foto KTP wajib diupload"),
  fotoKK: z.string().min(1, "Foto KK wajib diupload"),
  suratPengantarRT: z.string().min(1, "Surat Pengantar RT/RW wajib diupload"),
};

// === 1. SURAT KETERANGAN DOMISILI ===
export const suratDomisiliSchema = z.object({
  ...baseSchema,
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().min(5, "Alamat sekarang wajib diisi"),
  alamatAsal: z.string().min(5, "Alamat asal wajib diisi"),
  keperluan: z.string().min(10, "Keperluan wajib diisi"),

  // Required uploads
  ...universalUploads,
});

// === 2. SURAT KETERANGAN USAHA (SKU) ===
export const suratUsahaSchema = z.object({
  ...baseSchema,
  alamat: z.string().min(5, "Alamat pemohon wajib diisi"),
  namaUsaha: z.string().min(3, "Nama usaha wajib diisi"),
  jenisUsaha: z.string().min(3, "Jenis usaha wajib diisi"),
  alamatUsaha: z.string().min(5, "Alamat usaha wajib diisi"),

  // Required uploads
  ...universalUploads,
  fotoTempatUsaha: z.string().min(1, "Foto tempat usaha wajib diupload"),
});

// === 3. SURAT KETERANGAN TIDAK MAMPU (SKTM) ===
export const suratTidakMampuSchema = z.object({
  ...baseSchema,
  alamat: z.string().min(5, "Alamat wajib diisi"),
  keperluan: z
    .string()
    .min(10, "Keperluan (beasiswa, kesehatan, dll) wajib diisi"),

  // Required uploads
  ...universalUploads,
  // Optional: suratKeteranganSekolahRS for specific purposes
  suratKeteranganSekolahRS: z.string().optional(),
});

// === 4. SURAT KETERANGAN BELUM MENIKAH ===
export const suratBelumMenikahSchema = z.object({
  ...baseSchema,
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  alamat: z.string().min(5, "Alamat wajib diisi"),

  // Required uploads
  ...universalUploads,
});

// === 5. SURAT KETERANGAN KEMATIAN ===
export const suratKematianSchema = z.object({
  ...baseSchema,
  namaAlmarhum: z.string().min(3, "Nama almarhum/almarhumah wajib diisi"),
  nikAlmarhum: z
    .string()
    .min(16, "NIK almarhum wajib diisi")
    .max(16, "NIK almarhum harus 16 digit"),
  tempatLahirAlmarhum: z.string().min(1, "Tempat lahir almarhum wajib diisi"),
  tanggalLahirAlmarhum: z.string().min(1, "Tanggal lahir almarhum wajib diisi"),
  tanggalMeninggal: z.string().min(1, "Tanggal meninggal wajib diisi"),
  alamatTerakhir: z.string().min(5, "Alamat terakhir almarhum wajib diisi"),
  namaPelapor: z.string().min(3, "Nama pelapor wajib diisi"),
  hubunganPelapor: z.string().min(3, "Hubungan dengan almarhum wajib diisi"),

  // Required uploads
  fotoKTPAlmarhum: z.string().min(1, "Foto KTP almarhum wajib diupload"),
  fotoKKKeluarga: z.string().min(1, "Foto KK keluarga wajib diupload"),
  suratPengantarRT: z.string().min(1, "Surat Pengantar RT/RW wajib diupload"),
  // Optional: suratKeteranganDokterRS for hospital cases
  suratKeteranganDokterRS: z.string().optional(),
});

// === 6. SURAT KETERANGAN KELAHIRAN ===
export const suratKelahiranSchema = z.object({
  ...baseSchema,
  namaBayi: z.string().min(3, "Nama bayi wajib diisi"),
  tempatLahirBayi: z.string().min(1, "Tempat lahir bayi wajib diisi"),
  tanggalLahirBayi: z.string().min(1, "Tanggal lahir bayi wajib diisi"),
  jenisKelaminBayi: z.enum(["Laki-laki", "Perempuan"], {
    errorMap: () => ({ message: "Jenis kelamin wajib dipilih" }),
  }),
  namaAyah: z.string().min(3, "Nama ayah wajib diisi"),
  namaIbu: z.string().min(3, "Nama ibu wajib diisi"),
  alamatOrangTua: z.string().min(5, "Alamat orang tua wajib diisi"),

  // Required uploads
  suratKeteranganLahir: z
    .string()
    .min(1, "Surat keterangan lahir dari bidan/RS wajib diupload"),
  fotoKTPOrangTua: z.string().min(1, "Foto KTP orang tua wajib diupload"),
  fotoKKOrangTua: z.string().min(1, "Foto KK orang tua wajib diupload"),
  suratPengantarRT: z.string().min(1, "Surat Pengantar RT/RW wajib diupload"),
});

// === 7. SURAT KETERANGAN PINDAH DATANG ===
export const suratPindahDatangSchema = z.object({
  ...baseSchema,
  alamatTujuan: z.string().min(5, "Alamat tujuan wajib diisi"),
  asalDaerah: z.string().min(3, "Asal daerah wajib diisi"),
  alasanPindah: z.string().min(10, "Alasan pindah wajib diisi"),

  // Required uploads
  suratKeteranganPindahAsal: z
    .string()
    .min(1, "Surat keterangan pindah dari daerah asal wajib diupload"),
  fotoKTP: z.string().min(1, "Foto KTP wajib diupload"),
  fotoKK: z.string().min(1, "Foto KK wajib diupload"),
  suratPengantarRT: z.string().min(1, "Surat Pengantar RT/RW wajib diupload"),
});

// === 8. SURAT KETERANGAN PINDAH KELUAR ===
export const suratPindahKeluarSchema = z.object({
  ...baseSchema,
  alamat: z.string().min(5, "Alamat asal wajib diisi"),
  alamatTujuan: z.string().min(5, "Alamat tujuan wajib diisi"),
  alasanPindah: z.string().min(10, "Alasan pindah wajib diisi"),

  // Required uploads
  ...universalUploads,
});

// === 9. SURAT KETERANGAN KEPEMILIKAN TANAH ===
export const suratKepemilikanTanahSchema = z.object({
  ...baseSchema,
  alamatTanah: z.string().min(5, "Alamat tanah wajib diisi"),
  luasTanah: z.string().min(1, "Luas tanah wajib diisi"),
  statusKepemilikan: z.string().min(3, "Status kepemilikan wajib diisi"),

  // Required uploads
  ...universalUploads,
  buktiKepemilikanTanah: z
    .string()
    .min(1, "Bukti kepemilikan tanah (sertifikat/akta/girik) wajib diupload"),
});

// === 10. SURAT KETERANGAN AHLI WARIS ===
export const suratAhliWarisSchema = z.object({
  ...baseSchema,
  namaPewaris: z.string().min(3, "Nama pewaris wajib diisi"),
  namaAhliWaris: z.string().min(3, "Nama lengkap ahli waris wajib diisi"),
  hubunganAhliWaris: z.string().min(3, "Hubungan dengan pewaris wajib diisi"),
  alamat: z.string().min(5, "Alamat wajib diisi"),

  // Required uploads
  fotoKTPAhliWaris: z
    .string()
    .min(1, "Foto KTP semua ahli waris wajib diupload"),
  fotoKKPewaris: z
    .string()
    .min(1, "Foto KK pewaris & ahli waris wajib diupload"),
  suratKematianPewaris: z
    .string()
    .min(1, "Surat Kematian pewaris wajib diupload"),
  suratPengantarRT: z.string().min(1, "Surat Pengantar RT/RW wajib diupload"),
});

// Export types for TypeScript
export type SuratDomisiliForm = z.infer<typeof suratDomisiliSchema>;
export type SuratUsahaForm = z.infer<typeof suratUsahaSchema>;
export type SuratTidakMampuForm = z.infer<typeof suratTidakMampuSchema>;
export type SuratBelumMenikahForm = z.infer<typeof suratBelumMenikahSchema>;
export type SuratKematianForm = z.infer<typeof suratKematianSchema>;
export type SuratKelahiranForm = z.infer<typeof suratKelahiranSchema>;
export type SuratPindahDatangForm = z.infer<typeof suratPindahDatangSchema>;
export type SuratPindahKeluarForm = z.infer<typeof suratPindahKeluarSchema>;
export type SuratKepemilikanTanahForm = z.infer<
  typeof suratKepemilikanTanahSchema
>;
export type SuratAhliWarisForm = z.infer<typeof suratAhliWarisSchema>;

// Union type for all letter forms
export type AllLetterForms =
  | SuratDomisiliForm
  | SuratUsahaForm
  | SuratTidakMampuForm
  | SuratBelumMenikahForm
  | SuratKematianForm
  | SuratKelahiranForm
  | SuratPindahDatangForm
  | SuratPindahKeluarForm
  | SuratKepemilikanTanahForm
  | SuratAhliWarisForm;

// Letter type mapping for schema selection
export const letterSchemaMap = {
  SKD: suratDomisiliSchema, // Surat Keterangan Domisili
  SKU: suratUsahaSchema, // Surat Keterangan Usaha
  SKTM: suratTidakMampuSchema, // Surat Keterangan Tidak Mampu
  SKBM: suratBelumMenikahSchema, // Surat Keterangan Belum Menikah
  SKK: suratKematianSchema, // Surat Keterangan Kematian
  SKL: suratKelahiranSchema, // Surat Keterangan Kelahiran
  SKPD: suratPindahDatangSchema, // Surat Keterangan Pindah Datang
  SKPK: suratPindahKeluarSchema, // Surat Keterangan Pindah Keluar
  SKKT: suratKepemilikanTanahSchema, // Surat Keterangan Kepemilikan Tanah
  SKAW: suratAhliWarisSchema, // Surat Keterangan Ahli Waris
} as const;

// Document upload configurations for each letter type
export const documentRequirements = {
  SKD: [
    { key: "fotoKTP", label: "Foto KTP Pemohon", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
  SKU: [
    { key: "fotoKTP", label: "Foto KTP Pemohon", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
    { key: "fotoTempatUsaha", label: "Foto Tempat Usaha", required: true },
  ],
  SKTM: [
    { key: "fotoKTP", label: "Foto KTP Pemohon/Ortu", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
    {
      key: "suratKeteranganSekolahRS",
      label: "Surat Keterangan dari Sekolah/RS (jika ada)",
      required: false,
    },
  ],
  SKBM: [
    { key: "fotoKTP", label: "Foto KTP Pemohon", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
  SKK: [
    { key: "fotoKTPAlmarhum", label: "Foto KTP Almarhum", required: true },
    { key: "fotoKKKeluarga", label: "Foto KK Keluarga", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
    {
      key: "suratKeteranganDokterRS",
      label: "Surat Keterangan dari RS/Dokter (jika ada)",
      required: false,
    },
  ],
  SKL: [
    {
      key: "suratKeteranganLahir",
      label: "Surat Keterangan Lahir dari Bidan/RS",
      required: true,
    },
    { key: "fotoKTPOrangTua", label: "Foto KTP Orang Tua", required: true },
    { key: "fotoKKOrangTua", label: "Foto KK Orang Tua", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
  SKPD: [
    {
      key: "suratKeteranganPindahAsal",
      label: "Surat Keterangan Pindah dari Daerah Asal",
      required: true,
    },
    { key: "fotoKTP", label: "Foto KTP", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
  SKPK: [
    { key: "fotoKTP", label: "Foto KTP", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
  SKKT: [
    { key: "fotoKTP", label: "Foto KTP", required: true },
    { key: "fotoKK", label: "Foto KK", required: true },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
    {
      key: "buktiKepemilikanTanah",
      label: "Bukti Kepemilikan (Sertifikat/Akta/Girik)",
      required: true,
    },
  ],
  SKAW: [
    {
      key: "fotoKTPAhliWaris",
      label: "Foto KTP Semua Ahli Waris",
      required: true,
    },
    {
      key: "fotoKKPewaris",
      label: "Foto KK Pewaris & Ahli Waris",
      required: true,
    },
    {
      key: "suratKematianPewaris",
      label: "Surat Kematian Pewaris",
      required: true,
    },
    { key: "suratPengantarRT", label: "Surat Pengantar RT/RW", required: true },
  ],
} as const;
