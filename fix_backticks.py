import os, glob

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api'

# Fix escaped backticks in all API route files
for path in glob.glob(os.path.join(BASE, '**', 'route.ts'), recursive=True):
    content = open(path, 'r', encoding='utf-8').read()
    if '\\`' in content:
        fixed = content.replace('\\`', '`')
        open(path, 'w', encoding='utf-8').write(fixed)
        print(f"Fixed backticks in {os.path.relpath(path, BASE)}")

# Also fix AppShell
shell = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx'
content = open(shell, 'r', encoding='utf-8').read()
if '\\`' in content:
    content = content.replace('\\`', '`')
    open(shell, 'w', encoding='utf-8').write(content)
    print("Fixed backticks in AppShell")

print("Done")
