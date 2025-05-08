// src/lib/models/ProfilDesa.ts
import mongoose, { Schema } from "mongoose";

const ProfilDesaSchema = new Schema(
  {
    nama: { type: String, required: true },
    deskripsi: { type: String },
    sejarahSingkat: { type: String },
    visi: { type: String },
    misi: { type: String },
    kode_pos: { type: String },
    kecamatan: { type: String },
    kabupaten: { type: String },
    provinsi: { type: String },
    luas_area: { type: String },
    jumlah_penduduk: { type: Schema.Types.Mixed }, // Can be string or number
    alamat: { type: String },
    telepon: { type: String },
    email: { type: String },
    website: { type: String },
    logo: { type: String }, // URL to logo image
    foto: { type: String }, // URL to village photo
    demografi: { type: String }, // Keep this from original admin page
  },
  { timestamps: true }
);

export default mongoose.models.ProfilDesa ||
  mongoose.model("ProfilDesa", ProfilDesaSchema);
