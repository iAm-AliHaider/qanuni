"use client";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("courts");
  const [showCourtForm, setShowCourtForm] = useState(false);
  const [courtForm, setCourtForm] = useState({ name: "", name_ar: "", court_type: "general", city: "" });

  useEffect(() => { fetch("/api/settings").then(r => r.json()).then(setData).catch(() => {}); }, []);

  const courts = data?.courts || [];
  const areas = data?.areas || [];
  const policies = data?.policies || [];
  const templates = data?.templates || [];
  const tabs = [{ key: "courts", label: "Courts" }, { key: "areas", label: "Practice Areas" }, { key: "policies", label: "Policies" }, { key: "templates", label: "Templates" }];

  const addCourt = async () => {
    await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_court", ...courtForm }) });
    setShowCourtForm(false); fetch("/api/settings").then(r => r.json()).then(setData);
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("set.title")}</h1></div>
        <div className="px-3 md:px-6 flex gap-1 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t.label}</button>)}
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-4">
        {tab === "courts" && <>
          <div className="flex justify-end"><button onClick={() => setShowCourtForm(true)} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold">{t("set.add_court")}</button></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">{courts.map((c: any) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-slate-800">{c.name}</p>{c.name_ar && <p className="text-xs text-slate-500">{c.name_ar}</p>}<p className="text-[10px] text-slate-400 capitalize">{c.court_type} · {c.city}</p></div>
              </div>
            ))}</div>
          </div>
          {showCourtForm && (
            <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowCourtForm(false)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900">Add Court</h3>
                <input value={courtForm.name} onChange={e => setCourtForm(p => ({ ...p, name: e.target.value }))} placeholder={t("set.court_name") + " *"} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <input value={courtForm.name_ar} onChange={e => setCourtForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="الاسم بالعربية" dir="rtl" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={courtForm.court_type} onChange={e => setCourtForm(p => ({ ...p, court_type: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{["general","criminal","commercial","labor","administrative","appeal","supreme"].map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input value={courtForm.city} onChange={e => setCourtForm(p => ({ ...p, city: e.target.value }))} placeholder={t("set.city")} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
                <div className="flex gap-2"><button onClick={() => setShowCourtForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={addCourt} disabled={!courtForm.name} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Add</button></div>
              </div>
            </div>
          )}
        </>}

        {tab === "areas" && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">{areas.map((a: any) => (
            <div key={a.id} className="px-4 py-3"><p className="text-sm font-semibold text-slate-800">{a.name}</p>{a.name_ar && <p className="text-xs text-slate-500">{a.name_ar}</p>}{a.head_name && <p className="text-[10px] text-slate-400">Head: {a.head_name}</p>}</div>
          ))}</div>
          {areas.length === 0 && <p className="text-center text-xs text-slate-400 py-8">{t("set.no_areas")}</p>}
        </div>}

        {tab === "policies" && <div className="space-y-2">{policies.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-sm font-bold text-slate-800 capitalize">{p.category?.replace("_", " ")}</p>
            <pre className="text-[10px] text-slate-500 mt-1 bg-slate-50 rounded-lg p-2 overflow-x-auto">{JSON.stringify(p.config, null, 2)}</pre>
          </div>
        ))}</div>}

        {tab === "templates" && <div className="space-y-2">{templates.map((t: any) => (
          <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1"><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${t.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{t.is_active ? "Active" : "Inactive"}</span><span className="text-[10px] text-slate-400 capitalize">{t.template_type} · {t.practice_area}</span></div>
            <p className="text-sm font-semibold text-slate-800">{t.name}</p>{t.name_ar && <p className="text-xs text-slate-500">{t.name_ar}</p>}
          </div>
        ))}{templates.length === 0 && <p className="text-center text-xs text-slate-400 py-8">{t("set.no_templates")}</p>}</div>}
      </main>
    </div></AppShell>
  );
}
