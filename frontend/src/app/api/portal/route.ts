import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

/**
 * Client Portal API — read-only access for clients to view their cases, invoices, documents.
 * Auth: client_id + PIN (default 1234)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const action = searchParams.get("action");

  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  try {
    const clients = await sql`SELECT * FROM clients WHERE id = ${clientId} AND is_active = 1`;
    if (!clients.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const client = clients[0];

    if (action === "cases") {
      const cases = await sql`SELECT id, ref, title, title_ar, case_type, status, priority, created_at FROM cases WHERE client_id = ${clientId} ORDER BY created_at DESC`;
      return NextResponse.json({ cases });
    }

    if (action === "invoices") {
      const invoices = await sql`SELECT id, ref, total, payment_status, invoice_date, due_date FROM invoices WHERE client_id = ${clientId} ORDER BY invoice_date DESC`;
      return NextResponse.json({ invoices });
    }

    if (action === "documents") {
      const docs = await sql`SELECT d.id, d.title, d.doc_type, d.created_at FROM documents d JOIN cases c ON d.case_id = c.id WHERE c.client_id = ${clientId} ORDER BY d.created_at DESC`;
      return NextResponse.json({ documents: docs });
    }

    if (action === "hearings") {
      const hearings = await sql`SELECT h.id, h.hearing_date, h.hearing_time, h.hearing_type, h.location, h.status, c.title as case_title FROM hearings h JOIN cases c ON h.case_id = c.id WHERE c.client_id = ${clientId} AND h.hearing_date::date >= CURRENT_DATE ORDER BY h.hearing_date ASC`;
      return NextResponse.json({ hearings });
    }

    // Overview
    const [caseCount] = await sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM cases WHERE client_id = ${clientId}`;
    const [invTotal] = await sql`SELECT COALESCE(SUM(total::numeric), 0) as total, COALESCE(SUM(total::numeric) FILTER (WHERE payment_status = 'paid'), 0) as paid FROM invoices WHERE client_id = ${clientId}`;
    const upcomingHearings = await sql`SELECT h.hearing_date, h.hearing_type, c.title FROM hearings h JOIN cases c ON h.case_id = c.id WHERE c.client_id = ${clientId} AND h.hearing_date::date >= CURRENT_DATE ORDER BY h.hearing_date LIMIT 3`;

    return NextResponse.json({
      client: { id: client.id, name: client.name, name_ar: client.name_ar, type: client.client_type },
      overview: {
        cases: { total: caseCount.total, active: caseCount.active },
        billing: { total: invTotal.total, paid: invTotal.paid, outstanding: Number(invTotal.total) - Number(invTotal.paid) },
        upcomingHearings,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, clientId, pin } = await request.json();

    if (action === "login") {
      if (!clientId) return NextResponse.json({ error: "Select a client" }, { status: 400 });
      // Simple PIN auth (default 1234 for all clients)
      if (pin !== "1234") return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
      const clients = await sql`SELECT id, name, name_ar, client_type, email, phone FROM clients WHERE id = ${clientId} AND is_active = 1`;
      if (!clients.length) return NextResponse.json({ error: "Client not found" }, { status: 404 });
      return NextResponse.json({ success: true, client: clients[0] });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
