"use client";
import useSWR from "swr";
import axios from "axios";

export function usePengumuman() {
  const { data, error, mutate } = useSWR("/api/pengumuman", (url) =>
    axios.get(url).then((res) => res.data.data)
  );

  const createPengumuman = async (payload: any) => {
    try {
      await axios.post("/api/pengumuman", payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating pengumuman:", error);
      throw error;
    }
  };

  const updatePengumuman = async (id: string, payload: any) => {
    try {
      await axios.put(`/api/pengumuman/${id}`, payload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating pengumuman:", error);
      throw error;
    }
  };

  const deletePengumuman = async (id: string) => {
    try {
      await axios.delete(`/api/pengumuman/${id}`);
      mutate();
      return true;
    } catch (error) {
      console.error("Error deleting pengumuman:", error);
      throw error;
    }
  };

  return {
    pengumuman: data,
    isLoading: !data && !error,
    error,
    createPengumuman,
    updatePengumuman,
    deletePengumuman,
  };
}
