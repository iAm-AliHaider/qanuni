import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const caseId = searchParams.get("caseId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    if (userId) {
      const entries = await sql`SELECT te.*, u.name as user_name, cs.ref as case_ref, cs.title as case_title, cl.name as client_name
        FROM time_entries te JOIN users u ON te.user_id = u.id LEFT JOIN cases cs ON te.case_id = cs.id LEFT JOIN clients cl ON cs.client_id = cl.id
        WHERE te.user_id = ${userId} ORDER BY te.entry_date DESC, te.id DESC LIMIT 100`;
      const [stats] = await sql`SELECT 
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(CASE WHEN is_billable = 1 THEN hours ELSE 0 END), 0) as billable_hours,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as entry_count
        FROM time_entries WHERE user_id = ${userId}`;
      return NextResponse.json({ entries, stats });
    }

    if (caseId) {
      const entries = await sql`SELECT te.*, u.name as user_name FROM time_entries te JOIN users u ON te.user_id = u.id WHERE te.case_id = ${caseId} ORDER BY te.entry_date DESC`;
      return NextResponse.json(entries);
    }

    // All entries with optional date range
    let entries;
    if (from && to) {
      entries = await sql`SELECT te.*, u.name as user_name, cs.ref as case_ref, cs.title as case_title
        FROM time_entries te JOIN users u ON te.user_id = u.id LEFT JOIN cases cs ON te.case_id = cs.id
        WHERE te.entry_date >= ${from} AND te.entry_date <= ${to} ORDER BY te.entry_date DESC`;
    } else {
      entries = await sql`SELECT te.*, u.name as user_name, cs.ref as case_ref, cs.title as case_title
        FROM time_entries te JOIN users u ON te.user_id = u.id LEFT JOIN cases cs ON te.case_id = cs.id
        ORDER BY te.entry_date DESC LIMIT 200`;
    }
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create") {
      const amount = (data.hours || 0) * (data.rate || 0);
      await sql`INSERT INTO time_entries (case_id, user_id, entry_date, hours, rate, amount, description, is_billable, activity_type) 
        VALUES (${data.case_id}, ${data.user_id}, ${data.entry_date || new Date().toISOString().slice(0, 10)}, ${data.hours}, ${data.rate || 0}, ${amount}, ${data.description || null}, ${data.is_billable ? 1 : 0}, ${data.activity_type || 'general'})`;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      await sql`DELETE FROM time_entries WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
