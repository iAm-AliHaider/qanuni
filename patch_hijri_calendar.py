f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\calendar\page.tsx', 'r', encoding='utf-8').read()

# Add hijri import
if 'hijri' not in f:
    f = f.replace(
        '"use client";',
        '"use client";\nimport { toHijriShort } from "@/lib/hijri";'
    )

# Add Hijri date display next to month title
# Find where the month name is displayed and add Hijri equivalent
if 'toHijriShort' not in f.split('return')[1] if 'return' in f else '':
    # Add hijri month display after gregorian month
    old_month = '.toLocaleDateString("en-US", { month: "long", year: "numeric" })'
    if old_month in f:
        f = f.replace(
            old_month,
            old_month + '} <span className="text-sm text-slate-400 font-normal ml-2">({toHijriShort(currentMonth)})</span>{""'
        )
        print("Added Hijri month to calendar header")

# Add Hijri date to each calendar day cell
# Find the day number display and add Hijri
old_day_display = '{day.getDate()}'
# Count occurrences
count = f.count(old_day_display)
if count > 0:
    # Replace first occurrence (the main day display)
    f = f.replace(
        old_day_display,
        '{day.getDate()}<br/><span className="text-[8px] text-slate-300">{toHijriShort(day).split("/")[1]}</span>',
        1
    )
    print(f"Added Hijri day numbers (had {count} occurrences)")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\calendar\page.tsx', 'w', encoding='utf-8').write(f)
print("DONE")
