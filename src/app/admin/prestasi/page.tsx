"use client";

import type React from "react";

import { useState, useRef } from "react";
import {
  usePrestasi,
  type PrestasiData,
  type PrestasiPayload,
} from "@/hooks/usePrestasi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  Loader2,
  X,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import NextImage from "next/image";
import axios from "axios";

const schema = z.object({
  title: z.string().min(1, "Judul prestasi wajib diisi"),
  description: z.string().min(1, "Deskripsi prestasi wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  imageUrl: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function AdminPrestasiPage() {
  const {
    prestasi = [],
    isLoading,
    createPrestasi,
    deletePrestasi,
    updatePrestasi,
  } = usePrestasi();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<PrestasiData | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      category: "",
      imageUrl: "",
    },
  });

  const imageUrlValue = watch("imageUrl");

  function handleEdit(item: PrestasiData) {
    setEdit(item);
    setValue("title", item.title);
    setValue("description", item.description);
    setValue(
      "date",
      item.date ? new Date(item.date).toISOString().split("T")[0] : ""
    );
    setValue("category", item.category || "");
    setValue("imageUrl", item.imageUrl || "");
    setUploadPreview(item.imageUrl || null);
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      title: "",
      description: "",
      date: "",
      category: "",
      imageUrl: "",
    });
    setUploadPreview(null);
    setOpen(true);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await deletePrestasi(itemToDelete);
        toast.success("Prestasi berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus prestasi");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Buat preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("foto", file);

      const response = await axios.post("/api/upload", formData);

      if (response.data.success) {
        toast.success("Gambar berhasil diupload");
        setValue("imageUrl", response.data.url);
      } else {
        toast.error(response.data.message || "Gagal mengupload gambar");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploadPreview(null);
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "Gagal mengupload gambar");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function clearUploadedImage() {
    setValue("imageUrl", "");
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      // Create payload and handle empty string for imageUrl
      const payload: PrestasiPayload = {
        title: values.title,
        description: values.description,
        date: values.date,
        category: values.category,
      };

      // Only add imageUrl field if it's not empty
      if (values.imageUrl && values.imageUrl.trim() !== "") {
        payload.imageUrl = values.imageUrl;
      }

      if (edit) {
        await updatePrestasi(edit.id, payload);
        toast.success("Prestasi berhasil diperbarui!");
      } else {
        await createPrestasi(payload);
        toast.success("Prestasi berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan prestasi");
    }
  }

  const filteredPrestasi = prestasi?.filter(
    (item: PrestasiData) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Prestasi Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus informasi prestasi desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Prestasi
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <Award size={16} />
            Daftar Prestasi
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye size={16} />
            Pratinjau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Daftar Prestasi Desa</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredPrestasi?.length || 0} prestasi`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari prestasi..."
                    className="pl-8 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-muted-foreground">
                    Memuat data...
                  </div>
                </div>
              ) : filteredPrestasi?.length ? (
                <div className="space-y-6">
                  {filteredPrestasi
                    .sort(
                      (a: PrestasiData, b: PrestasiData) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((item: PrestasiData) => (
                      <Card key={item.id} className="overflow-hidden border">
                        <div className="flex flex-col md:flex-row">
                          {item.imageUrl && (
                            <div className="relative h-48 md:h-auto md:w-1/3 bg-muted">
                              <NextImage
                                src={
                                  item.imageUrl || "/api/placeholder/384/192"
                                }
                                alt={item.title}
                                fill
                                className="object-cover cursor-pointer"
                                onClick={() => setViewImage(item.imageUrl)}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/api/placeholder/384/192";
                                }}
                              />
                            </div>
                          )}
                          <div
                            className={`flex-1 ${
                              item.imageUrl ? "md:w-2/3" : "w-full"
                            }`}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    {item.title}
                                  </CardTitle>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                      {new Date(item.date).toLocaleDateString(
                                        "id-ID",
                                        {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        }
                                      )}
                                    </div>
                                    {item.category && (
                                      <div className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                                        {item.category}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                      <span className="sr-only">Menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleEdit(item)}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteConfirm(item.id)
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Hapus
                                    </DropdownMenuItem>
                                    {item.imageUrl && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setViewImage(item.imageUrl)
                                        }
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Lihat Gambar
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.description}
                              </p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit size={14} />
                                Edit
                              </Button>
                            </CardFooter>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tidak ada prestasi yang sesuai dengan pencarian"
                      : "Belum ada data prestasi"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Prestasi Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Pratinjau Prestasi Desa</CardTitle>
              <CardDescription>
                Tampilan prestasi desa di website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-muted-foreground">
                    Memuat data...
                  </div>
                </div>
              ) : filteredPrestasi?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrestasi
                    .sort(
                      (a: PrestasiData, b: PrestasiData) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((item: PrestasiData) => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.imageUrl && (
                          <div className="relative h-48 w-full bg-muted">
                            <NextImage
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/api/placeholder/384/192";
                              }}
                            />
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">
                            {item.title}
                          </CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground gap-1 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(item.date).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {item.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          {item.category && (
                            <div className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10">
                              {item.category}
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    Belum ada data prestasi untuk ditampilkan
                  </p>
                  <Button onClick={handleAdd}>Tambah Prestasi Pertama</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Prestasi" : "Tambah Prestasi"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi prestasi yang sudah ada"
                  : "Tambahkan prestasi baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Judul Prestasi
              </label>
              <Input
                id="title"
                placeholder="Judul prestasi"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-red-500 text-xs">
                  {errors.title.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Tanggal
              </label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <span className="text-red-500 text-xs">
                  {errors.date.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Kategori
              </label>
              <Input
                id="category"
                placeholder="Kategori prestasi"
                {...register("category")}
              />
              {errors.category && (
                <span className="text-red-500 text-xs">
                  {errors.category.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="description"
                placeholder="Deskripsi prestasi"
                {...register("description")}
                rows={5}
              />
              {errors.description && (
                <span className="text-red-500 text-xs">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="imageUrl" className="text-sm font-medium">
                Gambar{" "}
                <span className="text-muted-foreground text-xs">
                  (Opsional)
                </span>
              </label>

              {/* Input file untuk upload */}
              <input
                type="file"
                id="fileInput"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />

              {/* Hidden input untuk menyimpan path gambar hasil upload */}
              <input type="hidden" id="imageUrl" {...register("imageUrl")} />

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  variant="outline"
                  className="gap-2 w-full"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Mengupload...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload Gambar</span>
                    </>
                  )}
                </Button>
              </div>

              {errors.imageUrl && (
                <span className="text-red-500 text-xs">
                  {errors.imageUrl.message}
                </span>
              )}

              {/* Preview gambar */}
              {uploadPreview && (
                <div className="mt-4 relative">
                  <div className="relative h-40 w-full rounded-md overflow-hidden border">
                    <NextImage
                      src={uploadPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/api/placeholder/320/160";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={clearUploadedImage}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menyimpan...
                  </span>
                ) : edit ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Prestasi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Preview Gambar</DialogTitle>
          </DialogHeader>
          <div className="relative h-[500px] w-full">
            {viewImage && (
              <NextImage
                src={viewImage}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/api/placeholder/800/500";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus prestasi ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
