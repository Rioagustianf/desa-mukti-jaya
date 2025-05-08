"use client";

import { useState, useMemo } from "react";
import {
  usePengurus,
  type PengurusData,
  type Kontak,
} from "@/hooks/usePengurus";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Search,
  Phone,
  Mail,
  Loader2,
  User,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define position hierarchy for sorting
const positionHierarchy: Record<string, number> = {
  "Kepala Desa": 1,
  "Sekretaris Desa": 2,
  "Bendahara Desa": 3,
  "Kaur Pemerintahan": 4,
  "Kaur Pembangunan": 5,
  "Kaur Kesejahteraan": 6,
  "Kaur Keuangan": 7,
  "Kaur Umum": 8,
  "Kepala Dusun": 9,
  "Ketua RW": 10,
  "Ketua RT": 11,
};

// Group positions by category
const positionCategories = {
  "Pimpinan Desa": ["Kepala Desa", "Sekretaris Desa", "Bendahara Desa"],
  "Kepala Urusan": [
    "Kaur Pemerintahan",
    "Kaur Pembangunan",
    "Kaur Kesejahteraan",
    "Kaur Keuangan",
    "Kaur Umum",
  ],
  "Pimpinan Wilayah": ["Kepala Dusun", "Ketua RW", "Ketua RT"],
};

