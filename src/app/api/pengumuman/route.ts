import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Pengumuman from "@/lib/models/Pengumuman";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const data = await Pengumuman.find().sort({ tanggal: -1 });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  await dbConnect();
  const body = await req.json();
  const created = await Pengumuman.create(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
