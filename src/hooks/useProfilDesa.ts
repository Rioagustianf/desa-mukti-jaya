"use client";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";

export interface ProfilDesa {
  _id: string;
  nama: string;
  deskripsi?: string;
  sejarahSingkat?: string;
  visi?: string;
  misi?: string[] | string;
  kode_pos?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  luas_area?: string;
  jumlah_penduduk?: number | string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  foto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfilDesaPayload {
  nama: string;
  deskripsi?: string;
  sejarahSingkat?: string;
  visi?: string;
  misi?: string[] | string;
  kode_pos?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  luas_area?: string;
  jumlah_penduduk?: number | string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  foto?: string;
}

export function useProfilDesa() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching profil desa data:", error);
      throw error;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<ProfilDesa | ProfilDesa[]>(
    "/api/profil-desa",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      errorRetryCount: 3,
    }
  );

  // Helper to get a single profile (since the API might return an array or a single object)
  const getSingleProfile = (): ProfilDesa | null => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

    return data;
  };

  const createProfilDesa = async (payload: ProfilDesaPayload) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/profil-desa", payload);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error creating profil desa:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProfilDesa = async (
    id: string,
    payload: Partial<ProfilDesaPayload>
  ) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(`/api/profil-desa/${id}`, payload);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error updating profil desa:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    profilDesa: data,
    singleProfile: getSingleProfile(),
    isLoading,
    isSubmitting,
    error,
    createProfilDesa,
    updateProfilDesa,
    mutate,
  };
}
