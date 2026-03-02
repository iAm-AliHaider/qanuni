f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Add i18n imports near the top
if 'useLocale' not in f:
    f = f.replace(
        'import AppShell from "@/components/AppShell";',
        'import AppShell from "@/components/AppShell";\nimport { useLocale, LanguageToggle } from "@/lib/LocaleContext";'
    )

# Add useLocale to LoginPage
f = f.replace(
    'function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {\n  const [users, setUsers] = useState<any[]>([]);\n  const [selectedId, setSelectedId] = useState("");\n  const [pin, setPin] = useState(["", "", "", ""]);\n  const [error, setError] = useState("");\n  const [loading, setLoading] = useState(false);\n  const [mounted, setMounted] = useState(false);',
    'function LoginPage({ onLogin }: { onLogin: (user: User) => void }) {\n  const { t, locale } = useLocale();\n  const [users, setUsers] = useState<any[]>([]);\n  const [selectedId, setSelectedId] = useState("");\n  const [pin, setPin] = useState(["", "", "", ""]);\n  const [error, setError] = useState("");\n  const [loading, setLoading] = useState(false);\n  const [mounted, setMounted] = useState(false);'
)

# Add language toggle to login page footer
f = f.replace(
    '<p className="text-[9px] text-slate-200 mt-1">Powered by Qanuni</p>',
    '<p className="text-[9px] text-slate-200 mt-1">Powered by Qanuni</p>\n          <div className="mt-3 flex justify-center"><LanguageToggle /></div>'
)

# Wire some translations in login
f = f.replace(
    ">Select User</label>",
    ">{t('common.select_user')}</label>"
)
f = f.replace(
    ">Enter PIN</label>",
    ">{t('common.enter_pin')}</label>"
)
f = f.replace(
    '>Choose your account...</option>',
    '>{t("common.choose_account")}</option>'
)
f = f.replace(
    '{loading ? "Signing in..." : "Sign In"}',
    '{loading ? t("common.signing_in") : t("common.sign_in")}'
)
f = f.replace(
    '<p className="text-xs font-medium text-red-600">{error}</p>',
    '<p className="text-xs font-medium text-red-600">{error === "Invalid PIN" ? t("common.invalid_pin") : error}</p>'
)
f = f.replace(
    '>Al-Rashid & Partners Law Firm</p>',
    '>{t("footer.firm_name")}</p>'
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("LOGIN i18n OK")
