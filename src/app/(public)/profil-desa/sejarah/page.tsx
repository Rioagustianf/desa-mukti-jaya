"use client";

import { useState, useEffect } from "react";
import { useSejarah } from "@/hooks/useSejarah";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Clock, Search, History } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SejarahWargaPage() {
  const { sejarah, isLoading } = useSejarah();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periods, setPeriods] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Extract unique periods (decades) from years
  useEffect(() => {
    if (sejarah && sejarah.length > 0) {
      const uniquePeriods = Array.from(
        new Set(
          sejarah.map((item) => {
            const year = Number.parseInt(item.tahun);
            // Group by decade (1900s, 1910s, etc.)
            return `${Math.floor(year / 10) * 10}an`;
          })
        )
      ).sort();
      setPeriods(uniquePeriods);
    }
  }, [sejarah]);

  // Filter sejarah based on search query and selected period
  const filteredSejarah = sejarah
    ?.filter((item) => {
      const matchesSearch =
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tahun.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPeriod = selectedPeriod
        ? Number.parseInt(item.tahun) >= Number.parseInt(selectedPeriod) &&
          Number.parseInt(item.tahun) < Number.parseInt(selectedPeriod) + 10
        : true;

      return matchesSearch && matchesPeriod;
    })
    .sort((a, b) => Number.parseInt(a.tahun) - Number.parseInt(b.tahun));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <History className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Sejarah Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Menelusuri perjalanan dan perkembangan desa kami dari masa ke
                masa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-5xl mx-auto">
          {/* Search and Filter */}
          <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari sejarah..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs
                  value={selectedPeriod || "all"}
                  onValueChange={(value) =>
                    setSelectedPeriod(value === "all" ? null : value)
                  }
                  className="w-full md:w-auto"
                >
                  <TabsList className="w-full md:w-auto">
                    <TabsTrigger value="all" className="flex-1 md:flex-initial">
                      Semua
                    </TabsTrigger>
                    {periods.map((period) => (
                      <TabsTrigger
                        key={period}
                        value={period.replace("an", "")}
                        className="flex-1 md:flex-initial"
                      >
                        {period}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                <p className="text-muted-foreground">Memuat sejarah desa...</p>
              </div>
            </div>
          ) : filteredSejarah?.length ? (
            <div className="relative">
              {/* Vertical Timeline Line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-amber-200 transform md:translate-x-px"></div>

              {/* Timeline Items */}
              <div className="space-y-12">
                {filteredSejarah.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex flex-col ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    } gap-8 items-center`}
                    onClick={() =>
                      setActiveItem(activeItem === item._id ? null : item._id)
                    }
                  >
                    {/* Year Badge */}
                    <div
                      className={`absolute left-0 md:left-1/2 top-0 w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center transform -translate-y-1/2 ${
                        index % 2 === 0
                          ? "md:-translate-x-1/2"
                          : "md:-translate-x-1/2"
                      } z-10`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>

                    {/* Content Card */}
                    <Card
                      className={`w-full md:w-[calc(50%-2rem)] shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
                        activeItem === item._id ? "ring-2 ring-amber-500" : ""
                      }`}
                    >
                      <CardContent className="p-0 overflow-hidden">
                        {item.gambar && (
                          <div className="relative h-48 w-full bg-muted">
                            <Image
                              src={item.gambar || "/placeholder.svg"}
                              alt={item.judul}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder.svg?height=384&width=768";
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-amber-600 font-bold text-lg">
                              {item.tahun}
                            </span>
                            <Separator orientation="vertical" className="h-5" />
                            <h3 className="font-bold text-lg">{item.judul}</h3>
                          </div>
                          <p
                            className={`text-gray-600 whitespace-pre-line ${
                              activeItem === item._id ? "" : "line-clamp-3"
                            }`}
                          >
                            {item.isi}
                          </p>
                          {item.isi.length > 150 && activeItem !== item._id && (
                            <Button
                              variant="link"
                              className="p-0 h-auto mt-2 text-amber-600"
                            >
                              Baca selengkapnya
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Year Display for Mobile */}
                    <div className="md:hidden absolute left-0 top-0 w-10 h-10 flex items-center justify-center">
                      <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {item.tahun}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery
                  ? "Tidak ada sejarah yang sesuai dengan pencarian"
                  : "Belum ada data sejarah"}
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
    </div>
  );
}
