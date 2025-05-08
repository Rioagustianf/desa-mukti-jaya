// src/lib/models/LayananAdministrasi.ts
import mongoose, { Schema } from "mongoose";

const LayananAdministrasiSchema = new Schema(
  {
    nama: { type: String, required: true },
    deskripsi: { type: String, required: true },
    persyaratan: { type: String, required: true },
    prosedur: { type: String },
    jadwalPelayanan: { type: String },
    biaya: { type: String },
    waktu: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.LayananAdministrasi ||
  mongoose.model("LayananAdministrasi", LayananAdministrasiSchema);
