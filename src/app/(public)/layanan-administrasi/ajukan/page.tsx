"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  User,
  MapPin,
  Phone,
  FileCheck,
  Info,
  Upload,
  X,
  FileImage,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { createPengajuanSurat } from "./actions";
import { getUserPengajuan } from "./actions";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Schema untuk validasi form
const pengajuanSchema = z
  .object({
    jenisSurat: z.enum(["domisili", "pindah"]),

    // Data pemohon (disederhanakan)
    nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
    tempatLahir: z.string().min(3, "Tempat lahir wajib diisi"),
    tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),

    // Alamat (disederhanakan)
    alamat: z.string().min(5, "Alamat wajib diisi minimal 5 karakter"),
    rt: z.string().min(1, "RT wajib diisi"),
    rw: z.string().min(1, "RW wajib diisi"),
    desa: z.string().min(1, "Desa wajib diisi"),
    kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
    kabupaten: z.string().min(1, "Kabupaten wajib diisi"),

    // Kontak (disederhanakan)
    teleponWA: z.string().min(10, "Nomor telepon WA minimal 10 digit"),

    // Keperluan
    keperluan: z.string().min(10, "Keperluan wajib diisi minimal 10 karakter"),

    // File uploads - diubah menjadi array string
    dokumen: z.array(z.string()).min(3, "Semua dokumen wajib diupload"),

    // Khusus untuk surat pindah
    alamatTujuan: z.string().optional(),
    rtTujuan: z.string().optional(),
    rwTujuan: z.string().optional(),
    desaTujuan: z.string().optional(),
    kecamatanTujuan: z.string().optional(),
    kabupatenTujuan: z.string().optional(),
    alasanPindah: z.string().optional(),
  })
  .refine(
    (data) => {
      // Jika jenis surat adalah pindah, maka field tujuan harus diisi
      if (data.jenisSurat === "pindah") {
        return (
          !!data.alamatTujuan &&
          !!data.rtTujuan &&
          !!data.rwTujuan &&
          !!data.desaTujuan &&
          !!data.kecamatanTujuan &&
          !!data.kabupatenTujuan &&
          !!data.alasanPindah
        );
      }
      return true;
    },
    {
      message:
        "Data alamat tujuan dan alasan pindah wajib diisi untuk surat pindah",
      path: ["alamatTujuan"],
    }
  );

type FormValues = z.infer<typeof pengajuanSchema>;

