"use client";
import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-red-50 text-red-700",
  sign: "bg-purple-50 text-purple-700",
  approve: "bg-green-50 text-green-700",
  reject: "bg-orange-50 text-orange-700",
  view: "bg-slate-50 text-slate-500",
};

export default function AuditPage() {
  const [user, setUser] = useState<any>(null);
  const [trail, setTrail] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("qanuni_user");
    if (u) setUser(JSON.parse(u));
    fetch("/api/audit").then(r => r.json()).then(d => { setTrail(d.trail || []); setLoading(false); });
  }, []);

  const filtered = filter ? trail.filter(a => a.entity_type === filter) : trail;
  const entityTypes = [...new Set(trail.map(a => a.entity_type))];

  if (!user) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
            <p className="text-sm text-slate-500">سجل التدقيق — Track all changes</p>
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <option value="">All Types</option>
            {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-10 text-slate-400">Loading...</div> : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <p className="text-lg font-medium">No audit entries</p>
            <p className="text-sm">Changes to cases, invoices, and documents will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-center">Action</th>
                <th className="px-4 py-2 text-left">Entity</th>
                <th className="px-4 py-2 text-left">Ref</th>
                <th className="px-4 py-2 text-left">Details</th>
              </tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-[10px] text-slate-400 font-mono whitespace-nowrap">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{a.user_name || "System"}</td>
                    <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${ACTION_COLORS[a.action] || ACTION_COLORS.view}`}>{a.action}</span></td>
                    <td className="px-4 py-2.5 text-slate-500 capitalize">{a.entity_type}</td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-slate-500">{a.entity_ref || `#${a.entity_id || "—"}`}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px] max-w-[200px] truncate">{a.new_value || a.old_value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
