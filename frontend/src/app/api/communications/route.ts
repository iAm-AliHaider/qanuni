import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const comms = await sql`SELECT cc.*, cl.name as client_name, u.name as user_name, cs.ref as case_ref FROM client_communications cc LEFT JOIN clients cl ON cc.client_id = cl.id LEFT JOIN users u ON cc.user_id = u.id LEFT JOIN cases cs ON cc.case_id = cs.id ORDER BY cc.created_at DESC LIMIT 200`;
    return NextResponse.json(comms);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      await sql`INSERT INTO client_communications (client_id, case_id, user_id, comm_type, subject, body, direction) VALUES (${data.client_id || null}, ${data.case_id || null}, ${data.user_id || null}, ${data.comm_type || 'call'}, ${data.subject}, ${data.body || null}, ${data.direction || 'outbound'})`;
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") { await sql`DELETE FROM client_communications WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
