import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import { generateSuratPDF } from "@/lib/pdfGenerator";
import { uploadPDF } from "@/lib/storage";
import dbConnect from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "admin") {
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

    // Generate the PDF
    const pdfDataUri = generateSuratPDF(pengajuan);

    // Convert data URI to buffer
    const base64Data = pdfDataUri.split(",")[1];
    const pdfBuffer = Buffer.from(base64Data, "base64");

    // Generate filename
    const filename = `surat_${pengajuan.jenisSurat.kode}_${
      pengajuan.nik
    }_${Date.now()}.pdf`;

    // Upload PDF to Supabase
    const uploadResult = await uploadPDF(pdfBuffer, filename, "letters");

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: uploadResult.error || "Gagal mengupload surat",
        },
        { status: 500 }
      );
    }

    // Update pengajuan with letter information
    await PengajuanSurat.findByIdAndUpdate(id, {
      letterGenerated: true,
      letterUrl: uploadResult.url,
      letterGeneratedAt: new Date(),
      letterGeneratedBy: session.user.email || session.user.name,
      status: "approved", // Automatically approve when letter is generated
    });

    return NextResponse.json({
      success: true,
      message: "Surat berhasil dibuat",
      data: {
        letterUrl: uploadResult.url,
        filename: uploadResult.filename,
      },
    });
  } catch (error) {
    console.error("Error generating letter:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat surat", error: String(error) },
      { status: 500 }
    );
  }
}
