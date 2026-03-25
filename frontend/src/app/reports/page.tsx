"use client";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

const ROLE_LABELS: Record<string, string> = { managing_partner: "Managing Partner", senior_partner: "Senior Partner", partner: "Partner", senior_associate: "Senior Associate", associate: "Associate" }; // TODO: Replace with t() calls if needed

export default function ReportsPage() {
  const { t, locale, dir } = useLocale();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("cases");
  useEffect(() => { fetch("/api/reports").then(r => r.json()).then(setData).catch(() => {}); }, []);
  if (!data) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" /></div>;

  const tabs = [{ key: "cases", label: t("rep.tab_cases") }, { key: "revenue", label: t("rep.tab_revenue") }, { key: "utilization", label: t("rep.tab_utilization") }, { key: "aging", label: t("rep.tab_aging") }];

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("rep.title")}</h1>
        </div>
        <div className="px-3 md:px-6 flex gap-1 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t.label}</button>)}
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4" id="report-content">
        {tab === "cases" && <>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.cases_by_status")}</h3>
            <div className="flex flex-wrap gap-2">{(data.casesByStatus || []).map((s: any) => (
              <div key={s.status} className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200"><span className="text-lg font-bold text-slate-800">{s.count}</span><span className="text-[10px] ml-1.5 text-slate-500 capitalize">{s.status}</span></div>
            ))}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.cases_by_type")}</h3>
            <div className="table-scroll"><table className="w-full text-xs"><thead><tr className="bg-slate-50 text-slate-500"><th className="px-3 py-2 text-left font-medium">{t("rep.table_type_header")}</th><th className="px-3 py-2 text-left font-medium">{t("rep.table_status_header")}</th><th className="px-3 py-2 text-right font-medium">{t("rep.table_count_header")}</th></tr></thead>
              <tbody>{(data.casesByType || []).map((r: any, i: number) => (
                <tr key={i} className="border-t border-slate-50"><td className="px-3 py-2 capitalize font-medium text-slate-700">{r.case_type?.replace("_", " ")}</td><td className="px-3 py-2 capitalize text-slate-500">{r.status}</td><td className="px-3 py-2 text-right font-bold">{r.count}</td></tr>
              ))}</tbody></table></div>
          </div>
        </>}

        {tab === "revenue" && <>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.revenue_lawyer")}</h3>
            <div className="space-y-2">{(data.revenueByLawyer || []).map((r: any) => (
              <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <div><p className="text-sm font-semibold text-slate-800">{r.name}</p><p className="text-[10px] text-slate-400">{r.hours}h logged</p></div>
                <p className="text-sm font-bold text-emerald-600">{Number(r.revenue).toLocaleString()} SAR</p>
              </div>
            ))}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.revenue_client")}</h3>
            <div className="space-y-2">{(data.revenueByClient || []).map((r: any) => (
              <div key={r.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                <div className="text-right"><p className="text-sm font-bold text-emerald-600">{Number(r.invoiced).toLocaleString()} SAR</p><p className="text-[10px] text-blue-600">Paid: {Number(r.paid).toLocaleString()}</p></div>
              </div>
            ))}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.monthly_revenue")}</h3>
            <div className="space-y-1">{(data.monthlyRevenue || []).map((m: any) => {
              const max = Math.max(...(data.monthlyRevenue || []).map((x: any) => Number(x.revenue)));
              const pct = max > 0 ? (Number(m.revenue) / max) * 100 : 0;
              return <div key={m.month} className="flex items-center gap-3"><span className="text-[10px] font-mono text-slate-400 w-16">{m.month}</span><div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} /></div><span className="text-xs font-bold text-slate-700 w-20 text-right">{Number(m.revenue).toLocaleString()}</span></div>;
            })}</div>
          </div>
        </>}

        {tab === "utilization" && <>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.lawyer_util")}</h3>
            <div className="space-y-3">{(data.utilizationByLawyer || []).map((u: any) => {
              const pct = Number(u.total) > 0 ? Math.round((Number(u.billable) / Number(u.total)) * 100) : 0;
              return <div key={u.name} className="p-3 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between mb-1"><div><p className="text-sm font-semibold text-slate-800">{u.name}</p><p className="text-[10px] text-slate-400">{ROLE_LABELS[u.role] || u.role}</p></div><span className={`text-lg font-bold ${pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600"}`}>{pct}%</span></div>
                <div className="flex items-center gap-2"><div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden"><div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} /></div><span className="text-[10px] text-slate-400">{u.billable}h / {u.total}h</span></div>
              </div>;
            })}</div>
          </div>
        </>}

        {tab === "aging" && <>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("rep.invoice_aging")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center"><p className="text-2xl font-bold text-emerald-600">{data.invoiceAging?.current || 0}</p><p className="text-[10px] text-emerald-700">{t("rep.current")}</p></div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center"><p className="text-2xl font-bold text-amber-600">{data.invoiceAging?.days_30 || 0}</p><p className="text-[10px] text-amber-700">{t("rep.30_days")}</p></div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center"><p className="text-2xl font-bold text-orange-600">{data.invoiceAging?.days_60 || 0}</p><p className="text-[10px] text-orange-700">{t("rep.60_days")}</p></div>
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center"><p className="text-2xl font-bold text-red-600">{data.invoiceAging?.days_90_plus || 0}</p><p className="text-[10px] text-red-700">{t("rep.90_plus")}</p></div>
            </div>
          </div>
        </>}
      </main>
    </div></AppShell>
  );
}
