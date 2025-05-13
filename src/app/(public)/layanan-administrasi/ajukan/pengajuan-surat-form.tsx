"use client";

import { useState } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { createPengajuanSurat } from "./actions";

// Schema untuk validasi form
const pengajuanSchema = z
  .object({
    jenisSurat: z.enum(["domisili", "pindah"]),
    nama: z.string().min(3, "Nama lengkap minimal 3 karakter"),
    nik: z.string().min(16, "NIK harus 16 digit").max(16, "NIK harus 16 digit"),
    tempatLahir: z.string().min(3, "Tempat lahir wajib diisi"),
    tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
    jenisKelamin: z.enum(["laki-laki", "perempuan"]),
    agama: z.string().min(1, "Agama wajib diisi"),
    statusPerkawinan: z.enum([
      "belum_kawin",
      "kawin",
      "cerai_hidup",
      "cerai_mati",
    ]),
    pekerjaan: z.string().min(1, "Pekerjaan wajib diisi"),
    alamat: z.string().min(5, "Alamat wajib diisi minimal 5 karakter"),
    rt: z.string().min(1, "RT wajib diisi"),
    rw: z.string().min(1, "RW wajib diisi"),
    kelurahan: z.string().min(1, "Kelurahan/Desa wajib diisi"),
    kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
    kota: z.string().min(1, "Kota/Kabupaten wajib diisi"),
    provinsi: z.string().min(1, "Provinsi wajib diisi"),
    kodePos: z
      .string()
      .min(5, "Kode pos wajib diisi")
      .max(5, "Kode pos maksimal 5 digit"),
    telepon: z.string().min(10, "Nomor telepon minimal 10 digit"),
    email: z.string().email("Format email tidak valid"),
    keperluan: z.string().min(10, "Keperluan wajib diisi minimal 10 karakter"),
    // Khusus untuk surat pindah
    alamatTujuan: z.string().optional(),
    rtTujuan: z.string().optional(),
    rwTujuan: z.string().optional(),
    kelurahanTujuan: z.string().optional(),
    kecamatanTujuan: z.string().optional(),
    kotaTujuan: z.string().optional(),
    provinsiTujuan: z.string().optional(),
    kodePosTujuan: z.string().optional(),
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
          !!data.kelurahanTujuan &&
          !!data.kecamatanTujuan &&
          !!data.kotaTujuan &&
          !!data.provinsiTujuan &&
          !!data.kodePosTujuan &&
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

export default function PengajuanSuratForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"domisili" | "pindah">("domisili");
  const router = useRouter();

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
      jenisKelamin: "laki-laki",
      statusPerkawinan: "belum_kawin",
    },
  });

  const jenisSurat = watch("jenisSurat");

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "domisili" | "pindah");
    setValue("jenisSurat", value as "domisili" | "pindah");
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createPengajuanSurat(data);
      if (result.success) {
        setIsSuccess(true);
        toast.success("Pengajuan surat berhasil dikirim!");
        reset();
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

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Pengajuan Berhasil!</CardTitle>
          <CardDescription>
            Pengajuan surat Anda telah berhasil dikirim dan akan segera diproses
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Silakan cek status pengajuan Anda secara berkala. Kami akan
            menghubungi Anda melalui email atau telepon yang telah diberikan.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => router.push("/layanan-administrasi")}>
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
            Buat Pengajuan Baru
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Formulir Pengajuan Surat</CardTitle>
        <CardDescription>
          Pilih jenis surat yang ingin diajukan dan isi data dengan lengkap
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
              <TabsTrigger value="domisili" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Surat Domisili
              </TabsTrigger>
              <TabsTrigger value="pindah" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Surat Pindah
              </TabsTrigger>
            </TabsList>

            {/* Data Pemohon - Sama untuk kedua jenis surat */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Data Pemohon</h3>
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
                    <p className="text-red-500 text-xs">{errors.nik.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempatLahir">
                    Tempat Lahir <span className="text-red-500">*</span>
                  </Label>
                  <Input id="tempatLahir" {...register("tempatLahir")} />
                  {errors.tempatLahir && (
                    <p className="text-red-500 text-xs">
                      {errors.tempatLahir.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">
                    Tanggal Lahir <span className="text-red-500">*</span>
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

                <div className="space-y-2">
                  <Label>
                    Jenis Kelamin <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    defaultValue="laki-laki"
                    onValueChange={(value) =>
                      setValue(
                        "jenisKelamin",
                        value as "laki-laki" | "perempuan"
                      )
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="laki-laki" id="laki-laki" />
                      <Label htmlFor="laki-laki">Laki-laki</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="perempuan" id="perempuan" />
                      <Label htmlFor="perempuan">Perempuan</Label>
                    </div>
                  </RadioGroup>
                  {errors.jenisKelamin && (
                    <p className="text-red-500 text-xs">
                      {errors.jenisKelamin.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agama">
                    Agama <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("agama", value)}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="islam">Islam</SelectItem>
                      <SelectItem value="kristen">Kristen</SelectItem>
                      <SelectItem value="katolik">Katolik</SelectItem>
                      <SelectItem value="hindu">Hindu</SelectItem>
                      <SelectItem value="buddha">Buddha</SelectItem>
                      <SelectItem value="konghucu">Konghucu</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.agama && (
                    <p className="text-red-500 text-xs">
                      {errors.agama.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusPerkawinan">
                    Status Perkawinan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("statusPerkawinan", value as any)
                    }
                    defaultValue="belum_kawin"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="belum_kawin">Belum Kawin</SelectItem>
                      <SelectItem value="kawin">Kawin</SelectItem>
                      <SelectItem value="cerai_hidup">Cerai Hidup</SelectItem>
                      <SelectItem value="cerai_mati">Cerai Mati</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.statusPerkawinan && (
                    <p className="text-red-500 text-xs">
                      {errors.statusPerkawinan.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pekerjaan">
                    Pekerjaan <span className="text-red-500">*</span>
                  </Label>
                  <Input id="pekerjaan" {...register("pekerjaan")} />
                  {errors.pekerjaan && (
                    <p className="text-red-500 text-xs">
                      {errors.pekerjaan.message}
                    </p>
                  )}
                </div>
              </div>

              <h4 className="text-md font-medium mt-6 mb-3">Alamat</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">
                    Alamat Lengkap <span className="text-red-500">*</span>
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
                    <p className="text-red-500 text-xs">{errors.rt.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rw">
                    RW <span className="text-red-500">*</span>
                  </Label>
                  <Input id="rw" {...register("rw")} />
                  {errors.rw && (
                    <p className="text-red-500 text-xs">{errors.rw.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kelurahan">
                    Kelurahan/Desa <span className="text-red-500">*</span>
                  </Label>
                  <Input id="kelurahan" {...register("kelurahan")} />
                  {errors.kelurahan && (
                    <p className="text-red-500 text-xs">
                      {errors.kelurahan.message}
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

                <div className="space-y-2">
                  <Label htmlFor="kota">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </Label>
                  <Input id="kota" {...register("kota")} />
                  {errors.kota && (
                    <p className="text-red-500 text-xs">
                      {errors.kota.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provinsi">
                    Provinsi <span className="text-red-500">*</span>
                  </Label>
                  <Input id="provinsi" {...register("provinsi")} />
                  {errors.provinsi && (
                    <p className="text-red-500 text-xs">
                      {errors.provinsi.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kodePos">
                    Kode Pos <span className="text-red-500">*</span>
                  </Label>
                  <Input id="kodePos" {...register("kodePos")} />
                  {errors.kodePos && (
                    <p className="text-red-500 text-xs">
                      {errors.kodePos.message}
                    </p>
                  )}
                </div>
              </div>

              <h4 className="text-md font-medium mt-6 mb-3">Kontak</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telepon">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <Input id="telepon" {...register("telepon")} />
                  {errors.telepon && (
                    <p className="text-red-500 text-xs">
                      {errors.telepon.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-red-500 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Konten khusus untuk masing-masing jenis surat */}
            <TabsContent value="domisili" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keperluan">
                  Keperluan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="keperluan"
                  placeholder="Jelaskan keperluan pembuatan surat domisili"
                  {...register("keperluan")}
                />
                {errors.keperluan && (
                  <p className="text-red-500 text-xs">
                    {errors.keperluan.message}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pindah" className="mt-6 space-y-6">
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

              <h4 className="text-md font-medium mt-6 mb-3">Alamat Tujuan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamatTujuan">
                    Alamat Lengkap Tujuan{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea id="alamatTujuan" {...register("alamatTujuan")} />
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
                  <Label htmlFor="kelurahanTujuan">
                    Kelurahan/Desa <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="kelurahanTujuan"
                    {...register("kelurahanTujuan")}
                  />
                  {errors.kelurahanTujuan && (
                    <p className="text-red-500 text-xs">
                      {errors.kelurahanTujuan.message}
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

                <div className="space-y-2">
                  <Label htmlFor="kotaTujuan">
                    Kota/Kabupaten <span className="text-red-500">*</span>
                  </Label>
                  <Input id="kotaTujuan" {...register("kotaTujuan")} />
                  {errors.kotaTujuan && (
                    <p className="text-red-500 text-xs">
                      {errors.kotaTujuan.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provinsiTujuan">
                    Provinsi <span className="text-red-500">*</span>
                  </Label>
                  <Input id="provinsiTujuan" {...register("provinsiTujuan")} />
                  {errors.provinsiTujuan && (
                    <p className="text-red-500 text-xs">
                      {errors.provinsiTujuan.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kodePosTujuan">
                    Kode Pos <span className="text-red-500">*</span>
                  </Label>
                  <Input id="kodePosTujuan" {...register("kodePosTujuan")} />
                  {errors.kodePosTujuan && (
                    <p className="text-red-500 text-xs">
                      {errors.kodePosTujuan.message}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kirim Pengajuan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
