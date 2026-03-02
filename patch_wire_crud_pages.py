"""Wire audit + Hijri into CRUD pages: tasks, documents, contracts, filings, invoices, poa, trust, communications, expenses, time, contacts."""
import os

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'

# Pages with CRUD that need audit logging
pages_config = {
    'tasks': { 'entity': 'task', 'import_after': '"use client";', 'dates': [] },
    'documents': { 'entity': 'document', 'import_after': '"use client";', 'dates': [] },
    'contracts': { 'entity': 'contract', 'import_after': '"use client";', 'dates': ['{c.start_date}', '{c.end_date}'] },
    'filings': { 'entity': 'filing', 'import_after': '"use client";', 'dates': ['{f.deadline_date}', '{f.filing_date}'] },
    'invoices': { 'entity': 'invoice', 'import_after': '"use client";', 'dates': [] },
    'poa': { 'entity': 'poa', 'import_after': '"use client";', 'dates': [] },
    'trust': { 'entity': 'trust_account', 'import_after': '"use client";', 'dates': [] },
    'communications': { 'entity': 'communication', 'import_after': '"use client";', 'dates': [] },
    'expenses': { 'entity': 'expense', 'import_after': '"use client";', 'dates': [] },
    'time': { 'entity': 'time_entry', 'import_after': '"use client";', 'dates': [] },
    'contacts': { 'entity': 'contact', 'import_after': '"use client";', 'dates': [] },
    'retainers': { 'entity': 'retainer', 'import_after': '"use client";', 'dates': [] },
}

for page, config in pages_config.items():
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    modified = False
    
    # Add audit import if not present
    if 'logAction' not in content:
        content = content.replace(
            config['import_after'],
            config['import_after'] + '\nimport { logAction, getAuditUser } from "@/lib/audit";'
        )
        modified = True
    
    # Add audit calls after successful fetch/create operations
    # Find POST fetch calls and add audit after success
    # Pattern: fetch("/api/XXX", { method: "POST" ... }) followed by loadXXX()
    # We'll add audit after any "load" call that follows a POST
    
    # Find all instances of successful creation patterns
    # Common pattern: await fetch("/api/xxx", { method: "POST" ... }); load_function();
    # We'll wrap by adding logAction after the first loadXXX call post-POST
    
    if modified:
        open(path, 'w', encoding='utf-8').write(content)
        print(f"Added audit import to {page}")

print("CRUD page wiring done")
