"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiDocumentUpload } from "@/components/ui/document-upload";
import { documentRequirements } from "@/types/letter-forms";
import {
  User,
  MapPin,
  FileText,
  Home,
  Building,
  Users,
  Calendar,
  Baby,
} from "lucide-react";

// Base form field component
interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "date" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  form: UseFormReturn<any>;
  className?: string;
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  options,
  form,
  className = "",
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const error = errors[name];

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea
          id={name}
          placeholder={placeholder}
          {...register(name)}
          className={error ? "border-red-500" : ""}
        />
      ) : type === "select" && options ? (
        <Select
          onValueChange={(value) => setValue(name, value)}
          value={watch(name) || ""}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={error ? "border-red-500" : ""}
        />
      )}

      {error && (
        <p className="text-red-500 text-xs">{error.message as string}</p>
      )}
    </div>
  );
}

// Section header component
function FormSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// === 1. SURAT KETERANGAN DOMISILI ===
export function SuratDomisiliForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Data Pemohon */}
      <FormSection title="Data Pemohon" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Lengkap" name="nama" required form={form} />
          <FormField
            label="NIK"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Tempat Lahir"
            name="tempatLahir"
            required
            form={form}
          />
          <FormField
            label="Tanggal Lahir"
            name="tanggalLahir"
            type="date"
            required
            form={form}
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Alamat */}
      <FormSection title="Alamat" icon={MapPin}>
        <div className="space-y-4">
          <FormField
            label="Alamat Sekarang"
            name="alamat"
            type="textarea"
            required
            form={form}
            placeholder="Alamat lengkap tempat tinggal saat ini"
          />
          <FormField
            label="Alamat Asal"
            name="alamatAsal"
            type="textarea"
            required
            form={form}
            placeholder="Alamat asal sebelum pindah"
          />
        </div>
      </FormSection>

      {/* Keperluan */}
      <FormSection title="Keperluan" icon={FileText}>
        <FormField
          label="Keperluan Surat"
          name="keperluan"
          type="textarea"
          required
          form={form}
          placeholder="Jelaskan untuk keperluan apa surat ini diperlukan (minimal 10 karakter)"
        />
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKD}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 2. SURAT KETERANGAN USAHA (SKU) ===
export function SuratUsahaForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Data Pemohon */}
      <FormSection title="Data Pemohon" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Lengkap" name="nama" required form={form} />
          <FormField
            label="NIK"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Alamat Pemohon"
            name="alamat"
            type="textarea"
            required
            form={form}
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Usaha */}
      <FormSection title="Data Usaha" icon={Building}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Usaha" name="namaUsaha" required form={form} />
          <FormField
            label="Jenis Usaha"
            name="jenisUsaha"
            required
            form={form}
            placeholder="Contoh: Warung Makan, Toko Kelontong"
          />
          <div className="md:col-span-2">
            <FormField
              label="Alamat Usaha"
              name="alamatUsaha"
              type="textarea"
              required
              form={form}
            />
          </div>
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKU}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 3. SURAT KETERANGAN TIDAK MAMPU (SKTM) ===
export function SuratTidakMampuForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Data Pemohon */}
      <FormSection title="Data Pemohon/Anak" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nama Lengkap Pemohon/Anak"
            name="nama"
            required
            form={form}
          />
          <FormField
            label="NIK"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Alamat"
            name="alamat"
            type="textarea"
            required
            form={form}
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Keperluan */}
      <FormSection title="Keperluan" icon={FileText}>
        <FormField
          label="Keperluan (beasiswa, kesehatan, dll)"
          name="keperluan"
          type="textarea"
          required
          form={form}
          placeholder="Jelaskan untuk keperluan apa surat ini diperlukan (contoh: beasiswa, biaya pengobatan, dll)"
        />
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKTM}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 4. SURAT KETERANGAN BELUM MENIKAH ===
export function SuratBelumMenikahForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Data Pemohon */}
      <FormSection title="Data Pemohon" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Lengkap" name="nama" required form={form} />
          <FormField
            label="NIK"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Tempat Lahir"
            name="tempatLahir"
            required
            form={form}
          />
          <FormField
            label="Tanggal Lahir"
            name="tanggalLahir"
            type="date"
            required
            form={form}
          />
          <FormField
            label="Alamat"
            name="alamat"
            type="textarea"
            required
            form={form}
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKBM}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 5. SURAT KETERANGAN KEMATIAN ===
export function SuratKematianForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Data Pelapor */}
      <FormSection title="Data Pelapor" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nama Pelapor"
            name="namaPelapor"
            required
            form={form}
          />
          <FormField
            label="NIK Pelapor"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Hubungan dengan Almarhum"
            name="hubunganPelapor"
            required
            form={form}
            placeholder="Contoh: Anak, Istri/Suami, Saudara"
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Almarhum */}
      <FormSection title="Data Almarhum/Almarhumah" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nama Almarhum/Almarhumah"
            name="namaAlmarhum"
            required
            form={form}
          />
          <FormField
            label="NIK Almarhum"
            name="nikAlmarhum"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Tempat Lahir"
            name="tempatLahirAlmarhum"
            required
            form={form}
          />
          <FormField
            label="Tanggal Lahir"
            name="tanggalLahirAlmarhum"
            type="date"
            required
            form={form}
          />
          <FormField
            label="Tanggal Meninggal"
            name="tanggalMeninggal"
            type="date"
            required
            form={form}
          />
          <div className="md:col-span-2">
            <FormField
              label="Alamat Terakhir"
              name="alamatTerakhir"
              type="textarea"
              required
              form={form}
            />
          </div>
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKK}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 6. SURAT KETERANGAN KELAHIRAN ===
export function SuratKelahiranForm({
  form,
  documentValues,
  onDocumentChange,
}: {
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}) {
  const jenisKelaminOptions = [
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ];

  return (
    <div className="space-y-6">
      {/* Data Pelapor */}
      <FormSection title="Data Pelapor" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Pelapor" name="nama" required form={form} />
          <FormField
            label="NIK Pelapor"
            name="nik"
            required
            form={form}
            placeholder="16 digit NIK"
          />
          <FormField
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Bayi */}
      <FormSection title="Data Bayi" icon={Baby}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Bayi" name="namaBayi" required form={form} />
          <FormField
            label="Tempat Lahir"
            name="tempatLahirBayi"
            required
            form={form}
          />
          <FormField
            label="Tanggal Lahir"
            name="tanggalLahirBayi"
            type="date"
            required
            form={form}
          />
          <FormField
            label="Jenis Kelamin"
            name="jenisKelaminBayi"
            type="select"
            options={jenisKelaminOptions}
            required
            form={form}
            placeholder="Pilih jenis kelamin"
          />
        </div>
      </FormSection>

      {/* Data Orang Tua */}
      <FormSection title="Data Orang Tua" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nama Ayah" name="namaAyah" required form={form} />
          <FormField label="Nama Ibu" name="namaIbu" required form={form} />
          <div className="md:col-span-2">
            <FormField
              label="Alamat Orang Tua"
              name="alamatOrangTua"
              type="textarea"
              required
              form={form}
            />
          </div>
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKL}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
