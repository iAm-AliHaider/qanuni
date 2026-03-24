"use client";
import { toHijriShort } from "@/lib/hijri";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";

import { useState, useEffect } from "react";

const TYPE_COLORS: Record<string, string> = {
  first_hearing: "bg-blue-100 text-blue-700 border-l-blue-500",
  oral_argument: "bg-violet-100 text-violet-700 border-l-violet-500",
  witness_examination: "bg-amber-100 text-amber-700 border-l-amber-500",
  mediation: "bg-emerald-100 text-emerald-700 border-l-emerald-500",
  judgment: "bg-red-100 text-red-700 border-l-red-500",
  appeal: "bg-orange-100 text-orange-700 border-l-orange-500",
  settlement: "bg-teal-100 text-teal-700 border-l-teal-500",
  default: "bg-slate-100 text-slate-600 border-l-slate-400",
};

export default function CalendarPage() {
  const { t, locale, dir } = useLocale();
  const [hearings, setHearings] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<any>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthName = currentDate.toLocaleDateString("en", { month: "long", year: "numeric" });

  useEffect(() => {
    fetch(`/api/hearings?month=${monthStr}`).then(r => r.json()).then(d => setHearings(Array.isArray(d) ? d : []));
  }, [monthStr]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  const getHearingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return hearings.filter(h => h.hearing_date === dateStr);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="px-4 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 rounded-xl hover:bg-slate-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
            </a>
            <h1 className="text-lg font-bold text-slate-900">{t('cal.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prev} className="p-2 rounded-xl hover:bg-slate-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-xs md:text-sm font-semibold text-slate-800 min-w-[120px] md:min-w-[160px] text-center">{monthName}</span>
            <button onClick={next} className="p-2 rounded-xl hover:bg-slate-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="p-2 md:p-6 max-w-7xl mx-auto">
        {/* Legend */}
        <div className="hidden md:flex flex-wrap gap-2 mb-4">
          {Object.entries(TYPE_COLORS).filter(([k]) => k !== "default").map(([type, colors]) => (
            <span key={type} className={`px-2 py-0.5 rounded text-[9px] font-medium ${colors}`}>{t(`cal.hearing_type_${type}`)}</span>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {[t('cal.sun'), t('cal.mon'), t('cal.tue'), t('cal.wed'), t('cal.thu'), t('cal.fri'), t('cal.sat')].map(d => (
              <div key={d} className={`px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider ${d === t('cal.fri') || d === t('cal.sat') ? "text-emerald-600 bg-emerald-50/50" : "text-slate-400"}`}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="min-h-[60px] md:min-h-[100px] border-b border-r border-slate-50 bg-slate-50/30" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayHearings = getHearingsForDay(day);
              const isToday = dateStr === today;
              const dayOfWeek = new Date(year, month, day).getDay();
              const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

              return (
                <div key={day} className={`min-h-[60px] md:min-h-[100px] border-b border-r border-slate-50 p-0.5 md:p-1 ${isWeekend ? "bg-slate-50/50" : ""} ${isToday ? "bg-emerald-50/30" : ""}`}>
                  <div className={`text-[11px] font-semibold mb-1 px-1 ${isToday ? "text-emerald-600" : "text-slate-400"}`}>
                    {isToday ? <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]">{day}</span> : day}
                  </div>
                  <div className="space-y-0.5">
                    {dayHearings.map(h => (
                      <button key={h.id} onClick={() => setSelected(h)} className={`w-full text-left px-1 py-0.5 md:px-1.5 md:py-1 rounded border-l-2 text-[8px] md:text-[9px] leading-tight truncate ${TYPE_COLORS[h.hearing_type] || TYPE_COLORS.default}`}>
                        <span className="font-bold">{h.hearing_time}</span>
                        <span className="block truncate">{h.case_title?.split(" ").slice(0, 3).join(" ")}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-blue-400">
            <p className="text-2xl font-bold text-blue-600">{hearings.length}</p>
            <p className="text-[10px] text-slate-400">{t('cal.hearings_this_month')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-emerald-400">
            <p className="text-2xl font-bold text-emerald-600">{hearings.filter(h => h.status === "scheduled").length}</p>
            <p className="text-[10px] text-slate-400">{t('cal.scheduled')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-amber-400">
            <p className="text-2xl font-bold text-amber-600">{hearings.filter(h => h.hearing_type === "judgment").length}</p>
            <p className="text-[10px] text-slate-400">{t('cal.judgments')}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 border-l-4 border-l-violet-400">
            <p className="text-2xl font-bold text-violet-600">{new Set(hearings.map(h => h.case_id)).size}</p>
            <p className="text-[10px] text-slate-400">{t('cal.cases_in_court')}</p>
          </div>
        </div>

        {/* Hearing Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${TYPE_COLORS[selected.hearing_type] || TYPE_COLORS.default}`}>{t(`cal.hearing_type_${selected.hearing_type}`)}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selected.case_title}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selected.case_ref} · {selected.ref}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-100">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-400">{t('cal.date')}</span><p className="font-bold text-blue-600">{selected.hearing_date}</p></div>
                <div><span className="text-slate-400">{t('cal.time')}</span><p className="font-bold text-slate-800">{selected.hearing_time}</p></div>
                <div><span className="text-slate-400">{t('cal.court')}</span><p className="font-medium text-slate-700">{selected.court_name}</p></div>
                <div><span className="text-slate-400">{t('cal.judge')}</span><p className="font-medium text-slate-700">{selected.judge_name || t('cal.tbd')}</p></div>
              </div>
              <div className="flex gap-2 pt-2">
                <a href="/" className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold text-center hover:bg-slate-200">{t('cal.view_case')}</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div></AppShell>
  );
}
