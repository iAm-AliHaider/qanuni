import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const filings = await sql`SELECT f.*, cs.ref as case_ref, cs.title as case_title, ct.name as court_name, u.name as filer_name FROM court_filings f LEFT JOIN cases cs ON f.case_id = cs.id LEFT JOIN courts ct ON f.court_id = ct.id LEFT JOIN users u ON f.filed_by = u.id ORDER BY COALESCE(f.deadline_date, '9999-12-31') ASC, f.created_at DESC`;
    const [stats] = await sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status='pending' THEN 1 END) as pending, COUNT(CASE WHEN status='filed' THEN 1 END) as filed, COUNT(CASE WHEN response_required=1 AND response_deadline IS NOT NULL AND response_deadline >= CURRENT_DATE::TEXT THEN 1 END) as responses_due, COUNT(CASE WHEN deadline_date IS NOT NULL AND deadline_date < CURRENT_DATE::TEXT AND status IN ('draft','pending') THEN 1 END) as overdue FROM court_filings`;
    return NextResponse.json({ filings, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      const [row] = await sql`INSERT INTO court_filings (ref, case_id, filing_type, title, title_ar, court_id, najiz_ref, filing_date, deadline_date, status, filed_by, notes, response_required, response_deadline)
        VALUES (gen_random_uuid()::TEXT, ${data.case_id || null}, ${data.filing_type}, ${data.title}, ${data.title_ar || null}, ${data.court_id || null}, ${data.najiz_ref || null}, ${data.filing_date || null}, ${data.deadline_date || null}, ${data.status || 'draft'}, ${data.filed_by || null}, ${data.notes || null}, ${data.response_required ? 1 : 0}, ${data.response_deadline || null})
        RETURNING id`;
      const ref = `FIL-${new Date().getFullYear()}-${String(row.id).padStart(3, '0')}`;
      await sql`UPDATE court_filings SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }
    if (action === "update_status") { await sql`UPDATE court_filings SET status = ${data.status}, filing_date = CASE WHEN ${data.status} = 'filed' THEN CURRENT_DATE::TEXT ELSE filing_date END WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    if (action === "delete") { await sql`DELETE FROM court_filings WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
