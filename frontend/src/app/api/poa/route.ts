import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const poas = await sql`SELECT p.*, cl.name as client_name, u.name as lawyer_name FROM power_of_attorney p LEFT JOIN clients cl ON p.client_id = cl.id LEFT JOIN users u ON p.lawyer_id = u.id ORDER BY p.created_at DESC`;
    return NextResponse.json(poas);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      await sql`INSERT INTO power_of_attorney (client_id, lawyer_id, poa_type, scope, issue_date, expiry_date, notary_ref, status) VALUES (${data.client_id}, ${data.lawyer_id}, ${data.poa_type || 'general'}, ${data.scope || null}, ${data.issue_date || new Date().toISOString().slice(0, 10)}, ${data.expiry_date || null}, ${data.notary_ref || null}, 'active')`;
      return NextResponse.json({ ok: true });
    }
    if (action === "revoke") { await sql`UPDATE power_of_attorney SET status = 'revoked' WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
