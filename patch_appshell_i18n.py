f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'r', encoding='utf-8').read()

# Add imports
f = f.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { useLocale, LanguageToggle } from "@/lib/LocaleContext";'
)

# Add useLocale hook inside the component
f = f.replace(
    'const [collapsed, setCollapsed] = useState(false);',
    'const [collapsed, setCollapsed] = useState(false);\n  const { t, isRtl } = useLocale();'
)

# Add language toggle before the collapse button
f = f.replace(
    '{/* Collapse toggle (desktop) */}',
    '{/* Language toggle */}\n          {!collapsed && <div className="px-2.5 mb-1"><LanguageToggle className="w-full justify-center" /></div>}\n\n          {/* Collapse toggle (desktop) */}'
)

# Fix sidebar direction for RTL
f = f.replace(
    'fixed top-0 left-0 h-full z-50',
    'fixed top-0 h-full z-50 ${isRtl ? "right-0" : "left-0"}'
)

# Fix main content margin for RTL
f = f.replace(
    '`transition-all duration-300 ${collapsed ? "md:ml-[68px]" : "md:ml-[260px]"}`',
    '`transition-all duration-300 ${collapsed ? (isRtl ? "md:mr-[68px]" : "md:ml-[68px]") : (isRtl ? "md:mr-[260px]" : "md:ml-[260px]")}`'
)

# Fix sidebar slide direction for RTL  
f = f.replace(
    '${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0',
    '${sidebarOpen ? "translate-x-0" : (isRtl ? "translate-x-full" : "-translate-x-full")} md:translate-x-0'
)

# Fix border direction
f = f.replace(
    'border-r border-slate-200/80',
    '${isRtl ? "border-l" : "border-r"} border-slate-200/80'
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'w', encoding='utf-8').write(f)
print("APPSHELL i18n OK")
