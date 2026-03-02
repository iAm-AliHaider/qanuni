"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";

import { useState, useEffect, useRef } from "react";

const ACTIVITY_TYPES = [
  { value: "research", label: "Legal Research" },
  { value: "drafting", label: "Drafting" },
  { value: "court", label: "Court Appearance" },
  { value: "meeting", label: "Client Meeting" },
  { value: "review", label: "Document Review" },
  { value: "consultation", label: "Consultation" },
  { value: "negotiation", label: "Negotiation" },
  { value: "filing", label: "Court Filing" },
  { value: "admin", label: "Administrative" },
  { value: "general", label: "General" },
];

export default function TimePage() {
  const { t, locale, dir } = useLocale();
  const [user, setUser] = useState<any>(null);
  const userCanWrite = canWrite(user?.role || "admin", "time" as any);
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [cases, setCases] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ case_id: "", hours: "", description: "", activity_type: "research", is_billable: true, entry_date: new Date().toISOString().slice(0, 10) });

  // Timer state
  const [timing, setTiming] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerCase, setTimerCase] = useState("");
  const [timerDesc, setTimerDesc] = useState("");
  const timerRef = useRef<any>(null);

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/time?userId=${user.id}`).then(r => r.json()).then(d => {
      setEntries(d.entries || []);
      setStats(d.stats || {});
    });
  }, [user]);

  // Timer logic
  useEffect(() => {
    if (timing) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timing]);

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const stopTimer = async () => {
    setTiming(false);
    const hours = Math.round((timerSeconds / 3600) * 100) / 100;
    if (hours > 0 && timerCase) {
      await fetch("/api/time", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", case_id: timerCase, user_id: user.id, hours, rate: user.hourly_rate || 0, description: timerDesc || "Timed entry", activity_type: "general", is_billable: true, entry_date: new Date().toISOString().slice(0, 10) })
      });
      fetch(`/api/time?userId=${user.id}`).then(r => r.json()).then(d => { setEntries(d.entries || []); setStats(d.stats || {}); });
    }
    setTimerSeconds(0); setTimerDesc(""); setTimerCase("");
  };

  const submitEntry = async () => {
    if (!form.case_id || !form.hours) return;
    await fetch("/api/time", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", case_id: form.case_id, user_id: user.id, hours: parseFloat(form.hours), rate: user.hourly_rate || 0, description: form.description, activity_type: form.activity_type, is_billable: form.is_billable, entry_date: form.entry_date })
    });
    setShowForm(false);
    setForm({ case_id: "", hours: "", description: "", activity_type: "research", is_billable: true, entry_date: new Date().toISOString().slice(0, 10) });
    fetch(`/api/time?userId=${user.id}`).then(r => r.json()).then(d => { setEntries(d.entries || []); setStats(d.stats || {}); });
  };

  const deleteEntry = async (id: number) => {
    await fetch("/api/time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", id }) });
    fetch(`/api/time?userId=${user.id}`).then(r => r.json()).then(d => { setEntries(d.entries || []); setStats(d.stats || {}); });
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-sm text-slate-400">{t("common.login_required")}</div>;

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
            </a>
            <h1 className="text-lg font-bold text-slate-900">{t("time.title")}</h1>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>
            {t("time.log_time")}
          </button>
        </div>
      </header>

      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-3 md:space-y-4">
        {/* Timer */}
        <div className={`bg-white rounded-2xl border shadow-sm p-5 text-center ${timing ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200/80"}`}>
          <p className="text-3xl md:text-4xl font-mono font-bold text-slate-900 mb-3">{formatTimer(timerSeconds)}</p>
          {!timing ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <select value={timerCase} onChange={e => setTimerCase(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                  <option value="">{t("time.select_case")}</option>
                  {cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref} — {c.title?.slice(0, 30)}</option>)}
                </select>
                <input value={timerDesc} onChange={e => setTimerDesc(e.target.value)} placeholder={t("time.what_working")} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>
              <button onClick={() => { if (timerCase) setTiming(true); }} disabled={!timerCase} className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-40 shadow-lg shadow-emerald-500/20">
                {t("time.start_timer")}
              </button>
            </div>
          ) : (
            <button onClick={stopTimer} className="px-8 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 animate-pulse">
              {t("time.stop_save")}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-blue-400">
            <p className="text-2xl font-bold text-blue-600">{Number(stats.total_hours || 0).toFixed(1)}h</p>
            <p className="text-[10px] text-slate-400">{t("time.total_hours")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-emerald-400">
            <p className="text-2xl font-bold text-emerald-600">{Number(stats.billable_hours || 0).toFixed(1)}h</p>
            <p className="text-[10px] text-slate-400">{t("time.billable_hours")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-amber-400">
            <p className="text-2xl font-bold text-amber-600">{stats.total_hours > 0 ? Math.round((stats.billable_hours / stats.total_hours) * 100) : 0}%</p>
            <p className="text-[10px] text-slate-400">{t("time.utilization")}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-violet-400">
            <p className="text-2xl font-bold text-violet-600">{Number(stats.total_amount || 0).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">{t("time.revenue")}</p>
          </div>
        </div>

        {/* Entries */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">{t("time.recent_entries")}</h3></div>
          {entries.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">{t("time.no_entries")}</div> :
            <div className="divide-y divide-slate-50">
              {entries.map((te: any) => (
                <div key={te.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-400">{te.case_ref}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${te.is_billable ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{te.is_billable ? t("time.billable") : t("time.non_bill")}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-100 text-slate-500">{te.activity_type}</span>
                    </div>
                    <p className="text-xs text-slate-700">{te.description || te.case_title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{te.entry_date}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{te.hours}h</p>
                      {te.amount > 0 && <p className="text-[10px] text-emerald-600 font-medium">{Number(te.amount).toLocaleString()} SAR</p>}
                    </div>
                    <button onClick={() => deleteEntry(te.id)} className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>}
        </div>

        {/* Manual Entry Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-slate-900">{t("time.log_time_entry")}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t("time.case")} *</label>
                  <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    <option value="">{t("time.select_case")}</option>
                    {cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref} — {c.title?.slice(0, 40)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t("time.hours")} *</label>
                    <input type="number" step="0.25" min="0.25" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))} placeholder="1.5" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t("time.date")}</label>
                    <input type="date" value={form.entry_date} onChange={e => setForm(p => ({ ...p, entry_date: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t("time.activity_type")}</label>
                  <select value={form.activity_type} onChange={e => setForm(p => ({ ...p, activity_type: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">
                    {ACTIVITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-500 mb-1 block">{t("time.description")}</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What did you work on?" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" rows={2} />
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={form.is_billable} onChange={e => setForm(p => ({ ...p, is_billable: e.target.checked }))} className="rounded border-slate-300" />
                  <span className="text-xs text-slate-600">{t("time.billable")}</span>
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button>
                <button onClick={submitEntry} disabled={!form.case_id || !form.hours} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("time.save_entry")}</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div></AppShell>
  );
}
