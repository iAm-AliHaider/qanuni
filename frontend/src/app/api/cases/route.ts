import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const [cs] = await sql`
        SELECT cs.*, cl.name as client_name, cl.name_ar as client_name_ar, cl.ref as client_ref,
          u1.name as partner_name, u2.name as associate_name, u3.name as paralegal_name
        FROM cases cs 
        LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id 
        LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        LEFT JOIN users u3 ON cs.assigned_paralegal = u3.id
        WHERE cs.id = ${id}`;
      if (!cs) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const hearings = await sql`SELECT h.*, ct.name as court_name, j.name as judge_name 
        FROM hearings h LEFT JOIN courts ct ON h.court_id = ct.id LEFT JOIN judges j ON h.judge_id = j.id
        WHERE h.case_id = ${id} ORDER BY h.hearing_date DESC`;
      const tasks = await sql`SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.case_id = ${id} ORDER BY t.due_date`;
      const deadlines = await sql`SELECT * FROM deadlines WHERE case_id = ${id} ORDER BY deadline_date`;
      const notes = await sql`SELECT cn.*, u.name as author_name FROM case_notes cn LEFT JOIN users u ON cn.user_id = u.id WHERE cn.case_id = ${id} ORDER BY cn.created_at DESC`;
      const parties = await sql`SELECT * FROM case_parties WHERE case_id = ${id}`;
      const timeEntries = await sql`SELECT te.*, u.name as user_name FROM time_entries te LEFT JOIN users u ON te.user_id = u.id WHERE te.case_id = ${id} ORDER BY te.entry_date DESC`;
      const documents = await sql`SELECT d.*, u.name as created_by_name FROM documents d LEFT JOIN users u ON d.created_by = u.id WHERE d.case_id = ${id} ORDER BY d.created_at DESC`;

      return NextResponse.json({ ...cs, hearings, tasks, deadlines, notes, parties, timeEntries, documents });
    }

    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("q");

    let cases;
    if (search) {
      const q = `%${search}%`;
      cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        WHERE (cs.title ILIKE ${q} OR cs.ref ILIKE ${q} OR cl.name ILIKE ${q} OR cs.opposing_party ILIKE ${q})
        ORDER BY cs.created_at DESC`;
    } else if (status && type) {
      cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        WHERE cs.status = ${status} AND cs.case_type = ${type} ORDER BY cs.created_at DESC`;
    } else if (status) {
      cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        WHERE cs.status = ${status} ORDER BY cs.created_at DESC`;
    } else if (type) {
      cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        WHERE cs.case_type = ${type} ORDER BY cs.created_at DESC`;
    } else {
      cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        ORDER BY cs.created_at DESC`;
    }
    return NextResponse.json(cases);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create") {
      const [row] = await sql`INSERT INTO cases (ref, title, title_ar, case_type, practice_area, status, priority, client_id, opposing_party, opposing_counsel, court, judge, najiz_ref, case_value, fee_type, fee_amount, description, assigned_partner, assigned_associate, assigned_paralegal, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.title}, ${data.title_ar || null}, ${data.case_type}, ${data.practice_area || null}, ${data.status || 'intake'}, ${data.priority || 'medium'}, ${data.client_id || null}, ${data.opposing_party || null}, ${data.opposing_counsel || null}, ${data.court || null}, ${data.judge || null}, ${data.najiz_ref || null}, ${data.case_value || 0}, ${data.fee_type || 'hourly'}, ${data.fee_amount || 0}, ${data.description || null}, ${data.assigned_partner || null}, ${data.assigned_associate || null}, ${data.assigned_paralegal || null}, ${data.created_by || null})
        RETURNING id`;
      const id = row.id;
      const ref = `${new Date().getFullYear()}-${data.case_type?.toUpperCase()?.slice(0, 3) || 'GEN'}-${String(id).padStart(3, '0')}`;
      await sql`UPDATE cases SET ref = ${ref} WHERE id = ${id}`;
      return NextResponse.json({ id, ref });
    }

    if (action === "update") {
      await sql`UPDATE cases SET 
        title = COALESCE(${data.title || null}, title),
        title_ar = COALESCE(${data.title_ar || null}, title_ar),
        case_type = COALESCE(${data.case_type || null}, case_type),
        practice_area = COALESCE(${data.practice_area || null}, practice_area),
        status = COALESCE(${data.status || null}, status),
        priority = COALESCE(${data.priority || null}, priority),
        client_id = ${data.client_id ?? null},
        opposing_party = ${data.opposing_party ?? null},
        opposing_counsel = ${data.opposing_counsel ?? null},
        court = ${data.court ?? null},
        judge = ${data.judge ?? null},
        najiz_ref = ${data.najiz_ref ?? null},
        case_value = COALESCE(${data.case_value ?? null}, case_value),
        fee_type = COALESCE(${data.fee_type || null}, fee_type),
        fee_amount = COALESCE(${data.fee_amount ?? null}, fee_amount),
        description = ${data.description ?? null},
        assigned_partner = ${data.assigned_partner ?? null},
        assigned_associate = ${data.assigned_associate ?? null},
        assigned_paralegal = ${data.assigned_paralegal ?? null},
        outcome = ${data.outcome ?? null},
        close_date = ${data.close_date ?? null}
        WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "update_status") {
      await sql`UPDATE cases SET status = ${data.status}, close_date = ${data.status === 'closed' ? new Date().toISOString().slice(0, 10) : null} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "add_note") {
      await sql`INSERT INTO case_notes (case_id, note_type, note, user_id) VALUES (${data.case_id}, ${data.note_type || 'general'}, ${data.content}, ${data.created_by || null})`;
      return NextResponse.json({ ok: true });
    }

    if (action === "add_task") {
      const [row] = await sql`INSERT INTO tasks (ref, case_id, title, description, priority, due_date, assigned_to, assigned_by, category) 
        VALUES (gen_random_uuid()::TEXT, ${data.case_id}, ${data.title}, ${data.description || null}, ${data.priority || 'medium'}, ${data.due_date || null}, ${data.assigned_to || null}, ${data.assigned_by || null}, ${data.task_type || 'general'})
        RETURNING id`;
      const ref = `TSK-${String(row.id).padStart(4, '0')}`;
      await sql`UPDATE tasks SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }

    if (action === "update_task") {
      await sql`UPDATE tasks SET status = ${data.status} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "add_deadline") {
      await sql`INSERT INTO deadlines (case_id, title, deadline_date, priority, assigned_to, days_before_alert) 
        VALUES (${data.case_id}, ${data.title}, ${data.deadline_date}, ${data.priority || 'high'}, ${data.assigned_to || null}, ${data.reminder_days || 3})`;
      return NextResponse.json({ ok: true });
    }

    if (action === "add_time") {
      const amount = (data.hours || 0) * (data.rate || 0);
      await sql`INSERT INTO time_entries (case_id, user_id, entry_date, hours, rate, amount, description, is_billable, activity_type) 
        VALUES (${data.case_id}, ${data.user_id}, ${data.entry_date || new Date().toISOString().slice(0, 10)}, ${data.hours}, ${data.rate || 0}, ${amount}, ${data.description || null}, ${data.billable !== false ? 1 : 0}, ${data.activity_type || 'research'})`;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      await sql`DELETE FROM cases WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
