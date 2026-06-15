import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH        = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Modelos de Examen Contabilidad.pdf"
SUPABASE_URL    = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
CONTENT_ITEM_ID = "3bc83089-026e-4938-8c1c-c8aee0cefde9"

WATERMARK = '@RESUMENES.UNLAM'
DOC_TITLE = 'Modelos de Examen - Contabilidad (Ingreso UNLaM)'
BULLET    = '•'   # U+2022 standalone
SECTION_HEADERS = {'Parte Práctica', 'Parte Teórica', 'Consignas'}


# ── Paridad ───────────────────────────────────────────────────────────────────

def strip_markers(text):
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('## '):    lines.append(s[3:])
        elif s.startswith('### '): lines.append(s[4:])
        elif s.startswith('- '):   lines.append(s[2:])
        else:                       lines.append(s)
    return '\n'.join(lines)

def count_content_words(text):
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if WATERMARK in s: continue
        if s == DOC_TITLE: continue
        if s == BULLET: continue
        if s.startswith('o '):           # sub-bullet inline: no contar 'o'
            s = s[2:]
        words.extend(s.split())
    return len(words)


# ── Extracción ────────────────────────────────────────────────────────────────

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} páginas")

raw_text_all = ''
lines_out    = []

for page_num in range(len(doc)):
    page     = doc[page_num]
    raw_text = page.get_text('text')
    raw_text_all += raw_text

    raw_lines = raw_text.split('\n')
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]
        s    = line.strip()

        # ── Omitir vacíos ─────────────────────────────────────────────────────
        if not s:
            lines_out.append('')
            i += 1
            continue

        # ── Omitir: página, watermark, título del doc ─────────────────────────
        if s.isdigit() and len(s) <= 3:
            i += 1
            continue
        if WATERMARK in s:
            i += 1
            continue
        if s == DOC_TITLE:
            i += 1
            continue

        # ── Bullet • standalone: siguiente línea no vacía → '- contenido' ─────
        if s == BULLET:
            j = i + 1
            while j < len(raw_lines) and not raw_lines[j].strip():
                j += 1
            if j < len(raw_lines):
                lines_out.append('- ' + raw_lines[j].strip())
                i = j + 1
            else:
                i += 1
            continue

        # ── Sub-bullet inline: 'o texto' → '  - texto' ───────────────────────
        if s.startswith('o '):
            lines_out.append('  - ' + s[2:])
            i += 1
            continue

        # ── Heading principal: Modelo de Examen N → ## ────────────────────────
        if re.match(r'^Modelo de Examen \d+', s):
            lines_out.append(f'## {s}')
            i += 1
            continue

        # ── Sub-heading: Parte Práctica / Parte Teórica / Consignas → ### ─────
        if s in SECTION_HEADERS:
            lines_out.append(f'### {s}')
            i += 1
            continue

        # ── Línea regular ─────────────────────────────────────────────────────
        lines_out.append(line)
        i += 1

doc.close()

body = '\n'.join(lines_out)
body = re.sub(r'\n{3,}', '\n\n', body).strip()


# ── Validación de paridad ─────────────────────────────────────────────────────

raw_count = count_content_words(raw_text_all)
ext_count = count_content_words(strip_markers(body))

print(f"Chars extraídos: {len(body):,}")
print(f"Palabras PDF:    {raw_count}")
print(f"Palabras body:   {ext_count}")

if raw_count != ext_count:
    diff = ext_count - raw_count
    print(f"  PARIDAD FALLIDA: diferencia = {diff:+d} palabras")
    print("\n  Preview body:")
    print(body[:800])
    sys.exit(1)

print("  Paridad OK")


# ── Subida a Supabase ─────────────────────────────────────────────────────────

print(f"\nActualizando content_item {CONTENT_ITEM_ID}...")
resp = requests.patch(
    f'{SUPABASE_URL}/rest/v1/content_items?id=eq.{CONTENT_ITEM_ID}',
    headers={
        'apikey':        SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
    },
    json={
        'body':       body,
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
)

if resp.status_code in [200, 204]:
    print('  Actualizado en Supabase')
else:
    print(f'  Error {resp.status_code}: {resp.text}')

print('\nPreview del body subido:')
print(body[:800])
