"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";

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

    // Revalidasi path untuk memperbarui data
    revalidatePath("/layanan-administrasi/ajukan");
    revalidatePath("/admin/pengajuan-surat");

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

    console.log("Mencari pengajuan dengan filter:", filter);

    // Ambil data pengajuan terbaru (maksimal 20)
    const pengajuan = await PengajuanSurat.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    console.log("Hasil query pengajuan:", pengajuan.length);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    };
  } catch (error) {
    console.error("Error fetching user pengajuan:", error);
    return {
      success: false,
      message: "Gagal mengambil data pengajuan",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

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
