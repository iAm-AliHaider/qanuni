"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  name_ar: string;
  role: string;
  department: string;
  bar_number?: string;
  isPartner: boolean;
  isAdmin?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner",
  senior_partner: "Senior Partner",
  partner: "Partner",
  senior_associate: "Senior Associate",
  associate: "Associate",
  paralegal: "Paralegal",
  legal_secretary: "Legal Secretary",
  finance: "Finance",
  admin: "Admin",
};

const CASE_TYPE_COLORS: Record<string, string> = {
  criminal: "bg-red-50 text-red-700 border-red-100",
  civil: "bg-blue-50 text-blue-700 border-blue-100",
  commercial: "bg-amber-50 text-amber-700 border-amber-100",
  family: "bg-pink-50 text-pink-700 border-pink-100",
  labor: "bg-teal-50 text-teal-700 border-teal-100",
  real_estate: "bg-violet-50 text-violet-700 border-violet-100",
  banking: "bg-indigo-50 text-indigo-700 border-indigo-100",
  insurance: "bg-cyan-50 text-cyan-700 border-cyan-100",
  ip: "bg-purple-50 text-purple-700 border-purple-100",
  administrative: "bg-slate-50 text-slate-700 border-slate-100",
  arbitration: "bg-orange-50 text-orange-700 border-orange-100",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-500",
};

const STATUS_COLORS: Record<string, string> = {
  intake: "bg-gray-100 text-gray-600",
  active: "bg-emerald-100 text-emerald-700",
  court: "bg-blue-100 text-blue-700",
  judgment: "bg-violet-100 text-violet-700",
  appeal: "bg-orange-100 text-orange-700",
  closed: "bg-gray-200 text-gray-500",
  archived: "bg-gray-100 text-gray-400",
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
};

function ScalesIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" /><path d="M3 7l9-4 9 4" /><path d="M3 7l3 5h-6z" /><path d="M21 7l-3 5h6z" /><circle cx="12" cy="21" r="1" />
    </svg>
  );
}

// ── Login Page ──
function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth").then(r => r.json()).then(setUsers);
  }, []);

  const handleLogin = async () => {
    if (!selectedId || !pin) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selectedId, pin }) });
    if (!res.ok) { setError("Invalid PIN"); setLoading(false); return; }
    const user = await res.json();
    onLogin(user);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-900/20">
            <ScalesIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Qanuni</h1>
          <p className="text-sm text-slate-400 mt-1 font-arabic">قانوني — إدارة مكتب المحاماة</p>
        </div>

        {/* Login Card */}
        <div className="card p-6 space-y-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Select User</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all">
              <option value="">Choose...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} — {ROLE_LABELS[u.role] || u.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">PIN</label>
            <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter 4-digit PIN" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 outline-none transition-all" />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button onClick={handleLogin} disabled={!selectedId || pin.length < 4 || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-white text-sm font-semibold hover:from-slate-700 hover:to-slate-800 disabled:opacity-40 transition-all shadow-lg shadow-slate-900/10">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-300 mt-6">Al-Rashid & Partners Law Firm</p>
      </div>
    </div>
  );
}

