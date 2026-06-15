import re
import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "edf0976e-6d44-4a14-a657-5a14807b1bd0"

# ── Helpers de tabla ──────────────────────────────────────────────────────────

def is_table_row(line: str) -> bool:
    return bool(re.match(r'^\|.+\|$', line.strip()))

def is_sep_row(line: str) -> bool:
    return bool(re.match(r'^\|\s*[-:]+\s*(\|\s*[-:]+\s*)*\|\s*$', line.strip()))

def count_cols(sep: str) -> int:
    inner = sep.strip()[1:-1]
    return len([c for c in inner.split('|')])

def extract_cells(row: str) -> list[str]:
    inner = row.strip()[1:-1]
    return [c.strip() for c in inner.split('|')]

def process_table(table_lines: list[str]) -> list[str]:
    """Decide qué hacer con un bloque de tabla."""
    if not table_lines:
        return []

    # Buscar fila separadora
    sep_idx = next((i for i, l in enumerate(table_lines) if is_sep_row(l)), None)

    if sep_idx is None:
        # No es tabla real → texto plano
        result = []
        for l in table_lines:
            text = ' '.join(c for c in extract_cells(l) if c)
            if text:
                result.append(text)
        return result

    num_cols = count_cols(table_lines[sep_idx])
    header_rows = table_lines[:sep_idx]
    data_rows   = [l for i, l in enumerate(table_lines) if i != sep_idx and is_table_row(l)]
    all_content = header_rows + data_rows

    if num_cols <= 1:
        # Tabla de 1 columna → párrafos
        result = []
        for row in all_content:
            text = ' '.join(c for c in extract_cells(row) if c)
            if text:
                result.append(text)
        return result

    if num_cols == 2 and all_content:
        # Si la mayoría de la columna izquierda está vacía → párrafos
        first_cells = []
        for row in all_content:
            cells = extract_cells(row)
            first_cells.append(cells[0] if cells else '')
        empty_ratio = sum(1 for c in first_cells if not c) / max(len(first_cells), 1)
        if empty_ratio >= 0.5:
            result = []
            for row in all_content:
                text = ' '.join(c for c in extract_cells(row) if c)
                if text:
                    result.append(text)
            return result

    # Tabla real → dejarla como está
    return table_lines

# ── Lógica de limpieza ────────────────────────────────────────────────────────

def strip_module_header(body: str, module_num: int) -> str:
    """
    Descarta el encabezado '## MÓDULO N' (y cualquier contenido huérfano antes de él).
    También maneja títulos partidos en dos líneas.
    """
    pattern = re.compile(
        r'^##\s+MÓDULO\s+' + str(module_num) + r'[^\n]*$',
        re.IGNORECASE | re.MULTILINE
    )
    match = pattern.search(body)
    if not match:
        return body  # Sin header → devolver tal cual

    # Descartar todo lo anterior al header (contenido huérfano) + el header mismo
    body = body[match.end():].lstrip('\n')

    # Verificar si la siguiente línea ## es continuación del título
    lines = body.split('\n')
    if lines and re.match(r'^##\s+', lines[0]):
        inner = re.sub(r'^##\s+', '', lines[0].strip())
        # Continuación si empieza con minúscula o es todo mayúsculas sin dos puntos
        is_continuation = (
            (inner and inner[0].islower()) or
            (inner == inner.upper() and ':' not in inner and len(inner) < 60)
        )
        if is_continuation:
            body = '\n'.join(lines[1:]).lstrip('\n')

    return body

def clean_body(body: str, module_num: int) -> str:
    if not body:
        return body

    # 1. Eliminar header duplicado y contenido huérfano
    body = strip_module_header(body, module_num)

    # 2. Procesar línea a línea
    lines  = body.split('\n')
    result = []
    i = 0

    while i < len(lines):
        line = lines[i]

        # Eliminar marcas de agua
        if '@RESUMENES.UNLAM' in line or '@resumenes.unlam' in line.lower():
            i += 1
            continue

        # Detectar inicio de tabla
        if is_table_row(line):
            table_lines = []
            while i < len(lines) and is_table_row(lines[i]):
                table_lines.append(lines[i])
                i += 1

            processed = process_table(table_lines)
            if processed:
                # Separar del párrafo anterior si no hay línea en blanco
                if result and result[-1].strip():
                    result.append('')
                result.extend(processed)
                result.append('')
            continue

        result.append(line)
        i += 1

    # 3. Colapsar múltiples líneas en blanco
    cleaned = '\n'.join(result)
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)
    return cleaned.strip()

# ── Main ──────────────────────────────────────────────────────────────────────

resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{SUBJECT_ID}&order=order_index',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
)
modules = resp.json()

for mod in modules:
    mod_id = mod['id']
    order  = mod['order_index']
    title  = mod['title']
    body   = mod.get('body') or ''

    print(f"\n{'='*60}")
    print(f"Módulo {order}: {title}")
    print(f"  Antes:  {len(body):,} chars")

    cleaned = clean_body(body, order)

    print(f"  Después: {len(cleaned):,} chars")
    print(f"  Preview: {cleaned[:200]!r}")

    upd = requests.patch(
        f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mod_id}',
        headers={
            'apikey':        SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type':  'application/json',
            'Prefer':        'return=minimal',
        },
        json={'body': cleaned, 'updated_at': datetime.now(timezone.utc).isoformat()}
    )

    if upd.status_code in [200, 204]:
        print(f'  ✓ Actualizado')
    else:
        print(f'  ✗ Error {upd.status_code}: {upd.text}')

print('\n✓ Todos los módulos procesados.')
