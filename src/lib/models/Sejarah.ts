// src/lib/models/Sejarah.ts
import mongoose, { Schema } from "mongoose";

const SejarahSchema = new Schema(
  {
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    gambar: { type: String },
    tahun: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Sejarah ||
  mongoose.model("Sejarah", SejarahSchema);
