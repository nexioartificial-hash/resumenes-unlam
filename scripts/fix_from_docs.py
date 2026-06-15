import re
import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
SUBJECT_ID   = "edf0976e-6d44-4a14-a657-5a14807b1bd0"
DOCS_PATH    = r"c:\Users\Noxi-PC\Desktop\resumenes.unlam\docs\historia-argentina-2026.md"

# ── Parsear el archivo docs ───────────────────────────────────────────────────

with open(DOCS_PATH, 'r', encoding='utf-8') as f:
    raw = f.read()

# Dividir por "# Módulo N" (encabezado de nivel 1)
parts  = re.split(r'^# Módulo \d+', raw, flags=re.MULTILINE)
# parts[0] = header del archivo (se descarta)
# parts[1..8] = contenido de cada módulo (empieza con " — Título\n\n...")

def extract_module_body(part: str) -> str:
    """Toma el texto después del split y devuelve el body limpio para Supabase."""
    lines = part.split('\n')

    # La primera línea es el resto del encabezado: " — Título completo"
    # La descartamos porque ya está en el campo title de la tabla modules
    lines = lines[1:]

    # Quitar líneas en blanco al inicio
    while lines and not lines[0].strip():
        lines = lines.pop(0) or lines  # evitar bug: usar índice

    # Reconstruir
    body = '\n'.join(lines).strip()

    # Quitar pie de archivo si está en el último módulo
    body = re.sub(r'\n---\n\n\*Fin del resumen[^\n]*\n?$', '', body).strip()

    # Si hay texto antes del primer "## " heading, envolverlo en "## Introducción"
    first_h2 = re.search(r'^##\s+', body, re.MULTILINE)
    if first_h2 and first_h2.start() > 0:
        intro = body[:first_h2.start()].strip()
        rest  = body[first_h2.start():]
        if intro:
            body = f"## Introducción\n\n{intro}\n\n{rest}"

    return body

# Armar dict {numero: body}
modules_content = {}
for i, part in enumerate(parts[1:], start=1):
    modules_content[i] = extract_module_body(part)

# ── Obtener módulos de Supabase ───────────────────────────────────────────────

resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{SUBJECT_ID}&order=order_index',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
)
modules = resp.json()

# ── Actualizar cada módulo ────────────────────────────────────────────────────

for mod in modules:
    order  = mod['order_index']
    mod_id = mod['id']
    title  = mod['title']
    body   = modules_content.get(order, '')

    print(f"\n{'='*60}")
    print(f"Módulo {order}: {title}")
    print(f"  Chars: {len(body):,}")
    print(f"  Preview: {body[:150]!r}")

    upd = requests.patch(
        f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mod_id}',
        headers={
            'apikey':        SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type':  'application/json',
            'Prefer':        'return=minimal',
        },
        json={'body': body, 'updated_at': datetime.now(timezone.utc).isoformat()}
    )

    if upd.status_code in [200, 204]:
        print(f'  ✓ Actualizado')
    else:
        print(f'  ✗ Error {upd.status_code}: {upd.text}')

print('\n✓ Todos los módulos actualizados desde docs/')
