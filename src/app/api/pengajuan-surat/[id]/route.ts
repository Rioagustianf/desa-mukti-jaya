import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Ambil data pengajuan surat berdasarkan ID
    const pengajuan = await PengajuanSurat.findById(params.id).lean();

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
      { success: false, message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

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

    // Update data pengajuan surat
    const pengajuan = await PengajuanSurat.findByIdAndUpdate(
      params.id,
      {
        ...body,
        tanggalUpdate: new Date(),
      },
      { new: true }
    ).lean();

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
      { success: false, message: "Failed to update pengajuan" },
      { status: 500 }
    );
  }
}

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

    // Hapus data pengajuan surat
    const pengajuan = await PengajuanSurat.findByIdAndDelete(params.id).lean();

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
      { success: false, message: "Failed to delete pengajuan" },
      { status: 500 }
    );
  }
}
