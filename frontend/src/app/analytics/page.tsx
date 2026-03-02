"use client";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [revLawyer, setRevLawyer] = useState<any[]>([]);
  const [revClient, setRevClient] = useState<any[]>([]);
  const [utilization, setUtilization] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [revMonthly, setRevMonthly] = useState<any[]>([]);

  useEffect(() => {
    const u = localStorage.getItem("qanuni_user");
    if (u) setUser(JSON.parse(u));
    Promise.all([
      fetch("/api/analytics").then(r => r.json()),
      fetch("/api/analytics?type=case_pipeline").then(r => r.json()),
      fetch("/api/analytics?type=revenue_by_lawyer").then(r => r.json()),
      fetch("/api/analytics?type=revenue_by_client").then(r => r.json()),
      fetch("/api/analytics?type=utilization").then(r => r.json()),
      fetch("/api/analytics?type=deadline_countdown").then(r => r.json()),
      fetch("/api/analytics?type=revenue_monthly").then(r => r.json()),
    ]).then(([ov, cp, rl, rc, ut, dl, rm]) => {
      setOverview(ov);
      setPipeline(cp.data || []);
      setRevLawyer(rl.data || []);
      setRevClient(rc.data || []);
      setUtilization(ut.data || []);
      setDeadlines(dl.data || []);
      setRevMonthly(rm.data || []);
    });
  }, []);

  if (!user) return null;
  const maxRevLawyer = Math.max(...revLawyer.map(r => Number(r.revenue || 0)), 1);
  const maxRevClient = Math.max(...revClient.map(r => Number(r.revenue || 0)), 1);
  const pipelineTotal = pipeline.reduce((s, p) => s + Number(p.count), 0) || 1;

  const PIPELINE_COLORS = ["bg-blue-400", "bg-emerald-400", "bg-amber-400", "bg-purple-400", "bg-red-400", "bg-slate-400", "bg-teal-400", "bg-pink-400"];

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">لوحة التحليلات — Firm performance at a glance</p>
        </div>

        {/* Top KPIs */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Total Cases", value: overview.cases?.total || 0, sub: `${overview.cases?.active || 0} active` },
              { label: "Revenue (SAR)", value: Number(overview.revenue?.total || 0).toLocaleString(), sub: `${Number(overview.revenue?.collected || 0).toLocaleString()} collected` },
              { label: "Active Clients", value: overview.clients?.total || 0, sub: "" },
              { label: "Billable Hours", value: Number(overview.time?.billable || 0).toFixed(1), sub: `of ${Number(overview.time?.total || 0).toFixed(1)} total` },
              { label: "Utilization", value: `${overview.time?.utilization || 0}%`, sub: "billable / total" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
                <p className="text-xl font-bold text-slate-800">{kpi.value}</p>
                <p className="text-[10px] text-slate-400">{kpi.label}</p>
                {kpi.sub && <p className="text-[9px] text-slate-300">{kpi.sub}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Pipeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Case Pipeline — خط القضايا</h3>
            {/* Funnel bar */}
            <div className="flex rounded-xl overflow-hidden h-8 mb-4">
              {pipeline.map((p, i) => (
                <div key={i} className={`${PIPELINE_COLORS[i % PIPELINE_COLORS.length]} relative group`} style={{ width: `${(Number(p.count) / pipelineTotal) * 100}%`, minWidth: "20px" }}>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{p.count}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {pipeline.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${PIPELINE_COLORS[i % PIPELINE_COLORS.length]}`}/>
                  <span className="text-[11px] text-slate-600 capitalize">{p.status} ({p.count})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deadline Countdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Upcoming Deadlines — المواعيد النهائية</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {deadlines.length === 0 && <p className="text-sm text-slate-300 text-center py-4">No upcoming deadlines</p>}
              {deadlines.map((d, i) => {
                const daysLeft = Math.ceil((new Date(d.due_date).getTime() - Date.now()) / 86400000);
                const urgent = daysLeft <= 3;
                return (
                  <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg ${urgent ? "bg-red-50" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${d.type === "hearing" ? "bg-blue-100 text-blue-700" : d.type === "filing" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>{d.type}</span>
                      <span className="text-sm text-slate-700 truncate max-w-[180px]">{d.case_title}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-bold ${urgent ? "text-red-600" : "text-slate-600"}`}>{daysLeft}d</span>
                      <p className="text-[9px] text-slate-400">{d.due_date}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue by Lawyer */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Revenue by Lawyer — الإيرادات حسب المحامي</h3>
            <div className="space-y-3">
              {revLawyer.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{r.name}</span>
                    <span className="text-slate-500">SAR {Number(r.revenue || 0).toLocaleString()} ({Number(r.hours || 0).toFixed(1)}h)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${(Number(r.revenue || 0) / maxRevLawyer) * 100}%` }}/>
                  </div>
                </div>
              ))}
              {revLawyer.length === 0 && <p className="text-sm text-slate-300 text-center py-4">No billable time logged</p>}
            </div>
          </div>

          {/* Revenue by Client */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Revenue by Client — الإيرادات حسب العميل</h3>
            <div className="space-y-3">
              {revClient.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{r.name}</span>
                    <span className="text-slate-500">SAR {Number(r.revenue || 0).toLocaleString()} ({r.invoices} inv)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${(Number(r.revenue || 0) / maxRevClient) * 100}%` }}/>
                  </div>
                </div>
              ))}
              {revClient.length === 0 && <p className="text-sm text-slate-300 text-center py-4">No invoices</p>}
            </div>
          </div>

          {/* Lawyer Utilization */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Lawyer Utilization — استغلال المحامي</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {utilization.map((u, i) => {
                const util = Number(u.total_hours) > 0 ? Math.round(Number(u.billable_hours) / Number(u.total_hours) * 100) : 0;
                const color = util >= 70 ? "emerald" : util >= 40 ? "amber" : "red";
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
                      <span className={`text-lg font-bold text-${color}-700`}>{util}%</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role?.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-slate-300">{Number(u.billable_hours).toFixed(1)} / {Number(u.total_hours).toFixed(1)} hrs</p>
                    </div>
                  </div>
                );
              })}
              {utilization.length === 0 && <p className="text-sm text-slate-300 col-span-3 text-center py-4">No time data</p>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
