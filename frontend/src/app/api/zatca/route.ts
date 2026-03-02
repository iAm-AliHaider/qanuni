import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { generateZATCAQR, calculateInvoice, generateUBLXML, FIRM_ZATCA_CONFIG } from "@/lib/zatca";

const sql = neon(process.env.DATABASE_URL!);

// Add ZATCA columns to invoices table if not exists
async function ensureZATCAColumns() {
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_qr TEXT`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_xml TEXT`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_status TEXT DEFAULT 'pending'`;
  await sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS zatca_hash TEXT`;
}

/**
 * POST /api/zatca — Generate ZATCA QR + XML for an invoice
 * Body: { invoiceId: number } or { action: "generate", invoiceId: number }
 *
 * GET /api/zatca?invoiceId=X — Get ZATCA data for an invoice
 * GET /api/zatca?action=config — Get firm ZATCA configuration
 */
export async function POST(request: NextRequest) {
  try {
    await ensureZATCAColumns();
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

    // Fetch invoice + line items + client
    const invoices = await sql`SELECT i.*, c.name as client_name, c.name_ar as client_name_ar 
      FROM invoices i LEFT JOIN clients c ON i.client_id = c.id WHERE i.id = ${invoiceId}`;
    if (!invoices.length) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    const inv = invoices[0];

    const items = await sql`SELECT * FROM invoice_items WHERE invoice_id = ${invoiceId}`;

    // Build ZATCA invoice
    const issueDate = String(inv.invoice_date || inv.created_at).slice(0, 10);
    const issueTime = "12:00:00";
    const invoiceRef = inv.ref || `INV-${inv.id}`;

    const zatcaInvoice = {
      invoiceNumber: invoiceRef,
      issueDate,
      issueTime,
      clientName: String(inv.client_name || "Client"),
      clientNameAr: inv.client_name_ar ? String(inv.client_name_ar) : undefined,
      lineItems: (items || []).map((item: any) => ({
        description: String(item.description || "Legal Service"),
        quantity: Number(item.quantity || item.hours || 1),
        unitPrice: Number(item.rate || item.amount || 0),
        discount: 0,
      })),
    };

    // If no line items, use invoice total directly
    if (!zatcaInvoice.lineItems.length) {
      zatcaInvoice.lineItems = [{
        description: "Legal Services",
        quantity: 1,
        unitPrice: Number(inv.total || inv.amount || 0) / 1.15, // reverse VAT
        discount: 0,
      }];
    }

    const calc = calculateInvoice(zatcaInvoice);
    const xml = generateUBLXML(zatcaInvoice, calc);

    // Store in DB
    await sql`UPDATE invoices SET 
      zatca_qr = ${calc.qrCode}, 
      zatca_xml = ${xml}, 
      zatca_status = 'generated',
      zatca_hash = ${Buffer.from(calc.qrCode).toString("base64").slice(0, 64)}
      WHERE id = ${invoiceId}`;

    return NextResponse.json({
      success: true,
      invoiceId,
      qrCode: calc.qrCode,
      calculation: {
        subtotal: calc.subtotal,
        vatAmount: calc.vatAmount,
        total: calc.total,
        lineCount: calc.lineDetails.length,
      },
      zatcaStatus: "generated",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const invoiceId = searchParams.get("invoiceId");

  try {
    if (action === "config") {
      return NextResponse.json({ config: FIRM_ZATCA_CONFIG });
    }

    if (invoiceId) {
      await ensureZATCAColumns();
      const rows = await sql`SELECT zatca_qr, zatca_xml, zatca_status, zatca_hash FROM invoices WHERE id = ${invoiceId}`;
      if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    }

    // List all invoices with ZATCA status
    await ensureZATCAColumns();
    const rows = await sql`SELECT id, ref, total, zatca_status, zatca_qr IS NOT NULL as has_qr FROM invoices ORDER BY id DESC LIMIT 50`;
    return NextResponse.json({ invoices: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
