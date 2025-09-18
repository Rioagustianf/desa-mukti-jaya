"use client";
import { useState, useRef } from "react";
import type React from "react";

import { usePengurus, type Pengurus } from "@/hooks/usePengurus";
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
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import NextImage from "next/image";

const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  foto: z.string().optional(),
  ttdDigital: z.string().optional(),
  telepon: z.string().optional(),
  email: z
    .string()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal("")),
  deskripsi: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminPengurusPage() {
  const {
    pengurus,
    isLoading,
    createPengurus,
    deletePengurus,
    updatePengurus,
    uploadImage,
    transformForForm,
  } = usePengurus();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<Pengurus | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingTTD, setUploadingTTD] = useState(false);
  const [selectedTTDFile, setSelectedTTDFile] = useState<File | null>(null);
  const ttdInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const currentPhotoUrl = watch("foto");
  const currentTTDUrl = watch("ttdDigital");

  function handleEdit(item: Pengurus) {
    setEdit(item);
    const formData = transformForForm(item);

    setValue("nama", formData.nama);
    setValue("jabatan", formData.jabatan);
    setValue("foto", formData.foto);
    setValue("ttdDigital", (formData as any).ttdDigital || "");
    setValue("telepon", formData.telepon);
    setValue("email", formData.email);
    setValue("deskripsi", formData.deskripsi);

    setSelectedFile(null);
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      nama: "",
      jabatan: "",
      foto: "",
      ttdDigital: "",
      telepon: "",
      email: "",
      deskripsi: "",
    });
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
        await deletePengurus(itemToDelete);
        toast.success("Data pengurus berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus data pengurus");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setValue("foto", previewUrl);
  }

  async function uploadSelectedFile() {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const imageUrl = await uploadImage(selectedFile);
      return imageUrl;
    } catch (error) {
      toast.error("Gagal mengupload foto");
      console.error(error);
      return null;
    } finally {
      setUploading(false);
    }
  }

  function handleTTDSelection(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    setSelectedTTDFile(file);
  }

  async function uploadSelectedTTDFile() {
    if (!selectedTTDFile) return null;
    try {
      setUploadingTTD(true);
      const url = await uploadImage(selectedTTDFile);
      return url;
    } catch (error) {
      toast.error("Gagal mengupload tanda tangan digital");
      console.error(error);
      return null;
    } finally {
      setUploadingTTD(false);
    }
  }

  function triggerTTDInput() {
    if (ttdInputRef.current) {
      ttdInputRef.current.click();
    }
  }

  function triggerFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function getKontakValue(item: Pengurus, jenis: "telepon" | "email"): string {
    const kontakItem = item.kontak?.find((k) => k.jenis === jenis);
    return kontakItem ? kontakItem.nilai : "";
  }

  async function onSubmit(values: FormValues) {
    try {
      let finalImageUrl = values.foto;

      if (selectedFile) {
        finalImageUrl = await uploadSelectedFile();
        if (!finalImageUrl) {
          toast.error("Gagal mengupload foto, silakan coba lagi");
          return;
        }
      }

      let finalTTDUrl = values.ttdDigital;
      if (selectedTTDFile) {
        finalTTDUrl = await uploadSelectedTTDFile();
        if (!finalTTDUrl) {
          toast.error("Gagal mengupload tanda tangan digital");
          return;
        }
      }

      const pengurusData = {
        ...values,
        foto: finalImageUrl,
        ttdDigital: finalTTDUrl,
      };

      if (edit) {
        await updatePengurus(edit._id, pengurusData);
        toast.success("Data pengurus berhasil diperbarui!");
      } else {
        await createPengurus(pengurusData);
        toast.success("Data pengurus berhasil ditambahkan!");
      }

      if (selectedFile && values.foto?.startsWith("blob:")) {
        URL.revokeObjectURL(values.foto);
      }

      setOpen(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error("Gagal menyimpan data pengurus");
      console.error(error);
    }
  }

  const filteredPengurus = pengurus?.filter(
    (item: Pengurus) =>
      item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.deskripsi &&
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Data Pengurus Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus data pengurus desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Pengurus
        </Button>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid" className="gap-2">
            <Users size={16} />
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
                  <CardTitle>Daftar Pengurus Desa</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredPengurus?.length || 0} pengurus`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari pengurus..."
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
              ) : filteredPengurus?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPengurus.map((item: Pengurus) => (
                    <Card key={item._id} className="overflow-hidden border">
                      <div className="relative h-48 w-full bg-muted">
                        <NextImage
                          src={item.foto || "/placeholder.svg"}
                          alt={item.nama}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => setViewImage(item.foto || null)}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=192&width=384";
                          }}
                        />
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {item.nama}
                            </CardTitle>
                            <div className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-2">
                              {item.jabatan}
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
                                onClick={() => handleDeleteConfirm(item._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setViewImage(item.foto || null)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat Foto
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {item.deskripsi && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.deskripsi}
                          </p>
                        )}
                        <div className="flex flex-col gap-1 mt-2">
                          {getKontakValue(item, "telepon") && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{getKontakValue(item, "telepon")}</span>
                            </div>
                          )}
                          {getKontakValue(item, "email") && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{getKontakValue(item, "email")}</span>
                            </div>
                          )}
                        </div>
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
                      ? "Tidak ada pengurus yang sesuai dengan pencarian"
                      : "Belum ada data pengurus"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Pengurus Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengurus Desa</CardTitle>
              <CardDescription>Tampilan daftar pengurus desa</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-pulse text-muted-foreground">
                    Memuat data...
                  </div>
                </div>
              ) : filteredPengurus?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Foto</th>
                        <th className="p-2 text-left">Nama</th>
                        <th className="p-2 text-left">Jabatan</th>
                        <th className="p-2 text-left">Kontak</th>
                        <th className="p-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPengurus.map((item: Pengurus) => (
                        <tr key={item._id} className="border-b">
                          <td className="p-2">
                            <div className="relative h-12 w-12 rounded-full overflow-hidden">
                              <NextImage
                                src={item.foto || "/placeholder.svg"}
                                alt={item.nama}
                                fill
                                className="object-cover cursor-pointer"
                                onClick={() => setViewImage(item.foto || null)}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/placeholder.svg?height=48&width=48";
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-2">{item.nama}</td>
                          <td className="p-2">{item.jabatan}</td>
                          <td className="p-2">
                            <div className="flex flex-col">
                              {getKontakValue(item, "telepon") && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{getKontakValue(item, "telepon")}</span>
                                </div>
                              )}
                              {getKontakValue(item, "email") && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{getKontakValue(item, "email")}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => setViewImage(item.foto || null)}
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
                      ? "Tidak ada pengurus yang sesuai dengan pencarian"
                      : "Belum ada data pengurus"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Pengurus Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Pengurus" : "Tambah Pengurus"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi pengurus yang sudah ada"
                  : "Tambahkan data pengurus baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Lengkap
              </label>
              <Input
                id="nama"
                placeholder="Nama lengkap pengurus"
                {...register("nama")}
              />
              {errors.nama && (
                <span className="text-red-500 text-xs">
                  {errors.nama.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="jabatan" className="text-sm font-medium">
                Jabatan
              </label>
              <Input
                id="jabatan"
                placeholder="Jabatan pengurus"
                {...register("jabatan")}
              />
              {errors.jabatan && (
                <span className="text-red-500 text-xs">
                  {errors.jabatan.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="telepon" className="text-sm font-medium">
                  Telepon{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </label>
                <Input
                  id="telepon"
                  placeholder="Nomor telepon"
                  {...register("telepon")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </label>
                <Input
                  id="email"
                  placeholder="Alamat email"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs">
                    {errors.email.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi{" "}
                <span className="text-muted-foreground text-xs">
                  (Opsional)
                </span>
              </label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi singkat"
                {...register("deskripsi")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="foto" className="text-sm font-medium">
                Foto
              </label>
              <div>
                <input type="hidden" {...register("foto")} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelection}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {selectedFile
                    ? selectedFile.name
                    : uploading
                    ? "Mengupload..."
                    : "Pilih File Foto"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Format gambar: JPG, PNG, GIF (Maks. 5MB)
                </p>
              </div>

              <div className="mt-2">
                {currentPhotoUrl && (
                  <div className="relative h-40 w-40 mx-auto rounded-md overflow-hidden border bg-muted">
                    {currentPhotoUrl ? (
                      <NextImage
                        src={currentPhotoUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=160&width=160";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-center p-4 text-muted-foreground">
                        <p>Belum ada foto</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tanda Tangan Digital (PNG Transparan)
              </label>
              <div>
                <input type="hidden" {...register("ttdDigital")} />
                <input
                  type="file"
                  ref={ttdInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleTTDSelection}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={triggerTTDInput}
                  disabled={uploadingTTD}
                >
                  {uploadingTTD ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {selectedTTDFile
                    ? selectedTTDFile.name
                    : uploadingTTD
                    ? "Mengupload..."
                    : "Pilih File TTD (PNG)"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Disarankan PNG transparan. Maks 5MB.
                </p>
              </div>
              <div className="mt-2">
                {currentTTDUrl && (
                  <div className="relative h-24 w-40 mx-auto rounded-md overflow-hidden border bg-muted">
                    <NextImage
                      src={currentTTDUrl}
                      alt="TTD Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : edit ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pengurus ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pratinjau Foto</DialogTitle>
          </DialogHeader>
          <div className="relative h-80 w-full bg-muted rounded-md overflow-hidden">
            {viewImage && (
              <NextImage
                src={viewImage}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=320&width=320";
                }}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewImage(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
