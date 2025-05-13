import mongoose, { Schema } from "mongoose"

const JenisSuratSchema = new Schema(
  {
    nama: {
      type: String,
      required: true,
      unique: true,
    },
    kode: {
      type: String,
      required: true,
      unique: true,
    },
    deskripsi: {
      type: String,
      required: true,
    },
    // Menentukan apakah jenis surat ini menggunakan form khusus (domisili/pindah) atau form umum
    tipeForm: {
      type: String,
      enum: ["umum", "domisili", "pindah"],
      default: "umum",
    },
    // Menentukan apakah jenis surat ini aktif atau tidak
    aktif: {
      type: Boolean,
      default: true,
    },
    // Urutan tampilan
    urutan: {
      type: Number,
      default: 0,
    },
    // Persyaratan dokumen
    persyaratan: {
      type: String,
    },
    // Catatan tambahan
    catatan: {
      type: String,
    },
  },
  { timestamps: true },
)

export default mongoose.models.JenisSurat || mongoose.model("JenisSurat", JenisSuratSchema)
