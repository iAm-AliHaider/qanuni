import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "overview";

  try {
    if (type === "revenue_monthly") {
      const rows = await sql`SELECT TO_CHAR(invoice_date::date, 'YYYY-MM') as month, SUM(total::numeric) as revenue, COUNT(*) as count FROM invoices WHERE invoice_date IS NOT NULL GROUP BY month ORDER BY month DESC LIMIT 12`;
      return NextResponse.json({ data: rows });
    }

    if (type === "revenue_by_lawyer") {
      const rows = await sql`SELECT u.name, SUM(te.hours * te.rate) as revenue, SUM(te.hours) as hours FROM time_entries te JOIN users u ON te.user_id = u.id WHERE (te.is_billable::text = 'true' OR te.is_billable::text = '1') GROUP BY u.name ORDER BY revenue DESC`;
      return NextResponse.json({ data: rows });
    }

    if (type === "revenue_by_client") {
      const rows = await sql`SELECT c.name, SUM(i.total::numeric) as revenue, COUNT(i.id) as invoices FROM invoices i JOIN clients c ON i.client_id = c.id GROUP BY c.name ORDER BY revenue DESC LIMIT 10`;
      return NextResponse.json({ data: rows });
    }

    if (type === "case_pipeline") {
      const rows = await sql`SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY count DESC`;
      return NextResponse.json({ data: rows });
    }

    if (type === "case_by_type") {
      const rows = await sql`SELECT case_type, status, COUNT(*) as count FROM cases GROUP BY case_type, status ORDER BY case_type`;
      return NextResponse.json({ data: rows });
    }

    if (type === "utilization") {
      const rows = await sql`SELECT u.name, u.role, 
        COALESCE(SUM(CASE WHEN (te.is_billable::text = 'true' OR te.is_billable::text = '1') THEN te.hours ELSE 0 END), 0) as billable_hours,
        COALESCE(SUM(te.hours), 0) as total_hours
        FROM users u LEFT JOIN time_entries te ON u.id = te.user_id
        WHERE u.role IN ('partner','senior_partner','managing_partner','senior_associate','associate')
        GROUP BY u.name, u.role ORDER BY billable_hours DESC`;
      return NextResponse.json({ data: rows });
    }

    if (type === "deadline_countdown") {
      const rows = await sql`SELECT 'hearing' as type, h.hearing_date as due_date, c.title as case_title, c.ref as case_ref
        FROM hearings h JOIN cases c ON h.case_id = c.id
        WHERE h.hearing_date::date >= CURRENT_DATE AND h.hearing_date::date <= CURRENT_DATE + INTERVAL '30 days'
        UNION ALL
        SELECT 'filing' as type, f.deadline_date, c.title, c.ref
        FROM court_filings f JOIN cases c ON f.case_id = c.id
        WHERE f.deadline_date::date >= CURRENT_DATE AND f.deadline_date::date <= CURRENT_DATE + INTERVAL '30 days' AND f.status != 'filed'
        UNION ALL
        SELECT 'task' as type, t.due_date, t.title, NULL
        FROM tasks t WHERE t.due_date::date >= CURRENT_DATE AND t.due_date::date <= CURRENT_DATE + INTERVAL '30 days' AND t.status != 'done'
        ORDER BY due_date ASC LIMIT 20`;
      return NextResponse.json({ data: rows });
    }

    // Overview KPIs
    const [cases] = await sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'active') as active FROM cases`;
    const [invoices] = await sql`SELECT COALESCE(SUM(total::numeric), 0) as total_revenue, COALESCE(SUM(total::numeric) FILTER (WHERE payment_status::text = 'paid'), 0) as collected FROM invoices`;
    const [time] = await sql`SELECT COALESCE(SUM(hours), 0) as total_hours, COALESCE(SUM(hours) FILTER (WHERE is_billable::text = 'true' OR is_billable::text = '1'), 0) as billable_hours FROM time_entries`;
    const [clients] = await sql`SELECT COUNT(*) as total FROM clients WHERE is_active::int = 1`;

    return NextResponse.json({
      cases: { total: cases.total, active: cases.active },
      revenue: { total: invoices.total_revenue, collected: invoices.collected },
      time: { total: time.total_hours, billable: time.billable_hours, utilization: time.total_hours > 0 ? Math.round(time.billable_hours / time.total_hours * 100) : 0 },
      clients: { total: clients.total },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
