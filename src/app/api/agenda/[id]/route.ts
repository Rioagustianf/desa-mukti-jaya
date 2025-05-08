import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Agenda from "@/lib/models/Agenda";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const data = await Agenda.findById(params.id);
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
  await dbConnect();
  const body = await req.json();
  const updated = await Agenda.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  if (!updated)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: updated });
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
  await dbConnect();
  const deleted = await Agenda.findByIdAndDelete(params.id);
  if (!deleted)
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: deleted });
}
