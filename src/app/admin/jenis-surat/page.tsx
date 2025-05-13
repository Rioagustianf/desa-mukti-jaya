"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  FileText,
  Search,
  Check,
  X,
  ArrowUpDown,
} from "lucide-react";
import axios from "axios";

// Schema untuk validasi form
const jenisSuratSchema = z.object({
  nama: z.string().min(3, "Nama jenis surat minimal 3 karakter"),
  kode: z.string().min(2, "Kode jenis surat minimal 2 karakter"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  tipeForm: z.enum(["umum", "domisili", "pindah"]),
  aktif: z.boolean().default(true),
  urutan: z.number().int().min(0).default(0),
  persyaratan: z.string().optional(),
  catatan: z.string().optional(),
});

type FormValues = z.infer<typeof jenisSuratSchema>;

export default function AdminJenisSuratPage() {
  const [jenisSuratList, setJenisSuratList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJenisSurat, setSelectedJenisSurat] = useState<any | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("urutan");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(jenisSuratSchema),
    defaultValues: {
      tipeForm: "umum",
      aktif: true,
      urutan: 0,
    },
  });

  // Fetch jenis surat
  const fetchJenisSurat = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/jenis-surat");
      if (response.data.success) {
        setJenisSuratList(response.data.data);
      } else {
        toast.error(
          response.data.message || "Gagal mengambil data jenis surat"
        );
      }
    } catch (error) {
      console.error("Error fetching jenis surat:", error);
      toast.error("Terjadi kesalahan saat mengambil data jenis surat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJenisSurat();
  }, []);

  // Handle form submit
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (selectedJenisSurat) {
        // Update existing jenis surat
        const response = await axios.put(
          `/api/jenis-surat/${selectedJenisSurat._id}`,
          data
        );
        if (response.data.success) {
          toast.success("Jenis surat berhasil diperbarui");
          fetchJenisSurat();
          setDialogOpen(false);
        } else {
          toast.error(response.data.message || "Gagal memperbarui jenis surat");
        }
      } else {
        // Create new jenis surat
        const response = await axios.post("/api/jenis-surat", data);
        if (response.data.success) {
          toast.success("Jenis surat berhasil ditambahkan");
          fetchJenisSurat();
          setDialogOpen(false);
        } else {
          toast.error(response.data.message || "Gagal menambahkan jenis surat");
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "Terjadi kesalahan saat menyimpan data"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (item: any) => {
    setSelectedJenisSurat(item);
    setValue("nama", item.nama);
    setValue("kode", item.kode);
    setValue("deskripsi", item.deskripsi);
    setValue("tipeForm", item.tipeForm);
    setValue("aktif", item.aktif);
    setValue("urutan", item.urutan);
    setValue("persyaratan", item.persyaratan || "");
    setValue("catatan", item.catatan || "");
    setDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (item: any) => {
    setSelectedJenisSurat(item);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedJenisSurat) return;

    setIsSubmitting(true);
    try {
      const response = await axios.delete(
        `/api/jenis-surat/${selectedJenisSurat._id}`
      );
      if (response.data.success) {
        toast.success("Jenis surat berhasil dihapus");
        fetchJenisSurat();
        setDeleteDialogOpen(false);
      } else {
        toast.error(response.data.message || "Gagal menghapus jenis surat");
      }
    } catch (error) {
      console.error("Error deleting jenis surat:", error);
      toast.error("Terjadi kesalahan saat menghapus jenis surat");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedJenisSurat(null);
    reset({
      nama: "",
      kode: "",
      deskripsi: "",
      tipeForm: "umum",
      aktif: true,
      urutan: 0,
      persyaratan: "",
      catatan: "",
    });
    setDialogOpen(true);
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort jenis surat
  const filteredAndSortedJenisSurat = jenisSuratList
    .filter((item) => {
      if (!searchQuery) return true;
      return (
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortField === "nama") {
        return sortDirection === "asc"
          ? a.nama.localeCompare(b.nama)
          : b.nama.localeCompare(a.nama);
      } else if (sortField === "kode") {
        return sortDirection === "asc"
          ? a.kode.localeCompare(b.kode)
          : b.kode.localeCompare(a.kode);
      } else if (sortField === "urutan") {
        return sortDirection === "asc"
          ? a.urutan - b.urutan
          : b.urutan - a.urutan;
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jenis Surat</h1>
        <p className="text-muted-foreground">
          Kelola jenis surat yang tersedia untuk pengajuan
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Jenis Surat</CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredAndSortedJenisSurat.length} jenis surat`}
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jenis Surat
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari jenis surat..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat data...
              </div>
            </div>
          ) : filteredAndSortedJenisSurat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery
                  ? "Tidak ada jenis surat yang sesuai dengan pencarian"
                  : "Belum ada jenis surat yang ditambahkan"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                  className="mt-4"
                >
                  Reset Pencarian
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("urutan")}
                    >
                      <div className="flex items-center">
                        Urutan
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("nama")}
                    >
                      <div className="flex items-center">
                        Nama
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("kode")}
                    >
                      <div className="flex items-center">
                        Kode
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Tipe Form</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedJenisSurat.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.urutan}</TableCell>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{item.kode}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.tipeForm === "umum"
                              ? "bg-blue-100 text-blue-800"
                              : item.tipeForm === "domisili"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {item.tipeForm === "umum"
                            ? "Umum"
                            : item.tipeForm === "domisili"
                            ? "Domisili"
                            : "Pindah"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.aktif ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-100 text-red-800"
                          >
                            <X className="mr-1 h-3 w-3" />
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedJenisSurat ? "Edit Jenis Surat" : "Tambah Jenis Surat"}
            </DialogTitle>
            <DialogDescription>
              {selectedJenisSurat
                ? "Ubah informasi jenis surat yang sudah ada"
                : "Tambahkan jenis surat baru untuk pengajuan"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Jenis Surat <span className="text-red-500">*</span>
                </Label>
                <Input id="nama" {...register("nama")} />
                {errors.nama && (
                  <p className="text-red-500 text-xs">{errors.nama.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kode">
                  Kode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kode"
                  {...register("kode")}
                  disabled={!!selectedJenisSurat}
                />
                {errors.kode && (
                  <p className="text-red-500 text-xs">{errors.kode.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea id="deskripsi" {...register("deskripsi")} />
              {errors.deskripsi && (
                <p className="text-red-500 text-xs">
                  {errors.deskripsi.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipeForm">
                  Tipe Form <span className="text-red-500">*</span>
                </Label>
                <Select
                  defaultValue={watch("tipeForm")}
                  onValueChange={(value) =>
                    setValue(
                      "tipeForm",
                      value as "umum" | "domisili" | "pindah"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="umum">Umum (Sederhana)</SelectItem>
                    <SelectItem value="domisili">Domisili (Lengkap)</SelectItem>
                    <SelectItem value="pindah">Pindah (Lengkap)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipeForm && (
                  <p className="text-red-500 text-xs">
                    {errors.tipeForm.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="urutan">
                  Urutan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="urutan"
                  type="number"
                  min="0"
                  {...register("urutan", { valueAsNumber: true })}
                />
                {errors.urutan && (
                  <p className="text-red-500 text-xs">
                    {errors.urutan.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="persyaratan">Persyaratan</Label>
              <Textarea
                id="persyaratan"
                placeholder="Masukkan persyaratan untuk pengajuan surat ini"
                {...register("persyaratan")}
              />
              {errors.persyaratan && (
                <p className="text-red-500 text-xs">
                  {errors.persyaratan.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                placeholder="Masukkan catatan tambahan (opsional)"
                {...register("catatan")}
              />
              {errors.catatan && (
                <p className="text-red-500 text-xs">{errors.catatan.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aktif"
                checked={watch("aktif")}
                onCheckedChange={(checked) => setValue("aktif", checked)}
              />
              <Label htmlFor="aktif">Aktif</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {selectedJenisSurat ? "Simpan Perubahan" : "Tambah Jenis Surat"}
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
              Apakah Anda yakin ingin menghapus jenis surat "
              {selectedJenisSurat?.nama}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
