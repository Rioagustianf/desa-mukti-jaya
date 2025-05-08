"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePrestasi } from "@/hooks/usePrestasi";

const schema = z.object({
  nama: z.string().min(1, "Nama prestasi wajib diisi"),
  tahun: z.string().min(1, "Tahun wajib diisi"),
  deskripsi: z.string().optional(),
});

export default function PrestasiForm() {
  const { createPrestasi } = usePrestasi();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: any) {
    await createPrestasi(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-lg">
      <Input placeholder="Nama Prestasi" {...register("nama")} />
      <Input placeholder="Tahun" {...register("tahun")} />
      <Input placeholder="Deskripsi" {...register("deskripsi")} />
      <Button type="submit">Tambah Prestasi</Button>
      {errors.nama && <p className="text-red-500">{errors.nama.message}</p>}
    </form>
  );
}
