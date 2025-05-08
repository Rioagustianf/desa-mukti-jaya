"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

// Definisikan interface Sambutan
interface Sambutan {
  _id: string;
  nama?: string;
  jabatan?: string;
  pesan?: string;
  foto?: string;
  message?: string;
  name?: string;
  position?: string;
  photo?: string;
  namaKepalaDesa?: string;
  sambutan?: string;
}

export default function SambutanSection() {
  const [sambutan, setSambutan] = useState<Sambutan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSambutan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/sambutan");
        const result = await response.json();

        if (result.success && result.data) {
          if (Array.isArray(result.data) && result.data.length > 0) {
            setSambutan(result.data[0]);
          } else if (typeof result.data === "object" && result.data !== null) {
            setSambutan(result.data);
          } else {
            setError("Tidak ada data sambutan yang tersedia");
          }
        } else {
          setError("Tidak ada data sambutan yang tersedia");
        }
      } catch (err) {
        setError("Gagal memuat data sambutan");
        console.error("Error fetching sambutan:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSambutan();
  }, []);

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/3">
            {isLoading ? (
              <div className="relative h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Memuat...</span>
              </div>
            ) : sambutan?.foto || sambutan?.photo ? (
              <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                <Image
                  src={sambutan.foto || sambutan.photo}
                  alt={`Foto ${
                    sambutan.jabatan || sambutan.position || "Kepala Desa"
                  }`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative h-[300px] w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  Foto Kepala Desa
                </span>
              </div>
            )}
          </div>
          <div className="md:w-2/3">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  Sambutan Kepala Desa{" "}
                  {sambutan?.namaKepalaDesa || sambutan?.name}
                </h2>
                <blockquote className="italic border-l-4 border-blue-500 pl-4 mb-6">
                  {sambutan?.sambutan ||
                    sambutan?.message ||
                    sambutan?.pesan ||
                    "Pesan tidak tersedia."}
                </blockquote>
                <Link
                  href="/profil-desa/profil"
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
                >
                  Lebih Lanjut
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
