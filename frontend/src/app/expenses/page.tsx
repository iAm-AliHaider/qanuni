"use client";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";
const CAT_COLORS: Record<string, string> = { filing_fees: "bg-blue-100 text-blue-700", travel: "bg-amber-100 text-amber-700", expert_fees: "bg-violet-100 text-violet-700", printing: "bg-slate-100 text-slate-600", courier: "bg-teal-100 text-teal-700", general: "bg-gray-100 text-gray-500" };

export default function ExpensesPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ case_id: "", category: "general", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), is_billable: true });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);
  const load = () => fetch("/api/expenses").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const expenses = data?.expenses || [];
  const stats = data?.stats || {};

  const create = async () => {
    await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, amount: parseFloat(form.amount), user_id: user?.id }) });
    setShowForm(false); setForm({ case_id: "", category: "general", description: "", amount: "", expense_date: new Date().toISOString().slice(0, 10), is_billable: true }); load();
  };

  const approve = async (id: number) => { await fetch("/api/expenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", id, approved_by: user?.id }) }); load(); };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">Expenses</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>Add</button></div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400"><p className="text-xl font-bold text-blue-600">{stats.total || 0}</p><p className="text-[10px] text-slate-400">Total</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400"><p className="text-xl font-bold text-emerald-600">{Number(stats.total_amount || 0).toLocaleString()}</p><p className="text-[10px] text-slate-400">SAR Total</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-amber-400"><p className="text-xl font-bold text-amber-600">{stats.pending || 0}</p><p className="text-[10px] text-slate-400">Pending</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-violet-400"><p className="text-xl font-bold text-violet-600">{stats.billable || 0}</p><p className="text-[10px] text-slate-400">Billable</p></div>
        </div>
        <div className="space-y-2">{expenses.map((e: any) => (
          <div key={e.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{e.ref}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${CAT_COLORS[e.category] || CAT_COLORS.general}`}>{e.category?.replace("_", " ")}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${e.status === "approved" ? "bg-emerald-100 text-emerald-700" : e.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{e.status}</span>
                  {e.is_billable === 1 && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-50 text-blue-600">Billable</span>}
                </div>
                <p className="text-sm font-semibold text-slate-900">{e.description}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">{e.user_name && <span>{e.user_name}</span>}{e.case_ref && <span>Case: {e.case_ref}</span>}<span>{e.expense_date}</span></div>
              </div>
              <div className="text-right"><p className="text-sm font-bold text-slate-800">{Number(e.amount).toLocaleString()} SAR</p>
                {e.status === "pending" && <button onClick={() => approve(e.id)} className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-700 font-semibold">Approve</button>}
              </div>
            </div>
          </div>
        ))}</div>
        {expenses.length === 0 && <div className="text-center text-xs text-slate-400 py-12">No expenses</div>}
      </main>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">Add Expense</h3>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description *" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount SAR *" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{["general","filing_fees","travel","expert_fees","printing","courier"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}</select>
              <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">Case...</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref}</option>)}</select>
              <input type="date" value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.is_billable} onChange={e => setForm(p => ({ ...p, is_billable: e.target.checked }))} className="rounded" />Billable to client</label>
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button><button onClick={create} disabled={!form.description || !form.amount} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Save</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
