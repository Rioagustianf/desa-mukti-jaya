// src/lib/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  username?: string;
  password?: string;
  name: string;
  role: "admin" | "user" | "resident";
  nik?: string;
  teleponWA?: string;
  hasSetPassword?: boolean;
  isVerified?: boolean;
  isAutoCreated?: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    // Admin users use username
    username: {
      type: String,
      sparse: true,
      unique: true,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "user", "resident"],
      default: "admin",
      required: true,
    },

    // Resident users use NIK-based authentication
    nik: {
      type: String,
      sparse: true,
      unique: true,
      required: false,
    },
    teleponWA: {
      type: String,
      sparse: true,
      required: false,
    },
    hasSetPassword: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      required: false,
    },

    // Auto-created flag
    isAutoCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for resident authentication
UserSchema.index({ nik: 1, teleponWA: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
