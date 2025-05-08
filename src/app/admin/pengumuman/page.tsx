"use client";
import { useState } from "react";
import { usePengumuman } from "@/hooks/usePengumuman";
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
  Edit,
  Megaphone,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const schema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi pengumuman wajib diisi"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  prioritas: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminPengumumanPage() {
  const {
    pengumuman,
    isLoading,
    createPengumuman,
    deletePengumuman,
    updatePengumuman,
  } = usePengumuman();
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function handleEdit(item: any) {
    setEdit(item);
    setValue("judul", item.judul);
    setValue("isi", item.isi);
    setValue("tanggal", item.tanggal);
    setValue("prioritas", item.prioritas || "normal");
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      judul: "",
      isi: "",
      tanggal: new Date().toISOString().split("T")[0],
      prioritas: "normal",
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
        await deletePengumuman(itemToDelete);
        toast.success("Pengumuman berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus pengumuman");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (edit) {
        await updatePengumuman(edit._id, values);
        toast.success("Pengumuman berhasil diperbarui!");
      } else {
        await createPengumuman(values);
        toast.success("Pengumuman berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan pengumuman");
    }
  }

  const filteredPengumuman = pengumuman?.filter(
    (item: any) =>
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.isi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Pengumuman
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus pengumuman desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Pengumuman
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Pengumuman</CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredPengumuman?.length || 0} pengumuman`}
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari pengumuman..."
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
          ) : filteredPengumuman?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPengumuman.map((item: any) => (
                <Card
                  key={item._id}
                  className={`overflow-hidden border ${
                    item.prioritas === "tinggi"
                      ? "border-red-300 bg-red-50"
                      : ""
                  }`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-full ${
                            item.prioritas === "tinggi"
                              ? "bg-red-100 text-red-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{item.judul}</CardTitle>
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
                    {item.prioritas === "tinggi" && (
                      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 mt-2">
                        Prioritas Tinggi
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.isi}
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
                  ? "Tidak ada pengumuman yang sesuai dengan pencarian"
                  : "Belum ada data pengumuman"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button onClick={handleAdd}>Tambah Pengumuman Pertama</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Pengumuman" : "Tambah Pengumuman"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi pengumuman yang sudah ada"
                  : "Tambahkan pengumuman baru"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="judul" className="text-sm font-medium">
                Judul Pengumuman
              </label>
              <Input
                id="judul"
                placeholder="Judul pengumuman"
                {...register("judul")}
              />
              {errors.judul && (
                <span className="text-red-500 text-xs">
                  {errors.judul.message}
                </span>
              )}
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
              <label htmlFor="prioritas" className="text-sm font-medium">
                Prioritas
              </label>
              <select
                id="prioritas"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("prioritas")}
              >
                <option value="normal">Normal</option>
                <option value="tinggi">Prioritas Tinggi</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="isi" className="text-sm font-medium">
                Isi Pengumuman
              </label>
              <Textarea
                id="isi"
                placeholder="Isi pengumuman"
                {...register("isi")}
                rows={5}
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
              >
                Batal
              </Button>
              <Button type="submit">
                {edit ? "Simpan Perubahan" : "Tambah Pengumuman"}
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
              Apakah Anda yakin ingin menghapus pengumuman ini? Tindakan ini
              tidak dapat dibatalkan.
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
