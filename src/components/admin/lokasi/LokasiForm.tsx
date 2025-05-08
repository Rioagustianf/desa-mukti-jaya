"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLokasi } from "@/hooks/useLokasi";

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  lat: z.string().min(1, "Latitude wajib diisi"),
  lng: z.string().min(1, "Longitude wajib diisi"),
  deskripsi: z.string().optional(),
});

export default function LokasiForm() {
  const { createLokasi } = useLokasi();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: any) {
    await createLokasi({
      ...values,
      koordinat: { lat: parseFloat(values.lat), lng: parseFloat(values.lng) },
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-lg">
      <Input placeholder="Nama Lokasi" {...register("nama")} />
      <Input placeholder="Alamat" {...register("alamat")} />
      <Input placeholder="Latitude" {...register("lat")} />
      <Input placeholder="Longitude" {...register("lng")} />
      <Input placeholder="Deskripsi" {...register("deskripsi")} />
      <Button type="submit">Tambah Lokasi</Button>
      {errors.nama && <p className="text-red-500">{errors.nama.message}</p>}
    </form>
  );
}
