"use client";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";
const ROLE_LABELS: Record<string, string> = { managing_partner: "Managing Partner", senior_partner: "Senior Partner", partner: "Partner", senior_associate: "Senior Associate", associate: "Associate", paralegal: "Paralegal", legal_secretary: "Legal Secretary", finance: "Finance", admin: "Admin" };
const ROLE_COLORS: Record<string, string> = { managing_partner: "bg-amber-100 text-amber-700", senior_partner: "bg-violet-100 text-violet-700", partner: "bg-blue-100 text-blue-700", senior_associate: "bg-teal-100 text-teal-700", associate: "bg-emerald-100 text-emerald-700", paralegal: "bg-slate-100 text-slate-600", legal_secretary: "bg-pink-100 text-pink-700", finance: "bg-cyan-100 text-cyan-700", admin: "bg-red-100 text-red-700" };

export default function HRPage() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/hr").then(r => r.json()).then(setData).catch(() => {}); }, []);
  const lawyers = data?.lawyers || [];
  const byRole = data?.byRole || [];
  const byDept = data?.byDept || [];
  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("hr.title")}</h1></div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400"><p className="text-xl font-bold text-blue-600">{lawyers.length}</p><p className="text-[10px] text-slate-400">{t("hr.total_staff")}</p></div>
          {byRole.slice(0, 3).map((r: any) => (
            <div key={r.role} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3"><p className="text-xl font-bold text-slate-700">{r.count}</p><p className="text-[10px] text-slate-400 capitalize">{ROLE_LABELS[r.role] || r.role}s</p></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("hr.by_dept")}</h3>
            <div className="space-y-1">{byDept.map((d: any) => (
              <div key={d.department} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"><span className="text-xs text-slate-700">{d.department || "Unassigned"}</span><span className="text-xs font-bold text-slate-500">{d.count}</span></div>
            ))}</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">{t("hr.by_role")}</h3>
            <div className="space-y-1">{byRole.map((r: any) => (
              <div key={r.role} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${ROLE_COLORS[r.role] || "bg-gray-100 text-gray-500"}`}>{ROLE_LABELS[r.role] || r.role}</span><span className="text-xs font-bold text-slate-500">{r.count}</span></div>
            ))}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">{t("hr.directory")}</h3></div>
          <div className="divide-y divide-slate-50">{lawyers.map((l: any) => (
            <div key={l.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{l.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                <div><p className="text-sm font-semibold text-slate-800">{l.name}</p><div className="flex items-center gap-2 mt-0.5"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${ROLE_COLORS[l.role] || "bg-gray-100 text-gray-500"}`}>{ROLE_LABELS[l.role] || l.role}</span><span className="text-[10px] text-slate-400">{l.department}</span>{l.bar_number && <span className="text-[10px] text-slate-400 font-mono">{l.bar_number}</span>}</div></div>
              </div>
              <div className="text-right text-[10px] text-slate-400"><p>{l.case_count} cases</p><p>{Number(l.total_hours).toFixed(0)}h logged</p>{l.hourly_rate > 0 && <p className="text-emerald-600 font-medium">{l.hourly_rate} SAR/h</p>}</div>
            </div>
          ))}</div>
        </div>
      </main>
    </div></AppShell>
  );
}
