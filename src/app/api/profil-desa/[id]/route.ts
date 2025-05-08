import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProfilDesa from "@/lib/models/ProfilDesa";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const data = await ProfilDesa.findById(params.id);
  if (!data)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  await dbConnect();

  const body = await req.json();

  // Ensure required fields
  if (body.nama !== undefined && !body.nama) {
    return NextResponse.json(
      { success: false, message: "Nama desa wajib diisi" },
      { status: 400 }
    );
  }

  // Convert misi to string if it's an array
  if (Array.isArray(body.misi)) {
    body.misi = body.misi.join("\n");
  }

  // Convert jumlah_penduduk to number if possible
  if (body.jumlah_penduduk && !isNaN(body.jumlah_penduduk)) {
    body.jumlah_penduduk = Number(body.jumlah_penduduk);
  }

  const updated = await ProfilDesa.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  if (!updated)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  await dbConnect();
  const deleted = await ProfilDesa.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: deleted });
}
