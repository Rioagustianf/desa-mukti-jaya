# Website Desa Mukti Jaya

Aplikasi website desa yang dibangun dengan Next.js, MongoDB, dan Tailwind CSS. Aplikasi ini menyediakan fitur untuk mengelola konten website desa, termasuk profil desa, berita, agenda, galeri, dan layanan administrasi.

## Fitur Utama

- 🏠 **Profil Desa**: Informasi umum tentang desa, sejarah, prestasi, dan lokasi
- 👥 **Data Pengurus**: Informasi tentang struktur organisasi dan pengurus desa
- 📰 **Berita & Agenda**: Publikasi berita dan agenda kegiatan desa
- 🖼️ **Galeri**: Dokumentasi kegiatan desa dalam bentuk foto
- 📝 **Layanan Administrasi**: Informasi tentang layanan administrasi yang tersedia
- 🔐 **Manajemen Admin**: Pengelolaan pengguna admin dengan berbagai tingkat akses

## Prasyarat

Sebelum menginstal dan menjalankan aplikasi, pastikan Anda telah menginstal:

- Node.js (versi 18.0.0 atau lebih tinggi)
- npm atau yarn
- MongoDB (lokal atau cloud)

## Instalasi

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/username/desa-mukti-jaya.git
cd desa-mukti-jaya
\`\`\`

### 2. Instal Dependensi

\`\`\`bash
npm install

# atau

yarn install
\`\`\`

### 3. Konfigurasi Environment Variables

Buat file `.env` di root project dan tambahkan variabel lingkungan berikut:

\`\`\`

# MongoDB

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/desa-mukti-jaya

# NextAuth

NEXTAUTH_SECRET=your-secret-key-here

# Upload (opsional jika menggunakan layanan cloud storage)

UPLOAD_DIR=./public/uploads
\`\`\`

### 4. Buat Admin Default

Jalankan script untuk membuat pengguna admin default:

\`\`\`bash
npm run seed:admin

# atau

yarn seed:admin
\`\`\`

Script ini akan membuat pengguna admin dengan kredensial berikut:

- Username: admin
- Password: admin123

**Penting**: Segera ubah password ini setelah login pertama kali.

### 5. Jalankan Aplikasi

\`\`\`bash
npm run dev

# atau

yarn dev
\`\`\`

Aplikasi akan berjalan di `http://localhost:3000`.
