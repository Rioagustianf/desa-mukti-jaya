"use client";

import { useState, useEffect, Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Home,
  History,
  Target,
  FileText,
  Video,
  User,
  Map,
  ExternalLink,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLokasi } from "@/hooks/useLokasi";
import Image from "next/image";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/admin/map/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[400px] bg-muted rounded-md">
      <div className="animate-pulse text-muted-foreground">Memuat peta...</div>
    </div>
  ),
});

interface ProfilDesa {
  _id: string;
  nama: string;
  deskripsi?: string;
  sejarahSingkat?: string;
  visi?: string;
  misi?: string[] | string;
  kode_pos?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  luas_area?: string;
  jumlah_penduduk?: number | string;
  alamat?: string;
  telepon?: string;
  email?: string;
  website?: string;
  logo?: string;
  foto?: string;
}

// Define the SambutanData type
interface SambutanData {
  _id: string;
  namaKepalaDesa: string;
  foto?: string;
  video?: string;
  sambutan: string;
  createdAt: string;
  updatedAt: string;
}

// Default data if API returns nothing
const defaultProfilDesa: ProfilDesa = {
  _id: "default",
  nama: "Desa Mukti Jaya",
  deskripsi:
    "Desa Mukti Jaya merupakan salah satu desa di Kecamatan Contoh, Kabupaten Contoh, Provinsi Contoh.",
  sejarahSingkat:
    "Desa Mukti Jaya didirikan pada tahun 1960 oleh sekelompok penduduk yang berpindah dari daerah pegunungan. Nama Mukti Jaya diambil dari kata 'Mukti' yang berarti kemakmuran dan 'Jaya' yang berarti kejayaan, dengan harapan desa ini akan selalu makmur dan jaya.",
  visi: "Mewujudkan Desa Mukti Jaya yang mandiri, sejahtera, dan berbudaya berdasarkan gotong royong.",
  misi: [
    "Meningkatkan kualitas kehidupan beragama dalam mewujudkan masyarakat yang beriman dan bertaqwa.",
    "Meningkatkan kualitas pendidikan dan kesehatan masyarakat.",
    "Meningkatkan ekonomi masyarakat melalui pemberdayaan usaha kecil dan menengah.",
    "Meningkatkan pembangunan infrastruktur yang mendukung perekonomian desa.",
    "Menciptakan tata kelola pemerintahan yang baik (good governance).",
  ],
  kode_pos: "12345",
  kecamatan: "Contoh",
  kabupaten: "Contoh",
  provinsi: "Contoh",
  luas_area: "500 Ha",
  jumlah_penduduk: 5000,
  alamat: "Jl. Desa Mukti Jaya No. 1, Kecamatan Contoh",
  telepon: "(021) 12345678",
  email: "info@desamuktijaya.desa.id",
  website: "desamuktijaya.desa.id",
};

// Function to extract YouTube video ID from various YouTube URL formats
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Regular expressions for different YouTube URL formats
  const regexps = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&\s]+)/,
    /youtube\.com\/watch\?.*v=([^&\s]+)/,
    /youtube\.com\/shorts\/([^&\s]+)/,
  ];

  for (const regex of regexps) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

