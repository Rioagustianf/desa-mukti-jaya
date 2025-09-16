"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiDocumentUpload } from "@/components/ui/document-upload";
import { documentRequirements } from "@/types/letter-forms";
import {
  User,
  MapPin,
  FileText,
  Home,
  Building,
  TreePine,
  Users,
} from "lucide-react";

// Base form field component (same as letter-forms-1.tsx)
interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "date" | "textarea";
  required?: boolean;
  placeholder?: string;
  form: UseFormReturn<any>;
  className?: string;
}

function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  form,
  className = "",
}: FormFieldProps) {
  const {
    register,
    formState: { errors },
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

// === 7. SURAT KETERANGAN PINDAH DATANG ===
export function SuratPindahDatangForm({
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
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Perpindahan */}
      <FormSection title="Data Perpindahan" icon={MapPin}>
        <div className="space-y-4">
          <FormField
            label="Alamat Tujuan (di Desa Mukti Jaya)"
            name="alamatTujuan"
            type="textarea"
            required
            form={form}
            placeholder="Alamat lengkap tempat tinggal baru di Desa Mukti Jaya"
          />
          <FormField
            label="Asal Daerah"
            name="asalDaerah"
            required
            form={form}
            placeholder="Desa/Kelurahan, Kecamatan, Kabupaten asal"
          />
          <FormField
            label="Alasan Pindah"
            name="alasanPindah"
            type="textarea"
            required
            form={form}
            placeholder="Jelaskan alasan pindah ke Desa Mukti Jaya"
          />
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKPD}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 8. SURAT KETERANGAN PINDAH KELUAR ===
export function SuratPindahKeluarForm({
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
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Perpindahan */}
      <FormSection title="Data Perpindahan" icon={MapPin}>
        <div className="space-y-4">
          <FormField
            label="Alamat Asal (di Desa Mukti Jaya)"
            name="alamat"
            type="textarea"
            required
            form={form}
            placeholder="Alamat lengkap saat ini di Desa Mukti Jaya"
          />
          <FormField
            label="Alamat Tujuan"
            name="alamatTujuan"
            type="textarea"
            required
            form={form}
            placeholder="Alamat lengkap tujuan pindah (Desa/Kelurahan, Kecamatan, Kabupaten)"
          />
          <FormField
            label="Alasan Pindah"
            name="alasanPindah"
            type="textarea"
            required
            form={form}
            placeholder="Jelaskan alasan pindah dari Desa Mukti Jaya"
          />
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKPK}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 9. SURAT KETERANGAN KEPEMILIKAN TANAH ===
export function SuratKepemilikanTanahForm({
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
            label="Nomor Telepon/WA"
            name="teleponWA"
            required
            form={form}
            placeholder="081234567890"
          />
        </div>
      </FormSection>

      {/* Data Tanah */}
      <FormSection title="Data Tanah" icon={TreePine}>
        <div className="space-y-4">
          <FormField
            label="Alamat Tanah"
            name="alamatTanah"
            type="textarea"
            required
            form={form}
            placeholder="Alamat lengkap lokasi tanah yang dimiliki"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Luas Tanah"
              name="luasTanah"
              required
              form={form}
              placeholder="Contoh: 500 m² atau 0.5 hektar"
            />
            <FormField
              label="Status Kepemilikan"
              name="statusKepemilikan"
              required
              form={form}
              placeholder="Contoh: Milik Sendiri, Warisan, Hibah"
            />
          </div>
        </div>
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKKT}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// === 10. SURAT KETERANGAN AHLI WARIS ===
export function SuratAhliWarisForm({
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
          <FormField label="Nama Pemohon" name="nama" required form={form} />
          <FormField
            label="NIK Pemohon"
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

      {/* Data Pewaris */}
      <FormSection title="Data Pewaris" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Nama Pewaris (Almarhum/Almarhumah)"
            name="namaPewaris"
            required
            form={form}
          />
          <FormField
            label="Hubungan dengan Pewaris"
            name="hubunganAhliWaris"
            required
            form={form}
            placeholder="Contoh: Anak, Istri/Suami, Saudara"
          />
        </div>
      </FormSection>

      {/* Data Ahli Waris */}
      <FormSection title="Data Ahli Waris" icon={Users}>
        <FormField
          label="Nama Lengkap Ahli Waris"
          name="namaAhliWaris"
          type="textarea"
          required
          form={form}
          placeholder="Tuliskan nama lengkap semua ahli waris yang sah (jika lebih dari satu, pisahkan dengan baris baru)"
        />
      </FormSection>

      {/* Upload Dokumen */}
      <Card>
        <CardContent className="pt-6">
          <MultiDocumentUpload
            documents={documentRequirements.SKAW}
            values={documentValues}
            onChange={onDocumentChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
