import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

// Note: pdfme removed. Keep only helper utilities used by HTML->PDF flow.

export async function urlToDataURI(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
          return;
        }
        const chunks: Buffer[] = [];
        res
          .on("data", (chunk) =>
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          )
          .on("end", () => {
            const buffer = Buffer.concat(chunks);
            const contentType =
              res.headers["content-type"] || "application/octet-stream";
            const base64 = buffer.toString("base64");
            resolve(`data:${contentType};base64,${base64}`);
          })
          .on("error", reject);
      })
      .on("error", reject);
  });
}

export function fileToDataURI(absolutePath: string, mimeType: string): string {
  const buffer = fs.readFileSync(absolutePath);
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}