// ── Dashboard ──
function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetch(`/api/dashboard?section=${activeTab}&userId=${user.id}`).then(r => r.json()).then(setData);
  }, [activeTab, user.id]);

  const tabs = [
    { key: "overview", label: "Overview", icon: "⚖️" },
    { key: "cases", label: "Cases", icon: "📁" },
    { key: "hearings", label: "Hearings", icon: "🏛️" },
    { key: "tasks", label: "Tasks", icon: "✅" },
    { key: "clients", label: "Clients", icon: "👥" },
    { key: "time_entries", label: "Time", icon: "⏱️" },
    { key: "deadlines", label: "Deadlines", icon: "⏰" },
  ];

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
            <button onClick={onLogout} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-4 md:px-6 flex gap-1 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setData(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              <span className="text-sm">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {!data ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" />
          </div>
        ) : activeTab === "overview" ? (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Active Cases", value: data.activeCases, color: "emerald", icon: "📁" },
                { label: "Hearings", value: data.upcomingHearings, color: "blue", icon: "🏛️" },
                { label: "Tasks", value: data.pendingTasks, color: "amber", icon: "✅" },
                { label: "Deadlines", value: data.overdueDeadlines, color: "red", icon: "⏰" },
                { label: "Clients", value: data.totalClients, color: "violet", icon: "👥" },
              ].map(kpi => (
                <div key={kpi.label} className={`card p-4 border-l-4 border-l-${kpi.color}-400`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold text-${kpi.color}-600`}>{kpi.value}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{kpi.label}</p>
                    </div>
                    <span className="text-xl">{kpi.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Cases */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Recent Cases</h3>
                  <button onClick={() => setActiveTab("cases")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.recentCases || []).map((c: any) => (
                    <div key={c.ref} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">{c.ref}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${CASE_TYPE_COLORS[c.case_type] || "bg-gray-50 text-gray-600 border-gray-100"}`}>{c.case_type}</span>
                          </div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                      </div>
                      {c.client_name && <p className="text-[10px] text-slate-400 mt-1">Client: {c.client_name}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Hearings */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Upcoming Hearings</h3>
                  <button onClick={() => setActiveTab("hearings")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.upcomingHearingsList || []).map((h: any) => (
                    <div key={h.ref} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{h.case_title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{h.court_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-blue-600">{h.hearing_date}</p>
                          <p className="text-[10px] text-slate-400">{h.hearing_time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!data.upcomingHearingsList || data.upcomingHearingsList.length === 0) && (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">No upcoming hearings</div>
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Pending Tasks</h3>
                  <button onClick={() => setActiveTab("tasks")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.pendingTasksList || []).map((t: any) => (
                    <div key={t.ref} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${PRIORITY_COLORS[t.priority] || "bg-gray-100"}`}>{t.priority}</span>
                          <p className="text-xs text-slate-700">{t.title}</p>
                        </div>
                        {t.due_date && <span className="text-[10px] text-slate-400">{t.due_date}</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.case_ref} · {t.assignee_name}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Upcoming Deadlines</h3>
                  <button onClick={() => setActiveTab("deadlines")} className="text-[10px] text-emerald-600 font-semibold hover:underline">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {(data.urgentDeadlines || []).map((d: any, i: number) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{d.title}</p>
                          <p className="text-[10px] text-slate-400">{d.case_ref} — {d.case_title}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${d.deadline_date < new Date().toISOString().slice(0, 10) ? "text-red-600" : "text-amber-600"}`}>{d.deadline_date}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${PRIORITY_COLORS[d.priority] || ""}`}>{d.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!data.urgentDeadlines || data.urgentDeadlines.length === 0) && (
                    <div className="px-4 py-6 text-center text-xs text-slate-400">No pending deadlines</div>
                  )}
                </div>
              </div>
            </div>

            {/* Cases by Type */}
            {data.casesByType?.length > 0 && (
              <div className="card p-4">
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
        ) : activeTab === "cases" ? (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">All Cases ({Array.isArray(data) ? data.length : 0})</h2>
            </div>
            {(Array.isArray(data) ? data : []).map((c: any) => (
              <div key={c.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{c.ref}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${CASE_TYPE_COLORS[c.case_type] || "bg-gray-50 border-gray-100"}`}>{c.case_type}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${STATUS_COLORS[c.status] || ""}`}>{c.status}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${PRIORITY_COLORS[c.priority] || ""}`}>{c.priority}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{c.title}</p>
                    {c.title_ar && <p className="text-xs text-slate-500 mt-0.5 font-arabic">{c.title_ar}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400">
                      {c.client_name && <span>Client: <strong className="text-slate-600">{c.client_name}</strong></span>}
                      {c.court && <span>Court: <strong className="text-slate-600">{c.court}</strong></span>}
                      {c.judge && <span>Judge: <strong className="text-slate-600">{c.judge}</strong></span>}
                      {c.partner_name && <span>Partner: <strong className="text-slate-600">{c.partner_name}</strong></span>}
                      {c.associate_name && <span>Associate: <strong className="text-slate-600">{c.associate_name}</strong></span>}
                      {c.case_value > 0 && <span>Value: <strong className="text-emerald-600">{Number(c.case_value).toLocaleString()} SAR</strong></span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "hearings" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Hearings ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((h: any) => (
              <div key={h.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{h.ref}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${STATUS_COLORS[h.status] || ""}`}>{h.status}</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-50 text-blue-600 border border-blue-100">{h.hearing_type}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{h.case_title}</p>
                    <div className="flex flex-wrap gap-x-4 mt-1 text-[10px] text-slate-400">
                      <span>Case: <strong className="text-slate-600">{h.case_ref}</strong></span>
                      {h.court_name && <span>Court: <strong className="text-slate-600">{h.court_name}</strong></span>}
                      {h.judge_name && <span>Judge: <strong className="text-slate-600">{h.judge_name}</strong></span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{h.hearing_date}</p>
                    <p className="text-xs text-slate-400">{h.hearing_time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "tasks" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Tasks ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((t: any) => (
              <div key={t.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${PRIORITY_COLORS[t.priority] || ""}`}>{t.priority}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.case_ref} · {t.assignee_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${STATUS_COLORS[t.status] || ""}`}>{t.status}</span>
                    {t.due_date && <p className="text-[10px] text-slate-400 mt-1">{t.due_date}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "clients" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Clients ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((cl: any) => (
              <div key={cl.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{cl.ref}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${cl.client_type === "corporate" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>{cl.client_type}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${cl.kyc_status === "verified" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>{cl.kyc_status}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{cl.name}</p>
                    {cl.name_ar && <p className="text-xs text-slate-500 font-arabic">{cl.name_ar}</p>}
                    <div className="flex gap-4 mt-1 text-[10px] text-slate-400">
                      {cl.phone && <span>{cl.phone}</span>}
                      <span>{cl.case_count} cases</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === "time_entries" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Time Entries ({Array.isArray(data) ? data.length : 0})</h2>
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="bg-slate-50 text-slate-500">
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Lawyer</th>
                  <th className="px-4 py-2 text-left font-medium">Case</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                  <th className="px-4 py-2 text-right font-medium">Hours</th>
                  <th className="px-4 py-2 text-right font-medium">Amount</th>
                </tr></thead>
                <tbody>
                  {(Array.isArray(data) ? data : []).map((te: any) => (
                    <tr key={te.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-2 text-slate-500">{te.entry_date}</td>
                      <td className="px-4 py-2 font-medium text-slate-700">{te.user_name}</td>
                      <td className="px-4 py-2 text-slate-500 font-mono text-[10px]">{te.case_ref}</td>
                      <td className="px-4 py-2 text-slate-600">{te.description}</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-700">{te.hours}h</td>
                      <td className="px-4 py-2 text-right font-bold text-emerald-600">{Number(te.amount).toLocaleString()} SAR</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "deadlines" ? (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-sm font-bold text-slate-800">Deadlines ({Array.isArray(data) ? data.length : 0})</h2>
            {(Array.isArray(data) ? data : []).map((d: any) => (
              <div key={d.id} className="card p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{d.title}</p>
                    <p className="text-[10px] text-slate-400">{d.case_ref} — {d.case_title} · {d.assignee_name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${d.deadline_date < new Date().toISOString().slice(0, 10) ? "text-red-600" : "text-amber-600"}`}>{d.deadline_date}</p>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${PRIORITY_COLORS[d.priority] || ""}`}>{d.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}

// ── Main App ──
export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("qanuni_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  const handleLogin = (u: User) => {
    localStorage.setItem("qanuni_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem("qanuni_user");
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
