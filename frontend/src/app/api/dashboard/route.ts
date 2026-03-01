import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const section = searchParams.get("section") || "overview";

  try {
    if (section === "overview") {
      const [activeCases] = await sql`SELECT COUNT(*) as count FROM cases WHERE status NOT IN ('closed','archived')`;
      const [upcomingHearings] = await sql`SELECT COUNT(*) as count FROM hearings WHERE hearing_date >= CURRENT_DATE::TEXT AND status='scheduled'`;
      const [pendingTasks] = await sql`SELECT COUNT(*) as count FROM tasks WHERE status IN ('todo','in_progress')`;
      const [overdueDeadlines] = await sql`SELECT COUNT(*) as count FROM deadlines WHERE deadline_date < CURRENT_DATE::TEXT AND status='pending'`;
      const [totalClients] = await sql`SELECT COUNT(*) as count FROM clients WHERE is_active=1`;
      const casesByType = await sql`SELECT case_type, COUNT(*) as count FROM cases WHERE status NOT IN ('closed','archived') GROUP BY case_type ORDER BY count DESC`;
      const recentCases = await sql`SELECT cs.id, cs.ref, cs.title, cs.case_type, cs.status, cs.priority, cl.name as client_name 
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id 
        WHERE cs.status NOT IN ('closed','archived') ORDER BY cs.created_at DESC LIMIT 5`;
      const upcomingHearingsList = await sql`SELECT h.ref, h.hearing_date, h.hearing_time, h.hearing_type, cs.ref as case_ref, cs.title as case_title, ct.name as court_name
        FROM hearings h JOIN cases cs ON h.case_id = cs.id LEFT JOIN courts ct ON h.court_id = ct.id
        WHERE h.hearing_date >= CURRENT_DATE::TEXT AND h.status='scheduled' ORDER BY h.hearing_date, h.hearing_time LIMIT 5`;
      const urgentDeadlines = await sql`SELECT d.title, d.deadline_date, d.priority, cs.ref as case_ref, cs.title as case_title
        FROM deadlines d LEFT JOIN cases cs ON d.case_id = cs.id WHERE d.status='pending' ORDER BY d.deadline_date LIMIT 5`;
      const pendingTasksList = await sql`SELECT t.ref, t.title, t.priority, t.due_date, t.status, cs.ref as case_ref, u.name as assignee_name
        FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.status IN ('todo','in_progress') ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date LIMIT 8`;

      return NextResponse.json({
        activeCases: Number(activeCases.count),
        upcomingHearings: Number(upcomingHearings.count),
        pendingTasks: Number(pendingTasks.count),
        overdueDeadlines: Number(overdueDeadlines.count),
        totalClients: Number(totalClients.count),
        casesByType,
        recentCases,
        upcomingHearingsList,
        urgentDeadlines,
        pendingTasksList,
      });
    }

    if (section === "cases") {
      const cases = await sql`SELECT cs.*, cl.name as client_name, u1.name as partner_name, u2.name as associate_name
        FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id
        LEFT JOIN users u1 ON cs.assigned_partner = u1.id LEFT JOIN users u2 ON cs.assigned_associate = u2.id
        ORDER BY cs.created_at DESC`;
      return NextResponse.json(cases);
    }

    if (section === "clients") {
      const clients = await sql`SELECT cl.*, (SELECT COUNT(*) FROM cases WHERE client_id = cl.id) as case_count FROM clients cl ORDER BY cl.name`;
      return NextResponse.json(clients);
    }

    if (section === "hearings") {
      const hearings = await sql`SELECT h.*, cs.ref as case_ref, cs.title as case_title, ct.name as court_name, j.name as judge_name
        FROM hearings h JOIN cases cs ON h.case_id = cs.id LEFT JOIN courts ct ON h.court_id = ct.id LEFT JOIN judges j ON h.judge_id = j.id
        ORDER BY h.hearing_date DESC`;
      return NextResponse.json(hearings);
    }

    if (section === "tasks") {
      const tasks = await sql`SELECT t.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name, u2.name as assigner_name
        FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN users u2 ON t.assigned_by = u2.id
        ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date`;
      return NextResponse.json(tasks);
    }

    if (section === "time_entries") {
      const entries = await sql`SELECT te.*, u.name as user_name, cs.ref as case_ref, cs.title as case_title
        FROM time_entries te JOIN users u ON te.user_id = u.id LEFT JOIN cases cs ON te.case_id = cs.id
        ORDER BY te.entry_date DESC, te.id DESC LIMIT 50`;
      return NextResponse.json(entries);
    }

    if (section === "documents") {
      const docs = await sql`SELECT d.*, u.name as created_by_name, cs.ref as case_ref FROM documents d LEFT JOIN users u ON d.created_by = u.id LEFT JOIN cases cs ON d.case_id = cs.id ORDER BY d.created_at DESC`;
      return NextResponse.json(docs);
    }

    if (section === "courts") {
      const courts = await sql`SELECT * FROM courts ORDER BY court_type, name`;
      return NextResponse.json(courts);
    }

    if (section === "deadlines") {
      const deadlines = await sql`SELECT d.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name
        FROM deadlines d LEFT JOIN cases cs ON d.case_id = cs.id LEFT JOIN users u ON d.assigned_to = u.id ORDER BY d.deadline_date`;
      return NextResponse.json(deadlines);
    }

    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
