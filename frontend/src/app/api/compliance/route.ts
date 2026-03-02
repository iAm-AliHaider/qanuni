import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const conflicts = await sql`SELECT * FROM conflict_checks ORDER BY checked_at DESC LIMIT 50`;
    const pendingKyc = await sql`SELECT * FROM clients WHERE kyc_status = 'pending' ORDER BY name`;
    const highRisk = await sql`SELECT * FROM clients WHERE risk_level = 'high' ORDER BY name`;
    const expiringPoa = await sql`SELECT p.*, cl.name as client_name FROM power_of_attorney p LEFT JOIN clients cl ON p.client_id = cl.id WHERE p.expiry_date IS NOT NULL AND p.status = 'active' ORDER BY p.expiry_date`;
    return NextResponse.json({ conflicts, pendingKyc, highRisk, expiringPoa });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    if (action === "run_conflict_check") {
      // Check if client/party appears in opposing parties
      const name = data.party_name;
      const q = `%${name}%`;
      const matches = await sql`SELECT cs.ref, cs.title, cs.opposing_party, cl.name as client_name FROM cases cs LEFT JOIN clients cl ON cs.client_id = cl.id WHERE cs.opposing_party ILIKE ${q} OR cl.name ILIKE ${q}`;
      const hasConflict = matches.length > 0;
      await sql`INSERT INTO conflict_checks (checked_name, checked_by, result, conflicts_found, notes) VALUES (${name}, ${data.checked_by || null}, ${hasConflict ? 'conflict_found' : 'clear'}, ${matches.length}, ${JSON.stringify(matches)})`;
      return NextResponse.json({ hasConflict, matches });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}
