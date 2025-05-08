"use client";
import useSWR from "swr";
import axios from "axios";

// Define type for Berita model
export interface BeritaItem {
  _id: string;
  judul: string;
  isi: string;
  gambar?: string;
  tanggal: string | Date;
  penulis?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function useBerita() {
  const { data, error, mutate } = useSWR<BeritaItem[]>("/api/berita", (url) =>
    axios.get(url).then((res) => res.data.data)
  );

  const createBerita = async (
    payload: Omit<BeritaItem, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await axios.post("/api/berita", payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating berita:", error);
      throw error;
    }
  };

  const updateBerita = async (
    id: string,
    payload: Partial<Omit<BeritaItem, "_id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      await axios.put(`/api/berita/${id}`, payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating berita:", error);
      throw error;
    }
  };

  const deleteBerita = async (id: string) => {
    try {
      await axios.delete(`/api/berita/${id}`);
      mutate();
      return true;
    } catch (error) {
      console.error("Error deleting berita:", error);
      throw error;
    }
  };

  return {
    berita: data,
    isLoading: !data && !error,
    error,
    createBerita,
    updateBerita,
    deleteBerita,
  };
}
