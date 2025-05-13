import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import JenisSurat from "@/lib/models/JenisSurat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: Mendapatkan semua jenis surat
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Ambil query parameters
    const searchParams = req.nextUrl.searchParams;
    const aktif = searchParams.get("aktif");
    const tipeForm = searchParams.get("tipeForm");

    // Buat filter berdasarkan query parameters
    const filter: any = {};

    if (aktif === "true") {
      filter.aktif = true;
    } else if (aktif === "false") {
      filter.aktif = false;
    }

    if (tipeForm) {
      filter.tipeForm = tipeForm;
    }

    // Ambil data jenis surat
    const jenisSurat = await JenisSurat.find(filter)
      .sort({ urutan: 1, nama: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(jenisSurat)),
    });
  } catch (error) {
    console.error("Error fetching jenis surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// POST: Membuat jenis surat baru (hanya admin)
export async function POST(req: NextRequest) {
  try {
    // Pastikan user sudah login dan memiliki akses admin
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Parse request body
    const body = await req.json();

    // Validasi data
    if (!body.nama || !body.kode) {
      return NextResponse.json(
        { success: false, message: "Nama dan kode jenis surat wajib diisi" },
        { status: 400 }
      );
    }

    // Cek apakah kode sudah digunakan
    const existingJenisSurat = await JenisSurat.findOne({
      kode: body.kode,
    }).lean();
    if (existingJenisSurat) {
      return NextResponse.json(
        { success: false, message: "Kode jenis surat sudah digunakan" },
        { status: 400 }
      );
    }

    // Simpan ke database
    const jenisSurat = await JenisSurat.create(body);

    return NextResponse.json(
      {
        success: true,
        data: JSON.parse(JSON.stringify(jenisSurat)),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating jenis surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create jenis surat" },
      { status: 500 }
    );
  }
}
