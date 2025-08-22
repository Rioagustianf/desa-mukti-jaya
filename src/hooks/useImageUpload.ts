import { useState } from "react";
import {
  uploadImage,
  deleteImage,
  UploadResult,
  DeleteResult,
} from "@/lib/storage";

export const useImageUpload = (
  initialImageUrl?: string,
  initialFilename?: string
) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || "");
  const [filename, setFilename] = useState<string>(initialFilename || "");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (
    file: File,
    category?: string
  ): Promise<UploadResult> => {
    try {
      setUploading(true);
      const result = await uploadImage(file, category);

      if (result.success && result.url && result.filename) {
        setImageUrl(result.url);
        setFilename(result.filename);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload gagal",
      };
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (): Promise<DeleteResult> => {
    if (!filename) {
      return { success: false, error: "Tidak ada file untuk dihapus" };
    }

    try {
      setDeleting(true);
      const result = await deleteImage(filename);

      if (result.success) {
        setImageUrl("");
        setFilename("");
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete gagal",
      };
    } finally {
      setDeleting(false);
    }
  };

  const resetImage = () => {
    setImageUrl("");
    setFilename("");
  };

  const setImage = (url: string, filename: string) => {
    setImageUrl(url);
    setFilename(filename);
  };

  return {
    imageUrl,
    filename,
    uploading,
    deleting,
    uploadImage: handleUpload,
    deleteImage: handleDelete,
    resetImage,
    setImage,
  };
};
