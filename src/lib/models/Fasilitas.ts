// src/lib/models/Fasilitas.ts
import mongoose, { Schema } from "mongoose";

const FasilitasSchema = new Schema(
  {
    nama: { type: String, required: true },
    deskripsi: { type: String },
    gambar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Fasilitas ||
  mongoose.model("Fasilitas", FasilitasSchema);
