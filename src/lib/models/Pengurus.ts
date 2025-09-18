// src/lib/models/Pengurus.ts
import mongoose, { Schema } from "mongoose";

// Define KontakSchema as an embedded document schema
const KontakSchema = new Schema({
  jenis: {
    type: String,
    enum: ["telepon", "email"],
    required: true,
  },
  nilai: {
    type: String,
    required: true,
  },
});

const PengurusSchema = new Schema(
  {
    nama: { type: String, required: true },
    jabatan: { type: String, required: true },
    foto: { type: String },
    // URL tanda tangan digital (transparent PNG)
    ttdDigital: { type: String },

    kontak: {
      type: [KontakSchema],
      default: [],
    },
    deskripsi: { type: String },
  },
  { timestamps: true }
);

const PengurusModel =
  mongoose.models.Pengurus || mongoose.model("Pengurus", PengurusSchema);

export default PengurusModel;
