// src/lib/models/Berita.ts
import mongoose, { Schema } from "mongoose";

const BeritaSchema = new Schema(
  {
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    gambar: { type: String },
    tanggal: { type: Date, required: true },
    penulis: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Berita || mongoose.model("Berita", BeritaSchema);
