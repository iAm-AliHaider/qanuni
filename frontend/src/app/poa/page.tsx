"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

export default function POAPage() {
  const { t, locale, dir } = useLocale();
  const [poas, setPoas] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_id: "", lawyer_id: "", poa_type: "general", scope: "", issue_date: new Date().toISOString().slice(0, 10), expiry_date: "", notary_ref: "" });

  useEffect(() => {
    fetch("/api/poa").then(r => r.json()).then(d => setPoas(Array.isArray(d) ? d : []));
    fetch("/api/clients").then(r => r.json()).then(d => setClients(Array.isArray(d) ? d : []));
    fetch("/api/auth").then(r => r.json()).then(setUsers);
  }, []);

  const load = () => fetch("/api/poa").then(r => r.json()).then(d => setPoas(Array.isArray(d) ? d : []));

  const create = async () => {
    await fetch("/api/poa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form }) });
    setShowForm(false); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "poa" }); }
  };

  const revoke = async (id: number) => {
    await fetch("/api/poa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "revoke", id }) });
    load();
  };

  const lawyers = users.filter((u: any) => ["managing_partner", "senior_partner", "partner", "senior_associate", "associate"].includes(u.role));

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("poa.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>{t("poa.new_poa")}</button></div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-3">
        {poas.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{p.ref}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{p.status}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-blue-100 text-blue-700 capitalize">{p.poa_type}</span>
                </div>
                 <p className="text-sm font-semibold text-slate-900">{t("poa.client_label")}: {p.client_name || "N/A"}</p>
                 <p className="text-xs text-slate-500">{t("poa.lawyer_label")}: {p.lawyer_name || "N/A"}</p>
                 <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                   <span>{t("poa.issued_label")}: {p.issue_date}</span>
                   {p.expiry_date && <span>{t("poa.expires_label")}: {p.expiry_date}</span>}
                   {p.notary_ref && <span>{t("poa.notary_label")}: {p.notary_ref}</span>}
                 </div>
                {p.scope && <p className="text-xs text-slate-600 mt-1">{p.scope}</p>}
              </div>
              {p.status === "active" && <button onClick={() => revoke(p.id)} className="px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-[10px] text-red-700 font-semibold">{t("common.revoke")}</button>}
            </div>
          </div>
        ))}
        {poas.length === 0 && <div className="text-center text-xs text-slate-400 py-12">{t("poa.no_poas")}</div>}
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{t("poa.new_poa")}</h3>
             <select value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">{t("poa.select_client_placeholder")} *</option>{clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
             <select value={form.lawyer_id} onChange={e => setForm(p => ({ ...p, lawyer_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">{t("poa.select_lawyer_placeholder")} *</option>{lawyers.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
             <div className="grid grid-cols-2 gap-2">
               <select value={form.poa_type} onChange={e => setForm(p => ({ ...p, poa_type: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="general">{t("poa.poa_type_general")}</option><option value="special">{t("poa.poa_type_special")}</option><option value="litigation">{t("poa.poa_type_litigation")}</option></select>
              <input value={form.notary_ref} onChange={e => setForm(p => ({ ...p, notary_ref: e.target.value }))} placeholder={t("poa.notary_ref")} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <input type="date" value={form.issue_date} onChange={e => setForm(p => ({ ...p, issue_date: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
               <input type="date" value={form.expiry_date} onChange={e => setForm(p => ({ ...p, expiry_date: e.target.value }))} placeholder={t("common.date")} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <textarea value={form.scope} onChange={e => setForm(p => ({ ...p, scope: e.target.value }))} placeholder={t("poa.scope")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" rows={2} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.client_id || !form.lawyer_id} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.create")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
