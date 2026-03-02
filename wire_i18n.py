"""Wire i18n t() calls into all Qanuni pages."""
import os, re

BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app'

# Map of page -> list of (old_string, new_t_call) replacements
# We focus on headers, button labels, KPI labels, empty states, and form labels
PAGES = {
    'tasks': [
        ('useLocale', 'import { useLocale } from "@/lib/LocaleContext";'),
        # Hook
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        # Add hook call after first useState
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('>Task Board<', '>{t("task.board")}<'),
        ('>New Task<', '>{t("task.new_task")}<'),
        ('"Task title *"', '{t("task.title") + " *"}'),
        ('"Case (optional)"', '{t("common.case") + " (" + t("common.optional") + ")"}'),
        ('"Assign to..."', '{t("task.assign_to")}'),
        ('"Description"', '{t("common.description")}'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
        ('>Start<', '>{t("common.start")}<'),
        ('>Done<', '>{t("common.done")}<'),
        ('>Reopen<', '>{t("common.reopen")}<'),
    ],
    'documents': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('>Documents<', '>{t("doc.title")}<'),
        ('>New Document<', '>{t("doc.new_doc")}<'),
        ('>Total Docs<', '>{t("doc.total_docs")}<'),
        ('>Categories<', '>{t("doc.categories")}<'),
        ('>Linked Cases<', '>{t("doc.linked_cases")}<'),
        ('"Title *"', '{t("common.title") + " *"}'),
        ('"Link to case (optional)"', '{t("doc.link_case")}'),
        ('"Content / notes"', '{t("doc.content_notes")}'),
        ('>No documents found<', '>{t("doc.no_docs")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
        ('>Download<', '>{t("common.download")}<'),
        ('>File uploaded<', '>{t("common.file_uploaded")}<'),
        ('>Uploading...<', '>{t("common.uploading")}<'),
        ('>Click to upload file<', '>{t("common.click_upload")}<'),
    ],
    'contacts': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [data, setData] = useState<any>(null);', 'const { t } = useLocale();\n  const [data, setData] = useState<any>(null);'),
        ('>Contacts Directory<', '>{t("contact.title")}<'),
        ('>Add Contact<', '>{t("contact.add")}<'),
        ('"Search contacts..."', '{t("contact.search")}'),
        ('>No contacts found<', '>{t("contact.no_contacts")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Save<', '>{t("common.save")}<'),
    ],
    'compliance': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('>Compliance & Risk<', '>{t("comp.title")}<'),
        ('>Conflict of Interest Check<', '>{t("comp.conflict_check")}<'),
        ('"Enter party/client name to check..."', '{t("comp.enter_party")}'),
        ('>No Conflicts Found<', '>{t("comp.no_conflicts")}<'),
        ('>Pending KYC<', '>{t("comp.pending_kyc")}<'),
        ('>High Risk Clients<', '>{t("comp.high_risk")}<'),
        ('>Conflict Checks<', '>{t("comp.recent_checks").split(" ").slice(0,2).join(" ")}<'),
        ('>POAs Expiring<', '>{t("comp.poas_expiring")}<'),
        ('>Pending KYC Verification<', '>{t("comp.kyc_verify")}<'),
        ('>Recent Conflict Checks<', '>{t("comp.recent_checks")}<'),
        ('>Review<', '>{t("comp.review")}<'),
        ('{checking ? "Checking..." : "Run Check"}', '{checking ? t("comp.checking") : t("comp.run_check")}'),
    ],
    'contracts': [
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('>Contract Management<', '>{t("ctr.title")}<'),
        ('>New Contract<', '>{t("ctr.new_contract")}<'),
        ('>Active Value (SAR)<', '>{t("ctr.active_value")}<'),
        ('>Expiring Soon<', '>{t("ctr.expiring_soon")}<'),
        ('"Contract title *"', '{t("ctr.contract_title") + " *"}'),
        ('"Terms & conditions"', '{t("ctr.terms")}'),
        ('"Key obligations"', '{t("ctr.obligations")}'),
        ('>Firm Signed<', '>{t("ctr.firm_signed")}<'),
        ('>Firm Pending<', '>{t("ctr.firm_pending")}<'),
        ('>Client Signed<', '>{t("ctr.client_signed")}<'),
        ('>Client Pending<', '>{t("ctr.client_pending")}<'),
        ('>Sign (Firm)<', '>{t("common.sign_firm")}<'),
        ('>Sign (Client)<', '>{t("common.sign_client")}<'),
        ('>No contracts<', '>{t("ctr.no_contracts")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
    ],
    'filings': [
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('>Court Filings<', '>{t("fil.title")}<'),
        ('>New Filing<', '>{t("fil.new_filing")}<'),
        ('"Filing title *"', '{t("fil.filing_title") + " *"}'),
        ('>Pending<', '>{t("common.pending")}<'),
        ('>Filed<', '>{t("fil.filed")}<'),
        ('>Responses Due<', '>{t("fil.responses_due")}<'),
        ('>Overdue<', '>{t("common.overdue")}<'),
        ('>Response Required<', '>{t("fil.response_required")}<'),
        ('>OVERDUE<', '>{t("common.overdue")}<'),
        ('>Mark Filed<', '>{t("common.mark_filed")}<'),
        ('"Najiz ref"', '{t("fil.najiz_ref")}'),
        ('"Response deadline"', '{t("fil.response_deadline")}'),
        ('>Response required from opposing party<', '>{t("fil.response_opposing")}<'),
        ('"Notes"', '{t("common.notes")}'),
        ('>No court filings<', '>{t("fil.no_filings")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
    ],
    'communications': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('>Communications<', '>{t("comm.title")}<'),
        ('>Log Communication<', '>{t("comm.log_comm")}<'),
        ('"Subject"', '{t("comm.subject")}'),
        ('"Notes / summary"', '{t("comm.summary")}'),
        ('>No communications logged<', '>{t("comm.no_comms")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Save<', '>{t("common.save")}<'),
    ],
    'expenses': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('>Expenses<', '>{t("exp.title")}<'),
        ('>Add Expense<', '>{t("exp.add_expense")}<'),
        ('>SAR Total<', '>{t("exp.total_amount")}<'),
        ('"Description *"', '{t("common.description") + " *"}'),
        ('>Billable to client<', '>{t("exp.billable_client")}<'),
        ('>No expenses<', '>{t("exp.no_expenses")}<'),
        ('>Approve<', '>{t("common.approve")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Save<', '>{t("common.save")}<'),
    ],
    'poa': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [poas, setPoas] = useState<any[]>([]);', 'const { t } = useLocale();\n  const [poas, setPoas] = useState<any[]>([]);'),
        ('>Power of Attorney<', '>{t("poa.title")}<'),
        ('>New POA<', '>{t("poa.new_poa")}<'),
        ('>New Power of Attorney<', '>{t("poa.new_poa")}<'),
        ('"Select Client *"', '{t("poa.select_client") + " *"}'),
        ('"Select Lawyer *"', '{t("poa.select_lawyer") + " *"}'),
        ('"Scope of authority"', '{t("poa.scope")}'),
        ('"Notary ref"', '{t("poa.notary_ref")}'),
        ('>No powers of attorney<', '>{t("poa.no_poas")}<'),
        ('>Revoke<', '>{t("common.revoke")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
    ],
    'trust': [
        ('const [user, setUser] = useState<any>(null);', 'const { t } = useLocale();\n  const [user, setUser] = useState<any>(null);'),
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('>Trust Accounts<', '>{t("trust.title")}<'),
        ('>New Account<', '>{t("trust.new_account")}<'),
        ('>Accounts<', '>{t("trust.accounts")}<'),
        ('>Total Balance (SAR)<', '>{t("trust.total_balance")}<'),
        ('>Client Trust Accounts<', '>{t("trust.client_trust")}<'),
        ('>Recent Transactions<', '>{t("trust.recent_tx")}<'),
        ('>New Trust Account<', '>{t("trust.new_trust")}<'),
        ('"Select Client *"', '{t("poa.select_client") + " *"}'),
        ('"Reference / receipt #"', '{t("trust.reference")}'),
        ('>Deposit<', '>{t("common.deposit")}<'),
        ('>Withdraw<', '>{t("common.withdraw")}<'),
        ('>No trust accounts<', '>{t("trust.no_accounts")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
    ],
    'retainers': [
        ('const [data, setData] = useState<any>(null);', 'const { t } = useLocale();\n  const [data, setData] = useState<any>(null);'),
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('>Retainer Agreements<', '>{t("ret.title")}<'),
        ('>New Retainer<', '>{t("ret.new_retainer")}<'),
        ('>Monthly Value (SAR)<', '>{t("ret.monthly_value")}<'),
        ('>No retainer agreements<', '>{t("ret.no_retainers")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
        ('>Create<', '>{t("common.create")}<'),
    ],
    'reports': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [data, setData] = useState<any>(null);', 'const { t } = useLocale();\n  const [data, setData] = useState<any>(null);'),
        ('>Reports & Analytics<', '>{t("rep.title")}<'),
        ('>Export PDF<', '>{t("common.export_pdf")}<'),
        ('>Cases by Status<', '>{t("rep.cases_by_status")}<'),
        ('>Cases by Type & Status<', '>{t("rep.cases_by_type")}<'),
        ('>Revenue by Lawyer<', '>{t("rep.revenue_lawyer")}<'),
        ('>Revenue by Client<', '>{t("rep.revenue_client")}<'),
        ('>Monthly Revenue<', '>{t("rep.monthly_revenue")}<'),
        ('>Lawyer Utilization<', '>{t("rep.lawyer_util")}<'),
        ('>Invoice Aging Report<', '>{t("rep.invoice_aging")}<'),
        ('>Current<', '>{t("rep.current")}<'),
        ('>30 Days<', '>{t("rep.30_days")}<'),
        ('>60 Days<', '>{t("rep.60_days")}<'),
        ('>90+ Days<', '>{t("rep.90_plus")}<'),
    ],
    'hr': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [data, setData] = useState<any>(null);', 'const { t } = useLocale();\n  const [data, setData] = useState<any>(null);'),
        ('>Team & HR<', '>{t("hr.title")}<'),
        ('>Total Staff<', '>{t("hr.total_staff")}<'),
        ('>By Department<', '>{t("hr.by_dept")}<'),
        ('>By Role<', '>{t("hr.by_role")}<'),
        ('>Team Directory<', '>{t("hr.directory")}<'),
    ],
    'research': [
        ('"use client";', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";'),
        ('const [search, setSearch] = useState("");', 'const { t } = useLocale();\n  const [search, setSearch] = useState("");'),
        ('>Legal Research<', '>{t("res.title")}<'),
        ('>Search Legal Topics<', '>{t("res.search_topics")}<'),
        ('"Search topics, tags..."', '{t("res.search_placeholder")}'),
        ('>AI-Powered Research Coming Soon<', '>{t("res.ai_coming")}<'),
    ],
    'settings': [
        ('"use client";\nimport AppShell', '"use client";\nimport { useLocale } from "@/lib/LocaleContext";\nimport AppShell'),
        ('const [data, setData] = useState<any>(null);', 'const { t } = useLocale();\n  const [data, setData] = useState<any>(null);'),
        ('>Firm Settings<', '>{t("set.title")}<'),
        ('>Add Court<', '>{t("set.add_court")}<'),
        ('"Court name *"', '{t("set.court_name") + " *"}'),
        ('"City"', '{t("set.city")}'),
        ('>No practice areas defined<', '>{t("set.no_areas")}<'),
        ('>No document templates<', '>{t("set.no_templates")}<'),
        ('>Cancel<', '>{t("common.cancel")}<'),
    ],
}

for page, replacements in PAGES.items():
    path = os.path.join(BASE, page, 'page.tsx')
    if not os.path.exists(path):
        print(f"SKIP {page}")
        continue
    
    content = open(path, 'r', encoding='utf-8').read()
    
    # Skip if already has useLocale (avoid double-wiring)
    if 'useLocale' in content:
        # Still apply text replacements
        for old, new in replacements:
            if old == 'useLocale' or 'import { useLocale' in old or 'const { t }' in new.strip().split('\n')[0] if '\n' in new else False:
                continue
            if old in content:
                content = content.replace(old, new, 1)
        open(path, 'w', encoding='utf-8').write(content)
        print(f"UPDATE {page} (already had useLocale, applied text replacements)")
        continue
    
    count = 0
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new, 1)
            count += 1
    
    open(path, 'w', encoding='utf-8').write(content)
    print(f"OK {page} ({count} replacements)")

print("\nDone!")
