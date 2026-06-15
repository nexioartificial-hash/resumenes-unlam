import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH        = r"docs\Resumen de Fundamentos Ed. Fisica 2026.pdf"
SUPABASE_URL    = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID      = "fd4e783d-18e2-49f8-8a16-b8ada81b03c7"

WATERMARK   = '@RESUMENES.UNLAM'
COVER_PARTS = {'Resumen de', 'Fundamentos de', 'Educación Fisica', '@resumenes.unlam', 'Curso de ingreso'}

# Regex para artefacto "PALABRA.SUFIJO." donde sufijo es cola de palabra (PDF duplication)
_SUFFIX_DUP = re.compile(
    r'\b(\w{4,})\.(\w{3,})\.',
    re.IGNORECASE | re.UNICODE
)
def _fix_suffix_dup(m):
    w, s = m.group(1), m.group(2)
    return (w + '.') if w.lower().endswith(s.lower()) else m.group(0)


# ── Mapa bold por linea ───────────────────────────────────────────────────────

def build_bold_map(page):
    bold_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0:
            continue
        for line in block.get('lines', []):
            spans = [s for s in line.get('spans', []) if s.get('text', '').strip()]
            if not spans:
                continue
            text = ''.join(s['text'] for s in line.get('spans', [])).strip()
            size = max(s['size'] for s in spans)
            is_bold = all('Bold' in s.get('font', '') for s in spans)
            if text:
                bold_map[text] = (is_bold, size)
    return bold_map


# ── Limpiar artefactos PDF (se aplica al raw Y al body para mantener paridad) ─

def clean_artifacts(text):
    """Elimina artefactos de duplicacion de caracteres del PDF."""
    # Artefacto tipo word.suffix. (ej: "educacion.acion.")
    text = _SUFFIX_DUP.sub(_fix_suffix_dup, text)
    return text


# ── Paridad: chars alfanumericos, invariante al joineo y a los artefactos ─────

def count_content_chars(text):
    total = 0
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if WATERMARK in s: continue
        if s in COVER_PARTS: continue
        if s.startswith('## '):    s = s[3:]
        elif s.startswith('### '): s = s[4:]
        total += sum(1 for c in s if c.isalpha() or c.isdigit())
    return total


# ── Reconstruir parrafos: concatenacion raw + dedup de caracter aislado ───────
# PyMuPDF codifica limites de palabra con espacio al INICIO de la proxima linea.
# Adicionalmente, algunos PDFs duplican el ultimo caracter de una linea como
# primer caracter de la siguiente (artefacto de generador PDF):
#   "...la p"  +  "participacion..."  ->  corregir a  "...la participacion..."

def fix_word_breaks(lines):
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()

        # Headings y lineas vacias pasan sin tocar
        if not s or s.startswith('#'):
            result.append(s)
            i += 1
            continue

        # Acumular lineas consecutivas del mismo bloque de texto
        current = line.rstrip('\r\n')
        i += 1
        while i < len(lines):
            ns = lines[i].strip()
            # Parar en: vacio, heading, o nuevo item de lista
            if not ns or ns.startswith('#') or ns.startswith('- ') or ns.startswith('  - '):
                break
            next_raw = lines[i].rstrip('\r\n')
            curr_end = current.rstrip()

            # Caso 1: artefacto de caracter aislado duplicado
            # "...texto X" + "Xpalabra..." (X al final precedido de no-letra = duplicado)
            if (len(curr_end) >= 2 and
                    not curr_end[-2].isalpha() and
                    curr_end[-1].isalpha() and
                    next_raw and not next_raw[0].isspace() and
                    curr_end[-1] == next_raw[0]):
                current = curr_end[:-1] + next_raw

            # Caso 2: limite de oracion sin espacio (punto/coma + letra mayuscula/letra)
            elif (curr_end and curr_end[-1] in '.!?,' and
                    next_raw and not next_raw[0].isspace() and next_raw[0].isalpha()):
                current = current + ' ' + next_raw.lstrip()

            # Caso 3: concatenacion directa (limites de palabra por espacio al inicio)
            else:
                current = current + next_raw

            i += 1

        # Limpiar bordes, espacios multiples y artefactos inline
        current = current.strip()
        current = re.sub(r'  +', ' ', current)
        current = clean_artifacts(current)
        result.append(current)
    return result


# ── Extraccion ────────────────────────────────────────────────────────────────

doc = fitz.open(PDF_PATH)
print(f"PDF: {len(doc)} paginas")

raw_text_all = ''
lines_out    = []

for page_num in range(len(doc)):
    page     = doc[page_num]
    raw_text = page.get_text('text')
    raw_text_all += raw_text
    if page_num == 0:
        continue

    bold_map  = build_bold_map(page)
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

        if WATERMARK in s or s in COVER_PARTS:
            i += 1
            continue

        if re.match(r'^Módulo \d+', s):
            lines_out.append(f'## {s}')
            i += 1
            continue

        is_bold, size = bold_map.get(s, (False, 12.0))
        if is_bold and size < 20:
            lines_out.append(f'### {s}')
            i += 1
            continue

        lines_out.append(line)
        i += 1

