"""Wire audit logging into all CRUD pages - v2 with correct patterns."""
import os

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'

# Each page: (dir, search_string, replacement)
# We add audit call right after the fetch().then or after load() in create functions
wires = [
    ('tasks', 
     '    setShowForm(false); setForm({ title: "", case_id: "", priority: "medium", due_date: "", assigned_to: "", description: "", category: "general" }); load();',
     '    setShowForm(false); setForm({ title: "", case_id: "", priority: "medium", due_date: "", assigned_to: "", description: "", category: "general" }); load();\n    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "create", entityType: "task" }); }'),
    ('tasks',
     '    load();\n  };\n\n  const create',  # updateStatus load
     '    load();\n    { const u = getAuditUser(); logAction({ userId: u.id, userName: u.name, action: "update", entityType: "task" }); }\n  };\n\n  const create'),
]

# Generic pattern for pages that use: setShowCreate(false); ... load/loadData
generic_pages = [
    ('contracts', 'contract'),
    ('filings', 'filing'),
    ('poa', 'poa'),
    ('trust', 'trust_account'),
    ('communications', 'communication'),
    ('expenses', 'expense'),
    ('contacts', 'contact'),
    ('retainers', 'retainer'),
    ('documents', 'document'),
]

for page, entity in generic_pages:
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        continue
    content = open(path, 'r', encoding='utf-8').read()
    if f'logAction({{' in content:
        continue
    
    # Find any "method: 'POST'" or 'method: "POST"' and the subsequent load/set calls
    # Common: await fetch(...POST...); ...some state resets...; loadData/load();
    
    # Strategy: find all lines with "load()" or "loadData()" or "loadPoas()" that follow a POST
    # and add audit after
    
    # Simpler: find the create/save function and add audit at the end
    # Pattern: const create/save = async () => { ... load(); }
    # Or: .then(() => { ... load(); })
    
    import re
    # Find: POST ... followed by load within 200 chars
    matches = list(re.finditer(r'method:\s*"POST"', content))
    modified = False
    for m in matches:
        # Find the next load() call
        search_region = content[m.end():m.end()+500]
        load_match = re.search(r'(load(?:Data|Poas|Contacts)?)\(\);', search_region)
        if load_match:
            abs_pos = m.end() + load_match.end()
            audit_call = f'\n    {{ const u = getAuditUser(); logAction({{ userId: u.id, userName: u.name, action: "create", entityType: "{entity}" }}); }}'
            content = content[:abs_pos] + audit_call + content[abs_pos:]
            modified = True
            break
    
    if modified:
        open(path, 'w', encoding='utf-8').write(content)
        print(f"Wired audit into {page}")
    else:
        print(f"SKIP {page}")

# Apply specific wires
for page, old, new in wires:
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        continue
    content = open(path, 'r', encoding='utf-8').read()
    if old in content and f'logAction({{' not in content.split(old)[1][:100]:
        content = content.replace(old, new, 1)
        open(path, 'w', encoding='utf-8').write(content)
        print(f"Wired audit into {page} (specific)")

print("\nDone")
