import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Ambil data pengajuan surat berdasarkan ID
    const { id } = (await (context as any).params) as { id: string };
    const pengajuan = await PengajuanSurat.findById(id)
      .populate("jenisSurat", "nama kode tipeForm")
      .lean();

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    });
  } catch (error) {
    console.error("Error fetching pengajuan surat:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
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

    // Update data pengajuan surat
    const { id } = (await (context as any).params) as { id: string };
    const pengajuan = await PengajuanSurat.findByIdAndUpdate(
      id,
      {
        ...body,
        tanggalUpdate: new Date(),
      },
      { new: true }
    )
      .populate("jenisSurat", "nama kode tipeForm")
      .lean();

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    });
  } catch (error) {
    console.error("Error updating pengajuan surat:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update pengajuan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: { id: string } } | { params: Promise<{ id: string }> }
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

    // Hapus data pengajuan surat
    const { id } = (await (context as any).params) as { id: string };
    const pengajuan = await PengajuanSurat.findByIdAndDelete(id).lean();

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    });
  } catch (error) {
    console.error("Error deleting pengajuan surat:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete pengajuan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
