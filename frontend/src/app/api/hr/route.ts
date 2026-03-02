import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const lawyers = await sql`SELECT u.*, (SELECT COUNT(*) FROM cases WHERE assigned_partner = u.id OR assigned_associate = u.id) as case_count, (SELECT COALESCE(SUM(hours), 0) FROM time_entries WHERE user_id = u.id) as total_hours, (SELECT COALESCE(SUM(amount), 0) FROM time_entries WHERE user_id = u.id) as total_revenue FROM users u WHERE u.is_active = 1 ORDER BY u.role, u.name`;
    const byRole = await sql`SELECT role, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY role ORDER BY count DESC`;
    const byDept = await sql`SELECT department, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY department ORDER BY count DESC`;
    return NextResponse.json({ lawyers, byRole, byDept });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "update") {
      await sql`UPDATE users SET name = COALESCE(${data.name || null}, name), name_ar = ${data.name_ar ?? null}, email = ${data.email ?? null}, phone = ${data.phone ?? null}, department = ${data.department ?? null}, specializations = ${data.specializations ?? null}, hourly_rate = COALESCE(${data.hourly_rate ?? null}, hourly_rate) WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }
    if (action === "deactivate") { await sql`UPDATE users SET is_active = 0 WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
