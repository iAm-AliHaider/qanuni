"use client";
import { logAction, getAuditUser } from "@/lib/audit";
import { canWrite } from "@/lib/rbac";
import { useLocale } from "@/lib/LocaleContext";
import AppShell from "@/components/AppShell";

import { useState, useEffect } from "react";

const DOC_TYPES = ["pleading", "contract", "memo", "letter", "court_order", "evidence", "poa", "general"];
const CATEGORIES = ["pleadings", "contracts", "correspondence", "court_filings", "evidence", "internal", "templates", "general"];
const CAT_COLORS: Record<string, string> = { pleadings: "bg-blue-100 text-blue-700", contracts: "bg-violet-100 text-violet-700", correspondence: "bg-amber-100 text-amber-700", court_filings: "bg-red-100 text-red-700", evidence: "bg-teal-100 text-teal-700", internal: "bg-slate-100 text-slate-600", templates: "bg-emerald-100 text-emerald-700", general: "bg-gray-100 text-gray-500" };

export default function DocumentsPage() {
  const { t, dir } = useLocale();
  const [user, setUser] = useState<any>(null);
  const userCanWrite = canWrite(user?.role || "admin", "documents" as any);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  useEffect(() => {
    try { const s = localStorage.getItem("qanuni_user"); if (s) setUser(JSON.parse(s)); } catch {}
    fetch("/api/cases").then(r => r.json()).then(d => setCases(Array.isArray(d) ? d : []));
  }, []);

  const load = () => { const url = filter ? `/api/documents?category=${filter}` : "/api/documents"; fetch(url).then(r => r.json()).then(setData); };
  useEffect(() => { load(); }, [filter]);

  const docs = filter ? (Array.isArray(data) ? data : []) : (data?.docs || []);
  const stats = data?.stats || {};

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setUploadedUrl(data.url);
        if (!form.title) setForm(p => ({ ...p, title: file.name.replace(/\.[^.]+$/, "") }));
      }
    } catch (err) { console.error(err); }
    setUploading(false);
  };

  const create = async () => {
    await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", ...form, file_url: uploadedUrl || null, created_by: user?.id }) });
    setShowForm(false); setForm({ title: "", title_ar: "", doc_type: "general", category: "general", case_id: "", content: "" }); setUploadedUrl(""); load();
    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "document" }); }
  };

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent" dir={dir}>
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">{t("doc.title")}</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 4v16m8-8H4" /></svg>{t("doc.new_button")}</button>
        </div>
      </header>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-3">
        {!filter && <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-blue-400"><p className="text-xl font-bold text-blue-600">{stats.total || 0}</p><p className="text-[10px] text-slate-400">{t("doc.total_docs")}</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-violet-400"><p className="text-xl font-bold text-violet-600">{stats.categories || 0}</p><p className="text-[10px] text-slate-400">{t("doc.categories")}</p></div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 border-l-4 border-l-emerald-400"><p className="text-xl font-bold text-emerald-600">{stats.cases || 0}</p><p className="text-[10px] text-slate-400">{t("doc.linked_cases")}</p></div>
        </div>}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${!filter ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t("doc.filter_all")}</button>
          {CATEGORIES.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize ${filter === c ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{t(`doc.category_${c}`)}</button>)}
        </div>
        <div className="space-y-2">
          {docs.map((d: any) => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-slate-400">{d.ref}</span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${CAT_COLORS[d.category] || CAT_COLORS.general}`}>{d.category}</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-slate-100 text-slate-500">{t(`doc.type_${d.doc_type}`)}</span>
                {d.status && <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${d.status === "final" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</span>}
              </div>
              <p className="text-sm font-semibold text-slate-900">{d.title}</p>
               <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                 {d.case_ref && <span>{t("common.case")}: {d.case_ref}</span>}
                {d.created_by_name && <span>{d.created_by_name}</span>}
                <span>{d.created_at}</span>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noopener" className="text-emerald-600 font-medium hover:underline">{t("common.download")}</a>}
              </div>
            </div>
          ))}
          {docs.length === 0 && <div className="text-center text-xs text-slate-400 py-12">{t("doc.no_docs")}</div>}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-3 max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900">{t("doc.new_doc")}</h3>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder={t("common.title") + " *"} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
             <input value={form.title_ar} onChange={e => setForm(p => ({ ...p, title_ar: e.target.value }))} placeholder={t("doc.title_ar_placeholder")} dir="rtl" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
            <div className="grid grid-cols-2 gap-2">
               <select value={form.doc_type} onChange={e => setForm(p => ({ ...p, doc_type: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{DOC_TYPES.map(docType => <option key={docType} value={docType}>{t(`doc.type_${docType}`)}</option>)}</select>
               <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white">{CATEGORIES.map(c => <option key={c} value={c}>{t(`doc.category_${c}`)}</option>)}</select>
               <select value={form.case_id} onChange={e => setForm(p => ({ ...p, case_id: e.target.value }))} className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"><option value="">{t("doc.link_case_placeholder")}</option>{cases.map((c: any) => <option key={c.id} value={c.id}>{c.ref} — {c.title?.slice(0, 30)}</option>)}</select>
            </div>
            
            {/* File upload */}
            <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadedUrl ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 hover:border-slate-300"}`}>
              {uploadedUrl ? (
                <div className="flex items-center gap-2 justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-xs text-emerald-700 font-medium">{t("common.file_uploaded")}</span>
                  <a href={uploadedUrl} target="_blank" rel="noopener" className="text-xs text-emerald-600 underline">{t("common.view")}</a>
                   <button onClick={() => setUploadedUrl("")} className="text-xs text-red-500 ml-2">{t("common.remove")}</button>
                </div>
              ) : uploading ? (
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-emerald-500 animate-spin" />
                  <span className="text-xs text-slate-500">{t("common.uploading")}</span>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.txt" />
                  <div className="flex flex-col items-center gap-1">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <span className="text-xs text-slate-500 font-medium">{t("common.click_upload")}</span>
                    <span className="text-[9px] text-slate-400">{t("common.max_size")}</span>
                  </div>
                </label>
              )}
            </div>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder={t("doc.content_notes")} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm resize-none" rows={3} />
            <div className="flex gap-2"><button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">{t("common.cancel")}</button><button onClick={create} disabled={!form.title} className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold disabled:opacity-40">{t("common.create")}</button></div>
          </div>
        </div>
      )}
    </div></AppShell>
  );
}
