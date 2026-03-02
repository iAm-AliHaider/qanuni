import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    entity_ref TEXT,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entity_type");
  const entityId = searchParams.get("entity_id");
  const limit = Number(searchParams.get("limit") || 100);

  try {
    await ensureTable();
    let rows;
    if (entityType && entityId) {
      rows = await sql`SELECT * FROM audit_trail WHERE entity_type = ${entityType} AND entity_id = ${Number(entityId)} ORDER BY created_at DESC LIMIT ${limit}`;
    } else if (entityType) {
      rows = await sql`SELECT * FROM audit_trail WHERE entity_type = ${entityType} ORDER BY created_at DESC LIMIT ${limit}`;
    } else {
      rows = await sql`SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT ${limit}`;
    }
    return NextResponse.json({ trail: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTable();
    const { user_id, user_name, action, entity_type, entity_id, entity_ref, old_value, new_value } = await request.json();
    const [row] = await sql`INSERT INTO audit_trail (user_id, user_name, action, entity_type, entity_id, entity_ref, old_value, new_value) VALUES (${user_id||null}, ${user_name||null}, ${action}, ${entity_type}, ${entity_id||null}, ${entity_ref||null}, ${old_value||null}, ${new_value||null}) RETURNING id`;
    return NextResponse.json({ success: true, id: row.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
