f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# The problem: useLocale was inserted right after { in the destructuring params
# Fix: move it to after the opening { of the function body

import re

# Pattern: "const { t } = useLocale();" appears inside params
# We need to find these broken insertions and move them

# Fix CaseForm - the useLocale got into the wrong place
# It should be: function CaseForm({ ...params }) {\n  const { t } = useLocale();\n  ...
# But it became: function CaseForm({\n  const { t } = useLocale(); caseData, ...

for func in ['CaseForm', 'CaseDetail', 'ClientForm', 'ClientDetail']:
    bad = f'const {{ t }} = useLocale(); '
    if bad in f:
        # Find the context - it's inside the function params
        idx = f.find(bad)
        # Remove it from here
        f = f.replace(bad, '', 1)
        print(f"Removed bad useLocale from {func} params")

# Now add useLocale properly - after the function body opens
for func in ['CaseForm', 'CaseDetail', 'ClientForm', 'ClientDetail']:
    # Find "function FuncName(" ... ") {" and add after the "{"
    pattern = f'function {func}('
    idx = f.find(pattern)
    if idx < 0: continue
    
    # Find the ") {" that closes params and opens body
    # Could be on same line or next
    search_from = idx
    body_start = None
    depth = 0
    i = f.find('(', search_from)
    while i < len(f):
        if f[i] == '(':
            depth += 1
        elif f[i] == ')':
            depth -= 1
            if depth == 0:
                # Find the { after )
                j = f.find('{', i)
                if j >= 0 and j - i < 10:  # should be close
                    body_start = j + 1
                break
        i += 1
    
    if body_start:
        # Check if useLocale already exists in next 200 chars
        if 'useLocale' not in f[body_start:body_start+200]:
            f = f[:body_start] + '\n  const { t } = useLocale();' + f[body_start:]
            print(f"Added useLocale to {func}")
        else:
            print(f"{func} already has useLocale")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("FIX2 OK")
