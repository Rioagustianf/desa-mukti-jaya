"use client";

import React, { useState } from "react";
import axios from "axios";

const UploadFoto: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

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

    try {
      setUploading(true);
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setImageUrl(response.data.url);
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

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Mengunggah..." : "Upload Foto"}
      </button>

      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <p>Preview Foto:</p>
          <img src={imageUrl} alt="Foto Upload" style={{ maxWidth: 300 }} />
        </div>
      )}
    </div>
  );
};

export default UploadFoto;
