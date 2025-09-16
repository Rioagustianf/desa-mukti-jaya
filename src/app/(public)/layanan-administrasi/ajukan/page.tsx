"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  FileCheck,
  Info,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { letterSchemaMap, documentRequirements } from "@/types/letter-forms";
import {
  LetterFormRenderer,
  getLetterName,
  isValidLetterCode,
  type LetterCode,
} from "@/components/forms/letter-form-renderer";

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
  const [documentValues, setDocumentValues] = useState<Record<string, string>>(
    {}
  );
  const [lastSubmittedData, setLastSubmittedData] = useState<{
    nik?: string;
    teleponWA?: string;
  }>({});

  const router = useRouter();

  // Default form schema that allows additional fields
  const defaultSchema = z
    .object({
      jenisSuratId: z.string().min(1, "Jenis surat wajib dipilih"),
    })
    .passthrough(); // Allow additional fields to pass through

  const form = useForm({
    resolver: zodResolver(defaultSchema),
    mode: "onChange",
    defaultValues: {
      jenisSuratId: "",
    },
  });

  const { handleSubmit, reset, setValue, watch } = form;
  const watchedValues = watch();

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

  // Handle jenis surat change
  const handleJenisSuratChange = (id: string) => {
    const selected = jenisSuratList.find((item) => item._id === id);
    setSelectedJenisSurat(selected);
    setDocumentValues({}); // Reset document uploads

    if (selected) {
      // Only set the jenisSuratId, don't reset other fields
      setValue("jenisSuratId", id);
    }
  };

  // Handle document upload change
  const handleDocumentChange = (fieldKey: string, url: string) => {
    setDocumentValues((prev) => ({
      ...prev,
      [fieldKey]: url,
    }));
  };

  // Submit handler with enhanced validation
  const onSubmit = async (data: any) => {
    if (!selectedJenisSurat) {
      toast.error("Pilih jenis surat terlebih dahulu");
      return;
    }

    // Combine all data
    const combinedData = {
      ...data,
      ...documentValues,
    };

    // Validate form data using the appropriate schema
    if (isValidLetterCode(selectedJenisSurat.kode)) {
      // Validate required documents first
      const requiredDocs =
        documentRequirements[
          selectedJenisSurat.kode as keyof typeof documentRequirements
        ];
      const missingDocs =
        requiredDocs?.filter(
          (doc) => doc.required && !documentValues[doc.key]
        ) || [];

      if (missingDocs.length > 0) {
        toast.error(
          `Dokumen berikut wajib diupload: ${missingDocs
            .map((doc) => doc.label)
            .join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Skip client-side schema validation, let server handle it
      setIsSubmitting(true);
      try {
        const result = await createPengajuanSurat(combinedData);

        if (result.success) {
          setIsSuccess(true);
          setLastSubmittedData({
            nik: combinedData.nik,
            teleponWA: combinedData.teleponWA,
          });
          toast.success("Pengajuan surat berhasil dikirim!");
          reset();
          setDocumentValues({});
        } else {
          console.error("Server error:", result.message);
          toast.error(result.message || "Gagal mengirim pengajuan");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Terjadi kesalahan saat mengirim pengajuan");
      }
    } else {
      // Basic validation for required documents
      const requiredDocs =
        documentRequirements[
          selectedJenisSurat.kode as keyof typeof documentRequirements
        ];
      const missingDocs =
        requiredDocs?.filter(
          (doc) => doc.required && !documentValues[doc.key]
        ) || [];

      if (missingDocs.length > 0) {
        toast.error(
          `Dokumen berikut wajib diupload: ${missingDocs
            .map((doc) => doc.label)
            .join(", ")}`
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await createPengajuanSurat(combinedData);
        if (result.success) {
          setIsSuccess(true);
          setLastSubmittedData({
            nik: combinedData.nik,
            teleponWA: combinedData.teleponWA,
          });
          toast.success("Pengajuan surat berhasil dikirim!");
          reset();
          setDocumentValues({});
        } else {
          toast.error(result.message || "Gagal mengirim pengajuan");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Terjadi kesalahan saat mengirim pengajuan");
      }
    }

    setIsSubmitting(false);
  };

  // Success page component
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
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
                    <strong>{lastSubmittedData.nik}</strong> atau nomor telepon{" "}
                    <strong>{lastSubmittedData.teleponWA}</strong> pada halaman
                    Status Pengajuan.
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                  <Button
                    onClick={() =>
                      router.push("/layanan-administrasi/informasi")
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Layanan
                  </Button>
                </div>
              </CardContent>
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
                      Pilih Jenis Surat <span className="text-red-500">*</span>
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
                    </div>
                  )}

                  {selectedJenisSurat &&
                    isValidLetterCode(selectedJenisSurat.kode) && (
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <LetterFormRenderer
                          letterCode={selectedJenisSurat.kode as LetterCode}
                          form={form}
                          documentValues={documentValues}
                          onDocumentChange={handleDocumentChange}
                        />

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
                    )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Information Card */}
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
              <li>
                Semua dokumen wajib harus diupload sebelum dapat mengirim
                pengajuan
              </li>
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
