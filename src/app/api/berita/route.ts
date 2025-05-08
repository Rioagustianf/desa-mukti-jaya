import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Berita from "@/lib/models/Berita";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: List semua berita
export async function GET() {
  await dbConnect();
  const data = await Berita.find().sort({ tanggal: -1 });
  return NextResponse.json({ success: true, data });
}

// POST: Tambah berita (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  await dbConnect();
  const body = await req.json();
  const created = await Berita.create(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
