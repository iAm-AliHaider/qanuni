"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";

const TYPE_COLORS: Record<string, string> = { retainer: "bg-emerald-100 text-emerald-700", litigation: "bg-red-100 text-red-700", advisory: "bg-blue-100 text-blue-700", service: "bg-amber-100 text-amber-700", employment: "bg-violet-100 text-violet-700" };
const STATUS_COLORS: Record<string, string> = { draft: "bg-gray-100 text-gray-600", active: "bg-emerald-100 text-emerald-700", expired: "bg-red-100 text-red-700", terminated: "bg-slate-200 text-slate-600", renewed: "bg-blue-100 text-blue-700" };

export default function ContractsPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", title_ar: "", contract_type: "service", client_id: "", case_id: "", start_date: "", end_date: "", value: "", terms: "", obligations: "", renewal_type: "none" });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []));
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);
  const load = () => fetch("/api/contracts").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const contracts = data?.contracts || [];
  const stats = data?.stats || {};

  const create = async () => {
    await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, value: parseFloat(form.value) || 0, created_by: user?.id }) });
    setShowForm(false); setForm({ title: "", title_ar: "", contract_type: "service", client_id: "", case_id: "", start_date: "", end_date: "", value: "", terms: "", obligations: "", renewal_type: "none" }); load();
  };

  const sign = async (id: number, party: string) => {
    await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sign", id, party }) }); load();
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
        <div className="px-6 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-slate-900">Contract Management</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>New Contract</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 page-transition">
        {/* Mobile header */}
        <div className="flex items-center justify-between md:hidden"><h1 className="text-lg font-bold text-slate-900">Contracts</h1><button onClick={() => setShowForm(true)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold">+ New</button></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 stagger">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400 animate-slide-up card-hover"><p className="text-xl font-bold text-blue-600">{stats.total || 0}</p><p className="text-[10px] text-slate-400">Total</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400 animate-slide-up card-hover"><p className="text-xl font-bold text-emerald-600">{stats.active || 0}</p><p className="text-[10px] text-slate-400">Active</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-amber-400 animate-slide-up card-hover"><p className="text-xl font-bold text-amber-600">{Number(stats.active_value || 0).toLocaleString()}</p><p className="text-[10px] text-slate-400">Active Value (SAR)</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-red-400 animate-slide-up card-hover"><p className="text-xl font-bold text-red-600">{stats.expiring_soon || 0}</p><p className="text-[10px] text-slate-400">Expiring Soon</p></div>
        </div>

        <div className="space-y-2 stagger">
          {contracts.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 card-hover animate-slide-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400">{c.ref}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${TYPE_COLORS[c.contract_type] || "bg-gray-100 text-gray-500"}`}>{c.contract_type}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-slate-400">
                    {c.client_name && <span>Client: {c.client_name}</span>}
                    {c.case_ref && <span>Case: {c.case_ref}</span>}
                    {c.start_date && <span>{c.start_date} → {c.end_date || "Ongoing"}</span>}
                  </div>
                  {/* Signature status */}
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-semibold ${c.signed_by_firm ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>{c.signed_by_firm ? "Firm Signed" : "Firm Pending"}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-semibold ${c.signed_by_client ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>{c.signed_by_client ? "Client Signed" : "Client Pending"}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-bold text-slate-800">{Number(c.value).toLocaleString()} SAR</p>
                  <div className="flex flex-col gap-1 mt-2">
                    {!c.signed_by_firm && <button onClick={() => sign(c.id, "firm")} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold">Sign (Firm)</button>}
                    {!c.signed_by_client && <button onClick={() => sign(c.id, "client")} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-semibold">Sign (Client)</button>}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {contracts.length === 0 && <div className="text-center text-xs text-slate-400 py-12">No contracts</div>}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3 max-h-[90dvh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">New Contract</h3>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Contract title *" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.contract_type} onChange={e => setForm(p => ({ ...p, contract_type: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">{["service","retainer","litigation","advisory","employment"].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Client...</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Case...</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref}</option>)}</select>
              <input type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Value (SAR)" className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <textarea value={form.terms} onChange={e => setForm(p => ({ ...p, terms: e.target.value }))} placeholder="Terms & conditions" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none" rows={2} />
            <textarea value={form.obligations} onChange={e => setForm(p => ({ ...p, obligations: e.target.value }))} placeholder="Key obligations" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none" rows={2} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button><button onClick={create} disabled={!form.title} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Create</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
