import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("MONGODB_URI not set");

let cached = (global as any).mongoose || { conn: null, promise: null };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Control auto index creation via env. Default: true in dev, false in prod.
    const autoIndexEnv = process.env.MONGOOSE_AUTO_INDEX;
    const autoIndex =
      typeof autoIndexEnv === "string"
        ? autoIndexEnv.toLowerCase() === "true"
        : process.env.NODE_ENV !== "production";

    mongoose.set("autoIndex", autoIndex);

    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: true })
      .then(async (conn) => {
        // Optional: sync indexes when explicitly enabled
        if (process.env.MONGOOSE_SYNC_INDEXES?.toLowerCase() === "true") {
          try {
            const modelNames = mongoose.modelNames();
            for (const name of modelNames) {
              const model = mongoose.model(name);
              await model.syncIndexes();
            }
            if (process.env.NODE_ENV !== "test") {
              console.info(
                "[DB] Indexes synchronized for models:",
                modelNames.join(", ")
              );
            }
          } catch (err) {
            console.error("[DB] Failed to sync indexes:", err);
          }
        }
        return conn;
      });
  }
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}
