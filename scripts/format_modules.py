import re
import requests
import sys, io
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"

# Cambiar este ID para formatear módulos de otra materia
SUBJECT_ID = "edf0976e-6d44-4a14-a657-5a14807b1bd0"


# ── Paridad ───────────────────────────────────────────────────────────────────

def count_words(text):
    clean = text.replace('## ', '').replace('### ', '')
    return len(clean.split())

def verify_parity(before, after, label):
    b, a = count_words(before), count_words(after)
    if b != a:
        print(f"  PARIDAD FALLIDA en {label}: antes={b} palabras, despues={a} palabras")
        return False
    print(f"  Paridad OK: {b} palabras")
    return True


# ── Formateo ──────────────────────────────────────────────────────────────────

def format_body(body):
    """
    Une las líneas partidas por el wrap del PDF en párrafos continuos.

    Lógica de unión:
    - Una línea con trailing space es señal de wrap de PDF → se une con la siguiente.
    - EXCEPCIONES (no se une):
        1. La línea actual termina en punto/cierre de oración (.!?) → es fin de párrafo.
        2. La línea anterior guardada terminó en punto → la línea actual podría ser
           una etiqueta de sub-sección (ej: "Centro y Periferia"), no una continuación.
        3. La siguiente línea inicia una sección nueva (##, ###, ●, ○, |).
        4. La línea actual está vacía.

    Paridad garantizada: se agregan marcadores markdown pero no se elimina ninguna palabra.
    """
    lines = body.split('\n')
    result = []
    current = None
    prev_appended_ends_sentence = False  # ¿el último item guardado en result terminó en .!?

    for line in lines:
        if current is None:
            current = line
            continue

        curr_s = current.strip()
        next_s  = line.strip()

        # ── Regla 1: unir headings ## / ### partidos (sin trailing space, caso especial) ──
        if curr_s.startswith('## ') and next_s.startswith('## '):
            current = '## ' + curr_s[3:].rstrip() + ' ' + next_s[3:]
            continue
        if curr_s.startswith('### ') and next_s.startswith('### '):
            current = '### ' + curr_s[4:].rstrip() + ' ' + next_s[4:]
            continue

        is_blank       = not curr_s
        is_new_section = next_s.startswith(('## ', '### ', '● ', '○ ', '| '))
        last_char      = current.rstrip()[-1] if current.rstrip() else ''
        ends_sentence  = last_char in '.!?'

        # ── Regla 2: unir líneas con wrap de PDF ──────────────────────────────
        # Condiciones para unir:
        #   a) la línea actual termina con espacio (señal de wrap)
        #   b) no termina en oración (no es fin de párrafo)
        #   c) no está vacía
        #   d) la siguiente línea no abre una sección nueva
        #   e) la línea anterior guardada NO terminó en oración
        #      — EXCEPTO si la línea actual es larga (>6 palabras) o es un bullet:
        #        en ese caso nunca es una sub-etiqueta suelta, siempre se puede unir.
        curr_word_count = len(curr_s.split())
        is_short_label  = (curr_word_count <= 6
                           and not curr_s.startswith(('## ', '### ', '● ', '○ ')))
        if (current.endswith(' ')
                and not ends_sentence
                and not is_blank
                and next_s
                and not is_new_section
                and not (prev_appended_ends_sentence and is_short_label)):
            current = current.rstrip() + ' ' + line.lstrip()
            continue

        result.append(current)
        # Blank lines actúan como separador de sección (igual que terminar en punto)
        prev_appended_ends_sentence = ends_sentence if not is_blank else True
        current = line

    if current is not None:
        result.append(current)

    # ── Convertir símbolos de lista a markdown ────────────────────────────────
    formatted = []
    for line in result:
        s = line.strip()
        if s.startswith('● ') or s == '●':
            line = line.replace('●', '-', 1)
        elif s.startswith('○ ') or s == '○':
            line = '  ' + s.replace('○', '-', 1)
        formatted.append(line)

    # ── Colapsar múltiples líneas en blanco ───────────────────────────────────
    text = '\n'.join(formatted)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # ── Eliminar huecos entre filas de tabla (tabla multi-página del PDF) ─────
    # Problema: distintas páginas del PDF generan cuadros markdown separados;
    # cualquier línea en blanco entre filas `| ... |` rompe la tabla en el renderer.
    text = fix_table_gaps(text)

    return text.strip()


def fix_table_gaps(text):
    """
    Elimina líneas en blanco (o solo-espacios) que aparecen entre filas consecutivas
    de una tabla markdown. Sin esto, cada página del PDF genera un cuadro separado.

    Regla: si la línea actual es una fila de tabla (`| ...`) y las siguientes líneas
    no-vacías también lo son, eliminar los saltos de línea intermedios.
    """
    lines = text.split('\n')
    result = []
    i = 0
    while i < len(lines):
        result.append(lines[i])
        if lines[i].strip().startswith('|'):
            # Mirar hacia adelante: acumular blancos hasta la próxima línea no-vacía
            j = i + 1
            blanks = []
            while j < len(lines) and not lines[j].strip():
                blanks.append(lines[j])
                j += 1
            if j < len(lines) and lines[j].strip().startswith('|'):
                # La siguiente línea con contenido también es fila de tabla:
                # descartar los blancos intermedios para no romper el cuadro
                i = j
                continue
            else:
                # No es continuación de tabla: conservar los blancos
                result.extend(blanks)
                i = j
                continue
        i += 1
    return '\n'.join(result)


# ── Main ──────────────────────────────────────────────────────────────────────

resp = requests.get(
    f'{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{SUBJECT_ID}&order=order_index',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
)
modules = resp.json()

patch_headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

for mod in modules:
    mod_id = mod['id']
    order  = mod['order_index']
    title  = mod['title']
    body   = mod.get('body') or ''

    print(f"\n{'='*60}")
    print(f"Módulo {order}: {title}")
    print(f"  Chars antes:   {len(body):,}")

    formatted = format_body(body)

    print(f"  Chars despues: {len(formatted):,}")

    if not verify_parity(body, formatted, f"Módulo {order}"):
        print(f"  ABORTANDO subida — corregir primero")
        continue

    upd = requests.patch(
        f'{SUPABASE_URL}/rest/v1/modules?id=eq.{mod_id}',
        headers=patch_headers,
        json={'body': formatted, 'updated_at': datetime.now(timezone.utc).isoformat()}
    )
    if upd.status_code in [200, 204]:
        print(f'  Actualizado en Supabase')
    else:
        print(f'  Error {upd.status_code}: {upd.text}')

print('\nFormato completado.')
