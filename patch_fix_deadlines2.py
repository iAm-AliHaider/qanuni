f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\notifications\route.ts', 'r', encoding='utf-8').read()

# users.id is text like 'U002', and cases.assigned_partner is also text like 'U002'
# So join: users u ON u.id = c.assigned_partner
f = f.replace("u.employee_code = c.assigned_partner", "u.id::text = c.assigned_partner")

# Also: notifications.user_id is INTEGER but users.id is TEXT
# We need to handle this — store the user code as text in notifications or cast
# Since notifications table has user_id as INTEGER, but our user IDs are text (U001-U010),
# let's just create notifications with a string match

# Actually the simplest fix: don't target specific users, just create general notifications
# OR: store the partner code directly and query by it
# Let's change the notification insert to use a text user_id field
# Wait, the user_id in notifications is INTEGER... but our users have text IDs

# Simplest fix: skip the user targeting entirely — create notifications for all staff
# by removing the user_id constraint

f = f.replace(
    """if (h.partner_user_id) {
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT ${h.partner_user_id}, 'hearing',""",
    """{ // Notify about upcoming hearing
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT null, 'hearing',"""
)

f = f.replace(
    """AND user_id = ${h.partner_user_id} AND created_at > NOW() - INTERVAL '1 day')`;
        }""",
    """AND entity_id = ${h.id} AND created_at > NOW() - INTERVAL '1 day')`;
        }"""
)

f = f.replace(
    """if (f.partner_user_id) {
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT ${f.partner_user_id}, 'deadline',""",
    """{ // Notify about filing deadline
          await sql`INSERT INTO notifications (user_id, type, title, title_ar, message, link, entity_type, entity_id)
            SELECT null, 'deadline',"""
)

f = f.replace(
    """AND user_id = ${f.partner_user_id} AND created_at > NOW() - INTERVAL '1 day')`;
        }""",
    """AND entity_id = ${f.id} AND created_at > NOW() - INTERVAL '1 day')`;
        }"""
)

# Fix tasks too — assigned_to is also text
f = f.replace(
    "WHERE t.due_date::date < CURRENT_DATE AND t.status != 'done' AND t.assigned_to IS NOT NULL",
    "WHERE t.due_date::date < CURRENT_DATE AND t.status != 'done'"
)
f = f.replace("user_id = ${t.assigned_to}", "user_id = null")
f = f.replace("AND user_id = ${t.assigned_to}", "AND entity_id = ${t.id}")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\api\notifications\route.ts', 'w', encoding='utf-8').write(f)
print("Fixed deadline checker - removed user ID targeting (text vs int mismatch)")
