"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  ImageIcon,
  Info,
  LayoutDashboard,
  Loader2,
  MapPin,
  MessageSquare,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useBerita } from "@/hooks/useBerita";
import { useAgenda } from "@/hooks/useAgenda";
import { useGaleri } from "@/hooks/useGaleri";
import { useKontak } from "@/hooks/useKontak";
import { useLokasi } from "@/hooks/useLokasi";
import { useLayanan } from "@/hooks/useLayanan";
import { usePanduan } from "@/hooks/usePanduan";
import { useProfilDesa } from "@/hooks/useProfilDesa";
import { useSejarah } from "@/hooks/useSejarah";
import { usePrestasi } from "@/hooks/usePrestasi";
import { usePengurus } from "@/hooks/usePengurus";
import { useFasilitas } from "@/hooks/useFasilitas";

export default function AdminDashboardPage() {
  // Fetch data from all hooks
  const { berita, isLoading: isLoadingBerita } = useBerita();
  const { agenda, isLoading: isLoadingAgenda } = useAgenda();
  const { galeri, isLoading: isLoadingGaleri } = useGaleri();
  const { kontak, isLoading: isLoadingKontak } = useKontak();
  const { lokasi, isLoading: isLoadingLokasi } = useLokasi();
  const { layanan, isLoading: isLoadingLayanan } = useLayanan();
  const { panduan, isLoading: isLoadingPanduan } = usePanduan();
  const { singleProfile, isLoading: isLoadingProfilDesa } = useProfilDesa();
  const { sejarah, isLoading: isLoadingSejarah } = useSejarah();
  const { prestasi, isLoading: isLoadingPrestasi } = usePrestasi();
  const { pengurus, isLoading: isLoadingPengurus } = usePengurus();
  const { fasilitas, isLoading: isLoadingFasilitas } = useFasilitas();

  const [progress, setProgress] = useState(0);
  const isLoading =
    isLoadingBerita ||
    isLoadingAgenda ||
    isLoadingGaleri ||
    isLoadingKontak ||
    isLoadingLokasi ||
    isLoadingLayanan ||
    isLoadingPanduan ||
    isLoadingProfilDesa ||
    isLoadingSejarah ||
    isLoadingPrestasi ||
    isLoadingPengurus ||
    isLoadingFasilitas;

  // Calculate content completion percentage
  useEffect(() => {
    if (isLoading) return;

    const contentSections = [
      { name: "Profil Desa", hasContent: !!singleProfile },
      {
        name: "Berita",
        hasContent: Array.isArray(berita) && berita.length > 0,
      },
      {
        name: "Agenda",
        hasContent: Array.isArray(agenda) && agenda.length > 0,
      },
      {
        name: "Galeri",
        hasContent: Array.isArray(galeri) && galeri.length > 0,
      },
      {
        name: "Kontak",
        hasContent: Array.isArray(kontak) && kontak.length > 0,
      },
      {
        name: "Lokasi",
        hasContent: Array.isArray(lokasi) && lokasi.length > 0,
      },
      {
        name: "Layanan",
        hasContent: Array.isArray(layanan) && layanan.length > 0,
      },
      {
        name: "Panduan",
        hasContent: Array.isArray(panduan) && panduan.length > 0,
      },
      {
        name: "Sejarah",
        hasContent: Array.isArray(sejarah) && sejarah.length > 0,
      },
      {
        name: "Prestasi",
        hasContent: Array.isArray(prestasi) && prestasi.length > 0,
      },
      {
        name: "Pengurus",
        hasContent: Array.isArray(pengurus) && pengurus.length > 0,
      },
      {
        name: "Fasilitas",
        hasContent: Array.isArray(fasilitas) && fasilitas.length > 0,
      },
    ];

    const completedSections = contentSections.filter(
      (section) => section.hasContent
    ).length;
    const totalSections = contentSections.length;
    const calculatedProgress = Math.round(
      (completedSections / totalSections) * 100
    );

    setProgress(calculatedProgress);
  }, [
    singleProfile,
    berita,
    agenda,
    galeri,
    kontak,
    lokasi,
    layanan,
    panduan,
    sejarah,
    prestasi,
    pengurus,
    fasilitas,
    isLoading,
  ]);

  // Calculate notifications (empty required sections)
  const notifications = useMemo(() => {
    if (isLoading) return 0;

    const requiredSections = [
      { name: "Profil Desa", hasContent: !!singleProfile },
      {
        name: "Kontak",
        hasContent: Array.isArray(kontak) && kontak.length > 0,
      },
      {
        name: "Pengurus",
        hasContent: Array.isArray(pengurus) && pengurus.length > 0,
      },
    ];

    return requiredSections.filter((section) => !section.hasContent).length;
  }, [singleProfile, kontak, pengurus, isLoading]);

  // Get items added this month
  const getItemsAddedThisMonth = (items: any[] | undefined) => {
    if (!items || !Array.isArray(items)) return 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return items.filter((item) => {
      if (!item.createdAt) return false;
      const createdAt = new Date(item.createdAt);
      return createdAt >= startOfMonth;
    }).length;
  };

  // Format date for recent activities
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hari ini";
    } else if (diffDays === 1) {
      return "Kemarin";
    } else {
      return `${diffDays} hari lalu`;
    }
  };

  // Get recent activities
  const recentActivities = useMemo(() => {
    if (isLoading) return [];

    const activities: {
      id: string;
      action: string;
      time: string;
      date: Date;
      status: string;
    }[] = [];

    // Add berita activities
    if (berita && Array.isArray(berita)) {
      berita.forEach((item) => {
        if (item.createdAt) {
          activities.push({
            id: `berita-${item._id}`,
            action: `Berita baru: ${item.judul}`,
            time: formatDate(item.createdAt),
            date: new Date(item.createdAt),
            status: "success",
          });
        }
      });
    }

    // Add agenda activities
    if (agenda && Array.isArray(agenda)) {
      agenda.forEach((item) => {
        if (item.createdAt) {
          activities.push({
            id: `agenda-${item._id}`,
            action: `Agenda baru: ${item.judul}`,
            time: formatDate(item.createdAt),
            date: new Date(item.createdAt),
            status: "info",
          });
        }
      });
    }

    // Add galeri activities
    if (galeri && Array.isArray(galeri)) {
      galeri.forEach((item) => {
        if (item.createdAt) {
          activities.push({
            id: `galeri-${item._id}`,
            action: `Foto baru: ${item.judul}`,
            time: formatDate(item.createdAt),
            date: new Date(item.createdAt),
            status: "success",
          });
        }
      });
    }

    // Sort by date (newest first) and take the first 5
    return activities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
  }, [berita, agenda, galeri, isLoading]);

  // Generate monthly data for chart
  const generateMonthlyData = () => {
    if (isLoading) return Array(12).fill(10);

    const now = new Date();
    const currentYear = now.getFullYear();
    const monthlyData = Array(12).fill(0);

    // Function to count items per month
    const countItemsByMonth = (items: any[] | undefined) => {
      if (!items || !Array.isArray(items)) return;

      items.forEach((item) => {
        if (item.createdAt) {
          const createdAt = new Date(item.createdAt);
          if (createdAt.getFullYear() === currentYear) {
            const month = createdAt.getMonth();
            monthlyData[month]++;
          }
        }
      });
    };

    // Count all content types
    countItemsByMonth(berita);
    countItemsByMonth(agenda);
    countItemsByMonth(galeri);
    countItemsByMonth(layanan);
    countItemsByMonth(panduan);

    // Normalize data for chart (min 10%, max 90%)
    const max = Math.max(...monthlyData, 1);
    return monthlyData.map((value) => {
      const percentage = (value / max) * 80;
      return Math.max(percentage + 10, 10); // Ensure minimum 10%
    });
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-green-800">
              Selamat Datang, Admin {singleProfile?.nama || "Desa"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola konten website desa dengan mudah dan efisien
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifikasi</span>
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
            <Button className="gap-2">
              <Settings size={16} />
              <span className="hidden sm:inline">Pengaturan</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      ) : (
        /* Dashboard Content */
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
            <TabsTrigger value="content">Konten</TabsTrigger>
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Total Berita & Agenda
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(Array.isArray(berita) ? berita.length : 0) +
                      (Array.isArray(agenda) ? agenda.length : 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +
                    {getItemsAddedThisMonth(berita) +
                      getItemsAddedThisMonth(agenda)}{" "}
                    bulan ini
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Galeri Foto
                  </CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.isArray(galeri) ? galeri.length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{getItemsAddedThisMonth(galeri)} bulan ini
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Layanan Administrasi
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.isArray(layanan) ? layanan.length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(layanan) &&
                    layanan.length > 0 &&
                    layanan[0].updatedAt
                      ? `Terakhir diperbarui ${formatDate(
                          layanan[0].updatedAt
                        )}`
                      : "Belum ada data"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <Card>
              <CardHeader>
                <CardTitle>Kelengkapan Konten Website</CardTitle>
                <CardDescription>
                  Lengkapi semua konten untuk meningkatkan kualitas website desa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{progress}%</span>
                      <span className="text-muted-foreground text-sm">
                        selesai
                      </span>
                    </div>
                    <Badge
                      variant={progress < 50 ? "outline" : "default"}
                      className={progress < 50 ? "text-orange-500" : ""}
                    >
                      {progress < 30
                        ? "Perlu Perhatian"
                        : progress < 70
                        ? "Sedang Berlangsung"
                        : "Hampir Selesai"}
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {progress < 100
                    ? `${
                        12 - Math.round((progress / 100) * 12)
                      } bagian konten belum lengkap`
                    : "Semua konten telah lengkap"}
                </div>
                <Button size="sm" variant="outline">
                  Lihat Detail
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Aktivitas Terbaru</CardTitle>
                <CardDescription>
                  Aktivitas pengelolaan konten website desa
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 rounded-lg border p-3"
                      >
                        <div
                          className={`mt-0.5 rounded-full p-1 ${
                            activity.status === "success"
                              ? "bg-green-100"
                              : "bg-blue-100"
                          }`}
                        >
                          {activity.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-muted-foreground mb-2">
                      Belum ada aktivitas terbaru
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aktivitas akan muncul saat Anda menambahkan konten baru
                    </p>
                  </div>
                )}
              </CardContent>
              {recentActivities.length > 0 && (
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Lihat Semua Aktivitas
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Konten Website</CardTitle>
                <CardDescription>
                  Akses cepat ke semua area pengelolaan konten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: <MessageSquare size={20} />,
                      title: "Sambutan Kepala Desa",
                      href: "/admin/sambutan",
                      count: 1,
                    },
                    {
                      icon: <Home size={20} />,
                      title: "Profil Desa",
                      href: "/admin/profil-desa",
                      count: singleProfile ? 1 : 0,
                    },
                    {
                      icon: <Settings size={20} />,
                      title: "Fasilitas",
                      href: "/admin/fasilitas",
                      count: Array.isArray(fasilitas) ? fasilitas.length : 0,
                    },
                    {
                      icon: <MapPin size={20} />,
                      title: "Lokasi",
                      href: "/admin/lokasi",
                      count: Array.isArray(lokasi) ? lokasi.length : 0,
                    },
                    {
                      icon: <Calendar size={20} />,
                      title: "Sejarah",
                      href: "/admin/sejarah",
                      count: Array.isArray(sejarah) ? sejarah.length : 0,
                    },
                    {
                      icon: <Trophy size={20} />,
                      title: "Prestasi",
                      href: "/admin/prestasi",
                      count: Array.isArray(prestasi) ? prestasi.length : 0,
                    },
                    {
                      icon: <FileText size={20} />,
                      title: "Berita & Agenda",
                      href: "/admin/berita",
                      count:
                        (Array.isArray(berita) ? berita.length : 0) +
                        (Array.isArray(agenda) ? agenda.length : 0),
                    },
                    {
                      icon: <ImageIcon size={20} />,
                      title: "Galeri Kegiatan",
                      href: "/admin/galeri",
                      count: Array.isArray(galeri) ? galeri.length : 0,
                    },
                    {
                      icon: <Info size={20} />,
                      title: "Layanan Administrasi",
                      href: "/admin/layanan",
                      count: Array.isArray(layanan) ? layanan.length : 0,
                    },
                    {
                      icon: <FileText size={20} />,
                      title: "Panduan Administrasi",
                      href: "/admin/panduan",
                      count: Array.isArray(panduan) ? panduan.length : 0,
                    },
                    {
                      icon: <Users size={20} />,
                      title: "Pengurus Desa",
                      href: "/admin/pengurus",
                      count: Array.isArray(pengurus) ? pengurus.length : 0,
                    },
                    {
                      icon: <MessageSquare size={20} />,
                      title: "Kontak Desa",
                      href: "/admin/kontak",
                      count: Array.isArray(kontak) ? kontak.length : 0,
                    },
                  ].map((item, index) => (
                    <Link
                      href={item.href}
                      key={index}
                      className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors relative"
                    >
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        {item.icon}
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.count > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2"
                        >
                          {item.count}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistik Konten</CardTitle>
                <CardDescription>
                  Ringkasan aktivitas penambahan konten website desa
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <div className="flex h-[240px] w-full max-w-md items-end gap-2">
                  {monthlyData.map((height, i) => (
                    <div
                      key={i}
                      className="bg-primary/90 rounded-md w-full"
                      style={{ height: `${height}%` }}
                    >
                      <div className="h-full w-full flex items-start justify-center">
                        <span className="text-[10px] text-white font-medium mt-1">
                          {
                            [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "Mei",
                              "Jun",
                              "Jul",
                              "Agu",
                              "Sep",
                              "Okt",
                              "Nov",
                              "Des",
                            ][i]
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" className="gap-1">
                  <BarChart3 size={16} />
                  Ekspor Data
                </Button>
                <Button size="sm" className="gap-1">
                  <LayoutDashboard size={16} />
                  Laporan Lengkap
                </Button>
              </CardFooter>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Informasi Penting</AlertTitle>
              <AlertDescription>
                {progress < 50
                  ? "Beberapa bagian konten website masih kosong. Lengkapi konten untuk meningkatkan kualitas website desa."
                  : progress < 100
                  ? "Website desa sudah cukup lengkap. Lanjutkan melengkapi konten yang tersisa."
                  : "Semua konten website telah lengkap. Pastikan untuk memperbarui konten secara berkala."}
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
