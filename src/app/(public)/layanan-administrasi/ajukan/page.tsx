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
  RefreshCw,
  Search,
  FileQuestion,
} from "lucide-react";
import {
  createPengajuanSurat,
  getJenisSurat,
  getUserPengajuan,
} from "./actions";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema untuk validasi form umum
const pengajuanUmumSchema = z.object({
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  teleponWA: z.string().min(10, "Nomor telepon WA minimal 10 digit"),
  dokumen: z.array(z.string()).min(1, "Minimal satu dokumen wajib diupload"),
});

// Schema untuk validasi form domisili
const pengajuanDomisiliSchema = z.object({
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),

  // Data pemohon
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  tempatLahir: z.string().min(3, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),

  // Alamat
  alamat: z.string().min(5, "Alamat wajib diisi minimal 5 karakter"),
  rt: z.string().min(1, "RT wajib diisi"),
  rw: z.string().min(1, "RW wajib diisi"),
  desa: z.string().min(1, "Desa wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kabupaten: z.string().min(1, "Kabupaten wajib diisi"),

  // Kontak
  teleponWA: z.string().min(10, "Nomor telepon WA minimal 10 digit"),

  // Keperluan
  keperluan: z.string().min(10, "Keperluan wajib diisi minimal 10 karakter"),

  // File uploads
  dokumen: z.array(z.string()).min(3, "Semua dokumen wajib diupload"),
});

// Schema untuk validasi form pindah
const pengajuanPindahSchema = z.object({
  jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),

  // Data pemohon
  nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
  tempatLahir: z.string().min(3, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),

  // Alamat
  alamat: z.string().min(5, "Alamat wajib diisi minimal 5 karakter"),
  rt: z.string().min(1, "RT wajib diisi"),
  rw: z.string().min(1, "RW wajib diisi"),
  desa: z.string().min(1, "Desa wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kabupaten: z.string().min(1, "Kabupaten wajib diisi"),

  // Kontak
  teleponWA: z.string().min(10, "Nomor telepon WA minimal 10 digit"),

  // Keperluan
  keperluan: z.string().min(10, "Keperluan wajib diisi minimal 10 karakter"),

  // Khusus untuk surat pindah
  alamatTujuan: z.string().min(5, "Alamat tujuan wajib diisi"),
  rtTujuan: z.string().min(1, "RT tujuan wajib diisi"),
  rwTujuan: z.string().min(1, "RW tujuan wajib diisi"),
  desaTujuan: z.string().min(1, "Desa tujuan wajib diisi"),
  kecamatanTujuan: z.string().min(1, "Kecamatan tujuan wajib diisi"),
  kabupatenTujuan: z.string().min(1, "Kabupaten tujuan wajib diisi"),
  alasanPindah: z.string().min(10, "Alasan pindah wajib diisi"),

  // File uploads
  dokumen: z.array(z.string()).min(3, "Semua dokumen wajib diupload"),
});

