"use client";
import { useState, useRef } from "react";
import { useGaleri } from "@/hooks/useGaleri";
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
  Edit,
  Eye,
  ImageIcon,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import NextImage from "next/image";
import axios from "axios";

const schema = z.object({
  caption: z.string().min(1, "Caption wajib diisi"),
  kategori: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminGaleriPage() {
  const { galeri, isLoading, createGaleri, deleteGaleri, updateGaleri } =
    useGaleri();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caption: "",
      kategori: "",
      tanggal: new Date().toISOString().split("T")[0],
    },
  });

  function handleEdit(item: any) {
    setEdit(item);
    setValue("caption", item.caption || "");
    setValue("kategori", item.kategori || "");
    setValue("tanggal", new Date(item.tanggal).toISOString().split("T")[0]);
    setPreviewImage(item.gambar);
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      caption: "",
      kategori: "",
      tanggal: new Date().toISOString().split("T")[0],
    });
    setPreviewImage(null);
    setSelectedFile(null);
    setOpen(true);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await deleteGaleri(itemToDelete);
        toast.success("Galeri berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus galeri");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function uploadImage(file: File) {
    if (!file) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("foto", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return response.data.url;
      } else {
        throw new Error(response.data.message || "Upload gagal");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      let imageUrl = edit?.gambar || null;

      // Upload new image if selected
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
          if (!imageUrl) {
            toast.error("Gagal mengupload gambar");
            return;
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Upload gagal");
          return;
        }
      } else if (!edit) {
        // If adding new entry and no file selected
        toast.error("Silakan pilih gambar terlebih dahulu");
        return;
      }

      const payload = {
        ...values,
        gambar: imageUrl,
      };

      if (edit) {
        await updateGaleri(edit._id, payload);
        toast.success("Galeri berhasil diperbarui!");
      } else {
        await createGaleri(payload);
        toast.success("Galeri berhasil ditambahkan!");
      }
      setOpen(false);
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      toast.error("Gagal menyimpan galeri");
    }
  }

  const filteredGaleri = galeri?.filter(
    (item: any) =>
      item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Galeri Kegiatan
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus foto kegiatan desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Foto
        </Button>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="gap-2">
            <ImageIcon size={16} />
            Tampilan Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <Eye size={16} />
            Tampilan List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Galeri Foto</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredGaleri?.length || 0} foto`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari foto..."
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
              ) : filteredGaleri?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGaleri.map((item: any) => (
                    <Card key={item._id} className="overflow-hidden border">
                      <div className="relative h-48 w-full bg-muted">
                        <NextImage
                          src={item.gambar || "/placeholder.svg"}
                          alt={item.caption}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => setViewImage(item.gambar)}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=192&width=384";
                          }}
                        />
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {item.caption}
                          </CardTitle>
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
                                onClick={() => handleDeleteConfirm(item._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setViewImage(item.gambar)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Foto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.kategori && (
                          <div className="inline-block bg-muted text-xs px-2 py-1 rounded mb-2">
                            {item.kategori}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.caption}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.tanggal).toLocaleDateString()}
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
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tidak ada foto yang sesuai dengan pencarian"
                      : "Belum ada foto dalam galeri"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Foto Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Foto</CardTitle>
              <CardDescription>Tampilan daftar foto kegiatan</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-muted-foreground">
                    Memuat data...
                  </div>
                </div>
              ) : filteredGaleri?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Gambar</th>
                        <th className="p-2 text-left">Caption</th>
                        <th className="p-2 text-left">Kategori</th>
                        <th className="p-2 text-left">Tanggal</th>
                        <th className="p-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGaleri.map((item: any) => (
                        <tr key={item._id} className="border-b">
                          <td className="p-2">
                            <div className="relative h-12 w-20 bg-muted rounded overflow-hidden">
                              <NextImage
                                src={item.gambar || "/placeholder.svg"}
                                alt={item.caption}
                                fill
                                className="object-cover cursor-pointer"
                                onClick={() => setViewImage(item.gambar)}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=48&width=80";
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-2">{item.caption}</td>
                          <td className="p-2">{item.kategori || "-"}</td>
                          <td className="p-2">
                            {new Date(item.tanggal).toLocaleDateString()}
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewImage(item.gambar)}
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Lihat</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteConfirm(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Hapus</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Tidak ada foto yang sesuai dengan pencarian"
                      : "Belum ada foto dalam galeri"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Foto Pertama</Button>
                  )}
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
              <DialogTitle>{edit ? "Edit Foto" : "Tambah Foto"}</DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi foto yang sudah ada"
                  : "Tambahkan foto baru ke galeri"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="caption" className="text-sm font-medium">
                Caption Foto
              </label>
              <Input
                id="caption"
                placeholder="Masukkan caption foto"
                {...register("caption")}
              />
              {errors.caption && (
                <span className="text-red-500 text-xs">
                  {errors.caption.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="kategori" className="text-sm font-medium">
                Kategori (Opsional)
              </label>
              <Input
                id="kategori"
                placeholder="Masukkan kategori foto"
                {...register("kategori")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="tanggal" className="text-sm font-medium">
                Tanggal
              </label>
              <Input id="tanggal" type="date" {...register("tanggal")} />
              {errors.tanggal && (
                <span className="text-red-500 text-xs">
                  {errors.tanggal.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="foto" className="text-sm font-medium">
                Upload Foto
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1 w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={16} />
                    {edit ? "Ganti Gambar" : "Pilih Gambar"}
                  </Button>
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground">
                    File dipilih: {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}

                {/* Preview gambar */}
                {previewImage && (
                  <div className="mt-2">
                    <div className="relative h-40 w-full rounded-md overflow-hidden border">
                      <NextImage
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=160&width=320";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting || isUploading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {edit ? "Simpan Perubahan" : "Tambah Foto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="relative h-[500px] w-full">
            {viewImage && (
              <NextImage
                src={viewImage}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=500&width=800";
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
              Apakah Anda yakin ingin menghapus foto ini? Tindakan ini tidak
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
