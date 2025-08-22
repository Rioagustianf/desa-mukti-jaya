// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
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

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fullPath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal upload ke storage: " + error.message,
        },
        { status: 500 }
      );
    }

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
    });
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
