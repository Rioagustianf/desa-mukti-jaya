import { type NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// GET /api/users/:id - Get a specific user
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userId = params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat data pengguna" },
      { status: 500 }
    );
  }
}

// PUT /api/users/:id - Update a user
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userId = params.id;
    const body = await req.json();
    const { username, password, name, role } = body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return NextResponse.json(
          { message: "Username sudah digunakan" },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (username) user.username = username;
    if (name) user.name = name;
    if (role) user.role = role;

    // Only update password if provided
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui pengguna" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const userId = params.id;

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus pengguna" },
      { status: 500 }
    );
  }
}
