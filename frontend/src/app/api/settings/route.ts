import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const policies = await sql`SELECT * FROM policies ORDER BY category`;
    const courts = await sql`SELECT * FROM courts ORDER BY court_type, name`;
    const areas = await sql`SELECT pa.*, u.name as head_name FROM practice_areas pa LEFT JOIN users u ON pa.head_user_id = u.id ORDER BY pa.name`;
    const templates = await sql`SELECT * FROM document_templates ORDER BY name`;
    return NextResponse.json({ policies, courts, areas, templates });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "update_policy") {
      await sql`UPDATE policies SET config = ${JSON.stringify(data.config)}, updated_at = CURRENT_TIMESTAMP WHERE category = ${data.category}`;
      return NextResponse.json({ ok: true });
    }
    if (action === "create_court") {
      await sql`INSERT INTO courts (name, name_ar, court_type, city) VALUES (${data.name}, ${data.name_ar || null}, ${data.court_type}, ${data.city || null})`;
      return NextResponse.json({ ok: true });
    }
    if (action === "create_area") {
      await sql`INSERT INTO practice_areas (name, name_ar, head_user_id) VALUES (${data.name}, ${data.name_ar || null}, ${data.head_user_id || null})`;
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
