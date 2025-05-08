// src/lib/models/Prestasi.ts
import mongoose, { Schema } from "mongoose";

const PrestasiSchema = new Schema(
  {
    nama: { type: String, required: true },
    tahun: { type: Number },
    penyelenggara: { type: String },
    deskripsi: { type: String },
    gambar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Prestasi ||
  mongoose.model("Prestasi", PrestasiSchema);
