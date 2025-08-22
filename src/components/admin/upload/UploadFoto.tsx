"use client";

import React, { useState } from "react";
import axios from "axios";

interface UploadFotoProps {
  onImageUpload?: (url: string, filename: string, folderPath: string) => void;
  initialImageUrl?: string;
  initialFilename?: string;
  category?: string; // Category untuk struktur folder
  showCategoryInput?: boolean; // Opsi untuk menampilkan input category
}

const UploadFoto: React.FC<UploadFotoProps> = ({
  onImageUpload,
  initialImageUrl,
  initialFilename,
  category,
  showCategoryInput = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || "");
  const [filename, setFilename] = useState<string>(initialFilename || "");
  const [customCategory, setCustomCategory] = useState<string>(category || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Pilih file terlebih dahulu");
      return;
    }

    const formData = new FormData();
    formData.append("foto", file);

    // Add category if provided
    if (customCategory) {
      formData.append("category", customCategory);
    }

    try {
      setUploading(true);
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setImageUrl(response.data.url);
        setFilename(response.data.filename);

        // Call callback if provided
        if (onImageUpload) {
          onImageUpload(
            response.data.url,
            response.data.filename,
            response.data.folderPath
          );
        }

        alert("Upload berhasil!");
      } else {
        alert("Upload gagal: " + response.data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat upload");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!filename) {
      alert("Tidak ada file untuk dihapus");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      return;
    }

    try {
      setDeleting(true);
      const response = await axios.delete("/api/upload/delete", {
        data: { filename },
      });

      if (response.data.success) {
        setImageUrl("");
        setFilename("");

        // Call callback if provided
        if (onImageUpload) {
          onImageUpload("", "", "");
        }

        alert("Gambar berhasil dihapus!");
      } else {
        alert("Gagal menghapus: " + response.data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
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
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Kosongkan untuk auto-generate folder berdasarkan nama file
          </p>
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Mengunggah..." : "Upload Foto"}
        </button>

        {imageUrl && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Menghapus..." : "Hapus Foto"}
          </button>
        )}
      </div>

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Preview Foto:
          </p>
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Foto Upload"
              className="max-w-xs rounded-lg shadow-md"
            />
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <div>Filename: {filename}</div>
            {filename.includes("/") && (
              <div>
                Folder: {filename.substring(0, filename.lastIndexOf("/") + 1)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFoto;
