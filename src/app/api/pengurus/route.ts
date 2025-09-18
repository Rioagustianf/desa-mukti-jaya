import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Pengurus from "@/lib/models/Pengurus";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const data = await Pengurus.find();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await dbConnect();
    const body = await req.json();

    // Ensure kontak is properly structured as an array of objects
    if (body.kontak && !Array.isArray(body.kontak)) {
      return NextResponse.json(
        { success: false, message: "Kontak harus berupa array" },
        { status: 400 }
      );
    }

    // Explicitly structure the document to ensure correct typing
    const pengurusData = {
      nama: body.nama,
      jabatan: body.jabatan,
      foto: body.foto || "",
      ttdDigital: body.ttdDigital || "",
      kontak: Array.isArray(body.kontak) ? body.kontak : [],
      deskripsi: body.deskripsi || "",
    };

    const created = await Pengurus.create(pengurusData);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating pengurus:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
