"use client";
import AppShell from "@/components/AppShell";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useEffect } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  litigation: "bg-red-50 text-red-700 border-red-200",
  authorization: "bg-purple-50 text-purple-700 border-purple-200",
  correspondence: "bg-blue-50 text-blue-700 border-blue-200",
  engagement: "bg-emerald-50 text-emerald-700 border-emerald-200",
  advisory: "bg-amber-50 text-amber-700 border-amber-200",
  general: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function TemplatesPage() {
  const { t } = useLocale();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doc-templates").then(r => r.json()).then(d => { setTemplates(d.templates || []); setLoading(false); });
  }, []);

  const selectTemplate = async (id: number) => {
    const res = await fetch(`/api/doc-templates?id=${id}`);
    const tmpl = await res.json();
    setSelected(tmpl);
    const vars = JSON.parse(tmpl.variables || "[]");
    const data: Record<string, string> = {};
    vars.forEach((v: string) => data[v] = "");
    // Auto-fill common fields
    data.firm_name = data.firm_name || "Al-Rashid & Partners Law Firm";
    data.date = data.date || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    try {
      data.hijri_date = data.hijri_date || new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "long", day: "numeric" }).format(new Date());
    } catch {}
    setFormData(data);
    setPreview(null);
  };

  const renderPreview = async () => {
    const res = await fetch("/api/doc-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "render", template_id: selected.id, data: formData }),
    });
    const d = await res.json();
    setPreview(d.html);
  };

  const printDocument = () => {
    if (!preview) return;
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${selected?.name || "Document"}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', 'Noto Sans Arabic', serif; max-width: 700px; margin: 40px auto; padding: 40px; line-height: 1.7; color: #1e293b; }
        h2, h3, h4 { color: #064e3b; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td { padding: 10px; border: 1px solid #e2e8f0; }
        @media print { body { margin: 0; padding: 20px; } }
      </style>
    </head><body>${preview}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Document Templates</h1>
          <p className="text-sm text-slate-500">قوالب المستندات — Generate legal documents from templates</p>
        </div>

        {!selected ? (
          /* Template Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <div className="col-span-3 text-center py-10 text-slate-400">Loading...</div> :
            (templates || []).map(tmpl => {
              const vars = JSON.parse(tmpl.variables || "[]");
              const catClass = CATEGORY_COLORS[tmpl.category] || CATEGORY_COLORS.general;
              return (
                <div key={tmpl.id} onClick={() => selectTemplate(tmpl.id)} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${catClass}`}>{tmpl.category}</span>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-900">{tmpl.name}</h3>
                  {tmpl.name_ar && <p className="text-sm text-slate-400" dir="rtl">{tmpl.name_ar}</p>}
                  <p className="text-[10px] text-slate-300 mt-2">{vars.length} variables</p>
                </div>
              );
            })}
          </div>
        ) : (
          /* Template Form + Preview */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelected(null); setPreview(null); }} className="px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-600 hover:bg-slate-200">← Back</button>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                {selected.name_ar && <p className="text-sm text-slate-400" dir="rtl">{selected.name_ar}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Variables Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fill Variables</h3>
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-[11px] font-medium text-slate-500 capitalize">{key.replace(/_/g, " ")}</label>
                    {key.includes("text") || key.includes("facts") || key.includes("analysis") || key.includes("arguments") || key.includes("scope") || key.includes("conclusion") ? (
                      <textarea value={value} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none resize-none"/>
                    ) : (
                      <input value={value} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none" dir={key.includes("_ar") ? "rtl" : "ltr"}/>
                    )}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button onClick={renderPreview} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors">Preview Document</button>
                  {preview && <button onClick={printDocument} className="flex-1 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors">Print / PDF</button>}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Preview</h3>
                {preview ? (
                  <div className="prose prose-sm max-w-none border border-slate-100 rounded-xl p-4 bg-slate-50/50" dangerouslySetInnerHTML={{ __html: preview }}/>
                ) : (
                  <div className="text-center py-20 text-slate-300">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <p className="text-sm">Fill variables and click Preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
