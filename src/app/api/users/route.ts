import { type NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import dbConnect from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// GET /api/users - Get all users
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memuat data pengguna" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { username, password, name, role } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name: name || username,
      role: role || "admin",
    });

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat pengguna baru" },
      { status: 500 }
    );
  }
}
