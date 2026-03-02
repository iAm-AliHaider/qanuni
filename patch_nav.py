import re

f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Find the closing </a> of invoices link and the </div> after it
old = '''              <a href="/invoices" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600">Invoicing</p><p className="text-[10px] text-slate-400">Billing & payments</p></div>
                </div>
              </a>
            </div>'''

new_links = '''              <a href="/invoices" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 17h6M9 13h6M9 9h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600">Invoicing</p><p className="text-[10px] text-slate-400">Billing & payments</p></div>
                </div>
              </a>
              <a href="/tasks" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center"><svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /><path d="M9 14l2 2 4-4" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-violet-600">Tasks</p><p className="text-[10px] text-slate-400">Kanban board</p></div>
                </div>
              </a>
              <a href="/documents" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-slate-600">Documents</p><p className="text-[10px] text-slate-400">File management</p></div>
                </div>
              </a>
              <a href="/contacts" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center"><svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-teal-600">Contacts</p><p className="text-[10px] text-slate-400">Directory</p></div>
                </div>
              </a>
              <a href="/compliance" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-red-600">Compliance</p><p className="text-[10px] text-slate-400">Risk & conflicts</p></div>
                </div>
              </a>
              <a href="/reports" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">Reports</p><p className="text-[10px] text-slate-400">Analytics</p></div>
                </div>
              </a>
              <a href="/hr" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center"><svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-pink-600">Team & HR</p><p className="text-[10px] text-slate-400">Staff directory</p></div>
                </div>
              </a>
              <a href="/poa" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-orange-600">Power of Attorney</p><p className="text-[10px] text-slate-400">POA management</p></div>
                </div>
              </a>
              <a href="/communications" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center"><svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-cyan-600">Communications</p><p className="text-[10px] text-slate-400">Client log</p></div>
                </div>
              </a>
              <a href="/expenses" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center"><svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-rose-600">Expenses</p><p className="text-[10px] text-slate-400">Cost tracking</p></div>
                </div>
              </a>
              <a href="/research" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-purple-600">Legal Research</p><p className="text-[10px] text-slate-400">Topics & precedents</p></div>
                </div>
              </a>
              <a href="/settings" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg></div>
                  <div><p className="text-sm font-bold text-slate-800 group-hover:text-gray-600">Settings</p><p className="text-[10px] text-slate-400">Firm configuration</p></div>
                </div>
              </a>
            </div>'''

f = f.replace(old, new_links)
open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("OK" if new_links[:50] in f else "PATCH FAILED")
