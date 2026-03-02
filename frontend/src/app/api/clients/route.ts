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
      const [client] = await sql`SELECT * FROM clients WHERE id = ${id}`;
      if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const cases = await sql`SELECT cs.*, u1.name as partner_name FROM cases cs LEFT JOIN users u1 ON cs.assigned_partner = u1.id WHERE cs.client_id = ${id} ORDER BY cs.created_at DESC`;
      const documents = await sql`SELECT d.*, u.name as created_by_name FROM documents d LEFT JOIN users u ON d.created_by = u.id WHERE d.client_id = ${id} ORDER BY d.created_at DESC`;
      const invoices = await sql`SELECT * FROM invoices WHERE client_id = ${id} ORDER BY invoice_date DESC`;
      const retainers = await sql`SELECT * FROM retainer_agreements WHERE client_id = ${id} ORDER BY start_date DESC`;
      const totalBilled = await sql`SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE client_id = ${id}`;
      const totalPaid = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE client_id = ${id}`;
      return NextResponse.json({ ...client, cases, contacts: [], documents, invoices, retainers, totalBilled: Number(totalBilled[0]?.total || 0), totalPaid: Number(totalPaid[0]?.total || 0) });
    }

    const search = searchParams.get("q");
    const type = searchParams.get("type");

    let clients;
    if (search) {
      const q = `%${search}%`;
      clients = await sql`SELECT cl.*, (SELECT COUNT(*) FROM cases WHERE client_id = cl.id) as case_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = cl.id) as total_billed
        FROM clients cl WHERE (cl.name ILIKE ${q} OR cl.name_ar ILIKE ${q} OR cl.ref ILIKE ${q} OR cl.phone ILIKE ${q} OR cl.national_id ILIKE ${q})
        ORDER BY cl.name`;
    } else if (type) {
      clients = await sql`SELECT cl.*, (SELECT COUNT(*) FROM cases WHERE client_id = cl.id) as case_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = cl.id) as total_billed
        FROM clients cl WHERE cl.client_type = ${type} ORDER BY cl.name`;
    } else {
      clients = await sql`SELECT cl.*, (SELECT COUNT(*) FROM cases WHERE client_id = cl.id) as case_count,
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = cl.id) as total_billed
        FROM clients cl ORDER BY cl.name`;
    }
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create") {
      const [row] = await sql`INSERT INTO clients (ref, client_type, name, name_ar, email, phone, phone2, address, address_ar, national_id, cr_number, vat_number, nationality, risk_level, notes, tags, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.client_type || 'individual'}, ${data.name}, ${data.name_ar || null}, ${data.email || null}, ${data.phone || null}, ${data.phone2 || null}, ${data.address || null}, ${data.address_ar || null}, ${data.national_id || null}, ${data.cr_number || null}, ${data.vat_number || null}, ${data.nationality || 'Saudi'}, ${data.risk_level || 'low'}, ${data.notes || null}, ${data.tags || null}, ${data.created_by || null})
        RETURNING id`;
      const ref = `CLT-${String(row.id).padStart(3, '0')}`;
      await sql`UPDATE clients SET ref = ${ref} WHERE id = ${row.id}`;
      return NextResponse.json({ id: row.id, ref });
    }

    if (action === "update") {
      await sql`UPDATE clients SET 
        name = COALESCE(${data.name || null}, name),
        name_ar = ${data.name_ar ?? null},
        client_type = COALESCE(${data.client_type || null}, client_type),
        email = ${data.email ?? null},
        phone = ${data.phone ?? null},
        phone2 = ${data.phone2 ?? null},
        address = ${data.address ?? null},
        address_ar = ${data.address_ar ?? null},
        national_id = ${data.national_id ?? null},
        cr_number = ${data.cr_number ?? null},
        vat_number = ${data.vat_number ?? null},
        nationality = COALESCE(${data.nationality || null}, nationality),
        risk_level = COALESCE(${data.risk_level || null}, risk_level),
        notes = ${data.notes ?? null},
        tags = ${data.tags ?? null}
        WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "update_kyc") {
      await sql`UPDATE clients SET kyc_status = ${data.kyc_status}, kyc_verified_at = ${data.kyc_status === 'verified' ? new Date().toISOString().slice(0, 10) : null}, kyc_verified_by = ${data.verified_by || null} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const [check] = await sql`SELECT COUNT(*) as c FROM cases WHERE client_id = ${data.id} AND status NOT IN ('closed','archived')`;
      if (Number(check.c) > 0) return NextResponse.json({ error: "Cannot delete client with active cases" }, { status: 400 });
      await sql`UPDATE clients SET is_active = 0 WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
