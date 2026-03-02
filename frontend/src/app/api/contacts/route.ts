import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q");
  try {
    if (q) {
      const search = `%${q}%`;
      const contacts = await sql`SELECT * FROM contacts WHERE name ILIKE ${search} OR organization ILIKE ${search} OR specialization ILIKE ${search} ORDER BY name`;
      return NextResponse.json(contacts);
    }
    if (type) {
      const contacts = await sql`SELECT * FROM contacts WHERE contact_type = ${type} ORDER BY name`;
      return NextResponse.json(contacts);
    }
    const contacts = await sql`SELECT * FROM contacts ORDER BY contact_type, name`;
    const judges = await sql`SELECT j.*, c.name as court_name FROM judges j LEFT JOIN courts ct ON j.court_id = ct.id LEFT JOIN courts c ON j.court_id = c.id ORDER BY j.name`;
    return NextResponse.json({ contacts, judges });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      await sql`INSERT INTO contacts (name, name_ar, contact_type, organization, phone, email, specialization, notes) VALUES (${data.name}, ${data.name_ar || null}, ${data.contact_type || 'other'}, ${data.organization || null}, ${data.phone || null}, ${data.email || null}, ${data.specialization || null}, ${data.notes || null})`;
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") { await sql`DELETE FROM contacts WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
