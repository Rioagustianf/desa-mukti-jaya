"use client";
import { useState, useEffect } from "react";
import axios from "axios";
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
  ExternalLink,
  Globe,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  Instagram,
  Facebook,
  Twitter,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Interface untuk model Kontak
interface Kontak {
  _id: string;
  jenis: string;
  nilai: string;
  deskripsi?: string;
}

// Interface untuk input Kontak
interface KontakInput {
  jenis: string;
  nilai: string;
  deskripsi?: string;
}

// Improved useKontak hook
const useKontak = () => {
  const [kontak, setKontak] = useState<Kontak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch kontak data
  const fetchKontak = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/kontak");

      if (response.data.success && Array.isArray(response.data.data)) {
        setKontak(response.data.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setKontak([]);
        setError("Format respons API tidak valid");
      }
    } catch (error) {
      console.error("Error fetching kontak:", error);
      setKontak([]);
      setError("Gagal memuat data kontak");
    } finally {
      setIsLoading(false);
    }
  };

  // Create new kontak with improved error handling
  const createKontak = async (data: KontakInput) => {
    try {
      // Check that the data contains the required fields
      if (!data.jenis || !data.nilai) {
        throw new Error("Data kontak tidak lengkap");
      }

      const response = await axios.post("/api/kontak", data);

      if (response.data.success && response.data.data) {
        setKontak((prev) => [...prev, response.data.data]);
        return response.data.data;
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Gagal menambahkan kontak: Format respons tidak valid");
      }
    } catch (error: any) {
      console.error("Error creating kontak:", error);
      throw new Error(error.message || "Gagal menambahkan kontak");
    }
  };

  // Update kontak with improved error handling
  const updateKontak = async (id: string, data: KontakInput) => {
    try {
      // Check that the data contains the required fields
      if (!data.jenis || !data.nilai) {
        throw new Error("Data kontak tidak lengkap");
      }

      const response = await axios.put(`/api/kontak/${id}`, data);

      if (response.data.success && response.data.data) {
        setKontak((prev) =>
          prev.map((item) => (item._id === id ? response.data.data : item))
        );
        return response.data.data;
      } else {
        console.error("Invalid update response:", response.data);
        throw new Error("Gagal memperbarui kontak: Format respons tidak valid");
      }
    } catch (error: any) {
      console.error("Error updating kontak:", error);
      throw new Error(error.message || "Gagal memperbarui kontak");
    }
  };

  // Delete kontak
  const deleteKontak = async (id: string) => {
    try {
      const response = await axios.delete(`/api/kontak/${id}`);
      if (response.data.success) {
        setKontak((prev) => prev.filter((item) => item._id !== id));
        return true;
      } else {
        throw new Error("Gagal menghapus kontak");
      }
    } catch (error) {
      console.error("Error deleting kontak:", error);
      throw error;
    }
  };

  // Fetch kontak on component mount
  useEffect(() => {
    fetchKontak();
  }, []);

  return {
    kontak,
    isLoading,
    error,
    createKontak,
    updateKontak,
    deleteKontak,
    refreshKontak: fetchKontak,
  };
};

