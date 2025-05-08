"use client";

import { useState, useMemo } from "react";
import { useGaleri } from "@/hooks/useGaleri";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon, Search, Calendar, Filter, Loader2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function GaleriWargaPage() {
  const { galeri, isLoading, error } = useGaleri();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption: string;
    tanggal: string | Date;
    kategori?: string;
  } | null>(null);

  // Get all unique categories
  const categories = useMemo(() => {
    if (!galeri) return [];

    const uniqueCategories = Array.from(
      new Set(
        galeri
          .filter((item) => item.kategori && item.kategori.trim() !== "")
          .map((item) => item.kategori)
      )
    ).sort();

    return uniqueCategories;
  }, [galeri]);

  // Filter galeri based on search query and selected category
  const filteredGaleri = useMemo(() => {
    if (!galeri) return [];

    return galeri
      .filter((item) => {
        const matchesSearch = item.caption
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "semua" || item.kategori === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort(
        (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );
  }, [galeri, searchQuery, selectedCategory]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <ImageIcon className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Galeri Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Dokumentasi kegiatan dan momen penting dalam perjalanan
                pembangunan desa kita
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Search and Filter */}
          <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari galeri..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground hidden md:inline">
                    Kategori:
                  </span>
                  <Tabs
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="w-full md:w-auto overflow-x-auto flex-nowrap">
                      <TabsTrigger value="semua" className="flex-shrink-0">
                        Semua
                      </TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="flex-shrink-0"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-muted-foreground">Memuat galeri...</p>
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
          ) : filteredGaleri.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || selectedCategory !== "semua"
                  ? "Tidak ada foto yang sesuai dengan pencarian"
                  : "Belum ada foto dalam galeri"}
              </p>
              {(searchQuery || selectedCategory !== "semua") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("semua");
                  }}
                  className="mt-4"
                >
                  Reset Pencarian
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGaleri.map((item) => (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() =>
                    setSelectedImage({
                      url: item.gambar,
                      caption: item.caption,
                      tanggal: item.tanggal,
                      kategori: item.kategori,
                    })
                  }
                >
                  <div className="relative w-full h-[250px]">
                    <Image
                      src={item.gambar || "/placeholder.svg"}
                      alt={item.caption}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder.svg?height=250&width=400";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-medium line-clamp-2">
                        {item.caption}
                      </h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(item.tanggal)}</span>
                      </div>
                      {item.kategori && (
                        <span className="inline-block bg-purple-500/80 text-white text-xs px-2 py-1 rounded mt-2">
                          {item.kategori}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          {selectedImage && (
            <div className="flex flex-col">
              <div className="relative h-[500px] w-full">
                <Image
                  src={selectedImage.url || "/placeholder.svg"}
                  alt={selectedImage.caption}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder.svg?height=500&width=800";
                  }}
                />
              </div>
              <div className="p-4 bg-white">
                <h3 className="text-lg font-medium mb-1">
                  {selectedImage.caption}
                </h3>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(selectedImage.tanggal)}</span>
                </div>
                {selectedImage.kategori && (
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-2">
                    {selectedImage.kategori}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
