import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const users = await sql`SELECT id, name, name_ar, role, department, bar_number FROM users WHERE is_active = 1 ORDER BY role, name`;
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { userId, pin } = await request.json();
  const rows = await sql`SELECT id, name, name_ar, role, department, bar_number, hourly_rate FROM users WHERE id = ${userId} AND pin = ${pin} AND is_active = 1`;
  if (rows.length === 0) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const user = rows[0];
  const isPartner = ["managing_partner", "senior_partner", "partner"].includes(user.role);
  const isAdmin = user.role === "admin";
  return NextResponse.json({ ...user, isPartner, isAdmin });
}
