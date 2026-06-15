import fitz
import requests
import sys, io, re
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PDF_PATH        = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\Modelo de examen 2026 Seminario.pdf"
SUPABASE_URL    = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
CONTENT_ITEM_ID = "b80483b0-7ec9-4325-a370-09bdcfc6ce93"

WATERMARK     = '@RESUMENES.UNLAM'
BULLET_TOKENS = {'●', '○', '■', '▪', '•'}

# Patrones de sección → ## heading
SECTION_RE = re.compile(
    r'^(PRIMERA PARTE:|SEGUNDA PARTE:|Resolución de Examen|Notas? al pie)',
    re.IGNORECASE
)


# ── Paridad ───────────────────────────────────────────────────────────────────

def strip_markers(text):
    lines = []
    for line in text.split('\n'):
        s = line.strip()
        if s.startswith('## '):    s = s[3:]
        elif s.startswith('### '): s = s[4:]
        elif s.startswith('- '):   s = s[2:]
        lines.append(s)
    return '\n'.join(lines)

def count_content_words(text):
    """Conteo a nivel token: excluye números de página, watermark y chars de bullet."""
    words = []
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if WATERMARK in s: continue
        for token in s.split():
            if token not in BULLET_TOKENS:
                words.append(token)
    return len(words)


# ── Preproceso: poner inline bullets en su propia línea ──────────────────────

def preprocess_text(text):
    for ch in ('●', '○', '■'):
        text = re.sub(re.escape(ch), f'\n{ch}\n', text)
    return text


# ── Mapa de tamaño de fuente y negritas ──────────────────────────────────────

def _is_bold(span):
    return 'Bold' in span.get('font', '') or bool(span.get('flags', 0) & 16)

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

def build_line_bold_map(page):
    """
    Mapea texto plano de línea → texto con negritas markdown.
    Solo incluye líneas que tienen al menos un span bold.
    """
    bold_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0: continue
        for line in block.get('lines', []):
            spans = line.get('spans', [])
            if not spans: continue
            plain = ''.join(sp.get('text', '') for sp in spans).strip()
            if not plain: continue
            has_bold = any(_is_bold(sp) for sp in spans if sp.get('text', '').strip())
            if not has_bold: continue
            parts = []
            for sp in spans:
                t = sp.get('text', '')
                if not t: continue
                if _is_bold(sp) and t.strip():
                    s  = t.strip()
                    lp = t[:len(t) - len(t.lstrip())]
                    tp = t[len(t.rstrip()):]
                    parts.append(f'{lp}**{s}**{tp}')
                else:
                    parts.append(t)
            bold_map[plain] = ''.join(parts).strip()
    return bold_map


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
    bold_map  = build_line_bold_map(page)

    # Preprocesar para separar bullets embebidos en párrafos
    processed = preprocess_text(raw_text)
    raw_lines = processed.split('\n')

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

        # Bullet ● principal (standalone tras preproceso)
        if s == '●':
            j = i + 1
            while j < len(raw_lines) and not raw_lines[j].strip():
                j += 1
            if j < len(raw_lines):
                content_plain = raw_lines[j].strip()
                content = bold_map.get(content_plain, content_plain)
                if lines_out and lines_out[-1] not in ('', '\n'):
                    lines_out.append('')
                lines_out.append('- ' + content)
                i = j + 1
            else:
                i += 1
            continue

        # Sub-bullet ○
        if s == '○':
            j = i + 1
            while j < len(raw_lines) and not raw_lines[j].strip():
                j += 1
            if j < len(raw_lines):
                content_plain = raw_lines[j].strip()
                content = bold_map.get(content_plain, content_plain)
                lines_out.append('  - ' + content)
                i = j + 1
            else:
                i += 1
            continue

        # Sub-sub-bullet ■
        if s == '■':
            j = i + 1
            while j < len(raw_lines) and not raw_lines[j].strip():
                j += 1
            if j < len(raw_lines):
                content_plain = raw_lines[j].strip()
                content = bold_map.get(content_plain, content_plain)
                lines_out.append('    - ' + content)
                i = j + 1
            else:
                i += 1
            continue

        # Título de sección por patrón → ## heading
        if SECTION_RE.match(s):
            if lines_out and lines_out[-1] != '':
                lines_out.append('')
            lines_out.append(f'## {s}')
            i += 1
            continue

        # Heading por tamaño de fuente ≥ 14pt
        size = size_map.get(s, 11.0)
        if size >= 14:
            if lines_out and lines_out[-1] != '':
                lines_out.append('')
            lines_out.append(f'## {s}')
            i += 1
            continue

        # Sub-heading ≥ 12.5pt
        if size >= 12.5:
            lines_out.append(f'### {s}')
            i += 1
            continue

        # Línea de contenido regular → aplicar negritas si el PDF las tiene
        lines_out.append(bold_map.get(s, line))
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
    print(f"  ❌ PARIDAD FALLIDA: diferencia = {diff:+d} palabras")
    print("\n  Preview body:")
    print(body[:1000])
    sys.exit(1)

