"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";

export default function TrustPage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [showDeposit, setShowDeposit] = useState<any>(null); // { account_id, type: 'deposit'|'withdrawal' }
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ client_id: "", case_id: "", currency: "SAR" });
  const [txForm, setTxForm] = useState({ amount: "", description: "", reference: "" });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []));
  }, []);
  const load = () => fetch("/api/trust").then(r => r.json()).then(setData).catch(() => {});
  useEffect(() => { load(); }, []);

  const accounts = data?.accounts || [];
  const transactions = data?.transactions || [];
  const stats = data?.stats || {};

  const createAccount = async () => {
    await fetch("/api/trust", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_account", ...form }) });
    setShowCreate(false); load();
  };

  const submitTx = async () => {
    await fetch("/api/trust", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: showDeposit.type, account_id: showDeposit.account_id, ...txForm, created_by: user?.id }) });
    setShowDeposit(null); setTxForm({ amount: "", description: "", reference: "" }); load();
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
        <div className="px-6 flex items-center justify-between h-14">
          <h1 className="text-lg font-bold text-slate-900">Trust Accounts</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>New Account</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 page-transition">
        <div className="flex items-center justify-between md:hidden"><h1 className="text-lg font-bold text-slate-900">Trust</h1><button onClick={() => setShowCreate(true)} className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold">+ New</button></div>

        <div className="grid grid-cols-3 gap-2 stagger">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400 animate-slide-up card-hover"><p className="text-xl font-bold text-blue-600">{stats.total_accounts || 0}</p><p className="text-[10px] text-slate-400">Accounts</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400 animate-slide-up card-hover"><p className="text-xl font-bold text-emerald-600">{Number(stats.total_balance || 0).toLocaleString()}</p><p className="text-[10px] text-slate-400">Total Balance (SAR)</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-violet-400 animate-slide-up card-hover"><p className="text-xl font-bold text-violet-600">{stats.active || 0}</p><p className="text-[10px] text-slate-400">Active</p></div>
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Client Trust Accounts</h3></div>
          <div className="divide-y divide-slate-50">
            {accounts.map((a: any) => (
              <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{a.client_name || "Unknown Client"}</p>
                  <div className="flex gap-3 text-[10px] text-slate-400">{a.case_ref && <span>Case: {a.case_ref}</span>}<span className={`font-bold ${a.status === "active" ? "text-emerald-600" : "text-slate-400"}`}>{a.status}</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{Number(a.balance).toLocaleString()} {a.currency}</p>
                  <button onClick={() => setShowDeposit({ account_id: a.id, type: "deposit" })} className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[9px] text-emerald-700 font-semibold">Deposit</button>
                  <button onClick={() => setShowDeposit({ account_id: a.id, type: "withdrawal" })} className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-[9px] text-red-700 font-semibold">Withdraw</button>
                </div>
              </div>
            ))}
            {accounts.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-400">No trust accounts</p>}
          </div>
        </div>

        {/* Recent transactions */}
        {transactions.length > 0 && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Recent Transactions</h3></div>
          <div className="divide-y divide-slate-50">
            {transactions.slice(0, 20).map((t: any) => (
              <div key={t.id} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.transaction_type === "deposit" ? "bg-emerald-500" : "bg-red-500"}`} />
                  <div><p className="text-xs text-slate-700">{t.description || t.transaction_type}</p><p className="text-[10px] text-slate-400">{t.client_name} · {t.created_at}</p></div>
                </div>
                <p className={`text-xs font-bold ${t.transaction_type === "deposit" ? "text-emerald-600" : "text-red-600"}`}>{t.transaction_type === "deposit" ? "+" : "-"}{Number(t.amount).toLocaleString()} SAR</p>
              </div>
            ))}
          </div>
        </div>}
      </main>

      {showCreate && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay flex items-end sm:items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">New Trust Account</h3>
            <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"><option value="">Select Client *</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <div className="flex gap-2"><button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button><button onClick={createAccount} disabled={!form.client_id} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">Create</button></div>
          </div>
        </div>
      )}

      {showDeposit && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay flex items-end sm:items-center justify-center z-50" onClick={() => setShowDeposit(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-3 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{showDeposit.type === "deposit" ? "Deposit" : "Withdrawal"}</h3>
            <input type="number" value={txForm.amount} onChange={e => setTxForm(p => ({ ...p, amount: e.target.value }))} placeholder="Amount (SAR) *" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={txForm.description} onChange={e => setTxForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <input value={txForm.reference} onChange={e => setTxForm(p => ({ ...p, reference: e.target.value }))} placeholder="Reference / receipt #" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            <div className="flex gap-2"><button onClick={() => setShowDeposit(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">Cancel</button><button onClick={submitTx} disabled={!txForm.amount} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 ${showDeposit.type === "deposit" ? "bg-emerald-500" : "bg-red-500"}`}>{showDeposit.type === "deposit" ? "Deposit" : "Withdraw"}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
