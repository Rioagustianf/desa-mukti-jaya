"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";

// Perbaiki fungsi createPengajuanSurat untuk mengkonversi objek Mongoose menjadi plain object
export async function createPengajuanSurat(data: any) {
  try {
    await dbConnect();

    // Tambahkan status dan tanggal pengajuan
    const pengajuanData = {
      ...data,
      status: "pending",
      tanggalPengajuan: new Date(),
    };

    // Simpan ke database
    const pengajuan = await PengajuanSurat.create(pengajuanData);

    // Simpan ID pengajuan di cookie untuk tracking
    const cookieStore = cookies();
    const existingPengajuan = cookieStore.get("pengajuan_ids")?.value;
    const pengajuanIds = existingPengajuan ? JSON.parse(existingPengajuan) : [];

    if (!pengajuanIds.includes(pengajuan._id.toString())) {
      pengajuanIds.push(pengajuan._id.toString());
    }

    cookieStore.set("pengajuan_ids", JSON.stringify(pengajuanIds), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

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

// Perbaiki fungsi getUserPengajuan untuk mengkonversi objek Mongoose menjadi plain object
export async function getUserPengajuan() {
  try {
    await dbConnect();

    // Ambil ID pengajuan dari cookie
    const cookieStore = cookies();
    const pengajuanIds = cookieStore.get("pengajuan_ids")?.value;

    if (!pengajuanIds) {
      return {
        success: true,
        data: [],
      };
    }

    const ids = JSON.parse(pengajuanIds);

    if (!ids.length) {
      return {
        success: true,
        data: [],
      };
    }

    // Ambil data pengajuan berdasarkan ID
    const pengajuan = await PengajuanSurat.find({
      _id: { $in: ids },
    })
      .sort({ createdAt: -1 })
      .lean(); // Gunakan .lean() untuk mendapatkan plain JavaScript objects

    return {
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)), // Pastikan data benar-benar menjadi plain object
    };
  } catch (error) {
    console.error("Error fetching user pengajuan:", error);
    return {
      success: false,
      message: "Gagal mengambil data pengajuan",
    };
  }
}

// Perbaiki fungsi updateStatusPengajuan untuk mengkonversi objek Mongoose menjadi plain object
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
    ).lean(); // Gunakan .lean() untuk mendapatkan plain JavaScript objects

    if (!pengajuan) {
      return {
        success: false,
        message: "Pengajuan tidak ditemukan",
      };
    }

    // Revalidasi path untuk memperbarui data
    revalidatePath("/admin/pengajuan-surat");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)), // Pastikan data benar-benar menjadi plain object
    };
  } catch (error) {
    console.error("Error updating pengajuan status:", error);
    return {
      success: false,
      message: "Gagal memperbarui status pengajuan",
    };
  }
}
