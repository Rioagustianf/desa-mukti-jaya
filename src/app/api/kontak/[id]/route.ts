// /api/kontak/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Kontak from "@/lib/models/Kontak";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const kontak = await Kontak.findById(params.id);

    if (!kontak) {
      return NextResponse.json(
        { success: false, message: "Kontak tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: kontak });
  } catch (error) {
    console.error("Error fetching kontak:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data kontak" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const rawBody = await request.text();
    let body;

    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format" },
        { status: 400 }
      );
    }

    const { jenis, nilai, deskripsi } = body;

    if (!jenis || !nilai) {
      return NextResponse.json(
        { success: false, message: "Jenis dan nilai wajib diisi" },
        { status: 400 }
      );
    }

    const updateData = {
      jenis: jenis.trim(),
      nilai: nilai.trim(),
      deskripsi: deskripsi ? deskripsi.trim() : "",
    };

    const updated = await Kontak.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Kontak tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating kontak:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui kontak" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const deleted = await Kontak.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Kontak tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kontak berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting kontak:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus kontak" },
      { status: 500 }
    );
  }
}
