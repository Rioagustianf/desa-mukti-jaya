import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";
import logo from "../../../public/logo.png";

export default function Footer() {
  return (
    <footer className="bg-sky-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image
                src={logo}
                alt="Logo Desa Mukti Jaya"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="font-bold">Desa Mukti Jaya</span>
            </div>
            <p className="text-gray-400 text-sm">
              Jalan Raya Desa No. 123, Kecamatan Tanjung, Kabupaten Sejahtera,
              12345
            </p>
            <div className="mt-4 text-sm text-gray-400">
              <p>info@desamuktijaya.com</p>
              <p>pengaduan@desamuktijaya.com</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Jejak</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-white">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/profil-desa" className="hover:text-white">
                  Profil Desa
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-white">
                  Berita
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-white">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-white">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Halaman Umum</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/pemerintahan" className="hover:text-white">
                  Pemerintahan
                </Link>
              </li>
              <li>
                <Link href="/data-penduduk-desa" className="hover:text-white">
                  Data Penduduk Desa
                </Link>
              </li>
              <li>
                <Link href="/produk-administrasi" className="hover:text-white">
                  Produk Administrasi
                </Link>
              </li>
              <li>
                <Link href="/lokasi" className="hover:text-white">
                  Lokasi
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:text-white">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Media Sosial</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="hover:text-blue-400">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>Copyright © Desa Mukti Jaya {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
