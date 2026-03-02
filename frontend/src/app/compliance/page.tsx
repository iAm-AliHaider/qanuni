"use client";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

export default function CompliancePage() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [checkName, setCheckName] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => { try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { fetch("/api/compliance").then(r => r.json()).then(setData).catch(() => {}); }, []);

  const runCheck = async () => {
    if (!checkName.trim()) return;
    setChecking(true);
    const res = await fetch("/api/compliance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "run_conflict_check", party_name: checkName, checked_by: user?.id }) });
    setCheckResult(await res.json());
    setChecking(false);
    fetch("/api/compliance").then(r => r.json()).then(setData).catch(() => {});
  };

  const conflicts = data?.conflicts || [];
  const pendingKyc = data?.pendingKyc || [];
  const highRisk = data?.highRisk || [];
  const expiringPoa = data?.expiringPoa || [];

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">Compliance & Risk</h1>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Conflict Check */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Conflict of Interest Check</h3>
          <div className="flex gap-2">
            <input value={checkName} onChange={e => setCheckName(e.target.value)} onKeyDown={e => e.key === "Enter" && runCheck()} placeholder="Enter party/client name to check..." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <button onClick={runCheck} disabled={!checkName.trim() || checking} className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-40">{checking ? "Checking..." : "Run Check"}</button>
          </div>
          {checkResult && (
            <div className={`mt-3 p-3 rounded-xl ${checkResult.hasConflict ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
              <p className={`text-sm font-bold ${checkResult.hasConflict ? "text-red-700" : "text-emerald-700"}`}>{checkResult.hasConflict ? `Conflict Found (${checkResult.matches?.length} matches)` : "No Conflicts Found"}</p>
              {checkResult.matches?.map((m: any, i: number) => (
                <div key={i} className="mt-2 text-xs text-red-600"><span className="font-mono">{m.ref}</span> — {m.title} (Client: {m.client_name}, Opposing: {m.opposing_party})</div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-amber-400"><p className="text-xl font-bold text-amber-600">{pendingKyc.length}</p><p className="text-[10px] text-slate-400">Pending KYC</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-red-400"><p className="text-xl font-bold text-red-600">{highRisk.length}</p><p className="text-[10px] text-slate-400">High Risk Clients</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400"><p className="text-xl font-bold text-blue-600">{conflicts.length}</p><p className="text-[10px] text-slate-400">Conflict Checks</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-violet-400"><p className="text-xl font-bold text-violet-600">{expiringPoa.length}</p><p className="text-[10px] text-slate-400">POAs Expiring</p></div>
        </div>

        {pendingKyc.length > 0 && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-amber-50"><h3 className="text-xs font-bold text-amber-800 uppercase">Pending KYC Verification</h3></div>
          <div className="divide-y divide-slate-50">{pendingKyc.map((c: any) => (
            <div key={c.id} className="px-4 py-3 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-800">{c.name}</p><p className="text-[10px] text-slate-400">{c.client_type} · {c.nationality}</p></div><a href="/" className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-700 font-semibold">Review</a></div>
          ))}</div>
        </div>}

        {highRisk.length > 0 && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-red-50"><h3 className="text-xs font-bold text-red-800 uppercase">High Risk Clients</h3></div>
          <div className="divide-y divide-slate-50">{highRisk.map((c: any) => (
            <div key={c.id} className="px-4 py-3"><p className="text-sm font-medium text-slate-800">{c.name}</p><p className="text-[10px] text-slate-400">{c.client_type} · {c.ref}</p></div>
          ))}</div>
        </div>}

        {conflicts.length > 0 && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100"><h3 className="text-xs font-bold text-slate-600 uppercase">Recent Conflict Checks</h3></div>
          <div className="divide-y divide-slate-50">{conflicts.map((c: any) => (
            <div key={c.id} className="px-4 py-3 flex items-center justify-between"><div><p className="text-sm font-medium text-slate-800">{c.checked_name}</p><p className="text-[10px] text-slate-400">{c.checked_at}</p></div><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.result === "clear" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{c.result === "clear" ? "Clear" : `${c.conflicts_found} conflicts`}</span></div>
          ))}</div>
        </div>}
      </main>
    </div></AppShell>
  );
}
