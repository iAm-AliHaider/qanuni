"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", sent: "bg-blue-100 text-blue-700", paid: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700", unpaid: "bg-red-100 text-red-700", overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-400",
};

export default function InvoicesPage() {
  const [user, setUser] = useState<any>(null);
  const userCanWrite = canWrite(user?.role || "admin", "invoices" as any);
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
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
  };
  const [showPayment, setShowPayment] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [form, setForm] = useState({ client_id: "", case_id: "", due_date: "", notes: "", items: [{ description: "Legal services", quantity: 1, unit_price: 0, amount: 0, item_type: "service" }] as any[] });
  const [payForm, setPayForm] = useState({ amount: "", payment_method: "bank_transfer", reference_number: "", payment_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []));
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);

  const load = () => { fetch("/api/invoices").then(r => r.json()).then(setData); };
  useEffect(() => { load(); }, []);

  const loadDetail = (id: number) => { fetch(`/api/invoices?id=${id}`).then(r => r.json()).then(setViewInvoice); };

  const subtotal = form.items.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  const updateItem = (idx: number, field: string, value: any) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === "quantity" || field === "unit_price") items[idx].amount = (Number(items[idx].quantity) || 0) * (Number(items[idx].unit_price) || 0);
    setForm(p => ({ ...p, items }));
  };

  const createInvoice = async () => {
    if (!form.client_id) return;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", client_id: form.client_id, case_id: form.case_id || null, due_date: form.due_date || null, subtotal, notes: form.notes, items: form.items, created_by: user?.id }) });
    setShowCreate(false);
    setForm({ client_id: "", case_id: "", due_date: "", notes: "", items: [{ description: "Legal services", quantity: 1, unit_price: 0, amount: 0, item_type: "service" }] });
    load();
  };

  const recordPayment = async () => {
    if (!payForm.amount || !showPayment) return;
    const inv = showPayment;
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "record_payment", invoice_id: inv.id, client_id: inv.client_id, amount: parseFloat(payForm.amount), payment_method: payForm.payment_method, reference_number: payForm.reference_number, payment_date: payForm.payment_date, created_by: user?.id }) });
    setShowPayment(null);
    setPayForm({ amount: "", payment_method: "bank_transfer", reference_number: "", payment_date: new Date().toISOString().slice(0, 10) });
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status }) });
    load();
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">Please log in first</div>;

  const invoices = data?.invoices || [];
  const stats = data?.stats || {};

  // ZATCA QR Code display component
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
                    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
                    <style>body{font-family:system-ui;text-align:center;padding:40px;background:#f8fafb}
                    h2{color:#064e3b;margin-bottom:4px}p{color:#64748b;font-size:13px}
                    canvas{margin:20px auto;border:2px solid #d1fae5;border-radius:12px;padding:12px;background:white}
                    .info{font-size:11px;color:#94a3b8;margin-top:8px}</style></head>
                    <body><h2>ZATCA E-Invoice</h2><p>${inv.ref || "INV-" + inv.id}</p>
                    <canvas id="qr"></canvas>
                    <div class="info">Scan to verify invoice authenticity</div>
                    <div class="info" style="margin-top:4px">مكتب الراشد والشركاء للمحاماة</div>
                    <script>QRCode.toCanvas(document.getElementById("qr"),"${qr}",{width:256,margin:2})<\/script>
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

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
            </a>
            <h1 className="text-lg font-bold text-slate-900">Invoices & Finance</h1>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
            New Invoice
          </button>
        </div>
      </header>

      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-3 md:space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-emerald-400">
            <p className="text-xl font-bold text-emerald-600">{Number(stats.total_invoiced || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Total Invoiced (SAR)</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-blue-400">
            <p className="text-xl font-bold text-blue-600">{Number(stats.total_paid || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Total Collected</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-amber-400">
            <p className="text-xl font-bold text-amber-600">{Number((stats.total_invoiced || 0) - (stats.total_paid || 0)).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Outstanding</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-red-400">
            <p className="text-xl font-bold text-red-600">{Number(stats.overdue || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Overdue</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-violet-400">
            <p className="text-xl font-bold text-violet-600">{stats.invoice_count || 0}</p>
            <p className="text-[10px] text-slate-400">Total Invoices</p>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Invoices</h3></div>
          <div className="table-scroll">
          {invoices.length === 0 ? <div className="p-8 text-center text-xs text-slate-400">No invoices yet. Create your first invoice.</div> :
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 text-slate-500"><th className="px-4 py-2 text-left font-medium">Ref</th><th className="px-4 py-2 text-left font-medium">Client</th><th className="px-4 py-2 text-left font-medium">Case</th><th className="px-4 py-2 text-left font-medium">Date</th><th className="px-4 py-2 text-left font-medium">Status</th><th className="px-4 py-2 text-right font-medium">Total (SAR)</th><th className="px-4 py-2 text-center font-medium">Actions</th></tr></thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{inv.ref}</td>
                    <td className="px-4 py-2.5 text-slate-700">{inv.client_name}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">{inv.case_ref}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.invoice_date}<span className="text-[9px] text-slate-300 ml-1">({(() => { try { return new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {month:"short",day:"numeric"}).format(new Date(inv.invoice_date)); } catch { return ""; }})()})</span></td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${STATUS_COLORS[inv.payment_status] || "bg-gray-100 text-gray-500"}`}>{inv.payment_status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{Number(inv.total).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center"><ZATCABadge inv={inv} /></td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        {inv.payment_status !== "paid" && (
                          <button onClick={() => { setShowPayment(inv); setPayForm(p => ({ ...p, amount: String(inv.total) })); }} className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold">Pay</button>
                        )}
                        {inv.status === "draft" && (
                          <button onClick={() => updateStatus(inv.id, "sent")} className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-semibold">Send</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>}
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto sm:my-8" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900">Create Invoice</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Client *</label>
                  <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    <option value="">Select...</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.ref})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Case</label>
                  <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    <option value="">Select...</option>
                    {cases.filter((c: any) => !form.client_id || c.client_id === Number(form.client_id)).map((c: any) => <option key={c.id} value={c.id}>{c.ref} — {c.title?.slice(0, 30)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Line Items</label>
                  <button onClick={() => setForm(p => ({ ...p, items: [...p.items, { description: "", quantity: 1, unit_price: 0, amount: 0, item_type: "service" }] }))} className="text-[10px] text-emerald-600 font-semibold">+ Add Item</button>
                </div>
                {form.items.map((item: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-1 md:gap-2 mb-2 items-end">
                    <input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Description" className="col-span-5 px-2 py-1.5 rounded border border-slate-200 text-xs" />
                    <input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} className="col-span-2 px-2 py-1.5 rounded border border-slate-200 text-xs text-center" />
                    <input type="number" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", e.target.value)} placeholder="Rate" className="col-span-2 px-2 py-1.5 rounded border border-slate-200 text-xs" />
                    <span className="col-span-2 text-xs font-bold text-right text-slate-700">{Number(item.amount).toLocaleString()}</span>
                    <button onClick={() => setForm(p => ({ ...p, items: p.items.filter((_: any, i: number) => i !== idx) }))} className="col-span-1 text-red-400 hover:text-red-600 text-center">
                      <svg className="w-3.5 h-3.5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-xs"><span className="text-slate-500">Subtotal</span><span className="font-medium">{subtotal.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">VAT (15%)</span><span className="font-medium">{vat.toLocaleString()} SAR</span></div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-1 mt-1"><span>Total</span><span className="text-emerald-600">{total.toLocaleString()} SAR</span></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={createInvoice} disabled={!form.client_id || subtotal === 0} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Create Invoice</button>
              </div>
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowPayment(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900">Record Payment</h3>
              <p className="text-xs text-slate-500">Invoice: <strong>{showPayment.ref}</strong> — Total: <strong className="text-emerald-600">{Number(showPayment.total).toLocaleString()} SAR</strong></p>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Amount (SAR) *</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Method</label>
                  <select value={payForm.payment_method} onChange={e => setPayForm(p => ({ ...p, payment_method: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Reference #</label>
                  <input value={payForm.reference_number} onChange={e => setPayForm(p => ({ ...p, reference_number: e.target.value }))} placeholder="Transaction ref" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">Date</label>
                  <input type="date" value={payForm.payment_date} onChange={e => setPayForm(p => ({ ...p, payment_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowPayment(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button>
                <button onClick={recordPayment} disabled={!payForm.amount} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Record Payment</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div></AppShell>
  );
}
