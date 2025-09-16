import { supabase, STORAGE_BUCKET } from "./supabase";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Generate simple folder structure based on image name
 * Example: "berita-desa-mukti-jaya.jpg" -> "berita/desa-mukti-jaya/"
 */
function generateFolderStructure(imageName: string): string {
  // Remove file extension
  const nameWithoutExt = imageName.replace(/\.[^/.]+$/, "");

  // Split by common separators and clean up
  const parts = nameWithoutExt
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.toLowerCase());

  if (parts.length === 0) {
    return "uploads/";
  }

  if (parts.length === 1) {
    return `${parts[0]}/`;
  }

  // Create simple 2-level structure: main-category/sub-category/
  const mainCategory = parts[0];
  const subCategory = parts.slice(1).join("-"); // Join remaining parts with dash

  return `${mainCategory}/${subCategory}/`;
}

/**
 * Upload image to Supabase Storage with organized folder structure
 */
export async function uploadImage(
  file: File,
  category?: string
): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Hanya file gambar yang diperbolehkan" };
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Ukuran file tidak boleh lebih dari 5MB",
      };
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
      // Generate folder structure based on original filename
      folderPath = generateFolderStructure(file.name);
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
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fullPath);

    return {
      success: true,
      url: urlData.publicUrl,
      filename: fullPath, // Return full path including folder
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload gagal",
    };
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(filename: string): Promise<DeleteResult> {
  try {
    if (!filename) {
      return { success: false, error: "Filename diperlukan" };
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete gagal",
    };
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(filename: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);

  return data.publicUrl;
}

/**
 * Upload PDF document to Supabase Storage
 */
export async function uploadPDF(
  pdfBuffer: Buffer,
  filename: string,
  category: string = "letters"
): Promise<UploadResult> {
  try {
    // Generate folder structure for letters
    const folderPath = `${category.toLowerCase()}/`;

    // Full path including folder and filename
    const fullPath = folderPath + filename;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fullPath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fullPath);

    return {
      success: true,
      url: urlData.publicUrl,
      filename: fullPath, // Return full path including folder
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload PDF gagal",
    };
  }
}

/**
 * Delete PDF document from Supabase Storage
 */
export async function deletePDF(filename: string): Promise<DeleteResult> {
  try {
    if (!filename) {
      return { success: false, error: "Filename diperlukan" };
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete PDF gagal",
    };
  }
}
