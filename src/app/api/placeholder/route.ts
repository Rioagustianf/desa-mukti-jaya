import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get width and height from URL parameters
  const { searchParams } = new URL(request.url);
  const width = searchParams.get("width") || "600";
  const height = searchParams.get("height") || "400";

  // SVG placeholder with specified dimensions
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">
        ${width}x${height}
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
    },
  });
}
