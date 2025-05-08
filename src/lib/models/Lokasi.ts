// src/lib/models/Lokasi.ts
import mongoose, { Schema } from "mongoose";

const LokasiSchema = new Schema(
  {
    nama: { type: String, required: true },
    alamat: { type: String, required: true },
    koordinat: {
      lat: { type: Number, required: true }, // Memastikan lat required
      lng: { type: Number, required: true }, // Memastikan lng required
    },
    deskripsi: { type: String, default: "" }, // Memberikan default value
    mapUrl: { type: String }, // URL Google Maps
    embedCode: { type: String }, // embed code Google Maps
  },
  { timestamps: true }
);

// Jika model sudah ada, gunakan yang ada, jika belum buat model baru
export default mongoose.models.Lokasi || mongoose.model("Lokasi", LokasiSchema);
