import mongoose, { Schema } from "mongoose";

const PengajuanSuratSchema = new Schema(
  {
    // Jenis surat
    jenisSurat: {
      type: String,
      enum: ["domisili", "pindah"],
      required: true,
    },

    // Data pemohon (disederhanakan)
    nama: { type: String, required: true },
    nik: { type: String, required: true },
    tempatLahir: { type: String, required: true },
    tanggalLahir: { type: String, required: true },

    // Alamat (disederhanakan)
    alamat: { type: String, required: true },
    rt: { type: String, required: true },
    rw: { type: String, required: true },
    desa: { type: String, required: true },
    kecamatan: { type: String, required: true },
    kabupaten: { type: String, required: true },

    // Kontak (disederhanakan)
    teleponWA: { type: String, required: true },

    // Keperluan
    keperluan: { type: String, required: true },

    // File uploads
    fotoKTP: { type: String, required: true },
    fotoKK: { type: String, required: true },
    fotoSuratKeterangan: { type: String, required: true },

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
