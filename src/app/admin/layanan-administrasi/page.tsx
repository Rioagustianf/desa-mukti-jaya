"use client";
import { useState } from "react";
import { useLayanan, type LayananItem } from "@/hooks/useLayanan";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog-scrollable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog-scrollable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const schema = z.object({
  nama: z.string().min(1, "Nama layanan wajib diisi"),
  deskripsi: z.string().min(1, "Deskripsi wajib diisi"),
  persyaratan: z.string().min(1, "Persyaratan wajib diisi"),
  prosedur: z.string().optional(),
  jadwalPelayanan: z.string().optional(),
  biaya: z.string().optional(),
  waktu: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminLayananPage() {
  const {
    layanan = [], // Provide default empty array to prevent undefined errors
    isLoading,
    isError,
    error,
    createLayanan,
    deleteLayanan,
    updateLayanan,
  } = useLayanan();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<LayananItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nama: "",
      deskripsi: "",
      persyaratan: "",
      prosedur: "",
      jadwalPelayanan: "",
      biaya: "",
      waktu: "",
    },
  });

  function handleEdit(item: LayananItem) {
    setEdit(item);
    setValue("nama", item.nama);
    setValue("deskripsi", item.deskripsi);
    setValue("persyaratan", item.persyaratan);
    setValue("prosedur", item.prosedur || "");
    setValue("jadwalPelayanan", item.jadwalPelayanan || "");
    setValue("biaya", item.biaya || "");
    setValue("waktu", item.waktu || "");
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      nama: "",
      deskripsi: "",
      persyaratan: "",
      prosedur: "",
      jadwalPelayanan: "",
      biaya: "",
      waktu: "",
    });
    setOpen(true);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await deleteLayanan(itemToDelete);
        toast.success("Layanan berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus layanan");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (edit) {
        await updateLayanan(edit._id, values);
        toast.success("Layanan berhasil diperbarui!");
      } else {
        await createLayanan(values);
        toast.success("Layanan berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      let errorMessage = "Gagal menyimpan layanan";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  }

  // Safely filter layanan with null check
  const filteredLayanan =
    layanan?.filter(
      (item: LayananItem) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isError) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-destructive">
          Terjadi kesalahan saat memuat data:{" "}
          {error?.message || "Silakan coba lagi nanti."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Layanan Administrasi
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus layanan administrasi desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Layanan
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Layanan Administrasi</CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredLayanan?.length || 0} layanan`}
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari layanan..."
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat data...
              </div>
            </div>
          ) : filteredLayanan?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLayanan.map((item: LayananItem) => (
                <Card key={item._id} className="overflow-hidden border">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{item.nama}</CardTitle>
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
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteConfirm(item._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.deskripsi}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.jadwalPelayanan && (
                          <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                            Jadwal: {item.jadwalPelayanan}
                          </span>
                        )}
                        {item.biaya && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            Biaya: {item.biaya}
                          </span>
                        )}
                        {item.waktu && (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            Waktu: {item.waktu}
                          </span>
                        )}
                      </div>
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
                  ? "Tidak ada layanan yang sesuai dengan pencarian"
                  : "Belum ada data layanan"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button onClick={handleAdd}>Tambah Layanan Pertama</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Layanan" : "Tambah Layanan"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi layanan yang sudah ada"
                  : "Tambahkan layanan baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Layanan
              </label>
              <Input
                id="nama"
                placeholder="Nama layanan administrasi"
                {...register("nama")}
              />
              {errors.nama && (
                <span className="text-red-500 text-xs">
                  {errors.nama.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi layanan"
                {...register("deskripsi")}
                rows={3}
              />
              {errors.deskripsi && (
                <span className="text-red-500 text-xs">
                  {errors.deskripsi.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="persyaratan" className="text-sm font-medium">
                Persyaratan
              </label>
              <Textarea
                id="persyaratan"
                placeholder="Persyaratan yang dibutuhkan"
                {...register("persyaratan")}
                rows={3}
              />
              {errors.persyaratan && (
                <span className="text-red-500 text-xs">
                  {errors.persyaratan.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="prosedur" className="text-sm font-medium">
                Prosedur{" "}
                <span className="text-muted-foreground text-xs">
                  (Opsional)
                </span>
              </label>
              <Textarea
                id="prosedur"
                placeholder="Tahapan prosedur pelayanan"
                {...register("prosedur")}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="jadwalPelayanan" className="text-sm font-medium">
                Jadwal Pelayanan{" "}
                <span className="text-muted-foreground text-xs">
                  (Opsional)
                </span>
              </label>
              <Input
                id="jadwalPelayanan"
                placeholder="Contoh: Senin-Jumat, 08.00-15.00"
                {...register("jadwalPelayanan")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="biaya" className="text-sm font-medium">
                  Biaya{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </label>
                <Input
                  id="biaya"
                  placeholder="Contoh: Rp 10.000"
                  {...register("biaya")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="waktu" className="text-sm font-medium">
                  Waktu Proses{" "}
                  <span className="text-muted-foreground text-xs">
                    (Opsional)
                  </span>
                </label>
                <Input
                  id="waktu"
                  placeholder="Contoh: 3 hari"
                  {...register("waktu")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {edit ? "Simpan Perubahan" : "Tambah Layanan"}
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
              Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak
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
