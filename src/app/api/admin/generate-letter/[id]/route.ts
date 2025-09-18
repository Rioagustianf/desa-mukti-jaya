import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import path from "path";
import React from "react";
import { pdf } from "@react-pdf/renderer";
import { getLetterComponentByCode } from "@/lib/pdfTemplates/letters";
import Pengurus from "@/lib/models/Pengurus";
import { fileToDataURI, urlToDataURI } from "@/lib/pdfmeGenerator";
import { uploadPDF } from "@/lib/storage";
import dbConnect from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    // Ensure JenisSurat schema is registered (avoid serverless tree-shaking)
    const JenisSuratModel = JenisSurat;

    const pengajuan = (await PengajuanSurat.findById(id)
      .populate("jenisSurat", "nama kode")
      .lean()) as any;

    if (!pengajuan) {
      return NextResponse.json(
        { success: false, message: "Pengajuan tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil penandatangan: Kepala Desa
    const penandatangan: any = await Pengurus.findOne({
      jabatan: /kepala desa/i,
    }).lean();

    // Siapkan asset logo dari public/logo.png -> data URI
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    let logoDataURI = "";
    try {
      logoDataURI = fileToDataURI(logoPath, "image/png");
    } catch (_) {
      logoDataURI = ""; // biarkan kosong, komponen akan handle
    }

    // Tanda tangan digital jika ada
    let ttdDataURI = "";
    if (penandatangan?.ttdDigital) {
      try {
        ttdDataURI = await urlToDataURI(penandatangan.ttdDigital);
      } catch (_) {
        ttdDataURI = "";
      }
    }

    // Format tanggal untuk tampilan
    const formattedDate = new Date(
      pengajuan.tanggalPengajuan
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    // Nomor surat otomatis jika belum ada
    const tahun = new Date().getFullYear();
    const autoNomor = `${String(Date.now()).slice(-4)}/${
      pengajuan.jenisSurat.kode
    }/DS/${tahun}`;
    const nomorSuratFinal = (pengajuan as any).nomorSurat || autoNomor;

    // Render PDF dengan React PDF
    const kode = (pengajuan.jenisSurat?.kode || "SKD").toString().toUpperCase();
    const judul = pengajuan.jenisSurat?.nama || "Surat Keterangan";
    const LetterComp = (
      await import("@/lib/pdfTemplates/letters")
    ).getLetterComponentByCode(kode);
    const doc = React.createElement(LetterComp as any, {
      logoDataUri: logoDataURI,
      kabupaten: "PEMERINTAH KABUPATEN BANYUASIN",
      kecamatan: "KECAMATAN MUARA TELANG",
      desa: "KEPALA DESA MUKTI JAYA",
      alamatDesa:
        "Desa Mukti Jaya Jalur 10, Kecamatan Muara Telang, Kabupaten Banyuasin",
      judulSurat: judul,
      nomorSurat: nomorSuratFinal,
      nama: (pengajuan.nama || "").toString(),
      nik: (pengajuan.nik || "").toString(),
      alamat: (pengajuan.alamat || "").toString(),
      keperluan: pengajuan.keperluan || "-",
      tanggal: formattedDate,
      jabatanPenandatangan: penandatangan?.jabatan || "KEPALA DESA",
      namaPenandatangan: penandatangan?.nama || "",
      ttdDataUri: ttdDataURI || undefined,
    });
    let pdfBuffer: Buffer;
    try {
      const uint8 = await (pdf(
        doc as any
      ).toBuffer() as unknown as Promise<Uint8Array>);
      pdfBuffer = Buffer.from(uint8);
    } catch (err) {
      // Fallback ke jsPDF jika React PDF gagal render
      const dataUri = (await import("@/lib/pdfGenerator")).generateSuratPDF({
        ...pengajuan,
        nomorSurat: nomorSuratFinal,
        logoDataUri: logoDataURI,
        kabupaten: "PEMERINTAH KABUPATEN BANYUASIN",
        kecamatan: "KECAMATAN MUARA TELANG",
        desa: "KEPALA DESA MUKTI JAYA",
        alamatDesa:
          "Desa Mukti Jaya Jalur 10, Kecamatan Muara Telang, Kabupaten Banyuasin",
        tanggalCetak: formattedDate,
        jabatanPenandatangan: penandatangan?.jabatan || "KEPALA DESA",
        namaPenandatangan: penandatangan?.nama || "",
        ttdDataUri: ttdDataURI || undefined,
      } as any);
      pdfBuffer = Buffer.from((dataUri as string).split(",")[1], "base64");
    }
    (pengajuan as any).__autoNomor = autoNomor;

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
      nomorSurat:
        (pengajuan as any).nomorSurat || (pengajuan as any).__autoNomor,
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
