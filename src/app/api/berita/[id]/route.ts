import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Berita from "@/lib/models/Berita";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: Detail berita
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const data = await Berita.findById(params.id);
  if (!data)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data });
}

// PUT: Update berita (admin only)
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
  const updated = await Berita.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  if (!updated)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: updated });
}

// DELETE: Hapus berita (admin only)
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
  const deleted = await Berita.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: deleted });
}
