"use client";

import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface User {
  id: string; name: string; name_ar: string; role: string; department: string; bar_number?: string; hourly_rate?: number; isPartner: boolean; isAdmin?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner", senior_partner: "Senior Partner", partner: "Partner",
  senior_associate: "Senior Associate", associate: "Associate", paralegal: "Paralegal",
  legal_secretary: "Legal Secretary", finance: "Finance", admin: "Admin",
};

const CASE_TYPE_COLORS: Record<string, string> = {
  criminal: "bg-red-50 text-red-700 border-red-100", civil: "bg-blue-50 text-blue-700 border-blue-100",
  commercial: "bg-amber-50 text-amber-700 border-amber-100", family: "bg-pink-50 text-pink-700 border-pink-100",
  labor: "bg-teal-50 text-teal-700 border-teal-100", real_estate: "bg-violet-50 text-violet-700 border-violet-100",
  banking: "bg-indigo-50 text-indigo-700 border-indigo-100", insurance: "bg-cyan-50 text-cyan-700 border-cyan-100",
  ip: "bg-purple-50 text-purple-700 border-purple-100", administrative: "bg-slate-50 text-slate-700 border-slate-100",
  arbitration: "bg-orange-50 text-orange-700 border-orange-100",
};
const CASE_TYPES = Object.keys(CASE_TYPE_COLORS);

const PRIORITY_COLORS: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-500" };

const STATUS_COLORS: Record<string, string> = {
  intake: "bg-gray-100 text-gray-600", active: "bg-emerald-100 text-emerald-700", court: "bg-blue-100 text-blue-700",
  judgment: "bg-violet-100 text-violet-700", appeal: "bg-orange-100 text-orange-700", closed: "bg-gray-200 text-gray-500",
  archived: "bg-gray-100 text-gray-400", todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700", scheduled: "bg-blue-100 text-blue-700", pending: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
};
const CASE_STATUSES = ["intake", "active", "court", "judgment", "appeal", "closed", "archived"];

const FEE_TYPES: Record<string, string> = { hourly: "Hourly", flat_fee: "Flat Fee", contingency: "Contingency", retainer: "Retainer", pro_bono: "Pro Bono" };

// ═══════════════════════════════════════════════════════════════
// SVG ICONS
// ═══════════════════════════════════════════════════════════════
function ScalesIcon({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M3 7l9-4 9 4" /><path d="M3 7l3 5h-6z" /><path d="M21 7l-3 5h6z" /><circle cx="12" cy="21" r="1" /></svg>;
}
function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>; }
function BackIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>; }
function SearchIcon() { return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>; }
function EditIcon() { return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>; }
function XIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>; }
function LogoutIcon() { return <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>; }

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const Spinner = () => <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" /></div>;