// Schema validasi form with strict validation
const schema = z.object({
  jenis: z.string().min(1, "Jenis kontak wajib diisi"),
  nilai: z.string().min(1, "Nilai kontak wajib diisi"),
  deskripsi: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminKontakPage() {
  const {
    kontak,
    isLoading,
    error,
    createKontak,
    deleteKontak,
    updateKontak,
    refreshKontak,
  } = useKontak();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<Kontak | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      jenis: "",
      nilai: "",
      deskripsi: "",
    },
  });

  function handleEdit(item: Kontak) {
    setEdit(item);
    setValue("jenis", item.jenis || "");
    setValue("nilai", item.nilai || "");
    setValue("deskripsi", item.deskripsi || "");
    setOpen(true);
    setSubmitError(null);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      jenis: "",
      nilai: "",
      deskripsi: "",
    });
    setOpen(true);
    setSubmitError(null);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await deleteKontak(itemToDelete);
        toast.success("Kontak berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus kontak");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function onSubmit(values: FormValues) {
    // Clear any previous errors
    setSubmitError(null);

    // Validate the form values again, just to be safe
    if (!values.jenis || !values.nilai) {
      setSubmitError("Semua field wajib diisi dengan benar");
      return;
    }

    try {
      // Construct the payload explicitly to ensure it has the right structure
      const payload = {
        jenis: values.jenis,
        nilai: values.nilai,
        deskripsi: values.deskripsi || "",
      };

      if (edit) {
        await updateKontak(edit._id, payload);
        toast.success("Kontak berhasil diperbarui!");
      } else {
        await createKontak(payload);
        toast.success("Kontak berhasil ditambahkan!");
      }
      setOpen(false);
    } catch (error: any) {
      console.error("Form submission error:", error);
      const errorMessage = error.message || "Gagal menyimpan kontak";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  }

  // Improved filtering function
  const filteredKontak = kontak.filter((item) => {
    if (!item) return false;

    const searchLower = searchQuery.toLowerCase();

    const jenisMatch = item.jenis?.toLowerCase().includes(searchLower) || false;
    const nilaiMatch = item.nilai?.toLowerCase().includes(searchLower) || false;
    const deskripsiMatch =
      item.deskripsi?.toLowerCase().includes(searchLower) || false;

    return jenisMatch || nilaiMatch || deskripsiMatch;
  });

  // Function to get icon based on contact type
  const getKontakIcon = (jenis: string = "") => {
    const lowerJenis = jenis.toLowerCase();
    if (
      lowerJenis.includes("telepon") ||
      lowerJenis.includes("telp") ||
      lowerJenis.includes("hp") ||
      lowerJenis.includes("whatsapp")
    ) {
      return <Phone className="h-5 w-5" />;
    } else if (lowerJenis.includes("email")) {
      return <Mail className="h-5 w-5" />;
    } else if (lowerJenis.includes("website")) {
      return <Globe className="h-5 w-5" />;
    } else if (lowerJenis.includes("instagram")) {
      return <Instagram className="h-5 w-5" />;
    } else if (lowerJenis.includes("facebook")) {
      return <Facebook className="h-5 w-5" />;
    } else if (lowerJenis.includes("twitter")) {
      return <Twitter className="h-5 w-5" />;
    } else {
      return <Globe className="h-5 w-5" />;
    }
  };

  // Function to open contact
  const openContact = (jenis: string = "", nilai: string = "") => {
    if (!nilai) return;

    const lowerJenis = jenis.toLowerCase();
    if (
      lowerJenis.includes("telepon") ||
      lowerJenis.includes("telp") ||
      lowerJenis.includes("hp")
    ) {
      window.open(`tel:${nilai}`, "_blank");
    } else if (lowerJenis.includes("whatsapp")) {
      // Format WhatsApp link - remove any non-numeric characters
      const cleanNumber = nilai.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    } else if (lowerJenis.includes("email")) {
      window.open(`mailto:${nilai}`, "_blank");
    } else if (
      lowerJenis.includes("website") ||
      lowerJenis.includes("instagram") ||
      lowerJenis.includes("facebook") ||
      lowerJenis.includes("twitter")
    ) {
      // Add http:// if not present
      let url = nilai;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Kontak Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus informasi kontak desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Kontak
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <Phone size={16} />
            Daftar Kontak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Daftar Kontak</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredKontak?.length || 0} kontak`}
                  </CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-auto relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari kontak..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshKontak}
                    disabled={isLoading}
                    className="flex-shrink-0"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </Button>
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
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button onClick={refreshKontak} variant="outline">
                    Coba Lagi
                  </Button>
                </div>
              ) : filteredKontak?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredKontak.map((item) => (
                    <Card key={item._id} className="overflow-hidden border">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                              {getKontakIcon(item.jenis)}
                            </div>
                            <CardTitle className="text-lg">
                              {item.jenis || "Kontak"}
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
                                onClick={() =>
                                  openContact(item.jenis, item.nilai)
                                }
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Buka Kontak
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Nilai Kontak:</p>
                          <p className="text-sm text-muted-foreground">
                            {item.nilai || "-"}
                          </p>

                          {item.deskripsi && (
                            <>
                              <p className="text-sm font-medium">Deskripsi:</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.deskripsi}
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => openContact(item.jenis, item.nilai)}
                        >
                          <ExternalLink size={14} />
                          Buka
                        </Button>
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
                      ? "Tidak ada kontak yang sesuai dengan pencarian"
                      : "Belum ada data kontak"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Kontak Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog with improved validation */}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSubmitError(null);
          setOpen(isOpen);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Kontak" : "Tambah Kontak"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi kontak yang sudah ada"
                  : "Tambahkan kontak baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="jenis" className="text-sm font-medium">
                Jenis Kontak <span className="text-red-500">*</span>
              </label>
              <Input
                id="jenis"
                placeholder="Contoh: Telepon, Email, Website, Instagram"
                {...register("jenis")}
              />
              {errors.jenis && (
                <span className="text-red-500 text-xs">
                  {errors.jenis.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="nilai" className="text-sm font-medium">
                Nilai Kontak <span className="text-red-500">*</span>
              </label>
              <Input
                id="nilai"
                placeholder="Contoh: 08123456789, info@desa.com, www.desa.com"
                {...register("nilai")}
              />
              {errors.nilai && (
                <span className="text-red-500 text-xs">
                  {errors.nilai.message}
                </span>
              )}
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
                placeholder="Deskripsi tambahan tentang kontak ini"
                {...register("deskripsi")}
                rows={3}
              />
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
                {isSubmitting
                  ? "Menyimpan..."
                  : edit
                  ? "Simpan Perubahan"
                  : "Tambah Kontak"}
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
              Apakah Anda yakin ingin menghapus kontak ini? Tindakan ini tidak
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
