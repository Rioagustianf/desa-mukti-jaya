import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: "Password baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ nik: session.user.nik, role: "user" });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // If user has existing password, verify current password
    if (user.password && !user.isAutoCreated) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Password saat ini wajib diisi" },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Password saat ini salah" },
          { status: 400 }
        );
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      isAutoCreated: false, // Mark as no longer auto-created
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memperbarui password",
      },
      { status: 500 }
    );
  }
}
