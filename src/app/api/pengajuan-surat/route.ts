import { NextResponse } from "next/server";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import User from "@/lib/models/User";
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
        });
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

    // Create the letter application
    const pengajuanSurat = await PengajuanSurat.create(body);

    // Automatically create or update user account for the applicant
    if (body.nik && body.teleponWA && body.nama) {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({
          nik: body.nik,
          role: "resident",
        });

        if (!existingUser) {
          // Create new user account
          const userData = {
            nik: body.nik,
            teleponWA: body.teleponWA,
            name: body.nama,
            role: "resident" as const,
            isAutoCreated: true,
            hasSetPassword: false,
            isVerified: false,
          };

          await User.create(userData);
          console.log(
            `✅ User account created automatically for NIK: ${body.nik}`
          );
        } else {
          // Update existing user's phone number and name if needed
          let needsUpdate = false;
          if (existingUser.teleponWA !== body.teleponWA) {
            existingUser.teleponWA = body.teleponWA;
            needsUpdate = true;
          }
          if (existingUser.name !== body.nama) {
            existingUser.name = body.nama;
            needsUpdate = true;
          }

          if (needsUpdate) {
            await existingUser.save();
            console.log(`✅ User account updated for NIK: ${body.nik}`);
          }
        }
      } catch (userError: any) {
        // Log the error but don't fail the letter submission
        console.error("Error creating/updating user account:", userError);

        // If it's a duplicate key error, the user might already exist
        if (userError?.code === 11000) {
          console.log(
            "User account already exists, continuing with letter submission"
          );
        }
      }
    }

    return NextResponse.json({ success: true, data: pengajuanSurat });
  } catch (error: any) {
    console.error("Error creating pengajuan surat:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
