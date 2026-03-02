f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Add useLocale to CaseForm, CaseDetail, ClientForm, ClientDetail
for func in ['CaseForm', 'CaseDetail', 'ClientForm', 'ClientDetail']:
    # Find function signature and add useLocale after first line
    pattern = f'function {func}('
    idx = f.find(pattern)
    if idx >= 0:
        # Find the opening brace of the function
        brace = f.find('{', idx + len(pattern))
        if brace >= 0:
            # Check if t is already defined
            next_chunk = f[brace:brace+200]
            if 'const { t }' not in next_chunk and 'useLocale' not in next_chunk:
                f = f[:brace+1] + '\n  const { t } = useLocale();' + f[brace+1:]
                print(f"Added useLocale to {func}")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("FIX OK")
