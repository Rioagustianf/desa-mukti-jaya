import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat"; // Import to register the schema
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("Pengajuan API - Session data:", session);
    console.log("Pengajuan API - User NIK:", session?.user?.nik);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Debug: Log session data
    console.log("Session in pengajuan API:", JSON.stringify(session, null, 2));
    console.log("User NIK:", session.user.nik);
    console.log("User role:", session.user.role);

    await dbConnect();

    // Ensure JenisSurat model is registered before populate
    const JenisSuratModel = JenisSurat;

    // Get user's pengajuan by NIK with fallback for populate
    let pengajuan;
    try {
      pengajuan = await PengajuanSurat.find({
        nik: session.user.nik,
      })
        .populate("jenisSurat", "nama kode")
        .sort({ createdAt: -1 })
        .lean();
    } catch (populateError) {
      console.error(
        "Error in populate, falling back to non-populated query:",
        populateError
      );
      // Fallback: fetch without populate if populate fails
      pengajuan = await PengajuanSurat.find({
        nik: session.user.nik,
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    console.log("Found pengajuan:", pengajuan.length, "items");

    console.log("Found pengajuan:", pengajuan.length, "items");

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(pengajuan)),
    });
  } catch (error) {
    console.error("Error fetching user pengajuan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: String(error) },
      { status: 500 }
    );
  }
}
