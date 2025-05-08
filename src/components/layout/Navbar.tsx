"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "../../../public/logo.png";
import Image from "next/image";

// Updated navigation items based on the use case diagram
const mainNavItems = [
  { title: "Home", href: "/" },
  {
    title: "Informasi Desa",
    href: "/informasi-desa",
    children: [
      { title: "Fasilitas", href: "/informasi-desa/fasilitas" },
      { title: "Prestasi", href: "/informasi-desa/prestasi" },
      { title: "Profil Desa", href: "/profil-desa/profil" },
      { title: "Sejarah", href: "/profil-desa/sejarah" },
      { title: "Data Pengurus Desa", href: "/profil-desa/pengurus" },
    ],
  },
  {
    title: "Layanan Administrasi",
    href: "/layanan-administrasi",
    children: [
      { title: "Informasi Layanan", href: "/layanan-administrasi/informasi" },
      { title: "Panduan & Syarat", href: "/layanan-administrasi/panduan" },
    ],
  },
  { title: "Berita & Agenda", href: "/berita-agenda" },
  { title: "Galeri", href: "/galeri" },
  { title: "Kontak", href: "/kontak" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-sky-900 shadow-md" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Image src={logo} alt="Logo Desa Mukti Jaya" />
          </div>
          <span className="font-bold text-lg text-white">Desa Mukti Jaya</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {mainNavItems.map((item) =>
                item.children ? (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuTrigger
                      className={cn(
                        "text-white hover:text-white/90 bg-transparent",
                        scrolled ? "hover:bg-sky-700" : "hover:bg-transparent"
                      )}
                    >
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.children.map((child) => (
                          <ListItem
                            key={child.title}
                            title={child.title}
                            href={child.href}
                          />
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.title}>
                    <NavigationMenuLink
                      asChild
                      className="text-white hover:text-white/90 bg-transparent px-4 py-2 hover:bg-transparent"
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <nav className="flex flex-col gap-4 mt-8">
                {mainNavItems.map((item) => (
                  <div key={item.title} className="border-b pb-2">
                    {item.children ? (
                      <MobileAccordionItem
                        title={item.title}
                        items={item.children}
                      />
                    ) : (
                      <Link
                        href={item.href}
                        className="font-medium hover:text-blue-500 block py-2"
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Komponen ListItem untuk dropdown menu
const ListItem = ({ title, href }) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

// Mobile accordion item for nested navigation
const MobileAccordionItem = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 font-medium hover:text-blue-500"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pl-4 mt-1 space-y-1 border-l border-gray-200">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="block py-1.5 text-sm hover:text-blue-500"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
