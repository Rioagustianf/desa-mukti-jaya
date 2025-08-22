"use client";
import useSWR from "swr";
import axios from "axios";
import { useState } from "react";

export interface PanduanItem {
  _id: string;
  judul: string;
  isi: string;
  layananTerkait?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PanduanPayload {
  judul: string;
  isi: string;
  layananTerkait?: string;
}

export function usePanduan() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetcher = async (url: string) => {
    try {
      const res = await axios.get(url);
      return res.data.data;
    } catch (error) {
      console.error("Error fetching panduan data:", error);
      throw error;
    }
  };

  const { data, error, isLoading, mutate } = useSWR<PanduanItem[]>(
    "/api/panduan-administrasi",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      onErrorRetry: (error) => {
        if (error?.response?.status === 404 || error?.response?.status === 401)
          return;
      },
    }
  );

  const createPanduan = async (payload: PanduanPayload) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/panduan-administrasi", payload);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error creating panduan:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePanduan = async (
    id: string,
    payload: Partial<PanduanPayload>
  ) => {
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `/api/panduan-administrasi/${id}`,
        payload
      );
      await mutate();
      return response.data.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePanduan = async (id: string) => {
    setIsSubmitting(true);
    try {
      const response = await axios.delete(`/api/panduan-administrasi/${id}`);
      await mutate();
      return response.data.data;
    } catch (error) {
      console.error("Error deleting panduan:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    panduan: data || [],
    isLoading,
    isSubmitting,
    error,
    createPanduan,
    updatePanduan,
    deletePanduan,
    mutate,
  };
}
