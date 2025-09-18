import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import PengajuanSurat from "@/lib/models/PengajuanSurat";
import JenisSurat from "@/lib/models/JenisSurat";
import path from "path";
import fs from "fs";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import Pengurus from "@/lib/models/Pengurus";
import { fileToDataURI, urlToDataURI } from "@/lib/pdfmeGenerator";
import { uploadPDF } from "@/lib/storage";
import dbConnect from "@/lib/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
// HTML template loading helper
function getHtmlTemplatePath(kodeSurat: string): string {
  const preferred = path.join(
    process.cwd(),
    "templates",
    "html",
    `${kodeSurat.toUpperCase()}.html`
  );
  if (fs.existsSync(preferred)) return preferred;
  // Fallback ke template generik jika belum ada template khusus
  return path.join(process.cwd(), "templates", "html", "SKD.html");
}

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
    const logoDataURI = fileToDataURI(logoPath, "image/png");

    // Tanda tangan digital jika ada
    let ttdDataURI = "";
    if (penandatangan?.ttdDigital) {
      try {
        ttdDataURI = await urlToDataURI(penandatangan.ttdDigital);
      } catch (_) {
        ttdDataURI = "";
      }
    }

    // Render HTML to PDF using Puppeteer
    const templatePath = getHtmlTemplatePath(pengajuan.jenisSurat.kode);
    const formattedDate = new Date(
      pengajuan.tanggalPengajuan
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const html = await (
      await import("fs/promises")
    ).readFile(templatePath, "utf-8");
    const populated = html
      .replace(/{{logo}}/g, logoDataURI)
      .replace(/{{kabupaten}}/g, "PEMERINTAH KABUPATEN BANYUASIN")
      .replace(/{{kecamatan}}/g, "KECAMATAN MUARA TELANG")
      .replace(/{{desa}}/g, "KEPALA DESA MUKTI JAYA")
      .replace(
        /{{alamatDesa}}/g,
        "Desa Mukti Jaya Jalur 10, Kecamatan Muara Telang, Kabupaten Banyuasin"
      )
      .replace(/{{nama}}/g, pengajuan.nama || "-")
      .replace(/{{nik}}/g, pengajuan.nik || "-")
      .replace(/{{teleponWA}}/g, pengajuan.teleponWA || "-")
      .replace(/{{alamat}}/g, pengajuan.alamat || "-")
      .replace(/{{tanggalPengajuan}}/g, formattedDate)
      .replace(/{{jenisSurat}}/g, pengajuan.jenisSurat?.nama || "-")
      .replace(/{{judulSurat}}/g, pengajuan.jenisSurat?.nama || "-")
      .replace(/{{kodeSurat}}/g, pengajuan.jenisSurat?.kode || "-")
      .replace(/{{keperluan}}/g, pengajuan.keperluan || "-")
      .replace(
        /{{nomorSurat}}/g,
        (pengajuan as any).nomorSurat || "{{AUTO_NOMOR}}"
      )
      .replace(
        /{{jabatanPenandatangan}}/g,
        penandatangan?.jabatan || "KEPALA DESA"
      )
      .replace(/{{namaPenandatangan}}/g, penandatangan?.nama || "")
      .replace(/{{ttdImage}}/g, ttdDataURI || "");

    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath());
    const browser = await puppeteer.launch({
      headless: chromium.headless,
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
      executablePath,
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    // Auto-generate nomor surat jika belum ada
    const tahun = new Date().getFullYear();
    const autoNomor = `${String(Date.now()).slice(-4)}/${
      pengajuan.jenisSurat.kode
    }/DS/${tahun}`;
    const finalHtml = populated.replace(/{{AUTO_NOMOR}}/g, autoNomor);

    await page.setContent(finalHtml, { waitUntil: "networkidle0" });
    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });
    await browser.close();
    const pdfBuffer = Buffer.from(pdfUint8);

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
      nomorSurat: (pengajuan as any).nomorSurat || autoNomor,
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
