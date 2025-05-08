"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSejarah } from "@/hooks/useSejarah";

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi sejarah wajib diisi"),
  tahun: z.string().min(1, "Tahun wajib diisi"),
});

export default function SejarahForm() {
  const { createSejarah } = useSejarah();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: any) {
    await createSejarah(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-lg">
      <Input placeholder="Judul" {...register("judul")} />
      <Input placeholder="Isi Sejarah" {...register("isi")} />
      <Input placeholder="Tahun" {...register("tahun")} />
      <Button type="submit">Tambah Sejarah</Button>
      {errors.judul && <p className="text-red-500">{errors.judul.message}</p>}
    </form>
  );
}