print("  ✓ Paridad OK")


# ── Auditoría de estructura ───────────────────────────────────────────────────

def audit_body(body):
    """
    Verifica la calidad estructural del cuerpo extraído.
    Retorna (ok: bool, issues: list[str]).
    """
    issues = []
    lines  = body.split('\n')

    # 1. Secciones obligatorias presentes
    REQUIRED_SECTIONS = [
        ('PRIMERA PARTE', 'Sección "PRIMERA PARTE" no encontrada'),
        ('SEGUNDA PARTE', 'Sección "SEGUNDA PARTE" no encontrada'),
        ('Resolución de Examen', 'Sección "Resolución de Examen" no encontrada'),
    ]
    for keyword, msg in REQUIRED_SECTIONS:
        if not any(keyword.lower() in line.lower() for line in lines):
            issues.append(msg)

    # 2. Ninguna línea debe contener bullets embebidos (●, ○, ■) mezclados con texto
    for i, line in enumerate(lines, 1):
        for ch in ('●', '○', '■'):
            if ch in line and len(line.strip()) > 2:
                issues.append(
                    f"Línea {i}: bullet '{ch}' embebido en texto → '{line.strip()[:80]}'"
                )

    # 3. Los 5 ítems numerados de la Segunda Parte deben estar como líneas separadas
    numbered_found = set()
    for line in lines:
        m = re.match(r'^\s*(\d+)\.\s', line)
        if m and int(m.group(1)) in range(1, 6):
            numbered_found.add(int(m.group(1)))
    missing_items = set(range(1, 6)) - numbered_found
    if missing_items:
        issues.append(f'Ítems numerados faltantes o no separados: {sorted(missing_items)}')

    # 4. Ningún párrafo debería superar 600 chars (indica secciones fusionadas)
    for i, line in enumerate(lines, 1):
        if len(line.strip()) > 600:
            issues.append(
                f'Línea {i} demasiado larga ({len(line)} chars) — posible sección fusionada:\n'
                f'  "{line.strip()[:120]}..."'
            )

    # 5. Encabezados ## no deben estar pegados a otro ## sin contenido entre ellos
    for i in range(len(lines) - 1):
        if lines[i].startswith('## ') and lines[i+1].startswith('## '):
            issues.append(
                f'Dos encabezados ## consecutivos sin contenido:\n'
                f'  [{i+1}] {lines[i].strip()}\n'
                f'  [{i+2}] {lines[i+1].strip()}'
            )

    return (len(issues) == 0), issues


print('\nAuditoría de estructura...')
audit_ok, audit_issues = audit_body(body)
if audit_issues:
    for issue in audit_issues:
        print(f'  ⚠️  {issue}')
if audit_ok:
    print('  ✓ Auditoría OK — estructura correcta')
else:
    print(f'\n  ❌ AUDITORÍA FALLIDA: {len(audit_issues)} problema(s) detectado(s). No se sube a Supabase.')
    sys.exit(1)


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
    print('  ✓ Modelo de Examen actualizado en Supabase')
else:
    print(f'  Error {resp.status_code}: {resp.text}')

print('\nPreview del body subido (primeros 800 chars):')
print(body[:800])
print('\n...\n')
print('Preview body sección resolución (chars 6000-7000):')
print(body[6000:7000])
