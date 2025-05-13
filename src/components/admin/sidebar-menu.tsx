import {
  UserCircle,
  Home,
  Building2,
  MapPin,
  BookOpen,
  Trophy,
  Newspaper,
  ImageIcon,
  FolderCog,
  ClipboardList,
  Users,
  Phone,
  Megaphone,
  Users2,
  Mail,
  MailPlus,
  MailPlusIcon,
} from "lucide-react";

// Pengelompokan menu sesuai SRS dan usecase diagram
export const navMain = [
  {
    title: "Profil & Umum",
    icon: Home,
    items: [
      {
        title: "Sambutan Kepala Desa",
        url: "/admin/sambutan",
        icon: UserCircle,
      },
      {
        title: "Profil Desa",
        url: "/admin/profil-desa",
        icon: Home,
      },
      {
        title: "Fasilitas",
        url: "/admin/fasilitas",
        icon: Building2,
      },
      {
        title: "Lokasi",
        url: "/admin/lokasi",
        icon: MapPin,
      },
      {
        title: "Sejarah",
        url: "/admin/sejarah",
        icon: BookOpen,
      },
      {
        title: "Prestasi",
        url: "/admin/prestasi",
        icon: Trophy,
      },
      {
        title: "Data Pengurus Desa",
        url: "/admin/pengurus",
        icon: Users,
      },
      {
        title: "Kontak Desa",
        url: "/admin/kontak",
        icon: Phone,
      },
      {
        title: "Kelola Admin",
        url: "/admin/users",
        icon: Users2,
      },
    ],
  },
  {
    title: "Konten & Kegiatan",
    icon: Newspaper,
    items: [
      {
        title: "Berita & Agenda",
        url: "/admin/berita",
        icon: Newspaper,
      },
      {
        title: "Galeri Kegiatan",
        url: "/admin/galeri",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "Layanan Administrasi",
    icon: FolderCog,
    items: [
      {
        title: "Informasi Layanan",
        url: "/admin/layanan-administrasi",
        icon: FolderCog,
      },
      {
        title: "Pengajuan Surat",
        url: "/admin/pengajuan-surat",
        icon: Mail,
      },
      {
        title: "Tambah Jenis Surat",
        url: "/admin/jenis-surat",
        icon: MailPlusIcon,
      },
      {
        title: "Panduan/Syarat Administrasi",
        url: "/admin/panduan-administrasi",
        icon: ClipboardList,
      },
    ],
  },
];
