import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import PengajuanSurat from "./models/PengajuanSurat.js";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not defined in environment variables.");
  process.exit(1);
}

async function diagnoseUserIssue(nik?: string) {
  console.log("🔍 Diagnosing user account issues...");
  
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    if (nik) {
      console.log(`\n📋 Checking specific NIK: ${nik}`);
      
      // Find all users with this NIK
      const users = await User.find({ nik });
      console.log(`👤 Found ${users.length} user(s) with NIK ${nik}:`);
      users.forEach(user => {
        console.log(`  - ID: ${user._id}`);
        console.log(`    Name: ${user.name}`);
        console.log(`    Role: ${user.role}`);
        console.log(`    Phone: ${user.teleponWA}`);
        console.log(`    Auto-created: ${user.isAutoCreated}`);
        console.log(`    Created: ${user.createdAt}`);
        console.log(`    Username: ${user.username || 'undefined'}`);
        console.log('');
      });

      // Find letter applications
      const pengajuan = await PengajuanSurat.find({ nik }).sort({ createdAt: -1 });
      console.log(`📄 Found ${pengajuan.length} letter application(s) with NIK ${nik}:`);
      pengajuan.forEach(p => {
        console.log(`  - ID: ${p._id}`);
        console.log(`    Name: ${p.nama}`);
        console.log(`    Phone: ${p.teleponWA}`);
        console.log(`    Letter: ${p.kodeSurat}`);
        console.log(`    Status: ${p.status}`);
        console.log(`    Created: ${p.createdAt}`);
        console.log('');
      });
    } else {
      // General diagnostics
      console.log("\n📊 General Database Statistics:");
      
      const totalUsers = await User.countDocuments();
      const residentUsers = await User.countDocuments({ role: 'resident' });
      const adminUsers = await User.countDocuments({ role: 'admin' });
      const autoCreatedUsers = await User.countDocuments({ isAutoCreated: true });
      
      console.log(`Total users: ${totalUsers}`);
      console.log(`Resident users: ${residentUsers}`);
      console.log(`Admin users: ${adminUsers}`);
      console.log(`Auto-created users: ${autoCreatedUsers}`);

      const totalPengajuan = await PengajuanSurat.countDocuments();
      console.log(`Total letter applications: ${totalPengajuan}`);

      // Check for potential issues
      console.log("\n🔍 Potential Issues:");
      
      // Users with null username
      const nullUsernameUsers = await User.find({
        $or: [
          { username: null },
          { username: { $exists: false } }
        ],
        role: { $ne: 'resident' }
      });
      
      if (nullUsernameUsers.length > 0) {
        console.log(`❌ Found ${nullUsernameUsers.length} non-resident users with null/missing username`);
      }

      // Recent letter applications without user accounts
      const recentPengajuan = await PengajuanSurat.find()
        .sort({ createdAt: -1 })
        .limit(10);
      
      console.log("\n📋 Recent letter applications and their user accounts:");
      for (const p of recentPengajuan) {
        const user = await User.findOne({ nik: p.nik, role: 'resident' });
        console.log(`NIK: ${p.nik} | Name: ${p.nama} | Has Account: ${user ? '✅' : '❌'}`);
      }
    }

    console.log("\n✅ Diagnosis completed!");
    
  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Get NIK from command line arguments
const nik = process.argv[2];

// Run diagnosis if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  diagnoseUserIssue(nik).catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  });
}

export default diagnoseUserIssue;