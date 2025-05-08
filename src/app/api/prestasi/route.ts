import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Prestasi from "@/lib/models/Prestasi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const data = await Prestasi.find();
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

  // Map the incoming fields to match the model
  const prestasiData = {
    nama: body.title,
    tahun: body.date ? new Date(body.date).getFullYear() : null,
    penyelenggara: body.category,
    deskripsi: body.description,
    gambar: body.imageUrl,
  };

  const created = await Prestasi.create(prestasiData);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
