import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get("caseId");
  const category = searchParams.get("category");
  try {
    if (caseId) {
      const docs = await sql`SELECT d.*, u.name as created_by_name, cs.ref as case_ref FROM documents d LEFT JOIN users u ON d.created_by = u.id LEFT JOIN cases cs ON d.case_id = cs.id WHERE d.case_id = ${caseId} ORDER BY d.created_at DESC`;
      return NextResponse.json(docs);
    }
    if (category) {
      const docs = await sql`SELECT d.*, u.name as created_by_name, cs.ref as case_ref, cl.name as client_name FROM documents d LEFT JOIN users u ON d.created_by = u.id LEFT JOIN cases cs ON d.case_id = cs.id LEFT JOIN clients cl ON d.client_id = cl.id WHERE d.category = ${category} ORDER BY d.created_at DESC`;
      return NextResponse.json(docs);
    }
    const docs = await sql`SELECT d.*, u.name as created_by_name, cs.ref as case_ref, cl.name as client_name FROM documents d LEFT JOIN users u ON d.created_by = u.id LEFT JOIN cases cs ON d.case_id = cs.id LEFT JOIN clients cl ON d.client_id = cl.id ORDER BY d.created_at DESC LIMIT 200`;
    const [stats] = await sql`SELECT COUNT(*) as total, COUNT(DISTINCT category) as categories, COUNT(DISTINCT case_id) as cases FROM documents`;
    return NextResponse.json({ docs, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      const [row] = await sql`INSERT INTO documents (ref, case_id, client_id, title, title_ar, doc_type, category, file_url, status, content, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.case_id || null}, ${data.client_id || null}, ${data.title}, ${data.title_ar || null}, ${data.doc_type || 'general'}, ${data.category || 'general'}, ${data.file_url || null}, 'draft', ${data.content || null}, ${data.created_by || null})
        RETURNING id`;
      const ref = `DOC-${new Date().getFullYear()}-${String(row.id).padStart(4, '0')}`;
      await sql`UPDATE documents SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }
    if (action === "update_status") { await sql`UPDATE documents SET status = ${data.status} WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    if (action === "delete") { await sql`DELETE FROM documents WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
