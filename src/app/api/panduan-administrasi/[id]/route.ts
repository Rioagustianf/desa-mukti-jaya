import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PanduanAdministrasi from "@/lib/models/PanduanAdministrasi";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const data = await PanduanAdministrasi.findById(params.id);
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`GET[${params.id}] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch panduan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await req.json();

    // Validasi data yang diterima
    const updateData: any = {};
    if (body.judul !== undefined) updateData.judul = body.judul;
    if (body.isi !== undefined) updateData.isi = body.isi;
    if (body.layananTerkait !== undefined)
      updateData.layananTerkait = body.layananTerkait;

    const updated = await PanduanAdministrasi.findByIdAndUpdate(
      params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`PUT[${params.id}] Error:`, error);

    if (error.name === "ValidationError") {
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
        message: "Failed to update panduan",
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
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();
    const deleted = await PanduanAdministrasi.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (error) {
    console.error(`DELETE[${params.id}] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete panduan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
