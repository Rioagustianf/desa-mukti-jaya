"use client";

import { useState, useMemo } from "react";
import { useBerita } from "@/hooks/useBerita";
import { useAgenda, type AgendaItem } from "@/hooks/useAgenda";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Newspaper,
  User,
  Loader2,
  RefreshCw,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { format, isAfter, isBefore, isToday, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

export default function BeritaAgendaWargaPage() {
  const {
    berita,
    isLoading: isLoadingBerita,
    error: errorBerita,
    refreshBerita,
  } = useBerita();
  const {
    agenda,
    isLoading: isLoadingAgenda,
    error: errorAgenda,
    refreshAgenda,
  } = useAgenda();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");
  const [agendaView, setAgendaView] = useState<"upcoming" | "past" | "all">(
    "upcoming"
  );
  const [expandedBerita, setExpandedBerita] = useState<string[]>([]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  // Format time for display
  const formatTime = (dateString: string | Date) => {
    try {
      const date =
        typeof dateString === "string" ? parseISO(dateString) : dateString;
      return format(date, "HH:mm", { locale: id });
    } catch (error) {
      return "";
    }
  };

  // Toggle expanded state for berita
  const toggleExpanded = (id: string) => {
    if (expandedBerita.includes(id)) {
      setExpandedBerita(expandedBerita.filter((item) => item !== id));
    } else {
      setExpandedBerita([...expandedBerita, id]);
    }
  };

  // Filter and sort berita
  const filteredBerita = useMemo(() => {
    if (!berita) return [];

    return berita
      .filter((item) => {
        return (
          item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.penulis &&
            item.penulis.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
      });
  }, [berita, searchQuery]);

  // Filter and sort agenda
  const filteredAgenda = useMemo(() => {
    if (!agenda) return [];

    return agenda
      .filter((item) => {
        const matchesSearch =
          item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.deskripsi &&
            item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (item.lokasi &&
            item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter by upcoming/past if needed
        if (agendaView === "upcoming") {
          const startDate = new Date(item.tanggalMulai);
          return (
            matchesSearch &&
            (isAfter(startDate, new Date()) || isToday(startDate))
          );
        } else if (agendaView === "past") {
          const startDate = new Date(item.tanggalMulai);
          return (
            matchesSearch &&
            isBefore(startDate, new Date()) &&
            !isToday(startDate)
          );
        }

        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.tanggalMulai);
        const dateB = new Date(b.tanggalMulai);
        return agendaView === "past"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime();
      });
  }, [agenda, searchQuery, agendaView]);

  // Combined data for "semua" tab
  const combinedData = useMemo(() => {
    const beritaData = (filteredBerita || []).map((item) => ({
      ...item,
      type: "berita",
    }));
    const agendaData = (filteredAgenda || []).map((item) => ({
      ...item,
      type: "agenda",
    }));

    return [...beritaData, ...agendaData].sort((a, b) => {
      const dateA = new Date(a.type === "berita" ? a.tanggal : a.tanggalMulai);
      const dateB = new Date(b.type === "berita" ? b.tanggal : b.tanggalMulai);
      return dateB.getTime() - dateA.getTime(); // Sort by date, newest first
    });
  }, [filteredBerita, filteredAgenda]);

  // Check if agenda is upcoming
  const isUpcoming = (item: AgendaItem) => {
    const startDate = new Date(item.tanggalMulai);
    return isAfter(startDate, new Date()) || isToday(startDate);
  };

  // Refresh all data
  const refreshAll = () => {
    refreshBerita();
    refreshAgenda();
  };

  // Loading state
  const isLoading = isLoadingBerita || isLoadingAgenda;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Newspaper className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Berita & Agenda Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Informasi terkini dan kegiatan yang akan datang di desa kita
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
                    placeholder="Cari berita atau agenda..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full md:w-auto"
                  >
                    <TabsList className="w-full md:w-auto">
                      <TabsTrigger
                        value="semua"
                        className="flex items-center gap-1"
                      >
                        <span>Semua</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="berita"
                        className="flex items-center gap-1"
                      >
                        <Newspaper className="h-4 w-4" />
                        <span>Berita</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="agenda"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>Agenda</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshAll}
                    disabled={isLoading}
                    className="flex-shrink-0"
                  >
                    <RefreshCw
                      size={16}
                      className={isLoading ? "animate-spin" : ""}
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Tabs Content */}
              <Tabs value={activeTab} className="w-full">
                {/* All Tab */}
                <TabsContent value="semua" className="mt-0">
                  {combinedData.length > 0 ? (
                    <div className="space-y-6">
                      {combinedData.map((item: any) => (
                        <Card
                          key={`${item.type}-${item._id}`}
                          className="overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row">
                            {item.type === "berita" && item.gambar && (
                              <div className="relative h-48 md:h-auto md:w-1/3 bg-muted">
                                <Image
                                  src={item.gambar || "/placeholder.svg"}
                                  alt={item.judul}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.svg?height=192&width=384";
                                  }}
                                />
                              </div>
                            )}
                            <div
                              className={`flex-1 ${
                                item.type === "berita" && item.gambar
                                  ? "md:w-2/3"
                                  : "w-full"
                              }`}
                            >
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge
                                      className={`mb-2 ${
                                        item.type === "berita"
                                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                          : item.type === "agenda" &&
                                            isUpcoming(item)
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                      }`}
                                    >
                                      {item.type === "berita"
                                        ? "Berita"
                                        : isUpcoming(item)
                                        ? "Agenda Mendatang"
                                        : "Agenda Selesai"}
                                    </Badge>
                                    <CardTitle className="text-lg">
                                      {item.judul}
                                    </CardTitle>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-2">
                                {item.type === "berita" ? (
                                  <>
                                    <p
                                      className={`text-sm text-muted-foreground ${
                                        expandedBerita.includes(item._id)
                                          ? ""
                                          : "line-clamp-3"
                                      }`}
                                    >
                                      {item.isi}
                                    </p>
                                    {item.isi.length > 150 && (
                                      <Button
                                        variant="link"
                                        className="p-0 h-auto mt-2 text-indigo-600"
                                        onClick={() => toggleExpanded(item._id)}
                                      >
                                        {expandedBerita.includes(item._id) ? (
                                          <span className="flex items-center">
                                            Sembunyikan{" "}
                                            <ChevronUp className="h-4 w-4 ml-1" />
                                          </span>
                                        ) : (
                                          <span className="flex items-center">
                                            Baca selengkapnya{" "}
                                            <ChevronDown className="h-4 w-4 ml-1" />
                                          </span>
                                        )}
                                      </Button>
                                    )}
                                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(item.tanggal)}</span>
                                      {item.penulis && (
                                        <>
                                          <span className="mx-1">•</span>
                                          <User className="h-3 w-3" />
                                          <span>{item.penulis}</span>
                                        </>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {item.deskripsi || "Tidak ada deskripsi"}
                                    </p>
                                    <div className="flex flex-col gap-1 mt-3">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarCheck className="h-3 w-3" />
                                        <span>
                                          Mulai: {formatDate(item.tanggalMulai)}
                                        </span>
                                      </div>
                                      {item.tanggalSelesai && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <CalendarClock className="h-3 w-3" />
                                          <span>
                                            Selesai:{" "}
                                            {formatDate(item.tanggalSelesai)}
                                          </span>
                                        </div>
                                      )}
                                      {item.lokasi && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <MapPin className="h-3 w-3" />
                                          <span>{item.lokasi}</span>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </CardContent>
                              <CardFooter className="p-4 pt-0">
                                <Link
                                  href={
                                    item.type === "berita"
                                      ? `/berita-agenda/berita/${item._id}`
                                      : `/berita-agenda/agenda${item._id}`
                                  }
                                  className="ml-auto"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1"
                                  >
                                    <span>Detail</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </CardFooter>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="bg-muted rounded-full p-3 mb-4">
                        <Newspaper className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {searchQuery
                          ? "Tidak ada berita atau agenda yang sesuai dengan pencarian"
                          : "Belum ada berita atau agenda"}
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
                </TabsContent>

                {/* Berita Tab */}
                <TabsContent value="berita" className="mt-0">
                  {filteredBerita.length > 0 ? (
                    <div className="space-y-6">
                      {/* Featured News */}
                      {filteredBerita.length > 0 &&
                        filteredBerita[0].gambar && (
                          <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                            <div className="relative h-64 w-full bg-muted">
                              <Image
                                src={
                                  filteredBerita[0].gambar || "/placeholder.svg"
                                }
                                alt={filteredBerita[0].judul}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder.svg?height=256&width=768";
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                                <Badge className="bg-blue-500 text-white hover:bg-blue-600 mb-2 self-start">
                                  Berita Terbaru
                                </Badge>
                                <h3 className="text-xl md:text-2xl font-bold mb-2">
                                  {filteredBerita[0].judul}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDate(filteredBerita[0].tanggal)}
                                  </span>
                                  {filteredBerita[0].penulis && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <User className="h-3 w-3" />
                                      <span>{filteredBerita[0].penulis}</span>
                                    </>
                                  )}
                                </div>
                                <Link
                                  href={`/berita-agenda/berita/${filteredBerita[0]._id}`}
                                  className="mt-4"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 bg-white/20 hover:bg-white/30 text-white border-white/40 w-fit"
                                  >
                                    <span>Baca Selengkapnya</span>
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </Card>
                        )}

                      {/* News Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBerita.slice(1).map((item) => (
                          <Card
                            key={item._id}
                            className="overflow-hidden shadow-md hover:shadow-lg transition-shadow flex flex-col h-full"
                          >
                            {item.gambar && (
                              <div className="relative h-48 w-full bg-muted">
                                <Image
                                  src={item.gambar || "/placeholder.svg"}
                                  alt={item.judul}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.svg?height=192&width=384";
                                  }}
                                />
                              </div>
                            )}
                            <CardHeader className="p-4 pb-2">
                              <CardTitle className="text-lg">
                                {item.judul}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 flex-grow">
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {item.isi}
                              </p>
                              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(item.tanggal)}</span>
                                {item.penulis && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <User className="h-3 w-3" />
                                    <span>{item.penulis}</span>
                                  </>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter className="p-4 pt-0">
                              <Link
                                href={`/berita-agenda/berita/${item._id}`}
                                className="ml-auto"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <span>Baca Selengkapnya</span>
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="bg-muted rounded-full p-3 mb-4">
                        <Newspaper className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">
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
                </TabsContent>

                {/* Agenda Tab */}
                <TabsContent value="agenda" className="mt-0">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Agenda Desa</h2>
                    <Tabs
                      value={agendaView}
                      onValueChange={(value) => setAgendaView(value as any)}
                      className="w-auto"
                    >
                      <TabsList>
                        <TabsTrigger
                          value="upcoming"
                          className="flex items-center gap-1"
                        >
                          <CalendarCheck className="h-4 w-4" />
                          <span>Mendatang</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="past"
                          className="flex items-center gap-1"
                        >
                          <CalendarClock className="h-4 w-4" />
                          <span>Selesai</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="all"
                          className="flex items-center gap-1"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Semua</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {filteredAgenda.length > 0 ? (
                    <div className="space-y-4">
                      {filteredAgenda.map((item) => (
                        <Card
                          key={item._id}
                          className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow border-l-4 ${
                            isUpcoming(item)
                              ? "border-l-green-500"
                              : "border-l-amber-500"
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                              <div className="md:w-1/6 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-2xl font-bold text-indigo-600">
                                  {format(new Date(item.tanggalMulai), "dd")}
                                </span>
                                <span className="text-sm font-medium text-slate-600">
                                  {format(
                                    new Date(item.tanggalMulai),
                                    "MMM yyyy",
                                    { locale: id }
                                  )}
                                </span>
                                {item.tanggalSelesai && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                    <ArrowRight className="h-3 w-3" />
                                    <span>
                                      {format(
                                        new Date(item.tanggalSelesai),
                                        "dd MMM",
                                        { locale: id }
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge
                                      className={`mb-2 ${
                                        isUpcoming(item)
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                      }`}
                                    >
                                      {isUpcoming(item)
                                        ? "Mendatang"
                                        : "Selesai"}
                                    </Badge>
                                    <h3 className="text-lg font-bold">
                                      {item.judul}
                                    </h3>
                                  </div>
                                  <Link
                                    href={`/berita-agenda/agenda/${item._id}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1"
                                    >
                                      <span>Detail</span>
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {item.deskripsi || "Tidak ada deskripsi"}
                                </p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                  {item.lokasi && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span>{item.lokasi}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {formatTime(item.tanggalMulai)
                                        ? `Pukul ${formatTime(
                                            item.tanggalMulai
                                          )}`
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="bg-muted rounded-full p-3 mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {searchQuery
                          ? "Tidak ada agenda yang sesuai dengan pencarian"
                          : agendaView === "upcoming"
                          ? "Tidak ada agenda mendatang"
                          : agendaView === "past"
                          ? "Tidak ada agenda yang telah selesai"
                          : "Belum ada agenda"}
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
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
