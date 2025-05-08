"use client";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";

// Define types for better type safety
export interface SejarahData {
  _id: string;
  judul: string;
  isi: string;
  gambar?: string;
  tahun: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SejarahPayload {
  judul: string;
  isi: string;
  gambar?: string;
  tahun: string;
}

export function useSejarah() {
  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching sejarah data:", error);
      toast.error("Gagal memuat data sejarah");
      throw error;
    }
  };

  const { data, error, mutate, isLoading } = useSWR<SejarahData[]>(
    "/api/sejarah",
    fetcher
  );

  const createSejarah = async (payload: SejarahPayload) => {
    try {
      const response = await axios.post("/api/sejarah", payload);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error creating sejarah:", error);
      toast.error("Gagal menambahkan sejarah");
      throw error;
    }
  };

  const updateSejarah = async (id: string, payload: SejarahPayload) => {
    try {
      const response = await axios.put(`/api/sejarah/${id}`, payload);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error updating sejarah:", error);
      toast.error("Gagal memperbarui sejarah");
      throw error;
    }
  };

  const deleteSejarah = async (id: string) => {
    try {
      const response = await axios.delete(`/api/sejarah/${id}`);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error deleting sejarah:", error);
      toast.error("Gagal menghapus sejarah");
      throw error;
    }
  };

  return {
    sejarah: data || [],
    isLoading,
    error,
    createSejarah,
    updateSejarah,
    deleteSejarah,
  };
}
