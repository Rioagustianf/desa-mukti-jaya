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

    // File uploads
    dokumen: [{ type: String }],
    fotoKTP: { type: String },
    fotoKK: { type: String },
    fotoSuratKeterangan: { type: String },

    // Khusus untuk surat pindah
    alamatTujuan: { type: String },
    rtTujuan: { type: String },
    rwTujuan: { type: String },
    desaTujuan: { type: String },
    kecamatanTujuan: { type: String },
    kabupatenTujuan: { type: String },
    alasanPindah: { type: String },

    // Status pengajuan
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "revision"],
      default: "pending",
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
