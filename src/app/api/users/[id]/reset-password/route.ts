import { type NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// PUT /api/users/:id/reset-password - Reset user password
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userId = params.id;
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { message: "Password baru wajib diisi" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hash and update password
    user.password = await hashPassword(password);
    await user.save();

    return NextResponse.json({ message: "Password berhasil diatur ulang" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengatur ulang password" },
      { status: 500 }
    );
  }
}
