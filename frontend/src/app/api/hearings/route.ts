import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // YYYY-MM

  try {
    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      const hearings = await sql`SELECT h.*, cs.ref as case_ref, cs.title as case_title, ct.name as court_name, j.name as judge_name
        FROM hearings h JOIN cases cs ON h.case_id = cs.id LEFT JOIN courts ct ON h.court_id = ct.id LEFT JOIN judges j ON h.judge_id = j.id
        WHERE h.hearing_date >= ${startDate} AND h.hearing_date <= ${endDate}
        ORDER BY h.hearing_date, h.hearing_time`;
      return NextResponse.json(hearings);
    }

    const hearings = await sql`SELECT h.*, cs.ref as case_ref, cs.title as case_title, ct.name as court_name, j.name as judge_name
      FROM hearings h JOIN cases cs ON h.case_id = cs.id LEFT JOIN courts ct ON h.court_id = ct.id LEFT JOIN judges j ON h.judge_id = j.id
      ORDER BY h.hearing_date DESC`;
    return NextResponse.json(hearings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create") {
      const [row] = await sql`INSERT INTO hearings (ref, case_id, court_id, judge_id, hearing_date, hearing_time, hearing_type, location, status, notes, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.case_id}, ${data.court_id || null}, ${data.judge_id || null}, ${data.hearing_date}, ${data.hearing_time || '09:00'}, ${data.hearing_type || 'first_hearing'}, ${data.location || null}, 'scheduled', ${data.notes || null}, ${data.created_by || null})
        RETURNING id`;
      const ref = `HRG-${String(row.id).padStart(3, '0')}`;
      await sql`UPDATE hearings SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }

    if (action === "update_status") {
      await sql`UPDATE hearings SET status = ${data.status}, outcome = ${data.outcome || null}, next_hearing_date = ${data.next_hearing_date || null} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "reschedule") {
      await sql`UPDATE hearings SET hearing_date = ${data.hearing_date}, hearing_time = ${data.hearing_time || '09:00'}, status = 'rescheduled' WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
