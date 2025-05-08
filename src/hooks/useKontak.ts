// src/hooks/useKontak.tsx
import { useState, useEffect } from "react";
import axios from "axios";

interface Kontak {
  _id: string;
  jenis: string;
  nilai: string;
  deskripsi?: string;
}

interface KontakInput {
  jenis: string;
  nilai: string;
  deskripsi?: string;
}

export const useKontak = () => {
  const [kontak, setKontak] = useState<Kontak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch kontak data
  const fetchKontak = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/kontak");
      console.log("API Response:", response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        setKontak(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setKontak([]);
        setError("Format respons API tidak valid");
      }
    } catch (error) {
      console.error("Error fetching kontak:", error);
      setKontak([]);
      setError("Gagal memuat data kontak");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new kontak with improved error handling
  const createKontak = async (data: KontakInput) => {
    try {
      // Validate data before sending
      if (!data.jenis || !data.nilai) {
        throw new Error("Data kontak tidak lengkap");
      }

      // Create a clean object with just the required fields
      const payload = {
        jenis: data.jenis.trim(),
        nilai: data.nilai.trim(),
        deskripsi: data.deskripsi ? data.deskripsi.trim() : "",
      };

      console.log("Sending contact data to server:", payload);

      const response = await axios.post("/api/kontak", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Server response for create:", response.data);

      if (response.data.success && response.data.data) {
        setKontak((prev) => [...prev, response.data.data]);
        return response.data.data;
      } else {
        throw new Error(
          "Gagal menambahkan kontak: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Error creating kontak:", error);
      throw new Error(error.message || "Gagal menambahkan kontak");
    }
  };

  // Update kontak with improved error handling
  const updateKontak = async (id: string, data: KontakInput) => {
    try {
      // Validate data before sending
      if (!data.jenis || !data.nilai) {
        throw new Error("Data kontak tidak lengkap");
      }

      // Create a clean object with just the required fields
      const payload = {
        jenis: data.jenis.trim(),
        nilai: data.nilai.trim(),
        deskripsi: data.deskripsi ? data.deskripsi.trim() : "",
      };

      console.log(`Updating kontak ${id} with data:`, payload);

      const response = await axios.put(`/api/kontak/${id}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Server response for update:", response.data);

      if (response.data.success && response.data.data) {
        setKontak((prev) =>
          prev.map((item) => (item._id === id ? response.data.data : item))
        );
        return response.data.data;
      } else {
        throw new Error(
          "Gagal memperbarui kontak: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Error updating kontak:", error);
      throw new Error(error.message || "Gagal memperbarui kontak");
    }
  };

  // Delete kontak with improved error handling
  const deleteKontak = async (id: string) => {
    try {
      console.log(`Deleting kontak with id: ${id}`);

      const response = await axios.delete(`/api/kontak/${id}`);
      console.log("Server response for delete:", response.data);

      if (response.data.success) {
        setKontak((prev) => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error(
          "Gagal menghapus kontak: " +
            (response.data.message || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Error deleting kontak:", error);
      throw new Error(error.message || "Gagal menghapus kontak");
    }
  };

  // Fetch kontak on component mount
  useEffect(() => {
    fetchKontak();
  }, []);

  return {
    kontak,
    isLoading,
    error,
    createKontak,
    updateKontak,
    deleteKontak,
    refreshKontak: fetchKontak,
  };
};

export default useKontak;
