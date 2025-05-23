import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PanduanAdministrasi from "@/lib/models/PanduanAdministrasi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  try {
    console.log("GET: Connecting to database");
    await dbConnect();
    console.log("GET: Database connected, fetching data");
    const data = await PanduanAdministrasi.find();
    console.log(`GET: Found ${data.length} panduan items`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST: Checking session");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("POST: No session found - Unauthorized");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("POST: Connecting to database");
    await dbConnect();

    console.log("POST: Parsing request body");
    const body = await req.json();
    console.log("POST: Request body:", body);

    // Validasi sesuai model
    if (!body.judul) {
      return NextResponse.json(
        { success: false, message: "Judul is required" },
        { status: 400 }
      );
    }
    if (!body.isi) {
      return NextResponse.json(
        { success: false, message: "Isi is required" },
        { status: 400 }
      );
    }

    // Buat objek data yang sesuai dengan model
    const panduanData = {
      judul: body.judul,
      isi: body.isi,
      layananTerkait: body.layananTerkait || "",
    };

    console.log("POST: Creating panduan");
    const created = await PanduanAdministrasi.create(panduanData);
    console.log("POST: Panduan created:", created);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST Error:", error);
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: Object.keys(error.errors).reduce((acc: any, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create panduan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
