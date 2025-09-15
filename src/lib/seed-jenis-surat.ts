import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import JenisSurat from "@/lib/models/JenisSurat";

// Data jenis surat berdasarkan permintaan client
const jenisSuratData = [
  {
    nama: "Surat Keterangan Domisili",
    kode: "SKD",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang bertempat tinggal atau berdomisili di suatu wilayah tertentu.",
    tipeForm: "domisili",
    aktif: true,
    urutan: 1,
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 3x4 (2 lembar)
5. Fotokopi akta kelahiran (jika belum memiliki KTP)
6. Surat pernyataan domisili bermaterai Rp10.000`,
    catatan: "Surat ini berlaku selama 6 bulan sejak tanggal diterbitkan.",
  },
  {
    nama: "Surat Keterangan Usaha (SKU)",
    kode: "SKU",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang memiliki usaha yang berjalan di wilayah setempat.",
    tipeForm: "umum",
    aktif: true,
    urutan: 2,
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 4x6 (2 lembar)
5. Fotokopi NPWP (jika ada)
6. Surat pernyataan tidak keberatan tetangga (minimal 2 tetangga)
7. Foto lokasi usaha
8. Dokumen legalitas usaha lainnya (jika ada)`,
    catatan:
      "Digunakan untuk pengajuan pinjaman, pembuatan NPWP, dan keperluan lainnya.",
  },
  {
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    kode: "SKTM",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang atau keluarga tidak mampu secara ekonomi.",
    tipeForm: "umum",
    aktif: true,
    urutan: 3,
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 3x4 (2 lembar)
5. Fotokopi rekening listrik/bukti pengeluaran bulanan
6. Surat pernyataan tidak mampu bermaterai Rp10.000
7. Dokumen tambahan pendukung lainnya (jika ada)`,
    catatan:
      "Digunakan untuk beasiswa, bantuan sosial, keringanan biaya pengobatan, dll.",
  },
  {
    nama: "Surat Keterangan Belum Menikah",
    kode: "SKBM",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang belum pernah menikah.",
    tipeForm: "umum",
    aktif: true,
    urutan: 4,
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Pas foto ukuran 4x6 (2 lembar)
5. Surat pernyataan belum menikah bermaterai Rp10.000
6. Fotokopi akta cerai (jika pernah menikah dan bercerai)
7. Fotokopi akta kematian pasangan (jika janda/duda)`,
    catatan: "Surat ini berlaku selama 6 bulan sejak tanggal diterbitkan.",
  },
  {
    nama: "Surat Keterangan Kematian",
    kode: "SKK",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang telah meninggal dunia.",
    tipeForm: "umum",
    aktif: true,
    urutan: 5,
    persyaratan: `1. Fotokopi KTP almarhum/almarhumah (1 lembar)
2. Fotokopi Kartu Keluarga (KK) almarhum/almarhumah (1 lembar)
3. Fotokopi KTP ahli waris (1 lembar)
4. Fotokopi KK ahli waris (1 lembar)
5. Surat pengantar dari RT/RW setempat
6. Surat keterangan kematian dari rumah sakit/puskesmas/polisi
7. Fotokopi akta kelahiran almarhum/almarhumah (jika ada)
8. Pas foto ukuran 4x6 almarhum/almarhumah (2 lembar)`,
    catatan:
      "Diperlukan untuk pengurusan warisan, pensiun, dan keperluan administratif lainnya.",
  },
  {
    nama: "Surat Keterangan Kelahiran",
    kode: "SKL",
    deskripsi: "Surat keterangan yang menyatakan bahwa seseorang telah lahir.",
    tipeForm: "umum",
    aktif: true,
    urutan: 6,
    persyaratan: `1. Fotokopi KTP orang tua (1 lembar)
2. Fotokopi Kartu Keluarga (KK) orang tua (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Surat keterangan lahir dari rumah sakit/puskesmas/bidan
5. Fotokopi buku nikah orang tua (1 lembar)
6. Pas foto bayi ukuran 4x6 (2 lembar)
7. Fotokopi KTP saksi kelahiran (2 orang)
8. Fotokopi KK saksi kelahiran (2 orang)`,
    catatan: "Harap melapor dalam waktu 60 hari setelah kelahiran.",
  },
  {
    nama: "Surat Keterangan Pindah Datang",
    kode: "SKPD",
    deskripsi:
      "Surat keterangan untuk warga yang datang pindah ke wilayah setempat.",
    tipeForm: "pindah",
    aktif: true,
    urutan: 7,
    persyaratan: `1. Fotokopi KTP (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW asal
4. Surat keterangan pindah dari daerah asal
5. Pas foto ukuran 3x4 (2 lembar)
6. Fotokopi akta kelahiran (bagi anak-anak)
7. Fotokopi buku nikah (jika sudah menikah)
8. Surat pernyataan domisili bermaterai Rp10.000`,
    catatan:
      "Diperlukan untuk pendaftaran ulang KK dan keperluan administratif lainnya.",
  },
  {
    nama: "Surat Keterangan Pindah Keluar",
    kode: "SKPK",
    deskripsi:
      "Surat keterangan untuk warga yang akan pindah keluar dari wilayah setempat.",
    tipeForm: "pindah",
    aktif: true,
    urutan: 8,
    persyaratan: `1. Fotokopi KTP (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Surat permohonan pindah bermaterai Rp10.000
5. Pas foto ukuran 3x4 (2 lembar)
6. Fotokopi akta kelahiran (bagi anak-anak)
7. Fotokopi buku nikah (jika sudah menikah)
8. Dokumen alamat tujuan (surat pengantar RT/RW tujuan jika sudah ada)`,
    catatan: "Proses penerbitan KK baru di daerah tujuan memerlukan surat ini.",
  },
  {
    nama: "Surat Keterangan Kepemilikan Tanah",
    kode: "SKKT",
    deskripsi:
      "Surat keterangan yang menyatakan bahwa seseorang memiliki hak atas sebidang tanah.",
    tipeForm: "umum",
    aktif: true,
    urutan: 9,
    persyaratan: `1. Fotokopi KTP pemohon (1 lembar)
2. Fotokopi Kartu Keluarga (KK) (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Fotokopi sertifikat tanah (jika ada)
5. Fotokopi SPPT PBB tahun terakhir
6. Pas foto ukuran 4x6 (2 lembar)
7. Surat pernyataan kepemilikan tanah bermaterai Rp10.000
8. Dokumen pendukung lainnya (girik, petok, dll)`,
    catatan:
      "Surat ini bukan pengganti sertifikat tanah tetapi sebagai keterangan sementara.",
  },
  {
    nama: "Surat Keterangan Ahli Waris",
    kode: "SKAW",
    deskripsi:
      "Surat keterangan yang menyatakan siapa saja yang menjadi ahli waris dari almarhum/almarhumah.",
    tipeForm: "umum",
    aktif: true,
    urutan: 10,
    persyaratan: `1. Fotokopi KTP ahli waris (semua ahli waris) (1 lembar)
2. Fotokopi Kartu Keluarga (KK) almarhum/almarhumah (1 lembar)
3. Surat pengantar dari RT/RW setempat
4. Fotokopi surat kematian almarhum/almarhumah
5. Fotokopi akta kelahiran ahli waris
6. Fotokopi buku nikah almarhum/almarhumah (jika ada)
7. Pas foto ukuran 4x6 ahli waris (masing-masing 1 lembar)
8. Surat pernyataan ahli waris bermaterai Rp10.000`,
    catatan:
      "Diperlukan untuk pengurusan warisan dan hak-hak ahli waris lainnya.",
  },
];

async function seedJenisSurat() {
  try {
    await dbConnect();
    console.log("Database connected");

    // Hapus data jenis surat yang sudah ada
    await JenisSurat.deleteMany({});
    console.log("Existing jenis surat data cleared");

    // Masukkan data jenis surat baru
    await JenisSurat.insertMany(jenisSuratData);
    console.log("Jenis surat data seeded successfully");

    // Tampilkan data yang telah dimasukkan
    const insertedData = await JenisSurat.find({});
    console.log("Inserted data:");
    insertedData.forEach((item, index) => {
      console.log(`${index + 1}. ${item.nama} (${item.kode})`);
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding jenis surat data:", error);
    mongoose.connection.close();
  }
}

seedJenisSurat();
