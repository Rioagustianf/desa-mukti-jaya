"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ArrowLeft,
  Loader2,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import { format, isAfter, isToday } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface AgendaDetail {
  _id: string;
  judul: string;
  deskripsi?: string;
  tanggalMulai: string | Date;
  tanggalSelesai?: string | Date;
  lokasi?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function AgendaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [agenda, setAgenda] = useState<AgendaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/agenda/${params.id}`);
        const data = await response.json();

        if (data.success && data.data) {
          setAgenda(data.data);
        } else {
          console.error("Failed to fetch agenda:", data.message);
          setError("Agenda tidak ditemukan");
        }
      } catch (error) {
        console.error("Error fetching agenda:", error);
        setError("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
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

  // Format time for display
  const formatTime = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm", { locale: id });
    } catch (error) {
      return "";
    }
  };

  // Check if agenda is upcoming
  const isUpcoming = (tanggalMulai: string | Date) => {
    const startDate = new Date(tanggalMulai);
    return isAfter(startDate, new Date()) || isToday(startDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-3xl mx-auto flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-muted-foreground">Memuat agenda...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agenda) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-3xl mx-auto">
            <Card className="shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-red-500 mb-4">
                    {error || "Agenda tidak ditemukan"}
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
            <Link href="/berita-agenda?tab=agenda">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Agenda
              </Button>
            </Link>
          </div>

          <Card className="shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <Badge
                    className={`mb-2 ${
                      isUpcoming(agenda.tanggalMulai)
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                  >
                    {isUpcoming(agenda.tanggalMulai)
                      ? "Agenda Mendatang"
                      : "Agenda Selesai"}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {agenda.judul}
                  </h1>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-indigo-600" />
                    Tanggal Mulai
                  </h3>
                  <p className="text-lg">
                    {formatDate(agenda.tanggalMulai)}
                    {formatTime(agenda.tanggalMulai) && (
                      <span className="text-muted-foreground ml-2">
                        Pukul {formatTime(agenda.tanggalMulai)}
                      </span>
                    )}
                  </p>
                </div>

                {agenda.tanggalSelesai && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-indigo-600" />
                      Tanggal Selesai
                    </h3>
                    <p className="text-lg">
                      {formatDate(agenda.tanggalSelesai)}
                      {formatTime(agenda.tanggalSelesai) && (
                        <span className="text-muted-foreground ml-2">
                          Pukul {formatTime(agenda.tanggalSelesai)}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {agenda.lokasi && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-indigo-600" />
                    Lokasi
                  </h3>
                  <p className="text-lg">{agenda.lokasi}</p>
                </div>
              )}

              <Separator className="my-6" />

              <div className="prose max-w-none">
                <h3 className="text-xl font-medium mb-4">Deskripsi</h3>
                <p className="whitespace-pre-line leading-relaxed">
                  {agenda.deskripsi || "Tidak ada deskripsi untuk agenda ini."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
