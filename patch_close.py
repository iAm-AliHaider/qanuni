f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# The main dashboard return ends with:
#     </div>
#   );
# }
# 
# Right before the "// MAIN APP" comment
# We need to add </AppShell> after the last </div> of Dashboard

# Find the Dashboard function's closing </div>
# It's the one right before: // ═══ MAIN APP
main_app_marker = '// ═══════════════════════════════════════════════════════════════\n// MAIN APP'
idx = f.find(main_app_marker)
if idx >= 0:
    # Go backwards to find "    </div>\n  );\n}"
    before = f[:idx]
    close_idx = before.rfind('    </div>\n  );\n}')
    if close_idx >= 0:
        f = f[:close_idx] + '    </div></AppShell>\n  );\n}\n\n' + f[idx:]
        print("CLOSED AppShell on Dashboard")
    else:
        print("Could not find Dashboard closing")
else:
    print("MAIN APP marker not found")

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
