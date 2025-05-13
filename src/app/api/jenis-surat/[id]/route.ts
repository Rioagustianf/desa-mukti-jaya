import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import JenisSurat from "@/lib/models/JenisSurat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: Mendapatkan detail jenis surat berdasarkan ID
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Ambil data jenis surat berdasarkan ID
    const jenisSurat = await JenisSurat.findById(params.id).lean();

    if (!jenisSurat) {
      return NextResponse.json(
        { success: false, message: "Jenis surat tidak ditemukan" },
        { status: 404 }
      );
    }

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

// PUT: Mengupdate jenis surat berdasarkan ID (hanya admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!body.nama) {
      return NextResponse.json(
        { success: false, message: "Nama jenis surat wajib diisi" },
        { status: 400 }
      );
    }

    // Update data jenis surat
    const jenisSurat = await JenisSurat.findByIdAndUpdate(params.id, body, {
      new: true,
    }).lean();

    if (!jenisSurat) {
      return NextResponse.json(
        { success: false, message: "Jenis surat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(jenisSurat)),
    });
  } catch (error) {
    console.error("Error updating jenis surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update jenis surat" },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus jenis surat berdasarkan ID (hanya admin)
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Hapus data jenis surat
    const jenisSurat = await JenisSurat.findByIdAndDelete(params.id).lean();

    if (!jenisSurat) {
      return NextResponse.json(
        { success: false, message: "Jenis surat tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(jenisSurat)),
    });
  } catch (error) {
    console.error("Error deleting jenis surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete jenis surat" },
      { status: 500 }
    );
  }
}
