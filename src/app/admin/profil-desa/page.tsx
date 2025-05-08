"use client";
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
import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  FileText,
  Home,
  Loader2,
  MapPin,
  Upload,
  Users,
  Mail,
  Phone,
  Globe,
  Info,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Schema diperbarui sesuai dengan model MongoDB
const schema = z.object({
  nama: z.string().min(2, "Nama desa wajib diisi minimal 2 karakter"),
  deskripsi: z.string().optional(),
  sejarahSingkat: z
    .string()
    .min(2, "Sejarah singkat wajib diisi minimal 2 karakter"),
  visi: z.string().min(2, "Visi wajib diisi minimal 2 karakter"),
  misi: z.string().min(2, "Misi wajib diisi minimal 2 karakter"),
  kode_pos: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  luas_area: z.string().optional(),
  jumlah_penduduk: z.string().optional(),
  alamat: z.string().min(2, "Alamat wajib diisi minimal 2 karakter"),
  telepon: z.string().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url("Format URL tidak valid")
    .optional()
    .or(z.literal("")),
  logo: z.string().optional(),
  foto: z.string().optional(),
  demografi: z.string().min(2, "Demografi wajib diisi minimal 2 karakter"),
});

type FormValues = z.infer<typeof schema>;
const fetcher = (url: string) => axios.get(url).then((res) => res.data.data);

