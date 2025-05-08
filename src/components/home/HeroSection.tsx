import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      <div className="relative h-[600px]">
        <Image
          src="https://placehold.co/600x400"
          alt="Masyarakat Desa Mukti Jaya"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
              Desa Mukti Jaya berkomitmen untuk memberikan pelayanan
              administrasi yang cerdas, etik, transparan, dan amanah demi
              kesejahteraan masyarakat.
            </h1>
            <Link
              href="/kontak"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-md transition duration-300"
            >
              Kontak Kami
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
