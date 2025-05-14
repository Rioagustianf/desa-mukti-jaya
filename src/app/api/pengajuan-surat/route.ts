import { NextResponse } from "next/server";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import connectDB from "@/lib/db";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const jenisSurat = searchParams.get("jenisSurat");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");

    const filter: any = {};

    if (jenisSurat) {
      // Check if jenisSurat is a valid ObjectId
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(jenisSurat)) {
        filter.jenisSurat = jenisSurat;
      } else {
        // If it's not a valid ObjectId, look for jenisSurat by code instead
        const jenisSuratDoc = await JenisSurat.findOne({
          kode: jenisSurat,
        }).lean();
        if (jenisSuratDoc) {
          filter.jenisSurat = jenisSuratDoc._id;
        } else {
          // If no matching jenisSurat found, return empty result
          return NextResponse.json({
            success: true,
            data: [],
          });
        }
      }
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    let pengajuan;
    try {
      pengajuan = await PengajuanSurat.find(filter)
        .populate("jenisSurat", "nama kode tipeForm")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Error in populate:", error);
      // Fallback: fetch without populate if populate fails
      pengajuan = await PengajuanSurat.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const total = await PengajuanSurat.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: pengajuan,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    console.error("Error fetching pengajuan surat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    const pengajuanSurat = await PengajuanSurat.create(body);

    return NextResponse.json({ success: true, data: pengajuanSurat });
  } catch (error: any) {
    console.error("Error creating pengajuan surat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
