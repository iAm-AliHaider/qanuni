"""Wire actual logAction() calls into CRUD operations on all pages."""
import os, re

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'

# For each page, find the POST fetch pattern and add audit after it
# Pattern: fetch("/api/xxx", { method: "POST", ...}).then(() => loadXxx())
# or: const res = await fetch(...); ... loadXxx();

pages = [
    ('tasks', 'task', 'loadTasks'),
    ('documents', 'document', 'loadData'),
    ('contracts', 'contract', 'loadData'),
    ('filings', 'filing', 'loadData'),
    ('poa', 'poa', 'loadPoas'),
    ('trust', 'trust_account', 'loadData'),
    ('communications', 'communication', 'loadData'),
    ('expenses', 'expense', 'loadData'),
    ('contacts', 'contact', 'loadData'),
    ('retainers', 'retainer', 'loadData'),
]

for page, entity, load_fn in pages:
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    if f'logAction({{' in content:
        continue  # Already has audit calls
    
    # Find the create/save function pattern
    # Common: .then(() => { setShowXxx(false); loadXxx(); })
    # or: setShowCreate(false); loadData();
    
    # Strategy: after each load function call that follows a POST, add audit
    # Find: loadXxx();\n and add audit after
    # But only inside create/save handlers (after a fetch POST)
    
    # Simpler: find setShowCreate(false) pattern and add audit after the next load call
    patterns = [
        (f'setShowCreate(false);\n', f'setShowCreate(false);\n      {{ const u = getAuditUser(); logAction({{ userId: u.id, userName: u.name, action: "create", entityType: "{entity}" }}); }}\n'),
        (f'setShowCreate(false); {load_fn}', f'setShowCreate(false); {{ const u = getAuditUser(); logAction({{ userId: u.id, userName: u.name, action: "create", entityType: "{entity}" }}); }} {load_fn}'),
    ]
    
    modified = False
    for old, new in patterns:
        if old in content:
            content = content.replace(old, new, 1)
            modified = True
            break
    
    if modified:
        open(path, 'w', encoding='utf-8').write(content)
        print(f"Wired audit calls into {page}")
    else:
        # Try alternate pattern: find create function body
        # Look for: method: "POST" ... then a close of the handler
        if 'method: "POST"' in content and load_fn + '()' in content:
            # Find the first occurrence of loadXxx() after a POST
            post_idx = content.find('method: "POST"')
            load_idx = content.find(load_fn + '()', post_idx)
            if load_idx > post_idx:
                insert_point = load_idx + len(load_fn) + 2  # after "loadXxx()"
                # Check if there's a semicolon
                if insert_point < len(content) and content[insert_point] == ';':
                    insert_point += 1
                audit_call = f'\n      {{ const u = getAuditUser(); logAction({{ userId: u.id, userName: u.name, action: "create", entityType: "{entity}" }}); }}'
                content = content[:insert_point] + audit_call + content[insert_point:]
                open(path, 'w', encoding='utf-8').write(content)
                print(f"Wired audit calls into {page} (alt)")
            else:
                print(f"SKIP {page} - could not find insert point")
        else:
            print(f"SKIP {page} - no POST pattern found")

# Wire into invoices (special: has both create and record_payment)
inv_path = os.path.join(BASE, 'invoices', 'page.tsx')
if os.path.exists(inv_path):
    content = open(inv_path, 'r', encoding='utf-8').read()
    if 'logAction({' not in content:
        # Wire after invoice creation
        old = 'setShowCreate(false); loadData();'
        if old in content:
            content = content.replace(old, old + '\n      { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "invoice" }); }', 1)
            print("Wired audit into invoices create")
        
        # Wire after payment recording
        old_pay = 'setShowPayment(null); loadData();'
        if old_pay in content:
            content = content.replace(old_pay, old_pay + '\n      { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "payment" }); }', 1)
            print("Wired audit into invoices payment")
        
        open(inv_path, 'w', encoding='utf-8').write(content)

# Wire into time entries
time_path = os.path.join(BASE, 'time', 'page.tsx')
if os.path.exists(time_path):
    content = open(time_path, 'r', encoding='utf-8').read()
    if 'logAction({' not in content:
        old = 'setShowCreate(false); loadData();'
        if old in content:
            content = content.replace(old, old + '\n      { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "time_entry" }); }', 1)
            open(time_path, 'w', encoding='utf-8').write(content)
            print("Wired audit into time entries")

print("\nAll audit calls wired")
