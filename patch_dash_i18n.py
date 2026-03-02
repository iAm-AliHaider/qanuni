f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Add useLocale to Dashboard function
if 'const { t' not in f.split('function Dashboard')[1].split('function ')[0] if 'function Dashboard' in f else '':
    f = f.replace(
        'function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {',
        'function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {\n  const { t } = useLocale();'
    )

# Dashboard tab labels
replacements = [
    ('{ key: "overview", label: "Overview" }', '{ key: "overview", label: t("dash.overview") }'),
    ('{ key: "cases", label: "Cases" }', '{ key: "cases", label: t("nav.cases") }'),
    ('{ key: "clients", label: "Clients" }', '{ key: "clients", label: t("nav.clients") }'),
    ('{ key: "hearings", label: "Hearings" }', '{ key: "hearings", label: t("dash.hearings") }'),
    ('{ key: "tasks", label: "Tasks" }', '{ key: "tasks", label: t("nav.tasks") }'),
    ('{ key: "time_entries", label: "Time" }', '{ key: "time_entries", label: t("case.time") }'),
    ('{ key: "deadlines", label: "Deadlines" }', '{ key: "deadlines", label: t("dash.deadlines") }'),
    # KPIs
    ('label: "Active Cases"', 'label: t("dash.active_cases")'),
    ('label: "Hearings"', 'label: t("dash.hearings")'),
    ('label: "Tasks"', 'label: t("dash.pending_tasks")'),
    ('label: "Deadlines"', 'label: t("dash.deadlines")'),
    ('label: "Clients"', 'label: t("nav.clients")'),
    # Section headers
    ('>Recent Cases<', '>{t("dash.recent_cases")}<'),
    ('>Upcoming Hearings<', '>{t("dash.upcoming_hearings")}<'),
    ('>Pending Tasks<', '>{t("dash.pending_tasks")}<'),
    ('>Upcoming Deadlines<', '>{t("dash.deadlines")}<'),
    ('>View All<', '>{t("dash.view_all")}<'),
    ('>No upcoming hearings<', '>{t("dash.no_upcoming")}<'),
    ('>No pending deadlines<', '>{t("dash.no_deadlines")}<'),
    ('>Cases by Practice Area<', '>{t("dash.cases_by_area")}<'),
    # Case form
    ('>New Case<', '>{t("case.new_case")}<'),
    ('>Edit Case<', '>{t("case.edit_case")}<'),
    ('>Create Case<', '>{t("case.create_case")}<'),
    ('>Case Information<', '>{t("case.info")}<'),
    ('>Opposing Side & Court<', '>{t("case.opposing_court")}<'),
    ('>Team & Fees<', '>{t("case.team_fees")}<'),
    # Client form
    ('>New Client<', '>{t("client.new_client")}<'),
    ('>Edit Client<', '>{t("client.edit_client")}<'),
    # Search
    ('"Search cases..."', '{t("common.search") + " " + t("nav.cases").toLowerCase() + "..."}'),
    ('"Search clients..."', '{t("common.search") + " " + t("nav.clients").toLowerCase() + "..."}'),
    # Empty states  
    ('>No cases found<', '>{t("case.no_cases")}<'),
    ('>No clients found<', '>{t("client.no_clients")}<'),
]

for old, new in replacements:
    if old in f:
        f = f.replace(old, new, 1)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("DASHBOARD i18n OK")
