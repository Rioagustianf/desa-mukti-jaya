"use client";

import useSWR from "swr";
import axios from "axios";

export interface PengajuanSuratItem {
  _id: string;
  jenisSurat:
    | {
        _id: string;
        nama: string;
        kode: string;
        tipeForm: string;
      }
    | string;
  kodeSurat?: string;

  // Data pemohon
  nama: string;
  nik: string;
  tempatLahir?: string;
  tanggalLahir?: string;

  // Alamat
  alamat?: string;
  rt?: string;
  rw?: string;
  desa?: string;
  kecamatan?: string;
  kabupaten?: string;

  // Kontak
  teleponWA: string;

  // Keperluan
  keperluan?: string;

  // File uploads
  dokumen?: string[];
  fotoKTP?: string;
  fotoKK?: string;
  fotoSuratKeterangan?: string;

  // Khusus untuk surat pindah
  alamatTujuan?: string;
  rtTujuan?: string;
  rwTujuan?: string;
  desaTujuan?: string;
  kecamatanTujuan?: string;
  kabupatenTujuan?: string;
  alasanPindah?: string;

  // Status pengajuan
  status: "pending" | "approved" | "rejected" | "revision";
  tanggalPengajuan: Date | string;
  tanggalUpdate?: Date | string;
  catatan?: string;

  // Generated letter information
  letterGenerated?: boolean;
  letterUrl?: string;
  letterGeneratedAt?: Date | string;
  letterGeneratedBy?: string;

  createdAt: Date | string;
  updatedAt: Date | string;
}

// Base URL helper to ensure consistent API paths
const API_BASE_URL = "/api";

// SWR fetcher function to handle errors consistently
const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch data");
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
        error.response?.data?.message || error.message || "Failed to fetch data"
      );
    }
    throw error;
  }
};

export function usePengajuanSurat(filters?: {
  status?: string;
  jenisSurat?: string;
  search?: string;
}) {
  // Construct the API URL with query parameters
  let apiUrl = `${API_BASE_URL}/pengajuan-surat`;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.jenisSurat) params.append("jenisSurat", filters.jenisSurat);
    if (filters.search) params.append("search", filters.search);

    const queryString = params.toString();
    if (queryString) {
      apiUrl += `?${queryString}`;
    }
  }

  const { data, error, mutate, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    dedupingInterval: 5000,
  });

  const updateStatus = async (id: string, status: string, catatan?: string) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/pengajuan-surat/${id}`,
        {
          status,
          catatan,
          tanggalUpdate: new Date(),
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to update status");
      }

      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const deletePengajuan = async (id: string) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/pengajuan-surat/${id}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete pengajuan");
      }

      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error deleting pengajuan:", error);
      throw error;
    }
  };

  return {
    pengajuan: data as PengajuanSuratItem[],
    isLoading,
    isError: !!error,
    error,
    updateStatus,
    deletePengajuan,
    mutate,
  };
}

// Hook untuk mengambil detail pengajuan berdasarkan ID
export function usePengajuanSuratDetail(id: string) {
  const apiUrl = `${API_BASE_URL}/pengajuan-surat/${id}`;

  const { data, error, mutate, isLoading } = useSWR(
    id ? apiUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
    }
  );

  return {
    pengajuan: data as PengajuanSuratItem,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
