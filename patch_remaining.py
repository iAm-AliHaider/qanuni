import os, re

base = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'
pages = ['calendar', 'time', 'invoices']

for page in pages:
    path = os.path.join(base, page, 'page.tsx')
    if not os.path.exists(path):
        print(f"SKIP {page}")
        continue
    content = open(path, 'r', encoding='utf-8').read()
    if 'AppShell' in content:
        print(f"SKIP {page} (done)")
        continue
    
    # Add import after "use client"
    content = content.replace('"use client";', '"use client";\nimport AppShell from "@/components/AppShell";', 1)
    
    # Change bg
    content = content.replace('min-h-[100dvh] bg-[#FAFBFC]">', 'min-h-[100dvh] bg-transparent">')
    
    # Replace back-button header
    old_header_pattern = r'<header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">\s*<div className="px-3 md:px-6 flex items-center justify-between h-14">\s*<div className="flex items-center gap-3"><a href="/" className="p-2 rounded-xl hover:bg-slate-100"><svg[^<]*<path[^/]*/></svg></a><h1 className="text-lg font-bold text-slate-900">([^<]+)</h1></div>'
    match = re.search(old_header_pattern, content)
    if match:
        title = match.group(1)
        old_header = match.group(0)
        new_header = f'<header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20 hidden md:block">\n          <div className="px-6 flex items-center justify-between h-14">\n            <h1 className="text-lg font-bold text-slate-900">{title}</h1>'
        content = content.replace(old_header, new_header)
    
    # Wrap with AppShell
    content = content.replace('    <div className="min-h-[100dvh]', '    <AppShell><div className="min-h-[100dvh]')
    content = re.sub(r'(    </div>\s*\n\s*\);\s*\n\})', r'    </div></AppShell>\n  );\n}', content)
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f"OK {page}")
