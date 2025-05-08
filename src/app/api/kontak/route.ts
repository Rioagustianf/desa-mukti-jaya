// /api/kontak/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Kontak from "@/lib/models/Kontak";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  await dbConnect();
  const data = await Kontak.find();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    await dbConnect();

    // Get the request body
    const rawBody = await req.json();
    console.log("Raw request body:", rawBody);

    // Explicitly extract each field
    const { jenis, nilai, deskripsi } = rawBody;

    // Validate required fields
    if (!jenis || !nilai) {
      console.error("Missing required fields:", { jenis, nilai });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new document with explicit fields
    const kontakData = {
      jenis,
      nilai,
      deskripsi: deskripsi || "",
    };

    console.log("Creating Kontak with data:", kontakData);

    // Create the document with the explicit data
    const created = await Kontak.create(kontakData);

    console.log("Created document:", created);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating kontak:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating kontak",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
