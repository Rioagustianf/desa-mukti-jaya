"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  File,
  CheckCircle2,
  X,
  AlertTriangle,
  Camera,
  FileImage,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";

interface DocumentUploadProps {
  label: string;
  fieldKey: string;
  required?: boolean;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  description?: string;
  placeholder?: string;
  className?: string;
}

export function DocumentUpload({
  label,
  fieldKey,
  required = false,
  value = "",
  onChange,
  accept = "image/*",
  maxSize = 5,
  description,
  placeholder = "Klik untuk upload atau drag & drop file",
  className = "",
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (accept.includes("image") && !file.type.startsWith("image/")) {
      return "Hanya file gambar yang diperbolehkan (JPG, PNG, WEBP, GIF)";
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `Ukuran file tidak boleh lebih dari ${maxSize}MB. File Anda: ${fileSizeMB.toFixed(
        2
      )}MB`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }

      // Upload file
      const formData = new FormData();
      formData.append("foto", file);
      formData.append("category", `surat-${fieldKey}`);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      if (response.data.success) {
        onChange(response.data.url);
        setPreviewUrl(response.data.url);
        toast.success(`${label} berhasil diupload`);
      } else {
        throw new Error(response.data.message || "Upload gagal");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Upload gagal";
      setError(errorMessage);
      toast.error(errorMessage);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = () => {
    onChange("");
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (accept.includes("image")) {
      return <FileImage className="h-8 w-8 text-muted-foreground" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {!required && (
          <Badge variant="secondary" className="text-xs px-2 py-1">
            Opsional
          </Badge>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Upload Area */}
      {!value && !previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            {getFileIcon()}
            <div>
              <p className="text-sm font-medium">{placeholder}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {accept.includes("image")
                  ? "PNG, JPG, WEBP, GIF"
                  : "File dokumen"}{" "}
                hingga {maxSize}MB
              </p>
            </div>
            {!isUploading && (
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Pilih File
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-xs text-muted-foreground">
                Mengupload... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* File Preview */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {accept.includes("image") && previewUrl ? (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border">
                    <Image
                      src={previewUrl}
                      alt={label}
                      fill
                      className="object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md border border-muted-foreground/25 flex items-center justify-center">
                    <FileImage className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">
                      Berhasil diupload
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openFileDialog}
                  disabled={isUploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ganti
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Hidden file input for replacement */}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* File Size Info */}
      {!error && !isUploading && (
        <p className="text-xs text-muted-foreground">
          Maksimal ukuran file: {maxSize}MB
        </p>
      )}
    </div>
  );
}

// Multiple Document Upload Component
interface MultiDocumentUploadProps {
  documents: ReadonlyArray<{
    readonly key: string;
    readonly label: string;
    readonly required: boolean;
    readonly description?: string;
  }>;
  values: Record<string, string>;
  onChange: (fieldKey: string, url: string) => void;
  className?: string;
}

export function MultiDocumentUpload({
  documents,
  values,
  onChange,
  className = "",
}: MultiDocumentUploadProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FileImage className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upload Dokumen Pendukung</h3>
      </div>

      <div className="space-y-6">
        {documents.map((doc) => (
          <DocumentUpload
            key={doc.key}
            fieldKey={doc.key}
            label={doc.label}
            required={doc.required}
            description={doc.description}
            value={values[doc.key] || ""}
            onChange={(url) => onChange(doc.key, url)}
          />
        ))}
      </div>

      {/* Upload Summary */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Dokumen yang diupload:{" "}
            {Object.values(values).filter(Boolean).length} / {documents.length}
          </span>
          <div className="flex items-center gap-2">
            {documents.filter((doc) => doc.required && !values[doc.key])
              .length === 0 ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Semua dokumen wajib sudah diupload</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>
                  {
                    documents.filter((doc) => doc.required && !values[doc.key])
                      .length
                  }{" "}
                  dokumen wajib belum diupload
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
