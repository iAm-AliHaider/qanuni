f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\invoices\page.tsx', 'r', encoding='utf-8').read()

# Add ZATCA column header to the table
old_header = '<th className="px-4 py-2 text-right font-medium">Amount</th><th className="px-4 py-2 text-center font-medium">Actions</th>'
new_header = '<th className="px-4 py-2 text-right font-medium">Amount</th><th className="px-4 py-2 text-center font-medium">ZATCA</th><th className="px-4 py-2 text-center font-medium">Actions</th>'

if old_header in f:
    f = f.replace(old_header, new_header)
    print("Added ZATCA header")
else:
    # Try finding it differently
    import re
    # Add after Amount th
    f = f.replace('>Amount</th>', '>Amount</th><th className="px-4 py-2 text-center font-medium">ZATCA</th>', 1)
    print("Added ZATCA header (alt)")

# Add ZATCA cell before the Actions cell
old_actions = '''<td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">'''
new_with_zatca = '''<td className="px-4 py-2.5 text-center"><ZATCABadge inv={inv} /></td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">'''

if old_actions in f:
    f = f.replace(old_actions, new_with_zatca, 1)
    print("Added ZATCA cell to table rows")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\invoices\page.tsx', 'w', encoding='utf-8').write(f)
print("DONE")
