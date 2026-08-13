"""
Validasi project KP4: cek konsistensi placeholder, referensi fungsi, dll.
"""
import os, re

src_dir  = 'src'
web_dir  = 'web'
test_dir = 'tests'

errors   = []
warnings = []

# ─── Kumpulkan semua .gs dan .html files ───────────────────────
gs_files   = [os.path.join(src_dir, f)  for f in os.listdir(src_dir)  if f.endswith('.gs')]
test_files = [os.path.join(test_dir, f) for f in os.listdir(test_dir) if f.endswith('.gs')]
html_files = [os.path.join(web_dir, f)  for f in os.listdir(web_dir)  if f.endswith('.html')]
all_gs     = gs_files + test_files

# ─── Baca semua konten ──────────────────────────────────────────
contents = {}
for fpath in all_gs + html_files:
    with open(fpath, encoding='utf-8') as f:
        contents[fpath] = f.read()

# ─── 1. Cek semua fungsi yang dipanggil dari Code.gs ada didefinisikan ─
print('=== CHECK 1: Function References ===')
code_content = contents.get(os.path.join(src_dir, 'Code.gs'), '')
all_gs_content = '\n'.join([contents[f] for f in all_gs])

# Fungsi yang dipanggil di Code.gs
called = re.findall(r'\b(\w+)\(', code_content)
called = set(called)

# Fungsi yang didefinisikan di semua .gs
defined = re.findall(r'^function\s+(\w+)\s*\(', all_gs_content, re.MULTILINE)
defined = set(defined)

# Built-in GAS functions to ignore
gas_builtins = {
    'HtmlService', 'SpreadsheetApp', 'DriveApp', 'DocumentApp',
    'UrlFetchApp', 'ScriptApp', 'Logger', 'JSON', 'Object',
    'console', 'parseInt', 'parseFloat', 'Math', 'Date', 'Error',
    'Array', 'String', 'Boolean', 'setTimeout', 'setInterval',
    'isNaN', 'encodeURIComponent', 'decodeURIComponent'
}

for fn in called:
    if fn in gas_builtins or fn[0].isupper() or len(fn) < 3:
        continue
    if fn not in defined:
        warnings.append('Code.gs calls undefined function: %s()' % fn)
    else:
        print('  [OK] %s()' % fn)

# ─── 2. Cek placeholder consistency ────────────────────────────
print('\n=== CHECK 2: Placeholder Consistency ===')

# Placeholder yang didefinisikan di TemplateService.gs
template_content = contents.get(os.path.join(src_dir, 'TemplateService.gs'), '')
defined_placeholders = re.findall(r"'({{[\w_]+}})'", template_content)
defined_placeholders = set(defined_placeholders)

print('  Defined placeholders: %d' % len(defined_placeholders))
for p in sorted(defined_placeholders):
    print('    %s' % p)

# ─── 3. Cek COL mapping coverage ────────────────────────────────
print('\n=== CHECK 3: COL Index Coverage ===')
ss_content = contents.get(os.path.join(src_dir, 'SpreadsheetService.gs'), '')
col_defs   = re.findall(r'(\w+)\s*:\s*(\d+)', ss_content)
col_nums   = [int(v) for k, v in col_defs if k.startswith('A') or k in ['NO','NAMA_LENGKAP','NIP']]
print('  Max column index: %d (expected 59)' % (max(col_nums) if col_nums else -1))
print('  Total COL mappings: %d (expected 60)' % len(col_defs))

# ─── 4. Cek HTML includes ────────────────────────────────────────
print('\n=== CHECK 4: HTML Includes ===')
index_content = contents.get(os.path.join(web_dir, 'index.html'), '')
includes = re.findall(r"include\('(\w+)'\)", index_content)
for inc in includes:
    fname = os.path.join(web_dir, inc + '.html')
    if os.path.exists(fname):
        print('  [OK] include("%s")' % inc)
    else:
        errors.append('Missing HTML include: %s.html' % inc)

# ─── 5. Cek google.script.run calls ──────────────────────────────
print('\n=== CHECK 5: google.script.run API calls ===')
js_content = contents.get(os.path.join(web_dir, 'javascript.html'), '')
api_calls  = re.findall(r'google\.script\.run\s*.*?\n\s*\.(\w+)\(', js_content)
print('  API functions called from JS:')
for fn in api_calls:
    if fn in defined:
        print('    [OK] %s()' % fn)
    elif fn not in {'withSuccessHandler', 'withFailureHandler'}:
        errors.append('JS calls undefined API: %s()' % fn)

# ─── 6. Summary ─────────────────────────────────────────────────
print('\n=== SUMMARY ===')
print('  Files: %d GAS + %d HTML' % (len(all_gs), len(html_files)))
print('  Errors:   %d' % len(errors))
print('  Warnings: %d' % len(warnings))

if errors:
    print('\nERRORS:')
    for e in errors:
        print('  [ERROR] ' + e)

if warnings:
    print('\nWARNINGS:')
    for w in warnings:
        print('  [WARN] ' + w)

if not errors:
    print('\n✓ Validasi selesai — tidak ada error kritis.')
else:
    print('\n✗ Ada error yang perlu diperbaiki.')
