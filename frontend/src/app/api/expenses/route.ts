import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const expenses = await sql`SELECT e.*, u.name as user_name, cs.ref as case_ref, a.name as approver_name FROM expenses e LEFT JOIN users u ON e.user_id = u.id LEFT JOIN cases cs ON e.case_id = cs.id LEFT JOIN users a ON e.approved_by = a.id ORDER BY e.created_at DESC LIMIT 200`;
    const [stats] = await sql`SELECT COUNT(*) as total, COALESCE(SUM(amount),0) as total_amount, COUNT(CASE WHEN status='pending' THEN 1 END) as pending, COUNT(CASE WHEN is_billable=1 THEN 1 END) as billable FROM expenses`;
    return NextResponse.json({ expenses, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      const [row] = await sql`INSERT INTO expenses (ref, case_id, user_id, category, description, amount, expense_date, is_billable, status) VALUES (gen_random_uuid()::TEXT, ${data.case_id || null}, ${data.user_id || null}, ${data.category || 'general'}, ${data.description}, ${data.amount}, ${data.expense_date || new Date().toISOString().slice(0,10)}, ${data.is_billable ? 1 : 0}, 'pending') RETURNING id`;
      const ref = `EXP-${String(row.id).padStart(4, '0')}`;
      await sql`UPDATE expenses SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }
    if (action === "approve") { await sql`UPDATE expenses SET status = 'approved', approved_by = ${data.approved_by} WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    if (action === "reject") { await sql`UPDATE expenses SET status = 'rejected' WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
