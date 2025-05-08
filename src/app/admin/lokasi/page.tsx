"use client";
import { useState, useEffect } from "react";
import { useLokasi } from "@/hooks/useLokasi";
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
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import the Map component with no SSR
const Map = dynamic(() => import("@/components/admin/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-muted rounded-md">
      <div className="animate-pulse text-muted-foreground">Memuat peta...</div>
    </div>
  ),
});

// Define the schema for form validation
const schema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  lat: z.string().min(1, "Latitude wajib diisi"),
  lng: z.string().min(1, "Longitude wajib diisi"),
  deskripsi: z.string().optional(),
});

// Infer TypeScript type from the schema
type FormValues = z.infer<typeof schema>;

// Define more specific types instead of using 'any'
interface Koordinat {
  lat: number;
  lng: number;
}

interface LokasiItem {
  _id: string;
  nama: string;
  alamat: string;
  koordinat?: Koordinat;
  deskripsi?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MapMarker {
  lat: number;
  lng: number;
  nama: string;
  alamat: string;
  deskripsi?: string;
}

export default function AdminLokasiPage() {
  const { lokasi, isLoading, createLokasi, deleteLokasi, updateLokasi } =
    useLokasi();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [edit, setEdit] = useState<LokasiItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -7.123, 110.456,
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Calculate map center based on markers when lokasi changes
  useEffect(() => {
    if (Array.isArray(lokasi) && lokasi.length > 0) {
      try {
        // Calculate the average of all coordinates
        const validLocations = lokasi.filter(
          (loc) =>
            loc &&
            loc.koordinat &&
            typeof loc.koordinat.lat === "number" &&
            typeof loc.koordinat.lng === "number"
        );

        if (validLocations.length === 0) return;

        const sumLat = validLocations.reduce(
          (sum, loc) => sum + loc.koordinat.lat,
          0
        );
        const sumLng = validLocations.reduce(
          (sum, loc) => sum + loc.koordinat.lng,
          0
        );

        const avgLat = sumLat / validLocations.length;
        const avgLng = sumLng / validLocations.length;

        // Check if the calculated values are valid numbers
        if (!isNaN(avgLat) && !isNaN(avgLng)) {
          setMapCenter([avgLat, avgLng]);
        }
      } catch (error) {
        console.error("Error calculating map center:", error);
        // Fall back to default center if there's an error
      }
    }
  }, [lokasi]);

  function handleEdit(item: LokasiItem) {
    setEdit(item);
    setValue("nama", item.nama || "");
    setValue("alamat", item.alamat || "");
    setValue("lat", String(item.koordinat?.lat || ""));
    setValue("lng", String(item.koordinat?.lng || ""));
    setValue("deskripsi", item.deskripsi || "");
    setOpen(true);
  }

  function handleAdd() {
    setEdit(null);
    reset({
      nama: "",
      alamat: "",
      lat: "",
      lng: "",
      deskripsi: "",
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
        await deleteLokasi(itemToDelete);
        toast.success("Lokasi berhasil dihapus");
      } catch (error) {
        console.error("Error deleting location:", error);
        toast.error("Gagal menghapus lokasi");
      } finally {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      // Validate coordinates before submission
      const lat = Number.parseFloat(values.lat);
      const lng = Number.parseFloat(values.lng);

      if (isNaN(lat) || isNaN(lng)) {
        toast.error(
          "Koordinat tidak valid. Pastikan nilai latitude dan longitude berupa angka."
        );
        return;
      }

      const payload = {
        nama: values.nama.trim(),
        alamat: values.alamat.trim(),
        koordinat: {
          lat,
          lng,
        },
        deskripsi: values.deskripsi ? values.deskripsi.trim() : "",
      };

      if (edit && edit._id) {
        await updateLokasi(edit._id, payload);
        toast.success("Lokasi berhasil diperbarui!");
      } else {
        await createLokasi(payload);
        toast.success("Lokasi berhasil ditambahkan!");
      }

      // Close the dialog and reset the form
      setOpen(false);
      reset();
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Gagal menyimpan lokasi");
    }
  }

  // Safely filter lokasi array, ensuring all properties exist
  const filteredLokasi = Array.isArray(lokasi)
    ? lokasi.filter((item) => {
        if (!item) return false;

        const nameMatch =
          item.nama &&
          typeof item.nama === "string" &&
          item.nama.toLowerCase().includes(searchQuery.toLowerCase());

        const addressMatch =
          item.alamat &&
          typeof item.alamat === "string" &&
          item.alamat.toLowerCase().includes(searchQuery.toLowerCase());

        const descriptionMatch =
          item.deskripsi &&
          typeof item.deskripsi === "string" &&
          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase());

        return nameMatch || addressMatch || descriptionMatch;
      })
    : [];

  // Function to open Google Maps with the coordinates
  const openInMaps = (lat?: number, lng?: number) => {
    if (
      typeof window !== "undefined" &&
      lat !== undefined &&
      lng !== undefined
    ) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } else {
      toast.error("Koordinat tidak valid untuk lokasi ini");
    }
  };

