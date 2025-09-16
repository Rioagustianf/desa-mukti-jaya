import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    return NextResponse.json({
      success: true,
      data: {
        id: session.user.id,
        name: session.user.name,
        nik: session.user.nik,
        teleponWA: session.user.teleponWA,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

import User from "@/lib/models/User";
import { hashPassword, comparePassword } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "resident") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: "Password baru wajib diisi" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // If user already has password, verify current password
    if (user.hasSetPassword && user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Password saat ini wajib diisi" },
          { status: 400 }
        );
      }

      const isCurrentPasswordValid = await comparePassword(
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
    const hashedNewPassword = await hashPassword(newPassword);

    // Update user
    user.password = hashedNewPassword;
    user.hasSetPassword = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
