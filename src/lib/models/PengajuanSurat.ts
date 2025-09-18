import mongoose, { Schema } from "mongoose";

const PengajuanSuratSchema = new Schema(
  {
    // Referensi ke jenis surat
    jenisSurat: {
      type: Schema.Types.ObjectId,
      ref: "JenisSurat",
      required: true,
    },

    // Kode jenis surat (untuk backward compatibility)
    kodeSurat: {
      type: String,
      required: true,
    },

    // Data pemohon (disederhanakan)
    nama: { type: String, required: true },
    nik: { type: String, required: true },
    tempatLahir: { type: String },
    tanggalLahir: { type: String },

    // Alamat (disederhanakan)
    alamat: { type: String },
    rt: { type: String },
    rw: { type: String },
    desa: { type: String },
    kecamatan: { type: String },
    kabupaten: { type: String },

    // Kontak (disederhanakan)
    teleponWA: { type: String, required: true },

    // Keperluan
    keperluan: { type: String },

    // File uploads - General documents
    dokumen: [{ type: String }],

    // === UNIVERSAL UPLOADS (Required for most letters) ===
    fotoKTP: { type: String }, // KTP pemohon
    fotoKK: { type: String }, // Kartu Keluarga
    suratPengantarRT: { type: String }, // Surat Pengantar RT/RW

    // === SPECIFIC DOCUMENT UPLOADS FOR EACH LETTER TYPE ===

    // Surat Keterangan Usaha (SKU) - Additional uploads
    fotoTempatUsaha: { type: String }, // Foto tempat usaha

    // Surat Keterangan Tidak Mampu (SKTM) - Additional uploads
    suratKeteranganSekolahRS: { type: String }, // Surat keterangan dari sekolah/RS (jika ada)

    // Surat Keterangan Kematian - Specific uploads
    fotoKTPAlmarhum: { type: String }, // KTP almarhum
    fotoKKKeluarga: { type: String }, // KK keluarga
    suratKeteranganDokterRS: { type: String }, // Surat keterangan dari RS/dokter (jika ada)

    // Surat Keterangan Kelahiran - Specific uploads
    suratKeteranganLahir: { type: String }, // Surat keterangan lahir dari bidan/RS
    fotoKTPOrangTua: { type: String }, // KTP orang tua
    fotoKKOrangTua: { type: String }, // KK orang tua

    // Surat Keterangan Pindah Datang - Specific uploads
    suratKeteranganPindahAsal: { type: String }, // Surat keterangan pindah dari daerah asal

    // Surat Keterangan Kepemilikan Tanah - Specific uploads
    buktiKepemilikanTanah: { type: String }, // Bukti kepemilikan (sertifikat/akta/girik)

    // Surat Keterangan Ahli Waris - Specific uploads
    fotoKTPAhliWaris: { type: String }, // KTP semua ahli waris
    fotoKKPewaris: { type: String }, // KK pewaris & ahli waris
    suratKematianPewaris: { type: String }, // Surat Kematian pewaris

    // Khusus untuk surat pindah
    alamatTujuan: { type: String },
    rtTujuan: { type: String },
    rwTujuan: { type: String },
    desaTujuan: { type: String },
    kecamatanTujuan: { type: String },
    kabupatenTujuan: { type: String },
    alasanPindah: { type: String },

    // === ADDITIONAL FIELDS FOR SPECIFIC LETTER TYPES ===

    // Surat Keterangan Domisili - Additional fields
    alamatAsal: { type: String }, // Alamat asal

    // Surat Keterangan Usaha (SKU) - Additional fields
    namaUsaha: { type: String }, // Nama usaha
    jenisUsaha: { type: String }, // Jenis usaha
    alamatUsaha: { type: String }, // Alamat usaha

    // Surat Keterangan Kematian - Specific fields
    namaAlmarhum: { type: String }, // Nama almarhum/almarhumah
    nikAlmarhum: { type: String }, // NIK almarhum
    tempatLahirAlmarhum: { type: String }, // Tempat lahir almarhum
    tanggalLahirAlmarhum: { type: String }, // Tanggal lahir almarhum
    tanggalMeninggal: { type: String }, // Tanggal meninggal
    alamatTerakhir: { type: String }, // Alamat terakhir
    namaPelapor: { type: String }, // Nama pelapor
    hubunganPelapor: { type: String }, // Hubungan dengan almarhum

    // Surat Keterangan Kelahiran - Specific fields
    namaBayi: { type: String }, // Nama bayi
    tempatLahirBayi: { type: String }, // Tempat lahir bayi
    tanggalLahirBayi: { type: String }, // Tanggal lahir bayi
    jenisKelaminBayi: { type: String }, // Jenis kelamin bayi
    namaAyah: { type: String }, // Nama ayah
    namaIbu: { type: String }, // Nama ibu
    alamatOrangTua: { type: String }, // Alamat orang tua

    // Surat Keterangan Pindah Datang - Additional fields
    asalDaerah: { type: String }, // Asal daerah

    // Surat Keterangan Kepemilikan Tanah - Specific fields
    alamatTanah: { type: String }, // Alamat tanah
    luasTanah: { type: String }, // Luas tanah
    statusKepemilikan: { type: String }, // Status kepemilikan

    // Surat Keterangan Ahli Waris - Specific fields
    namaPewaris: { type: String }, // Nama pewaris
    namaAhliWaris: { type: String }, // Nama lengkap ahli waris
    hubunganAhliWaris: { type: String }, // Hubungan dengan pewaris

    // Status pengajuan
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "revision"],
      default: "pending",
    },

    // Generated letter information
    letterGenerated: {
      type: Boolean,
      default: false,
    },
    nomorSurat: {
      type: String,
    },
    letterUrl: {
      type: String,
    },
    letterGeneratedAt: {
      type: Date,
    },
    letterGeneratedBy: {
      type: String, // Admin who generated the letter
    },

    // Tanggal
    tanggalPengajuan: { type: Date, default: Date.now },
    tanggalUpdate: { type: Date },

    // Catatan admin (jika ada)
    catatan: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PengajuanSurat ||
  mongoose.model("PengajuanSurat", PengajuanSuratSchema);
