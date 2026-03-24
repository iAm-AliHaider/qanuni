"use client";
import { useState, useEffect } from "react";
import { useLocale } from "@/lib/LocaleContext";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700", closed: "bg-slate-100 text-slate-500",
  intake: "bg-blue-50 text-blue-700", pending: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700", unpaid: "bg-red-50 text-red-700",
  partial: "bg-amber-50 text-amber-700", overdue: "bg-red-50 text-red-700",
};

export default function ClientPortal() {
  const { t, locale, dir } = useLocale();
  const [client, setClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "cases" | "invoices" | "hearings" | "documents">("overview");
  const [data, setData] = useState<any>(null);
  const [tabData, setTabData] = useState<any>(null);

  useEffect(() => {
    // Check if already logged in
    const saved = localStorage.getItem("qanuni_portal_client");
    if (saved) { const c = JSON.parse(saved); setClient(c); loadOverview(c.id); }
    // Load client list for login
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : d.clients || []));
  }, []);

  const login = async () => {
    setError("");
    const res = await fetch("/api/portal", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", clientId: selectedId, pin }),
    });
    const d = await res.json();
    if (d.success) { setClient(d.client); localStorage.setItem("qanuni_portal_client", JSON.stringify(d.client)); loadOverview(d.client.id); }
    else setError(d.error || "Login failed");
  };

  const loadOverview = async (id: number) => {
    const res = await fetch(`/api/portal?clientId=${id}`);
    setData(await res.json());
  };

  const loadTab = async (t: string) => {
    setTab(t as any);
    if (t === "overview") { loadOverview(client.id); return; }
    const res = await fetch(`/api/portal?clientId=${client.id}&action=${t}`);
    setTabData(await res.json());
  };

  const logout = () => { setClient(null); setData(null); localStorage.removeItem("qanuni_portal_client"); };

  // Login Page (no AppShell — standalone)
  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center p-4" dir={dir}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-black text-emerald-700">Q</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{t("portal.title")}</h1>
            <p className="text-sm text-slate-500">{t("portal.view_cases")}</p>
          </div>
          <div className="space-y-3">
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none">
              <option value="">{t("portal.select_account")}</option>
              {(clients || []).filter((c:any)=>c.is_active!==0).map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.name_ar ? ` — ${c.name_ar}` : ""}</option>)}
            </select>
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder={t("portal.enter_pin")} maxLength={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"/>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button onClick={login} disabled={!selectedId || pin.length < 4} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50">{t("portal.sign_in")}</button>
          </div>
          <p className="text-center text-[10px] text-slate-300">{t("footer.firm_name")} — {t("footer.powered_by")}</p>
        </div>
      </div>
    );
  }

  const overview = data?.overview;

  return (
    <div className="min-h-screen bg-slate-50" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><span className="font-black text-emerald-700">Q</span></div>
          <div>
            <p className="font-bold text-slate-900">{client.name}</p>
            {client.name_ar && <p className="text-[11px] text-slate-400" dir="rtl">{client.name_ar}</p>}
          </div>
        </div>
        <button onClick={logout} className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-600 hover:bg-slate-200">{t("portal.sign_out")}</button>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
         {/* Tabs */}
         <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200/80 shadow-sm overflow-x-auto">
{(["overview", "cases", "invoices", "hearings", "documents"] as const).map(tabKey => (
              <button key={tabKey} onClick={() => loadTab(tabKey)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${tab === tabKey ? "bg-emerald-500 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                {t(`portal.tab_${tabKey}`)}
              </button>
            ))}
         </div>

        {/* Overview */}
        {tab === "overview" && overview && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("portal.active_cases"), value: overview.cases?.active || 0, color: "emerald" },
                { label: t("portal.total_billed"), value: `SAR ${Number(overview.billing?.total || 0).toLocaleString()}`, color: "blue" },
                { label: t("portal.outstanding"), value: `SAR ${Number(overview.billing?.outstanding || 0).toLocaleString()}`, color: "amber" },
                { label: t("portal.paid"), value: `SAR ${Number(overview.billing?.paid || 0).toLocaleString()}`, color: "emerald" },
              ].map((kpi, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                  <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
                  <p className="text-[10px] text-slate-400">{kpi.label}</p>
                </div>
              ))}
            </div>
            {(overview.upcomingHearings || []).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">{t("portal.upcoming_hearings")}</h3>
                {overview.upcomingHearings.map((h: any, i: number) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-800">{h.title}</span>
                    <span className="text-sm text-emerald-600 font-mono">{h.hearing_date} — {h.hearing_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cases */}
        {tab === "cases" && tabData && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                <th className="px-4 py-2 text-left">{t("portal.ref")}</th>
                <th className="px-4 py-2 text-left">{t("portal.title_col")}</th>
                <th className="px-4 py-2 text-center">{t("portal.type")}</th>
                <th className="px-4 py-2 text-center">{t("portal.status")}</th>
              </tr></thead>
              <tbody>
                {(tabData.cases || []).map((c: any) => (
                  <tr key={c.id} className="border-t border-slate-50">
                    <td className="px-4 py-2.5 font-mono text-slate-800">{c.ref}</td>
                    <td className="px-4 py-2.5 text-slate-700">{c.title}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500 capitalize">{c.case_type}</td>
                    <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_COLORS[c.status] || "bg-slate-50 text-slate-500"}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(tabData.cases||[]).length && <div className="text-center py-10 text-slate-300">{t("portal.no_cases")}</div>}
          </div>
        )}

        {/* Invoices */}
        {tab === "invoices" && tabData && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                <th className="px-4 py-2 text-left">{t("portal.ref")}</th>
                <th className="px-4 py-2 text-left">{t("portal.date")}</th>
                <th className="px-4 py-2 text-center">{t("portal.status")}</th>
                <th className="px-4 py-2 text-right">{t("portal.amount_sar")}</th>
              </tr></thead>
              <tbody>
                {(tabData.invoices || []).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-slate-50">
                    <td className="px-4 py-2.5 font-mono text-slate-800">{inv.ref}</td>
                    <td className="px-4 py-2.5 text-slate-500">{inv.invoice_date}</td>
                    <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_COLORS[inv.payment_status] || "bg-slate-50"}`}>{inv.payment_status}</span></td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-600">{Number(inv.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(tabData.invoices||[]).length && <div className="text-center py-10 text-slate-300">{t("portal.no_invoices")}</div>}
          </div>
        )}

        {/* Hearings */}
        {tab === "hearings" && tabData && (
          <div className="space-y-3">
            {(tabData.hearings || []).length === 0 && <div className="text-center py-10 text-slate-300">{t("portal.no_hearings")}</div>}
            {(tabData.hearings || []).map((h: any) => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-900">{h.case_title}</p>
                  <p className="text-sm text-slate-500">{h.hearing_type} — {h.location || "TBD"}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-600">{h.hearing_date}</p>
                  <p className="text-xs text-slate-400">{h.hearing_time || "TBD"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {tab === "documents" && tabData && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                <th className="px-4 py-2 text-left">{t("portal.title_col")}</th>
                <th className="px-4 py-2 text-center">{t("portal.type")}</th>
                <th className="px-4 py-2 text-left">{t("portal.date")}</th>
              </tr></thead>
              <tbody>
                {(tabData.documents || []).map((d: any) => (
                  <tr key={d.id} className="border-t border-slate-50">
                    <td className="px-4 py-2.5 text-slate-700">{d.title}</td>
                    <td className="px-4 py-2.5 text-center capitalize text-slate-500">{d.doc_type}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px]">{new Date(d.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!(tabData.documents||[]).length && <div className="text-center py-10 text-slate-300">{t("portal.no_documents")}</div>}
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-[10px] text-slate-300">{t("footer.firm_name")} — {t("footer.powered_by")}</footer>
    </div>
  );
}
