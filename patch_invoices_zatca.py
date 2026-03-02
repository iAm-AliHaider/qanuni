"""Patch invoices page to add ZATCA QR code generation and display."""
f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\invoices\page.tsx', 'r', encoding='utf-8').read()

# 1. Add ZATCA QR state + generate function after existing states
# Find the return statement area of the main component
# We need to add:
# - zatcaQR state per invoice
# - generateZATCA function
# - QR display in invoice cards

# Add state for ZATCA
old_state = 'const [showCreate, setShowCreate] = useState(false);'
new_state = '''const [showCreate, setShowCreate] = useState(false);
  const [zatcaLoading, setZatcaLoading] = useState<number|null>(null);
  const [zatcaQRs, setZatcaQRs] = useState<Record<number,string>>({});

  const generateZATCA = async (invoiceId: number) => {
    setZatcaLoading(invoiceId);
    try {
      const res = await fetch("/api/zatca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const data = await res.json();
      if (data.qrCode) {
        setZatcaQRs(prev => ({ ...prev, [invoiceId]: data.qrCode }));
      }
    } catch (e) { console.error(e); }
    setZatcaLoading(null);
  };'''

if old_state in f:
    f = f.replace(old_state, new_state)
    print("Added ZATCA state + function")

# 2. Add ZATCA QR button + display to each invoice card
# Find the payment button area - add ZATCA button nearby
# Look for "Record Payment" button and add ZATCA button after it
old_payment = '>Record Payment<'
new_payment = '''>Record Payment<'''

# Instead, let's add a ZATCA section at the bottom of each invoice card
# Find where invoice status badges are shown and add QR after
# Let's add it before the closing of each invoice card div

# Find the pattern where we show invoice items/status and add ZATCA section
# Add after the payment recording section

old_marker = '{/* Payments */}'
if old_marker not in f:
    # Try another approach - add ZATCA button next to other action buttons
    # Look for the Record Payment button's container
    pass

# Simpler: inject a ZATCA section component that shows at the bottom of each invoice
# We'll add it to the invoice expand/detail area
# Let's find where each invoice is rendered and add the QR section

# Add a ZATCA QR inline component before the main return
old_return = '  return (\n    <AppShell>'
zatca_component = '''  // ZATCA QR Code display component
  const ZATCABadge = ({ inv }: { inv: any }) => {
    const qr = zatcaQRs[inv.id];
    return (
      <div className="flex items-center gap-2 mt-2">
        {qr ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-700">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              ZATCA
            </span>
            <button
              onClick={() => {
                const w = window.open("", "_blank", "width=400,height=500");
                if (w) {
                  w.document.write(`<html><head><title>ZATCA QR - ${inv.ref || inv.id}</title>
                    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\\/script>
                    <style>body{font-family:system-ui;text-align:center;padding:40px;background:#f8fafb}
                    h2{color:#064e3b;margin-bottom:4px}p{color:#64748b;font-size:13px}
                    canvas{margin:20px auto;border:2px solid #d1fae5;border-radius:12px;padding:12px;background:white}
                    .info{font-size:11px;color:#94a3b8;margin-top:8px}</style></head>
                    <body><h2>ZATCA E-Invoice</h2><p>${inv.ref || "INV-" + inv.id}</p>
                    <canvas id="qr"></canvas>
                    <div class="info">Scan to verify invoice authenticity</div>
                    <div class="info" style="margin-top:4px">مكتب الراشد والشركاء للمحاماة</div>
                    <script>QRCode.toCanvas(document.getElementById("qr"),"${qr}",{width:256,margin:2})<\\/script>
                    </body></html>`);
                }
              }}
              className="text-[10px] text-emerald-600 hover:text-emerald-800 underline"
            >
              View QR
            </button>
          </div>
        ) : (
          <button
            onClick={() => generateZATCA(inv.id)}
            disabled={zatcaLoading === inv.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            {zatcaLoading === inv.id ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
            )}
            Generate ZATCA
          </button>
        )}
      </div>
    );
  };

'''

if old_return in f:
    f = f.replace(old_return, zatca_component + old_return)
    print("Added ZATCABadge component")

# Now inject <ZATCABadge inv={inv} /> into each invoice card
# Find the status badge area in invoice rendering
# Look for the SAR total display in each invoice card and add after it
old_total_display = 'SAR {Number(inv.total||0).toLocaleString()}'
if old_total_display in f:
    f = f.replace(
        old_total_display,
        old_total_display + '</span><ZATCABadge inv={inv} /><span className="hidden">',
        1  # only first occurrence to avoid breaking
    )
    print("Injected ZATCABadge into invoice cards")
else:
    # Alternative: try to find where invoices are mapped
    print("WARN: Could not find total display pattern, manual injection needed")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\invoices\page.tsx', 'w', encoding='utf-8').write(f)
print("DONE")
