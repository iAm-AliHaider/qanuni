import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const accounts = await sql`SELECT ta.*, cl.name as client_name, cs.ref as case_ref FROM trust_accounts ta LEFT JOIN clients cl ON ta.client_id = cl.id LEFT JOIN cases cs ON ta.case_id = cs.id ORDER BY ta.created_at DESC`;
    const transactions = await sql`SELECT tt.*, ta.client_id, cl.name as client_name, u.name as creator_name FROM trust_transactions tt LEFT JOIN trust_accounts ta ON tt.account_id = ta.id LEFT JOIN clients cl ON ta.client_id = cl.id LEFT JOIN users u ON tt.created_by = u.id ORDER BY tt.created_at DESC LIMIT 100`;
    const [stats] = await sql`SELECT COUNT(*) as total_accounts, COALESCE(SUM(balance), 0) as total_balance, COUNT(CASE WHEN status='active' THEN 1 END) as active FROM trust_accounts`;
    return NextResponse.json({ accounts, transactions, stats });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "create_account") {
      await sql`INSERT INTO trust_accounts (client_id, case_id, balance, currency, status) VALUES (${data.client_id}, ${data.case_id || null}, 0, ${data.currency || 'SAR'}, 'active')`;
      return NextResponse.json({ ok: true });
    }
    if (action === "deposit" || action === "withdrawal") {
      const amount = parseFloat(data.amount);
      if (action === "withdrawal") {
        const [acc] = await sql`SELECT balance FROM trust_accounts WHERE id = ${data.account_id}`;
        if (acc.balance < amount) return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }
      await sql`INSERT INTO trust_transactions (account_id, transaction_type, amount, description, reference, created_by) VALUES (${data.account_id}, ${action}, ${amount}, ${data.description || null}, ${data.reference || null}, ${data.created_by || null})`;
      const sign = action === "deposit" ? amount : -amount;
      await sql`UPDATE trust_accounts SET balance = balance + ${sign} WHERE id = ${data.account_id}`;
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