export default function PengajuanSuratPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [view, setView] = useState<"form" | "status">("form");
  const [userPengajuan, setUserPengajuan] = useState<any[]>([]);
  const [isLoadingPengajuan, setIsLoadingPengajuan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchNik, setSearchNik] = useState("");
  const [searchTelepon, setSearchTelepon] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [jenisSuratList, setJenisSuratList] = useState<any[]>([]);
  const [isLoadingJenisSurat, setIsLoadingJenisSurat] = useState(false);
  const [selectedJenisSurat, setSelectedJenisSurat] = useState<any>(null);
  const [formType, setFormType] = useState<"umum" | "domisili" | "pindah">(
    "umum"
  );
  const router = useRouter();

  // State untuk file uploads
  const [uploadingDokumen, setUploadingDokumen] = useState(false);
  const [progressDokumen, setProgressDokumen] = useState(0);
  const [uploadedDokumen, setUploadedDokumen] = useState<string[]>([]);
  const [dokumenLabels, setDokumenLabels] = useState<string[]>([]);

  // Ref untuk file input
  const dokumenInputRef = useRef<HTMLInputElement>(null);

  // Form untuk jenis surat umum
  const {
    register: registerUmum,
    handleSubmit: handleSubmitUmum,
    formState: { errors: errorsUmum },
    setValue: setValueUmum,
    watch: watchUmum,
    reset: resetUmum,
  } = useForm<z.infer<typeof pengajuanUmumSchema>>({
    resolver: zodResolver(pengajuanUmumSchema),
    defaultValues: {
      dokumen: [],
    },
  });

  // Form untuk jenis surat domisili
  const {
    register: registerDomisili,
    handleSubmit: handleSubmitDomisili,
    formState: { errors: errorsDomisili },
    setValue: setValueDomisili,
    watch: watchDomisili,
    reset: resetDomisili,
  } = useForm<z.infer<typeof pengajuanDomisiliSchema>>({
    resolver: zodResolver(pengajuanDomisiliSchema),
    defaultValues: {
      dokumen: [],
    },
  });

  // Form untuk jenis surat pindah
  const {
    register: registerPindah,
    handleSubmit: handleSubmitPindah,
    formState: { errors: errorsPindah },
    setValue: setValuePindah,
    watch: watchPindah,
    reset: resetPindah,
  } = useForm<z.infer<typeof pengajuanPindahSchema>>({
    resolver: zodResolver(pengajuanPindahSchema),
    defaultValues: {
      dokumen: [],
    },
  });

  const dokumenUmum = watchUmum("dokumen");
  const dokumenDomisili = watchDomisili("dokumen");
  const dokumenPindah = watchPindah("dokumen");
  const nikUmum = watchUmum("nik");
  const teleponWAUmum = watchUmum("teleponWA");
  const nikDomisili = watchDomisili("nik");
  const teleponWADomisili = watchDomisili("teleponWA");
  const nikPindah = watchPindah("nik");
  const teleponWAPindah = watchPindah("teleponWA");

  // Fetch jenis surat
  useEffect(() => {
    const fetchJenisSurat = async () => {
      setIsLoadingJenisSurat(true);
      try {
        const result = await getJenisSurat();
        if (result.success) {
          setJenisSuratList(result.data);
        } else {
          console.error("Failed to fetch jenis surat:", result.message);
          toast.error("Gagal mengambil data jenis surat");
        }
      } catch (error) {
        console.error("Error fetching jenis surat:", error);
        toast.error("Terjadi kesalahan saat mengambil data jenis surat");
      } finally {
        setIsLoadingJenisSurat(false);
      }
    };

    fetchJenisSurat();
  }, []);

  // Fetch user pengajuan
  const fetchUserPengajuan = async (identifiers?: {
    nik?: string;
    teleponWA?: string;
  }) => {
    setIsLoadingPengajuan(true);
    setError(null);
    setIsSearching(!!identifiers);

    try {
      const result = await getUserPengajuan(identifiers);
      if (result.success) {
        setUserPengajuan(result.data);

        if (result.data.length === 0 && identifiers) {
          toast.info("Tidak ditemukan pengajuan dengan data tersebut");
        }
      } else {
        console.error("Failed to fetch user pengajuan:", result.message);
        setError(result.message || "Gagal mengambil data pengajuan");
      }
    } catch (error) {
      console.error("Error fetching user pengajuan:", error);
      setError("Terjadi kesalahan saat mengambil data pengajuan");
    } finally {
      setIsLoadingPengajuan(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (view === "status") {
      fetchUserPengajuan();
    }
  }, [view]);

  // Handle jenis surat change
  const handleJenisSuratChange = (id: string) => {
    const selected = jenisSuratList.find((item) => item._id === id);
    setSelectedJenisSurat(selected);

    if (selected) {
      setFormType(selected.tipeForm);

      // Set jenisSuratId untuk semua form
      setValueUmum("jenisSuratId", id);
      setValueDomisili("jenisSuratId", id);
      setValuePindah("jenisSuratId", id);
    }
  };

  // Handle search
  const handleSearch = () => {
    const identifiers: { nik?: string; teleponWA?: string } = {};

    if (searchNik.trim()) {
      identifiers.nik = searchNik.trim();
    }

    if (searchTelepon.trim()) {
      identifiers.teleponWA = searchTelepon.trim();
    }

    if (Object.keys(identifiers).length === 0) {
      toast.error("Masukkan NIK atau nomor telepon untuk mencari");
      return;
    }

    fetchUserPengajuan(identifiers);
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

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

      // Update form values based on form type
      if (formType === "umum") {
        setValueUmum("dokumen", uploadedUrls);
      } else if (formType === "domisili") {
        setValueDomisili("dokumen", uploadedUrls);
      } else if (formType === "pindah") {
        setValuePindah("dokumen", uploadedUrls);
      }

      toast.success("Dokumen berhasil diupload");
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

    // Clear form values based on form type
    if (formType === "umum") {
      setValueUmum("dokumen", []);
    } else if (formType === "domisili") {
      setValueDomisili("dokumen", []);
    } else if (formType === "pindah") {
      setValuePindah("dokumen", []);
    }
  };

  // Submit handler for umum form
  const onSubmitUmum = async (data: z.infer<typeof pengajuanUmumSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await createPengajuanSurat(data);
      if (result.success) {
        setIsSuccess(true);
        toast.success("Pengajuan surat berhasil dikirim!");
        resetUmum();
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

  // Submit handler for domisili form
  const onSubmitDomisili = async (
    data: z.infer<typeof pengajuanDomisiliSchema>
  ) => {
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
        resetDomisili();
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

  // Submit handler for pindah form
  const onSubmitPindah = async (
    data: z.infer<typeof pengajuanPindahSchema>
  ) => {
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
        resetPindah();
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

  // Get current NIK and teleponWA based on form type
  const getCurrentNik = () => {
    if (formType === "umum") return nikUmum;
    if (formType === "domisili") return nikDomisili;
    return nikPindah;
  };

  const getCurrentTeleponWA = () => {
    if (formType === "umum") return teleponWAUmum;
    if (formType === "domisili") return teleponWADomisili;
    return teleponWAPindah;
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
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm mb-6">
                  <p className="font-medium mb-2">Informasi Penting:</p>
                  <p>
                    Untuk melihat status pengajuan, silakan gunakan NIK{" "}
                    <strong>{getCurrentNik()}</strong> atau nomor telepon{" "}
                    <strong>{getCurrentTeleponWA()}</strong> pada halaman Status
                    Pengajuan.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4 pt-2">
                <Button onClick={() => router.push("/layanan-administrasi")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Layanan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setView("status");
                    setSearchNik(getCurrentNik() || "");
                    setSearchTelepon(getCurrentTeleponWA() || "");
                    setTimeout(() => {
                      handleSearch();
                    }, 500);
                  }}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Lihat Status
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
                {isLoadingJenisSurat ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : jenisSuratList.length === 0 ? (
                  <div className="text-center py-8">
                    <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Belum ada jenis surat
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Belum ada jenis surat yang tersedia. Silakan hubungi admin
                      untuk menambahkan jenis surat.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <Label
                        htmlFor="jenisSurat"
                        className="text-base font-medium"
                      >
                        Pilih Jenis Surat{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select onValueChange={handleJenisSuratChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Pilih jenis surat" />
                        </SelectTrigger>
                        <SelectContent>
                          {jenisSuratList.map((item) => (
                            <SelectItem key={item._id} value={item._id}>
                              {item.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedJenisSurat && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-base font-medium text-blue-800 mb-2">
                          {selectedJenisSurat.nama}
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                          {selectedJenisSurat.deskripsi}
                        </p>
                        {selectedJenisSurat.persyaratan && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-blue-800">
                              Persyaratan:
                            </p>
                            <p className="text-sm text-blue-700">
                              {selectedJenisSurat.persyaratan}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedJenisSurat && (
                      <>
                        {/* Form Umum */}
                        {formType === "umum" && (
                          <form
                            onSubmit={handleSubmitUmum(onSubmitUmum)}
                            className="space-y-6"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <User className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Data Pemohon
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nama">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="nama" {...registerUmum("nama")} />
                                  {errorsUmum.nama && (
                                    <p className="text-red-500 text-xs">
                                      {errorsUmum.nama.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="nik">
                                    NIK <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="nik" {...registerUmum("nik")} />
                                  {errorsUmum.nik && (
                                    <p className="text-red-500 text-xs">
                                      {errorsUmum.nik.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="space-y-2">
                                  <Label htmlFor="teleponWA">
                                    Nomor Telepon WhatsApp{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="teleponWA"
                                    {...registerUmum("teleponWA")}
                                    placeholder="Contoh: 081234567890"
                                  />
                                  {errorsUmum.teleponWA && (
                                    <p className="text-red-500 text-xs">
                                      {errorsUmum.teleponWA.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Upload Dokumen */}
                            <div className="pt-6 border-t">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Upload Dokumen
                                </h3>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm">
                                  <p className="font-medium mb-2">
                                    Petunjuk Upload Dokumen:
                                  </p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                      Upload dokumen yang diperlukan sesuai
                                      persyaratan
                                    </li>
                                    <li>
                                      Pastikan semua dokumen terlihat jelas dan
                                      dapat dibaca
                                    </li>
                                    <li>
                                      Format file yang diperbolehkan: JPG, PNG,
                                      atau JPEG
                                    </li>
                                    <li>
                                      Ukuran maksimal masing-masing file: 5MB
                                    </li>
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
                                        if (
                                          e.target.files &&
                                          e.target.files.length > 0
                                        ) {
                                          handleFileUpload(e.target.files);
                                        }
                                      }}
                                      multiple
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full h-32 flex flex-col items-center justify-center border-dashed gap-2"
                                      onClick={() =>
                                        dokumenInputRef.current?.click()
                                      }
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
                                            Klik untuk upload dokumen
                                          </span>
                                        </>
                                      )}
                                    </Button>
                                    {errorsUmum.dokumen && (
                                      <p className="text-red-500 text-xs mt-2">
                                        {errorsUmum.dokumen.message}
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
                                  router.push("/layanan-administrasi")
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
                        )}

                        {/* Form Domisili */}
                        {formType === "domisili" && (
                          <form
                            onSubmit={handleSubmitDomisili(onSubmitDomisili)}
                            className="space-y-6"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <User className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Data Pemohon
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nama">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="nama"
                                    {...registerDomisili("nama")}
                                  />
                                  {errorsDomisili.nama && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.nama.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="nik">
                                    NIK <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="nik"
                                    {...registerDomisili("nik")}
                                  />
                                  {errorsDomisili.nik && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.nik.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="tempatLahir">
                                    Tempat Lahir{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="tempatLahir"
                                    {...registerDomisili("tempatLahir")}
                                  />
                                  {errorsDomisili.tempatLahir && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.tempatLahir.message}
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
                                    {...registerDomisili("tanggalLahir")}
                                  />
                                  {errorsDomisili.tanggalLahir && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.tanggalLahir.message}
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
                                  <Textarea
                                    id="alamat"
                                    {...registerDomisili("alamat")}
                                  />
                                  {errorsDomisili.alamat && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.alamat.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rt">
                                    RT <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="rt" {...registerDomisili("rt")} />
                                  {errorsDomisili.rt && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.rt.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rw">
                                    RW <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="rw" {...registerDomisili("rw")} />
                                  {errorsDomisili.rw && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.rw.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="desa">
                                    Desa <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="desa"
                                    {...registerDomisili("desa")}
                                  />
                                  {errorsDomisili.desa && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.desa.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="kecamatan">
                                    Kecamatan{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kecamatan"
                                    {...registerDomisili("kecamatan")}
                                  />
                                  {errorsDomisili.kecamatan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.kecamatan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="kabupaten">
                                    Kabupaten{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kabupaten"
                                    {...registerDomisili("kabupaten")}
                                  />
                                  {errorsDomisili.kabupaten && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.kabupaten.message}
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
                                    {...registerDomisili("teleponWA")}
                                    placeholder="Contoh: 081234567890"
                                  />
                                  {errorsDomisili.teleponWA && (
                                    <p className="text-red-500 text-xs">
                                      {errorsDomisili.teleponWA.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-8 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <FileCheck className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Informasi Surat Domisili
                                </h3>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="keperluan">
                                  Keperluan{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                  id="keperluan"
                                  placeholder="Jelaskan keperluan pembuatan surat domisili"
                                  {...registerDomisili("keperluan")}
                                  className="min-h-[100px]"
                                />
                                {errorsDomisili.keperluan && (
                                  <p className="text-red-500 text-xs">
                                    {errorsDomisili.keperluan.message}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Upload Dokumen */}
                            <div className="pt-6 border-t">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Upload Dokumen
                                </h3>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm">
                                  <p className="font-medium mb-2">
                                    Petunjuk Upload Dokumen:
                                  </p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                      Upload 3 dokumen sekaligus: KTP, Kartu
                                      Keluarga, dan Surat Keterangan RT
                                    </li>
                                    <li>
                                      Pastikan semua dokumen terlihat jelas dan
                                      dapat dibaca
                                    </li>
                                    <li>
                                      Format file yang diperbolehkan: JPG, PNG,
                                      atau JPEG
                                    </li>
                                    <li>
                                      Ukuran maksimal masing-masing file: 5MB
                                    </li>
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
                                        if (
                                          e.target.files &&
                                          e.target.files.length > 0
                                        ) {
                                          handleFileUpload(e.target.files);
                                        }
                                      }}
                                      multiple
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full h-32 flex flex-col items-center justify-center border-dashed gap-2"
                                      onClick={() =>
                                        dokumenInputRef.current?.click()
                                      }
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
                                            Klik untuk upload semua dokumen
                                            (KTP, KK, dan Surat Keterangan RT)
                                          </span>
                                        </>
                                      )}
                                    </Button>
                                    {errorsDomisili.dokumen && (
                                      <p className="text-red-500 text-xs mt-2">
                                        {errorsDomisili.dokumen.message}
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
                                  router.push("/layanan-administrasi")
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
                        )}

                        {/* Form Pindah */}
                        {formType === "pindah" && (
                          <form
                            onSubmit={handleSubmitPindah(onSubmitPindah)}
                            className="space-y-6"
                          >
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <User className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Data Pemohon
                                </h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="nama">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="nama"
                                    {...registerPindah("nama")}
                                  />
                                  {errorsPindah.nama && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.nama.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="nik">
                                    NIK <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="nik" {...registerPindah("nik")} />
                                  {errorsPindah.nik && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.nik.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="tempatLahir">
                                    Tempat Lahir{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="tempatLahir"
                                    {...registerPindah("tempatLahir")}
                                  />
                                  {errorsPindah.tempatLahir && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.tempatLahir.message}
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
                                    {...registerPindah("tanggalLahir")}
                                  />
                                  {errorsPindah.tanggalLahir && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.tanggalLahir.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-8 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <MapPin className="h-5 w-5" />
                                </div>
                                <h4 className="text-lg font-medium">
                                  Alamat Asal
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="alamat">
                                    Alamat Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="alamat"
                                    {...registerPindah("alamat")}
                                  />
                                  {errorsPindah.alamat && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.alamat.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rt">
                                    RT <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="rt" {...registerPindah("rt")} />
                                  {errorsPindah.rt && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.rt.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rw">
                                    RW <span className="text-red-500">*</span>
                                  </Label>
                                  <Input id="rw" {...registerPindah("rw")} />
                                  {errorsPindah.rw && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.rw.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="desa">
                                    Desa <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="desa"
                                    {...registerPindah("desa")}
                                  />
                                  {errorsPindah.desa && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.desa.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="kecamatan">
                                    Kecamatan{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kecamatan"
                                    {...registerPindah("kecamatan")}
                                  />
                                  {errorsPindah.kecamatan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.kecamatan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="kabupaten">
                                    Kabupaten{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kabupaten"
                                    {...registerPindah("kabupaten")}
                                  />
                                  {errorsPindah.kabupaten && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.kabupaten.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-8 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <MapPin className="h-5 w-5" />
                                </div>
                                <h4 className="text-lg font-medium">
                                  Alamat Tujuan
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="alamatTujuan">
                                    Alamat Lengkap Tujuan{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="alamatTujuan"
                                    {...registerPindah("alamatTujuan")}
                                  />
                                  {errorsPindah.alamatTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.alamatTujuan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rtTujuan">
                                    RT <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="rtTujuan"
                                    {...registerPindah("rtTujuan")}
                                  />
                                  {errorsPindah.rtTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.rtTujuan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="rwTujuan">
                                    RW <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="rwTujuan"
                                    {...registerPindah("rwTujuan")}
                                  />
                                  {errorsPindah.rwTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.rwTujuan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="desaTujuan">
                                    Desa <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="desaTujuan"
                                    {...registerPindah("desaTujuan")}
                                  />
                                  {errorsPindah.desaTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.desaTujuan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="kecamatanTujuan">
                                    Kecamatan{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kecamatanTujuan"
                                    {...registerPindah("kecamatanTujuan")}
                                  />
                                  {errorsPindah.kecamatanTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.kecamatanTujuan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor="kabupatenTujuan">
                                    Kabupaten{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="kabupatenTujuan"
                                    {...registerPindah("kabupatenTujuan")}
                                  />
                                  {errorsPindah.kabupatenTujuan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.kabupatenTujuan.message}
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
                                    {...registerPindah("teleponWA")}
                                    placeholder="Contoh: 081234567890"
                                  />
                                  {errorsPindah.teleponWA && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.teleponWA.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 mt-8 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <FileCheck className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Informasi Surat Pindah
                                </h3>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="keperluan">
                                    Keperluan{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="keperluan"
                                    placeholder="Jelaskan keperluan pembuatan surat pindah"
                                    {...registerPindah("keperluan")}
                                  />
                                  {errorsPindah.keperluan && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.keperluan.message}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="alasanPindah">
                                    Alasan Pindah{" "}
                                    <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="alasanPindah"
                                    placeholder="Jelaskan alasan kepindahan"
                                    {...registerPindah("alasanPindah")}
                                  />
                                  {errorsPindah.alasanPindah && (
                                    <p className="text-red-500 text-xs">
                                      {errorsPindah.alasanPindah.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Upload Dokumen */}
                            <div className="pt-6 border-t">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                  <Upload className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-medium">
                                  Upload Dokumen
                                </h3>
                              </div>

                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 text-sm">
                                  <p className="font-medium mb-2">
                                    Petunjuk Upload Dokumen:
                                  </p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                      Upload 3 dokumen sekaligus: KTP, Kartu
                                      Keluarga, dan Surat Keterangan RT
                                    </li>
                                    <li>
                                      Pastikan semua dokumen terlihat jelas dan
                                      dapat dibaca
                                    </li>
                                    <li>
                                      Format file yang diperbolehkan: JPG, PNG,
                                      atau JPEG
                                    </li>
                                    <li>
                                      Ukuran maksimal masing-masing file: 5MB
                                    </li>
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
                                        if (
                                          e.target.files &&
                                          e.target.files.length > 0
                                        ) {
                                          handleFileUpload(e.target.files);
                                        }
                                      }}
                                      multiple
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full h-32 flex flex-col items-center justify-center border-dashed gap-2"
                                      onClick={() =>
                                        dokumenInputRef.current?.click()
                                      }
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
                                            Klik untuk upload semua dokumen
                                            (KTP, KK, dan Surat Keterangan RT)
                                          </span>
                                        </>
                                      )}
                                    </Button>
                                    {errorsPindah.dokumen && (
                                      <p className="text-red-500 text-xs mt-2">
                                        {errorsPindah.dokumen.message}
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
                                  router.push("/layanan-administrasi")
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
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Status Pengajuan Surat</CardTitle>
                  <CardDescription>
                    Lihat status pengajuan surat yang telah Anda ajukan
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUserPengajuan()}
                  disabled={isLoadingPengajuan}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      isLoadingPengajuan ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="text-sm font-medium mb-3">
                    Cari Pengajuan Anda
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="searchNik" className="text-sm">
                        NIK
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="searchNik"
                          placeholder="Masukkan NIK"
                          value={searchNik}
                          onChange={(e) => setSearchNik(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="searchTelepon" className="text-sm">
                        Nomor Telepon
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="searchTelepon"
                          placeholder="Masukkan nomor telepon"
                          value={searchTelepon}
                          onChange={(e) => setSearchTelepon(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || (!searchNik && !searchTelepon)}
                    className="w-full"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mencari...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Cari Pengajuan
                      </>
                    )}
                  </Button>
                </div>

                {isLoadingPengajuan ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <p>Memuat data pengajuan...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Terjadi Kesalahan
                    </h3>
                    <p className="text-muted-foreground text-center mb-6">
                      {error}
                    </p>
                    <Button onClick={() => fetchUserPengajuan()}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Coba Lagi
                    </Button>
                  </div>
                ) : userPengajuan.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {isSearching
                        ? "Tidak ditemukan pengajuan"
                        : "Belum ada pengajuan"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {isSearching
                        ? "Tidak ditemukan pengajuan dengan data yang Anda masukkan. Pastikan NIK atau nomor telepon sudah benar."
                        : "Anda belum mengajukan surat administrasi apapun. Silakan buat pengajuan baru."}
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
                                {item.nama} -{" "}
                                {item.jenisSurat?.nama || item.kodeSurat} -{" "}
                                {formatDate(item.tanggalPengajuan)}
                              </p>
                              <p className="mt-1">{item.catatan}</p>
                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setView("form");
                                    // Find the jenis surat in the list
                                    const jenisSurat = jenisSuratList.find(
                                      (js) =>
                                        js._id === item.jenisSurat?._id ||
                                        js.kode === item.kodeSurat
                                    );
                                    if (jenisSurat) {
                                      handleJenisSuratChange(jenisSurat._id);
                                    }
                                  }}
                                >
                                  Buat Pengajuan Baru
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
                                  {item.jenisSurat?.nama || item.kodeSurat}
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
