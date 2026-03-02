"use client";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";

const TYPE_COLORS: Record<string, string> = { statement_of_claim: "bg-red-100 text-red-700", defense: "bg-blue-100 text-blue-700", evidence: "bg-amber-100 text-amber-700", petition: "bg-violet-100 text-violet-700", motion: "bg-teal-100 text-teal-700", appeal: "bg-orange-100 text-orange-700", response: "bg-pink-100 text-pink-700", execution: "bg-emerald-100 text-emerald-700" };
const STATUS_COLORS: Record<string, string> = { draft: "bg-gray-100 text-gray-600", pending: "bg-amber-100 text-amber-700", filed: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700", accepted: "bg-blue-100 text-blue-700" };
const FILING_TYPES = ["statement_of_claim", "defense", "evidence", "petition", "motion", "appeal", "response", "execution"];

export default function FilingsPage() {
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ case_id: "", filing_type: "statement_of_claim", title: "", court_id: "", najiz_ref: "", deadline_date: "", notes: "", response_required: false, response_deadline: "" });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
    fetch("/api/settings").then(r => r.json()).then(d => setCourts(d?.courts || [])).catch(() => {});
  }, []);
  const load = () => fetch("/api/filings").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const filings = data?.filings || [];
  const stats = data?.stats || {};
  const today = new Date().toISOString().slice(0, 10);

  const create = async () => {
    await fetch("/api/filings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, filed_by: user?.id }) });
    setShowForm(false); setForm({ case_id: "", filing_type: "statement_of_claim", title: "", court_id: "", najiz_ref: "", deadline_date: "", notes: "", response_required: false, response_deadline: "" }); load();
  };

  const markFiled = async (id: number) => {
    await fetch("/api/filings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status: "filed" }) }); load();
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
        <div className="px-6 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-slate-900">{t("fil.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>{t("fil.new_filing")}</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 page-transition">
        <div className="flex items-center justify-between md:hidden"><h1 className="text-lg font-bold text-slate-900">Filings</h1><button onClick={() => setShowForm(true)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold">+ New</button></div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 stagger">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400 animate-slide-up card-hover"><p className="text-xl font-bold text-blue-600">{stats.total || 0}</p><p className="text-[10px] text-slate-400">Total</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-amber-400 animate-slide-up card-hover"><p className="text-xl font-bold text-amber-600">{stats.pending || 0}</p><p className="text-[10px] text-slate-400">{t("common.pending")}</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400 animate-slide-up card-hover"><p className="text-xl font-bold text-emerald-600">{stats.filed || 0}</p><p className="text-[10px] text-slate-400">{t("fil.filed")}</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-violet-400 animate-slide-up card-hover"><p className="text-xl font-bold text-violet-600">{stats.responses_due || 0}</p><p className="text-[10px] text-slate-400">{t("fil.responses_due")}</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-red-400 animate-slide-up card-hover"><p className="text-xl font-bold text-red-600">{stats.overdue || 0}</p><p className="text-[10px] text-slate-400">{t("common.overdue")}</p></div>
        </div>

        <div className="space-y-2 stagger">
          {filings.map((f: any) => {
            const isOverdue = f.deadline_date && f.deadline_date < today && f.status !== "filed";
            return (
              <div key={f.id} className={`bg-white rounded-2xl border shadow-sm p-4 card-hover animate-slide-up ${isOverdue ? "border-red-200 bg-red-50/30" : "border-slate-200/80"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400">{f.ref}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${TYPE_COLORS[f.filing_type] || "bg-gray-100 text-gray-500"}`}>{f.filing_type?.replace(/_/g, " ")}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${STATUS_COLORS[f.status] || "bg-gray-100 text-gray-500"}`}>{f.status}</span>
                      {f.response_required === 1 && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-100 text-orange-700">{t("fil.response_required")}</span>}
                      {isOverdue && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-100 text-red-700 animate-pulse">{t("common.overdue")}</span>}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                      {f.case_ref && <span>Case: {f.case_ref}</span>}
                      {f.court_name && <span>Court: {f.court_name}</span>}
                      {f.najiz_ref && <span className="font-mono">Najiz: {f.najiz_ref}</span>}
                      {f.filer_name && <span>Filed by: {f.filer_name}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    {f.deadline_date && <p className={`text-xs font-bold ${isOverdue ? "text-red-600" : "text-amber-600"}`}>Due: {f.deadline_date}</p>}
                    {f.response_deadline && <p className="text-[10px] text-violet-600 mt-0.5">Response by: {f.response_deadline}</p>}
                    {f.status !== "filed" && <button onClick={() => markFiled(f.id)} className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold">{t("common.mark_filed")}</button>}
                  </div>
                </div>
              </div>
            );
          })}
          {filings.length === 0 && <div className="text-center text-xs text-slate-400 py-12">{t("fil.no_filings")}</div>}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3 max-h-[90dvh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">New Court Filing</h3>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={t("fil.filing_title") + " *"} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.filing_type} onChange={e => setForm(p => ({ ...p, filing_type: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">{FILING_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}</select>
              <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Case *</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref}</option>)}</select>
              <select value={form.court_id} onChange={e => setForm(p => ({ ...p, court_id: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Court...</option>{courts.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <input value={form.najiz_ref} onChange={e => setForm(p => ({ ...p, najiz_ref: e.target.value }))} placeholder={t("fil.najiz_ref")} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.deadline_date} onChange={e => setForm(p => ({ ...p, deadline_date: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.response_deadline} onChange={e => setForm(p => ({ ...p, response_deadline: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" placeholder={t("fil.response_deadline")} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.response_required} onChange={e => setForm(p => ({ ...p, response_required: e.target.checked }))} className="rounded" />{t("fil.response_opposing")}</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder={t("common.notes")} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none" rows={2} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.title || !form.case_id} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.create")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
