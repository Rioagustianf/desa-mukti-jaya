"use client";

import { useState } from "react";
import { useFasilitas, type FasilitasData } from "@/hooks/useFasilitas";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Search,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function FasilitasWargaPage() {
  const { fasilitas, isLoading, error } = useFasilitas();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFasilitas, setSelectedFasilitas] =
    useState<FasilitasData | null>(null);

  // Filter fasilitas based on search query
  const filteredFasilitas = fasilitas
    ?.filter((item) => {
      return (
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.deskripsi &&
          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => a.nama.localeCompare(b.nama));

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-900  text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Fasilitas Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Temukan berbagai fasilitas dan layanan yang tersedia di desa
                kami untuk memenuhi kebutuhan warga
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Search */}
          <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari fasilitas..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-muted-foreground">
                  Memuat fasilitas desa...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Coba Lagi
              </Button>
            </div>
          ) : filteredFasilitas?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFasilitas.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                  onClick={() => setSelectedFasilitas(item)}
                >
                  <div className="relative h-48 w-full bg-muted">
                    {item.gambar ? (
                      <Image
                        src={item.gambar || "/placeholder.svg"}
                        alt={item.nama}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg?height=384&width=768";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <Building2 className="h-12 w-12 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="font-bold text-lg mb-2">{item.nama}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.deskripsi}
                    </p>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery
                  ? "Tidak ada fasilitas yang sesuai dengan pencarian"
                  : "Belum ada data fasilitas"}
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
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedFasilitas}
        onOpenChange={(open) => !open && setSelectedFasilitas(null)}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          {selectedFasilitas && (
            <>
              <div className="relative h-56 w-full bg-muted">
                {selectedFasilitas.gambar ? (
                  <Image
                    src={selectedFasilitas.gambar || "/placeholder.svg"}
                    alt={selectedFasilitas.nama}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.svg?height=384&width=768";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                    <Building2 className="h-16 w-16 text-emerald-300" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedFasilitas.nama}
                  </DialogTitle>
                </DialogHeader>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Deskripsi
                    </h4>
                    <p className="whitespace-pre-line">
                      {selectedFasilitas.deskripsi}
                    </p>
                  </div>

                  {selectedFasilitas.createdAt && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mt-0.5" />
                      <span>
                        Ditambahkan pada:{" "}
                        {formatDate(selectedFasilitas.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
