import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI tidak terdefinisi. Pastikan variabel lingkungan diset."
  );
}

async function cleanupDuplicateUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(
      "Connected to MongoDB",
      `host=${mongoose.connection.host} db=${mongoose.connection.name}`
    );

    // Find users with null usernames
    const usersWithNullUsername = await User.find({
      $or: [{ username: null }, { username: { $exists: false } }],
    });

    console.log(
      `Found ${usersWithNullUsername.length} users with null/missing username`
    );

    // Group by NIK to find duplicates
    const nikGroups: { [key: string]: any[] } = {};

    usersWithNullUsername.forEach((user) => {
      if (user.nik) {
        if (!nikGroups[user.nik]) {
          nikGroups[user.nik] = [];
        }
        nikGroups[user.nik].push(user);
      }
    });

    // Remove duplicates, keeping only the newest one
    let removedCount = 0;
    for (const [nik, users] of Object.entries(nikGroups)) {
      if (users.length > 1) {
        // Sort by creation date, keep the newest
        users.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const [newest, ...duplicates] = users;

        console.log(
          `NIK ${nik} has ${users.length} duplicates, keeping newest: ${newest._id}`
        );

        // Remove duplicates
        for (const duplicate of duplicates) {
          await User.findByIdAndDelete(duplicate._id);
          console.log(`Removed duplicate user: ${duplicate._id}`);
          removedCount++;
        }
      }
    }

    // Also remove any users that have username: null explicitly
    const nullUsernameResult = await User.deleteMany({
      username: null,
      role: "resident",
    });

    console.log(
      `Removed ${nullUsernameResult.deletedCount} users with explicit null username`
    );
    console.log(
      `Total removed: ${
        removedCount + nullUsernameResult.deletedCount
      } duplicate users`
    );

    // Verify the cleanup
    const remainingNullUsers = await User.find({
      $or: [{ username: null }, { username: { $exists: false } }],
    });

    console.log(
      `Remaining users with null/missing username: ${remainingNullUsers.length}`
    );

    if (remainingNullUsers.length > 0) {
      console.log("Remaining users:");
      remainingNullUsers.forEach((user) => {
        console.log(
          `- ID: ${user._id}, NIK: ${user.nik}, Role: ${user.role}, Name: ${user.name}`
        );
      });
    }

    console.log("Cleanup completed successfully!");
  } catch (error) {
    console.error("Cleanup error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupDuplicateUsers().catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  });
}

export default cleanupDuplicateUsers;
