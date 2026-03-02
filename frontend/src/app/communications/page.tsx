"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";
const TYPE_ICONS: Record<string, string> = { call: "bg-blue-100 text-blue-700", email: "bg-amber-100 text-amber-700", meeting: "bg-violet-100 text-violet-700", letter: "bg-emerald-100 text-emerald-700", sms: "bg-pink-100 text-pink-700" };

export default function CommunicationsPage() {
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const userCanWrite = canWrite(user?.role || "admin", "communications" as any);
  const [comms, setComms] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: "", case_id: "", comm_type: "call", subject: "", body: "", direction: "outbound" });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []));
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);

  const load = () => { fetch("/api/communications").then(r => r.json()).then(d => setComms(Array.isArray(d) ? d : [])).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch("/api/communications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, user_id: user?.id }) });
    setShowForm(false); setForm({ client_id: "", case_id: "", comm_type: "call", subject: "", body: "", direction: "outbound" }); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "communication" }); }
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("comm.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>Log</button></div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-2">
        {comms.map((c: any) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${TYPE_ICONS[c.comm_type] || "bg-gray-100 text-gray-500"}`}>{c.comm_type}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${c.direction === "inbound" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>{c.direction}</span>
              <span className="text-[10px] text-slate-400">{c.created_at}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{c.subject || "No subject"}</p>
            {c.body && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.body}</p>}
            <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
              {c.client_name && <span>Client: {c.client_name}</span>}
              {c.case_ref && <span>Case: {c.case_ref}</span>}
              {c.user_name && <span>By: {c.user_name}</span>}
            </div>
          </div>
        ))}
        {comms.length === 0 && <div className="text-center text-xs text-slate-400 py-12">{t("comm.no_comms")}</div>}
      </main>
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{t("comm.log_comm")}</h3>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.comm_type} onChange={e => setForm(p => ({ ...p, comm_type: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{["call","email","meeting","letter","sms"].map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select>
              <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">Client...</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">Case...</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref}</option>)}</select>
            </div>
            <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder={t("comm.subject")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder={t("comm.summary")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" rows={3} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.subject} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.save")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
