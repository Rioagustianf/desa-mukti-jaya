"use client";
import useSWR from "swr";
import axios from "axios";

export interface LayananItem {
  _id: string;
  nama: string;
  deskripsi: string;
  persyaratan: string;
  prosedur?: string;
  jadwalPelayanan?: string;
  biaya?: string;
  waktu?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface LayananPayload {
  nama: string;
  deskripsi: string;
  persyaratan: string;
  prosedur?: string;
  jadwalPelayanan?: string;
  biaya?: string;
  waktu?: string;
}

// Base URL helper to ensure consistent API paths
const API_BASE_URL = "/api";

// SWR fetcher function to handle errors consistently
const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch service data");
    }
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle 404 specifically
      if (error.response?.status === 404) {
        throw new Error(
          "API endpoint not found. Please check your server configuration."
        );
      }
      // Handle other Axios errors
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch service data"
      );
    }
    throw error;
  }
};

export function useLayanan() {
  const apiUrl = `${API_BASE_URL}/layanan-administrasi`;

  const { data, error, mutate, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    dedupingInterval: 5000,
  });

  const createLayanan = async (payload: LayananPayload) => {
    try {
      const response = await axios.post(apiUrl, payload);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create service");
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error creating service:", error);
      throw error;
    }
  };

  const updateLayanan = async (
    id: string,
    payload: Partial<LayananPayload>
  ) => {
    try {
      const response = await axios.put(`${apiUrl}/${id}`, payload);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update service");
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  };

  const deleteLayanan = async (id: string) => {
    try {
      const response = await axios.delete(`${apiUrl}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete service");
      }
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error deleting service:", error);
      throw error;
    }
  };

  return {
    layanan: data as LayananItem[],
    isLoading,
    isError: !!error,
    error,
    createLayanan,
    updateLayanan,
    deleteLayanan,
    mutate,
  };
}
