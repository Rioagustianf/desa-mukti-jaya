import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import path from "path";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
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

    console.log("Penandatangan found:", penandatangan);

    // Siapkan asset logo dari public/logo.png -> data URI
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    let logoDataURI = "";
    try {
      logoDataURI = fileToDataURI(logoPath, "image/png");
    } catch (error) {
      console.error("Error converting logo to data URI:", error);
      logoDataURI = ""; // biarkan kosong, komponen akan handle
    }

    // Tanda tangan digital jika ada
    let ttdDataURI = "";
    if (penandatangan?.ttdDigital) {
      try {
        console.log(
          "Converting TTD URL to data URI:",
          penandatangan.ttdDigital
        );
        ttdDataURI = await urlToDataURI(penandatangan.ttdDigital);
        console.log(
          "Successfully converted TTD to data URI, length:",
          ttdDataURI.length
        );
      } catch (error) {
        console.error("Error converting TTD to data URI:", error);
        // Even if signature conversion fails, we'll still generate the letter
        ttdDataURI = "";
      }
    } else {
      console.log("No digital signature found for penandatangan");
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

    // Build complete props object with all specific fields
    const letterProps = {
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

      // === LETTER-SPECIFIC FIELDS ===

      // SKD - Surat Keterangan Domisili
      tempatLahir: pengajuan.tempatLahir || "",
      tanggalLahir: pengajuan.tanggalLahir || "",
      alamatAsal: pengajuan.alamatAsal || "",

      // SKU - Surat Keterangan Usaha
      namaUsaha: pengajuan.namaUsaha || "",
      jenisUsaha: pengajuan.jenisUsaha || "",
      alamatUsaha: pengajuan.alamatUsaha || "",

      // SKK - Surat Keterangan Kematian
      namaAlmarhum: pengajuan.namaAlmarhum || "",
      nikAlmarhum: pengajuan.nikAlmarhum || "",
      tempatLahirAlmarhum: pengajuan.tempatLahirAlmarhum || "",
      tanggalLahirAlmarhum: pengajuan.tanggalLahirAlmarhum || "",
      tanggalMeninggal: pengajuan.tanggalMeninggal || "",
      alamatTerakhir: pengajuan.alamatTerakhir || "",
      namaPelapor: pengajuan.namaPelapor || "",
      hubunganPelapor: pengajuan.hubunganPelapor || "",

      // SKL - Surat Keterangan Kelahiran
      namaBayi: pengajuan.namaBayi || "",
      tempatLahirBayi: pengajuan.tempatLahirBayi || "",
      tanggalLahirBayi: pengajuan.tanggalLahirBayi || "",
      jenisKelaminBayi: pengajuan.jenisKelaminBayi || "",
      namaAyah: pengajuan.namaAyah || "",
      namaIbu: pengajuan.namaIbu || "",
      alamatOrangTua: pengajuan.alamatOrangTua || "",

      // SKPD - Surat Keterangan Pindah Domisili
      alamatTujuan: pengajuan.alamatTujuan || "",
      asalDaerah: pengajuan.asalDaerah || "",
      alasanPindah: pengajuan.alasanPindah || "",

      // SKKT - Surat Keterangan Kepemilikan Tanah
      alamatTanah: pengajuan.alamatTanah || "",
      luasTanah: pengajuan.luasTanah || "",
      statusKepemilikan: pengajuan.statusKepemilikan || "",

      // SKAW - Surat Keterangan Ahli Waris
      namaPewaris: pengajuan.namaPewaris || "",
      namaAhliWaris: pengajuan.namaAhliWaris || "",
      hubunganAhliWaris: pengajuan.hubunganAhliWaris || "",
    };

    const doc = React.createElement(LetterComp as any, letterProps);
    const pdfBuffer: Buffer = await renderToBuffer(doc as any);
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
