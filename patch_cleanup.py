f = open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'r', encoding='utf-8').read()

# Remove the giant quick links section from dashboard overview
# It starts with: {/* Quick Links */}
# and ends with the closing </div> of the grid
start = f.find('{/* Quick Links */}')
if start >= 0:
    # Find the matching closing </div> - count the grid div
    # The quick links are in a grid div that opens right after the comment
    # Find the next <div className="grid and count matching divs
    grid_start = f.find('<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3', start)
    if grid_start >= 0:
        # Count divs to find the closing one
        depth = 0
        i = grid_start
        while i < len(f):
            if f[i:i+4] == '<div':
                depth += 1
            elif f[i:i+6] == '</div>':
                depth -= 1
                if depth == 0:
                    end = i + 6
                    # Remove from {/* Quick Links */} to end
                    # Find the start of the line containing {/* Quick Links */}
                    line_start = f.rfind('\n', 0, start) + 1
                    f = f[:line_start] + f[end:]
                    print(f"Removed quick links ({end - line_start} chars)")
                    break
            i += 1

open(r'C:\Users\AI\.openclaw\workspace\qanuni\frontend\src\app\page.tsx', 'w', encoding='utf-8').write(f)
print("CLEANUP OK")
