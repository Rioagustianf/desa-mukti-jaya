"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";

// Fungsi untuk mendapatkan semua jenis surat yang aktif
export async function getJenisSurat() {
  try {
    await dbConnect();

    // Ambil semua jenis surat yang aktif
    const jenisSurat = await JenisSurat.find({ aktif: true })
      .sort({ urutan: 1, nama: 1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(jenisSurat)),
    };
  } catch (error) {
    console.error("Error fetching jenis surat:", error);
    return {
      success: false,
      message: "Gagal mengambil data jenis surat",
    };
  }
}

// Fungsi untuk mendapatkan detail jenis surat berdasarkan ID
export async function getDetailJenisSurat(id: string) {
  try {
    await dbConnect();

    // Ambil detail jenis surat berdasarkan ID
    const jenisSurat = await JenisSurat.findById(id).lean();

    if (!jenisSurat) {
      return {
        success: false,
        message: "Jenis surat tidak ditemukan",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(jenisSurat)),
    };
  } catch (error) {
    console.error("Error fetching jenis surat detail:", error);
    return {
      success: false,
      message: "Gagal mengambil detail jenis surat",
    };
  }
}

// Fungsi untuk membuat pengajuan surat
export async function createPengajuanSurat(data: any) {
  try {
    await dbConnect();

    // Ambil detail jenis surat
    const jenisSurat = await JenisSurat.findById(data.jenisSuratId).lean();
    if (!jenisSurat) {
      return {
        success: false,
        message: "Jenis surat tidak ditemukan",
      };
    }

    // Tambahkan status dan tanggal pengajuan
    const pengajuanData = {
      ...data,
      jenisSurat: data.jenisSuratId,
      kodeSurat: jenisSurat.kode,
      status: "pending",
      tanggalPengajuan: new Date(),
    };

    // Jika data memiliki dokumen array dan juga field terpisah, hapus duplikasi
    if (pengajuanData.dokumen && Array.isArray(pengajuanData.dokumen)) {
      // Jika ada field terpisah, hapus dari array dokumen untuk menghindari duplikasi
      if (pengajuanData.fotoKTP) {
        pengajuanData.dokumen = pengajuanData.dokumen.filter(
          (url: string) => url !== pengajuanData.fotoKTP
        );
      }
      if (pengajuanData.fotoKK) {
        pengajuanData.dokumen = pengajuanData.dokumen.filter(
          (url: string) => url !== pengajuanData.fotoKK
        );
      }
      if (pengajuanData.fotoSuratKeterangan) {
        pengajuanData.dokumen = pengajuanData.dokumen.filter(
          (url: string) => url !== pengajuanData.fotoSuratKeterangan
        );
      }
    }

    // Simpan ke database
    const pengajuan = await PengajuanSurat.create(pengajuanData);

    // Revalidasi path untuk memperbarui data
    revalidatePath("/layanan-administrasi/ajukan");
    revalidatePath("/admin/pengajuan-surat");

    // Konversi objek Mongoose menjadi plain object sebelum mengembalikannya
    return {
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    };
  } catch (error) {
    console.error("Error creating pengajuan surat:", error);
    return {
      success: false,
      message: "Gagal membuat pengajuan surat",
    };
  }
}

// Perbaiki fungsi getUserPengajuan untuk menangani error dengan lebih baik
export async function getUserPengajuan(identifiers?: {
  nik?: string;
  teleponWA?: string;
}) {
  try {
    await dbConnect();

    // Buat filter berdasarkan NIK atau telepon WA jika ada
    let filter = {};

    if (identifiers) {
      const conditions = [];

      if (identifiers.nik) {
        conditions.push({ nik: identifiers.nik });
      }

      if (identifiers.teleponWA) {
        conditions.push({ teleponWA: identifiers.teleponWA });
      }

      if (conditions.length > 0) {
        filter = { $or: conditions };
      }
    }

    console.log("Mencari pengajuan dengan filter:", JSON.stringify(filter));

    try {
      // Ambil data pengajuan terbaru (maksimal 20)
      const pengajuan = await PengajuanSurat.find(filter)
        .populate("jenisSurat", "nama kode tipeForm")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      console.log("Hasil query pengajuan:", pengajuan ? pengajuan.length : 0);

      // Pastikan pengajuan adalah array sebelum mengembalikan data
      return {
        success: true,
        data: JSON.parse(JSON.stringify(pengajuan || [])),
      };
    } catch (populateError) {
      console.error("Error saat populate jenisSurat:", populateError);

      // Fallback: coba ambil data tanpa populate jika populate gagal
      const pengajuan = await PengajuanSurat.find(filter)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return {
        success: true,
        data: JSON.parse(JSON.stringify(pengajuan || [])),
      };
    }
  } catch (error) {
    console.error("Error fetching user pengajuan:", error);
    return {
      success: false,
      message: "Gagal mengambil data pengajuan",
      error: error instanceof Error ? error.message : String(error),
      data: [], // Tambahkan data kosong untuk mencegah error saat mengakses data
    };
  }
}

// Fungsi untuk mengupdate status pengajuan surat
export async function updateStatusPengajuan(
  id: string,
  status: string,
  catatan?: string
) {
  try {
    await dbConnect();

    // Update status pengajuan
    const pengajuan = await PengajuanSurat.findByIdAndUpdate(
      id,
      {
        status,
        catatan,
        tanggalUpdate: new Date(),
      },
      { new: true }
    ).lean();

    if (!pengajuan) {
      return {
        success: false,
        message: "Pengajuan tidak ditemukan",
      };
    }

    // Revalidasi path untuk memperbarui data
    revalidatePath("/admin/pengajuan-surat");
    revalidatePath("/layanan-administrasi/ajukan");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    };
  } catch (error) {
    console.error("Error updating pengajuan status:", error);
    return {
      success: false,
      message: "Gagal memperbarui status pengajuan",
    };
  }
}
