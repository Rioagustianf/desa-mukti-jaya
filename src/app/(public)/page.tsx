import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SambutanSection from "@/components/home/SambutanSection";
import InfoDesaSection from "@/components/home/InfoDesaSection";
import BeritaAgendaSection from "@/components/home/BeritaAgendaSection";
import GallerySection from "@/components/home/GallerySection";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
        <div className="container mx-auto px-4">
          <SambutanSection />
          <InfoDesaSection />
          <BeritaAgendaSection />
          <GallerySection />
        </div>
      </main>
    </div>
  );
}
