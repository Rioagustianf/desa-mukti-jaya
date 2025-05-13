import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Ambil query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const jenisSurat = searchParams.get("jenisSurat");
    const search = searchParams.get("search");

    // Buat filter berdasarkan query parameters
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (jenisSurat) {
      filter.jenisSurat = jenisSurat;
    }

    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: "i" } },
        { nik: { $regex: search, $options: "i" } },
        { teleponWA: { $regex: search, $options: "i" } },
      ];
    }

    // Ambil data pengajuan surat
    const pengajuan = await PengajuanSurat.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    });
  } catch (error) {
    console.error("Error fetching pengajuan surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse request body
    const body = await req.json();

    // Tambahkan status dan tanggal pengajuan
    const pengajuanData = {
      ...body,
      status: "pending",
      tanggalPengajuan: new Date(),
    };

    // Simpan ke database
    const pengajuan = await PengajuanSurat.create(pengajuanData);

    return NextResponse.json(
      {
        success: true,
        data: JSON.parse(JSON.stringify(pengajuan)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pengajuan surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create pengajuan" },
      { status: 500 }
    );
  }
}
