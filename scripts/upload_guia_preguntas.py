import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH    = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Preguntas para practicar de Historia Argentina.pdf"
SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
CONTENT_ITEM_ID = "5ac80faa-39e5-4155-b31a-dca7a44b9e81"

WATERMARK = '@RESUMENES.UNLAM'
DOC_TITLE = 'Guía de Preguntas de Historia Argentina (UNLaM)'


# ── Paridad ───────────────────────────────────────────────────────────────────

def strip_markers(text):
    """Quita ## / ### / - al inicio de línea para contar palabras sin marcadores."""
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('## '):   lines.append(s[3:])
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
        if s == 'o': continue                        # ○ bullet extraído como 'o'
        words.extend(s.split())
    return len(words)


# ── Extracción ────────────────────────────────────────────────────────────────

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} páginas")

raw_text_all = ''
lines_out = []

for page_num in range(len(doc)):
    page = doc[page_num]
    raw_text = page.get_text("text")
    raw_text_all += raw_text

    raw_lines = raw_text.split('\n')
    i = 0
    while i < len(raw_lines):
        line  = raw_lines[i]
        s     = line.strip()

        # ── Omitir: blancos, numeración de página, watermark, título del doc ──
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

        # ── Bullet ○ extraído como 'o' (size 10.0) ────────────────────────────
        # La siguiente línea no vacía es el contenido del bullet
        if s == 'o':
            j = i + 1
            while j < len(raw_lines) and not raw_lines[j].strip():
                j += 1
            if j < len(raw_lines):
                lines_out.append('- ' + raw_lines[j].strip())
                i = j + 1
            else:
                i += 1
            continue

        # ── Heading: Módulo N: Título ─────────────────────────────────────────
        if re.match(r'^Módulo \d+:', s):
            lines_out.append(f'## {s}')
            i += 1
            continue

        # ── Sub-heading: N. Pregunta nombre: (línea que termina en ':') ───────
        if re.match(r'^\d+\. .+:$', s):
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
print(f"Palabras PDF:     {raw_count}")
print(f"Palabras body:    {ext_count}")

if raw_count != ext_count:
    diff = ext_count - raw_count
    print(f"  PARIDAD FALLIDA: diferencia = {diff:+d} palabras")
    print("\n  Preview del body:")
    print(body[:600])
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
