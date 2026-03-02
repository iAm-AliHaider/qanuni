"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLocale, LanguageToggle } from "@/lib/LocaleContext";

function getNavSections(t: (k: string) => string) { return [
  {
    title: t("section.core"),
    items: [
      { href: "/", label: t("nav.dashboard"), icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
      { href: "/calendar", label: t("nav.court_calendar"), icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { href: "/tasks", label: t("nav.tasks"), icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { href: "/notifications", label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
    ],
  },
  {
    title: t("section.case_management"),
    items: [
      { href: "/?tab=cases", label: t("nav.cases"), icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
      { href: "/?tab=clients", label: t("nav.clients"), icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
      { href: "/documents", label: t("nav.documents"), icon: "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
      { href: "/poa", label: t("nav.poa"), icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
      { href: "/contracts", label: t("nav.contracts"), icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { href: "/filings", label: t("nav.filings"), icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" },
    ],
  },
  {
    title: t("section.finance"),
    items: [
      { href: "/time", label: t("nav.time"), icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { href: "/invoices", label: t("nav.invoices"), icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" },
      { href: "/expenses", label: t("nav.expenses"), icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
      { href: "/trust", label: t("nav.trust"), icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
      { href: "/retainers", label: t("nav.retainers"), icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
      { href: "/zatca", label: "ZATCA", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" },
    ],
  },
  {
    title: t("section.operations"),
    items: [
      { href: "/contacts", label: t("nav.contacts"), icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
      { href: "/communications", label: t("nav.communications"), icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { href: "/compliance", label: t("nav.compliance"), icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    ],
  },
  {
    title: t("section.insights"),
    items: [
      { href: "/reports", label: t("nav.reports"), icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { href: "/research", label: t("nav.research"), icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
      { href: "/hr", label: t("nav.hr"), icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { href: "/settings", label: t("nav.settings"), icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
        { href: "/templates", label: "Doc Templates", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
        { href: "/analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
        { href: "/audit", label: "Audit Trail", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    ],
  },
]; }

const ROLE_LABELS: Record<string, string> = {
  managing_partner: "Managing Partner", senior_partner: "Senior Partner", partner: "Partner",
  senior_associate: "Senior Associate", associate: "Associate", paralegal: "Paralegal",
  legal_secretary: "Legal Secretary", finance: "Finance", admin: "Admin",
};

function NavIcon({ d, active }: { d: string; active: boolean }) {
  return (
    <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t, isRtl } = useLocale();
  const NAV_SECTIONS = getNavSections(t);

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
  }, []);

  const logout = () => { localStorage.removeItem("qanuni_user"); window.location.href = "/"; };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/?tab=")) return false; // handled by dashboard internally
    return pathname === href;
  };

  // Don't show shell on login (no user) or on main dashboard page (has its own nav)
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFB]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-overlay z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 h-full z-50 ${isRtl ? "right-0" : "left-0"} bg-white ${isRtl ? "border-l" : "border-r"} border-slate-200/80 transition-all duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : (isRtl ? "translate-x-full" : "-translate-x-full")} md:translate-x-0
        ${collapsed ? "md:w-[68px]" : "md:w-[260px]"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center gap-3 px-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10 flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M3 7l9-4 9 4" /><path d="M3 7l3 5h-6z" /><path d="M21 7l-3 5h6z" /><circle cx="12" cy="21" r="1" /></svg>
            </div>
            {!collapsed && <div className="animate-fade-in"><p className="text-sm font-bold text-slate-900 leading-tight">Qanuni</p><p className="text-[9px] text-slate-400">قانوني</p></div>}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5">
            {NAV_SECTIONS.map(section => (
              <div key={section.title} className="mb-4">
                {!collapsed && <p className="px-2.5 mb-1.5 text-[9px] font-bold text-slate-300 uppercase tracking-[0.12em]">{section.title}</p>}
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const active = isActive(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                          ${active
                            ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                          } ${collapsed ? "justify-center" : ""}`}
                        title={collapsed ? item.label : undefined}>
                        <NavIcon d={item.icon} active={active} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Language toggle */}
          {!collapsed && <div className="px-2.5 mb-1"><LanguageToggle className="w-full justify-center" /></div>}

          {/* Collapse toggle (desktop) */}
          <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex items-center justify-center py-2 mx-2.5 mb-1 rounded-lg hover:bg-slate-50 text-slate-400">
            <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M11 19l-7-7 7-7" /></svg>
          </button>

          {/* User */}
          <div className="border-t border-slate-100 p-3">
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md shadow-emerald-200/50">
                {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0 animate-fade-in">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-[9px] text-slate-400 truncate">{ROLE_LABELS[user?.role] || user?.role}</p>
                </div>
              )}
              {!collapsed && (
                <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Sign out">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? (isRtl ? "md:mr-[68px]" : "md:ml-[68px]") : (isRtl ? "md:mr-[260px]" : "md:ml-[260px]")}`}>
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white/80 glass border-b border-slate-200/60 md:hidden">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3v18" /><path d="M3 7l9-4 9 4" /></svg>
              </div>
              <span className="text-sm font-bold text-slate-900">Qanuni</span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[9px] font-bold">
              {user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-transition">
          {children}
        </main>
      </div>
    </div>
  );
}
