f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\reports\page.tsx', 'r', encoding='utf-8').read()

# Add export button to header
old = '<h1 className="text-lg font-bold text-slate-900">Reports & Analytics</h1></div>'
new = '''<h1 className="text-lg font-bold text-slate-900">Reports & Analytics</h1>
          <button onClick={() => {
            const el = document.getElementById("report-content");
            if (!el) return;
            const w = window.open("", "_blank");
            if (!w) return;
            w.document.write("<html><head><title>Qanuni Report</title><style>body{font-family:Inter,system-ui,sans-serif;padding:40px;color:#1e293b}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:8px 12px;border:1px solid #e2e8f0;text-align:left;font-size:13px}th{background:#f8fafc;font-weight:600}h1{font-size:20px;margin-bottom:4px}h3{font-size:14px;margin:20px 0 8px;color:#475569}.kpi{display:inline-block;padding:12px 20px;margin:4px;border:1px solid #e2e8f0;border-radius:8px;text-align:center}.kpi-val{font-size:24px;font-weight:700;color:#059669}.kpi-label{font-size:10px;color:#94a3b8}</style></head><body>");
            w.document.write("<h1>Qanuni — Report</h1><p style=\\"color:#94a3b8;font-size:12px\\">Generated: " + new Date().toLocaleString() + " · Al-Rashid & Partners</p><hr>");
            w.document.write(el.innerHTML);
            w.document.write("</body></html>");
            w.document.close();
            w.print();
          }} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">Export PDF</button>
        </div>'''

f = f.replace(old, new)

# Wrap report content with id
f = f.replace('<main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">', '<main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4" id="report-content">')

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\reports\page.tsx', 'w', encoding='utf-8').write(f)
print("REPORTS PDF OK")