export default function PengurusWargaPage() {
  const { pengurus, isLoading, error } = usePengurus();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedPengurus, setSelectedPengurus] = useState<PengurusData | null>(
    null
  );

  // Get all unique position categories from the data
  const categories = useMemo(() => {
    if (!pengurus) return [];

    const uniquePositions = Array.from(new Set(pengurus.map((p) => p.jabatan)));

    // Find which category each position belongs to
    const categoriesFromData = new Set<string>();

    uniquePositions.forEach((position) => {
      let found = false;
      for (const [category, positions] of Object.entries(positionCategories)) {
        if (positions.includes(position)) {
          categoriesFromData.add(category);
          found = true;
          break;
        }
      }
      if (!found) {
        categoriesFromData.add("Lainnya");
      }
    });

    return Array.from(categoriesFromData);
  }, [pengurus]);

  // Filter pengurus based on search query and selected category
  const filteredPengurus = useMemo(() => {
    if (!pengurus) return [];

    return pengurus
      .filter((item) => {
        const matchesSearch =
          item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.jabatan.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "semua" ||
          (selectedCategory === "Lainnya"
            ? !Object.values(positionCategories).flat().includes(item.jabatan)
            : positionCategories[selectedCategory]?.includes(item.jabatan));

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // Sort by position hierarchy first
        const posA = positionHierarchy[a.jabatan] || 999;
        const posB = positionHierarchy[b.jabatan] || 999;

        if (posA !== posB) return posA - posB;

        // Then sort alphabetically by name
        return a.nama.localeCompare(b.nama);
      });
  }, [pengurus, searchQuery, selectedCategory]);

  // Group pengurus by position for the organizational chart view
  const groupedPengurus = useMemo(() => {
    if (!pengurus) return {};

    const grouped: Record<string, PengurusData[]> = {};

    filteredPengurus.forEach((person) => {
      if (!grouped[person.jabatan]) {
        grouped[person.jabatan] = [];
      }
      grouped[person.jabatan].push(person);
    });

    return grouped;
  }, [filteredPengurus, pengurus]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get contact by type
  const getKontakByJenis = (
    kontakArray: Kontak[],
    jenis: "telepon" | "email"
  ): string => {
    const found = kontakArray.find((k) => k.jenis === jenis);
    return found ? found.nilai : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="w-full max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 md:h-10 md:w-10" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Pengurus Desa
              </h1>
              <p className="text-lg md:text-xl max-w-2xl">
                Kenali para pengurus desa yang melayani dan memimpin pembangunan
                desa kita
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
                    placeholder="Cari pengurus..."
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
            </CardContent>
          </Card>

          {/* View Tabs */}
          <Tabs defaultValue="grid" className="mb-8">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="grid" className="flex items-center gap-2">
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
                  <span>Grid</span>
                </TabsTrigger>
                <TabsTrigger value="org" className="flex items-center gap-2">
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
                    <path d="M12 3v18" />
                    <rect x="3" y="8" width="18" height="8" rx="1" />
                    <path d="M12 16v3" />
                    <path d="M8 16v3" />
                    <path d="M16 16v3" />
                  </svg>
                  <span>Struktur</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-muted-foreground">
                    Memuat data pengurus desa...
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
            ) : filteredPengurus.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchQuery || selectedCategory !== "semua"
                    ? "Tidak ada pengurus yang sesuai dengan pencarian"
                    : "Belum ada data pengurus desa"}
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
                <TabsContent value="grid">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPengurus.map((item) => (
                      <Card
                        key={item._id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedPengurus(item)}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-32 w-32 mb-4">
                              {item.foto ? (
                                <AvatarImage
                                  src={item.foto || "/placeholder.svg"}
                                  alt={item.nama}
                                />
                              ) : (
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-2xl">
                                  {getInitials(item.nama)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <h3 className="font-bold text-lg mb-1">
                              {item.nama}
                            </h3>
                            <p className="text-indigo-600 font-medium mb-3">
                              {item.jabatan}
                            </p>

                            {/* Display phone if available */}
                            {getKontakByJenis(item.kontak, "telepon") && (
                              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>
                                  {getKontakByJenis(item.kontak, "telepon")}
                                </span>
                              </div>
                            )}

                            {/* Display email if available */}
                            {getKontakByJenis(item.kontak, "email") && (
                              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-1">
                                <Mail className="h-3 w-3" />
                                <span>
                                  {getKontakByJenis(item.kontak, "email")}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Organizational Structure View */}
                <TabsContent value="org">
                  <div className="space-y-10">
                    {Object.entries(groupedPengurus)
                      .sort(([posA], [posB]) => {
                        const rankA = positionHierarchy[posA] || 999;
                        const rankB = positionHierarchy[posB] || 999;
                        return rankA - rankB;
                      })
                      .map(([position, people]) => (
                        <div
                          key={position}
                          className="bg-white rounded-lg shadow-md p-6"
                        >
                          <h3 className="text-lg font-bold text-indigo-700 mb-4">
                            {position}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {people.map((person) => (
                              <div
                                key={person._id}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                                onClick={() => setSelectedPengurus(person)}
                              >
                                <Avatar className="h-12 w-12">
                                  {person.foto ? (
                                    <AvatarImage
                                      src={person.foto || "/placeholder.svg"}
                                      alt={person.nama}
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                      {getInitials(person.nama)}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{person.nama}</h4>
                                  {getKontakByJenis(
                                    person.kontak,
                                    "telepon"
                                  ) && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span>
                                        {getKontakByJenis(
                                          person.kontak,
                                          "telepon"
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedPengurus}
        onOpenChange={(open) => !open && setSelectedPengurus(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          {selectedPengurus && (
            <>
              <DialogHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-32 w-32">
                    {selectedPengurus.foto ? (
                      <AvatarImage
                        src={selectedPengurus.foto || "/placeholder.svg"}
                        alt={selectedPengurus.nama}
                      />
                    ) : (
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-3xl">
                        {getInitials(selectedPengurus.nama)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <DialogTitle className="text-2xl">
                  {selectedPengurus.nama}
                </DialogTitle>
                <p className="text-indigo-600 font-medium mt-1">
                  {selectedPengurus.jabatan}
                </p>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="space-y-4">
                {/* Phone contact */}
                {getKontakByJenis(selectedPengurus.kontak, "telepon") && (
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Phone className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Telepon
                      </h4>
                      <p>
                        {getKontakByJenis(selectedPengurus.kontak, "telepon")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email contact */}
                {getKontakByJenis(selectedPengurus.kontak, "email") && (
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Email
                      </h4>
                      <p>
                        {getKontakByJenis(selectedPengurus.kontak, "email")}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Jabatan
                    </h4>
                    <p>{selectedPengurus.jabatan}</p>
                  </div>
                </div>

                {/* Description if available */}
                {selectedPengurus.deskripsi && (
                  <div className="flex items-start gap-3 mt-2">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Deskripsi
                      </h4>
                      <p className="text-sm whitespace-pre-line">
                        {selectedPengurus.deskripsi}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
