"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";

const TYPE_COLORS: Record<string, string> = { monthly: "bg-blue-100 text-blue-700", quarterly: "bg-violet-100 text-violet-700", annual: "bg-emerald-100 text-emerald-700", project: "bg-amber-100 text-amber-700" };
const STATUS_COLORS: Record<string, string> = { active: "bg-emerald-100 text-emerald-700", expired: "bg-red-100 text-red-700", cancelled: "bg-slate-200 text-slate-600", pending: "bg-amber-100 text-amber-700" };

export default function RetainersPage() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: "", agreement_type: "monthly", amount: "", start_date: "", end_date: "", billing_day: "1" });

  useEffect(() => { fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : [])); }, []);
  const load = () => fetch("/api/retainers").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const retainers = data?.retainers || [];
  const stats = data?.stats || {};

  const create = async () => {
    await fetch("/api/retainers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, amount: parseFloat(form.amount) || 0, billing_day: parseInt(form.billing_day) || 1 }) });
    setShowForm(false); setForm({ client_id: "", agreement_type: "monthly", amount: "", start_date: "", end_date: "", billing_day: "1" }); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "retainer" }); }
  };

  const cancel = async (id: number) => {
    await fetch("/api/retainers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status: "cancelled" }) }); load();
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
        <div className="px-6 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-slate-900">{t("ret.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>{t("ret.new_retainer")}</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-4 page-transition">
        <div className="flex items-center justify-between md:hidden"><h1 className="text-lg font-bold text-slate-900">Retainers</h1><button onClick={() => setShowForm(true)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold">+ New</button></div>

        <div className="grid grid-cols-3 gap-2 stagger">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400 animate-slide-up card-hover"><p className="text-xl font-bold text-blue-600">{stats.total || 0}</p><p className="text-[10px] text-slate-400">Total</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400 animate-slide-up card-hover"><p className="text-xl font-bold text-emerald-600">{stats.active || 0}</p><p className="text-[10px] text-slate-400">Active</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-amber-400 animate-slide-up card-hover"><p className="text-xl font-bold text-amber-600">{Number(stats.monthly_value || 0).toLocaleString()}</p><p className="text-[10px] text-slate-400">{t("ret.monthly_value")}</p></div>
        </div>

        <div className="space-y-2 stagger">
          {retainers.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 card-hover animate-slide-up">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${TYPE_COLORS[r.agreement_type] || "bg-gray-100 text-gray-500"}`}>{r.agreement_type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>{r.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{r.client_name || "Unknown"}</p>
                  <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                    {r.case_ref && <span>Case: {r.case_ref}</span>}
                    <span>{r.start_date} → {r.end_date || "Ongoing"}</span>
                    <span>Billing day: {r.billing_day}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{Number(r.amount).toLocaleString()} SAR</p>
                  <p className="text-[10px] text-slate-400">per {r.agreement_type === "monthly" ? "month" : r.agreement_type}</p>
                  {r.status === "active" && <button onClick={() => cancel(r.id)} className="mt-2 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-semibold">{t("common.cancel")}</button>}
                </div>
              </div>
            </div>
          ))}
          {retainers.length === 0 && <div className="text-center text-xs text-slate-400 py-12">{t("ret.no_retainers")}</div>}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">New Retainer</h3>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Select Client *</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.agreement_type} onChange={e => setForm(p => ({ ...p, agreement_type: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">{["monthly","quarterly","annual","project"].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount SAR *" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button><button onClick={create} disabled={!form.client_id || !form.amount} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.create")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
