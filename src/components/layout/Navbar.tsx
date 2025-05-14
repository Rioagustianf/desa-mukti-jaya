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
    href: "/layanan-administrasi/informasi",
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
      <div className="container mx-auto px-4 sm:px-6 flex h-16 sm:h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <Image
              src={logo || "/placeholder.svg"}
              alt="Logo Desa Mukti Jaya"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-bold text-sm sm:text-lg text-white">
            Desa Mukti Jaya
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
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

          <Link href="/auth/login">
            <Button className="bg-sky-800 text-white border-white hover:bg-sky-700 hover:text-white">
              Admin Login
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 h-10 w-10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <div className="border-b py-4 px-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src={logo || "/placeholder.svg"}
                      alt="Logo Desa Mukti Jaya"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-bold text-lg">Desa Mukti Jaya</span>
                </Link>
              </div>
              <div className="px-6 py-4">
                <nav className="flex flex-col space-y-1">
                  {mainNavItems.map((item) =>
                    item.children ? (
                      <div key={item.title} className="py-1">
                        <MobileNavAccordion
                          title={item.title}
                          items={item.children}
                        />
                      </div>
                    ) : (
                      <Link
                        key={item.title}
                        href={item.href}
                        className="flex items-center py-2 text-sm font-medium rounded-md hover:bg-muted px-3"
                      >
                        {item.title}
                      </Link>
                    )
                  )}
                </nav>
              </div>
              <div className="border-t mt-auto p-6">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full bg-sky-800 text-white">
                    Admin Login
                  </Button>
                </Link>
              </div>
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

// Replace the MobileAccordionItem with this improved version
const MobileNavAccordion = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-sm font-medium rounded-md hover:bg-muted px-3"
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="ml-4 pl-2 border-l space-y-1">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex py-2 text-sm rounded-md hover:bg-muted px-3"
            >
              {item.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
