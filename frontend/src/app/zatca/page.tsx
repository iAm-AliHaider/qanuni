"use client";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useEffect } from "react";
import { FIRM_ZATCA_CONFIG, decodeZATCAQR } from "@/lib/zatca";

export default function ZATCAPage() {
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [selectedQR, setSelectedQR] = useState<{ inv: any; decoded: any } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("qanuni_user");
    if (u) setUser(JSON.parse(u));
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/zatca");
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const generateAll = async () => {
    const pending = invoices.filter(i => !i.has_qr);
    for (const inv of pending) {
      setGenerating(inv.id);
      try {
        await fetch("/api/zatca", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: inv.id }),
        });
      } catch (e) { console.error(e); }
    }
    setGenerating(null);
    loadInvoices();
  };

  const generateOne = async (id: number) => {
    setGenerating(id);
    try {
      await fetch("/api/zatca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id }),
      });
    } catch (e) { console.error(e); }
    setGenerating(null);
    loadInvoices();
  };

  const viewQR = async (inv: any) => {
    const res = await fetch(`/api/zatca?invoiceId=${inv.id}`);
    const data = await res.json();
    if (data.zatca_qr) {
      const decoded = decodeZATCAQR(data.zatca_qr);
      setSelectedQR({ inv: { ...inv, zatca_qr: data.zatca_qr, zatca_xml: data.zatca_xml }, decoded });
    }
  };

  const firm = FIRM_ZATCA_CONFIG;
  const compliant = invoices.filter(i => i.has_qr).length;
  const pending = invoices.filter(i => !i.has_qr).length;
  const totalInvoices = invoices.length;

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ZATCA E-Invoicing</h1>
            <p className="text-sm text-slate-500 mt-1">الفوترة الإلكترونية — هيئة الزكاة والضريبة والجمارك</p>
          </div>
          {pending > 0 && (
            <button
              onClick={generateAll}
              disabled={generating !== null}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {generating !== null ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
              )}
              Generate All ({pending})
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", labelAr: "إجمالي الفواتير", value: totalInvoices, color: "slate" },
            { label: "ZATCA Compliant", labelAr: "متوافقة مع زاتكا", value: compliant, color: "emerald" },
            { label: "Pending", labelAr: "معلقة", value: pending, color: "amber" },
            { label: "Compliance Rate", labelAr: "نسبة الامتثال", value: totalInvoices ? `${Math.round(compliant / totalInvoices * 100)}%` : "—", color: "blue" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <p className={`text-2xl font-bold text-${kpi.color === "emerald" ? "emerald" : kpi.color === "amber" ? "amber" : kpi.color === "blue" ? "blue" : "slate"}-600`}>{kpi.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{kpi.label}</p>
              <p className="text-[10px] text-slate-300">{kpi.labelAr}</p>
            </div>
          ))}
        </div>

        {/* Firm Config */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Firm Configuration — إعدادات المنشأة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400 text-[10px]">Seller Name (Arabic)</p>
              <p className="font-medium text-slate-800" dir="rtl">{firm.sellerName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">VAT Number</p>
              <p className="font-mono font-medium text-slate-800">{firm.vatNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">CR Number</p>
              <p className="font-mono font-medium text-slate-800">{firm.crNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Address</p>
              <p className="font-medium text-slate-800">{firm.address.street}, {firm.address.district}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">City</p>
              <p className="font-medium text-slate-800">{firm.address.city} ({firm.address.cityAr}) — {firm.address.postalCode}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">VAT Rate</p>
              <p className="font-mono font-bold text-emerald-600">{firm.vatRate * 100}%</p>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice ZATCA Status — حالة الفواتير</h3>
          </div>
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                <th className="px-4 py-2 text-left">Ref</th>
                <th className="px-4 py-2 text-right">Amount (SAR)</th>
                <th className="px-4 py-2 text-center">ZATCA Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr></thead>
              <tbody>
                {(invoices || []).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-800">{inv.ref || `INV-${inv.id}`}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{Number(inv.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      {inv.has_qr ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        {inv.has_qr ? (
                          <button onClick={() => viewQR(inv)} className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold hover:bg-emerald-100">View QR</button>
                        ) : (
                          <button
                            onClick={() => generateOne(inv.id)}
                            disabled={generating === inv.id}
                            className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-semibold hover:bg-amber-100 disabled:opacity-50"
                          >
                            {generating === inv.id ? "Generating..." : "Generate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* QR Detail Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedQR(null)}>
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">ZATCA QR Code</h3>
                <button onClick={() => setSelectedQR(null)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
              </div>

              {/* QR Code Canvas */}
              <div className="flex justify-center">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <canvas
                    ref={(canvas) => {
                      if (canvas && selectedQR.inv.zatca_qr) {
                        // Load QRCode library dynamically
                        const script = document.createElement("script");
                        script.src = "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
                        script.onload = () => {
                          (window as any).QRCode?.toCanvas(canvas, selectedQR.inv.zatca_qr, { width: 200, margin: 2 });
                        };
                        if ((window as any).QRCode) {
                          (window as any).QRCode.toCanvas(canvas, selectedQR.inv.zatca_qr, { width: 200, margin: 2 });
                        } else {
                          document.head.appendChild(script);
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Decoded TLV Data */}
              {selectedQR.decoded && (
                <div className="space-y-2 text-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase">TLV Decoded Data</h4>
                  {[
                    { tag: 1, label: "Seller", labelAr: "البائع", value: selectedQR.decoded.sellerName },
                    { tag: 2, label: "VAT Number", labelAr: "الرقم الضريبي", value: selectedQR.decoded.vatNumber },
                    { tag: 3, label: "Timestamp", labelAr: "الوقت", value: selectedQR.decoded.timestamp },
                    { tag: 4, label: "Total (SAR)", labelAr: "الإجمالي", value: selectedQR.decoded.invoiceTotal },
                    { tag: 5, label: "VAT (SAR)", labelAr: "الضريبة", value: selectedQR.decoded.vatTotal },
                  ].map(row => (
                    <div key={row.tag} className="flex items-center justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500 text-[10px]">Tag {row.tag}: {row.label} <span className="text-slate-300">({row.labelAr})</span></span>
                      <span className="font-mono font-medium text-slate-800 text-[11px]">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Download XML */}
              {selectedQR.inv.zatca_xml && (
                <button
                  onClick={() => {
                    const blob = new Blob([selectedQR.inv.zatca_xml], { type: "application/xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedQR.inv.ref || "invoice"}-zatca.xml`;
                    a.click();
                  }}
                  className="w-full py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Download UBL 2.1 XML
                </button>
              )}

              <p className="text-[10px] text-center text-slate-300">Phase 1 TLV QR + Phase 2 UBL XML Ready</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 p-5">
          <h3 className="font-bold text-emerald-800 text-sm mb-2">ZATCA Compliance Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-emerald-700">
            <div>
              <p className="font-semibold mb-1">Phase 1 — Generation ✅</p>
              <ul className="space-y-0.5 text-emerald-600">
                <li>• TLV-encoded QR codes (BR-KSA-27)</li>
                <li>• 5 mandatory fields: seller, VAT#, time, total, VAT</li>
                <li>• Arabic seller name included</li>
                <li>• Base64 encoded for QR rendering</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Phase 2 — Integration 🔄</p>
              <ul className="space-y-0.5 text-emerald-600">
                <li>• UBL 2.1 XML generation ✅</li>
                <li>• Cryptographic stamping (CSR/Certificate) — pending</li>
                <li>• ZATCA API integration (sandbox) — pending</li>
                <li>• Invoice clearance/reporting — pending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
