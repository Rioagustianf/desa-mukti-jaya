import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import PengajuanSurat from "./models/PengajuanSurat.js";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not defined in environment variables.");
  process.exit(1);
}

async function testUserFlow() {
  console.log(
    "🧪 Testing user flow: Letter submission -> User creation -> Login"
  );

  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test data
    const testData = {
      nik: "1234567890123456",
      nama: "Test User",
      teleponWA: "081234567890",
      jenisSurat: "674a123456789012345678901", // Mock ObjectId
      kodeSurat: "SKD",
      alamat: "Test Address",
    };

    console.log("🧹 Cleaning up existing test data...");
    await User.deleteMany({ nik: testData.nik });
    await PengajuanSurat.deleteMany({ nik: testData.nik });

    console.log("📝 Simulating letter submission...");
    const pengajuan = await PengajuanSurat.create(testData);
    console.log("✅ Letter submission created:", pengajuan._id);

    // Now simulate the user creation logic from our API
    console.log("👤 Creating user account...");
    const userData = {
      nik: testData.nik,
      teleponWA: testData.teleponWA,
      name: testData.nama,
      role: "resident" as const,
      isAutoCreated: true,
      hasSetPassword: false,
      isVerified: false,
    };

    const user = await User.create(userData);
    console.log("✅ User account created:", user._id);

    // Test finding the user for login
    console.log("🔍 Testing user lookup for login...");
    const foundUser = await User.findOne({
      nik: testData.nik,
      role: "resident",
    });

    if (foundUser) {
      console.log("✅ User found for login:", {
        id: foundUser._id,
        name: foundUser.name,
        nik: foundUser.nik,
        teleponWA: foundUser.teleponWA,
      });
    } else {
      console.log("❌ User not found");
    }

    console.log("🧹 Cleaning up test data...");
    await User.deleteMany({ nik: testData.nik });
    await PengajuanSurat.deleteMany({ nik: testData.nik });

    console.log("✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testUserFlow().catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  });
}

export default testUserFlow;
