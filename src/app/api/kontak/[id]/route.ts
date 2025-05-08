// /api/kontak/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Kontak from "@/lib/models/Kontak";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const data = await Kontak.findById(params.id);
  if (!data)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    await dbConnect();

    // Get request body
    const rawBody = await req.json();
    console.log("Raw update body:", rawBody);

    // Explicitly extract fields
    const { jenis, nilai, deskripsi } = rawBody;

    // Validate required fields
    if (!jenis || !nilai) {
      console.error("Missing required fields for update:", { jenis, nilai });
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create update data with explicit fields
    const updateData = {
      jenis,
      nilai,
      deskripsi: deskripsi || "",
    };

    console.log("Updating kontak with data:", updateData);

    const updated = await Kontak.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );

    console.log("Updated document:", updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating kontak:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error updating kontak",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    await dbConnect();
    const deleted = await Kontak.findByIdAndDelete(params.id);

    if (!deleted)
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error("Error deleting kontak:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting kontak" },
      { status: 500 }
    );
  }
}
