"use client";

import { useState, useMemo, useEffect } from "react";
import { useLayanan } from "@/hooks/useLayanan";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Loader2,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  ListChecks,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";

// Create a separate component for content that uses useSearchParams
function LayananContent() {
  const { layanan, isLoading, error } = useLayanan();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [expandedLayanan, setExpandedLayanan] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.substring(1);
    if (hash && layanan) {
      const targetLayanan = layanan.find((item) => item._id === hash);
      if (targetLayanan) {
        setExpandedLayanan(hash);

        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            element.classList.add("ring-2", "ring-primary", "ring-offset-2");
            setTimeout(() => {
              element.classList.remove(
                "ring-2",
                "ring-primary",
                "ring-offset-2"
              );
            }, 3000);
          }
        }, 500);
      }
    }
  }, [layanan]);

  // Filter layanan based on search query and selected category
  const filteredLayanan = useMemo(() => {
    if (!layanan) return [];

    return layanan.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.persyaratan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.prosedur &&
          item.prosedur.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesCategory = true;
      if (selectedCategory === "gratis") {
        matchesCategory =
          !item.biaya || item.biaya.toLowerCase().includes("gratis");
      } else if (selectedCategory === "berbayar") {
        matchesCategory =
          !!item.biaya && !item.biaya.toLowerCase().includes("gratis");
      }

      return matchesSearch && matchesCategory;
    });
  }, [layanan, searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedLayanan(expandedLayanan === id ? null : id);
  };

  return (
    <>
      {/* Search and Filter */}
      <Card className="mb-8 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari layanan..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="w-full md:w-auto"
            >
              <TabsList className="w-full md:w-auto">
                <TabsTrigger value="semua">Semua Layanan</TabsTrigger>
                <TabsTrigger value="gratis">Gratis</TabsTrigger>
                <TabsTrigger value="berbayar">Berbayar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Memuat data layanan...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </div>
      ) : filteredLayanan.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            {searchQuery || selectedCategory !== "semua"
              ? "Tidak ada layanan yang sesuai dengan pencarian"
              : "Belum ada data layanan"}
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
        <div className="space-y-6">
          {filteredLayanan.map((item) => (
            <Card
              key={item._id}
              id={item._id}
              className={`overflow-hidden shadow-md transition-all duration-300 ${
                expandedLayanan === item._id ? "shadow-lg" : ""
              }`}
            >
              <CardHeader
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(item._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600 mt-1">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{item.nama}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {item.deskripsi}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item._id);
                      }}
                    >
                      {expandedLayanan === item._id ? "Tutup" : "Detail"}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedLayanan === item._id ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                    <div className="flex flex-wrap gap-2 justify-end mt-1">
                      {item.biaya && (
                        <Badge
                          className={
                            item.biaya.toLowerCase().includes("gratis")
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {item.biaya}
                        </Badge>
                      )}
                      {item.waktu && (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.waktu}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              {expandedLayanan === item._id && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        <span>Deskripsi Layanan</span>
                      </h3>
                      <p className="text-muted-foreground">{item.deskripsi}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-blue-600" />
                        <span>Persyaratan</span>
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-md">
                        {item.persyaratan.split("\n").map((req, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 mb-2"
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>{req}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {item.prosedur && (
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                          <ListChecks className="h-5 w-5 text-blue-600" />
                          <span>Prosedur</span>
                        </h3>
                        <div className="bg-slate-50 p-4 rounded-md">
                          {item.prosedur.split("\n").map((step, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 mb-2"
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                                {index + 1}
                              </div>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {item.jadwalPelayanan && (
                        <div className="bg-slate-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>Jadwal Pelayanan</span>
                          </h4>
                          <p>{item.jadwalPelayanan}</p>
                        </div>
                      )}

                      {item.biaya && (
                        <div className="bg-slate-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-blue-600" />
                            <span>Biaya</span>
                          </h4>
                          <p>{item.biaya}</p>
                        </div>
                      )}

                      {item.waktu && (
                        <div className="bg-slate-50 p-4 rounded-md">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>Waktu Proses</span>
                          </h4>
                          <p>{item.waktu}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// Loading fallback for the Suspense boundary
function LayananLoadingFallback() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground">Memuat halaman layanan...</p>
      </div>
    </div>
  );
}

export default function LayananAdministrasiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section - No hooks used here, so no need for Suspense */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Layanan Administrasi
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Informasi lengkap tentang layanan administrasi yang tersedia di
                kantor desa
              </p>
              <Link
                href="/layanan-administrasi/ajukan"
                className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300"
              >
                Ajukan Pembuatan Surat
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <LayananContent />
        </div>
      </div>
    </div>
  );
}