  // Convert lokasi data to map markers format with proper safety checks
  const mapMarkers: MapMarker[] = Array.isArray(lokasi)
    ? lokasi
        .filter(
          (item) =>
            item &&
            item.koordinat &&
            typeof item.koordinat.lat === "number" &&
            typeof item.koordinat.lng === "number"
        )
        .map((item) => ({
          lat: item.koordinat!.lat,
          lng: item.koordinat!.lng,
          nama: item.nama || "",
          alamat: item.alamat || "",
          deskripsi: item.deskripsi || "",
        }))
    : [];

  // Check if a location has valid coordinates
  const hasValidCoordinates = (item: LokasiItem): boolean => {
    return !!(
      item &&
      item.koordinat &&
      typeof item.koordinat.lat === "number" &&
      typeof item.koordinat.lng === "number" &&
      !isNaN(item.koordinat.lat) &&
      !isNaN(item.koordinat.lng)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kelola Lokasi Desa
          </h1>
          <p className="text-muted-foreground">
            Tambah, edit, dan hapus lokasi penting di desa
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 self-start">
          <Plus size={16} />
          Tambah Lokasi
        </Button>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <MapPin size={16} />
            Daftar Lokasi
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2">
            <Eye size={16} />
            Peta Lokasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Daftar Lokasi</CardTitle>
                  <CardDescription>
                    {!isLoading &&
                      `Menampilkan ${filteredLokasi?.length || 0} lokasi`}
                  </CardDescription>
                </div>
                <div className="w-full sm:w-auto relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari lokasi..."
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
              ) : filteredLokasi?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLokasi.map((item) => (
                    <Card key={item._id} className="overflow-hidden border">
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
                              {hasValidCoordinates(item) ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openInMaps(
                                      item.koordinat?.lat,
                                      item.koordinat?.lng
                                    )
                                  }
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                  Lihat di Maps
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem disabled>
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  Koordinat tidak valid
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Alamat:</p>
                          <p className="text-sm text-muted-foreground">
                            {item.alamat}
                          </p>

                          <p className="text-sm font-medium">Koordinat:</p>
                          {hasValidCoordinates(item) ? (
                            <p className="text-sm text-muted-foreground">
                              Lat: {item.koordinat?.lat}, Lng:{" "}
                              {item.koordinat?.lng}
                            </p>
                          ) : (
                            <p className="text-sm text-red-500">
                              Koordinat tidak valid
                            </p>
                          )}

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
                        {hasValidCoordinates(item) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              openInMaps(
                                item.koordinat?.lat,
                                item.koordinat?.lng
                              )
                            }
                          >
                            <MapPin size={14} />
                            Maps
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            disabled
                          >
                            <AlertCircle size={14} />
                            Koordinat Invalid
                          </Button>
                        )}
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
                      ? "Tidak ada lokasi yang sesuai dengan pencarian"
                      : "Belum ada data lokasi"}
                  </p>
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  ) : (
                    <Button onClick={handleAdd}>Tambah Lokasi Pertama</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Peta Lokasi Desa</CardTitle>
              <CardDescription>
                Visualisasi lokasi-lokasi penting di desa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(mapMarkers) && mapMarkers.length > 0 ? (
                <Map markers={mapMarkers} center={mapCenter} zoom={mapZoom} />
              ) : (
                <div className="relative w-full h-[400px] bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {isLoading
                        ? "Memuat data lokasi..."
                        : "Belum ada lokasi yang ditambahkan."}
                      <br />
                      {!isLoading && "Tambahkan lokasi untuk melihat peta."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            // Reset form when dialog is closed
            reset();
          }
          setOpen(newOpen);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {edit ? "Edit Lokasi" : "Tambah Lokasi"}
              </DialogTitle>
              <DialogDescription>
                {edit
                  ? "Perbarui informasi lokasi yang sudah ada"
                  : "Tambahkan lokasi baru ke daftar"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="nama" className="text-sm font-medium">
                Nama Lokasi
              </label>
              <Input
                id="nama"
                placeholder="Nama Lokasi"
                {...register("nama")}
              />
              {errors.nama && (
                <span className="text-red-500 text-xs">
                  {errors.nama.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="alamat" className="text-sm font-medium">
                Alamat
              </label>
              <Textarea
                id="alamat"
                placeholder="Alamat Lengkap"
                {...register("alamat")}
                rows={2}
              />
              {errors.alamat && (
                <span className="text-red-500 text-xs">
                  {errors.alamat.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="lat" className="text-sm font-medium">
                  Latitude
                </label>
                <Input id="lat" placeholder="Latitude" {...register("lat")} />
                {errors.lat && (
                  <span className="text-red-500 text-xs">
                    {errors.lat.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lng" className="text-sm font-medium">
                  Longitude
                </label>
                <Input id="lng" placeholder="Longitude" {...register("lng")} />
                {errors.lng && (
                  <span className="text-red-500 text-xs">
                    {errors.lng.message}
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
                placeholder="Deskripsi Lokasi"
                {...register("deskripsi")}
                rows={3}
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
                {edit ? "Simpan Perubahan" : "Tambah Lokasi"}
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
              Apakah Anda yakin ingin menghapus lokasi ini? Tindakan ini tidak
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
