"use client";
import { useState } from "react";
import { usePanduan } from "@/hooks/usePanduan";
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
  ClipboardList,
  Edit,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi panduan wajib diisi"),
  layananTerkait: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminPanduanPage() {
  const {
    panduan,
    isLoading,
    isSubmitting,
    error,
    createPanduan,
    deletePanduan,
    updatePanduan,
    mutate,
  } = usePanduan();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      judul: "",
      isi: "",
      layananTerkait: "",
    },
  });

  function handleEdit(item: any) {
    setEdit(item);
    setValue("judul", item.judul);
    setValue("isi", item.isi);
    setValue("layananTerkait", item.layananTerkait || "");
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      judul: "",
      isi: "",
      layananTerkait: "",
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
        await deletePanduan(itemToDelete);
        toast.success("Panduan berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus panduan");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (edit) {
        await updatePanduan(edit._id, values);
        toast.success("Panduan berhasil diperbarui!");
      } else {
        await createPanduan(values);
        toast.success("Panduan berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        } else if (status === 400 && errorData.errors) {
          const errorMessages = Object.values(errorData.errors).join(", ");
          toast.error(`Validasi gagal: ${errorMessages}`);
        } else {
          toast.error(errorData?.message || "Gagal menyimpan panduan");
        }
      } else {
        toast.error("Gagal menyimpan panduan. Silakan coba lagi.");
      }
    }
  }

  const handleRefresh = () => {
    mutate();
    toast.success("Data panduan sedang dimuat ulang");
  };

  const filteredPanduan = panduan?.filter(
    (item) =>
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.layananTerkait &&
        item.layananTerkait.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Panduan Administrasi
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus panduan administrasi desa
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 self-start"
          disabled={isSubmitting}
        >
          <Plus size={16} />
          Tambah Panduan
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Daftar Panduan Administrasi
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredPanduan?.length || 0} panduan`}
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari panduan..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                className="h-10 w-10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Memuat data panduan...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <div className="flex items-center gap-2 mb-4 text-destructive">
                <AlertCircle />
                <p className="font-medium">Gagal memuat data panduan</p>
              </div>
              <p className="text-muted-foreground mb-4">
                Terjadi kesalahan saat mengambil data panduan
              </p>
              <Button onClick={handleRefresh}>Muat Ulang</Button>
            </div>
          ) : filteredPanduan?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPanduan.map((item) => (
                <Card key={item._id} className="overflow-hidden border">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg line-clamp-1">
                          {item.judul}
                        </CardTitle>
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
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {item.layananTerkait && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 mt-2">
                        {item.layananTerkait}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
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
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Tidak ada panduan yang sesuai dengan pencarian"
                  : "Belum ada data panduan"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button onClick={handleAdd}>Tambah Panduan Pertama</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog
        open={open}
        onOpenChange={(openState) => {
          if (!isSubmitting) setOpen(openState);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Panduan" : "Tambah Panduan"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi panduan yang sudah ada"
                  : "Tambahkan panduan baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="judul" className="text-sm font-medium">
                Judul Panduan
              </label>
              <Input
                id="judul"
                placeholder="Judul panduan administrasi"
                {...register("judul")}
                disabled={isSubmitting || isFormSubmitting}
              />
              {errors.judul && (
                <span className="text-red-500 text-xs">
                  {errors.judul.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="layananTerkait" className="text-sm font-medium">
                Layanan Terkait{" "}
                <span className="text-muted-foreground text-xs">
                  (Opsional)
                </span>
              </label>
              <Input
                id="layananTerkait"
                placeholder="Layanan terkait dengan panduan ini"
                {...register("layananTerkait")}
                disabled={isSubmitting || isFormSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="isi" className="text-sm font-medium">
                Isi Panduan
              </label>
              <Textarea
                id="isi"
                placeholder="Isi panduan lengkap (termasuk langkah-langkah, syarat, dll)"
                {...register("isi")}
                rows={8}
                disabled={isSubmitting || isFormSubmitting}
              />
              {errors.isi && (
                <span className="text-red-500 text-xs">
                  {errors.isi.message}
                </span>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting || isFormSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isFormSubmitting}>
                {(isSubmitting || isFormSubmitting) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {edit ? "Simpan Perubahan" : "Tambah Panduan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(openState) => {
          if (!isSubmitting) setDeleteDialogOpen(openState);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus panduan ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
