"use client";

import { useState, useEffect } from "react";

export interface Koordinat {
  lat: number;
  lng: number;
}

export interface LokasiData {
  _id: string;
  nama: string;
  alamat: string;
  koordinat?: Koordinat;
  deskripsi?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useLokasi = () => {
  const [lokasi, setLokasi] = useState<LokasiData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLokasi = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/lokasi");
        const data = await response.json();

        if (data.success) {
          setLokasi(data.data);
        } else {
          console.error("Failed to fetch lokasi:", data.message);
          setError("Gagal memuat data lokasi");
          setLokasi([]);
        }
      } catch (error) {
        console.error("Error fetching lokasi:", error);
        setError("Terjadi kesalahan saat memuat data");
        setLokasi([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLokasi();
  }, []);

  const createLokasi = async (
    payload: Omit<LokasiData, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch("/api/lokasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setLokasi((prevLokasi) =>
          prevLokasi ? [...prevLokasi, data.data] : [data.data]
        );
      } else {
        console.error("Failed to create lokasi:", data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error creating lokasi:", error);
      throw new Error(error.message || "Failed to create lokasi");
    }
  };

  const updateLokasi = async (
    id: string,
    payload: Omit<LokasiData, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const response = await fetch(`/api/lokasi/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setLokasi((prevLokasi) =>
          prevLokasi
            ? prevLokasi.map((lokasi) =>
                lokasi._id === id ? { ...lokasi, ...payload } : lokasi
              )
            : null
        );
      } else {
        console.error("Failed to update lokasi:", data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error updating lokasi:", error);
      throw new Error(error.message || "Failed to update lokasi");
    }
  };

  const deleteLokasi = async (id: string) => {
    try {
      const response = await fetch(`/api/lokasi/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setLokasi((prevLokasi) =>
          prevLokasi ? prevLokasi.filter((lokasi) => lokasi._id !== id) : null
        );
      } else {
        console.error("Failed to delete lokasi:", data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error("Error deleting lokasi:", error);
      throw new Error(error.message || "Failed to delete lokasi");
    }
  };

  return { lokasi, isLoading, error, createLokasi, updateLokasi, deleteLokasi };
};
