import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rioagustian2001:desamuktijaya123@cluster0.sppf0n5.mongodb.net/desa-mukti-jaya?retryWrites=true&w=majority&appName=Cluster0mongodb://localhost:27017/desa-mukti-jaya";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Hapus user admin lama (jika ada)
  await User.deleteMany({ username: "admin" });

  // Hash password admin
  const password = "admin123"; // Ganti jika ingin password lain
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user admin baru
  await User.create({
    username: "admin",
    password: hashedPassword,
    name: "Admin Desa",
    role: "admin",
  });

  console.log("User admin berhasil dibuat!");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed error:", err);
  mongoose.disconnect();
});
