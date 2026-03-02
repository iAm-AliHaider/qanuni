"""Wire audit logging + Hijri dates into dashboard page."""
f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Add audit import
if 'logAction' not in f:
    f = f.replace(
        'import { formatDualDate } from "@/lib/hijri";',
        'import { formatDualDate } from "@/lib/hijri";\nimport { logAction, getAuditUser } from "@/lib/audit";'
    )
    print("Added audit import")

# Wire audit into case creation - find the case create fetch success
# Look for the successful case creation response handling
case_create_success = 'const d = await res.json();\n'
# This is too generic. Let's find the specific case creation
# Look for: action: "create" in cases context
# The pattern after successful case creation is usually setView("list") or similar

# Wire audit into case save
old_case_save = 'body: JSON.stringify({ action: "create",'
if old_case_save in f:
    # Find the response handling after this fetch
    idx = f.find(old_case_save)
    # Find the next "setView" or similar after the fetch block
    next_set = f.find('setCaseView("list")', idx)
    if next_set > 0:
        f = f[:next_set] + '{ const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: caseData ? "update" : "create", entityType: "case", newValue: JSON.stringify(d).slice(0, 200) }); }\n        ' + f[next_set:]
        print("Wired audit into case save")

# Wire audit into client save
old_client_save = 'body: JSON.stringify({ action: "create", ...clientForm'
if old_client_save in f:
    idx = f.find(old_client_save)
    next_set = f.find('setClientView("list")', idx)
    if next_set > 0:
        f = f[:next_set] + '{ const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: clientData ? "update" : "create", entityType: "client", newValue: JSON.stringify(clientForm).slice(0, 200) }); }\n        ' + f[next_set:]
        print("Wired audit into client save")

# Wire Hijri into case detail dates - find created_at display
old_created = 'c.created_at'
# Too generic - skip, would need more specific context

# Wire Hijri into hearing dates in dashboard
old_hearing_date = '{h.hearing_date}'
if old_hearing_date in f:
    f = f.replace(
        old_hearing_date,
        '{h.hearing_date}{h.hearing_date && <span className="text-[9px] text-slate-300 ml-1">({formatDualDate(h.hearing_date).split("(")[1]}</span>}',
        1  # only first occurrence
    )
    print("Added Hijri to hearing dates")

# Wire Hijri into deadline dates
old_deadline_date = '{d.due_date}'
if old_deadline_date in f:
    f = f.replace(
        old_deadline_date,
        '{d.due_date}{d.due_date && <span className="text-[9px] text-slate-300 ml-1">({formatDualDate(d.due_date).split("(")[1]}</span>}',
        1
    )
    print("Added Hijri to deadline dates")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("Dashboard wiring done")
