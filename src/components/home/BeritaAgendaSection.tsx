"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  ChevronRight,
  Newspaper,
  Clock,
  Search,
  Loader2,
  ArrowRight,
  User,
  MapPin,
} from "lucide-react";
import { useBerita } from "@/hooks/useBerita";
import { useAgenda } from "@/hooks/useAgenda";
import { format, isAfter, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BeritaAgendaSection() {
  const { berita, isLoading: isLoadingBerita } = useBerita();
  const { agenda, isLoading: isLoadingAgenda } = useAgenda();
  const [searchQuery, setSearchQuery] = useState("");

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  // Format short date for display
  const formatShortDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  // Check if agenda is upcoming
  const isUpcoming = (tanggalMulai: string | Date) => {
    const startDate = new Date(tanggalMulai);
    return isAfter(startDate, new Date()) || isToday(startDate);
  };

  // Filter berita based on search query
  const filteredBerita = berita
    ? berita
        .filter((item) => {
          return (
            item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.isi.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.tanggal);
          const dateB = new Date(b.tanggal);
          return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
        })
        .slice(0, 4) // Limit to 4 items for homepage
    : [];

  // Filter agenda to show only upcoming events
  const filteredAgenda = agenda
    ? agenda
        .filter((item) => isUpcoming(item.tanggalMulai))
        .sort((a, b) => {
          const dateA = new Date(a.tanggalMulai);
          const dateB = new Date(b.tanggalMulai);
          return dateA.getTime() - dateB.getTime(); // Sort by date, soonest first
        })
        .slice(0, 3) // Limit to 3 items for homepage
    : [];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Berita dan Agenda</h2>
          <Link href="/berita-agenda">
            <Button variant="outline" className="gap-1">
              Lihat Semua
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Berita */}
          <div className="lg:w-2/3">
            <div className="mb-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Cari berita..."
                  className="w-full pl-10 pr-4 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Berita Items */}
            {isLoadingBerita ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-muted-foreground">Memuat berita...</p>
                </div>
              </div>
            ) : filteredBerita.length > 0 ? (
              <div className="space-y-6">
                {filteredBerita.map((item, index) => (
                  <div
                    key={item._id}
                    className={`flex flex-col md:flex-row gap-4 ${
                      index < filteredBerita.length - 1 ? "border-b pb-6" : ""
                    }`}
                  >
                    <div className="md:w-1/4">
                      <div className="relative w-full h-[120px] bg-gray-200 rounded-lg overflow-hidden">
                        {item.gambar ? (
                          <Image
                            src={item.gambar || "/placeholder.svg"}
                            alt={item.judul}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.svg?height=120&width=200";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:w-3/4">
                      <h3 className="text-lg font-bold mb-2">{item.judul}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {item.isi}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatShortDate(item.tanggal)}
                          {item.penulis && (
                            <>
                              <span className="mx-1">•</span>
                              <User className="h-4 w-4" />
                              {item.penulis}
                            </>
                          )}
                        </span>
                        <Link
                          href={`/berita-agenda/berita/${item._id}`}
                          className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <span className="text-sm">Baca</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Newspaper className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">
                  {searchQuery
                    ? "Tidak ada berita yang sesuai dengan pencarian"
                    : "Belum ada berita"}
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

          {/* Agenda */}
          <div className="lg:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Agenda Mendatang</h3>
              <Link
                href="/berita-agenda?tab=agenda"
                className="text-indigo-600 hover:underline text-sm flex items-center gap-1"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoadingAgenda ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  <p className="text-muted-foreground text-sm">
                    Memuat agenda...
                  </p>
                </div>
              </div>
            ) : filteredAgenda.length > 0 ? (
              <div className="space-y-4">
                {filteredAgenda.map((item) => (
                  <div
                    key={item._id}
                    className="border-l-4 border-indigo-500 pl-4 hover:bg-slate-50 transition-colors rounded-r-md p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-indigo-500" />
                      </div>
                      <h3 className="font-bold line-clamp-1">{item.judul}</h3>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.tanggalMulai)}
                        </span>
                        {item.tanggalSelesai && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <ArrowRight className="h-3 w-3" />
                            {formatDate(item.tanggalSelesai)}
                          </span>
                        )}
                        {item.lokasi && (
                          <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {item.lokasi}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/berita/${item._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center border rounded-md p-4">
                <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">
                  Tidak ada agenda mendatang
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
