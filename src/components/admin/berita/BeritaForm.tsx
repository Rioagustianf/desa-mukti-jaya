"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { useBerita } from "@/hooks/useBerita";
import { useState } from "react";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  content: z.string().min(1, "Isi berita wajib diisi"),
  image: z.string().optional(),
  date: z.string().optional(),
  author: z.string().optional(),
});

export default function BeritaForm() {
  const { createBerita } = useBerita();
  const [imageUrl, setImageUrl] = useState("");
  const [imageFilename, setImageFilename] = useState("");
  const [imageFolderPath, setImageFolderPath] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values: any) {
    const beritaData = {
      ...values,
      image: imageUrl,
      imageFilename: imageFilename,
      imageFolderPath: imageFolderPath,
    };

    await createBerita(beritaData);
    reset();
    setImageUrl("");
    setImageFilename("");
    setImageFolderPath("");
  }

  const handleImageChange = (
    url: string,
    filename: string,
    folderPath: string
  ) => {
    setImageUrl(url);
    setImageFilename(filename);
    setImageFolderPath(folderPath);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul Berita
        </label>
        <Input
          placeholder="Masukkan judul berita"
          {...register("title")}
          className="w-full"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Isi Berita
        </label>
        <Textarea
          placeholder="Masukkan isi berita"
          {...register("content")}
          className="w-full min-h-[120px]"
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gambar Berita
        </label>
        <ImageUpload
          value={imageUrl}
          filename={imageFilename}
          onChange={handleImageChange}
          category="berita"
          showCategoryInput={true}
          maxSize={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal
          </label>
          <Input type="date" {...register("date")} className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Penulis
          </label>
          <Input
            placeholder="Nama penulis"
            {...register("author")}
            className="w-full"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Tambah Berita
      </Button>
    </form>
  );
}
