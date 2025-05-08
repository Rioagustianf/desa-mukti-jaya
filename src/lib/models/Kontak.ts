// src/lib/models/Kontak.ts
import mongoose, { Schema } from "mongoose";

const KontakSchema = new Schema(
  {
    jenis: {
      type: String,
      required: true,
      trim: true,
    },
    nilai: {
      type: String,
      required: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Check if model exists before creating
const KontakModel =
  mongoose.models.Kontak || mongoose.model("Kontak", KontakSchema);

export default KontakModel;
