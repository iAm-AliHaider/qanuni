f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\analytics\route.ts', 'r', encoding='utf-8').read()

# Fix all FILTER WHERE is_billable — cast to boolean
f = f.replace(
    "FILTER (WHERE is_billable)",
    "FILTER (WHERE is_billable::text = 'true' OR is_billable::text = '1')"
)
f = f.replace(
    "FILTER (WHERE te.is_billable::boolean = true)",
    "FILTER (WHERE te.is_billable::text = 'true' OR te.is_billable::text = '1')"
)
f = f.replace(
    "WHERE te.is_billable::boolean = true",
    "WHERE (te.is_billable::text = 'true' OR te.is_billable::text = '1')"
)
f = f.replace(
    "WHEN te.is_billable::boolean THEN",
    "WHEN (te.is_billable::text = 'true' OR te.is_billable::text = '1') THEN"
)
# Fix FILTER WHERE payment_status
f = f.replace(
    "FILTER (WHERE payment_status = 'paid')",
    "FILTER (WHERE payment_status::text = 'paid')"
)

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\analytics\route.ts', 'w', encoding='utf-8').write(f)
print("Fixed analytics boolean/filter issues")
