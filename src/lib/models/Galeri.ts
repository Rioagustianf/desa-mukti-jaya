// src/lib/models/Galeri.ts
import mongoose, { Schema } from "mongoose";

const GaleriSchema = new Schema(
  {
    gambar: { type: String, required: true }, // URL gambar
    caption: { type: String },
    kategori: { type: String },
    tanggal: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Galeri || mongoose.model("Galeri", GaleriSchema);
