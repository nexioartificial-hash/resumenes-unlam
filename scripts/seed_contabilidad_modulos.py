import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH     = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Resumen de Contabilidad 2026.pdf"
SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "e4eacaa7-a178-4dbf-9f51-265d5b4c41eb"

WATERMARK   = '@RESUMENES.UNLAM'
TITLE_PARTS = {'RESUMEN DE', 'CONTABILIDAD', 'CURSO DE INGRESO'}
INLINE_BULLETS = {'●': '- ', '○': '  - ', '■': '    - '}


def build_size_map(page):
    size_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0: continue
        for line in block.get('lines', []):
            spans = line.get('spans', [])
            if not spans: continue
            text = ''.join(s['text'] for s in spans).strip()
            size = max(s['size'] for s in spans)
            if text:
                size_map[text] = round(size, 1)
    return size_map


# ── Extracción (misma lógica que upload_contabilidad_resumen.py) ──────────────

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} páginas")

lines_out = []

for page_num in range(len(doc)):
    page     = doc[page_num]
    raw_text = page.get_text('text')
    size_map = build_size_map(page)

    raw_lines = raw_text.split('\n')
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]
        s    = line.strip()

        if not s:
            lines_out.append('')
            i += 1
            continue
        if s.isdigit() and len(s) <= 3:
            i += 1
            continue
        if WATERMARK in s:
            i += 1
            continue
        if s in TITLE_PARTS:
            i += 1
            continue

        for bullet_char, marker in INLINE_BULLETS.items():
            if s.startswith(bullet_char + ' '):
                lines_out.append(marker + s[2:])
                i += 1
                break
        else:
            if re.match(r'^MÓDULO \d+:', s):
                heading = s
                j = i + 1
                while j < len(raw_lines) and not raw_lines[j].strip():
                    j += 1
                if j < len(raw_lines):
                    next_s = raw_lines[j].strip()
                    if size_map.get(next_s, 11.0) >= 16.0 and not re.match(r'^MÓDULO \d+:', next_s):
                        heading = heading + ' ' + next_s
                        i = j + 1
                    else:
                        i += 1
                else:
                    i += 1
                lines_out.append(f'## {heading}')
                continue

            size = size_map.get(s, 11.0)
            if size >= 12.5 and size < 16.0:
                lines_out.append(f'### {s}')
                i += 1
                continue

            lines_out.append(line)
            i += 1

doc.close()

body = '\n'.join(lines_out)
body = re.sub(r'\n{3,}', '\n\n', body).strip()


# ── Dividir en módulos ────────────────────────────────────────────────────────

# Partir en secciones en cada "## MÓDULO N:"
parts = re.split(r'\n(?=## MÓDULO \d+:)', body)

modules = []
for part in parts:
    part = part.strip()
    if not part:
        continue
    lines = part.split('\n')
    first = lines[0].strip()
    if not first.startswith('## MÓDULO'):
        continue
    title = first[3:].strip()  # quita "## "
    mod_body = '\n'.join(lines[1:]).strip()
    # order_index del número en "MÓDULO N"
    m = re.search(r'MÓDULO (\d+)', title)
    order = int(m.group(1)) if m else len(modules) + 1
    modules.append({'title': title, 'body': mod_body, 'order_index': order})

print(f"\nMódulos detectados: {len(modules)}")
for mod in modules:
    print(f"  {mod['order_index']}. {mod['title'][:60]} ({len(mod['body'])} chars)")


# ── Insertar en Supabase ──────────────────────────────────────────────────────

headers = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
    'Prefer':        'return=representation',
}

now = datetime.now(timezone.utc).isoformat()
inserted = 0
errors   = 0

for mod in modules:
    payload = {
        'subject_id':   SUBJECT_ID,
        'title':        mod['title'],
        'description':  None,
        'body':         mod['body'],
        'order_index':  mod['order_index'],
        'is_published': True,
        'created_at':   now,
        'updated_at':   now,
    }
    resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/modules',
        headers=headers,
        json=payload,
    )
    if resp.status_code in [200, 201]:
        row = resp.json()
        mod_id = row[0]['id'] if isinstance(row, list) else row.get('id')
        print(f"  ✓ Módulo {mod['order_index']} insertado — id: {mod_id}")
        inserted += 1
    else:
        print(f"  ✗ Error módulo {mod['order_index']}: {resp.status_code} {resp.text[:200]}")
        errors += 1

print(f"\nTotal: {inserted} insertados, {errors} con error.")
