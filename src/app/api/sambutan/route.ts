// src/app/api/sambutan/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Sambutan from "@/lib/models/Sambutan";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // custom NextAuth config

// GET: List semua sambutan (umumnya hanya satu, tapi tetap pakai array)
export async function GET() {
  try {
    await dbConnect(); // pastikan koneksi selesai
    const data = await Sambutan.find();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching sambutan:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: Tambah sambutan (admin only)
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
    const created = await Sambutan.create(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating sambutan:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
