"use client";
import { useState, useRef } from "react";
import {
  useSejarah,
  type SejarahData,
  type SejarahPayload,
} from "@/hooks/useSejarah";
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
  BookOpen,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  Image,
  Loader2,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import NextImage from "next/image";
import axios from "axios";

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi sejarah wajib diisi"),
  gambar: z.string().optional().or(z.literal("")),
  tahun: z.string().min(1, "Tahun wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminSejarahPage() {
  const { sejarah, isLoading, createSejarah, deleteSejarah, updateSejarah } =
    useSejarah();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<SejarahData | null>(null);
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
      judul: "",
      isi: "",
      gambar: "",
      tahun: "",
    },
  });

  const gambarValue = watch("gambar");

  function handleEdit(item: SejarahData) {
    setEdit(item);
    setValue("judul", item.judul);
    setValue("isi", item.isi);
    setValue("gambar", item.gambar || "");
    setValue("tahun", item.tahun);
    setUploadPreview(item.gambar || null);
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      judul: "",
      isi: "",
      gambar: "",
      tahun: "",
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
        await deleteSejarah(itemToDelete);
        toast.success("Sejarah berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus sejarah");
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
        setValue("gambar", response.data.url);
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
    setValue("gambar", "");
    setUploadPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      // Create payload and handle empty string for gambar
      const payload: SejarahPayload = {
        judul: values.judul,
        isi: values.isi,
        tahun: values.tahun,
      };

      // Only add gambar field if it's not empty
      if (values.gambar && values.gambar.trim() !== "") {
        payload.gambar = values.gambar;
      }

      if (edit) {
        await updateSejarah(edit._id, payload);
        toast.success("Sejarah berhasil diperbarui!");
      } else {
        await createSejarah(payload);
        toast.success("Sejarah berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan sejarah");
    }
  }

  const filteredSejarah = sejarah?.filter(
    (item: SejarahData) =>
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tahun.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Sejarah Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus informasi sejarah desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Sejarah
        </Button>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline" className="gap-2">
            <BookOpen size={16} />
            Timeline Sejarah
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye size={16} />
            Pratinjau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Daftar Sejarah Desa</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredSejarah?.length || 0} sejarah`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari sejarah..."
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
              ) : filteredSejarah?.length ? (
                <div className="space-y-6">
                  {filteredSejarah
                    .sort(
                      (a: SejarahData, b: SejarahData) =>
                        parseInt(a.tahun) - parseInt(b.tahun)
                    )
                    .map((item: SejarahData) => (
                      <Card key={item._id} className="overflow-hidden border">
                        <div className="flex flex-col md:flex-row">
                          {item.gambar && (
                            <div className="relative h-48 md:h-auto md:w-1/3 bg-muted">
                              <NextImage
                                src={item.gambar || "/api/placeholder/384/192"}
                                alt={item.judul}
                                fill
                                className="object-cover cursor-pointer"
                                onClick={() => setViewImage(item.gambar)}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/api/placeholder/384/192";
                                }}
                              />
                            </div>
                          )}
                          <div
                            className={`flex-1 ${
                              item.gambar ? "md:w-2/3" : "w-full"
                            }`}
                          >
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    {item.judul}
                                  </CardTitle>
                                  <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-2">
                                    Tahun: {item.tahun}
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
                                        handleDeleteConfirm(item._id)
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Hapus
                                    </DropdownMenuItem>
                                    {item.gambar && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setViewImage(item.gambar)
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
                                {item.isi}
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
                      ? "Tidak ada sejarah yang sesuai dengan pencarian"
                      : "Belum ada data sejarah"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Sejarah Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Pratinjau Timeline Sejarah</CardTitle>
              <CardDescription>
                Tampilan timeline sejarah desa di website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-muted-foreground">
                    Memuat data...
                  </div>
                </div>
              ) : filteredSejarah?.length ? (
                <div className="relative border-l border-gray-200 ml-3 pl-8 space-y-10">
                  {filteredSejarah
                    .sort(
                      (a: SejarahData, b: SejarahData) =>
                        parseInt(a.tahun) - parseInt(b.tahun)
                    )
                    .map((item: SejarahData, index: number) => (
                      <div key={item._id} className="relative">
                        <div className="absolute -left-11 mt-1.5 h-6 w-6 rounded-full border border-white bg-primary text-white flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="mb-1 text-lg font-semibold text-gray-900 flex items-center">
                          {item.judul}
                          <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                            {item.tahun}
                          </span>
                        </div>
                        <div className="mb-4 text-base font-normal text-gray-500">
                          {item.isi}
                        </div>
                        {item.gambar && (
                          <div className="relative h-48 w-full sm:w-2/3 rounded-lg overflow-hidden mb-4">
                            <NextImage
                              src={item.gambar}
                              alt={item.judul}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/api/placeholder/384/192";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    Belum ada data sejarah untuk ditampilkan
                  </p>
                  <Button onClick={handleAdd}>Tambah Sejarah Pertama</Button>
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
                {edit ? "Edit Sejarah" : "Tambah Sejarah"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi sejarah yang sudah ada"
                  : "Tambahkan sejarah baru ke timeline"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="judul" className="text-sm font-medium">
                Judul
              </label>
              <Input
                id="judul"
                placeholder="Judul peristiwa sejarah"
                {...register("judul")}
              />
              {errors.judul && (
                <span className="text-red-500 text-xs">
                  {errors.judul.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="tahun" className="text-sm font-medium">
                Tahun
              </label>
              <Input
                id="tahun"
                placeholder="Tahun peristiwa (contoh: 1945)"
                {...register("tahun")}
              />
              {errors.tahun && (
                <span className="text-red-500 text-xs">
                  {errors.tahun.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="isi" className="text-sm font-medium">
                Isi Sejarah
              </label>
              <Textarea
                id="isi"
                placeholder="Deskripsi peristiwa sejarah"
                {...register("isi")}
                rows={5}
              />
              {errors.isi && (
                <span className="text-red-500 text-xs">
                  {errors.isi.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="gambar" className="text-sm font-medium">
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
              <input type="hidden" id="gambar" {...register("gambar")} />

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

              {errors.gambar && (
                <span className="text-red-500 text-xs">
                  {errors.gambar.message}
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
                  "Tambah Sejarah"
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
              Apakah Anda yakin ingin menghapus sejarah ini? Tindakan ini tidak
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
