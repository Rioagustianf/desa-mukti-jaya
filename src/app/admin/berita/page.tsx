"use client";
import { useState, useRef } from "react";
import { useBerita } from "@/hooks/useBerita";
import { useAgenda } from "@/hooks/useAgenda";
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
  Calendar,
  Edit,
  Eye,
  MoreVertical,
  Newspaper,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import NextImage from "next/image";

// Define a schema for validation based on the selected type
const beritaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  isi: z.string().min(1, "Isi berita wajib diisi"),
  gambar: z.string().optional(),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  penulis: z.string().optional(),
});

const agendaSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  deskripsi: z.string().optional(),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().optional(),
  lokasi: z.string().optional(),
});

type BeritaFormValues = z.infer<typeof beritaSchema>;
type AgendaFormValues = z.infer<typeof agendaSchema>;

// Inline FileUpload component
function FileUpload({
  onUploadSuccess,
  previewUrl,
  className = "",
}: {
  onUploadSuccess: (url: string) => void;
  previewUrl?: string;
  className?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(previewUrl || "");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic client-side validation
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Upload gagal");
      }

      // Update preview and notify parent
      setPreviewImage(result.url);
      onUploadSuccess(result.url);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload gagal");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="gap-2"
        >
          <Upload size={16} />
          {isUploading ? "Mengupload..." : "Upload Gambar"}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {previewImage && (
        <div className="relative h-40 w-full rounded-md overflow-hidden border mt-2">
          <NextImage
            src={previewImage}
            alt="Preview"
            fill
            className="object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=160&width=320";
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function AdminBeritaAgendaPage() {
  const {
    berita,
    isLoading: isLoadingBerita,
    createBerita,
    deleteBerita,
    updateBerita,
  } = useBerita();
  const {
    agenda,
    isLoading: isLoadingAgenda,
    createAgenda,
    deleteAgenda,
    updateAgenda,
  } = useAgenda();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("berita");
  const [edit, setEdit] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "berita" | "agenda";
  } | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("semua");

  const {
    register: registerBerita,
    handleSubmit: handleSubmitBerita,
    reset: resetBerita,
    setValue: setValueBerita,
    formState: { errors: errorsBerita },
  } = useForm<BeritaFormValues>({
    resolver: zodResolver(beritaSchema),
  });

  const {
    register: registerAgenda,
    handleSubmit: handleSubmitAgenda,
    reset: resetAgenda,
    setValue: setValueAgenda,
    formState: { errors: errorsAgenda },
  } = useForm<AgendaFormValues>({
    resolver: zodResolver(agendaSchema),
  });

  function handleEdit(item: any, type: "berita" | "agenda") {
    setEdit(item);
    setSelectedType(type);

    if (type === "berita") {
      setValueBerita("judul", item.judul);
      setValueBerita("isi", item.isi);
      setValueBerita("gambar", item.gambar || "");
      setValueBerita(
        "tanggal",
        new Date(item.tanggal).toISOString().split("T")[0]
      );
      setValueBerita("penulis", item.penulis || "");
    } else {
      setValueAgenda("judul", item.judul);
      setValueAgenda("deskripsi", item.deskripsi || "");
      setValueAgenda(
        "tanggalMulai",
        new Date(item.tanggalMulai).toISOString().split("T")[0]
      );
      setValueAgenda(
        "tanggalSelesai",
        item.tanggalSelesai
          ? new Date(item.tanggalSelesai).toISOString().split("T")[0]
          : ""
      );
      setValueAgenda("lokasi", item.lokasi || "");
    }

    setOpen(true);
  }

  function handleAdd(type: "berita" | "agenda") {
    setEdit(null);
    setSelectedType(type);

    if (type === "berita") {
      resetBerita({
        judul: "",
        isi: "",
        gambar: "",
        tanggal: new Date().toISOString().split("T")[0],
        penulis: "",
      });
    } else {
      resetAgenda({
        judul: "",
        deskripsi: "",
        tanggalMulai: new Date().toISOString().split("T")[0],
        tanggalSelesai: "",
        lokasi: "",
      });
    }

    setOpen(true);
  }

  function handleDeleteConfirm(id: string, type: "berita" | "agenda") {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        if (itemToDelete.type === "berita") {
          await deleteBerita(itemToDelete.id);
          toast.success("Berita berhasil dihapus");
        } else {
          await deleteAgenda(itemToDelete.id);
          toast.success("Agenda berhasil dihapus");
        }
      } catch (error) {
        toast.error(`Gagal menghapus ${itemToDelete.type}`);
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function onSubmitBerita(values: BeritaFormValues) {
    try {
      if (edit) {
        await updateBerita(edit._id, values);
        toast.success("Berita berhasil diperbarui!");
      } else {
        await createBerita(values);
        toast.success("Berita berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan berita");
    }
  }

  async function onSubmitAgenda(values: AgendaFormValues) {
    try {
      if (edit) {
        await updateAgenda(edit._id, values);
        toast.success("Agenda berhasil diperbarui!");
      } else {
        await createAgenda(values);
        toast.success("Agenda berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan agenda");
    }
  }

  // Combine and filter data based on active tab
  const isLoading = isLoadingBerita || isLoadingAgenda;
  const allData = [
    ...(berita || []).map((item: any) => ({ ...item, type: "berita" })),
    ...(agenda || []).map((item: any) => ({ ...item, type: "agenda" })),
  ];

  // Filter based on search and active tab
  const filteredData = allData.filter((item: any) => {
    const matchesSearch =
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.type === "berita" &&
        item.isi?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.type === "agenda" &&
        item.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "semua") return matchesSearch;
    return matchesSearch && item.type === activeTab;
  });

  // Sort by date, with newest first
  const sortedData = filteredData.sort((a: any, b: any) => {
    const dateA =
      a.type === "berita" ? new Date(a.tanggal) : new Date(a.tanggalMulai);
    const dateB =
      b.type === "berita" ? new Date(b.tanggal) : new Date(b.tanggalMulai);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Berita & Agenda
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus berita dan agenda desa
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAdd("berita")} className="gap-2">
            <Plus size={16} />
            Tambah Berita
          </Button>
          <Button onClick={() => handleAdd("agenda")} className="gap-2">
            <Plus size={16} />
            Tambah Agenda
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="semua"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="semua" className="gap-2">
            <Eye size={16} />
            Semua
          </TabsTrigger>
          <TabsTrigger value="berita" className="gap-2">
            <Newspaper size={16} />
            Berita
          </TabsTrigger>
          <TabsTrigger value="agenda" className="gap-2">
            <Calendar size={16} />
            Agenda
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>
                  {activeTab === "semua"
                    ? "Daftar Berita & Agenda"
                    : activeTab === "berita"
                    ? "Daftar Berita"
                    : "Daftar Agenda"}
                </CardTitle>
                <CardDescription>
                  {!isLoading && `Menampilkan ${sortedData.length || 0} item`}
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berita/agenda..."
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
            ) : sortedData.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedData.map((item: any) => (
                  <Card key={item._id} className="overflow-hidden border">
                    {item.type === "berita" && (
                      <div className="relative h-48 w-full bg-muted">
                        <NextImage
                          src={item.gambar || "/placeholder.svg"}
                          alt={item.judul}
                          fill
                          className="object-cover cursor-pointer"
                          onClick={() => setViewImage(item.gambar)}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/placeholder.svg?height=192&width=384";
                          }}
                        />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          item.type === "berita"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10"
                            : "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                        }`}
                      >
                        {item.type === "berita" ? "Berita" : "Agenda"}
                      </span>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.judul}</CardTitle>
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
                              onClick={() => handleEdit(item, item.type)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteConfirm(item._id, item.type)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                            {item.type === "berita" && item.gambar && (
                              <DropdownMenuItem
                                onClick={() => setViewImage(item.gambar)}
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
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.type === "berita" ? item.isi : item.deskripsi}
                      </p>

                      {item.type === "berita" ? (
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.tanggal).toLocaleDateString()}
                          {item.penulis && ` • ${item.penulis}`}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">
                            Mulai:{" "}
                            {new Date(item.tanggalMulai).toLocaleDateString()}
                          </p>
                          {item.tanggalSelesai && (
                            <p className="text-xs text-muted-foreground">
                              Selesai:{" "}
                              {new Date(
                                item.tanggalSelesai
                              ).toLocaleDateString()}
                            </p>
                          )}
                          {item.lokasi && (
                            <p className="text-xs text-muted-foreground">
                              Lokasi: {item.lokasi}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleEdit(item, item.type)}
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
                    ? "Tidak ada berita/agenda yang sesuai dengan pencarian"
                    : `Belum ada ${
                        activeTab === "semua" ? "berita & agenda" : activeTab
                      }`}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Reset Pencarian
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAdd("berita")}>
                      Tambah Berita
                    </Button>
                    <Button onClick={() => handleAdd("agenda")}>
                      Tambah Agenda
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Form Dialog - Conditionally render based on selectedType */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedType === "berita" ? (
            <form
              onSubmit={handleSubmitBerita(onSubmitBerita)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>
                  {edit ? "Edit Berita" : "Tambah Berita"}
                </DialogTitle>
                <DialogDescription>
                  {edit
                    ? "Perbarui informasi berita yang sudah ada"
                    : "Tambahkan berita baru"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <label htmlFor="judul" className="text-sm font-medium">
                  Judul
                </label>
                <Input
                  id="judul"
                  placeholder="Judul berita"
                  {...registerBerita("judul")}
                />
                {errorsBerita.judul && (
                  <span className="text-red-500 text-xs">
                    {errorsBerita.judul.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tanggal" className="text-sm font-medium">
                  Tanggal
                </label>
                <Input
                  id="tanggal"
                  type="date"
                  {...registerBerita("tanggal")}
                />
                {errorsBerita.tanggal && (
                  <span className="text-red-500 text-xs">
                    {errorsBerita.tanggal.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="isi" className="text-sm font-medium">
                  Isi
                </label>
                <Textarea
                  id="isi"
                  placeholder="Isi berita"
                  {...registerBerita("isi")}
                  rows={5}
                />
                {errorsBerita.isi && (
                  <span className="text-red-500 text-xs">
                    {errorsBerita.isi.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="penulis" className="text-sm font-medium">
                  Penulis
                </label>
                <Input
                  id="penulis"
                  placeholder="Nama penulis (opsional)"
                  {...registerBerita("penulis")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="gambar" className="text-sm font-medium">
                  Gambar
                </label>
                <input
                  type="hidden"
                  id="gambar"
                  {...registerBerita("gambar")}
                />
                <FileUpload
                  onUploadSuccess={(url) => setValueBerita("gambar", url)}
                  previewUrl={registerBerita("gambar").value}
                />
                {errorsBerita.gambar && (
                  <span className="text-red-500 text-xs">
                    {errorsBerita.gambar.message}
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
                  {edit ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              onSubmit={handleSubmitAgenda(onSubmitAgenda)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>
                  {edit ? "Edit Agenda" : "Tambah Agenda"}
                </DialogTitle>
                <DialogDescription>
                  {edit
                    ? "Perbarui informasi agenda yang sudah ada"
                    : "Tambahkan agenda baru"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <label htmlFor="judul" className="text-sm font-medium">
                  Judul
                </label>
                <Input
                  id="judul"
                  placeholder="Judul agenda"
                  {...registerAgenda("judul")}
                />
                {errorsAgenda.judul && (
                  <span className="text-red-500 text-xs">
                    {errorsAgenda.judul.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tanggalMulai" className="text-sm font-medium">
                  Tanggal Mulai
                </label>
                <Input
                  id="tanggalMulai"
                  type="date"
                  {...registerAgenda("tanggalMulai")}
                />
                {errorsAgenda.tanggalMulai && (
                  <span className="text-red-500 text-xs">
                    {errorsAgenda.tanggalMulai.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="tanggalSelesai" className="text-sm font-medium">
                  Tanggal Selesai (Opsional)
                </label>
                <Input
                  id="tanggalSelesai"
                  type="date"
                  {...registerAgenda("tanggalSelesai")}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="deskripsi" className="text-sm font-medium">
                  Deskripsi
                </label>
                <Textarea
                  id="deskripsi"
                  placeholder="Deskripsi agenda"
                  {...registerAgenda("deskripsi")}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lokasi" className="text-sm font-medium">
                  Lokasi
                </label>
                <Input
                  id="lokasi"
                  placeholder="Lokasi agenda"
                  {...registerAgenda("lokasi")}
                />
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
                  {edit ? "Simpan Perubahan" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          )}
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
              Apakah Anda yakin ingin menghapus{" "}
              {itemToDelete?.type === "berita" ? "berita" : "agenda"} ini?
              Tindakan ini tidak dapat dibatalkan.
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
