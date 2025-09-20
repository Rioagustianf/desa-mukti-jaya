"use client";
import useSWR from "swr";
import axios from "axios";

export interface Kontak {
  jenis: "telepon" | "email";
  nilai: string;
}

export interface Pengurus {
  _id: string;
  nama: string;
  jabatan: string;
  foto?: string;
  ttdDigital?: string;
  kontak: Kontak[];
  deskripsi?: string;
}

export function usePengurus() {
  const { data, error, mutate } = useSWR<Pengurus[]>(
    "/api/pengurus",
    (url: string) => axios.get(url).then((res) => res.data.data)
  );

  const uploadImage = async (file: File, category?: string) => {
    try {
      const formData = new FormData();
      formData.append("foto", file);
      if (category) {
        formData.append("category", category);
      }

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const createPengurus = async (payload: any) => {
    try {
      // Transform payload to match database schema
      const transformedPayload = transformPayload(payload);
      await axios.post("/api/pengurus", transformedPayload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error creating pengurus:", error);
      throw error;
    }
  };

  const updatePengurus = async (id: string, payload: any) => {
    try {
      // Transform payload to match database schema
      const transformedPayload = transformPayload(payload);
      await axios.put(`/api/pengurus/${id}`, transformedPayload);
      mutate();
      return true;
    } catch (error) {
      console.error("Error updating pengurus:", error);
      throw error;
    }
  };

  const deletePengurus = async (id: string) => {
    try {
      await axios.delete(`/api/pengurus/${id}`);
      mutate();
      return true;
    } catch (error) {
      console.error("Error deleting pengurus:", error);
      throw error;
    }
  };

  // Transform the form data to match the database schema
  const transformPayload = (formData: any) => {
    const kontak: Kontak[] = [];

    if (formData.telepon && formData.telepon.trim() !== "") {
      kontak.push({
        jenis: "telepon",
        nilai: formData.telepon,
      });
    }

    if (formData.email && formData.email.trim() !== "") {
      kontak.push({
        jenis: "email",
        nilai: formData.email,
      });
    }

    return {
      nama: formData.nama,
      jabatan: formData.jabatan,
      foto: formData.foto || "",
      ttdDigital: formData.ttdDigital || "",
      kontak: kontak, // Make sure this is properly structured as an array of objects
      deskripsi: formData.deskripsi || "",
    };
  };

  // Transform database data to form structure for editing
  const transformForForm = (pengurus: Pengurus) => {
    const telepon =
      pengurus.kontak.find((k) => k.jenis === "telepon")?.nilai || "";
    const email = pengurus.kontak.find((k) => k.jenis === "email")?.nilai || "";

    return {
      nama: pengurus.nama,
      jabatan: pengurus.jabatan,
      foto: pengurus.foto || "",
      ttdDigital: (pengurus as any).ttdDigital || "",
      telepon,
      email,
      deskripsi: pengurus.deskripsi || "",
    };
  };

  return {
    pengurus: data,
    isLoading: !data && !error,
    error,
    uploadImage,
    createPengurus,
    updatePengurus,
    deletePengurus,
    transformForForm,
  };
}
