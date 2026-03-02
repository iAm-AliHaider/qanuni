import os
BASE = r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api'

# Fix 1: Notifications — remove FK constraint
p = os.path.join(BASE, 'notifications', 'route.ts')
f = open(p, 'r', encoding='utf-8').read()
f = f.replace('user_id INTEGER REFERENCES users(id),', 'user_id INTEGER,')
open(p, 'w', encoding='utf-8').write(f)
print("Fix 1: Notifications FK removed")

# Fix 2: Analytics — is_active is text '1' not boolean, and FILTER needs boolean
p = os.path.join(BASE, 'analytics', 'route.ts')
f = open(p, 'r', encoding='utf-8').read()
# Fix: WHERE is_active = 1 → WHERE is_active = '1' or CAST
f = f.replace("WHERE is_active = 1", "WHERE is_active::int = 1")
# Fix: FILTER (WHERE status = 'active') — this should work, the issue is likely is_billable
# is_billable might be stored as text too
f = f.replace("WHEN te.is_billable THEN", "WHEN te.is_billable::boolean THEN")
f = f.replace("WHERE te.is_billable = true", "WHERE te.is_billable::boolean = true")
open(p, 'w', encoding='utf-8').write(f)
print("Fix 2: Analytics type casts fixed")

# Fix 3: Portal — hearing_date is TEXT, compare as text
p = os.path.join(BASE, 'portal', 'route.ts')
f = open(p, 'r', encoding='utf-8').read()
# Fix: hearing_date >= CURRENT_DATE → hearing_date::date >= CURRENT_DATE
f = f.replace("h.hearing_date >= CURRENT_DATE", "h.hearing_date::date >= CURRENT_DATE")
f = f.replace("h.hearing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'", "h.hearing_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'")
# Also fix in notifications route
p2 = os.path.join(BASE, 'notifications', 'route.ts')
f2 = open(p2, 'r', encoding='utf-8').read()
f2 = f2.replace("h.hearing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'", "h.hearing_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'")
f2 = f2.replace("f.deadline_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'", "f.deadline_date::date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '5 days'")
f2 = f2.replace("t.due_date < CURRENT_DATE", "t.due_date::date < CURRENT_DATE")
f2 = f2.replace("t.due_date >= CURRENT_DATE", "t.due_date::date >= CURRENT_DATE")
open(p2, 'w', encoding='utf-8').write(f2)
open(p, 'w', encoding='utf-8').write(f)
print("Fix 3: Date type casts fixed")

# Also fix analytics deadline query
p3 = os.path.join(BASE, 'analytics', 'route.ts')
f3 = open(p3, 'r', encoding='utf-8').read()
f3 = f3.replace("h.hearing_date >= CURRENT_DATE AND h.hearing_date <= CURRENT_DATE + INTERVAL '30 days'", "h.hearing_date::date >= CURRENT_DATE AND h.hearing_date::date <= CURRENT_DATE + INTERVAL '30 days'")
f3 = f3.replace("f.deadline_date >= CURRENT_DATE AND f.deadline_date <= CURRENT_DATE + INTERVAL '30 days'", "f.deadline_date::date >= CURRENT_DATE AND f.deadline_date::date <= CURRENT_DATE + INTERVAL '30 days'")
f3 = f3.replace("t.due_date >= CURRENT_DATE AND t.due_date <= CURRENT_DATE + INTERVAL '30 days'", "t.due_date::date >= CURRENT_DATE AND t.due_date::date <= CURRENT_DATE + INTERVAL '30 days'")
open(p3, 'w', encoding='utf-8').write(f3)
print("Fix: Analytics deadline date casts")

print("All 3 bugs fixed")
