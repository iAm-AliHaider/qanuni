"use client";
import AppShell from "@/components/AppShell";

import { useState } from "react";

const TOPICS = [
  { title: "Saudi Labor Law — Employee Termination", tags: ["labor", "termination"], summary: "Article 80-84 of Saudi Labor Law governs unfair dismissal. Employee entitled to EOS if terminated without valid cause under Article 80." },
  { title: "Commercial Dispute Resolution", tags: ["commercial", "arbitration"], summary: "SCCA (Saudi Center for Commercial Arbitration) rules. Mandatory mediation before litigation for contracts >500K SAR." },
  { title: "ZATCA E-Invoicing Phase 2", tags: ["tax", "compliance"], summary: "UBL 2.1 XML format required. QR codes with TLV encoding. Cryptographic stamp mandatory since Jan 2024." },
  { title: "Real Estate Ownership — Non-Saudi", tags: ["real-estate", "foreign"], summary: "Premium Residency holders can own property. MODON industrial zones allow foreign ownership. Restrictions on Makkah/Madinah." },
  { title: "Anti-Money Laundering (AML)", tags: ["compliance", "aml"], summary: "SAFIU oversees AML. Law firms must report suspicious transactions >50K SAR. KYC mandatory for all clients." },
  { title: "Intellectual Property — Trademark Registration", tags: ["ip", "trademark"], summary: "SAIP handles trademark registration. Nice Classification system. Priority filing under Paris Convention. 10-year renewable terms." },
];

export default function ResearchPage() {
  const [search, setSearch] = useState("");
  const filtered = TOPICS.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.includes(search.toLowerCase())));

  return (
    <AppShell><div className="min-h-[100dvh] bg-transparent">
      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">
          <div className="px-6 flex items-center justify-between h-14">
            <h1 className="text-lg font-bold text-slate-900">Legal Research</h1></div>
      </header>
      <main className="p-3 md:p-6 max-w-5xl mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Search Legal Topics</h3>
          <div className="relative"><svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search topics, tags..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm" /></div>
          <p className="text-[10px] text-slate-400 mt-2">Search Saudi legal topics, regulations, and precedents. Future: AI-powered legal research with Qdrant KB.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-1.5 mb-2">{t.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-emerald-100 text-emerald-700">{tag}</span>)}</div>
              <p className="text-sm font-bold text-slate-900 mb-1">{t.title}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{t.summary}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-center">
          <p className="text-sm font-semibold text-slate-700">AI-Powered Research Coming Soon</p>
          <p className="text-xs text-slate-400 mt-1">Semantic search across Saudi legal codes, MOJ circulars, and case precedents via Qdrant knowledge base.</p>
        </div>
      </main>
    </div></AppShell>
  );
}
