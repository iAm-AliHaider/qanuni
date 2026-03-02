import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const retainers = await sql`SELECT r.*, cl.name as client_name, cs.ref as case_ref FROM retainer_agreements r LEFT JOIN clients cl ON r.client_id = cl.id LEFT JOIN cases cs ON r.case_id = cs.id ORDER BY r.created_at DESC`;
    const [stats] = await sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status='active' THEN 1 END) as active, COALESCE(SUM(CASE WHEN status='active' THEN amount ELSE 0 END), 0) as monthly_value FROM retainer_agreements`;
    return NextResponse.json({ retainers, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      await sql`INSERT INTO retainer_agreements (client_id, case_id, agreement_type, amount, start_date, end_date, billing_day, status) VALUES (${data.client_id}, ${data.case_id || null}, ${data.agreement_type || 'monthly'}, ${data.amount}, ${data.start_date}, ${data.end_date || null}, ${data.billing_day || 1}, 'active')`;
      return NextResponse.json({ ok: true });
    }
    if (action === "update_status") { await sql`UPDATE retainer_agreements SET status = ${data.status} WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
