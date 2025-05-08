"use client";
import useSWR from "swr";
import axios from "axios";

// Define type for Agenda model
export interface AgendaItem {
  _id: string;
  judul: string;
  deskripsi?: string;
  tanggalMulai: string | Date;
  tanggalSelesai?: string | Date;
  lokasi?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function useAgenda() {
  const { data, error, mutate } = useSWR<AgendaItem[]>("/api/agenda", (url) =>
    axios.get(url).then((res) => res.data.data)
  );

  const createAgenda = async (
    payload: Omit<AgendaItem, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await axios.post("/api/agenda", payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating agenda:", error);
      throw error;
    }
  };

  const updateAgenda = async (
    id: string,
    payload: Partial<Omit<AgendaItem, "_id" | "createdAt" | "updatedAt">>
  ) => {
    try {
      await axios.put(`/api/agenda/${id}`, payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating agenda:", error);
      throw error;
    }
  };

  const deleteAgenda = async (id: string) => {
    try {
      await axios.delete(`/api/agenda/${id}`);
      mutate();
      return true;
    } catch (error) {
      console.error("Error deleting agenda:", error);
      throw error;
    }
  };

  return {
    agenda: data,
    isLoading: !data && !error,
    error,
    createAgenda,
    updateAgenda,
    deleteAgenda,
  };
}
