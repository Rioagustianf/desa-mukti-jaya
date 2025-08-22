"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon, Folder } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  filename?: string;
  onChange?: (url: string, filename: string, folderPath: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
  maxSize?: number; // in MB
  accept?: string[];
  category?: string; // Category untuk struktur folder
  showCategoryInput?: boolean; // Opsi untuk menampilkan input category
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  filename,
  onChange,
  onRemove,
  disabled = false,
  className,
  maxSize = 5,
  accept = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  category,
  showCategoryInput = false,
}) => {
  const {
    imageUrl,
    filename: currentFilename,
    uploading,
    deleting,
    uploadImage,
    deleteImage,
  } = useImageUpload(value, filename);

  const [customCategory, setCustomCategory] = React.useState<string>(
    category || ""
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const result = await uploadImage(file, customCategory);

      if (result.success && result.url && result.filename) {
        const folderPath = result.filename.substring(
          0,
          result.filename.lastIndexOf("/") + 1
        );
        onChange?.(result.url, result.filename, folderPath);
      } else {
        alert(result.error || "Upload gagal");
      }
    },
    [uploadImage, onChange, customCategory]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024,
    disabled: disabled || uploading,
    multiple: false,
  });

  const handleRemove = async () => {
    if (currentFilename) {
      const result = await deleteImage();
      if (result.success) {
        onChange?.("", "", "");
        onRemove?.();
      } else {
        alert(result.error || "Gagal menghapus gambar");
      }
    } else {
      onChange?.("", "", "");
      onRemove?.();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showCategoryInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Folder
          </label>
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Contoh: berita, galeri, profil"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Kosongkan untuk auto-generate folder berdasarkan nama file
          </p>
        </div>
      )}

      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              {isDragActive ? (
                <p>Lepaskan file di sini...</p>
              ) : (
                <div>
                  <p className="font-medium">
                    Klik untuk upload atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP, GIF hingga {maxSize}MB
                  </p>
                  {customCategory && (
                    <p className="text-xs text-blue-600 mt-1">
                      <Folder className="inline h-3 w-3 mr-1" />
                      Akan disimpan di folder: {customCategory}/
                    </p>
                  )}
                </div>
              )}
            </div>
            {uploading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Upload className="h-4 w-4 animate-bounce" />
                <span className="text-sm">Mengupload...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Uploaded image"
              className="max-w-xs rounded-lg shadow-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemove}
              disabled={deleting}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            {currentFilename && (
              <>
                <div>Filename: {currentFilename}</div>
                {currentFilename.includes("/") && (
                  <div className="flex items-center text-blue-600">
                    <Folder className="h-3 w-3 mr-1" />
                    Folder:{" "}
                    {currentFilename.substring(
                      0,
                      currentFilename.lastIndexOf("/") + 1
                    )}
                  </div>
                )}
              </>
            )}
            {deleting && (
              <div className="text-sm text-red-600">Menghapus gambar...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
