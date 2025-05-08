"use client";

import { useState, useMemo, useEffect } from "react";
import { useKontak, type Kontak } from "@/hooks/useKontak";
import { useLokasi } from "@/hooks/useLokasi";
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
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  ExternalLink,
  Smartphone,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  RefreshCw,
  Clock,
  Info,
} from "lucide-react";

import dynamic from "next/dynamic";

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import("@/components/admin/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-muted rounded-md">
      <div className="animate-pulse text-muted-foreground">Memuat peta...</div>
    </div>
  ),
});

export default function KontakWargaPage() {
  const { kontak, isLoading, error, refreshKontak } = useKontak();
  const { lokasi, isLoading: isLoadingLokasi } = useLokasi();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -7.123, 110.456,
  ]);
  const [mapZoom, setMapZoom] = useState(13);
  const [profilDesa, setProfilDesa] = useState<any>(null);
  const [isLoadingProfil, setIsLoadingProfil] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfilDesa = async () => {
      try {
        setIsLoadingProfil(true);
        const response = await fetch("/api/profil-desa");
        const result = await response.json();

        if (result.success && result.data) {
          // Handle both array and single object responses
          let dataToUse;

          if (Array.isArray(result.data) && result.data.length > 0) {
            dataToUse = result.data[0];
          } else if (typeof result.data === "object" && result.data !== null) {
            dataToUse = result.data;
          }

          setProfilDesa(dataToUse);
        }
      } catch (err) {
        console.error("Error fetching profil desa:", err);
      } finally {
        setIsLoadingProfil(false);
      }
    };

    fetchProfilDesa();
  }, []);

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

  // Convert lokasi data to map markers format with proper safety checks
  const mapMarkers = useMemo(() => {
    if (!Array.isArray(lokasi)) return [];

    return lokasi
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
      }));
  }, [lokasi]);

  // Find the village office location
  const kantorDesa = useMemo(() => {
    if (!Array.isArray(lokasi)) return null;

    return lokasi.find(
      (item) =>
        item &&
        item.nama &&
        (item.nama.toLowerCase().includes("kantor") ||
          item.nama.toLowerCase().includes("balai") ||
          item.nama.toLowerCase().includes("desa"))
    );
  }, [lokasi]);

  // Function to open Google Maps with the coordinates
  const openInMaps = (lat?: number, lng?: number) => {
    if (
      typeof window !== "undefined" &&
      lat !== undefined &&
      lng !== undefined
    ) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  // Group contacts by type
  const groupedKontak = useMemo(() => {
    if (!kontak || kontak.length === 0) return {};

    const grouped: Record<string, Kontak[]> = {
      telepon: [],
      email: [],
      website: [],
      sosmed: [],
      lainnya: [],
    };

    kontak.forEach((item) => {
      const lowerJenis = item.jenis.toLowerCase();
      if (
        lowerJenis.includes("telepon") ||
        lowerJenis.includes("telp") ||
        lowerJenis.includes("hp") ||
        lowerJenis.includes("handphone") ||
        lowerJenis.includes("ponsel")
      ) {
        grouped.telepon.push(item);
      } else if (lowerJenis.includes("email") || lowerJenis.includes("mail")) {
        grouped.email.push(item);
      } else if (
        lowerJenis.includes("website") ||
        lowerJenis.includes("web") ||
        lowerJenis.includes("site")
      ) {
        grouped.website.push(item);
      } else if (
        lowerJenis.includes("instagram") ||
        lowerJenis.includes("facebook") ||
        lowerJenis.includes("twitter") ||
        lowerJenis.includes("youtube") ||
        lowerJenis.includes("tiktok") ||
        lowerJenis.includes("whatsapp") ||
        lowerJenis.includes("wa") ||
        lowerJenis.includes("sosial") ||
        lowerJenis.includes("sosmed")
      ) {
        grouped.sosmed.push(item);
      } else {
        grouped.lainnya.push(item);
      }
    });

    return grouped;
  }, [kontak]);

  // Get all unique contact types for tabs
  const kontakTypes = useMemo(() => {
    const types = Object.keys(groupedKontak).filter(
      (key) => groupedKontak[key].length > 0
    );
    return types;
  }, [groupedKontak]);

  // Filter contacts based on search query and selected tab
  const filteredKontak = useMemo(() => {
    if (!kontak) return [];

    return kontak.filter((item) => {
      const matchesSearch =
        item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nilai.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.deskripsi &&
          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTab =
        activeTab === "semua" ||
        (activeTab === "telepon" &&
          (item.jenis.toLowerCase().includes("telepon") ||
            item.jenis.toLowerCase().includes("telp") ||
            item.jenis.toLowerCase().includes("hp") ||
            item.jenis.toLowerCase().includes("handphone") ||
            item.jenis.toLowerCase().includes("ponsel"))) ||
        (activeTab === "email" &&
          (item.jenis.toLowerCase().includes("email") ||
            item.jenis.toLowerCase().includes("mail"))) ||
        (activeTab === "website" &&
          (item.jenis.toLowerCase().includes("website") ||
            item.jenis.toLowerCase().includes("web") ||
            item.jenis.toLowerCase().includes("site"))) ||
        (activeTab === "sosmed" &&
          (item.jenis.toLowerCase().includes("instagram") ||
            item.jenis.toLowerCase().includes("facebook") ||
            item.jenis.toLowerCase().includes("twitter") ||
            item.jenis.toLowerCase().includes("youtube") ||
            item.jenis.toLowerCase().includes("tiktok") ||
            item.jenis.toLowerCase().includes("whatsapp") ||
            item.jenis.toLowerCase().includes("wa") ||
            item.jenis.toLowerCase().includes("sosial") ||
            item.jenis.toLowerCase().includes("sosmed"))) ||
        (activeTab === "lainnya" &&
          !item.jenis.toLowerCase().includes("telepon") &&
          !item.jenis.toLowerCase().includes("telp") &&
          !item.jenis.toLowerCase().includes("hp") &&
          !item.jenis.toLowerCase().includes("handphone") &&
          !item.jenis.toLowerCase().includes("ponsel") &&
          !item.jenis.toLowerCase().includes("email") &&
          !item.jenis.toLowerCase().includes("mail") &&
          !item.jenis.toLowerCase().includes("website") &&
          !item.jenis.toLowerCase().includes("web") &&
          !item.jenis.toLowerCase().includes("site") &&
          !item.jenis.toLowerCase().includes("instagram") &&
          !item.jenis.toLowerCase().includes("facebook") &&
          !item.jenis.toLowerCase().includes("twitter") &&
          !item.jenis.toLowerCase().includes("youtube") &&
          !item.jenis.toLowerCase().includes("tiktok") &&
          !item.jenis.toLowerCase().includes("whatsapp") &&
          !item.jenis.toLowerCase().includes("wa") &&
          !item.jenis.toLowerCase().includes("sosial") &&
          !item.jenis.toLowerCase().includes("sosmed"));

      return matchesSearch && matchesTab;
    });
  }, [kontak, searchQuery, activeTab]);

  // Function to get icon based on contact type
  const getKontakIcon = (jenis = "") => {
    const lowerJenis = jenis.toLowerCase();
    if (
      lowerJenis.includes("telepon") ||
      lowerJenis.includes("telp") ||
      lowerJenis.includes("hp")
    ) {
      return <Phone className="h-5 w-5" />;
    } else if (
      lowerJenis.includes("handphone") ||
      lowerJenis.includes("ponsel")
    ) {
      return <Smartphone className="h-5 w-5" />;
    } else if (lowerJenis.includes("whatsapp") || lowerJenis.includes("wa")) {
      return <MessageCircle className="h-5 w-5" />;
    } else if (lowerJenis.includes("email") || lowerJenis.includes("mail")) {
      return <Mail className="h-5 w-5" />;
    } else if (
      lowerJenis.includes("website") ||
      lowerJenis.includes("web") ||
      lowerJenis.includes("site")
    ) {
      return <Globe className="h-5 w-5" />;
    } else if (lowerJenis.includes("instagram")) {
      return <Instagram className="h-5 w-5" />;
    } else if (lowerJenis.includes("facebook")) {
      return <Facebook className="h-5 w-5" />;
    } else if (lowerJenis.includes("twitter")) {
      return <Twitter className="h-5 w-5" />;
    } else if (lowerJenis.includes("alamat") || lowerJenis.includes("lokasi")) {
      return <MapPin className="h-5 w-5" />;
    } else if (
      lowerJenis.includes("jam") ||
      lowerJenis.includes("waktu") ||
      lowerJenis.includes("buka")
    ) {
      return <Clock className="h-5 w-5" />;
    } else {
      return <Info className="h-5 w-5" />;
    }
  };

  // Function to open contact
  const openContact = (jenis = "", nilai = "") => {
    if (!nilai) return;

    const lowerJenis = jenis.toLowerCase();
    if (
      lowerJenis.includes("telepon") ||
      lowerJenis.includes("telp") ||
      lowerJenis.includes("hp")
    ) {
      window.open(`tel:${nilai}`, "_blank");
    } else if (lowerJenis.includes("whatsapp") || lowerJenis.includes("wa")) {
      // Format WhatsApp link - remove any non-numeric characters
      const cleanNumber = nilai.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}`, "_blank");
    } else if (lowerJenis.includes("email") || lowerJenis.includes("mail")) {
      window.open(`mailto:${nilai}`, "_blank");
    } else if (
      lowerJenis.includes("website") ||
      lowerJenis.includes("web") ||
      lowerJenis.includes("instagram") ||
      lowerJenis.includes("facebook") ||
      lowerJenis.includes("twitter") ||
      lowerJenis.includes("youtube") ||
      lowerJenis.includes("tiktok")
    ) {
      // Add http:// if not present
      let url = nilai;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      window.open(url, "_blank");
    }
  };

  // Get color based on contact type
  const getKontakColor = (jenis = ""): string => {
    const lowerJenis = jenis.toLowerCase();
    if (
      lowerJenis.includes("telepon") ||
      lowerJenis.includes("telp") ||
      lowerJenis.includes("hp") ||
      lowerJenis.includes("handphone") ||
      lowerJenis.includes("ponsel")
    ) {
      return "bg-green-100 text-green-600";
    } else if (lowerJenis.includes("whatsapp") || lowerJenis.includes("wa")) {
      return "bg-emerald-100 text-emerald-600";
    } else if (lowerJenis.includes("email") || lowerJenis.includes("mail")) {
      return "bg-blue-100 text-blue-600";
    } else if (
      lowerJenis.includes("website") ||
      lowerJenis.includes("web") ||
      lowerJenis.includes("site")
    ) {
      return "bg-purple-100 text-purple-600";
    } else if (lowerJenis.includes("instagram")) {
      return "bg-pink-100 text-pink-600";
    } else if (lowerJenis.includes("facebook")) {
      return "bg-indigo-100 text-indigo-600";
    } else if (lowerJenis.includes("twitter")) {
      return "bg-sky-100 text-sky-600";
    } else if (lowerJenis.includes("alamat") || lowerJenis.includes("lokasi")) {
      return "bg-amber-100 text-amber-600";
    } else if (
      lowerJenis.includes("jam") ||
      lowerJenis.includes("waktu") ||
      lowerJenis.includes("buka")
    ) {
      return "bg-orange-100 text-orange-600";
    } else {
      return "bg-slate-100 text-slate-600";
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
                <Phone className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Kontak Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Informasi kontak resmi desa untuk memudahkan komunikasi dan
                layanan bagi warga
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
                    placeholder="Cari kontak..."
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
                    <TabsList className="w-full md:w-auto overflow-x-auto flex-nowrap">
                      <TabsTrigger value="semua" className="flex-shrink-0">
                        Semua
                      </TabsTrigger>
                      {kontakTypes.map((type) => (
                        <TabsTrigger
                          key={type}
                          value={type}
                          className="flex-shrink-0 capitalize"
                        >
                          {type === "telepon"
                            ? "Telepon"
                            : type === "email"
                            ? "Email"
                            : type === "website"
                            ? "Website"
                            : type === "sosmed"
                            ? "Sosial Media"
                            : "Lainnya"}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshKontak}
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
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-muted-foreground">Memuat data kontak...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <Button variant="outline" onClick={refreshKontak}>
                Coba Lagi
              </Button>
            </div>
          ) : filteredKontak.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || activeTab !== "semua"
                  ? "Tidak ada kontak yang sesuai dengan pencarian"
                  : "Belum ada data kontak"}
              </p>
              {(searchQuery || activeTab !== "semua") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("semua");
                  }}
                  className="mt-4"
                >
                  Reset Pencarian
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-10">
              {/* Featured Contacts Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredKontak
                  .filter(
                    (item) =>
                      item.jenis.toLowerCase().includes("telepon") ||
                      item.jenis.toLowerCase().includes("whatsapp") ||
                      item.jenis.toLowerCase().includes("email")
                  )
                  .slice(0, 3)
                  .map((item) => (
                    <Card
                      key={item._id}
                      className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`p-4 rounded-full mb-4 ${getKontakColor(
                              item.jenis
                            )}`}
                          >
                            {getKontakIcon(item.jenis)}
                          </div>
                          <h3 className="font-bold text-lg mb-1">
                            {item.jenis}
                          </h3>
                          <p className="text-lg font-medium text-blue-600 mb-2">
                            {item.nilai}
                          </p>
                          {item.deskripsi && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {item.deskripsi}
                            </p>
                          )}
                          <Button
                            onClick={() => openContact(item.jenis, item.nilai)}
                            className="gap-2 mt-2"
                            variant="outline"
                          >
                            <ExternalLink size={16} />
                            {item.jenis.toLowerCase().includes("telepon") ||
                            item.jenis.toLowerCase().includes("telp")
                              ? "Hubungi"
                              : item.jenis.toLowerCase().includes("whatsapp") ||
                                item.jenis.toLowerCase().includes("wa")
                              ? "Chat WhatsApp"
                              : item.jenis.toLowerCase().includes("email")
                              ? "Kirim Email"
                              : "Buka"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* All Contacts Section */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Semua Kontak</CardTitle>
                  <CardDescription>Daftar lengkap kontak desa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredKontak.map((item) => (
                      <Card key={item._id} className="overflow-hidden border">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-3 rounded-full ${getKontakColor(
                                item.jenis
                              )}`}
                            >
                              {getKontakIcon(item.jenis)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">
                                {item.jenis}
                              </h3>
                              <p className="text-blue-600 font-medium mb-2">
                                {item.nilai}
                              </p>
                              {item.deskripsi && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  {item.deskripsi}
                                </p>
                              )}
                              <Button
                                onClick={() =>
                                  openContact(item.jenis, item.nilai)
                                }
                                size="sm"
                                variant="outline"
                                className="gap-1 mt-1"
                              >
                                <ExternalLink size={14} />
                                {item.jenis.toLowerCase().includes("telepon") ||
                                item.jenis.toLowerCase().includes("telp")
                                  ? "Hubungi"
                                  : item.jenis
                                      .toLowerCase()
                                      .includes("whatsapp") ||
                                    item.jenis.toLowerCase().includes("wa")
                                  ? "Chat"
                                  : item.jenis.toLowerCase().includes("email")
                                  ? "Email"
                                  : "Buka"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Categories */}
              {Object.entries(groupedKontak).map(
                ([category, items]) =>
                  items.length > 0 && (
                    <Card key={category} className="shadow-md">
                      <CardHeader>
                        <CardTitle className="capitalize">
                          {category === "telepon"
                            ? "Telepon & WhatsApp"
                            : category === "email"
                            ? "Email"
                            : category === "website"
                            ? "Website"
                            : category === "sosmed"
                            ? "Media Sosial"
                            : "Kontak Lainnya"}
                        </CardTitle>
                        <CardDescription>
                          {category === "telepon"
                            ? "Nomor telepon dan WhatsApp untuk menghubungi desa"
                            : category === "email"
                            ? "Alamat email untuk korespondensi"
                            : category === "website"
                            ? "Website resmi desa"
                            : category === "sosmed"
                            ? "Akun media sosial resmi desa"
                            : "Informasi kontak tambahan"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {items.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                            >
                              <div
                                className={`p-3 rounded-full ${getKontakColor(
                                  item.jenis
                                )}`}
                              >
                                {getKontakIcon(item.jenis)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-base">
                                  {item.jenis}
                                </h3>
                                <p className="text-blue-600">{item.nilai}</p>
                                {item.deskripsi && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.deskripsi}
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={() =>
                                  openContact(item.jenis, item.nilai)
                                }
                                size="sm"
                                variant="ghost"
                                className="ml-auto"
                              >
                                <ExternalLink size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact Map Section */}
      <div className="bg-slate-50 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Lokasi Kantor Desa</h2>
              <p className="text-muted-foreground">
                Kunjungi kami di kantor desa untuk layanan tatap muka
              </p>
            </div>

            <Card className="shadow-md overflow-hidden">
              <div className="relative h-[400px] w-full bg-muted">
                {isLoadingLokasi ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-pulse text-muted-foreground">
                      Memuat peta...
                    </div>
                  </div>
                ) : Array.isArray(mapMarkers) && mapMarkers.length > 0 ? (
                  <MapComponent
                    markers={mapMarkers}
                    center={mapCenter}
                    zoom={mapZoom}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Belum ada data lokasi yang ditambahkan
                    </p>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Alamat Kantor</h3>
                    {isLoadingProfil ? (
                      <div className="animate-pulse h-4 bg-muted rounded w-3/4 mb-4"></div>
                    ) : profilDesa ? (
                      <p className="text-muted-foreground mb-4">
                        {profilDesa.alamat || "Alamat tidak tersedia"}
                        {profilDesa.kecamatan &&
                          `, Kec. ${profilDesa.kecamatan}`}
                        {profilDesa.kabupaten &&
                          `, Kab. ${profilDesa.kabupaten}`}
                        {profilDesa.provinsi && `, ${profilDesa.provinsi}`}
                        {profilDesa.kode_pos && ` ${profilDesa.kode_pos}`}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mb-4">
                        Alamat tidak tersedia
                      </p>
                    )}

                    {kantorDesa && kantorDesa.koordinat && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 mb-4"
                        onClick={() =>
                          openInMaps(
                            kantorDesa.koordinat?.lat,
                            kantorDesa.koordinat?.lng
                          )
                        }
                      >
                        <MapPin size={14} />
                        <span>Lihat di Google Maps</span>
                        <ExternalLink size={14} />
                      </Button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Jam Operasional: Senin - Jumat, 08.00 - 16.00 WIB
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">Kontak Utama</h3>
                    <div className="space-y-2">
                      {isLoadingProfil ? (
                        <>
                          <div className="animate-pulse h-4 bg-muted rounded w-1/2 mb-2"></div>
                          <div className="animate-pulse h-4 bg-muted rounded w-2/3 mb-2"></div>
                          <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
                        </>
                      ) : profilDesa ? (
                        <>
                          {profilDesa.telepon && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-blue-600" />
                              <span>{profilDesa.telepon}</span>
                            </div>
                          )}
                          {profilDesa.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span>{profilDesa.email}</span>
                            </div>
                          )}
                          {profilDesa.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-blue-600" />
                              <span>{profilDesa.website}</span>
                            </div>
                          )}
                          {!profilDesa.telepon &&
                            !profilDesa.email &&
                            !profilDesa.website && (
                              <p className="text-muted-foreground">
                                Kontak tidak tersedia
                              </p>
                            )}
                        </>
                      ) : (
                        <p className="text-muted-foreground">
                          Kontak tidak tersedia
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Locations */}
            {Array.isArray(lokasi) && lokasi.length > 1 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">
                  Lokasi Penting Lainnya
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lokasi
                    .filter((item) => item && item.nama && item.koordinat)
                    .map((item) => (
                      <Card key={item._id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-lg mb-2">
                            {item.nama}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.alamat}
                          </p>
                          {item.deskripsi && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {item.deskripsi}
                            </p>
                          )}
                          {item.koordinat && (
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
                              <span>Lihat di Maps</span>
                              <ExternalLink size={14} />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