doc.close()

# ── Reconstruir parrafos ──────────────────────────────────────────────────────
lines_out = fix_word_breaks(lines_out)

body = '\n'.join(lines_out)
body = re.sub(r'\n{3,}', '\n\n', body).strip()


# ── Validacion de paridad ─────────────────────────────────────────────────────
# Aplicar la misma limpieza al raw para que la paridad sea invariante a artefactos

def dedup_raw_chars(text):
    """Aplica al raw el mismo dedup de caracter aislado que fix_word_breaks hace al body."""
    lines = text.split('\n')
    result = []
    for i, line in enumerate(lines):
        stripped = line.rstrip('\r').rstrip()
        if (i + 1 < len(lines) and len(stripped) >= 2 and
                not stripped[-2].isalpha() and stripped[-1].isalpha()):
            next_s = lines[i + 1].strip()
            next_raw0 = lines[i + 1][0] if lines[i + 1] else ''
            if (next_s and not next_raw0.isspace() and
                    stripped[-1] == next_s[0]):
                result.append(stripped[:-1])
                continue
        result.append(line.rstrip('\r'))
    return '\n'.join(result)

raw_text_clean = dedup_raw_chars(clean_artifacts(raw_text_all))
raw_count = count_content_chars(raw_text_clean)
ext_count = count_content_chars(body)

print(f"Chars extraidos: {len(body):,}")
print(f"Chars PDF (alfanum):  {raw_count}")
print(f"Chars body (alfanum): {ext_count}")

diff = ext_count - raw_count
# Tolerancia de 5: los fixes de artefactos pueden tener hasta 3 discrepancias
# en limites de bloque (cuando el siguiente raw line es un heading)
if abs(diff) > 5:
    print(f"  PARIDAD FALLIDA: diferencia = {diff:+d} chars (limite: 5)")
    print("\n  Preview body:")
    print(body[:800])
    sys.exit(1)

if diff != 0:
    print(f"  Paridad OK (diferencia de artefacto: {diff:+d} chars)")
else:
    print("  Paridad OK")
print("\n  Preview:")
print(body[:800])


# ── Dividir en modulos ────────────────────────────────────────────────────────

HEADERS = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
}
now = datetime.now(timezone.utc).isoformat()

parts = re.split(r'\n(?=## Módulo \d+)', body)

modules = []
for part in parts:
    part = part.strip()
    if not part or not part.startswith('## Módulo'):
        continue
    lines  = part.split('\n')
    title  = lines[0][3:].strip()
    content = '\n'.join(lines[1:]).strip()
    m      = re.search(r'Módulo (\d+)', title)
    order  = int(m.group(1)) if m else len(modules) + 1
    desc_match = re.search(r'^### (.+)', content, re.MULTILINE)
    description = desc_match.group(1) if desc_match else None
    modules.append({'title': title, 'body': content, 'order_index': order, 'description': description})

print(f"\nModulos detectados: {len(modules)}")
for mod in modules:
    print(f"  {mod['order_index']}. {mod['title']} -- desc: {str(mod['description'])[:40]} ({len(mod['body'])} chars)")


# ── Borrar modulos existentes ─────────────────────────────────────────────────

print(f"\nBorrando modulos existentes de subject {SUBJECT_ID}...")
del_resp = requests.delete(
    f'{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{SUBJECT_ID}',
    headers={**HEADERS, 'Prefer': 'return=minimal'},
)
if del_resp.status_code in [200, 204]:
    print('  Modulos anteriores eliminados')
else:
    print(f'  Error al borrar: {del_resp.status_code} {del_resp.text[:100]}')


# ── Insertar modulos ──────────────────────────────────────────────────────────

print("\nInsertando modulos...")
inserted = 0
errors   = 0

for mod in modules:
    payload = {
        'subject_id':   SUBJECT_ID,
        'title':        mod['title'],
        'description':  mod['description'],
        'body':         mod['body'],
        'order_index':  mod['order_index'],
        'is_published': True,
        'created_at':   now,
        'updated_at':   now,
    }
    resp = requests.post(
        f'{SUPABASE_URL}/rest/v1/modules',
        headers={**HEADERS, 'Prefer': 'return=representation'},
        json=payload,
    )
    if resp.status_code in [200, 201]:
        row    = resp.json()
        mod_id = row[0]['id'] if isinstance(row, list) else row.get('id')
        print(f"  v {mod['title']} -- id: {mod_id}")
        inserted += 1
    else:
        print(f"  x Error {mod['order_index']}: {resp.status_code} {resp.text[:150]}")
        errors += 1

print(f"\nTotal: {inserted} insertados, {errors} con error.")
