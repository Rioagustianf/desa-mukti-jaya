"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

interface PengajuanSurat {
  _id: string;
  jenisSurat: {
    _id: string;
    nama: string;
    kode: string;
  };
  nama: string;
  nik: string;
  teleponWA: string;
  keperluan?: string;
  status: "pending" | "approved" | "rejected" | "revision";
  tanggalPengajuan: string;
  tanggalUpdate?: string;
  catatan?: string;
  letterGenerated?: boolean;
  letterUrl?: string;
  letterGeneratedAt?: string;
  letterGeneratedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pengajuan, setPengajuan] = useState<PengajuanSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    // Debug: Log session data
    console.log("Session data:", session);
    console.log("User role:", session?.user?.role);
    console.log("User NIK:", session?.user?.nik);
    console.log("User teleponWA:", session?.user?.teleponWA);

    if (
      !session ||
      (session.user?.role !== "user" && session.user?.role !== "resident")
    ) {
      router.push("/auth/user-login");
      return;
    }

    fetchPengajuan();
  }, [session, status, router]);

  const fetchPengajuan = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/pengajuan");
      const data = await response.json();

      console.log("Fetched pengajuan data:", data);

      if (data.success) {
        console.log("Pengajuan items:", data.data);
        // Log each item to check letter status
        data.data.forEach((item: PengajuanSurat, index: number) => {
          console.log(`Item ${index}:`, {
            _id: item._id,
            nama: item.nama,
            status: item.status,
            letterGenerated: item.letterGenerated,
            letterUrl: item.letterUrl,
            letterGeneratedAt: item.letterGeneratedAt,
          });
        });
        setPengajuan(data.data);
      } else {
        setError(data.message || "Gagal memuat data pengajuan");
      }
    } catch (error) {
      console.error("Error fetching pengajuan:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      console.log("Attempting to download letter for ID:", id);

      const response = await fetch(`/api/user/download-surat/${id}`);

      console.log("Download response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Gagal mendownload surat";
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
          console.log("Error response:", data);
        } catch (e) {
          console.log("Could not parse error response as JSON");
        }
        toast.error(errorMessage);
        return;
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = `surat-${id}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Surat berhasil didownload!");
    } catch (error) {
      console.error("Error downloading surat:", error);
      toast.error("Terjadi kesalahan saat mendownload surat");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Menunggu
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Ditolak
          </Badge>
        );
      case "revision":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Perlu Revisi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return dateString;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (
    !session ||
    (session.user?.role !== "user" && session.user?.role !== "resident")
  ) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard Warga
                </h1>
                <p className="text-sm text-gray-500">
                  Selamat datang, {session.user.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/user/profile">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <Link href="/auth/user-login">
                <Button variant="ghost" size="sm">
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {session.user.isAutoCreated && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Akun Anda telah dibuat otomatis.</strong> Anda dapat
              mengatur password di halaman profil untuk keamanan tambahan.
            </AlertDescription>
          </Alert>
        )}

        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{session.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">NIK</p>
                  <p className="font-medium">
                    {session.user.nik || "NIK tidak tersedia"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">WhatsApp</p>
                  <p className="font-medium">
                    {session.user.teleponWA || "Telepon tidak tersedia"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengajuan Surat */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Riwayat Pengajuan Surat
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchPengajuan}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Link href="/layanan-administrasi/ajukan">
                  <Button size="sm">Ajukan Surat Baru</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : pengajuan.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum ada pengajuan surat
                </h3>
                <p className="text-gray-500 mb-4">
                  Anda belum mengajukan surat administrasi apapun
                </p>
                <Link href="/layanan-administrasi/ajukan">
                  <Button>Ajukan Surat Pertama</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pengajuan.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-lg">
                          {item.jenisSurat.nama}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.letterGenerated && item.letterUrl && (
                          <Button
                            size="sm"
                            onClick={() => handleDownload(item._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Surat
                          </Button>
                        )}
                        {item.status === "pending" && !item.letterGenerated && (
                          <Badge variant="outline" className="text-xs">
                            Menunggu diproses admin
                          </Badge>
                        )}
                        {item.status === "approved" &&
                          !item.letterGenerated && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-100 text-orange-800"
                            >
                              Surat sedang dibuat
                            </Badge>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Diajukan: {formatDate(item.tanggalPengajuan)}
                        </span>
                      </div>
                      {item.tanggalUpdate && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Diperbarui: {formatDate(item.tanggalUpdate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {item.keperluan && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <strong>Keperluan:</strong> {item.keperluan}
                        </p>
                      </div>
                    )}

                    {item.catatan && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Catatan Admin:</strong> {item.catatan}
                        </p>
                      </div>
                    )}

                    {item.letterGenerated && item.letterGeneratedAt && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>Surat telah dibuat:</strong>{" "}
                          {formatDate(item.letterGeneratedAt)}
                          {item.letterGeneratedBy && (
                            <span> oleh {item.letterGeneratedBy}</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
