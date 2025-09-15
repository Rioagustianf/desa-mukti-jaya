import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import LayananAdministrasi from "@/lib/models/LayananAdministrasi";

// Data layanan administrasi berdasarkan permintaan client
const layananData = [
  {
    nama: "Surat Keterangan Domisili",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang bertempat tinggal atau berdomisili di suatu wilayah tertentu.",
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 3x4 (2 lembar)
5. Fotokopi akta kelahiran (jika belum memiliki KTP)
6. Surat pernyataan domisili bermaterai Rp10.000`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1-3 hari kerja",
  },
  {
    nama: "Surat Keterangan Usaha (SKU)",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang memiliki usaha yang berjalan di wilayah setempat.",
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 4x6 (2 lembar)
5. Fotokopi NPWP (jika ada)
6. Surat pernyataan tidak keberatan tetangga (minimal 2 tetangga)
7. Foto lokasi usaha
8. Dokumen legalitas usaha lainnya (jika ada)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "2-5 hari kerja",
  },
  {
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang atau keluarga tidak mampu secara ekonomi.",
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 3x4 (2 lembar)
5. Fotokopi rekening listrik/bukti pengeluaran bulanan
6. Surat pernyataan tidak mampu bermaterai Rp10.000
7. Dokumen tambahan pendukung lainnya (jika ada)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1-3 hari kerja",
  },
  {
    nama: "Surat Keterangan Belum Menikah",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang belum pernah menikah.",
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 4x6 (2 lembar)
5. Surat pernyataan belum menikah bermaterai Rp10.000
6. Fotokopi akta cerai (jika pernah menikah dan bercerai)
7. Fotokopi akta kematian pasangan (jika janda/duda)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1-3 hari kerja",
  },
  {
    nama: "Surat Keterangan Kematian",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang telah meninggal dunia.",
    persyaratan: `1. Fotokopi KTP almarhum/almarhumah (1 lembar)
2. Fotokopi Kartu Keluarga (KK) almarhum/almarhumah (1 lembar)
3. Fotokopi KTP ahli waris (1 lembar)
4. Fotokopi KK ahli waris (1 lembar)
5. Surat pengantar dari RT/RW setempat
6. Surat keterangan kematian dari rumah sakit/puskesmas/polisi
7. Fotokopi akta kelahiran almarhum/almarhumah (jika ada)
8. Pas foto ukuran 4x6 almarhum/almarhumah (2 lembar)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1 hari kerja",
  },
  {
    nama: "Surat Keterangan Kelahiran",
    deskripsi: "Surat keterangan yang menyatakan bahwa seseorang telah lahir.",
    persyaratan: `1. Fotokopi KTP orang tua (1 lembar)
2. Fotokopi Kartu Keluarga (KK) orang tua (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Surat keterangan lahir dari rumah sakit/puskesmas/bidan
5. Fotokopi buku nikah orang tua (1 lembar)
6. Pas foto bayi ukuran 4x6 (2 lembar)
7. Fotokopi KTP saksi kelahiran (2 orang)
8. Fotokopi KK saksi kelahiran (2 orang)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1-2 hari kerja",
  },
  {
    nama: "Surat Keterangan Pindah Datang",
    deskripsi:
      "Surat keterangan untuk warga yang datang pindah ke wilayah setempat.",
    persyaratan: `1. Fotokopi KTP (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW asal
4. Surat keterangan pindah dari daerah asal
5. Pas foto ukuran 3x4 (2 lembar)
6. Fotokopi akta kelahiran (bagi anak-anak)
7. Fotokopi buku nikah (jika sudah menikah)
8. Surat pernyataan domisili bermaterai Rp10.000`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "2-3 hari kerja",
  },
  {
    nama: "Surat Keterangan Pindah Keluar",
    deskripsi:
      "Surat keterangan untuk warga yang akan pindah keluar dari wilayah setempat.",
    persyaratan: `1. Fotokopi KTP (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Surat permohonan pindah bermaterai Rp10.000
5. Pas foto ukuran 3x4 (2 lembar)
6. Fotokopi akta kelahiran (bagi anak-anak)
7. Fotokopi buku nikah (jika sudah menikah)
8. Dokumen alamat tujuan (surat pengantar RT/RW tujuan jika sudah ada)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "1-2 hari kerja",
  },
  {
    nama: "Surat Keterangan Kepemilikan Tanah",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang memiliki hak atas sebidang tanah.",
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Fotokopi sertifikat tanah (jika ada)
5. Fotokopi SPPT PBB tahun terakhir
6. Pas foto ukuran 4x6 (2 lembar)
7. Surat pernyataan kepemilikan tanah bermaterai Rp10.000
8. Dokumen pendukung lainnya (girik, petok, dll)`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "3-5 hari kerja",
  },
  {
    nama: "Surat Keterangan Ahli Waris",
    deskripsi:
      "Surat keterangan yang menyatakan siapa saja yang menjadi ahli waris dari almarhum/almarhumah.",
    persyaratan: `1. Fotokopi KTP ahli waris (semua ahli waris) (1 lembar)
2. Fotokopi Kartu Keluarga (KK) almarhum/almarhumah (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Fotokopi surat kematian almarhum/almarhumah
5. Fotokopi akta kelahiran ahli waris
6. Fotokopi buku nikah almarhum/almarhumah (jika ada)
7. Pas foto ukuran 4x6 ahli waris (masing-masing 1 lembar)
8. Surat pernyataan ahli waris bermaterai Rp10.000`,
    jadwalPelayanan:
      "Senin - Jumat: 08.00 - 15.00 WIB, Sabtu: 08.00 - 12.00 WIB",
    biaya: "Gratis",
    waktu: "3-5 hari kerja",
  },
];

async function seedLayanan() {
  try {
    await dbConnect();
    console.log("Database connected");

    // Hapus data layanan yang sudah ada
    await LayananAdministrasi.deleteMany({});
    console.log("Existing layanan data cleared");

    // Masukkan data layanan baru
    await LayananAdministrasi.insertMany(layananData);
    console.log("Layanan data seeded successfully");

    // Tampilkan data yang telah dimasukkan
    const insertedData = await LayananAdministrasi.find({});
    console.log("Inserted data:");
    insertedData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.nama}`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding layanan data:", error);
    mongoose.connection.close();
  }
}

seedLayanan();
