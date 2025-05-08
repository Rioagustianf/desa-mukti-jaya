"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGaleri } from "@/hooks/useGaleri";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, ImageIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function GallerySection() {
  const { galeri, isLoading } = useGaleri();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy", { locale: id });
    } catch (error) {
      return String(dateString);
    }
  };

  // Get the latest 6 gallery items
  const recentGallery = galeri
    ? [...galeri]
        .sort(
          (a, b) =>
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        )
        .slice(0, 6)
    : [];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Galeri Desa</h2>
            <p className="text-gray-600 mt-1">
              Dokumentasi kegiatan dan momen penting di desa kita
            </p>
          </div>
          <Link href="/galeri">
            <Button variant="outline" className="gap-1">
              Lihat Semua
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Memuat galeri...</p>
            </div>
          </div>
        ) : recentGallery.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentGallery.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedImage(item.gambar)}
              >
                <div className="relative w-full h-[250px]">
                  <Image
                    src={item.gambar || "/placeholder.svg"}
                    alt={item.caption}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder.svg?height=250&width=400";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium line-clamp-2">
                      {item.caption}
                    </h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.tanggal)}</span>
                    </div>
                    {item.kategori && (
                      <span className="inline-block bg-primary/80 text-white text-xs px-2 py-1 rounded mt-2">
                        {item.kategori}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-lg shadow-sm">
            <ImageIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Belum ada foto dalam galeri</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/galeri">
            <Button className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Lihat Galeri Lengkap
            </Button>
          </Link>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <div className="relative h-[500px] w-full">
            {selectedImage && (
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/placeholder.svg?height=500&width=800";
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
