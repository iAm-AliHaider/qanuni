f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Add AppShell import
if 'AppShell' not in f:
    f = f.replace(
        'import { useState, useEffect, useCallback } from "react";',
        'import { useState, useEffect, useCallback } from "react";\nimport AppShell from "@/components/AppShell";'
    )

# Find Dashboard function's return and wrap it with AppShell
# The main component renders LoginPage if no user, otherwise renders the dashboard
# We need to wrap just the dashboard portion (not login)

# Find where it returns the dashboard layout
# The dashboard starts with: return (\n    <div className="min-h-[100dvh] bg-[#FAFBFC] flex flex-col">
# and has a <header> with its own nav tabs

# Replace the dashboard's background
f = f.replace('min-h-[100dvh] bg-[#FAFBFC] flex flex-col">', 'min-h-[100dvh] bg-transparent flex flex-col">')

# Find the main dashboard return and wrap with AppShell
# It starts with: return (\n    <div className="min-h-[100dvh] bg-transparent flex flex-col">
# We need to wrap this whole thing

# Find the closing of the Dashboard component rendering
# The dashboard header has scrollable tabs - we'll hide it on md (sidebar handles nav)
# Actually the dashboard tabs (overview, cases, clients, hearings, tasks, time_entries, deadlines) are internal
# The sidebar links to /?tab=cases etc - but those are internal state, not routes
# So the dashboard needs to keep its own tab nav

# Let's just wrap the dashboard layout with AppShell
old_return = '    <div className="min-h-[100dvh] bg-transparent flex flex-col">\n      {/* Header */}\n      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">'
new_return = '    <AppShell><div className="min-h-[100dvh] bg-transparent flex flex-col">\n      {/* Header */}\n      <header className="bg-white/60 glass border-b border-slate-200/60 sticky top-0 z-20">'

if old_return in f:
    f = f.replace(old_return, new_return)
    
    # Now find the end of the Dashboard function and add </AppShell>
    # The component ends with the page's export
    # Find: \n  );\n}\n - the closing of Dashboard
    # But it's a complex component with multiple returns (viewCase, viewClient, showCaseForm, etc)
    # The LAST </div> before the final ); of Dashboard is the one we need
    
    # Actually the dashboard has multiple return paths. We need to wrap ALL of them.
    # Better approach: just wrap the outermost component
    
    # Find the LAST line that closes the main Dashboard component
    # It ends with: </div>\n  );\n} at the very end of the file
    import re
    # Find the last occurrence of: "  );\n}\n" (the closing of default export)
    # We need to add </AppShell> before the last closing div of the main return
    pass

# For the other returns (viewCase, viewClient, etc), wrap them too
# These are: <div className="min-h-[100dvh] bg-[#FAFBFC] p-4 ...">
f = f.replace(
    '<div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-7xl mx-auto">\n      <ClientDetail',
    '<AppShell><div className="min-h-[100dvh] bg-transparent p-4 md:p-6 max-w-7xl mx-auto">\n      <ClientDetail'
)
f = f.replace(
    '<div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-7xl mx-auto">\n      <CaseDetail',
    '<AppShell><div className="min-h-[100dvh] bg-transparent p-4 md:p-6 max-w-7xl mx-auto">\n      <CaseDetail'
)
f = f.replace(
    '<div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-5xl mx-auto">\n      <CaseForm',
    '<AppShell><div className="min-h-[100dvh] bg-transparent p-4 md:p-6 max-w-5xl mx-auto">\n      <CaseForm'
)
f = f.replace(
    '<div className="min-h-[100dvh] bg-[#FAFBFC] p-4 md:p-6 max-w-5xl mx-auto">\n      <ClientForm',
    '<AppShell><div className="min-h-[100dvh] bg-transparent p-4 md:p-6 max-w-5xl mx-auto">\n      <ClientForm'
)

# Close </AppShell> for each of these returns
# They all end with: </div>\n  );
# For the detail views:
f = f.replace('      <ClientDetail clientId={viewClient} user={user} onBack={() => setViewClient(null)} onEdit={(c) => { setViewClient(null); setShowClientForm(c); }} onOpenCase={(id) => { setViewClient(null); setViewCase(id); }} />\n    </div>\n  );',
             '      <ClientDetail clientId={viewClient} user={user} onBack={() => setViewClient(null)} onEdit={(c) => { setViewClient(null); setShowClientForm(c); }} onOpenCase={(id) => { setViewClient(null); setViewCase(id); }} />\n    </div></AppShell>\n  );')
f = f.replace('      <CaseDetail caseId={viewCase} user={user} onBack={() => setViewCase(null)} onEdit={(c) => { setViewCase(null); setShowCaseForm(c); }} />\n    </div>\n  );',
             '      <CaseDetail caseId={viewCase} user={user} onBack={() => setViewCase(null)} onEdit={(c) => { setViewCase(null); setShowCaseForm(c); }} />\n    </div></AppShell>\n  );')
f = f.replace('      <CaseForm caseData={showCaseForm?.id ? showCaseForm : undefined} clients={allClients} users={allUsers} onSave={saveCase} onCancel={() => setShowCaseForm(null)} />\n    </div>\n  );',
             '      <CaseForm caseData={showCaseForm?.id ? showCaseForm : undefined} clients={allClients} users={allUsers} onSave={saveCase} onCancel={() => setShowCaseForm(null)} />\n    </div></AppShell>\n  );')
f = f.replace('      <ClientForm clientData={showClientForm?.id ? showClientForm : undefined} onSave={saveClient} onCancel={() => setShowClientForm(null)} />\n    </div>\n  );',
             '      <ClientForm clientData={showClientForm?.id ? showClientForm : undefined} onSave={saveClient} onCancel={() => setShowClientForm(null)} />\n    </div></AppShell>\n  );')

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("DASHBOARD PATCHED")
print(f"AppShell count: {f.count('AppShell')}")
