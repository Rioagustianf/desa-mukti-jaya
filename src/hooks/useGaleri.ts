"use client";
import useSWR from "swr";
import axios from "axios";

export interface GaleriItem {
  _id: string;
  gambar: string;
  caption: string;
  kategori?: string;
  tanggal: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface GaleriPayload {
  gambar: string;
  caption: string;
  kategori?: string;
  tanggal: string;
}

export function useGaleri() {
  const { data, error, mutate } = useSWR("/api/galeri", async (url) => {
    const response = await axios.get(url);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch gallery data");
    }
    return response.data.data;
  });

  const createGaleri = async (payload: GaleriPayload) => {
    try {
      const response = await axios.post("/api/galeri", payload);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create gallery item"
        );
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error creating gallery item:", error);
      throw error;
    }
  };

  const updateGaleri = async (id: string, payload: Partial<GaleriPayload>) => {
    try {
      const response = await axios.put(`/api/galeri/${id}`, payload);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update gallery item"
        );
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error updating gallery item:", error);
      throw error;
    }
  };

  const deleteGaleri = async (id: string) => {
    try {
      const response = await axios.delete(`/api/galeri/${id}`);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete gallery item"
        );
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      throw error;
    }
  };

  return {
    galeri: data as GaleriItem[],
    isLoading: !data && !error,
    isError: !!error,
    error,
    createGaleri,
    updateGaleri,
    deleteGaleri,
    mutate,
  };
}
