import { NextRequest, NextResponse } from "next/server";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

export async function DELETE(request: NextRequest) {
  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { success: false, message: "Filename diperlukan" },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { success: false, message: "Gagal delete file: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Delete gagal",
      },
      { status: 500 }
    );
  }
}
