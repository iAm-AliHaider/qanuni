import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

async function ensureTables() {
  await sql`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT,
    message_ar TEXT,
    link TEXT,
    entity_type TEXT,
    entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    user_name TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    entity_name TEXT,
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const action = searchParams.get("action");

  try {
    await ensureTables();

    if (action === "activity") {
      const limit = Number(searchParams.get("limit") || 50);
      const rows = await sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`;
      return NextResponse.json({ activity: rows });
    }

    if (action === "unread_count" && userId) {
      const rows = await sql`SELECT COUNT(*) as count FROM notifications WHERE user_id = ${userId} AND is_read = false`;
      return NextResponse.json({ count: Number(rows[0]?.count || 0) });
    }

    if (userId) {
      const rows = await sql`SELECT * FROM notifications WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 50`;
      return NextResponse.json({ notifications: rows });
    }

    // All notifications (admin)
    const rows = await sql`SELECT n.*, u.name as user_name FROM notifications n LEFT JOIN users u ON n.user_id = u.id ORDER BY n.created_at DESC LIMIT 100`;
    return NextResponse.json({ notifications: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureTables();
    const body = await request.json();
    const { action } = body;

    if (action === "mark_read") {
      const { id, userId } = body;
      if (id) {
        await sql`UPDATE notifications SET is_read = true WHERE id = ${id}`;
      } else if (userId) {
        await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId}`;
      }
      return NextResponse.json({ success: true });
    }

    if (action === "create") {
      const { user_id, type, title, title_ar, message, message_ar, link, entity_type, entity_id } = body;
      const [row] = await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, message_ar, link, entity_type, entity_id) VALUES (${user_id}, ${type || "info"}, ${title}, ${title_ar || null}, ${message || null}, ${message_ar || null}, ${link || null}, ${entity_type || null}, ${entity_id || null}) RETURNING id`;
      return NextResponse.json({ success: true, id: row.id });
    }

    if (action === "log_activity") {
      const { user_id, user_name, activity_action, entity_type, entity_id, entity_name, details } = body;
      await sql`INSERT INTO activity_log (user_id, user_name, action, entity_type, entity_id, entity_name, details) VALUES (${user_id || null}, ${user_name || null}, ${activity_action}, ${entity_type || null}, ${entity_id || null}, ${entity_name || null}, ${details || null})`;
      return NextResponse.json({ success: true });
    }

    // Generate deadline notifications
    if (action === "check_deadlines") {
      // Hearings in next 3 days
      const hearings = await sql`SELECT h.*, c.title as case_title, u.id as partner_user_id FROM hearings h JOIN cases c ON h.case_id = c.id LEFT JOIN users u ON u.id::text = c.assigned_partner WHERE h.hearing_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'`;
      for (const h of hearings) {
        if (h.partner_user_id) {
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT ${h.lead_partner_id}, 'hearing', ${"Upcoming hearing: " + (h.case_title || "")}, ${"جلسة قادمة: " + (h.case_title || "")}, ${h.hearing_date + " at " + (h.hearing_time || "TBD")}, ${"/calendar"}, 'hearing', ${h.id}
            WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE entity_type = 'hearing' AND entity_id = ${h.id} AND entity_id = ${h.id} AND created_at > NOW() - INTERVAL '1 day')`;
        }
      }
      // Filing deadlines in next 5 days
      const filings = await sql`SELECT f.*, c.title as case_title, u.id as partner_user_id FROM court_filings f JOIN cases c ON f.case_id = c.id LEFT JOIN users u ON u.id::text = c.assigned_partner WHERE f.deadline_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days' AND f.status != 'filed'`;
      for (const f of filings) {
        if (f.partner_user_id) {
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT ${f.lead_partner_id}, 'deadline', ${"Filing deadline: " + (f.title || "")}, ${"موعد تقديم: " + (f.title || "")}, ${"Due: " + f.deadline_date}, ${"/filings"}, 'filing', ${f.id}
            WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE entity_type = 'filing' AND entity_id = ${f.id} AND entity_id = ${f.id} AND created_at > NOW() - INTERVAL '1 day')`;
        }
      }
      // Overdue tasks
      const tasks = await sql`SELECT * FROM tasks WHERE due_date < CURRENT_DATE AND status != 'done' AND assigned_to IS NOT NULL`;
      for (const t of tasks) {
        await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
          SELECT ${t.assigned_to}, 'overdue', ${"Overdue task: " + (t.title || "")}, ${"مهمة متأخرة: " + (t.title || "")}, ${"Was due: " + t.due_date}, ${"/tasks"}, 'task', ${t.id}
          WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE entity_type = 'task' AND entity_id = ${t.id} AND user_id = null AND created_at > NOW() - INTERVAL '1 day')`;
      }
      return NextResponse.json({ success: true, checked: { hearings: hearings.length, filings: filings.length, tasks: tasks.length } });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
