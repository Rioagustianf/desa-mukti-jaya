"use client";

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
  MapPin,
  MessageSquare,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AdminDashboardPage() {
  const [progress, setProgress] = useState(13);
  const [notifications, setNotifications] = useState(3);

  // Simulate progress increasing over time
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 1000);
    return () => clearTimeout(timer);
  }, []);

  const recentActivities = [
    {
      id: 1,
      action: "Berita baru ditambahkan",
      time: "Hari ini, 10:45",
      status: "success",
    },
    {
      id: 2,
      action: "Profil desa diperbarui",
      time: "Kemarin, 14:30",
      status: "info",
    },
    {
      id: 3,
      action: "Galeri kegiatan diperbarui",
      time: "2 hari lalu",
      status: "info",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-green-800">
              Selamat Datang, Admin Desa Mukti Jaya
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

      {/* Dashboard Content */}
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
                  Total Berita
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+4 bulan ini</p>
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
                <div className="text-2xl font-bold">56</div>
                <p className="text-xs text-muted-foreground">+12 bulan ini</p>
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
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Terakhir diperbarui 2 hari lalu
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
                Terakhir diperbarui: 2 jam yang lalu
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
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full">
                Lihat Semua Aktivitas
              </Button>
            </CardFooter>
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
                  },
                  {
                    icon: <Home size={20} />,
                    title: "Profil Desa",
                    href: "/admin/profil-desa",
                  },
                  {
                    icon: <Settings size={20} />,
                    title: "Fasilitas",
                    href: "/admin/fasilitas",
                  },
                  {
                    icon: <MapPin size={20} />,
                    title: "Lokasi",
                    href: "/admin/lokasi",
                  },
                  {
                    icon: <Calendar size={20} />,
                    title: "Sejarah",
                    href: "/admin/sejarah",
                  },
                  {
                    icon: <Trophy size={20} />,
                    title: "Prestasi",
                    href: "/admin/prestasi",
                  },
                  {
                    icon: <FileText size={20} />,
                    title: "Berita & Agenda",
                    href: "/admin/berita",
                  },
                  {
                    icon: <ImageIcon size={20} />,
                    title: "Galeri Kegiatan",
                    href: "/admin/galeri",
                  },
                  {
                    icon: <Info size={20} />,
                    title: "Layanan Administrasi",
                    href: "/admin/layanan",
                  },
                  {
                    icon: <FileText size={20} />,
                    title: "Panduan Administrasi",
                    href: "/admin/panduan",
                  },
                  {
                    icon: <Users size={20} />,
                    title: "Pengurus Desa",
                    href: "/admin/pengurus",
                  },
                  {
                    icon: <MessageSquare size={20} />,
                    title: "Kontak Desa",
                    href: "/admin/kontak",
                  },
                ].map((item, index) => (
                  <Link
                    href={item.href}
                    key={index}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center hover:bg-accent transition-colors"
                  >
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Website</CardTitle>
              <CardDescription>
                Ringkasan aktivitas dan statistik website desa
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <div className="flex h-[240px] w-full max-w-md items-end gap-2">
                {[40, 30, 70, 50, 90, 60, 50, 70, 60, 90, 40, 60].map(
                  (height, i) => (
                    <div
                      key={i}
                      className="bg-primary/90 rounded-md w-full"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
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
              Pastikan untuk memperbarui konten website secara berkala untuk
              menjaga informasi tetap relevan.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
