import Link from "next/link";
import { MapPin } from "lucide-react";

export default function InfoDesaSection() {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Profil Desa */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Profil Desa</h3>
            <p className="text-gray-600 mb-4">
              Di sini Anda bisa melihat profil lengkap Desa Mukti Jaya, yang
              akan berisi informasi umum, demografis, potensi desa, pemerintah
              desa, dan lain-lain.
            </p>
            <Link
              href="/profil-desa/profil"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition duration-300"
            >
              Lebih Lanjut
            </Link>
          </div>

          {/* Fasilitas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Fasilitas</h3>
            <p className="text-gray-600 text-center">
              Lihat informasi tentang fasilitas desa Mukti Jaya.
            </p>
            <div className="text-center mt-4">
              <Link
                href="/informasi-desa/fasilitas"
                className="text-blue-500 hover:underline"
              >
                Lihat lebih lanjut
              </Link>
            </div>
          </div>

          {/* Lokasi */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Lokasi</h3>
            <p className="text-gray-600 text-center">
              Lihat informasi tentang lokasi desa Mukti Jaya.
            </p>
            <div className="text-center mt-4">
              <Link
                href="/profil-desa/profil?tab=lokasi"
                className="text-blue-500 hover:underline"
              >
                Lihat lebih lanjut
              </Link>
            </div>
          </div>

          {/* Prestasi */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-center">Prestasi</h3>
            <p className="text-gray-600 text-center">
              Lihat informasi tentang prestasi desa Mukti Jaya.
            </p>
            <div className="text-center mt-4">
              <Link href="/prestasi" className="text-blue-500 hover:underline">
                Lihat lebih lanjut
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
