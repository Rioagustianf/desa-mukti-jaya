import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import dbConnect from "@/lib/db";

interface PengajuanData {
  _id: string;
  nik: string;
  nama: string;
  letterGenerated?: boolean;
  letterUrl?: string;
  jenisSurat: {
    nama: string;
    kode: string;
  };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the pengajuan data
    const pengajuan = (await PengajuanSurat.findById(id)
      .populate("jenisSurat", "nama kode")
      .lean()) as any;

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("Pengajuan data for download:", {
      _id: pengajuan._id,
      nik: pengajuan.nik,
      letterGenerated: pengajuan.letterGenerated,
      letterUrl: pengajuan.letterUrl,
      userNik: session.user.nik,
      userRole: session.user.role,
    });

    // Check if the user owns this pengajuan (for non-admin users)
    if (session.user.role !== "admin" && pengajuan.nik !== session.user.nik) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak" },
        { status: 403 }
      );
    }

    // Check if letter has been generated
    if (!pengajuan.letterGenerated || !pengajuan.letterUrl) {
      console.log("Letter not generated or URL missing:", {
        letterGenerated: pengajuan.letterGenerated,
        letterUrl: pengajuan.letterUrl,
      });
      return NextResponse.json(
        { success: false, message: "Surat belum dibuat" },
        { status: 404 }
      );
    }

    // Fetch PDF from Supabase URL
    console.log("Fetching PDF from URL:", pengajuan.letterUrl);

    const pdfResponse = await fetch(pengajuan.letterUrl);

    if (!pdfResponse.ok) {
      console.log("Failed to fetch PDF from Supabase:", pdfResponse.status);
      return NextResponse.json(
        { success: false, message: "File surat tidak dapat diakses" },
        { status: 404 }
      );
    }

    // Get PDF buffer
    const fileBuffer = await pdfResponse.arrayBuffer();
    const filename = `${pengajuan.jenisSurat.nama}_${pengajuan.nama}.pdf`;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading letter:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengunduh surat",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
