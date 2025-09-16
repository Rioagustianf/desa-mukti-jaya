"use client";

import { useState, useEffect } from "react";
import {
  usePengajuanSurat,
  type PengajuanSuratItem,
} from "@/hooks/usePengajuanSurat";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Loader2,
  Eye,
  Trash2,
  Calendar,
  User,
  MapPin,
  Phone,
  FileCheck,
  ImageIcon,
  X,
  RefreshCw,
  AlertTriangle,
  FileText as FileTextIcon,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Image from "next/image";
import { usePengajuanSuratDetail } from "@/hooks/usePengajuanSurat";

export default function AdminPengajuanSuratPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedJenisSurat, setSelectedJenisSurat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<PengajuanSuratItem | null>(null);
  const [selectedPengajuanId, setSelectedPengajuanId] = useState<string | null>(
    null
  );
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);

  // Prepare filters for the API
  const filters: { status?: string; jenisSurat?: string; search?: string } = {};
  if (selectedStatus !== "all") filters.status = selectedStatus;
  if (selectedJenisSurat !== "all") filters.jenisSurat = selectedJenisSurat;
  if (searchQuery) filters.search = searchQuery;

  const {
    pengajuan = [],
    isLoading,
    isError,
    error,
    updateStatus,
    deletePengajuan,
    mutate: mutatePengajuanList,
  } = usePengajuanSurat(filters);

  // Fetch detail data when viewing a specific pengajuan
  const {
    pengajuan: detailPengajuan,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
    mutate: mutateDetail,
  } = usePengajuanSuratDetail(selectedPengajuanId || "");

  // Update selected pengajuan when detail data is loaded
  useEffect(() => {
    if (detailPengajuan && !isLoadingDetail) {
      setSelectedPengajuan(detailPengajuan);
    }
  }, [detailPengajuan, isLoadingDetail]);

  const handleViewDetail = (item: PengajuanSuratItem) => {
    setSelectedPengajuanId(item._id);
    setDetailOpen(true);
  };

  const handleDeleteConfirm = (item: PengajuanSuratItem) => {
    setSelectedPengajuan(item);
    setDeleteDialogOpen(true);
  };

  const handleStatusUpdate = (item: PengajuanSuratItem) => {
    setSelectedPengajuanId(item._id);
    setNewStatus(item.status);
    setCatatan(item.catatan || "");
    setStatusUpdateOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPengajuan) return;

    setIsSubmitting(true);
    try {
      await deletePengajuan(selectedPengajuan._id);
      toast.success("Pengajuan berhasil dihapus");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Gagal menghapus pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!selectedPengajuanId || !newStatus) return;

    setIsSubmitting(true);
    try {
      await updateStatus(selectedPengajuanId, newStatus, catatan);
      toast.success("Status berhasil diperbarui");
      setStatusUpdateOpen(false);

      // Refresh data
      mutatePengajuanList();
      if (detailOpen) {
        mutateDetail();
      }
    } catch (error) {
      toast.error("Gagal memperbarui status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImagePreview = (url: string) => {
    setImagePreviewUrl(url);
    setImagePreviewOpen(true);
  };

  // Generate letter function
  const handleGenerateLetter = async (item: PengajuanSuratItem) => {
    if (isGeneratingLetter) return;

    setIsGeneratingLetter(true);
    try {
      const response = await fetch(`/api/admin/generate-letter/${item._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Surat berhasil dibuat!");
        // Refresh the data
        mutatePengajuanList();
        if (detailOpen && selectedPengajuanId === item._id) {
          mutateDetail();
        }
      } else {
        toast.error(result.message || "Gagal membuat surat");
      }
    } catch (error) {
      console.error("Error generating letter:", error);
      toast.error("Terjadi kesalahan saat membuat surat");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          >
            Menunggu
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-200"
          >
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-200"
          >
            Ditolak
          </Badge>
        );
      case "revision":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Perlu Revisi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get jenis surat name
  const getJenisSuratName = (item: PengajuanSuratItem) => {
    if (typeof item.jenisSurat === "object" && item.jenisSurat !== null) {
      return item.jenisSurat.nama;
    } else if (item.kodeSurat) {
      // Fallback to kodeSurat if jenisSurat is not an object
      return item.kodeSurat;
    } else if (typeof item.jenisSurat === "string") {
      // If jenisSurat is a string (ID or type)
      if (item.jenisSurat === "domisili") return "Surat Domisili";
      if (item.jenisSurat === "pindah") return "Surat Pindah";
      return item.jenisSurat;
    }
    return "Tidak diketahui";
  };

  // Helper function to get jenis surat type
  const getJenisSuratType = (item: PengajuanSuratItem) => {
    if (typeof item.jenisSurat === "object" && item.jenisSurat !== null) {
      return item.jenisSurat.tipeForm;
    } else if (typeof item.jenisSurat === "string") {
      // If jenisSurat is a string, it might be the type itself
      if (item.jenisSurat === "domisili" || item.jenisSurat === "pindah") {
        return item.jenisSurat;
      }
    }
    // Try to infer from other fields
    if (item.alamatTujuan) return "pindah";
    return "domisili"; // Default fallback
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengajuan Surat</h1>
        <p className="text-muted-foreground">
          Kelola pengajuan surat dari warga
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Daftar Pengajuan</CardTitle>
              <CardDescription>
                {!isLoading && `Menampilkan ${pengajuan.length} pengajuan`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => mutatePengajuanList()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama, NIK, atau nomor WA..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              value={selectedJenisSurat}
              onValueChange={setSelectedJenisSurat}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Jenis Surat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="domisili">Surat Domisili</SelectItem>
                <SelectItem value="pindah">Surat Pindah</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="revision">Perlu Revisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat data...
              </div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-40">
              <div className="text-destructive">
                Terjadi kesalahan saat memuat data:{" "}
                {error?.message || "Silakan coba lagi nanti."}
              </div>
            </div>
          ) : pengajuan.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery ||
                selectedStatus !== "all" ||
                selectedJenisSurat !== "all"
                  ? "Tidak ada pengajuan yang sesuai dengan filter"
                  : "Belum ada pengajuan surat"}
              </p>
              {(searchQuery ||
                selectedStatus !== "all" ||
                selectedJenisSurat !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedStatus("all");
                    setSelectedJenisSurat("all");
                  }}
                  className="mt-4"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis Surat</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengajuan.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.nama}</TableCell>
                      <TableCell>{getJenisSuratName(item)}</TableCell>
                      <TableCell>{formatDate(item.tanggalPengajuan)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(item)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Detail</span>
                          </Button>

                          {/* Generate Letter Button - Show for pending/approved items that don't have letters yet */}
                          {(item.status === "pending" ||
                            item.status === "approved") &&
                            !item.letterGenerated && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleGenerateLetter(item)}
                                disabled={isGeneratingLetter}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                {isGeneratingLetter ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileTextIcon className="h-4 w-4" />
                                )}
                                <span className="sr-only">Generate Surat</span>
                              </Button>
                            )}

                          {/* Download Letter Button - Show for approved items with generated letters */}
                          {item.status === "approved" &&
                            item.letterGenerated &&
                            item.letterUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(item.letterUrl, "_blank")
                                }
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                              >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download Surat</span>
                              </Button>
                            )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(item)}
                          >
                            <FileCheck className="h-4 w-4" />
                            <span className="sr-only">Update Status</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteConfirm(item)}
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

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {isLoadingDetail ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Memuat detail pengajuan...</p>
              </div>
            </div>
          ) : isErrorDetail ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground text-center mb-6">
                {errorDetail?.message || "Gagal memuat detail pengajuan"}
              </p>
              <Button onClick={() => mutateDetail()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          ) : selectedPengajuan ? (
            <>
              <DialogHeader>
                <DialogTitle>Detail Pengajuan Surat</DialogTitle>
                <DialogDescription>
                  {getJenisSuratName(selectedPengajuan)} -{" "}
                  {getStatusBadge(selectedPengajuan.status)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Tanggal Pengajuan
                    </p>
                    <p>{formatDate(selectedPengajuan.tanggalPengajuan)}</p>
                  </div>

                  {selectedPengajuan.tanggalUpdate && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Terakhir Diperbarui
                      </p>
                      <p>{formatDate(selectedPengajuan.tanggalUpdate)}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Data Pemohon</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Nama Lengkap
                      </p>
                      <p>{selectedPengajuan.nama}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">NIK</p>
                      <p>{selectedPengajuan.nik}</p>
                    </div>

                    {selectedPengajuan.tempatLahir &&
                      selectedPengajuan.tanggalLahir && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Tempat, Tanggal Lahir
                          </p>
                          <p>
                            {selectedPengajuan.tempatLahir},{" "}
                            {selectedPengajuan.tanggalLahir}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {selectedPengajuan.alamat && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Alamat
                    </h3>
                    <p className="mb-2">{selectedPengajuan.alamat}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedPengajuan.rt && selectedPengajuan.rw && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">RT/RW</p>
                          <p>
                            {selectedPengajuan.rt}/{selectedPengajuan.rw}
                          </p>
                        </div>
                      )}

                      {selectedPengajuan.desa && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Desa</p>
                          <p>{selectedPengajuan.desa}</p>
                        </div>
                      )}

                      {selectedPengajuan.kecamatan && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Kecamatan</p>
                          <p>{selectedPengajuan.kecamatan}</p>
                        </div>
                      )}

                      {selectedPengajuan.kabupaten && (
                        <div className="space-y-1 md:col-span-3">
                          <p className="text-sm font-medium">Kabupaten</p>
                          <p>{selectedPengajuan.kabupaten}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Kontak</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telepon WhatsApp
                      </p>
                      <p>{selectedPengajuan.teleponWA}</p>
                    </div>
                  </div>
                </div>

                {selectedPengajuan.keperluan && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Keperluan</h3>
                    <p>{selectedPengajuan.keperluan}</p>
                  </div>
                )}

                {getJenisSuratType(selectedPengajuan) === "pindah" &&
                  selectedPengajuan.alamatTujuan && (
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-3">
                        Data Kepindahan
                      </h3>

                      {selectedPengajuan.alasanPindah && (
                        <div className="space-y-1 mb-3">
                          <p className="text-sm font-medium">Alasan Pindah</p>
                          <p>{selectedPengajuan.alasanPindah}</p>
                        </div>
                      )}

                      <h4 className="text-md font-medium mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Alamat Tujuan
                      </h4>
                      <p className="mb-2">{selectedPengajuan.alamatTujuan}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {selectedPengajuan.rtTujuan &&
                          selectedPengajuan.rwTujuan && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium">RT/RW</p>
                              <p>
                                {selectedPengajuan.rtTujuan}/
                                {selectedPengajuan.rwTujuan}
                              </p>
                            </div>
                          )}

                        {selectedPengajuan.desaTujuan && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Desa</p>
                            <p>{selectedPengajuan.desaTujuan}</p>
                          </div>
                        )}

                        {selectedPengajuan.kecamatanTujuan && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Kecamatan</p>
                            <p>{selectedPengajuan.kecamatanTujuan}</p>
                          </div>
                        )}

                        {selectedPengajuan.kabupatenTujuan && (
                          <div className="space-y-1 md:col-span-3">
                            <p className="text-sm font-medium">Kabupaten</p>
                            <p>{selectedPengajuan.kabupatenTujuan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Dokumen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Prioritaskan dokumen dari field terpisah jika ada */}
                    {selectedPengajuan.fotoKTP && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">KTP</p>
                        <div className="relative border rounded-md overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={
                                selectedPengajuan.fotoKTP || "/placeholder.svg"
                              }
                              alt="KTP"
                              fill
                              className="object-cover cursor-pointer"
                              onClick={() =>
                                handleImagePreview(
                                  selectedPengajuan.fotoKTP || ""
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                            onClick={() =>
                              handleImagePreview(
                                selectedPengajuan.fotoKTP || ""
                              )
                            }
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedPengajuan.fotoKK && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Kartu Keluarga</p>
                        <div className="relative border rounded-md overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={
                                selectedPengajuan.fotoKK || "/placeholder.svg"
                              }
                              alt="Kartu Keluarga"
                              fill
                              className="object-cover cursor-pointer"
                              onClick={() =>
                                handleImagePreview(
                                  selectedPengajuan.fotoKK || ""
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                            onClick={() =>
                              handleImagePreview(selectedPengajuan.fotoKK || "")
                            }
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedPengajuan.fotoSuratKeterangan && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Surat Keterangan</p>
                        <div className="relative border rounded-md overflow-hidden">
                          <div className="aspect-[4/3] relative">
                            <Image
                              src={
                                selectedPengajuan.fotoSuratKeterangan ||
                                "/placeholder.svg"
                              }
                              alt="Surat Keterangan"
                              fill
                              className="object-cover cursor-pointer"
                              onClick={() =>
                                handleImagePreview(
                                  selectedPengajuan.fotoSuratKeterangan || ""
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                            onClick={() =>
                              handleImagePreview(
                                selectedPengajuan.fotoSuratKeterangan || ""
                              )
                            }
                          >
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tampilkan dokumen dari array hanya jika tidak ada field terpisah atau jika ada dokumen tambahan */}
                    {selectedPengajuan.dokumen &&
                      selectedPengajuan.dokumen.length > 0 &&
                      selectedPengajuan.dokumen
                        // Filter dokumen yang sudah ditampilkan dari field terpisah
                        .filter(
                          (url) =>
                            (!selectedPengajuan.fotoKTP ||
                              url !== selectedPengajuan.fotoKTP) &&
                            (!selectedPengajuan.fotoKK ||
                              url !== selectedPengajuan.fotoKK) &&
                            (!selectedPengajuan.fotoSuratKeterangan ||
                              url !== selectedPengajuan.fotoSuratKeterangan)
                        )
                        .map((url, index) => (
                          <div key={index} className="space-y-2">
                            <p className="text-sm font-medium">
                              Dokumen {index + 1}
                            </p>
                            <div className="relative border rounded-md overflow-hidden">
                              <div className="aspect-[4/3] relative">
                                <Image
                                  src={url || "/placeholder.svg"}
                                  alt={`Dokumen ${index + 1}`}
                                  fill
                                  className="object-cover cursor-pointer"
                                  onClick={() => handleImagePreview(url)}
                                />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                onClick={() => handleImagePreview(url)}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>

                {selectedPengajuan.catatan && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">Catatan Admin</h3>
                    <p>{selectedPengajuan.catatan}</p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Tutup
                </Button>

                {/* Generate Letter Button in Detail Dialog */}
                {(selectedPengajuan.status === "pending" ||
                  selectedPengajuan.status === "approved") &&
                  !selectedPengajuan.letterGenerated && (
                    <Button
                      onClick={() => {
                        handleGenerateLetter(selectedPengajuan);
                      }}
                      disabled={isGeneratingLetter}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isGeneratingLetter ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileTextIcon className="mr-2 h-4 w-4" />
                      )}
                      Generate Surat
                    </Button>
                  )}

                {/* Download Letter Button in Detail Dialog */}
                {selectedPengajuan.status === "approved" &&
                  selectedPengajuan.letterGenerated &&
                  selectedPengajuan.letterUrl && (
                    <Button
                      onClick={() =>
                        window.open(selectedPengajuan.letterUrl, "_blank")
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Surat
                    </Button>
                  )}

                <Button
                  onClick={() => {
                    setDetailOpen(false);
                    handleStatusUpdate(selectedPengajuan);
                  }}
                >
                  Update Status
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-muted-foreground">Data tidak ditemukan</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={setStatusUpdateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedPengajuan && (
            <>
              <DialogHeader>
                <DialogTitle>Update Status Pengajuan</DialogTitle>
                <DialogDescription>
                  Perbarui status pengajuan surat{" "}
                  {getJenisSuratName(selectedPengajuan)} untuk{" "}
                  {selectedPengajuan.nama}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="approved">Disetujui</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                      <SelectItem value="revision">Perlu Revisi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Catatan (Opsional)
                  </label>
                  <Textarea
                    placeholder="Tambahkan catatan untuk pengajuan ini"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStatusUpdateOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button onClick={confirmStatusUpdate} disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengajuan surat ini? Tindakan
              ini tidak dapat dibatalkan.
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

      {/* Image Preview Dialog */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Preview Gambar</DialogTitle>
          </DialogHeader>
          {imagePreviewUrl && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={imagePreviewUrl || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-contain"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                onClick={() => setImagePreviewOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
