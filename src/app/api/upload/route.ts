// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Create Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Using anon key for now
const STORAGE_BUCKET = "muktijaya";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log(
      "Supabase URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 20) + "..."
    );
    console.log(
      "Supabase Key exists:",
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    console.log("Storage bucket:", STORAGE_BUCKET);
    const formData = await request.formData();
    const file = formData.get("foto") as File;
    const category = formData.get("category") as string; // Optional category parameter

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "Hanya file gambar yang diperbolehkan" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran file tidak boleh lebih dari 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const filename = `${timestamp}-${randomId}.${fileExtension}`;

    // Generate folder structure
    let folderPath = "";
    if (category) {
      // If category is provided, use it as the main folder
      folderPath = `${category.toLowerCase()}/`;
    } else {
      // Generate simple folder structure based on original filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const parts = nameWithoutExt
        .split(/[-_\s]+/)
        .filter((part) => part.length > 0)
        .map((part) => part.toLowerCase());

      if (parts.length === 0) {
        folderPath = "uploads/";
      } else if (parts.length === 1) {
        folderPath = `${parts[0]}/`;
      } else {
        // Create simple 2-level structure: main-category/sub-category/
        const mainCategory = parts[0];
        const subCategory = parts.slice(1).join("-");
        folderPath = `${mainCategory}/${subCategory}/`;
      }
    }

    // Full path including folder and filename
    const fullPath = folderPath + filename;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Supabase upload first, with fallback to local storage
    console.log("Attempting to upload to path:", fullPath);

    try {
      // Test Supabase connection first
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();

      if (bucketsError) {
        console.error("Supabase connection test failed:", bucketsError);
        throw new Error("Supabase connection failed");
      }

      // Check if bucket exists
      const bucketExists = buckets?.some(
        (bucket) => bucket.name === STORAGE_BUCKET
      );
      if (!bucketExists) {
        console.error(`Storage bucket '${STORAGE_BUCKET}' does not exist`);
        throw new Error(`Storage bucket '${STORAGE_BUCKET}' does not exist`);
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fullPath, buffer, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw error;
      }

      console.log("Upload successful:", data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fullPath);

      // Return success response with image URL
      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        filename: fullPath,
        folderPath: folderPath,
        originalName: file.name,
        provider: "supabase",
      });
    } catch (supabaseError) {
      console.warn(
        "Supabase upload failed, falling back to local storage:",
        supabaseError
      );

      // Fallback: Save to local public directory
      const fs = require("fs").promises;
      const path = require("path");

      const publicDir = path.join(process.cwd(), "public", "uploads");
      const localPath = path.join(publicDir, fullPath);
      const localDir = path.dirname(localPath);

      // Ensure directory exists
      await fs.mkdir(localDir, { recursive: true });

      // Save file locally
      await fs.writeFile(localPath, buffer);

      const publicUrl = `/uploads/${fullPath}`;

      console.log("Local upload successful:", publicUrl);

      // Return success response with local URL
      return NextResponse.json({
        success: true,
        url: publicUrl,
        filename: fullPath,
        folderPath: folderPath,
        originalName: file.name,
        provider: "local",
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload gagal",
      },
      { status: 500 }
    );
  }
}
