"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Upload, Eye } from "lucide-react";
import Image from "next/image";

// Define TypeScript interface for Sambutan model
interface SambutanData {
  _id: string;
  namaKepalaDesa: string;
  foto?: string;
  video?: string;
  sambutan: string;
  createdAt: string;
  updatedAt: string;
}

// Schema validation using Zod
const schema = z.object({
  namaKepalaDesa: z.string().min(2, "Nama wajib diisi"),
  sambutan: z.string().min(10, "Sambutan wajib diisi"),
  foto: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

// Custom fetcher with error handling
const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url);
    return res.data.data;
  } catch (error) {
    console.error("Fetching error:", error);
    throw new Error("Gagal mengambil data sambutan");
  }
};

export default function SambutanAdminPage() {
  const { data, error, mutate, isLoading } = useSWR<SambutanData[]>(
    "/api/sambutan",
    fetcher
  );
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      namaKepalaDesa: "",
      sambutan: "",
      foto: "",
      video: "",
    },
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (data && data.length > 0) {
      reset({
        namaKepalaDesa: data[0].namaKepalaDesa,
        sambutan: data[0].sambutan,
        foto: data[0].foto || "",
        video: data[0].video || "",
      });

      if (data[0].foto) {
        setPreviewImage(data[0].foto);
      }
    }
  }, [data, reset]);

  // Handle API errors
  if (error) {
    toast.error("Gagal memuat data sambutan");
  }

  // Handle image upload
  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Create a FormData instance
      const formData = new FormData();
      formData.append("foto", file);

      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      // Send to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setValue("foto", result.url, { shouldDirty: true });
        toast.success("Foto berhasil diupload");
      } else {
        toast.error(result.message || "Gagal mengunggah foto");
        // Revert preview if server upload fails
        setPreviewImage(data?.[0]?.foto || null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Terjadi kesalahan saat mengunggah foto");
      // Revert preview on error
      setPreviewImage(data?.[0]?.foto || null);
    } finally {
      setUploading(false);
    }
  }

  // Form submission handler
  async function onSubmit(values: FormValues) {
    try {
      // Clean up the values (remove empty strings for optional fields)
      const cleanValues = {
        ...values,
        foto: values.foto || null,
        video: values.video || null,
      };

      if (data && data.length > 0) {
        // Update existing record
        const response = await fetch(`/api/sambutan/${data[0]._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanValues),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Sambutan berhasil diperbarui!");
          mutate(); // Refresh data
        } else {
          toast.error(result.message || "Gagal memperbarui sambutan");
        }
      } else {
        // Create new record
        const response = await fetch("/api/sambutan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(cleanValues),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Sambutan berhasil ditambahkan!");
          mutate(); // Refresh data
        } else {
          toast.error(result.message || "Gagal menambahkan sambutan");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Gagal menyimpan sambutan");
    }
  }

  const watchedValues = watch();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Sambutan Kepala Desa
          </h1>
          <p className="text-muted-foreground">
            Perbarui sambutan kepala desa yang ditampilkan di halaman utama
            website
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start">
          <Eye size={16} />
          Pratinjau
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Memuat data sambutan...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="edit" className="gap-2">
              <MessageSquare size={16} />
              Edit Sambutan
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye size={16} />
              Pratinjau
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Form Sambutan Kepala Desa</CardTitle>
                <CardDescription>
                  Isi formulir berikut untuk memperbarui sambutan kepala desa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="sambutan-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="namaKepalaDesa"
                      className="text-sm font-medium"
                    >
                      Nama Kepala Desa
                    </label>
                    <Input
                      id="namaKepalaDesa"
                      placeholder="Nama Kepala Desa"
                      {...register("namaKepalaDesa")}
                    />
                    {errors.namaKepalaDesa && (
                      <span className="text-red-500 text-xs">
                        {errors.namaKepalaDesa.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="foto" className="text-sm font-medium">
                      Foto Kepala Desa
                    </label>
                    <div className="flex items-center gap-4">
                      {previewImage && (
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                          <Image
                            src={previewImage}
                            alt="Preview"
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1"
                            disabled={uploading}
                          >
                            <Upload size={16} />
                            {uploading ? "Mengunggah..." : "Upload Foto"}
                          </Button>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <Input type="hidden" {...register("foto")} />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="video" className="text-sm font-medium">
                      URL Video (Opsional)
                    </label>
                    <Input
                      id="video"
                      placeholder="Link video YouTube atau platform lainnya"
                      {...register("video")}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="sambutan" className="text-sm font-medium">
                      Isi Sambutan
                    </label>
                    <Textarea
                      id="sambutan"
                      rows={8}
                      placeholder="Isi sambutan kepala desa"
                      {...register("sambutan")}
                      className="resize-y"
                    />
                    {errors.sambutan && (
                      <span className="text-red-500 text-xs">
                        {errors.sambutan.message}
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (data && data.length > 0) {
                      reset({
                        namaKepalaDesa: data[0].namaKepalaDesa,
                        sambutan: data[0].sambutan,
                        foto: data[0].foto || "",
                        video: data[0].video || "",
                      });
                      setPreviewImage(data[0].foto || null);
                    } else {
                      reset({
                        namaKepalaDesa: "",
                        sambutan: "",
                        foto: "",
                        video: "",
                      });
                      setPreviewImage(null);
                    }
                  }}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="sambutan-form"
                  disabled={!isDirty || isSubmitting}
                >
                  {data && data.length > 0
                    ? "Update Sambutan"
                    : "Tambah Sambutan"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau Sambutan</CardTitle>
                <CardDescription>
                  Tampilan sambutan kepala desa di website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 flex justify-center">
                    {previewImage ? (
                      <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-green-100">
                        <Image
                          src={previewImage}
                          alt={watchedValues.namaKepalaDesa || "Kepala Desa"}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        Tidak ada foto
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-xl font-bold mb-2">
                      {watchedValues.namaKepalaDesa || "Nama Kepala Desa"}
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {watchedValues.sambutan ? (
                        <p className="whitespace-pre-line">
                          {watchedValues.sambutan}
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">
                          Belum ada isi sambutan
                        </p>
                      )}
                    </div>
                    {watchedValues.video && (
                      <div className="mt-4">
                        <h4 className="text-md font-medium mb-2">
                          Video Sambutan:
                        </h4>
                        <p className="text-blue-600 break-all">
                          {watchedValues.video}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
