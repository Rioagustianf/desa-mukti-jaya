"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface BeritaDetail {
  _id: string;
  judul: string;
  isi: string;
  gambar?: string;
  tanggal: string | Date;
  penulis?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function BeritaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [berita, setBerita] = useState<BeritaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBerita = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/berita/${params.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          setBerita(data.data);
        } else {
          console.error("Failed to fetch berita:", data.message);
          setError("Berita tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching berita:", error);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerita();
  }, [params.id]);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-3xl mx-auto flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-muted-foreground">Memuat berita...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !berita) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-3xl mx-auto">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-red-500 mb-4">
                    {error || "Berita tidak ditemukan"}
                  </p>
                  <Button variant="outline" onClick={() => router.back()}>
                    Kembali
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4">
        <div className="w-full max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/berita-agenda?tab=berita">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Berita
              </Button>
            </Link>
          </div>

          <Card className="shadow-md overflow-hidden">
            {berita.gambar && (
              <div className="relative h-64 w-full bg-muted">
                <Image
                  src={berita.gambar || "/placeholder.svg"}
                  alt={berita.judul}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder.svg?height=256&width=768";
                  }}
                />
              </div>
            )}

            <CardContent className="p-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">
                {berita.judul}
              </h1>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(berita.tanggal)}</span>
                </div>
                {berita.penulis && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{berita.penulis}</span>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="prose max-w-none">
                <p className="whitespace-pre-line leading-relaxed">
                  {berita.isi}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
