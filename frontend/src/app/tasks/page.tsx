"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

const P_COLORS: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-500" };
const S_COLORS: Record<string, string> = { todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700", completed: "bg-emerald-100 text-emerald-700" };
const COLS = ["todo", "in_progress", "completed"];

export default function TasksPage() {
  const { t, locale, dir } = useLocale();
  const [user, setUser] = useState<any>(null);
  const userCanWrite = canWrite(user?.role || "admin", "tasks" as any);
  const [tasks, setTasks] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", case_id: "", priority: "medium", due_date: "", assigned_to: "", description: "", category: "general" });

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
    fetch("/api/auth").then(r => r.json()).then(setUsers);
  }, []);

  const load = () => fetch("/api/tasks").then(r => r.json()).then(d => setTasks(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id, status }) });
    load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "update", entityType: "task" }); }
  };

  const create = async () => {
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, assigned_by: user?.id }) });
    setShowForm(false); setForm({ title: "", case_id: "", priority: "medium", due_date: "", assigned_to: "", description: "", category: "general" }); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "task" }); }
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("task.board")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>{t("task.new_task")}</button>
        </div>
      </header>
       <main className="p-3 md:p-6">
         {/* Kanban */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           {COLS.map(col => (
             <div key={col} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
               <div className={`px-4 py-2.5 border-b border-slate-100 flex items-center justify-between ${col === "completed" ? "bg-emerald-50" : col === "in_progress" ? "bg-blue-50" : "bg-slate-50"}`}>
                 <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{t(`task.${col}_column`)}</h3>
                 <span className="text-[10px] font-bold bg-white rounded-full px-2 py-0.5 text-slate-500">{tasks.filter(t => t.status === col).length}</span>
               </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {tasks.filter(t => t.status === col).map(t => (
                  <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-all">
                     <div className="flex items-center gap-1.5 mb-1.5">
                       <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${P_COLORS[t.priority]}`}>{t(`task.priority_${t.priority}`)}</span>
                       {t.case_ref && <span className="text-[9px] font-mono text-slate-400">{t.case_ref}</span>}
                     </div>
                     <p className="text-xs font-semibold text-slate-800 mb-1">{t.title}</p>
                     <div className="flex items-center justify-between">
                       <span className="text-[10px] text-slate-400">{t.assignee_name}{t.due_date ? ` · ${t.due_date}` : ""}</span>
                       <div className="flex gap-1">
                         {col !== "completed" && <button onClick={() => updateStatus(t.id, col === "todo" ? "in_progress" : "completed")} className="px-2 py-0.5 rounded bg-emerald-50 text-[9px] text-emerald-700 font-semibold hover:bg-emerald-100">{col === "todo" ? t("task.start_button") : t("task.done_button")}</button>}
                         {col === "completed" && <button onClick={() => updateStatus(t.id, "todo")} className="px-2 py-0.5 rounded bg-slate-100 text-[9px] text-slate-500 font-semibold">{t("common.reopen")}</button>}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <h3 className="text-lg font-bold text-slate-900">{t("task.new_task_modal")}</h3>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={t("task.title") + " *"} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
               <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">{t("common.case")} ({t("common.optional")})</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref}</option>)}</select>
               <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{["critical","high","medium","low"].map(p => <option key={p} value={p}>{t(`task.priority_${p}`)}</option>)}</select>
              <select value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">Assign to...</option>{users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            </div>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t("common.description")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" rows={2} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.title} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.create")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
