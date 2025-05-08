// src/lib/models/PanduanAdministrasi.ts
import mongoose, { Schema } from "mongoose";

const PanduanAdministrasiSchema = new Schema(
  {
    judul: { type: String, required: true },
    isi: { type: String, required: true },
    layananTerkait: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PanduanAdministrasi ||
  mongoose.model("PanduanAdministrasi", PanduanAdministrasiSchema);
