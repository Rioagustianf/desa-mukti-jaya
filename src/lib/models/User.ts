// src/lib/models/User.ts
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // hashed
    name: { type: String },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
