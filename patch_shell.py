f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'r', encoding='utf-8').read()

# Remove pathname === "/" check - dashboard should get sidebar too when logged in
f = f.replace(
    "if (!user || pathname === \"/\") return <>{children}</>;",
    "if (!user) return <>{children}</>;"
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'w', encoding='utf-8').write(f)
print("OK")
