"use client";
import useSWR from "swr";
import type React from "react";

import axios from "axios";
import { useState, useRef } from "react";
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
import { toast } from "sonner";
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
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";

const fetcher = (url: string) => axios.get(url).then((res) => res.data.data);

export default function FasilitasAdminPage() {
  const { data, mutate, isLoading } = useSWR("/api/fasilitas", fetcher);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<any>(null);
  const [form, setForm] = useState({ nama: "", deskripsi: "", gambar: "" });
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleEdit(item: any) {
    setEdit(item);
    setForm(item);
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    setForm({ nama: "", deskripsi: "", gambar: "" });
    setOpen(true);
  }

  function handleDeleteConfirm(id: string) {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (itemToDelete) {
      try {
        await axios.delete(`/api/fasilitas/${itemToDelete}`);
        toast.success("Fasilitas berhasil dihapus");
        mutate();
      } catch (error) {
        toast.error("Gagal menghapus fasilitas");
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (edit?._id) {
        await axios.put(`/api/fasilitas/${edit._id}`, form);
        toast.success("Fasilitas berhasil diperbarui!");
      } else {
        await axios.post("/api/fasilitas", form);
        toast.success("Fasilitas berhasil ditambahkan!");
      }
      setOpen(false);
      mutate();
    } catch (error) {
      toast.error("Gagal menyimpan fasilitas");
    }
  }

  // Handler untuk tombol upload
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handler untuk file yang dipilih
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Validasi ukuran file (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setForm((prev) => ({ ...prev, gambar: response.data.url }));
        toast.success("Gambar berhasil diunggah");
      } else {
        toast.error(response.data.message || "Gagal mengunggah gambar");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunggah gambar");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Hapus gambar dari form
  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, gambar: "" }));
  };

  const filteredData = data?.filter(
    (item: any) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Fasilitas Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus fasilitas yang ada di desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Fasilitas
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Fasilitas</CardTitle>
              <CardDescription>
                {!isLoading &&
                  `Menampilkan ${filteredData?.length || 0} fasilitas`}
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari fasilitas..."
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
          ) : filteredData?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((item: any) => (
                <Card key={item._id} className="overflow-hidden border">
                  <div className="relative h-40 w-full bg-muted">
                    {item.gambar ? (
                      <Image
                        src={item.gambar || "/placeholder.svg"}
                        alt={item.nama}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=160&width=320";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        Tidak ada gambar
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{item.nama}</CardTitle>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Pratinjau
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.deskripsi}
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
                  ? "Tidak ada fasilitas yang sesuai dengan pencarian"
                  : "Belum ada data fasilitas"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Reset Pencarian
                </Button>
              ) : (
                <Button onClick={handleAdd}>Tambah Fasilitas Pertama</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Fasilitas" : "Tambah Fasilitas"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi fasilitas yang sudah ada"
                  : "Tambahkan fasilitas baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Fasilitas
              </label>
              <Input
                id="nama"
                placeholder="Nama Fasilitas"
                value={form.nama}
                onChange={(e) =>
                  setForm((f) => ({ ...f, nama: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi Fasilitas"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deskripsi: e.target.value }))
                }
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gambar</label>

              {form.gambar ? (
                <div className="mt-2 relative h-40 w-full rounded-md overflow-hidden border">
                  <Image
                    src={form.gambar}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=160&width=320";
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                    onClick={handleRemoveImage}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="gambar-url" className="text-sm">
                      URL Gambar
                    </label>
                    <Input
                      id="gambar-url"
                      placeholder="URL Gambar (opsional)"
                      value={form.gambar}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, gambar: e.target.value }))
                      }
                      className="flex-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-full border-t" />
                    <span className="text-xs text-muted-foreground">ATAU</span>
                    <div className="w-full border-t" />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleUploadClick}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Unggah Gambar
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Format: JPG, PNG, GIF (Maks. 5MB)
                  </p>
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
              <Button type="submit" disabled={uploading}>
                {edit ? "Simpan Perubahan" : "Tambah Fasilitas"}
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
              Apakah Anda yakin ingin menghapus fasilitas ini? Tindakan ini
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
