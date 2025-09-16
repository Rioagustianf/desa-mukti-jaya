"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  SuratDomisiliForm,
  SuratUsahaForm,
  SuratTidakMampuForm,
  SuratBelumMenikahForm,
  SuratKematianForm,
  SuratKelahiranForm,
} from "./letter-forms-1";
import {
  SuratPindahDatangForm,
  SuratPindahKeluarForm,
  SuratKepemilikanTanahForm,
  SuratAhliWarisForm,
} from "./letter-forms-2";

// Letter code to form component mapping
const formComponents = {
  SKD: SuratDomisiliForm, // Surat Keterangan Domisili
  SKU: SuratUsahaForm, // Surat Keterangan Usaha
  SKTM: SuratTidakMampuForm, // Surat Keterangan Tidak Mampu
  SKBM: SuratBelumMenikahForm, // Surat Keterangan Belum Menikah
  SKK: SuratKematianForm, // Surat Keterangan Kematian
  SKL: SuratKelahiranForm, // Surat Keterangan Kelahiran
  SKPD: SuratPindahDatangForm, // Surat Keterangan Pindah Datang
  SKPK: SuratPindahKeluarForm, // Surat Keterangan Pindah Keluar
  SKKT: SuratKepemilikanTanahForm, // Surat Keterangan Kepemilikan Tanah
  SKAW: SuratAhliWarisForm, // Surat Keterangan Ahli Waris
} as const;

// Letter type definitions for better type checking
export type LetterCode = keyof typeof formComponents;

interface LetterFormRendererProps {
  letterCode: LetterCode;
  form: UseFormReturn<any>;
  documentValues: Record<string, string>;
  onDocumentChange: (key: string, url: string) => void;
}

export function LetterFormRenderer({
  letterCode,
  form,
  documentValues,
  onDocumentChange,
}: LetterFormRendererProps) {
  const FormComponent = formComponents[letterCode];

  if (!FormComponent) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Form untuk jenis surat "{letterCode}" belum tersedia.
        </p>
      </div>
    );
  }

  return (
    <FormComponent
      form={form}
      documentValues={documentValues}
      onDocumentChange={onDocumentChange}
    />
  );
}

// Helper function to get letter name by code
export function getLetterName(code: LetterCode): string {
  const letterNames: Record<LetterCode, string> = {
    SKD: "Surat Keterangan Domisili",
    SKU: "Surat Keterangan Usaha",
    SKTM: "Surat Keterangan Tidak Mampu",
    SKBM: "Surat Keterangan Belum Menikah",
    SKK: "Surat Keterangan Kematian",
    SKL: "Surat Keterangan Kelahiran",
    SKPD: "Surat Keterangan Pindah Datang",
    SKPK: "Surat Keterangan Pindah Keluar",
    SKKT: "Surat Keterangan Kepemilikan Tanah",
    SKAW: "Surat Keterangan Ahli Waris",
  };

  return letterNames[code] || code;
}

// Helper function to check if letter code is valid
export function isValidLetterCode(code: string): code is LetterCode {
  return code in formComponents;
}

// Export available letter codes
export const availableLetterCodes = Object.keys(formComponents) as LetterCode[];