export default function ProfilDesaAdminPage() {
  const { data, mutate, isLoading, error } = useSWR(
    "/api/profil-desa",
    fetcher,
    {
      revalidateOnFocus: false,
      onError: (err) => {
        toast.error(
          "Gagal memuat data: " + (err.response?.data?.message || err.message)
        );
      },
    }
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
      nama: "",
      deskripsi: "",
      sejarahSingkat: "",
      visi: "",
      misi: "",
      kode_pos: "",
      kecamatan: "",
      kabupaten: "",
      provinsi: "",
      luas_area: "",
      jumlah_penduduk: "",
      alamat: "",
      telepon: "",
      email: "",
      website: "",
      logo: "",
      foto: "",
      demografi: "",
    },
    mode: "onChange", // Validate on change
  });

  // Update form values when data is loaded
  React.useEffect(() => {
    if (data?.[0]) {
      reset(data[0]);
    }
  }, [data, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (data?.[0]?._id) {
        await axios.put(`/api/profil-desa/${data[0]._id}`, values);
        toast.success("Profil desa berhasil diperbarui!");
      } else {
        await axios.post("/api/profil-desa", values);
        toast.success("Profil desa berhasil ditambahkan!");
      }
      mutate();
    } catch (error: any) {
      toast.error(
        "Gagal menyimpan profil desa: " +
          (error.response?.data?.message || error.message)
      );
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("foto", file);

    try {
      setIsUploading(true);
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setValue("foto", response.data.url, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success("Gambar berhasil diunggah!");
      } else {
        toast.error("Gagal mengunggah gambar");
      }
    } catch (error: any) {
      toast.error(
        "Gagal mengunggah gambar: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    try {
      setIsUploadingLogo(true);
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setValue("logo", response.data.url, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success("Logo berhasil diunggah!");
      } else {
        toast.error("Gagal mengunggah logo");
      }
    } catch (error: any) {
      toast.error(
        "Gagal mengunggah logo: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const watchedValues = watch();

  // Handle navigation to frontend preview
  const handlePreviewClick = () => {
    // You would typically navigate to the public-facing page
    window.open("/profil-desa", "_blank");
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col justify-center items-center h-40 space-y-4">
            <p className="text-red-500">Gagal memuat data profil desa</p>
            <Button onClick={() => mutate()}>Coba Lagi</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Profil Desa
          </h1>
          <p className="text-muted-foreground">
            Perbarui informasi profil desa yang ditampilkan di website
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 self-start"
          onClick={handlePreviewClick}
        >
          <Eye size={16} />
          Pratinjau di Website
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-muted-foreground">
                  Memuat data profil desa...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="edit" className="gap-2">
              <FileText size={16} />
              Edit Profil
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye size={16} />
              Pratinjau
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Form Profil Desa</CardTitle>
                <CardDescription>
                  Isi formulir berikut untuk memperbarui informasi profil desa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  id="profil-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {/* Informasi Dasar */}
                    <div>
                      <h3 className="text-lg font-medium">Informasi Dasar</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Informasi umum tentang desa
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="nama" className="text-sm font-medium">
                            Nama Desa <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id="nama"
                            placeholder="Masukkan nama desa"
                            {...register("nama")}
                          />
                          {errors.nama && (
                            <span className="text-red-500 text-xs">
                              {errors.nama.message}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="deskripsi"
                            className="text-sm font-medium"
                          >
                            Deskripsi Singkat
                          </label>
                          <Textarea
                            id="deskripsi"
                            placeholder="Masukkan deskripsi singkat tentang desa"
                            {...register("deskripsi")}
                            rows={2}
                            className="resize-y"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Visi & Misi */}
                    <div>
                      <h3 className="text-lg font-medium">Visi & Misi</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tentukan visi dan misi desa untuk ditampilkan di website
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="visi" className="text-sm font-medium">
                            Visi Desa <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="visi"
                            placeholder="Masukkan visi desa"
                            {...register("visi")}
                            rows={3}
                            className="resize-y"
                          />
                          {errors.visi && (
                            <span className="text-red-500 text-xs">
                              {errors.visi.message}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="misi" className="text-sm font-medium">
                            Misi Desa <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="misi"
                            placeholder="Masukkan misi desa (pisahkan dengan baris baru untuk setiap poin)"
                            {...register("misi")}
                            rows={5}
                            className="resize-y"
                          />
                          {errors.misi && (
                            <span className="text-red-500 text-xs">
                              {errors.misi.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Informasi Desa */}
                    <div>
                      <h3 className="text-lg font-medium">Informasi Desa</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Informasi mengenai sejarah dan demografi desa
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="sejarahSingkat"
                            className="text-sm font-medium"
                          >
                            Sejarah Singkat{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="sejarahSingkat"
                            placeholder="Masukkan sejarah singkat desa"
                            {...register("sejarahSingkat")}
                            rows={4}
                            className="resize-y"
                          />
                          {errors.sejarahSingkat && (
                            <span className="text-red-500 text-xs">
                              {errors.sejarahSingkat.message}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="demografi"
                            className="text-sm font-medium"
                          >
                            Demografi <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="demografi"
                            placeholder="Masukkan informasi demografi desa (jumlah penduduk, mata pencaharian, dll)"
                            {...register("demografi")}
                            rows={4}
                            className="resize-y"
                          />
                          {errors.demografi && (
                            <span className="text-red-500 text-xs">
                              {errors.demografi.message}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Data Administratif */}
                    <div>
                      <h3 className="text-lg font-medium">
                        Data Administratif
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Informasi administratif tentang desa
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="kecamatan"
                            className="text-sm font-medium"
                          >
                            Kecamatan
                          </label>
                          <Input
                            id="kecamatan"
                            placeholder="Masukkan nama kecamatan"
                            {...register("kecamatan")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="kabupaten"
                            className="text-sm font-medium"
                          >
                            Kabupaten
                          </label>
                          <Input
                            id="kabupaten"
                            placeholder="Masukkan nama kabupaten"
                            {...register("kabupaten")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="provinsi"
                            className="text-sm font-medium"
                          >
                            Provinsi
                          </label>
                          <Input
                            id="provinsi"
                            placeholder="Masukkan nama provinsi"
                            {...register("provinsi")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="kode_pos"
                            className="text-sm font-medium"
                          >
                            Kode Pos
                          </label>
                          <Input
                            id="kode_pos"
                            placeholder="Masukkan kode pos"
                            {...register("kode_pos")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="luas_area"
                            className="text-sm font-medium"
                          >
                            Luas Area
                          </label>
                          <Input
                            id="luas_area"
                            placeholder="Contoh: 10.5 km²"
                            {...register("luas_area")}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="jumlah_penduduk"
                            className="text-sm font-medium"
                          >
                            Jumlah Penduduk
                          </label>
                          <Input
                            id="jumlah_penduduk"
                            placeholder="Masukkan jumlah penduduk"
                            {...register("jumlah_penduduk")}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Alamat & Kontak */}
                    <div>
                      <h3 className="text-lg font-medium">Alamat & Kontak</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Alamat dan informasi kontak desa
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="alamat"
                            className="text-sm font-medium"
                          >
                            Alamat Lengkap{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            id="alamat"
                            placeholder="Masukkan alamat lengkap desa"
                            {...register("alamat")}
                            rows={2}
                            className="resize-y"
                          />
                          {errors.alamat && (
                            <span className="text-red-500 text-xs">
                              {errors.alamat.message}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="telepon"
                              className="text-sm font-medium"
                            >
                              Nomor Telepon
                            </label>
                            <Input
                              id="telepon"
                              placeholder="Contoh: +62123456789"
                              {...register("telepon")}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="email"
                              className="text-sm font-medium"
                            >
                              Email
                            </label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Contoh: info@desacontoh.id"
                              {...register("email")}
                            />
                            {errors.email && (
                              <span className="text-red-500 text-xs">
                                {errors.email.message}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="website"
                              className="text-sm font-medium"
                            >
                              Website
                            </label>
                            <Input
                              id="website"
                              placeholder="Contoh: https://desacontoh.id"
                              {...register("website")}
                            />
                            {errors.website && (
                              <span className="text-red-500 text-xs">
                                {errors.website.message}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Media */}
                    <div>
                      <h3 className="text-lg font-medium">Media</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Logo dan gambar representatif desa
                      </p>
                      <div className="space-y-6">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <label htmlFor="logo" className="text-sm font-medium">
                            Logo Desa
                          </label>
                          <div className="flex gap-2">
                            <input type="hidden" {...register("logo")} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={logoInputRef}
                              onChange={handleLogoUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-1"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              <span className="inline">
                                {isUploadingLogo
                                  ? "Mengunggah..."
                                  : "Upload Logo"}
                              </span>
                            </Button>
                          </div>

                          {watchedValues.logo && (
                            <div className="mt-2 relative h-28 w-28 rounded-md overflow-hidden border">
                              <Image
                                src={watchedValues.logo}
                                alt="Logo Desa"
                                fill
                                className="object-contain"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=112&width=112";
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Foto Desa Upload */}
                        <div className="space-y-2">
                          <label htmlFor="foto" className="text-sm font-medium">
                            Foto Desa
                          </label>
                          <div className="flex gap-2">
                            <input type="hidden" {...register("foto")} />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleImageUpload}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="gap-1"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              <span className="inline">
                                {isUploading ? "Mengunggah..." : "Upload Foto"}
                              </span>
                            </Button>
                          </div>

                          {watchedValues.foto && (
                            <div className="mt-2 relative h-40 w-full sm:w-2/3 lg:w-1/2 rounded-md overflow-hidden border">
                              <Image
                                src={watchedValues.foto}
                                alt="Foto Desa"
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=160&width=320";
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => reset(data?.[0] || {})}
                  disabled={!isDirty}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  form="profil-form"
                  disabled={!isDirty || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : data?.[0]?._id ? (
                    "Update Profil Desa"
                  ) : (
                    "Tambah Profil Desa"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Pratinjau Profil Desa</CardTitle>
                <CardDescription>
                  Tampilan profil desa di website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Header dengan Logo dan Nama */}
                  <div className="flex items-center gap-4">
                    {watchedValues.logo ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                        <Image
                          src={watchedValues.logo}
                          alt="Logo Desa"
                          fill
                          className="object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=64&width=64";
                          }}
                        />
                      </div>
                    ) : null}
                    <div>
                      <h2 className="text-2xl font-bold">
                        {watchedValues.nama || "Nama Desa"}
                      </h2>
                      <p className="text-muted-foreground">
                        {watchedValues.deskripsi ||
                          "Deskripsi desa belum ditambahkan"}
                      </p>
                    </div>
                  </div>

                  {/* Gambar Desa */}
                  {watchedValues.foto ? (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                      <Image
                        src={watchedValues.foto}
                        alt="Foto Desa"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=256&width=768";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                      Tidak ada foto desa
                    </div>
                  )}

                  {/* Informasi Administratif */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">Lokasi</span>
                      </div>
                      <p className="text-sm">
                        Kecamatan: {watchedValues.kecamatan || "-"}
                      </p>
                      <p className="text-sm">
                        Kabupaten: {watchedValues.kabupaten || "-"}
                      </p>
                      <p className="text-sm">
                        Provinsi: {watchedValues.provinsi || "-"}
                      </p>
                      <p className="text-sm">
                        Kode Pos: {watchedValues.kode_pos || "-"}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary" />
                        <span className="font-medium">Info Desa</span>
                      </div>
                      <p className="text-sm">
                        Luas Area: {watchedValues.luas_area || "-"}
                      </p>
                      <p className="text-sm">
                        Jumlah Penduduk: {watchedValues.jumlah_penduduk || "-"}
                      </p>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="font-medium">Kontak</span>
                      </div>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {watchedValues.telepon || "-"}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {watchedValues.email || "-"}
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {watchedValues.website || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Alamat</h3>
                    <p>{watchedValues.alamat || "Alamat belum ditambahkan"}</p>
                  </div>

                  {/* Visi & Misi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Visi</h3>
                      <p className="text-sm">
                        {watchedValues.visi || "Visi desa belum ditambahkan"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Misi</h3>
                      {watchedValues.misi ? (
                        <div className="text-sm">
                          {watchedValues.misi.split("\n").map((item, index) =>
                            item.trim() ? (
                              <div key={index} className="flex gap-2 mb-1">
                                <span>•</span>
                                <span>{item}</span>
                              </div>
                            ) : null
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">Misi desa belum ditambahkan</p>
                      )}
                    </div>
                  </div>

                  {/* Sejarah */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Sejarah Singkat
                    </h3>
                    <p className="text-sm whitespace-pre-line">
                      {watchedValues.sejarahSingkat ||
                        "Sejarah desa belum ditambahkan"}
                    </p>
                  </div>

                  {/* Demografi */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Demografi</h3>
                    <p className="text-sm whitespace-pre-line">
                      {watchedValues.demografi ||
                        "Informasi demografi belum ditambahkan"}
                    </p>
                  </div>

                  {/* Link ke halaman utama */}
                  <div className="flex justify-end">
                    <Link href="/">
                      <Button variant="outline" className="gap-2">
                        <Home size={16} />
                        Kembali ke Beranda
                      </Button>
                    </Link>
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
