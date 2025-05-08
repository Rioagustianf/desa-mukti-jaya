"use client";

import { useState, useMemo } from "react";
import { usePrestasi, type PrestasiData } from "@/hooks/usePrestasi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, Trophy, Loader2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function PrestasiWargaPage() {
  const { prestasi, isLoading, error } = usePrestasi();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedPrestasi, setSelectedPrestasi] = useState<PrestasiData | null>(
    null
  );
  const [viewType, setViewType] = useState<"grid" | "timeline">("grid");

  // Get all unique categories
  const categories = useMemo(() => {
    if (!prestasi) return [];

    const uniqueCategories = Array.from(
      new Set(
        prestasi.filter((item) => item.category).map((item) => item.category)
      )
    ).sort();

    return uniqueCategories;
  }, [prestasi]);

  // Filter prestasi based on search query and selected category
  const filteredPrestasi = useMemo(() => {
    if (!prestasi) return [];

    return prestasi
      .filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "semua" || item.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prestasi, searchQuery, selectedCategory]);

  // Group prestasi by year for timeline view
  const prestasiByYear = useMemo(() => {
    if (!filteredPrestasi.length) return {};

    const grouped: Record<string, PrestasiData[]> = {};

    filteredPrestasi.forEach((item) => {
      const year = new Date(item.date).getFullYear().toString();

      if (!grouped[year]) {
        grouped[year] = [];
      }

      grouped[year].push(item);
    });

    return grouped;
  }, [filteredPrestasi]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
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
                <Trophy className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Prestasi Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Berbagai pencapaian dan penghargaan yang telah diraih oleh desa
                kita
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
                    placeholder="Cari prestasi..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 flex-col sm:flex-row">
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

                  <Tabs
                    value={viewType}
                    onValueChange={(value) =>
                      setViewType(value as "grid" | "timeline")
                    }
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="w-full sm:w-auto">
                      <TabsTrigger
                        value="grid"
                        className="flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        <span className="hidden sm:inline">Grid</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="timeline"
                        className="flex items-center gap-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <polyline points="19 12 12 19 5 12" />
                        </svg>
                        <span className="hidden sm:inline">Timeline</span>
                      </TabsTrigger>
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
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="text-muted-foreground">Memuat data prestasi...</p>
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
          ) : filteredPrestasi.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || selectedCategory !== "semua"
                  ? "Tidak ada prestasi yang sesuai dengan pencarian"
                  : "Belum ada data prestasi"}
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
            <>
              {/* Grid View */}
              {viewType === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPrestasi.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                      onClick={() => setSelectedPrestasi(item)}
                    >
                      <div className="relative h-48 w-full bg-muted">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.title}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.svg?height=384&width=768";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-50">
                            <Trophy className="h-12 w-12 text-amber-300" />
                          </div>
                        )}
                        {item.category && (
                          <Badge className="absolute top-2 right-2 bg-sky-700">
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {item.description}
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button variant="outline" size="sm" className="w-full">
                          Lihat Detail
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Timeline View */}
              {viewType === "timeline" && (
                <div className="relative">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-sky-800 transform md:translate-x-px"></div>

                  {/* Timeline Items */}
                  <div className="space-y-12">
                    {Object.entries(prestasiByYear)
                      .sort(
                        ([yearA], [yearB]) =>
                          Number.parseInt(yearB) - Number.parseInt(yearA)
                      )
                      .map(([year, items]) => (
                        <div key={year} className="relative">
                          {/* Year Badge */}
                          <div className="absolute left-0 md:left-1/2 top-0 w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center transform -translate-y-1/2 md:-translate-x-1/2 z-10">
                            <span className="font-bold">{year}</span>
                          </div>

                          <div className="ml-8 md:ml-0 pt-8">
                            {items.map((item, index) => (
                              <div
                                key={item.id}
                                className={`relative flex flex-col ${
                                  index % 2 === 0
                                    ? "md:flex-row"
                                    : "md:flex-row-reverse"
                                } gap-8 items-start mb-12 last:mb-0`}
                              >
                                {/* Content Card */}
                                <div
                                  className={`w-full md:w-[calc(50%-2rem)] ${
                                    index % 2 === 0 ? "md:text-right" : ""
                                  }`}
                                >
                                  <Card
                                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedPrestasi(item)}
                                  >
                                    {item.imageUrl && (
                                      <div className="relative h-48 w-full bg-muted">
                                        <Image
                                          src={
                                            item.imageUrl || "/placeholder.svg"
                                          }
                                          alt={item.title}
                                          fill
                                          className="object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                              "/placeholder.svg?height=384&width=768";
                                          }}
                                        />
                                      </div>
                                    )}
                                    <CardContent className="p-4">
                                      <div className="flex items-center text-sm text-muted-foreground gap-1 mb-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(item.date)}</span>
                                      </div>
                                      <h3 className="font-bold text-lg mb-2">
                                        {item.title}
                                      </h3>
                                      <p className="text-sm text-gray-600 line-clamp-3">
                                        {item.description}
                                      </p>

                                      {item.category && (
                                        <Badge className="mt-3 bg-sky-600 text-white">
                                          {item.category}
                                        </Badge>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Timeline Dot */}
                                <div className="absolute left-0 md:left-1/2 top-6 w-4 h-4 rounded-full bg-sky-600 border-4 border-white transform md:-translate-x-1/2"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPrestasi}
        onOpenChange={(open) => !open && setSelectedPrestasi(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          {selectedPrestasi && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedPrestasi.title}
                </DialogTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-1 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(selectedPrestasi.date)}</span>

                  {selectedPrestasi.category && (
                    <>
                      <span className="mx-2">•</span>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-800 hover:bg-amber-100"
                      >
                        {selectedPrestasi.category}
                      </Badge>
                    </>
                  )}
                </div>
              </DialogHeader>

              {selectedPrestasi.imageUrl && (
                <div className="relative h-64 w-full rounded-md overflow-hidden my-4">
                  <Image
                    src={selectedPrestasi.imageUrl || "/placeholder.svg"}
                    alt={selectedPrestasi.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.svg?height=384&width=768";
                    }}
                  />
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Deskripsi
                  </h4>
                  <p className="whitespace-pre-line">
                    {selectedPrestasi.description}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