// Komponen terpisah untuk Tabs yang menggunakan useSearchParams
function TabsWithParams({
  activeTab,
  data,
  sambutan,
  isLoadingLokasi,
  mapMarkers,
  mapCenter,
  mapZoom,
  lokasi,
  openInMaps,
  youtubeVideoId,
}) {
  // Gunakan useSearchParams di dalam komponen yang dibungkus Suspense
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "informasi";

  return (
    <Tabs defaultValue={defaultTab} className="mb-12">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
        <TabsTrigger value="informasi">Informasi Umum</TabsTrigger>
        <TabsTrigger value="sejarah">Sejarah</TabsTrigger>
        <TabsTrigger value="visi-misi">Visi & Misi</TabsTrigger>
        <TabsTrigger value="lokasi">Lokasi</TabsTrigger>
      </TabsList>

      {/* Informasi Umum Tab */}
      <TabsContent value="informasi" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <CardTitle>Informasi Umum</CardTitle>
              </div>
              <CardDescription>
                Data geografis dan administrasi desa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Alamat</span>
                  <span className="font-medium">{data.alamat || "-"}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Kecamatan
                    </span>
                    <span className="font-medium">{data.kecamatan || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Kabupaten
                    </span>
                    <span className="font-medium">{data.kabupaten || "-"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Provinsi
                    </span>
                    <span className="font-medium">{data.provinsi || "-"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Kode Pos
                    </span>
                    <span className="font-medium">{data.kode_pos || "-"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-600" />
                <CardTitle>Kontak</CardTitle>
              </div>
              <CardDescription>
                Informasi kontak dan media sosial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Telepon
                    </span>
                    <span className="font-medium">{data.telepon || "-"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-medium">{data.email || "-"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Website
                    </span>
                    <span className="font-medium">
                      {data.website ? (
                        <a
                          href={`https://${data.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          {data.website}
                        </a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Sejarah Tab */}
      <TabsContent value="sejarah">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" />
              <CardTitle>Sejarah Singkat Desa</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {data.sejarahSingkat || "Belum ada data sejarah desa."}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Visi & Misi Tab */}
      <TabsContent value="visi-misi">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />
              <CardTitle>Visi & Misi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Visi
                  </Badge>
                  <Separator className="flex-1" />
                </h3>
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <p className="text-gray-800 italic">
                    "{data.visi || "Belum ada data visi."}"
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  >
                    Misi
                  </Badge>
                  <Separator className="flex-1" />
                </h3>

                {data.misi &&
                Array.isArray(data.misi) &&
                data.misi.length > 0 ? (
                  <ol className="space-y-3 list-decimal pl-5">
                    {data.misi.map((item, index) => (
                      <li key={index} className="text-gray-700 pl-2">
                        {item}
                      </li>
                    ))}
                  </ol>
                ) : data.misi && typeof data.misi === "string" ? (
                  <p className="text-gray-700 whitespace-pre-line">
                    {data.misi}
                  </p>
                ) : (
                  <p className="text-gray-700">Belum ada data misi.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Lokasi Tab */}
      <TabsContent value="lokasi">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-emerald-600" />
              <CardTitle>Lokasi Desa</CardTitle>
            </div>
            <CardDescription>Peta lokasi desa {data.nama}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLokasi ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse text-muted-foreground">
                  Memuat data lokasi...
                </div>
              </div>
            ) : Array.isArray(mapMarkers) && mapMarkers.length > 0 ? (
              <div className="space-y-6">
                <div className="h-[400px] w-full rounded-lg overflow-hidden">
                  <MapComponent
                    markers={mapMarkers}
                    center={mapCenter}
                    zoom={mapZoom}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Daftar Lokasi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.isArray(lokasi) &&
                      lokasi.map((item) => (
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Belum ada data lokasi yang ditambahkan
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function ProfilDesaPage() {
  const [profilDesa, setProfilDesa] = useState<ProfilDesa | null>(null);
  const [sambutan, setSambutan] = useState<SambutanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lokasi, isLoading: isLoadingLokasi } = useLokasi();
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    -7.123, 110.456,
  ]);
  const [mapZoom, setMapZoom] = useState(13);
  const [activeTab, setActiveTab] = useState("informasi");

  // Fetch profile data
  useEffect(() => {
    const fetchProfilDesa = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profil-desa");
        const result = await response.json();

        if (result.success && result.data) {
          // Handle both array and single object responses
          let dataToUse;

          if (Array.isArray(result.data) && result.data.length > 0) {
            dataToUse = result.data[0];
          } else if (typeof result.data === "object" && result.data !== null) {
            dataToUse = result.data;
          } else {
            // Use default data if API returns empty data
            dataToUse = defaultProfilDesa;
          }

          // Process the data to ensure consistent types
          // Convert misi to array if it's a string
          if (
            dataToUse.misi &&
            typeof dataToUse.misi === "string" &&
            dataToUse.misi.includes(",")
          ) {
            try {
              // Try to split string by comma if it looks like a comma-separated list
              dataToUse.misi = dataToUse.misi
                .split(",")
                .map((item) => item.trim());
            } catch (e) {
              // Keep it as string if splitting fails
              console.log("Could not parse misi string to array:", e);
            }
          }

          setProfilDesa(dataToUse);
        } else {
          // Use default data if API call was not successful
          setProfilDesa(defaultProfilDesa);
        }
      } catch (err) {
        console.error("Error fetching profil desa:", err);
        setError("Terjadi kesalahan saat memuat data profil desa");
        // Still use default data when there's an error
        setProfilDesa(defaultProfilDesa);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfilDesa();
  }, []);

  // Fetch sambutan data
  useEffect(() => {
    const fetchSambutan = async () => {
      try {
        const response = await fetch("/api/sambutan");
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setSambutan(result.data[0]);
        }
      } catch (err) {
        console.error("Error fetching sambutan:", err);
      }
    };

    fetchSambutan();
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
  const mapMarkers = Array.isArray(lokasi)
    ? lokasi
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
        }))
    : [];

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

  // Extract YouTube video ID if available
  const youtubeVideoId = sambutan?.video
    ? getYouTubeVideoId(sambutan.video)
    : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-5xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profilDesa) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-5xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // At this point profilDesa should never be null because we fall back to default data
  const data = profilDesa || defaultProfilDesa;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-900 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              {data.logo && (
                <div className="mb-6 w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-lg">
                  <img
                    src={data.logo || "/placeholder.svg"}
                    alt={`Logo ${data.nama}`}
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {data.nama}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4" />
                <span className="text-sm md:text-base">
                  {data.kecamatan && `Kec. ${data.kecamatan}, `}
                  {data.kabupaten && `Kab. ${data.kabupaten}, `}
                  {data.provinsi}
                </span>
              </div>
              <p className="text-lg md:text-xl max-w-2xl">{data.deskripsi}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="w-full max-w-5xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">Jumlah Penduduk</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  {typeof data.jumlah_penduduk === "number"
                    ? data.jumlah_penduduk.toLocaleString()
                    : data.jumlah_penduduk || "-"}
                </p>
                <p className="text-sm text-muted-foreground">Jiwa</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <Home className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">Luas Area</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  {data.luas_area || "-"}
                </p>
                <p className="text-sm text-muted-foreground">Hektar</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-4">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">Kode Pos</h3>
                <p className="text-2xl font-bold text-emerald-600">
                  {data.kode_pos || "-"}
                </p>
                <p className="text-sm text-muted-foreground">Indonesia</p>
              </CardContent>
            </Card>
          </div>

          {/* Sambutan Kepala Desa Section */}
          {sambutan && (
            <Card className="shadow-md mb-12">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  <CardTitle>Sambutan Kepala Desa</CardTitle>
                </div>
                <CardDescription>
                  Pesan dari Kepala Desa {data.nama}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-full md:w-1/3 flex justify-center">
                    {sambutan.foto ? (
                      <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-100">
                        <Image
                          src={sambutan.foto || "/placeholder.svg"}
                          alt={sambutan.namaKepalaDesa}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg?height=192&width=192";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-xl font-bold mb-2">
                      {sambutan.namaKepalaDesa}
                    </h3>
                    <div className="prose prose-sm max-w-none mb-6">
                      <p className="whitespace-pre-line">{sambutan.sambutan}</p>
                    </div>

                    {/* Video Sambutan */}
                    {youtubeVideoId && (
                      <div className="mt-6">
                        <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                          <Video className="h-4 w-4 text-emerald-600" />
                          <span>Video Sambutan:</span>
                        </h4>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                            title="Video Sambutan Kepala Desa"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs dengan Suspense */}
          <Suspense
            fallback={<div className="p-4 text-center">Memuat tabs...</div>}
          >
            <TabsWithParams
              activeTab={activeTab}
              data={data}
              sambutan={sambutan}
              isLoadingLokasi={isLoadingLokasi}
              mapMarkers={mapMarkers}
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              lokasi={lokasi}
              openInMaps={openInMaps}
              youtubeVideoId={youtubeVideoId}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
