"use client";

import { useState, useMemo } from "react";
import { usePanduan, type PanduanItem } from "@/hooks/usePanduan";
import { useLayanan } from "@/hooks/useLayanan";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ClipboardList,
  Loader2,
  FileText,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation"; // Changed from next/router to next/navigation

export default function PanduanWargaPage() {
  const {
    panduan,
    isLoading: isLoadingPanduan,
    error: errorPanduan,
  } = usePanduan();
  const { layanan, isLoading: isLoadingLayanan } = useLayanan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedPanduan, setSelectedPanduan] = useState<PanduanItem | null>(
    null
  );
  const router = useRouter(); // This is now from next/navigation

  // Get all unique categories based on layananTerkait
  const categories = useMemo(() => {
    if (!panduan) return [];

    const uniqueCategories = Array.from(
      new Set(
        panduan
          .filter(
            (item) => item.layananTerkait && item.layananTerkait.trim() !== ""
          )
          .map((item) => item.layananTerkait)
      )
    ).sort();

    return uniqueCategories;
  }, [panduan]);

  // Filter panduan based on search query and selected category
  const filteredPanduan = useMemo(() => {
    if (!panduan) return [];

    return panduan.filter((item) => {
      const matchesSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.layananTerkait &&
          item.layananTerkait
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "semua" ||
        (item.layananTerkait &&
          item.layananTerkait.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [panduan, searchQuery, selectedCategory]);

  // Find related layanan for a panduan
  const findRelatedLayanan = (layananTerkait: string | undefined) => {
    if (!layananTerkait || !layanan) return null;
    return layanan.find(
      (item) => item.nama.toLowerCase() === layananTerkait.toLowerCase()
    );
  };

  // Navigate to related service
  const navigateToLayanan = (layananName: string) => {
    const relatedLayanan = findRelatedLayanan(layananName);
    if (relatedLayanan) {
      setSelectedPanduan(null);
      router.push(`/layanan-administrasi/informasi#${relatedLayanan._id}`);
    }
  };

  const isLoading = isLoadingPanduan || isLoadingLayanan;
  const error = errorPanduan;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Panduan Administrasi
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Informasi dan petunjuk lengkap untuk mengurus berbagai keperluan
                administrasi di desa
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
                    placeholder="Cari panduan..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {categories.length > 0 && (
                  <Tabs
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="w-full md:w-auto overflow-x-auto flex-nowrap">
                      <TabsTrigger value="semua" className="flex-shrink-0">
                        Semua Panduan
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
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                <p className="text-muted-foreground">Memuat data panduan...</p>
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
          ) : filteredPanduan.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || selectedCategory !== "semua"
                  ? "Tidak ada panduan yang sesuai dengan pencarian"
                  : "Belum ada data panduan"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPanduan.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPanduan(item)}
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-100 p-2 rounded-full text-teal-600 mt-1">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{item.judul}</CardTitle>
                        {item.layananTerkait && (
                          <Badge className="mt-2 bg-teal-100 text-teal-800 hover:bg-teal-200">
                            {item.layananTerkait}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-2">
                    <p className="text-muted-foreground line-clamp-3">
                      {item.isi}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-2">
                    <Button variant="ghost" size="sm" className="ml-auto gap-1">
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPanduan}
        onOpenChange={(open) => !open && setSelectedPanduan(null)}
      >
        <DialogContent className="sm:max-w-[700px]">
          {selectedPanduan && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-2xl">
                    {selectedPanduan.judul}
                  </DialogTitle>
                </div>
                {selectedPanduan.layananTerkait && (
                  <Badge className="mt-2 bg-teal-100 text-teal-800 hover:bg-teal-200">
                    {selectedPanduan.layananTerkait}
                  </Badge>
                )}
              </DialogHeader>

              <Separator className="my-4" />

              <div className="prose max-w-none">
                {selectedPanduan.isi.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {selectedPanduan.layananTerkait && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-slate-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-teal-600" />
                      <span>Layanan Terkait</span>
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Panduan ini terkait dengan layanan administrasi{" "}
                      {selectedPanduan.layananTerkait}
                    </p>
                    {findRelatedLayanan(selectedPanduan.layananTerkait) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() =>
                          navigateToLayanan(
                            selectedPanduan.layananTerkait || ""
                          )
                        }
                      >
                        <span>Lihat Detail Layanan</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
