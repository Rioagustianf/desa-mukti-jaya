// src/lib/models/Agenda.ts
import mongoose, { Schema } from "mongoose";

const AgendaSchema = new Schema(
  {
    judul: { type: String, required: true },
    deskripsi: { type: String },
    tanggalMulai: { type: Date, required: true },
    tanggalSelesai: { type: Date },
    lokasi: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Agenda || mongoose.model("Agenda", AgendaSchema);
