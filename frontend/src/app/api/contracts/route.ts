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
  const id = searchParams.get("id");
  try {
    if (id) {
      const [contract] = await sql`SELECT c.*, cl.name as client_name, cs.ref as case_ref, cs.title as case_title FROM contracts c LEFT JOIN clients cl ON c.client_id = cl.id LEFT JOIN cases cs ON c.case_id = cs.id WHERE c.id = ${id}`;
      return NextResponse.json(contract || {});
    }
    const contracts = await sql`SELECT c.*, cl.name as client_name, cs.ref as case_ref FROM contracts c LEFT JOIN clients cl ON c.client_id = cl.id LEFT JOIN cases cs ON c.case_id = cs.id ORDER BY c.created_at DESC`;
    const [stats] = await sql`SELECT COUNT(*) as total, COUNT(CASE WHEN status='active' THEN 1 END) as active, COALESCE(SUM(CASE WHEN status='active' THEN value ELSE 0 END), 0) as active_value, COUNT(CASE WHEN renewal_date IS NOT NULL AND renewal_date <= (CURRENT_DATE + 30)::TEXT THEN 1 END) as expiring_soon FROM contracts`;
    return NextResponse.json({ contracts, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create") {
      const [row] = await sql`INSERT INTO contracts (ref, client_id, case_id, title, title_ar, contract_type, status, start_date, end_date, value, terms, obligations, renewal_type, renewal_date, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.client_id || null}, ${data.case_id || null}, ${data.title}, ${data.title_ar || null}, ${data.contract_type || 'service'}, 'draft', ${data.start_date || null}, ${data.end_date || null}, ${data.value || 0}, ${data.terms || null}, ${data.obligations || null}, ${data.renewal_type || 'none'}, ${data.renewal_date || null}, ${data.created_by || null})
        RETURNING id`;
      const ref = `CTR-${new Date().getFullYear()}-${String(row.id).padStart(3, '0')}`;
      await sql`UPDATE contracts SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }
    if (action === "update_status") { await sql`UPDATE contracts SET status = ${data.status}, updated_at = CURRENT_TIMESTAMP WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    if (action === "sign") {
      if (data.party === "client") await sql`UPDATE contracts SET signed_by_client = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ${data.id}`;
      else await sql`UPDATE contracts SET signed_by_firm = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ${data.id}`;
      // Auto-activate if both signed
      await sql`UPDATE contracts SET status = 'active' WHERE id = ${data.id} AND signed_by_client = 1 AND signed_by_firm = 1 AND status = 'draft'`;
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") { await sql`DELETE FROM contracts WHERE id = ${data.id}`; return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
