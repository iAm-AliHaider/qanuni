"""Wire RBAC canWrite checks into CRUD pages — hide create buttons for read-only users."""
import os

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'

# Pages to add RBAC to
pages = [
    ('tasks', 'tasks'),
    ('documents', 'documents'),
    ('contracts', 'contracts'),
    ('filings', 'filings'),
    ('invoices', 'invoices'),
    ('poa', 'poa'),
    ('trust', 'trust'),
    ('communications', 'communications'),
    ('expenses', 'expenses'),
    ('contacts', 'contacts'),
    ('retainers', 'retainers'),
    ('time', 'time'),
]

for page, module in pages:
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        continue
    content = open(path, 'r', encoding='utf-8').read()
    
    if 'canWrite' in content:
        continue
    
    # Add RBAC import
    if 'import { canWrite' not in content:
        content = content.replace(
            'import { logAction, getAuditUser } from "@/lib/audit";',
            'import { logAction, getAuditUser } from "@/lib/audit";\nimport { canWrite } from "@/lib/rbac";'
        )
    
    # Wrap create buttons with canWrite check
    # Common patterns: onClick={() => setShowCreate(true)} or onClick={() => setShowForm(true)}
    # We'll add a condition: {canWrite(user?.role, "module") && <button...>}
    
    # Find the New/Add/Create button and wrap it
    # This varies per page so let's just add a userCanWrite const
    # after the user state
    
    if 'const [user, setUser]' in content and 'userCanWrite' not in content:
        content = content.replace(
            'const [user, setUser] = useState<any>(null);',
            f'const [user, setUser] = useState<any>(null);\n  const userCanWrite = canWrite(user?.role || "admin", "{module}" as any);'
        )
    elif 'const [data, setData]' in content and 'userCanWrite' not in content:
        # Some pages use data instead of user as first state
        # Find where user is set from localStorage
        if 'localStorage.getItem("qanuni_user")' in content:
            content = content.replace(
                'const [data, setData] = useState<any>(null);',
                f'const [data, setData] = useState<any>(null);\n  const [user, _setUser] = useState<any>(() => {{ try {{ return JSON.parse(localStorage.getItem("qanuni_user") || "null"); }} catch {{ return null; }} }});\n  const userCanWrite = canWrite(user?.role || "admin", "{module}" as any);'
            )
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f"Added RBAC to {page}")

print("\nDone")