export default function PengajuanSuratPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"domisili" | "pindah">("domisili");
  const [view, setView] = useState<"form" | "status">("form");
  const [userPengajuan, setUserPengajuan] = useState<any[]>([]);
  const [isLoadingPengajuan, setIsLoadingPengajuan] = useState(false);
  const router = useRouter();

  // State untuk file uploads
  const [uploadingDokumen, setUploadingDokumen] = useState(false);
  const [progressDokumen, setProgressDokumen] = useState(0);
  const [uploadedDokumen, setUploadedDokumen] = useState<string[]>([]);
  const [dokumenLabels, setDokumenLabels] = useState<string[]>([]);

  // Ref untuk file input
  const dokumenInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(pengajuanSchema),
    defaultValues: {
      jenisSurat: "domisili",
      dokumen: [],
    },
  });

  const jenisSurat = watch("jenisSurat");
  const dokumen = watch("dokumen");

  // Fetch user pengajuan
  useEffect(() => {
    const fetchUserPengajuan = async () => {
      setIsLoadingPengajuan(true);
      try {
        const result = await getUserPengajuan();
        if (result.success) {
          setUserPengajuan(result.data);
        } else {
          console.error("Failed to fetch user pengajuan:", result.message);
        }
      } catch (error) {
        console.error("Error fetching user pengajuan:", error);
      } finally {
        setIsLoadingPengajuan(false);
      }
    };

    if (view === "status") {
      fetchUserPengajuan();
    }
  }, [view]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "domisili" | "pindah");
    setValue("jenisSurat", value as "domisili" | "pindah");
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validasi jumlah file
    if (files.length < 3) {
      toast.error(
        "Harap upload minimal 3 dokumen (KTP, KK, dan Surat Keterangan RT)"
      );
      return;
    }

    // Validasi tipe file
    for (let i = 0; i < files.length; i++) {
      if (!files[i].type.startsWith("image/")) {
        toast.error("Hanya file gambar yang diperbolehkan");
        return;
      }

      // Validasi ukuran file (5MB limit)
      if (files[i].size > 5 * 1024 * 1024) {
        toast.error(`File ${files[i].name} melebihi batas ukuran 5MB`);
        return;
      }
    }

    setUploadingDokumen(true);
    setProgressDokumen(10);
    const uploadedUrls: string[] = [];
    const fileLabels: string[] = [];

    try {
      // Simulasi progress
      const progressInterval = setInterval(() => {
        setProgressDokumen((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 80 / files.length / 5;
        });
      }, 300);

      // Upload semua file
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("foto", files[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Upload gagal");
        }

        const data = await response.json();

        if (data.success) {
          uploadedUrls.push(data.url);
          fileLabels.push(files[i].name);
        } else {
          throw new Error(data.message || "Upload gagal");
        }
      }

      clearInterval(progressInterval);
      setProgressDokumen(100);

      // Update state dan form value
      setUploadedDokumen(uploadedUrls);
      setDokumenLabels(fileLabels);
      setValue("dokumen", uploadedUrls);
      toast.success("Semua dokumen berhasil diupload");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload gagal");
    } finally {
      setTimeout(() => {
        setUploadingDokumen(false);
        setProgressDokumen(0);
      }, 500);
    }
  };

  // Handle file removal
  const handleRemoveDokumen = () => {
    setUploadedDokumen([]);
    setDokumenLabels([]);
    setValue("dokumen", []);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Konversi array dokumen menjadi objek yang sesuai dengan model
      const submissionData = {
        ...data,
        fotoKTP: data.dokumen[0] || "",
        fotoKK: data.dokumen[1] || "",
        fotoSuratKeterangan: data.dokumen[2] || "",
      };

      const result = await createPengajuanSurat(submissionData);
      if (result.success) {
        setIsSuccess(true);
        toast.success("Pengajuan surat berhasil dikirim!");
        reset();
        setUploadedDokumen([]);
        setDokumenLabels([]);
      } else {
        toast.error(result.message || "Gagal mengirim pengajuan");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Terjadi kesalahan saat mengirim pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Menunggu
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Ditolak
          </Badge>
        );
      case "revision":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Perlu Revisi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="w-full max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Pengajuan Berhasil
                </h1>
                <p className="text-lg md:text-xl max-w-2xl">
                  Pengajuan surat Anda telah berhasil dikirim dan akan segera
                  diproses
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="w-full max-w-3xl mx-auto">
            <Card className="shadow-md">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Terima Kasih!</CardTitle>
                <CardDescription>
                  Pengajuan surat Anda telah berhasil dikirim dan akan segera
                  diproses
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pt-4 pb-6">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="mb-6">
                  Silakan cek status pengajuan Anda secara berkala. Kami akan
                  menghubungi Anda melalui WhatsApp yang telah diberikan.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center gap-4 pt-2">
                <Button
                  onClick={() => router.push("/layanan-administrasi/informasi")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Layanan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setActiveTab("domisili");
                    setValue("jenisSurat", "domisili");
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Buat Pengajuan Baru
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Pengajuan Surat Administrasi
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Silakan lengkapi formulir di bawah ini untuk mengajukan
                pembuatan surat
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <Button
                variant={view === "form" ? "default" : "outline"}
                className={`rounded-l-md ${
                  view === "form" ? "" : "hover:bg-slate-100"
                }`}
                onClick={() => setView("form")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Form Pengajuan
              </Button>
              <Button
                variant={view === "status" ? "default" : "outline"}
                className={`rounded-r-md ${
                  view === "status" ? "" : "hover:bg-slate-100"
                }`}
                onClick={() => setView("status")}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Status Pengajuan
              </Button>
            </div>
          </div>

          {view === "form" ? (
            <Card className="shadow-md mb-8">
              <CardHeader>
                <CardTitle>Formulir Pengajuan Surat</CardTitle>
                <CardDescription>
                  Pilih jenis surat yang ingin diajukan dan isi data dengan
                  lengkap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="domisili"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Surat Domisili
                      </TabsTrigger>
                      <TabsTrigger
                        value="pindah"
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Surat Pindah
                      </TabsTrigger>
                    </TabsList>

                    {/* Data Pemohon - Disederhanakan */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <User className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium">Data Pemohon</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nama">
                            Nama Lengkap <span className="text-red-500">*</span>
                          </Label>
                          <Input id="nama" {...register("nama")} />
                          {errors.nama && (
                            <p className="text-red-500 text-xs">
                              {errors.nama.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nik">
                            NIK <span className="text-red-500">*</span>
                          </Label>
                          <Input id="nik" {...register("nik")} />
                          {errors.nik && (
                            <p className="text-red-500 text-xs">
                              {errors.nik.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tempatLahir">
                            Tempat Lahir <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="tempatLahir"
                            {...register("tempatLahir")}
                          />
                          {errors.tempatLahir && (
                            <p className="text-red-500 text-xs">
                              {errors.tempatLahir.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tanggalLahir">
                            Tanggal Lahir{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="tanggalLahir"
                            type="date"
                            {...register("tanggalLahir")}
                          />
                          {errors.tanggalLahir && (
                            <p className="text-red-500 text-xs">
                              {errors.tanggalLahir.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-8 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-medium">Alamat</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="alamat">
                            Alamat Lengkap{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea id="alamat" {...register("alamat")} />
                          {errors.alamat && (
                            <p className="text-red-500 text-xs">
                              {errors.alamat.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rt">
                            RT <span className="text-red-500">*</span>
                          </Label>
                          <Input id="rt" {...register("rt")} />
                          {errors.rt && (
                            <p className="text-red-500 text-xs">
                              {errors.rt.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rw">
                            RW <span className="text-red-500">*</span>
                          </Label>
                          <Input id="rw" {...register("rw")} />
                          {errors.rw && (
                            <p className="text-red-500 text-xs">
                              {errors.rw.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="desa">
                            Desa <span className="text-red-500">*</span>
                          </Label>
                          <Input id="desa" {...register("desa")} />
                          {errors.desa && (
                            <p className="text-red-500 text-xs">
                              {errors.desa.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kecamatan">
                            Kecamatan <span className="text-red-500">*</span>
                          </Label>
                          <Input id="kecamatan" {...register("kecamatan")} />
                          {errors.kecamatan && (
                            <p className="text-red-500 text-xs">
                              {errors.kecamatan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="kabupaten">
                            Kabupaten <span className="text-red-500">*</span>
                          </Label>
                          <Input id="kabupaten" {...register("kabupaten")} />
                          {errors.kabupaten && (
                            <p className="text-red-500 text-xs">
                              {errors.kabupaten.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-8 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <Phone className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-medium">Kontak</h4>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="teleponWA">
                            Nomor Telepon WhatsApp{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="teleponWA"
                            {...register("teleponWA")}
                            placeholder="Contoh: 081234567890"
                          />
                          {errors.teleponWA && (
                            <p className="text-red-500 text-xs">
                              {errors.teleponWA.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Konten khusus untuk masing-masing jenis surat */}
                    <TabsContent value="domisili" className="mt-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium">
                          Informasi Surat Domisili
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keperluan">
                          Keperluan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="keperluan"
                          placeholder="Jelaskan keperluan pembuatan surat domisili"
                          {...register("keperluan")}
                          className="min-h-[100px]"
                        />
                        {errors.keperluan && (
                          <p className="text-red-500 text-xs">
                            {errors.keperluan.message}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="pindah" className="mt-6 space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <FileCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-medium">
                          Informasi Surat Pindah
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="keperluan">
                          Keperluan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="keperluan"
                          placeholder="Jelaskan keperluan pembuatan surat pindah"
                          {...register("keperluan")}
                        />
                        {errors.keperluan && (
                          <p className="text-red-500 text-xs">
                            {errors.keperluan.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alasanPindah">
                          Alasan Pindah <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="alasanPindah"
                          placeholder="Jelaskan alasan kepindahan"
                          {...register("alasanPindah")}
                        />
                        {errors.alasanPindah && (
                          <p className="text-red-500 text-xs">
                            {errors.alasanPindah.message}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-6 mb-4">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <h4 className="text-lg font-medium">Alamat Tujuan</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="alamatTujuan">
                            Alamat Lengkap Tujuan{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="alamatTujuan"
                            {...register("alamatTujuan")}
                          />
                          {errors.alamatTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.alamatTujuan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rtTujuan">
                            RT <span className="text-red-500">*</span>
                          </Label>
                          <Input id="rtTujuan" {...register("rtTujuan")} />
                          {errors.rtTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.rtTujuan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rwTujuan">
                            RW <span className="text-red-500">*</span>
                          </Label>
                          <Input id="rwTujuan" {...register("rwTujuan")} />
                          {errors.rwTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.rwTujuan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="desaTujuan">
                            Desa <span className="text-red-500">*</span>
                          </Label>
                          <Input id="desaTujuan" {...register("desaTujuan")} />
                          {errors.desaTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.desaTujuan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kecamatanTujuan">
                            Kecamatan <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="kecamatanTujuan"
                            {...register("kecamatanTujuan")}
                          />
                          {errors.kecamatanTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.kecamatanTujuan.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="kabupatenTujuan">
                            Kabupaten <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="kabupatenTujuan"
                            {...register("kabupatenTujuan")}
                          />
                          {errors.kabupatenTujuan && (
                            <p className="text-red-500 text-xs">
                              {errors.kabupatenTujuan.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Upload Dokumen - Digabung menjadi satu bagian dengan satu tombol */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <Upload className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-medium">Upload Dokumen</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm">
                        <p className="font-medium mb-2">
                          Petunjuk Upload Dokumen:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Upload 3 dokumen sekaligus: KTP, Kartu Keluarga, dan
                            Surat Keterangan RT
                          </li>
                          <li>
                            Pastikan semua dokumen terlihat jelas dan dapat
                            dibaca
                          </li>
                          <li>
                            Format file yang diperbolehkan: JPG, PNG, atau JPEG
                          </li>
                          <li>Ukuran maksimal masing-masing file: 5MB</li>
                        </ul>
                      </div>

                      {uploadedDokumen.length === 0 ? (
                        <div className="mt-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={dokumenInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFileUpload(e.target.files);
                              }
                            }}
                            multiple
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 flex flex-col items-center justify-center border-dashed gap-2"
                            onClick={() => dokumenInputRef.current?.click()}
                            disabled={uploadingDokumen}
                          >
                            {uploadingDokumen ? (
                              <>
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Uploading...
                                </span>
                                <Progress
                                  value={progressDokumen}
                                  className="w-full h-2"
                                />
                              </>
                            ) : (
                              <>
                                <FileImage className="h-8 w-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Klik untuk upload semua dokumen (KTP, KK, dan
                                  Surat Keterangan RT)
                                </span>
                              </>
                            )}
                          </Button>
                          {errors.dokumen && (
                            <p className="text-red-500 text-xs mt-2">
                              {errors.dokumen.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {uploadedDokumen.map((url, index) => (
                              <div
                                key={index}
                                className="relative border rounded-md overflow-hidden"
                              >
                                <div className="aspect-[4/3] relative">
                                  <Image
                                    src={url || "/placeholder.svg"}
                                    alt={`Dokumen ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs truncate">
                                  {dokumenLabels[index] ||
                                    `Dokumen ${index + 1}`}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={handleRemoveDokumen}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Hapus Semua Dokumen
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t flex justify-between items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        router.push("/layanan-administrasi/informasi")
                      }
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali
                    </Button>

                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Kirim Pengajuan
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md mb-8">
              <CardHeader>
                <CardTitle>Status Pengajuan Surat</CardTitle>
                <CardDescription>
                  Lihat status pengajuan surat yang telah Anda ajukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPengajuan ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : userPengajuan.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Belum ada pengajuan
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Anda belum mengajukan surat administrasi apapun. Silakan
                      buat pengajuan baru.
                    </p>
                    <Button onClick={() => setView("form")}>
                      <FileText className="mr-2 h-4 w-4" />
                      Buat Pengajuan Baru
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userPengajuan
                      .filter(
                        (item) =>
                          item.status === "rejected" ||
                          item.status === "revision"
                      )
                      .map((item) => (
                        <Alert
                          key={item._id}
                          variant={
                            item.status === "rejected"
                              ? "destructive"
                              : "default"
                          }
                          className={
                            item.status === "revision"
                              ? "bg-blue-50 border-blue-200 text-blue-800"
                              : undefined
                          }
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>
                            {item.status === "rejected"
                              ? "Pengajuan Ditolak"
                              : "Pengajuan Perlu Revisi"}
                          </AlertTitle>
                          <AlertDescription>
                            <div className="mt-2">
                              <p className="font-medium">
                                {item.nama} - Surat{" "}
                                {item.jenisSurat === "domisili"
                                  ? "Domisili"
                                  : "Pindah"}{" "}
                                - {formatDate(item.tanggalPengajuan)}
                              </p>
                              <p className="mt-1">{item.catatan}</p>
                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setView("form");
                                    setActiveTab(
                                      item.jenisSurat as "domisili" | "pindah"
                                    );
                                    setValue(
                                      "jenisSurat",
                                      item.jenisSurat as "domisili" | "pindah"
                                    );
                                    // Pre-fill form with existing data
                                    setValue("nama", item.nama);
                                    setValue("nik", item.nik);
                                    setValue("tempatLahir", item.tempatLahir);
                                    setValue("tanggalLahir", item.tanggalLahir);
                                    setValue("alamat", item.alamat);
                                    setValue("rt", item.rt);
                                    setValue("rw", item.rw);
                                    setValue("desa", item.desa);
                                    setValue("kecamatan", item.kecamatan);
                                    setValue("kabupaten", item.kabupaten);
                                    setValue("teleponWA", item.teleponWA);
                                    setValue("keperluan", item.keperluan);

                                    if (item.jenisSurat === "pindah") {
                                      setValue(
                                        "alamatTujuan",
                                        item.alamatTujuan || ""
                                      );
                                      setValue("rtTujuan", item.rtTujuan || "");
                                      setValue("rwTujuan", item.rwTujuan || "");
                                      setValue(
                                        "desaTujuan",
                                        item.desaTujuan || ""
                                      );
                                      setValue(
                                        "kecamatanTujuan",
                                        item.kecamatanTujuan || ""
                                      );
                                      setValue(
                                        "kabupatenTujuan",
                                        item.kabupatenTujuan || ""
                                      );
                                      setValue(
                                        "alasanPindah",
                                        item.alasanPindah || ""
                                      );
                                    }
                                  }}
                                >
                                  Perbaiki Pengajuan
                                </Button>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}

                    <div className="divide-y">
                      {userPengajuan.map((item) => (
                        <div
                          key={item._id}
                          className="py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{item.nama}</h3>
                                <span className="text-sm text-muted-foreground">
                                  -
                                </span>
                                <h3 className="font-medium">
                                  Surat{" "}
                                  {item.jenisSurat === "domisili"
                                    ? "Domisili"
                                    : "Pindah"}
                                </h3>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Diajukan pada:{" "}
                                {formatDate(item.tanggalPengajuan)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.status === "approved" && (
                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-md text-sm">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    Anda akan dihubungi untuk pengambilan surat
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {item.catatan && (
                            <div className="mt-2 text-sm bg-slate-50 p-3 rounded-md">
                              <p className="font-medium">Catatan:</p>
                              <p>{item.catatan}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informasi Penting
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                Pastikan data yang diisi sudah benar dan sesuai dengan dokumen
                resmi Anda
              </li>
              <li>Dokumen yang diupload harus jelas dan dapat dibaca</li>
              <li>Pengajuan akan diproses dalam waktu 3-5 hari kerja</li>
              <li>
                Anda akan dihubungi melalui WhatsApp untuk konfirmasi dan
                informasi pengambilan surat
              </li>
              <li>
                Jika ada pertanyaan, silakan hubungi kantor desa pada jam kerja
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