const Badge = ({ text, colors }: { text: string; colors?: string }) => (
  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${colors || "bg-gray-100 text-gray-500"}`}>{text?.replace(/_/g, " ")}</span>
);

const Input = ({ label, ...props }: any) => (
  <div>
    {label && <label className="text-[10px] font-medium text-slate-500 mb-1 block">{label}</label>}
    <input className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none" {...props} />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div>
    {label && <label className="text-[10px] font-medium text-slate-500 mb-1 block">{label}</label>}
    <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none bg-white" {...props}>
      <option value="">Select...</option>
      {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, ...props }: any) => (
  <div>
    {label && <label className="text-[10px] font-medium text-slate-500 mb-1 block">{label}</label>}
    <textarea className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none resize-none" rows={3} {...props} />
  </div>
);

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch("/api/auth").then(r => r.json()).then(setUsers); }, []);

  const handleLogin = async () => {
    if (!selectedId || !pin) return;
    setLoading(true); setError("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedId, pin }) });
    if (!res.ok) { setError("Invalid PIN"); setLoading(false); return; }
    onLogin(await res.json());
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20">
            <ScalesIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qanuni</h1>
          <p className="text-sm text-slate-400 mt-1">قانوني — إدارة مكتب المحاماة</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Select User</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-emerald-200 outline-none">
              <option value="">Choose...</option>
              {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} — {ROLE_LABELS[u.role] || u.role}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">PIN</label>
            <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter 4-digit PIN" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-emerald-200 outline-none" />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button onClick={handleLogin} disabled={!selectedId || pin.length < 4 || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 transition-all shadow-lg">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-300 mt-6">Al-Rashid & Partners Law Firm</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CASE FORM (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function CaseForm({ caseData, clients, users, onSave, onCancel }: { caseData?: any; clients: any[]; users: any[]; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: caseData?.title || "", title_ar: caseData?.title_ar || "", case_type: caseData?.case_type || "",
    practice_area: caseData?.practice_area || "", status: caseData?.status || "intake", priority: caseData?.priority || "medium",
    client_id: caseData?.client_id || "", opposing_party: caseData?.opposing_party || "", opposing_counsel: caseData?.opposing_counsel || "",
    court: caseData?.court || "", judge: caseData?.judge || "", najiz_ref: caseData?.najiz_ref || "",
    case_value: caseData?.case_value || "", fee_type: caseData?.fee_type || "hourly", fee_amount: caseData?.fee_amount || "",
    description: caseData?.description || "", assigned_partner: caseData?.assigned_partner || "",
    assigned_associate: caseData?.assigned_associate || "", assigned_paralegal: caseData?.assigned_paralegal || "",
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  const partners = users.filter((u: any) => ["managing_partner", "senior_partner", "partner"].includes(u.role));
  const associates = users.filter((u: any) => ["senior_associate", "associate"].includes(u.role));
  const paralegals = users.filter((u: any) => u.role === "paralegal");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100"><BackIcon /></button>
          <h2 className="text-lg font-bold text-slate-900">{caseData ? "Edit Case" : "New Case"}</h2>
        </div>
        <button onClick={() => onSave(form)} disabled={!form.title || !form.case_type} className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40 transition-all">
          {caseData ? "Update" : "Create Case"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Case Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title *" value={form.title} onChange={(e: any) => set("title", e.target.value)} placeholder="Case title in English" />
          <Input label="Title (Arabic)" value={form.title_ar} onChange={(e: any) => set("title_ar", e.target.value)} placeholder="عنوان القضية" dir="rtl" />
          <Select label="Case Type *" value={form.case_type} onChange={(e: any) => set("case_type", e.target.value)} options={CASE_TYPES.map(t => ({ value: t, label: t.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) }))} />
          <Select label="Status" value={form.status} onChange={(e: any) => set("status", e.target.value)} options={CASE_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) }))} />
          <Select label="Priority" value={form.priority} onChange={(e: any) => set("priority", e.target.value)} options={["critical", "high", "medium", "low"].map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))} />
          <Select label="Client" value={form.client_id} onChange={(e: any) => set("client_id", e.target.value)} options={clients.map((c: any) => ({ value: c.id, label: `${c.name} (${c.ref})` }))} />
        </div>
        <TextArea label="Description" value={form.description} onChange={(e: any) => set("description", e.target.value)} placeholder="Case description and details..." />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opposing Side & Court</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Opposing Party" value={form.opposing_party} onChange={(e: any) => set("opposing_party", e.target.value)} />
          <Input label="Opposing Counsel" value={form.opposing_counsel} onChange={(e: any) => set("opposing_counsel", e.target.value)} />
          <Input label="Court" value={form.court} onChange={(e: any) => set("court", e.target.value)} />
          <Input label="Judge" value={form.judge} onChange={(e: any) => set("judge", e.target.value)} />
          <Input label="Najiz Reference" value={form.najiz_ref} onChange={(e: any) => set("najiz_ref", e.target.value)} placeholder="MOJ case reference" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team & Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Lead Partner" value={form.assigned_partner} onChange={(e: any) => set("assigned_partner", e.target.value)} options={partners.map((u: any) => ({ value: u.id, label: u.name }))} />
          <Select label="Associate" value={form.assigned_associate} onChange={(e: any) => set("assigned_associate", e.target.value)} options={associates.map((u: any) => ({ value: u.id, label: u.name }))} />
          <Select label="Paralegal" value={form.assigned_paralegal} onChange={(e: any) => set("assigned_paralegal", e.target.value)} options={paralegals.map((u: any) => ({ value: u.id, label: u.name }))} />
          <Select label="Fee Type" value={form.fee_type} onChange={(e: any) => set("fee_type", e.target.value)} options={Object.entries(FEE_TYPES).map(([v, l]) => ({ value: v, label: l }))} />
          <Input label="Fee Amount (SAR)" type="number" value={form.fee_amount} onChange={(e: any) => set("fee_amount", e.target.value)} />
          <Input label="Case Value (SAR)" type="number" value={form.case_value} onChange={(e: any) => set("case_value", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CASE DETAIL VIEW
// ═══════════════════════════════════════════════════════════════
function CaseDetail({ caseId, user, onBack, onEdit }: { caseId: number; user: User; onBack: () => void; onEdit: (c: any) => void }) {
  const [cs, setCs] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => { fetch(`/api/cases?id=${caseId}`).then(r => r.json()).then(setCs); }, [caseId]);
  useEffect(() => { load(); }, [load]);

  if (!cs) return <Spinner />;

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add_note", case_id: caseId, content: noteText, created_by: user.id }) });
    setNoteText(""); setSaving(false); load();
  };

  const updateStatus = async (status: string) => {
    await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", id: caseId, status }) });
    load();
  };

  const updateTask = async (taskId: number, status: string) => {
    await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_task", id: taskId, status }) });
    load();
  };

  const tabs = [
    { key: "overview", label: "Overview" }, { key: "hearings", label: `Hearings (${cs.hearings?.length || 0})` },
    { key: "tasks", label: `Tasks (${cs.tasks?.length || 0})` }, { key: "notes", label: `Notes (${cs.notes?.length || 0})` },
    { key: "time", label: `Time (${cs.timeEntries?.length || 0})` }, { key: "documents", label: `Docs (${cs.documents?.length || 0})` },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100"><BackIcon /></button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{cs.ref}</span>
                <Badge text={cs.case_type} colors={CASE_TYPE_COLORS[cs.case_type]} />
                <Badge text={cs.status} colors={STATUS_COLORS[cs.status]} />
                <Badge text={cs.priority} colors={PRIORITY_COLORS[cs.priority]} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{cs.title}</h2>
              {cs.title_ar && <p className="text-sm text-slate-500 mt-0.5">{cs.title_ar}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(cs)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"><EditIcon /> Edit</button>
            <select value={cs.status} onChange={e => updateStatus(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
              {CASE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ").toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          {cs.client_name && <div><span className="text-slate-400">Client</span><p className="font-medium text-slate-700">{cs.client_name}</p></div>}
          {cs.opposing_party && <div><span className="text-slate-400">Opposing Party</span><p className="font-medium text-slate-700">{cs.opposing_party}</p></div>}
          {cs.court && <div><span className="text-slate-400">Court</span><p className="font-medium text-slate-700">{cs.court}</p></div>}
          {cs.judge && <div><span className="text-slate-400">Judge</span><p className="font-medium text-slate-700">{cs.judge}</p></div>}
          {cs.partner_name && <div><span className="text-slate-400">Partner</span><p className="font-medium text-slate-700">{cs.partner_name}</p></div>}
          {cs.associate_name && <div><span className="text-slate-400">Associate</span><p className="font-medium text-slate-700">{cs.associate_name}</p></div>}
          {cs.fee_type && <div><span className="text-slate-400">Fee</span><p className="font-medium text-slate-700">{FEE_TYPES[cs.fee_type]} {cs.fee_amount > 0 ? `- ${Number(cs.fee_amount).toLocaleString()} SAR` : ""}</p></div>}
          {cs.case_value > 0 && <div><span className="text-slate-400">Case Value</span><p className="font-bold text-emerald-600">{Number(cs.case_value).toLocaleString()} SAR</p></div>}
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && cs.description && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{cs.description}</p>
        </div>
      )}

      {tab === "hearings" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Hearings</h3></div>
          {cs.hearings?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No hearings scheduled</div> :
            <div className="divide-y divide-slate-50">
              {(cs.hearings||[]).map((h: any) => (
                <div key={h.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{h.hearing_type}</p>
                    <p className="text-[10px] text-slate-400">{h.court_name} {h.judge_name ? `· ${h.judge_name}` : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-600">{h.hearing_date}</p>
                    <p className="text-[10px] text-slate-400">{h.hearing_time}</p>
                    <Badge text={h.status} colors={STATUS_COLORS[h.status]} />
                  </div>
                </div>
              ))}
            </div>}
        </div>
      )}

      {tab === "tasks" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Tasks</h3></div>
          {cs.tasks?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No tasks</div> :
            <div className="divide-y divide-slate-50">
              {(cs.tasks||[]).map((t: any) => (
                <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={t.status === "completed"} onChange={() => updateTask(t.id, t.status === "completed" ? "todo" : "completed")} className="rounded border-slate-300" />
                    <div>
                      <p className={`text-xs font-medium ${t.status === "completed" ? "line-through text-slate-400" : "text-slate-800"}`}>{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.assignee_name} {t.due_date ? `· Due: ${t.due_date}` : ""}</p>
                    </div>
                  </div>
                  <Badge text={t.priority} colors={PRIORITY_COLORS[t.priority]} />
                </div>
              ))}
            </div>}
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-emerald-200 outline-none" rows={3} />
            <div className="flex justify-end mt-2">
              <button onClick={addNote} disabled={!noteText.trim() || saving} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40">{saving ? "Saving..." : "Add Note"}</button>
            </div>
          </div>
          {(cs.notes||[]).map((n: any) => (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-medium text-slate-500">{n.author_name || "Unknown"}</span>
                <span className="text-[10px] text-slate-400">{n.created_at}</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.note}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "time" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Time Entries</h3></div>
          {cs.timeEntries?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No time entries</div> :
            <table className="w-full text-xs">
              <thead><tr className="bg-slate-50 text-slate-500"><th className="px-4 py-2 text-left font-medium">Date</th><th className="px-4 py-2 text-left font-medium">Lawyer</th><th className="px-4 py-2 text-left font-medium">Description</th><th className="px-4 py-2 text-right font-medium">Hours</th><th className="px-4 py-2 text-right font-medium">Amount</th></tr></thead>
              <tbody>{(cs.timeEntries||[]).map((te: any) => (
                <tr key={te.id} className="border-t border-slate-50"><td className="px-4 py-2 text-slate-500">{te.entry_date}</td><td className="px-4 py-2 text-slate-700">{te.user_name}</td><td className="px-4 py-2 text-slate-600">{te.description}</td><td className="px-4 py-2 text-right font-bold">{te.hours}h</td><td className="px-4 py-2 text-right font-bold text-emerald-600">{Number(te.amount).toLocaleString()} SAR</td></tr>
              ))}</tbody>
            </table>}
        </div>
      )}

      {tab === "documents" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Documents</h3></div>
          {cs.documents?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No documents</div> :
            <div className="divide-y divide-slate-50">
              {(cs.documents||[]).map((d: any) => (
                <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                  <div><p className="text-xs font-medium text-slate-800">{d.title}</p><p className="text-[10px] text-slate-400">{d.doc_type} · {d.created_by_name} · {d.created_at}</p></div>
                </div>
              ))}
            </div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENT FORM (Create / Edit)
// ═══════════════════════════════════════════════════════════════
function ClientForm({ clientData, onSave, onCancel }: { clientData?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: clientData?.name || "", name_ar: clientData?.name_ar || "", client_type: clientData?.client_type || "individual",
    email: clientData?.email || "", phone: clientData?.phone || "", phone2: clientData?.phone2 || "",
    address: clientData?.address || "", address_ar: clientData?.address_ar || "",
    national_id: clientData?.national_id || "", cr_number: clientData?.cr_number || "", vat_number: clientData?.vat_number || "",
    nationality: clientData?.nationality || "Saudi", risk_level: clientData?.risk_level || "low",
    notes: clientData?.notes || "", tags: clientData?.tags || "",
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-slate-100"><BackIcon /></button>
          <h2 className="text-lg font-bold text-slate-900">{clientData ? "Edit Client" : "New Client"}</h2>
        </div>
        <button onClick={() => onSave(form)} disabled={!form.name} className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-40">
          {clientData ? "Update" : "Create Client"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={(e: any) => set("name", e.target.value)} />
          <Input label="Name (Arabic)" value={form.name_ar} onChange={(e: any) => set("name_ar", e.target.value)} dir="rtl" />
          <Select label="Type" value={form.client_type} onChange={(e: any) => set("client_type", e.target.value)} options={[{ value: "individual", label: "Individual" }, { value: "corporate", label: "Corporate" }, { value: "government", label: "Government" }]} />
          <Input label="Nationality" value={form.nationality} onChange={(e: any) => set("nationality", e.target.value)} />
          <Input label="Email" type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e: any) => set("phone", e.target.value)} />
          <Input label="Phone 2" value={form.phone2} onChange={(e: any) => set("phone2", e.target.value)} />
          <Select label="Risk Level" value={form.risk_level} onChange={(e: any) => set("risk_level", e.target.value)} options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identity & Tax</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label={form.client_type === "corporate" ? "CR Number" : "National ID"} value={form.client_type === "corporate" ? form.cr_number : form.national_id} onChange={(e: any) => set(form.client_type === "corporate" ? "cr_number" : "national_id", e.target.value)} />
          <Input label="VAT Number" value={form.vat_number} onChange={(e: any) => set("vat_number", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Address" value={form.address} onChange={(e: any) => set("address", e.target.value)} />
          <Input label="Address (Arabic)" value={form.address_ar} onChange={(e: any) => set("address_ar", e.target.value)} dir="rtl" />
        </div>
        <TextArea label="Notes" value={form.notes} onChange={(e: any) => set("notes", e.target.value)} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENT DETAIL VIEW
// ═══════════════════════════════════════════════════════════════
function ClientDetail({ clientId, user, onBack, onEdit, onOpenCase }: { clientId: number; user: User; onBack: () => void; onEdit: (c: any) => void; onOpenCase: (id: number) => void }) {
  const [cl, setCl] = useState<any>(null);
  const [tab, setTab] = useState("overview");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", name_ar: "", role: "", phone: "", email: "", is_primary: false });

  const load = useCallback(() => { fetch(`/api/clients?id=${clientId}`).then(r => r.json()).then(setCl); }, [clientId]);
  useEffect(() => { load(); }, [load]);

  if (!cl) return <Spinner />;

  const updateKyc = async (status: string) => {
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_kyc", id: clientId, kyc_status: status, verified_by: user.id }) });
    load();
  };

  const addContact = async () => {
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add_contact", client_id: clientId, ...contactForm }) });
    setShowContactForm(false); setContactForm({ name: "", name_ar: "", role: "", phone: "", email: "", is_primary: false }); load();
  };

  const deleteContact = async (id: number) => {
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_contact", id }) });
    load();
  };

  const tabs = [
    { key: "overview", label: "Overview" }, { key: "cases", label: `Cases (${cl.cases?.length || 0})` },
     { key: "financial", label: "Financial" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100"><BackIcon /></button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{cl.ref}</span>
                <Badge text={cl.client_type} colors={cl.client_type === "corporate" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"} />
                <Badge text={cl.kyc_status} colors={STATUS_COLORS[cl.kyc_status]} />
                {cl.risk_level !== "low" && <Badge text={`Risk: ${cl.risk_level}`} colors={cl.risk_level === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"} />}
              </div>
              <h2 className="text-lg font-bold text-slate-900">{cl.name}</h2>
              {cl.name_ar && <p className="text-sm text-slate-500">{cl.name_ar}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(cl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"><EditIcon /> Edit</button>
            {cl.kyc_status !== "verified" && (
              <button onClick={() => updateKyc("verified")} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold hover:bg-emerald-100">Verify KYC</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          {cl.phone && <div><span className="text-slate-400">Phone</span><p className="font-medium text-slate-700">{cl.phone}</p></div>}
          {cl.email && <div><span className="text-slate-400">Email</span><p className="font-medium text-slate-700">{cl.email}</p></div>}
          {cl.national_id && <div><span className="text-slate-400">National ID</span><p className="font-medium text-slate-700">{cl.national_id}</p></div>}
          {cl.cr_number && <div><span className="text-slate-400">CR Number</span><p className="font-medium text-slate-700">{cl.cr_number}</p></div>}
          {cl.vat_number && <div><span className="text-slate-400">VAT</span><p className="font-medium text-slate-700">{cl.vat_number}</p></div>}
          {cl.nationality && <div><span className="text-slate-400">Nationality</span><p className="font-medium text-slate-700">{cl.nationality}</p></div>}
          <div><span className="text-slate-400">Total Billed</span><p className="font-bold text-emerald-600">{Number(cl.totalBilled).toLocaleString()} SAR</p></div>
          <div><span className="text-slate-400">Total Paid</span><p className="font-bold text-blue-600">{Number(cl.totalPaid).toLocaleString()} SAR</p></div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${tab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-emerald-400">
            <p className="text-2xl font-bold text-emerald-600">{cl.cases?.length || 0}</p>
            <p className="text-[10px] text-slate-400">Total Cases</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-blue-400">
            <p className="text-2xl font-bold text-blue-600">{Number(cl.totalBilled).toLocaleString()}</p>
            <p className="text-[10px] text-slate-400">Total Billed (SAR)</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-violet-400">
            <p className="text-2xl font-bold text-violet-600">{cl.contacts?.length || 0}</p>
            <p className="text-[10px] text-slate-400">Contacts</p>
          </div>
          {cl.address && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:col-span-3"><h3 className="text-xs font-bold text-slate-500 mb-1">Address</h3><p className="text-sm text-slate-700">{cl.address}</p></div>}
          {cl.notes && <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:col-span-3"><h3 className="text-xs font-bold text-slate-500 mb-1">Notes</h3><p className="text-sm text-slate-700 whitespace-pre-wrap">{cl.notes}</p></div>}
        </div>
      )}

      {tab === "cases" && (
        <div className="space-y-3">
          {(cl.cases||[]).map((c: any) => (
            <div key={c.id} onClick={() => onOpenCase(c.id)} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md cursor-pointer transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-400">{c.ref}</span>
                <Badge text={c.case_type} colors={CASE_TYPE_COLORS[c.case_type]} />
                <Badge text={c.status} colors={STATUS_COLORS[c.status]} />
                <Badge text={c.priority} colors={PRIORITY_COLORS[c.priority]} />
              </div>
              <p className="text-sm font-semibold text-slate-900">{c.title}</p>
              {c.partner_name && <p className="text-[10px] text-slate-400 mt-1">Partner: {c.partner_name}</p>}
            </div>
          ))}
          {(!cl.cases || cl.cases.length === 0) && <div className="text-center text-xs text-slate-400 py-8">No cases for this client</div>}
        </div>
      )}

      {tab === "contacts" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button onClick={() => setShowContactForm(!showContactForm)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><PlusIcon /> Add Contact</button>
          </div>
          {showContactForm && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Input label="Name" value={contactForm.name} onChange={(e: any) => setContactForm(p => ({ ...p, name: e.target.value }))} />
                <Input label="Role" value={contactForm.role} onChange={(e: any) => setContactForm(p => ({ ...p, role: e.target.value }))} placeholder="e.g. CEO, Legal Rep" />
                <Input label="Phone" value={contactForm.phone} onChange={(e: any) => setContactForm(p => ({ ...p, phone: e.target.value }))} />
                <Input label="Email" value={contactForm.email} onChange={(e: any) => setContactForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowContactForm(false)} className="px-3 py-1.5 rounded-lg text-xs text-slate-500">Cancel</button>
                <button onClick={addContact} disabled={!contactForm.name} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40">Save</button>
              </div>
            </div>
          )}
          {cl.contacts?.map((ct: any) => (
            <div key={ct.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{ct.name}</p>
                  {ct.is_primary === 1 && <Badge text="Primary" colors="bg-emerald-100 text-emerald-700" />}
                  {ct.role && <span className="text-[10px] text-slate-400">({ct.role})</span>}
                </div>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                  {ct.phone && <span>{ct.phone}</span>}
                  {ct.email && <span>{ct.email}</span>}
                </div>
              </div>
              <button onClick={() => deleteContact(ct.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><XIcon /></button>
            </div>
          ))}
        </div>
      )}

      {tab === "financial" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Invoices</h3></div>
            {cl.invoices?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No invoices</div> :
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-4 py-2 text-left font-medium">Ref</th><th className="px-4 py-2 text-left font-medium">Date</th><th className="px-4 py-2 text-left font-medium">Status</th><th className="px-4 py-2 text-right font-medium">Amount</th></tr></thead>
                <tbody>{(cl.invoices||[]).map((inv: any) => (
                  <tr key={inv.id} className="border-t border-slate-50"><td className="px-4 py-2 font-mono">{inv.ref}</td><td className="px-4 py-2">{inv.invoice_date}</td><td className="px-4 py-2"><Badge text={inv.status} colors={STATUS_COLORS[inv.status]} /></td><td className="px-4 py-2 text-right font-bold text-emerald-600">{Number(inv.total).toLocaleString()} SAR</td></tr>
                ))}</tbody>
              </table>}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Retainers</h3></div>
            {cl.retainers?.length === 0 ? <div className="p-6 text-center text-xs text-slate-400">No retainers</div> :
              <div className="divide-y divide-slate-50">{(cl.retainers||[]).map((r: any) => (
                <div key={r.id} className="px-4 py-3 flex justify-between"><div><p className="text-xs font-medium text-slate-800">{r.start_date} — {r.end_date || "Ongoing"}</p><p className="text-[10px] text-slate-400">Type: {r.agreement_type}</p></div><p className="text-sm font-bold text-emerald-600">{Number(r.amount).toLocaleString()} SAR</p></div>
              ))}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQ, setSearchQ] = useState("");
  // Detail views
  const [viewCase, setViewCase] = useState<number | null>(null);
  const [viewClient, setViewClient] = useState<number | null>(null);
  // Forms
  const [showCaseForm, setShowCaseForm] = useState<any>(null); // null=hidden, {}=create, {id:...}=edit
  const [showClientForm, setShowClientForm] = useState<any>(null);
  // Reference data
  const [allClients, setAllClients] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth").then(r => r.json()).then(setAllUsers);
    fetch("/api/clients").then(r => r.json()).then(d => setAllClients(Array.isArray(d) ? d : [])).catch(() => setAllClients([]));
  }, []);

  const loadTab = useCallback(() => {
    if (viewCase || viewClient || showCaseForm || showClientForm) return;
    const url = activeTab === "overview"
      ? `/api/dashboard?section=overview&userId=${user.id}`
      : activeTab === "cases"
      ? `/api/cases${searchQ ? `?q=${encodeURIComponent(searchQ)}` : ""}`
      : activeTab === "clients"
      ? `/api/clients${searchQ ? `?q=${encodeURIComponent(searchQ)}` : ""}`
      : `/api/dashboard?section=${activeTab}&userId=${user.id}`;
    setData(null);
    fetch(url).then(r => r.json()).then(setData);
  }, [activeTab, user.id, searchQ, viewCase, viewClient, showCaseForm, showClientForm]);

  useEffect(() => { loadTab(); }, [loadTab]);

  // Case CRUD handlers
  const saveCase = async (form: any) => {
    const isEdit = showCaseForm?.id;
    await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: isEdit ? "update" : "create", ...(isEdit ? { id: showCaseForm.id } : {}), ...form, created_by: user.id }) });
    setShowCaseForm(null);
    fetch("/api/clients").then(r => r.json()).then(d => setAllClients(Array.isArray(d) ? d : [])).catch(() => setAllClients([]));
    loadTab();
  };

  const saveClient = async (form: any) => {
    const isEdit = showClientForm?.id;
    await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: isEdit ? "update" : "create", ...(isEdit ? { id: showClientForm.id } : {}), ...form, created_by: user.id }) });
    setShowClientForm(null);
    fetch("/api/clients").then(r => r.json()).then(d => setAllClients(Array.isArray(d) ? d : [])).catch(() => setAllClients([]));
    loadTab();
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: "O" },
    { key: "cases", label: "Cases", icon: "C" },
    { key: "clients", label: "Clients", icon: "P" },
    { key: "hearings", label: "Hearings", icon: "H" },
    { key: "tasks", label: "Tasks", icon: "T" },
    { key: "time_entries", label: "Time", icon: "E" },
    { key: "deadlines", label: "Deadlines", icon: "D" },
  ];

  // Render detail views / forms
  if (viewCase) return (
    <div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-7xl mx-auto">
      <CaseDetail caseId={viewCase} user={user} onBack={() => setViewCase(null)} onEdit={(c) => { setViewCase(null); setShowCaseForm(c); }} />
    </div>
  );

  if (viewClient) return (
    <div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-7xl mx-auto">
      <ClientDetail clientId={viewClient} user={user} onBack={() => setViewClient(null)} onEdit={(c) => { setViewClient(null); setShowClientForm(c); }} onOpenCase={(id) => { setViewClient(null); setViewCase(id); }} />
    </div>
  );

  if (showCaseForm !== null) return (
    <div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-5xl mx-auto">
      <CaseForm caseData={showCaseForm?.id ? showCaseForm : undefined} clients={allClients} users={allUsers} onSave={saveCase} onCancel={() => setShowCaseForm(null)} />
    </div>
  );

  if (showClientForm !== null) return (
    <div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-5xl mx-auto">
      <ClientForm clientData={showClientForm?.id ? showClientForm : undefined} onSave={saveClient} onCancel={() => setShowClientForm(null)} />
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFBFC] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
              <ScalesIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Qanuni</h1>
              <p className="text-[9px] text-slate-400">{user.name} · {ROLE_LABELS[user.role] || user.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.isPartner && <span className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-semibold text-amber-700">Partner</span>}
            {user.isAdmin && <span className="px-2 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-semibold text-red-600">Admin</span>}
            <button onClick={onLogout} className="p-2 rounded-xl hover:bg-slate-100"><LogoutIcon /></button>
          </div>
        </div>
        <div className="px-4 md:px-6 flex gap-1 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setData(null); setSearchQ(""); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {!data ? <Spinner /> : (

        // ── OVERVIEW ──
        activeTab === "overview" ? (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Active Cases", value: data.activeCases, border: "border-l-emerald-400", text: "text-emerald-600" },
                { label: "Hearings", value: data.upcomingHearings, border: "border-l-blue-400", text: "text-blue-600" },
                { label: "Tasks", value: data.pendingTasks, border: "border-l-amber-400", text: "text-amber-600" },
                { label: "Deadlines", value: data.overdueDeadlines, border: "border-l-red-400", text: "text-red-600" },
                { label: "Clients", value: data.totalClients, border: "border-l-violet-400", text: "text-violet-600" },
              ].map(kpi => (
                <div key={kpi.label} className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 ${kpi.border}`}>
                  <p className={`text-2xl font-bold ${kpi.text}`}>{kpi.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Cases */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Recent Cases</h3>
                  <button onClick={() => setActiveTab("cases")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.recentCases || []).map((c: any) => (
                    <div key={c.ref} onClick={() => setViewCase(c.id)} className="px-4 py-3 hover:bg-slate-50/50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">{c.ref}</span>
                            <Badge text={c.case_type} colors={CASE_TYPE_COLORS[c.case_type]} />
                          </div>
                        </div>
                        <Badge text={c.status} colors={STATUS_COLORS[c.status]} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Hearings */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Upcoming Hearings</h3>
                  <button onClick={() => setActiveTab("hearings")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.upcomingHearingsList || []).map((h: any) => (
                    <div key={h.ref} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div><p className="text-xs font-semibold text-slate-800">{h.case_title}</p><p className="text-[10px] text-slate-400 mt-0.5">{h.court_name}</p></div>
                        <div className="text-right"><p className="text-xs font-bold text-blue-600">{h.hearing_date}</p><p className="text-[10px] text-slate-400">{h.hearing_time}</p></div>
                      </div>
                    </div>
                  ))}
                  {(!data.upcomingHearingsList || data.upcomingHearingsList.length === 0) && <div className="px-4 py-6 text-center text-xs text-slate-400">No upcoming hearings</div>}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Pending Tasks</h3>
                  <button onClick={() => setActiveTab("tasks")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.pendingTasksList || []).map((t: any) => (
                    <div key={t.ref} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge text={t.priority} colors={PRIORITY_COLORS[t.priority]} />
                          <p className="text-xs text-slate-700">{t.title}</p>
                        </div>
                        {t.due_date && <span className="text-[10px] text-slate-400">{t.due_date}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100"><h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3></div>
                <div className="divide-y divide-slate-50">
                  {(data.urgentDeadlines || []).map((d: any, i: number) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div><p className="text-xs font-semibold text-slate-800">{d.title}</p><p className="text-[10px] text-slate-400">{d.case_ref}</p></div>
                        <div className="text-right"><p className={`text-xs font-bold ${d.deadline_date < new Date().toISOString().slice(0, 10) ? "text-red-600" : "text-amber-600"}`}>{d.deadline_date}</p></div>
                      </div>
                    </div>
                  ))}
                  {(!data.urgentDeadlines || data.urgentDeadlines.length === 0) && <div className="px-4 py-6 text-center text-xs text-slate-400">No pending deadlines</div>}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a href="/calendar" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-blue-600">Court Calendar</p><p className="text-[10px] text-slate-400">Hearings & schedule</p></div>
                </div>
              </a>
              <a href="/time" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-amber-600">Time Tracking</p><p className="text-[10px] text-slate-400">Billable hours & timer</p></div>
                </div>
              </a>
              <a href="/invoices" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600">Invoicing</p><p className="text-[10px] text-slate-400">Billing & payments</p></div>
                </div>
              </a>
            </div>

            {data.casesByType?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Cases by Practice Area</h3>
                <div className="flex flex-wrap gap-2">
                  {data.casesByType.map((ct: any) => (
                    <div key={ct.case_type} className={`px-3 py-2 rounded-xl border ${CASE_TYPE_COLORS[ct.case_type] || "bg-gray-50 border-gray-100"}`}>
                      <span className="text-lg font-bold">{ct.count}</span>
                      <span className="text-[10px] ml-1.5 capitalize">{ct.case_type.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        // ── CASES TAB ──
        ) : activeTab === "cases" ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></div>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search cases..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
              </div>
              <button onClick={() => setShowCaseForm({})} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"><PlusIcon /> New Case</button>
            </div>
            {(Array.isArray(data) ? data : []).map((c: any) => (
              <div key={c.id} onClick={() => setViewCase(c.id)} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md cursor-pointer transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{c.ref}</span>
                      <Badge text={c.case_type} colors={CASE_TYPE_COLORS[c.case_type]} />
                      <Badge text={c.status} colors={STATUS_COLORS[c.status]} />
                      <Badge text={c.priority} colors={PRIORITY_COLORS[c.priority]} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400">
                      {c.client_name && <span>Client: <strong className="text-slate-600">{c.client_name}</strong></span>}
                      {c.partner_name && <span>Partner: <strong className="text-slate-600">{c.partner_name}</strong></span>}
                      {c.associate_name && <span>Associate: <strong className="text-slate-600">{c.associate_name}</strong></span>}
                      {c.case_value > 0 && <span>Value: <strong className="text-emerald-600">{Number(c.case_value).toLocaleString()} SAR</strong></span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {Array.isArray(data) && data.length === 0 && <div className="text-center text-sm text-slate-400 py-12">No cases found</div>}
          </div>

        // ── CLIENTS TAB ──
        ) : activeTab === "clients" ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <div className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></div>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search clients..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
              </div>
              <button onClick={() => setShowClientForm({})} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"><PlusIcon /> New Client</button>
            </div>
            {(Array.isArray(data) ? data : []).map((cl: any) => (
              <div key={cl.id} onClick={() => setViewClient(cl.id)} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md cursor-pointer transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{cl.ref}</span>
                      <Badge text={cl.client_type} colors={cl.client_type === "corporate" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"} />
                      <Badge text={cl.kyc_status} colors={STATUS_COLORS[cl.kyc_status]} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{cl.name}</p>
                    {cl.name_ar && <p className="text-xs text-slate-500 mt-0.5">{cl.name_ar}</p>}
                    <div className="flex gap-4 mt-1 text-[10px] text-slate-400">
                      {cl.phone && <span>{cl.phone}</span>}
                      <span>{cl.case_count} cases</span>
                      {Number(cl.total_billed) > 0 && <span className="text-emerald-600 font-medium">{Number(cl.total_billed).toLocaleString()} SAR billed</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {Array.isArray(data) && data.length === 0 && <div className="text-center text-sm text-slate-400 py-12">No clients found</div>}
          </div>

        // ── HEARINGS TAB ──
        ) : activeTab === "hearings" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Hearings ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((h: any) => (
              <div key={h.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-mono text-slate-400">{h.ref}</span><Badge text={h.status} colors={STATUS_COLORS[h.status]} /><Badge text={h.hearing_type} colors="bg-blue-50 text-blue-600 border border-blue-100" /></div>
                    <p className="text-sm font-semibold text-slate-900 cursor-pointer hover:text-emerald-600" onClick={() => setViewCase(h.case_id)}>{h.case_title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.court_name} {h.judge_name ? `· ${h.judge_name}` : ""}</p>
                  </div>
                  <div className="text-right"><p className="text-sm font-bold text-blue-600">{h.hearing_date}</p><p className="text-xs text-slate-400">{h.hearing_time}</p></div>
                </div>
              </div>
            ))}
          </div>

        // ── TASKS TAB ──
        ) : activeTab === "tasks" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Tasks ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((t: any) => (
              <div key={t.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge text={t.priority} colors={PRIORITY_COLORS[t.priority]} />
                    <div><p className="text-sm font-medium text-slate-800">{t.title}</p><p className="text-[10px] text-slate-400">{t.case_ref} · {t.assignee_name}</p></div>
                  </div>
                  <div className="text-right">
                    <Badge text={t.status} colors={STATUS_COLORS[t.status]} />
                    {t.due_date && <p className="text-[10px] text-slate-400 mt-1">{t.due_date}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        // ── TIME ENTRIES TAB ──
        ) : activeTab === "time_entries" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Time Entries</h2>
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500"><th className="px-4 py-2 text-left font-medium">Date</th><th className="px-4 py-2 text-left font-medium">Lawyer</th><th className="px-4 py-2 text-left font-medium">Case</th><th className="px-4 py-2 text-left font-medium">Description</th><th className="px-4 py-2 text-right font-medium">Hours</th><th className="px-4 py-2 text-right font-medium">Amount</th></tr></thead>
                <tbody>{(Array.isArray(data) ? data : []).map((te: any) => (
                  <tr key={te.id} className="border-t border-slate-50 hover:bg-slate-50/50"><td className="px-4 py-2">{te.entry_date}</td><td className="px-4 py-2 font-medium text-slate-700">{te.user_name}</td><td className="px-4 py-2 font-mono text-[10px] cursor-pointer text-emerald-600" onClick={() => setViewCase(te.case_id)}>{te.case_ref}</td><td className="px-4 py-2 text-slate-600">{te.description}</td><td className="px-4 py-2 text-right font-bold">{te.hours}h</td><td className="px-4 py-2 text-right font-bold text-emerald-600">{Number(te.amount).toLocaleString()} SAR</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>

        // ── DEADLINES TAB ──
        ) : activeTab === "deadlines" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Deadlines</h2>
            {(Array.isArray(data) ? data : []).map((d: any) => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-semibold text-slate-800">{d.title}</p><p className="text-[10px] text-slate-400">{d.case_ref} · {d.assignee_name}</p></div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${d.deadline_date < new Date().toISOString().slice(0, 10) ? "text-red-600" : "text-amber-600"}`}>{d.deadline_date}</p>
                    <Badge text={d.priority} colors={PRIORITY_COLORS[d.priority]} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null)}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
  }, []);

  const handleLogin = (u: User) => { localStorage.setItem("qanuni_user", JSON.stringify(u)); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("qanuni_user"); setUser(null); };

  if (!user) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
