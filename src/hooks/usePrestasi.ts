"use client";
import useSWR from "swr";
import axios from "axios";

export interface PrestasiData {
  id: string;
  _id?: string; // MongoDB ID
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
}

export interface PrestasiPayload {
  title: string;
  description: string;
  date: string;
  category: string;
  imageUrl?: string;
}

// Function to transform the data from MongoDB format to the format used in the UI
const transformPrestasiData = (data: any): PrestasiData[] => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item._id,
    _id: item._id,
    title: item.nama || "",
    description: item.deskripsi || "",
    date: item.tahun ? new Date(item.tahun, 0, 1).toISOString() : "", // Convert year to ISO date
    category: item.penyelenggara || "",
    imageUrl: item.gambar || "",
  }));
};

export function usePrestasi() {
  const { data, error, mutate } = useSWR("/api/prestasi", async (url) => {
    const response = await axios.get(url);
    return transformPrestasiData(response.data.data);
  });

  const createPrestasi = async (payload: PrestasiPayload) => {
    await axios.post("/api/prestasi", payload);
    mutate();
  };

  const updatePrestasi = async (id: string, payload: PrestasiPayload) => {
    await axios.put(`/api/prestasi/${id}`, payload);
    mutate();
  };

  const deletePrestasi = async (id: string) => {
    await axios.delete(`/api/prestasi/${id}`);
    mutate();
  };

  return {
    prestasi: data || [],
    isLoading: !data && !error,
    error,
    createPrestasi,
    updatePrestasi,
    deletePrestasi,
  };
}
