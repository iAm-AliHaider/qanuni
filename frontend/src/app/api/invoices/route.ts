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
  const clientId = searchParams.get("clientId");

  try {
    if (id) {
      const [inv] = await sql`SELECT i.*, cl.name as client_name, cl.name_ar as client_name_ar, cl.vat_number as client_vat, cl.address as client_address, cs.ref as case_ref, cs.title as case_title, u.name as created_by_name
        FROM invoices i LEFT JOIN clients cl ON i.client_id = cl.id LEFT JOIN cases cs ON i.case_id = cs.id LEFT JOIN users u ON i.created_by = u.id
        WHERE i.id = ${id}`;
      if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${id} ORDER BY id`;
      const payments = await sql`SELECT * FROM payments WHERE invoice_id = ${id} ORDER BY payment_date DESC`;
      const timeEntries = await sql`SELECT te.*, u.name as user_name FROM time_entries te JOIN users u ON te.user_id = u.id WHERE te.invoice_id = ${id} ORDER BY te.entry_date`;
      return NextResponse.json({ ...inv, items, payments, timeEntries });
    }

    if (clientId) {
      const invoices = await sql`SELECT i.*, cl.name as client_name, cs.ref as case_ref FROM invoices i LEFT JOIN clients cl ON i.client_id = cl.id LEFT JOIN cases cs ON i.case_id = cs.id WHERE i.client_id = ${clientId} ORDER BY i.invoice_date DESC`;
      return NextResponse.json(invoices);
    }

    const invoices = await sql`SELECT i.*, cl.name as client_name, cs.ref as case_ref, cs.title as case_title
      FROM invoices i LEFT JOIN clients cl ON i.client_id = cl.id LEFT JOIN cases cs ON i.case_id = cs.id
      ORDER BY i.invoice_date DESC`;
    
    const [stats] = await sql`SELECT 
      COALESCE(SUM(total), 0) as total_invoiced,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(CASE WHEN payment_status IN ('unpaid','partial') AND due_date < CURRENT_DATE::TEXT THEN total ELSE 0 END), 0) as overdue,
      COUNT(*) as invoice_count,
      COUNT(CASE WHEN payment_status IN ('unpaid','partial') AND due_date < CURRENT_DATE::TEXT THEN 1 END) as overdue_count
      FROM invoices`;

    return NextResponse.json({ invoices, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create") {
      const vat = (data.subtotal || 0) * 0.15;
      const total = (data.subtotal || 0) + vat;
      const [row] = await sql`INSERT INTO invoices (ref, client_id, case_id, invoice_date, due_date, subtotal, vat_rate, vat_amount, total, status, payment_status, notes, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.client_id}, ${data.case_id || null}, ${data.invoice_date || new Date().toISOString().slice(0, 10)}, ${data.due_date || null}, ${data.subtotal || 0}, 15, ${vat}, ${total}, 'draft', 'unpaid', ${data.notes || null}, ${data.created_by || null})
        RETURNING id`;
      const ref = `INV-${new Date().getFullYear()}-${String(row.id).padStart(4, '0')}`;
      await sql`UPDATE invoices SET ref = ${ref} WHERE id = ${row.id}`;

      // Add line items
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          await sql`INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount, item_type)
            VALUES (${row.id}, ${item.description}, ${item.quantity || 1}, ${item.unit_price || 0}, ${item.amount || 0}, ${item.item_type || 'service'})`;
        }
      }
      return NextResponse.json({ id: row.id, ref });
    }

    if (action === "update_status") {
      await sql`UPDATE invoices SET status = ${data.status}, payment_status = ${data.payment_status || 'unpaid'} WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    if (action === "record_payment") {
      await sql`INSERT INTO payments (ref, invoice_id, client_id, amount, payment_date, payment_method, reference_number, notes, created_by)
        VALUES (gen_random_uuid()::TEXT, ${data.invoice_id}, ${data.client_id}, ${data.amount}, ${data.payment_date || new Date().toISOString().slice(0, 10)}, ${data.payment_method || 'bank_transfer'}, ${data.reference_number || null}, ${data.notes || null}, ${data.created_by || null})`;
      // Update payment status
      const [inv] = await sql`SELECT total FROM invoices WHERE id = ${data.invoice_id}`;
      const [paid] = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = ${data.invoice_id}`;
      const paidAmt = Number(paid.total);
      const invTotal = Number(inv.total);
      const ps = paidAmt >= invTotal ? 'paid' : paidAmt > 0 ? 'partial' : 'unpaid';
      await sql`UPDATE invoices SET payment_status = ${ps} WHERE id = ${data.invoice_id}`;
      // Update ref
      const lastPayment = await sql`SELECT id FROM payments WHERE invoice_id = ${data.invoice_id} ORDER BY id DESC LIMIT 1`;
      if (lastPayment[0]) {
        const pref = `PAY-${new Date().getFullYear()}-${String(lastPayment[0].id).padStart(4, '0')}`;
        await sql`UPDATE payments SET ref = ${pref} WHERE id = ${lastPayment[0].id}`;
      }
      return NextResponse.json({ ok: true, payment_status: ps });
    }

    if (action === "delete") {
      await sql`DELETE FROM invoice_items WHERE invoice_id = ${data.id}`;
      await sql`DELETE FROM invoices WHERE id = ${data.id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
