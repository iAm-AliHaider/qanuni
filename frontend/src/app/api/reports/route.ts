import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const casesByType = await sql`SELECT case_type, status, COUNT(*) as count FROM cases GROUP BY case_type, status ORDER BY case_type`;
    const casesByStatus = await sql`SELECT status, COUNT(*) as count FROM cases GROUP BY status`;
    const revenueByLawyer = await sql`SELECT u.name, COALESCE(SUM(te.amount), 0) as revenue, COALESCE(SUM(te.hours), 0) as hours FROM users u LEFT JOIN time_entries te ON u.id = te.user_id WHERE u.role IN ('managing_partner','senior_partner','partner','senior_associate','associate') GROUP BY u.id, u.name ORDER BY revenue DESC`;
    const revenueByClient = await sql`SELECT cl.name, COALESCE(SUM(i.total), 0) as invoiced, (SELECT COALESCE(SUM(p.amount),0) FROM payments p WHERE p.client_id = cl.id) as paid FROM clients cl LEFT JOIN invoices i ON cl.id = i.client_id GROUP BY cl.id, cl.name HAVING COALESCE(SUM(i.total), 0) > 0 ORDER BY invoiced DESC`;
    const monthlyRevenue = await sql`SELECT SUBSTRING(entry_date, 1, 7) as month, SUM(amount) as revenue, SUM(hours) as hours FROM time_entries GROUP BY SUBSTRING(entry_date, 1, 7) ORDER BY month DESC LIMIT 12`;
    const utilizationByLawyer = await sql`SELECT u.name, u.role, COALESCE(SUM(CASE WHEN te.is_billable = 1 THEN te.hours ELSE 0 END), 0) as billable, COALESCE(SUM(te.hours), 0) as total FROM users u LEFT JOIN time_entries te ON u.id = te.user_id WHERE u.role IN ('managing_partner','senior_partner','partner','senior_associate','associate') GROUP BY u.id, u.name, u.role ORDER BY billable DESC`;
    const invoiceAging = await sql`SELECT 
      COUNT(CASE WHEN payment_status IN ('unpaid','partial') AND due_date >= CURRENT_DATE::TEXT THEN 1 END) as current,
      COUNT(CASE WHEN payment_status IN ('unpaid','partial') AND due_date < CURRENT_DATE::TEXT AND due_date >= (CURRENT_DATE - 30)::TEXT THEN 1 END) as days_30,
      COUNT(CASE WHEN payment_status IN ('unpaid','partial') AND due_date < (CURRENT_DATE - 30)::TEXT AND due_date >= (CURRENT_DATE - 60)::TEXT THEN 1 END) as days_60,
      COUNT(CASE WHEN payment_status IN ('unpaid','partial') AND due_date < (CURRENT_DATE - 60)::TEXT THEN 1 END) as days_90_plus
      FROM invoices`;
    return NextResponse.json({ casesByType, casesByStatus, revenueByLawyer, revenueByClient, monthlyRevenue, utilizationByLawyer, invoiceAging: invoiceAging[0] || {} });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
