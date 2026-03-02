"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

const TYPE_COLORS: Record<string, string> = { judge: "bg-red-100 text-red-700", opposing_counsel: "bg-amber-100 text-amber-700", expert_witness: "bg-violet-100 text-violet-700", court_clerk: "bg-blue-100 text-blue-700", government: "bg-teal-100 text-teal-700", notary: "bg-emerald-100 text-emerald-700", other: "bg-gray-100 text-gray-500" };

export default function ContactsPage() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", name_ar: "", contact_type: "other", organization: "", phone: "", email: "", specialization: "", notes: "" });

  const load = () => {
    if (search) fetch(`/api/contacts?q=${encodeURIComponent(search)}`).then(r => r.json()).then(d => setData({ contacts: Array.isArray(d) ? d : [], judges: [] }));
    else if (filter !== "all") fetch(`/api/contacts?type=${filter}`).then(r => r.json()).then(d => setData({ contacts: Array.isArray(d) ? d : [], judges: [] }));
    else fetch("/api/contacts").then(r => r.json()).then(setData);
  };
  useEffect(() => { load(); }, [filter, search]);

  const contacts = data?.contacts || [];
  const judges = data?.judges || [];

  const create = async () => {
    await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form }) });
    setShowForm(false); setForm({ name: "", name_ar: "", contact_type: "other", organization: "", phone: "", email: "", specialization: "", notes: "" }); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "contact" }); }
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("contact.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>Add</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-3">
        <div className="relative"><svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("contact.search")} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm" /></div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {["all", "judge", "opposing_counsel", "expert_witness", "court_clerk", "government", "notary"].map(t => (
            <button key={t} onClick={() => { setFilter(t); setSearch(""); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize ${filter === t ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t.replace("_", " ")}</button>
          ))}
        </div>

        {filter === "all" && judges.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-red-50"><h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">Judges ({judges.length})</h3></div>
            <div className="divide-y divide-slate-50">{judges.map((j: any) => (
              <div key={j.id} className="px-4 py-3"><p className="text-sm font-semibold text-slate-800">{j.name}</p><p className="text-[10px] text-slate-400">{j.court_name} · {j.specialization || "General"}</p></div>
            ))}</div>
          </div>
        )}

        <div className="space-y-2">
          {contacts.map((c: any) => (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${TYPE_COLORS[c.contact_type] || TYPE_COLORS.other}`}>{c.contact_type?.replace("_", " ")}</span>
                {c.organization && <span className="text-[10px] text-slate-400">{c.organization}</span>}
              </div>
              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
              {c.name_ar && <p className="text-xs text-slate-500">{c.name_ar}</p>}
              <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                {c.phone && <span>{c.phone}</span>}
                {c.email && <span>{c.email}</span>}
                {c.specialization && <span>Specialization: {c.specialization}</span>}
              </div>
            </div>
          ))}
          {contacts.length === 0 && !judges.length && <div className="text-center text-xs text-slate-400 py-12">{t("contact.no_contacts")}</div>}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{t("contact.add")}</h3>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name *" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <input value={form.name_ar} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="الاسم بالعربية" dir="rtl" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <select value={form.contact_type} onChange={e => setForm(p => ({ ...p, contact_type: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{Object.keys(TYPE_COLORS).map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select>
              <input value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))} placeholder="Organization" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="Specialization" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.name} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.save")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
