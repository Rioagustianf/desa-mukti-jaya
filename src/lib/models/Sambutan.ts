// src/lib/models/Sambutan.ts
import mongoose, { Schema } from "mongoose";

const SambutanSchema = new Schema(
  {
    namaKepalaDesa: { type: String, required: true },
    foto: { type: String },
    video: { type: String },
    sambutan: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Sambutan ||
  mongoose.model("Sambutan", SambutanSchema);
