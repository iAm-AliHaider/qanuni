f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'r', encoding='utf-8').read()

# Add ZATCA nav item to Finance section, after Retainers
# Find retainers nav item and add ZATCA after it
old = '''{ icon: "🔄", label: t("nav.retainers"), href: "/retainers" },'''
new = '''{ icon: "🔄", label: t("nav.retainers"), href: "/retainers" },
        { icon: "📋", label: "ZATCA", href: "/zatca" },'''

if old in f:
    f = f.replace(old, new)
    print("Added ZATCA to sidebar")
else:
    # Try without t() wrapper
    old2 = 'label: t("nav.retainers"), href: "/retainers"'
    if old2 in f:
        f = f.replace(old2, old2 + ' },\n        { icon: "📋", label: "ZATCA", href: "/zatca"')
        print("Added ZATCA to sidebar (alt)")
    else:
        print("WARN: Could not find retainers nav item")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'w', encoding='utf-8').write(f)
