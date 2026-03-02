import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
// Audit trail helper — call after any CRUD operation
async function logAudit(sql: any, { user_id, user_name, action, entity_type, entity_id, entity_ref, old_value, new_value }: {
  user_id?: number; user_name?: string; action: string; entity_type: string;
  entity_id?: number; entity_ref?: string; old_value?: string; new_value?: string;
}) {
  try {
    await sql`INSERT INTO audit_trail (user_id, user_name, action, entity_type, entity_id, entity_ref, old_value, new_value) VALUES (\${user_id||null}, \${user_name||null}, \${action}, \${entity_type}, \${entity_id||null}, \${entity_ref||null}, \${old_value||null}, \${new_value||null})`;
  } catch {}
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  try {
    if (userId) {
      const tasks = await sql`SELECT t.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name, u2.name as assigner_name
        FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id LEFT JOIN users u2 ON t.assigned_by = u2.id
        WHERE t.assigned_to = ${userId} ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date`;
      return NextResponse.json(tasks);
    }
    if (status) {
      const tasks = await sql`SELECT t.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name
        FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.status = ${status} ORDER BY t.due_date`;
      return NextResponse.json(tasks);
    }
    const tasks = await sql`SELECT t.*, cs.ref as case_ref, cs.title as case_title, u.name as assignee_name
      FROM tasks t LEFT JOIN cases cs ON t.case_id = cs.id LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY CASE t.priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, t.due_date`;
    return NextResponse.json(tasks);
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      const [row] = await sql`INSERT INTO tasks (ref, case_id, title, description, priority, status, due_date, assigned_to, assigned_by, category)
        VALUES (gen_random_uuid()::TEXT, ${data.case_id || null}, ${data.title}, ${data.description || null}, ${data.priority || 'medium'}, 'todo', ${data.due_date || null}, ${data.assigned_to || null}, ${data.assigned_by || null}, ${data.category || 'general'})
        RETURNING id`;
      const ref = `TSK-${String(row.id).padStart(4, '0')}`;
      await sql`UPDATE tasks SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }
    if (action === "update_status") {
      await sql`UPDATE tasks SET status = ${data.status}, completed_at = ${data.status === 'completed' ? new Date().toISOString() : null} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }
    if (action === "update") {
      await sql`UPDATE tasks SET title = COALESCE(${data.title || null}, title), description = ${data.description ?? null}, priority = COALESCE(${data.priority || null}, priority), due_date = ${data.due_date ?? null}, assigned_to = ${data.assigned_to ?? null}, category = COALESCE(${data.category || null}, category) WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") { await sql`DELETE FROM tasks WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
