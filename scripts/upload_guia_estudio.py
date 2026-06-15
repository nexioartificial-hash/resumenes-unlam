import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH    = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Guía de Estudio Historia Argentina.pdf"
SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
CONTENT_ITEM_ID = "bbf8122a-11ca-4b79-b550-6e5690ee696f"

WATERMARK = '@RESUMENES.UNLAM'
DOC_TITLE = 'Guía de Estudio: Historia Argentina'
BULLET    = '•'  # U+2022, extraído tal cual por PyMuPDF


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
        if s.isdigit() and len(s) <= 3: continue   # números de página
        if WATERMARK in s: continue                  # watermark
        if s == DOC_TITLE: continue                  # título del documento
        if s == BULLET: continue                     # marcador de bullet
        words.extend(s.split())
    return len(words)


# ── Utilidad: tamaño de fuente máximo de una línea ───────────────────────────

def build_size_map(page):
    size_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0: continue
        for line in block.get('lines', []):
            spans = line.get('spans', [])
            if not spans: continue
            text = ''.join(s['text'] for s in spans).strip()
            size = max((s['size'] for s in spans), default=11.0)
            if text:
                size_map[text] = size
    return size_map


# ── Extracción ────────────────────────────────────────────────────────────────

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} páginas")

raw_text_all = ''
lines_out    = []

for page_num in range(len(doc)):
    page     = doc[page_num]
    raw_text = page.get_text('text')
    raw_text_all += raw_text
    size_map = build_size_map(page)

    raw_lines = raw_text.split('\n')
    i = 0
    while i < len(raw_lines):
        line = raw_lines[i]
        s    = line.strip()

        # ── Omitir: blancos, numeración de página, watermark, título ──────────
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
        if s == DOC_TITLE:
            i += 1
            continue

        # ── Bullet • (size 10.0): la siguiente línea no vacía es el contenido ─
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

        # ── Heading: Módulo N: Título (patrón, no depende del size_map) ─────
        if re.match(r'^Módulo \d+:', s):
            lines_out.append(f'## {s}')
            i += 1
            continue

        # ── Sub-heading por tamaño de fuente (Conceptos Clave, Puntos a Rep.) ─
        size = size_map.get(s, 11.0)
        if size >= 13:
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
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
    },
    json={
        'body': body,
        'updated_at': datetime.now(timezone.utc).isoformat(),
    }
)

if resp.status_code in [200, 204]:
    print('  Actualizado en Supabase')
else:
    print(f'  Error {resp.status_code}: {resp.text}')

print('\nPreview del body subido:')
print(body[:800])
