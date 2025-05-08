"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBerita } from "@/hooks/useBerita";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Isi berita wajib diisi"),
  image: z.string().optional(),
  date: z.string().optional(),
  author: z.string().optional(),
});

export default function BeritaForm() {
  const { createBerita } = useBerita();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: any) {
    await createBerita(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-lg">
      <Input placeholder="Judul" {...register("title")} />
      <Input placeholder="Isi Berita" {...register("content")} />
      <Input placeholder="URL Gambar" {...register("image")} />
      <Input placeholder="Tanggal" {...register("date")} />
      <Input placeholder="Penulis" {...register("author")} />
      <Button type="submit">Tambah Berita</Button>
      {errors.title && <p className="text-red-500">{errors.title.message}</p>}
    </form>
  );
}
