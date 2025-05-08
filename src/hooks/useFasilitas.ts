"use client";

import { useState, useEffect } from "react";

export interface FasilitasData {
  _id: string;
  nama: string;
  deskripsi: string;
  gambar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useFasilitas = () => {
  const [fasilitas, setFasilitas] = useState<FasilitasData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFasilitas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/fasilitas");
        const data = await response.json();

        if (data.success) {
          setFasilitas(data.data);
        } else {
          console.error("Failed to fetch fasilitas:", data.message);
          setError("Gagal memuat data fasilitas");
          setFasilitas([]);
        }
      } catch (error) {
        console.error("Error fetching fasilitas:", error);
        setError("Terjadi kesalahan saat memuat data");
        setFasilitas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFasilitas();
  }, []);

  return { fasilitas, isLoading, error };
};
