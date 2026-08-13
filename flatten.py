"""
Flatten project files untuk clasp push.
Copy semua .gs dan .html ke root dir d:\KP4\
Karena Google Apps Script tidak support subfolder.
"""
import shutil, os

ROOT = 'd:\\KP4'
DIRS = ['src', 'web', 'tests']

copied = []
for d in DIRS:
    full = os.path.join(ROOT, d)
    if not os.path.exists(full):
        continue
    for f in os.listdir(full):
        if f.endswith('.gs') or f.endswith('.html'):
            src  = os.path.join(full, f)
            dest = os.path.join(ROOT, f)
            shutil.copy2(src, dest)
            copied.append(f)
            print('Copied: %s -> %s' % (src, dest))

print('\nTotal: %d files copied.' % len(copied))
print('Files in root:')
for f in sorted(os.listdir(ROOT)):
    if f.endswith('.gs') or f.endswith('.html') or f.endswith('.json'):
        print('  ' + f)
