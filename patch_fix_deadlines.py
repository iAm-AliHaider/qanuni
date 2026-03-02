f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\notifications\route.ts', 'r', encoding='utf-8').read()

# Fix: lead_partner_id doesn't exist, use assigned_partner which is a user code like 'U002'
# We need to join on users to get the user id from the code
# Simpler: just use a subquery or skip the user_id targeting for now and notify all

# Replace the complex partner-targeted notification with a simpler version
# that creates notifications for the assigned partner by looking up their user id

f = f.replace(
    "SELECT h.*, c.title as case_title, c.lead_partner_id FROM hearings h JOIN cases c ON h.case_id = c.id WHERE h.hearing_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'",
    "SELECT h.*, c.title as case_title, u.id as partner_user_id FROM hearings h JOIN cases c ON h.case_id = c.id LEFT JOIN users u ON u.employee_code = c.assigned_partner WHERE h.hearing_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'"
)

f = f.replace('if (h.lead_partner_id) {', 'if (h.partner_user_id) {')
f = f.replace('user_id = ${h.lead_partner_id}', 'user_id = ${h.partner_user_id}')
f = f.replace('AND user_id = ${h.lead_partner_id}', 'AND user_id = ${h.partner_user_id}')

f = f.replace(
    "SELECT f.*, c.title as case_title, c.lead_partner_id FROM court_filings f JOIN cases c ON f.case_id = c.id WHERE f.deadline_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days' AND f.status != 'filed'",
    "SELECT f.*, c.title as case_title, u.id as partner_user_id FROM court_filings f JOIN cases c ON f.case_id = c.id LEFT JOIN users u ON u.employee_code = c.assigned_partner WHERE f.deadline_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days' AND f.status != 'filed'"
)
f = f.replace('if (f.lead_partner_id) {', 'if (f.partner_user_id) {')
f = f.replace('user_id = ${f.lead_partner_id}', 'user_id = ${f.partner_user_id}')
f = f.replace('AND user_id = ${f.lead_partner_id}', 'AND user_id = ${f.partner_user_id}')

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\notifications\route.ts', 'w', encoding='utf-8').write(f)
print("Fixed deadline checker — uses assigned_partner via users join")
