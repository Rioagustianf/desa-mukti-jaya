// src/lib/models/Pengumuman.ts
import mongoose, { Schema } from "mongoose";

const PengumumanSchema = new Schema(
  {
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    tanggal: { type: Date, required: true },
    kategori: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Pengumuman ||
  mongoose.model("Pengumuman", PengumumanSchema);
