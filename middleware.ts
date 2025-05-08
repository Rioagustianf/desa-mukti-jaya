import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const adminRoutes = [
  "/admin",
  "/admin/",
  "/admin/(.*)", // semua subroute admin
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = adminRoutes.some(
    (route) =>
      new RegExp(`^${route.replace(/\//g, "\\/")}$`).test(pathname) ||
      pathname.startsWith(route.replace("(.*)", ""))
  );

  if (isAdminRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

// Aktifkan middleware hanya untuk route admin
export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
