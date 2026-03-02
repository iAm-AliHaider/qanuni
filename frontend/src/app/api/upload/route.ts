import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Try Vercel Blob first, fallback to DB storage
async function uploadToBlob(file: File): Promise<string | null> {
  try {
    const { put } = await import("@vercel/blob");
    const blob = await put(`qanuni/${Date.now()}-${file.name}`, file, { access: "public" });
    return blob.url;
  } catch {
    return null; // Blob not configured
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Check file size (4.5MB limit for DB, unlimited for Blob)
    if (file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 4.5MB)" }, { status: 400 });
    }

    // Try Vercel Blob
    const blobUrl = await uploadToBlob(file);
    if (blobUrl) {
      return NextResponse.json({ url: blobUrl, filename: file.name, size: file.size, storage: "blob" });
    }

    // Fallback: store as base64 in DB
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store in a files table
    await sql`CREATE TABLE IF NOT EXISTS uploaded_files (id SERIAL PRIMARY KEY, filename TEXT, mime_type TEXT, size INTEGER, data TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`;
    const [row] = await sql`INSERT INTO uploaded_files (filename, mime_type, size, data) VALUES (${file.name}, ${file.type}, ${file.size}, ${dataUrl}) RETURNING id`;

    const url = `/api/upload?fileId=${row.id}`;
    return NextResponse.json({ url, filename: file.name, size: file.size, storage: "db" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) return NextResponse.json({ error: "No fileId" }, { status: 400 });

  try {
    const [file] = await sql`SELECT * FROM uploaded_files WHERE id = ${fileId}`;
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Return the data URL as a redirect or inline
    const base64Data = (file.data as string).split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": file.mime_type as string,
        "Content-Disposition": `inline; filename="${file.filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
