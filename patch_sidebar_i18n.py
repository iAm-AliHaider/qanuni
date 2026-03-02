f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'r', encoding='utf-8').read()

# Map nav labels to i18n keys
label_map = {
    '"Dashboard"': 't("nav.dashboard")',
    '"Court Calendar"': 't("nav.court_calendar")',
    '"Tasks"': 't("nav.tasks")',
    '"Cases"': 't("nav.cases")',
    '"Clients"': 't("nav.clients")',
    '"Documents"': 't("nav.documents")',
    '"Power of Attorney"': 't("nav.poa")',
    '"Contracts"': 't("nav.contracts")',
    '"Court Filings"': 't("nav.filings")',
    '"Time Tracking"': 't("nav.time")',
    '"Invoicing"': 't("nav.invoices")',
    '"Expenses"': 't("nav.expenses")',
    '"Trust Accounts"': 't("nav.trust")',
    '"Retainers"': 't("nav.retainers")',
    '"Contacts"': 't("nav.contacts")',
    '"Communications"': 't("nav.communications")',
    '"Compliance"': 't("nav.compliance")',
    '"Reports"': 't("nav.reports")',
    '"Legal Research"': 't("nav.research")',
    '"Team & HR"': 't("nav.hr")',
    '"Settings"': 't("nav.settings")',
}

# Section titles
section_map = {
    '"Core"': 't("section.core")',
    '"Case Management"': 't("section.case_management")',
    '"Finance"': 't("section.finance")',
    '"Operations"': 't("section.operations")',
    '"Insights"': 't("section.insights")',
}

# Replace nav item labels - they appear as: label: "xxx"
for old_label, new_label in label_map.items():
    f = f.replace(f'label: {old_label}', f'label: {new_label}')

# Replace section titles - they appear as: title: "xxx"
for old_title, new_title in section_map.items():
    f = f.replace(f'title: {old_title}', f'title: {new_title}')

# The NAV_SECTIONS is defined at module level but t() needs to be called inside the component
# We need to move the labels to be computed inside the component
# Actually, since NAV_SECTIONS uses t() which requires the hook context,
# we need to make NAV_SECTIONS a function that takes t

# Replace the const declaration to be inside the component
# Find "const NAV_SECTIONS" and move it inside getNavSections function

# Actually, simpler: make it a function
f = f.replace(
    'const NAV_SECTIONS = [',
    'function getNavSections(t: (k: string) => string) { return ['
)

# Find the closing of NAV_SECTIONS array
# It ends with "];" before the ROLE_LABELS
f = f.replace(
    '''  },
];

const ROLE_LABELS''',
    '''  },
]; }

const ROLE_LABELS'''
)

# Now inside the component, call getNavSections
f = f.replace(
    'const { t, isRtl } = useLocale();',
    'const { t, isRtl } = useLocale();\n  const NAV_SECTIONS = getNavSections(t);'
)

# Replace section.title display
f = f.replace(
    '{section.title}',
    '{section.title}'
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\components\AppShell.tsx', 'w', encoding='utf-8').write(f)
print("SIDEBAR i18n OK")
