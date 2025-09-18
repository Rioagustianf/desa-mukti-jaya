import { NextResponse } from "next/server";
import User from "@/lib/models/User";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import connectDB from "@/lib/db";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const nik = searchParams.get("nik");

    if (!nik) {
      return NextResponse.json(
        { success: false, error: "NIK parameter required" },
        { status: 400 }
      );
    }

    // Find user accounts with this NIK
    const users = await User.find({ nik }).lean();
    
    // Find letter applications with this NIK
    const pengajuan = await PengajuanSurat.find({ nik })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const diagnostic = {
      nik,
      userAccounts: users.map(user => ({
        id: user._id,
        name: user.name,
        role: user.role,
        teleponWA: user.teleponWA,
        isAutoCreated: user.isAutoCreated,
        createdAt: user.createdAt
      })),
      letterApplications: pengajuan.map(p => ({
        id: p._id,
        nama: p.nama,
        teleponWA: p.teleponWA,
        kodeSurat: p.kodeSurat,
        status: p.status,
        createdAt: p.createdAt
      })),
      summary: {
        totalUserAccounts: users.length,
        residentAccounts: users.filter(u => u.role === 'resident').length,
        adminAccounts: users.filter(u => u.role === 'admin').length,
        totalLetterApplications: pengajuan.length,
      }
    };

    return NextResponse.json({
      success: true,
      data: diagnostic
    });
  } catch (error: any) {
    console.error("Error in diagnostic:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}