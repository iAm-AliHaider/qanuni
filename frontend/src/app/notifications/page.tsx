"use client";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useEffect } from "react";

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  hearing: { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-blue-600", bg: "bg-blue-50" },
  deadline: { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-red-600", bg: "bg-red-50" },
  overdue: { icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z", color: "text-amber-600", bg: "bg-amber-50" },
  task: { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "text-purple-600", bg: "bg-purple-50" },
  info: { icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-slate-600", bg: "bg-slate-50" },
  payment: { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z", color: "text-emerald-600", bg: "bg-emerald-50" },
};

export default function NotificationsPage() {
  const { t } = useLocale();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [tab, setTab] = useState<"notifications" | "activity">("notifications");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("qanuni_user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      loadData(parsed.id);
    }
  }, []);

  const loadData = async (userId: number) => {
    setLoading(true);
    const [nRes, aRes] = await Promise.all([
      fetch(`/api/notifications?userId=${userId}`),
      fetch("/api/notifications?action=activity"),
    ]);
    const nData = await nRes.json();
    const aData = await aRes.json();
    setNotifications(nData.notifications || []);
    setActivity(aData.activity || []);
    setLoading(false);
  };

  const markRead = async (id?: number) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_read", id, userId: id ? undefined : user?.id }),
    });
    if (user) loadData(user.id);
  };

  const checkDeadlines = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_deadlines" }),
    });
    if (user) loadData(user.id);
  };

  const unread = notifications.filter(n => !n.is_read).length;
  if (!user) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('notif.title')}</h1>
            <p className="text-sm text-slate-500">{t('notif.title')} — {unread} {t('notif.unread')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={checkDeadlines} className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 font-semibold hover:bg-blue-100">{t('notif.check_deadlines')}</button>
            {unread > 0 && <button onClick={() => markRead()} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold hover:bg-emerald-100">{t('notif.mark_all_read')}</button>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {(["notifications", "activity"] as const).map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === tabKey ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {tabKey === "notifications" ? `${t('notif.title')}${unread ? ` (${unread})` : ""}` : t('notif.activity_feed')}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-10 text-slate-400">{t('notif.loading')}</div> : tab === "notifications" ? (
          <div className="space-y-2">
            {notifications.length === 0 && <div className="text-center py-10 text-slate-400">{t('notif.no_notifications')}</div>}
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info;
              return (
                <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${n.is_read ? "bg-white border-slate-100" : "bg-blue-50/30 border-blue-200/50"}`} onClick={() => { if (!n.is_read) markRead(n.id); if (n.link) window.location.href = n.link; }}>
                  <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={cfg.icon}/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${n.is_read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</p>
                    {n.title_ar && <p className="text-[11px] text-slate-400" dir="rtl">{n.title_ar}</p>}
                    {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-slate-300 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"/>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {activity.length === 0 && <div className="text-center py-10 text-slate-400">{t('notif.no_activity')}</div>}
            {activity.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{(a.user_name || "?").slice(0, 2).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800"><span className="font-semibold">{a.user_name || "System"}</span> {a.action} {a.entity_type ? <span className="text-slate-500">{a.entity_type}</span> : null} {a.entity_name ? <span className="font-medium">"{a.entity_name}"</span> : null}</p>
                  {a.details && <p className="text-xs text-slate-400 mt-0.5">{a.details}</p>}
                  <p className="text-[10px] text-slate-300 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
