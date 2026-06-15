#!/usr/bin/env python3
"""
seed_modulos.py — Carga módulos de cualquier materia con detección automática del formato PDF.

Uso:
    python scripts/seed_modulos.py --pdf docs/Resumen.pdf --subject-id UUID
    python scripts/seed_modulos.py --pdf docs/Resumen.pdf --subject-id UUID --content-item-id UUID
"""

import fitz
import requests
import sys, io, re, os, argparse
from datetime import datetime, timezone

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Cargar .env.local para que ANTHROPIC_API_KEY esté disponible en subprocesos
_ENV_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
if os.path.exists(_ENV_FILE):
    with open(_ENV_FILE, encoding='utf-8') as _ef:
        for _line in _ef:
            _line = _line.strip()
            if _line and not _line.startswith('#') and '=' in _line:
                _k, _, _v = _line.partition('=')
                if _k.strip() not in os.environ:
                    os.environ[_k.strip()] = _v.strip().strip('"').strip("'")

SUPABASE_URL = "https://dtbouycelkjgyddpftir.supabase.co"
SERVICE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0Ym91eWNlbGtqZ3lkZHBmdGlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MTkwOSwiZXhwIjoyMDk0NDU3OTA5fQ.JKJygGS7S5vfa8Pw5HhnsbcH5OHS2gJ6Qjud4-fgEPg"
WATERMARK      = '@RESUMENES.UNLAM'
STORAGE_BUCKET = 'module-images'
_MIN_IMG_PX    = 80   # ignorar imágenes más pequeñas (iconos, viñetas, watermarks)

HTTP_HEADERS = {
    'apikey':        SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Content-Type':  'application/json',
}

# Patrones de encabezado de módulo conocidos (orden de prioridad)
_KNOWN_HEADING_PATTERNS = [
    (r'^Módulo\s+\d+',    r'Módulo\s+(\d+)'),
    (r'^MÓDULO\s+\d+',    r'MÓDULO\s+(\d+)'),
    (r'^Unidad \d+',    r'Unidad (\d+)'),
    (r'^UNIDAD \d+',    r'UNIDAD (\d+)'),
    (r'^Capítulo \d+',  r'Capítulo (\d+)'),
    (r'^CAPÍTULO \d+',  r'CAPÍTULO (\d+)'),
    (r'^Módulo N° \d+', r'Módulo N° (\d+)'),
    (r'^EJE \d+',       r'EJE (\d+)'),
    (r'^TEMA \d+',      r'TEMA (\d+)'),
    (r'^Modulo\. \d+',  r'Modulo\. (\d+)'),
]

_BULLET_CHARS = {'●': '- ', '○': '  - ', '■': '    - ', '•': '- '}


# ── Mapa de fuente por línea ──────────────────────────────────────────────────

def build_font_map(page):
    font_map = {}
    for block in page.get_text('dict')['blocks']:
        if block.get('type') != 0: continue
        for line in block.get('lines', []):
            spans = [sp for sp in line.get('spans', []) if sp.get('text', '').strip()]
            if not spans: continue
            text    = ''.join(sp['text'] for sp in line.get('spans', [])).strip()
            size    = max(sp['size'] for sp in spans)
            is_bold = all('Bold' in sp.get('font', '') for sp in spans)
            if text:
                font_map[text] = (is_bold, round(size, 1))
    return font_map


# ── Artefacto "PALABRA.SUFIJO." ───────────────────────────────────────────────

_SUFFIX_DUP = re.compile(r'\b(\w{4,})\.(\w{3,})\.', re.IGNORECASE | re.UNICODE)

def _fix_suffix_dup(m):
    w, s = m.group(1), m.group(2)
    return (w + '.') if w.lower().endswith(s.lower()) else m.group(0)

def clean_artifacts(text):
    return _SUFFIX_DUP.sub(_fix_suffix_dup, text)


# ── Duplicación de caracteres por hyphenación ─────────────────────────────────

_FUNC_WORD_DUP_RE = re.compile(
    r'\b(de|la|los|las|el|en|un|con|por|que|del|al|se|su|si|lo|le|es|son)\1\b',
    re.IGNORECASE | re.UNICODE,
)

def fix_double_chars(text):
    """
    Corrige artefactos de duplicación de caracteres causados por hyphenación del PDF.
    Ejemplos: éépoca→época, ccomo→como, hhistórico→histórico, cocodifica→codifica,
              loslos→los, dede→de, rrasgos→rasgos.
    """
    # Consonante inicial duplicada (excluye 'll' que es válido en inicio de palabra)
    # 'rr' se incluye porque NUNCA es válido al inicio de una palabra en español
    text = re.sub(
        r'\b(?!ll)([bcdfghjkmnpqrstuvwxz])\1([a-záéíóúüñ]{2,})\b',
        r'\1\2', text, flags=re.IGNORECASE | re.UNICODE,
    )
    # Vocal acentuada duplicada al inicio: éépoca→época
    text = re.sub(
        r'\b([áéíóúü])\1([a-záéíóúüñ]{2,})\b',
        r'\1\2', text, flags=re.UNICODE,
    )
    # Sílaba de 2 letras duplicada (requiere 4+ chars de continuación para no tocar "coco", "papa")
    text = re.sub(
        r'\b([a-záéíóúüñ]{2})\1([a-záéíóúüñ]{4,})\b',
        r'\1\2', text, flags=re.UNICODE | re.IGNORECASE,
    )
    # Palabras funcionales duplicadas: loslos→los, dede→de
    text = _FUNC_WORD_DUP_RE.sub(r'\1', text)
    return text


# ── Separar definiciones inline ───────────────────────────────────────────────

_INLINE_DEF_RE = re.compile(
    # (?<!\d) evita partir “1. Término:” porque el punto en “1.” NO es fin de oración
    r'(?<!\d)([.!?])\s*'
    r'([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{3,}(?:\s+[a-záéíóúüñ]{3,})?\s*:)',
    re.UNICODE,
)

def split_inline_definitions(body):
    """
    Separa definiciones 'Término: ...' que quedaron pegadas al final de la oración anterior.
    Ej: '...construcciones. Referencia: Es una relación...'
        → '...construcciones.\n\nReferencia: Es una relación...'
    También separa dentro de bullets: '...texto.'Elipsis: ...' → ítem limpio + nuevo párrafo.
    """
    body = _INLINE_DEF_RE.sub(r'\1\n\n\2', body)
    return re.sub(r'\n{3,}', '\n\n', body)


# ── Negrita en términos de definición ────────────────────────────────────────

def mark_definition_terms(body):
    """
    Pone en negrita los términos que inician una definición al comienzo de línea.
    Ej: 'Referencia: Es una...' → '**Referencia:** Es una...'
        '- Elipsis: ...'        → '- **Elipsis:** ...'
    """
    lines = []
    for line in body.split('\n'):
        # No tocar headings ni líneas ya en negrita
        if line.startswith('## ') or line.startswith('### ') or '**' in line:
            lines.append(line)
            continue
        line = re.sub(
            r'^([-•]\s*)?([A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]{2,}(?:\s+[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{2,})*)\s*:(?!\s*//)(?!\s*http)',
            lambda m: (m.group(1) or '') + '**' + m.group(2) + ':**',
            line,
        )
        lines.append(line)
    return '\n'.join(lines)


# ── Reconstruir párrafos ──────────────────────────────────────────────────────

def _is_formula_row(s):
    """True para líneas cortas con solo tokens cortos: filas de tabla de verdad, fórmulas."""
    if not s or len(s) > 50:
        return False
    tokens = s.split()
    return bool(tokens) and all(len(t) <= 4 for t in tokens)


def fix_word_breaks(lines):
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        s = line.strip()

        if not s or s.startswith('#') or s.startswith('__IMG_') or _is_formula_row(s):
            result.append(s)
            i += 1
            continue

        current = line.rstrip('\r\n')
        i += 1
        while i < len(lines):
            ns = lines[i].strip()
            if (not ns or ns.startswith('#') or ns.startswith('-') or ns.startswith('•') or
                    ns.startswith('__IMG_') or ns.startswith('  - ') or _is_formula_row(ns) or
                    re.match(r'^\d{1,2}[\.\)]\s', ns)):  # items de lista numerada
                break
            next_raw = lines[i].rstrip('\r\n')
            curr_end = current.rstrip()
            next_stripped = next_raw.lstrip()

            # Límite de oración: termina en .!? y la siguiente arranca con mayúscula → párrafo nuevo
            if (curr_end and curr_end[-1] in '.!?' and
                    next_stripped and next_stripped[0].isupper()):
                current = re.sub(r'  +', ' ', current.strip())
                current = clean_artifacts(current)
                result.append(current)
                result.append('')
                current = next_raw
                i += 1
                continue

            if (curr_end and curr_end[-1] in '.!?,: ' and
                    next_raw and not next_raw[0].isspace() and next_raw[0].isalpha()):
                current = current + ' ' + next_raw.lstrip()
            else:
                # Detectar overlap prefijo: "inv" + "involucra" → "involucra"
                _tail_m = re.search(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}$', curr_end)
                _head_m = re.match(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+', next_raw) if next_raw and not next_raw[0].isspace() else None
                if (_tail_m and _head_m and
                        _head_m.group().lower().startswith(_tail_m.group().lower()) and
                        _head_m.group().lower() != _tail_m.group().lower()):
                    current = curr_end[:_tail_m.start()] + next_raw
                else:
                    current = current + next_raw
            i += 1

        current = current.strip()
        current = re.sub(r'  +', ' ', current)
        current = clean_artifacts(current)
        # Si el inner loop terminó porque el siguiente es un heading, verificar overlap
        if i < len(lines):
            ns_next = lines[i].strip()
            if ns_next.startswith('##'):
                heading_content = ns_next.lstrip('#').lstrip()
                _tail_m = re.search(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}$', current)
                _head_m = re.match(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+', heading_content) if heading_content else None
                if (_tail_m and _head_m and
                        _head_m.group().lower().startswith(_tail_m.group().lower()) and
                        _head_m.group().lower() != _tail_m.group().lower()):
                    current = current[:_tail_m.start()].rstrip()
        result.append(current)
    return result


def dedup_raw_chars(text):
    lines = text.split('\n')
    result = []
    for i, line in enumerate(lines):
        stripped = line.rstrip('\r').rstrip()
        if i + 1 < len(lines):
            next_raw0 = lines[i + 1][0] if lines[i + 1] else ''
            next_s    = lines[i + 1].strip()
            # Multi-char prefix overlap: "inv" + "involucra" — mirror de fix_word_breaks
            _tail_m = re.search(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}$', stripped)
            _head_m = (re.match(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+', next_s)
                       if next_s and not next_raw0.isspace() else None)
            if (_tail_m and _head_m and
                    _head_m.group().lower().startswith(_tail_m.group().lower()) and
                    _head_m.group().lower() != _tail_m.group().lower()):
                result.append(stripped[:_tail_m.start()])
                continue
        result.append(line.rstrip('\r'))
    return '\n'.join(result)


def count_content_chars(text, cover_parts):
    total = 0
    for line in text.split('\n'):
        s = line.strip()
        if not s: continue
        if s.isdigit() and len(s) <= 3: continue
        if WATERMARK in s: continue
        if s in cover_parts: continue
        if s.startswith('## '):    s = s[3:]
        elif s.startswith('### '): s = s[4:]
        total += sum(1 for c in s if c.isalpha() or c.isdigit())
    return total


# ── Detección automática ──────────────────────────────────────────────────────

def detect_config(doc):
    # Paso 1: portada → líneas de página 0 como texto a ignorar
    cover_parts = set()
    if len(doc) > 0:
        for line in doc[0].get_text('text').split('\n'):
            s = line.strip()
            if s and not s.isdigit():
                cover_parts.add(s)

    # Paso 2: recolectar todas las líneas con info de fuente (páginas 1+)
    all_lines = []  # (text, size, is_bold)
    for page_num in range(1, len(doc)):
        page     = doc[page_num]
        font_map = build_font_map(page)
        for line in page.get_text('text').split('\n'):
            s = line.strip()
            if not s or (s.isdigit() and len(s) <= 3): continue
            if WATERMARK in s or s in cover_parts: continue
            is_bold, size = font_map.get(s, (False, 12.0))
            all_lines.append((s, size, is_bold))

    # Paso 3: detectar patrón de encabezado de módulo
    module_heading_re = None
    module_number_re  = None
    best_count        = 0
    for heading_re, number_re in _KNOWN_HEADING_PATTERNS:
        count = sum(1 for text, _, _ in all_lines if re.match(heading_re, text))
        if count > best_count:
            best_count        = count
            module_heading_re = heading_re
            module_number_re  = number_re

    if not module_heading_re or best_count < 2:
        # Fallback: líneas con el font size más grande que contienen número
        max_size = max((size for _, size, _ in all_lines), default=12.0)
        for text, size, _ in all_lines:
            if size >= max_size - 1.0 and re.search(r'\d+', text):
                num = re.search(r'\d+', text)
                prefix = text[:num.start()].strip()
                if prefix:
                    module_heading_re = r'^' + re.escape(prefix) + r' \d+'
                    module_number_re  = re.escape(prefix) + r' (\d+)'
                    best_count        = sum(
                        1 for t, _, _ in all_lines if re.match(module_heading_re, t)
                    )
                    break

    if not module_heading_re:
        print("ERROR: No se pudo detectar el patrón de encabezados de módulo.")
        print("Líneas con font más grande:")
        max_size = max((size for _, size, _ in all_lines), default=12.0)
        for text, size, _ in all_lines:
            if size >= max_size - 2:
                print(f"  [{size:.1f}] {text[:80]}")
        sys.exit(1)

    _module_re = re.compile(module_heading_re)

    # Paso 4: detectar si el título del módulo continúa en la línea siguiente
    multiline_count = 0
    heading_count   = 0
    for page_num in range(1, len(doc)):
        page     = doc[page_num]
        font_map = build_font_map(page)
        raw      = page.get_text('text').split('\n')
        for i, line in enumerate(raw):
            s = line.strip()
            if not _module_re.match(s): continue
            heading_count += 1
            j = i + 1
            while j < len(raw) and not raw[j].strip(): j += 1
            if j < len(raw):
                ns   = raw[j].strip()
                size = font_map.get(ns, (False, 11.0))[1]
                if (size >= 16.0 and not _module_re.match(ns)
                        and WATERMARK not in ns and ns not in cover_parts):
                    multiline_count += 1

    module_heading_multiline = heading_count > 0 and (multiline_count / heading_count) > 0.5

    # Paso 5: detectar estilo de subheadings
    heading_sizes = {text for text, _, _ in all_lines if _module_re.match(text)}
    body_sizes    = [size for text, size, _ in all_lines if text not in heading_sizes]
    median_size   = sorted(body_sizes)[len(body_sizes) // 2] if body_sizes else 12.0

    candidates = [
        (text, size, is_bold)
        for text, size, is_bold in all_lines
        if not _module_re.match(text) and size > median_size + 1.0
    ]
    if candidates:
        bold_ratio = sum(1 for _, _, b in candidates if b) / len(candidates)
        subheading_mode = 'bold' if bold_ratio > 0.6 else 'size'
        h3_sizes        = [size for _, size, _ in candidates]
        size_h3_min     = round(min(h3_sizes) - 0.1, 1)
        size_h3_max     = round(max(h3_sizes) + 0.1, 1)
    else:
        subheading_mode = 'bold'
        size_h3_min     = 12.5
        size_h3_max     = 16.0

    # Paso 6: detectar bullets unicode
    inline_bullets = {
        char: marker
        for char, marker in _BULLET_CHARS.items()
        if any(text.startswith(char + ' ') for text, _, _ in all_lines)
    }

    return {
        'cover_parts':              cover_parts,
        'module_heading_re':        module_heading_re,
        'module_number_re':         module_number_re,
        'module_heading_multiline': module_heading_multiline,
        'subheading_mode':          subheading_mode,
        'size_h3_min':              size_h3_min,
        'size_h3_max':              size_h3_max,
        'inline_bullets':           inline_bullets,
        'heading_count':            best_count,
    }


# ── Listas numéricas embebidas en párrafos ───────────────────────────────────

# Detecta "N." o "N)" seguido de letra, sin estar precedido por coma, dígito o ")".
_EMBEDDED_LIST_RE = re.compile(r'(?<![,\d)])(\d{1,2})[\.\)]\s*(?=[A-ZÁÉÍÓÚÜÑA-Za-záéíóúüñ])')


def fix_embedded_lists(body):
    """
    Separa listas numéricas embebidas dentro de párrafos largos.

    Detecta el patrón "intro texto:1.Item uno.2. Item dos.3.Item tres." y lo
    reformatea como:
        intro texto:

        1. Item uno.
        2. Item dos.
        3. Item tres.

    Condiciones para activarse:
    - La línea tiene ≥80 chars (no ya un ítem corto).
    - Contiene ≥2 marcadores con números consecutivos empezando en 1.
    - Hay un ':' en el texto antes del primer '1.' (señal de introducción a lista).
    """
    lines = body.split('\n')
    result = []
    for line in lines:
        s = line.strip()
        # No procesar headings, bullets, ítems ya formateados, ni líneas cortas
        if (not s or s.startswith('#') or s.startswith('- ')
                or re.match(r'^\d+[\.\)]\s', s) or len(s) < 80):
            result.append(line)
            continue

        matches = list(_EMBEDDED_LIST_RE.finditer(s))
        if len(matches) < 2:
            result.append(line)
            continue

        numbers = [int(m.group(1)) for m in matches]
        try:
            start_idx = numbers.index(1)
        except ValueError:
            result.append(line)
            continue

        # Requiere un ':' en el texto antes del primer '1.'
        # Si la línea empieza directo con '1.' (first_pos==0), no lo exigimos
        first_pos = matches[start_idx].start()
        if ':' not in s[:first_pos] and first_pos > 0:
            result.append(line)
            continue

        seq_matches = matches[start_idx:]
        seq_numbers = numbers[start_idx:]
        if len(seq_numbers) < 2:
            result.append(line)
            continue

        is_sequential = all(
            seq_numbers[i + 1] == seq_numbers[i] + 1
            for i in range(len(seq_numbers) - 1)
        )
        if not is_sequential:
            result.append(line)
            continue

        # Separar intro + items
        intro = s[:first_pos].rstrip()
        items = []
        for i, m in enumerate(seq_matches):
            end = seq_matches[i + 1].start() if i + 1 < len(seq_matches) else len(s)
            items.append(f'{m.group(1)}. {s[m.end():end].rstrip()}')

        if intro:
            result.append(intro)
            result.append('')
        for item in items:
            result.append(item)
        result.append('')

    return re.sub(r'\n{3,}', '\n\n', '\n'.join(result))


# ── Orden de lectura con detección de columnas ───────────────────────────────

# PDFs que usan espacios para simular dos columnas dentro de un mismo bloque.
# Detecta líneas con gap interno de ≥10 espacios tras texto no-vacío.
_INLINE_COL_RE = re.compile(r'^(\S.*?)\s{10,}(\S.*)')

def _reorder_inline_cols(lines):
    """
    Para runs de líneas consecutivas con gap de columnas inline,
    emite primero todas las partes izquierdas y luego todas las derechas
    (unidas con espacio, entre líneas vacías para que fix_word_breaks no
    las fusione con el contenido adyacente).
    """
    out = []
    left_buf = []
    right_buf = []
    for line in lines:
        m = _INLINE_COL_RE.match(line.rstrip())
        if m:
            left_buf.append(m.group(1).rstrip())
            right_buf.append(m.group(2).lstrip())
        else:
            if left_buf:
                out.extend(left_buf)
                if right_buf:
                    out.append('')
                    out.append(' '.join(right_buf))
                    out.append('')
                left_buf = []
                right_buf = []
            out.append(line)
    if left_buf:
        out.extend(left_buf)
        if right_buf:
            out.append('')
            out.append(' '.join(right_buf))
            out.append('')
    return out


def _page_lines_ordered(page):
    """
    Devuelve las líneas de la página en orden de lectura correcto.
    Incluye marcadores __IMG_<xref>__ para imágenes de contenido (≥_MIN_IMG_PX px).
    Maneja layouts de dos columnas (bloques separados o padding de espacios).
    """
    pw  = page.rect.width
    mid = pw / 2

    # ── Recopilar bloques de texto e imagen ───────────────────────────────────
    page_dict   = page.get_text('dict')
    text_blocks = []  # (x0, y0, x1, y1, joined_text)
    all_blocks  = []  # texto + imagen, para ordenar por y

    for blk in page_dict.get('blocks', []):
        bb = blk['bbox']
        if blk['type'] == 0:  # texto
            joined = '\n'.join(
                ''.join(sp.get('text', '') for sp in ln.get('spans', []))
                for ln in blk.get('lines', [])
            )
            if joined.strip():
                entry = (bb[0], bb[1], bb[2], bb[3], joined)
                text_blocks.append(entry)
                all_blocks.append(entry)
        # Las imágenes se recuperan a continuación vía page.get_images()

    # Imágenes: xref + posición
    seen_xrefs = set()
    for img_info in page.get_images(full=True):
        xref, w, h = img_info[0], img_info[2], img_info[3]
        if xref in seen_xrefs or w < _MIN_IMG_PX or h < _MIN_IMG_PX:
            continue
        seen_xrefs.add(xref)
        # get_image_rects puede devolver múltiples rects para la misma imagen
        # (ej: imagen más alta que la página → dos clips). Solo usar el primero.
        rects = page.get_image_rects(xref)
        if rects:
            rect = rects[0]
            all_blocks.append((rect.x0, rect.y0, rect.x1, rect.y1, f'__IMG_{xref}__'))

    if not all_blocks:
        return []

    def _block_lines(b):
        txt = b[4]
        if txt.startswith('__IMG_'):
            return [txt]
        return txt.rstrip('\n').split('\n')

    # ── Detectar layout de dos columnas (bloques separados) ──────────────────
    left_txt  = [b for b in text_blocks if (b[0] + b[2]) / 2 < mid]
    right_txt = [b for b in text_blocks if (b[0] + b[2]) / 2 >= mid]
    two_col   = any(
        min(lb[3], rb[3]) - max(lb[1], rb[1]) > 0
        for lb in left_txt for rb in right_txt
    )

    def _extend_with_break(dest, blk_lines):
        """Agrega líneas de un bloque a dest, con línea vacía separadora si dest no está vacío."""
        if dest and not all(l == '' for l in dest[-2:]):
            dest.append('')
        dest.extend(blk_lines)

    if not two_col:
        result = []
        for b in sorted(all_blocks, key=lambda b: b[1]):
            _extend_with_break(result, _block_lines(b))
        return _reorder_inline_cols(result)

    # ── Layout de dos columnas: izquierda completa, luego derecha ─────────────
    result_lines = []
    col_buf      = []
    for b in sorted(all_blocks, key=lambda b: b[1]):
        is_img       = b[4].startswith('__IMG_')
        is_full_width = (b[2] - b[0]) > pw * 0.70
        if is_full_width or is_img:
            if col_buf:
                left  = sorted([x for x in col_buf if (x[0]+x[2])/2 < mid],  key=lambda x: x[1])
                right = sorted([x for x in col_buf if (x[0]+x[2])/2 >= mid], key=lambda x: x[1])
                for blk in left + right:
                    _extend_with_break(result_lines, _block_lines(blk))
                col_buf = []
            _extend_with_break(result_lines, _block_lines(b))
        else:
            col_buf.append(b)
    if col_buf:
        left  = sorted([x for x in col_buf if (x[0]+x[2])/2 < mid],  key=lambda x: x[1])
        right = sorted([x for x in col_buf if (x[0]+x[2])/2 >= mid], key=lambda x: x[1])
        for blk in left + right:
            _extend_with_break(result_lines, _block_lines(blk))

    return _reorder_inline_cols(result_lines)


# ── Extracción ────────────────────────────────────────────────────────────────

def extract(doc, cfg):
    _module_re     = re.compile(cfg['module_heading_re'])
    cover_parts    = cfg['cover_parts']
    inline_bullets = cfg['inline_bullets']
    multiline      = cfg['module_heading_multiline']

    raw_text_all = ''
    lines_out    = []

    for page_num in range(len(doc)):
        page     = doc[page_num]
        raw_text = page.get_text('text')
        raw_text_all += raw_text
        if page_num == 0:
            continue

        font_map  = build_font_map(page)
        raw_lines = _page_lines_ordered(page)
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

            if WATERMARK in s or s in cover_parts:
                i += 1
                continue

            # Bullets unicode
            matched_bullet = False
            for char, marker in inline_bullets.items():
                if s.startswith(char + ' '):
                    lines_out.append(marker + s[2:])
                    i += 1
                    matched_bullet = True
                    break
            if matched_bullet:
                continue

            # Encabezado de módulo
            if _module_re.match(s):
                heading = s
                if multiline:
                    j = i + 1
                    while j < len(raw_lines) and not raw_lines[j].strip(): j += 1
                    if j < len(raw_lines):
                        ns   = raw_lines[j].strip()
                        size = font_map.get(ns, (False, 11.0))[1]
                        if (size >= 16.0 and not _module_re.match(ns)
                            and WATERMARK not in ns and ns not in cover_parts):
                            heading = heading + ' ' + ns
                            i = j
                lines_out.append(f'## {heading}')
                i += 1
                continue

            # Títulos de sección "N.N MAYÚSCULAS" — detección por patrón aunque no sean bold
            # Ej: "2.2 ACTIVIDADES DE LECTURA Y ESCRITURA", "2.2 LOS PARATEXTOS"
            if (re.match(r'^\d+(?:\.\d+)+\s+[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s\-,]+$', s)
                    and len(s) <= 80 and not _module_re.match(s)):
                lines_out.append(f'### {s}')
                i += 1
                continue

            # Subheadings
            is_bold, size = font_map.get(s, (False, 12.0))
            if cfg['subheading_mode'] == 'bold' and is_bold and size < 20:
                lines_out.append(f'### {s}')
                i += 1
                continue
            if cfg['subheading_mode'] == 'size' and cfg['size_h3_min'] <= size < cfg['size_h3_max']:
                first_tok = s.split()[0] if s.split() else ''
                is_real_heading = (
                    bool(re.search(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}', s)) and
                    bool(re.match(r'[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{3,}$', first_tok))
                )
                lines_out.append(f'### {s}' if is_real_heading else line)
                i += 1
                continue

            lines_out.append(line)
            i += 1

    return raw_text_all, lines_out


# ── OCR: imágenes con texto ───────────────────────────────────────────────────

def _is_text_image(img_bytes):
    """Heurística: >85% de píxeles cerca del negro (<50) o blanco (>200) → imagen de texto."""
    try:
        from PIL import Image
        import io as _io
        img = Image.open(_io.BytesIO(img_bytes)).convert('L')
        pixels = img.tobytes()
        n = len(pixels)
        if n == 0:
            return False
        bw = sum(1 for p in pixels if p < 50 or p > 200)
        return (bw / n) >= 0.85
    except Exception:
        return False


_TESSERACT_CMD  = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
_TESSDATA_DIR   = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'tessdata')


def _ocr_image_bytes(img_bytes):
    """
    OCR usando Claude Haiku (visión) como motor principal.
    Fallback a pytesseract si el SDK de Anthropic no está disponible.
    """
    # ── Claude API ────────────────────────────────────────────────────────────
    try:
        import anthropic, base64, struct
        client = anthropic.Anthropic()

        # Detectar media type por magic bytes
        if img_bytes[:2] == b'\xff\xd8':
            media_type = 'image/jpeg'
        elif img_bytes[:8] == b'\x89PNG\r\n\x1a\n':
            media_type = 'image/png'
        else:
            media_type = 'image/jpeg'

        b64 = base64.standard_b64encode(img_bytes).decode()
        msg = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=1024,
            messages=[{
                'role': 'user',
                'content': [
                    {'type': 'image', 'source': {'type': 'base64', 'media_type': media_type, 'data': b64}},
                    {'type': 'text', 'text': (
                        'Analizá esta imagen y transcribí su contenido.\n'
                        '- Si contiene una tabla o cuadro con filas y columnas: '
                        'devolvé una tabla markdown con | y separadores ---. '
                        'Usá la primera fila como encabezado si existe.\n'
                        '- Si contiene texto corrido (párrafo, lista, fórmula): '
                        'devolvé el texto tal como aparece, sin explicaciones extra.\n'
                        'Solo devolvé el contenido transcripto. '
                        'Respetá acentos, tildes y caracteres especiales del español.'
                    )},
                ],
            }],
        )
        text = msg.content[0].text.strip()
        return text if text else None
    except Exception as _e:
        # Sin API key o error de red → no OCR, el marcador se elimina en _replace_img_markers
        # (el texto del PDF ya está extraído directamente en el cuerpo)
        print(f"  ⚠ OCR Haiku no disponible ({type(_e).__name__}): la imagen se omite.")
        return None


# ── Imágenes: Storage ────────────────────────────────────────────────────────

def _body_text_only(body):
    """Body sin marcadores __IMG_<xref>__ para usar en el chequeo de paridad."""
    return '\n'.join(l for l in body.split('\n') if not l.startswith('__IMG_'))


def _ensure_storage_bucket():
    """Crea el bucket STORAGE_BUCKET si no existe (public=True)."""
    resp = requests.post(
        f'{SUPABASE_URL}/storage/v1/bucket',
        headers=HTTP_HEADERS,
        json={'id': STORAGE_BUCKET, 'name': STORAGE_BUCKET, 'public': True},
    )
    # 200/201 = creado, 409 = ya existe — ambos son OK
    if resp.status_code not in (200, 201, 409):
        print(f"  ⚠ No se pudo crear el bucket: {resp.status_code} {resp.text[:100]}")


def _upload_images(doc, body, subject_slug):
    """
    Procesa las imágenes referenciadas en body:
    - Si la imagen es de texto/fórmula (alta proporción B&W) → OCR y convierte a texto.
    - Sino → sube a Supabase Storage.
    Devuelve (xref_to_url, xref_to_text).
    """
    xrefs = [int(m) for m in re.findall(r'__IMG_(\d+)__', body)]
    if not xrefs:
        return {}, {}

    _ensure_storage_bucket()
    xref_to_url  = {}
    xref_to_text = {}
    uploaded = 0
    ocr_done = 0
    errors   = 0

    # Leer transcripciones previas escritas por Claude (modo dos pasos)
    _tx_file = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                            'scripts', '_transcriptions.json')
    _prewritten = {}
    if os.path.exists(_tx_file):
        import json as _json
        try:
            _prewritten = _json.load(open(_tx_file, encoding='utf-8'))
            print(f"  📄 Leyendo {len(_prewritten)} transcripciones de _transcriptions.json")
        except Exception:
            pass

    _img_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                            'scripts', '_img_pending')
    os.makedirs(_img_dir, exist_ok=True)

    for xref in set(xrefs):
        try:
            img_data = doc.extract_image(xref)
        except Exception as e:
            print(f"  ✗ xref {xref}: error al extraer ({e})")
            errors += 1
            continue

        ext  = img_data.get('ext', 'png')
        data = img_data.get('image', b'')
        if not data:
            continue

        # Intentar OCR si parece imagen de texto/fórmula
        if _is_text_image(data):
            # 1) Usar transcripción pre-escrita por Claude si existe
            if str(xref) in _prewritten:
                xref_to_text[xref] = _prewritten[str(xref)]
                ocr_done += 1
                print(f"  ✓ xref {xref}: transcripción pre-escrita usada")
                continue
            # 2) Intentar con Claude Haiku (necesita ANTHROPIC_API_KEY)
            text = _ocr_image_bytes(data)
            if text:
                xref_to_text[xref] = text
                ocr_done += 1
                continue
            # 3) Sin API key → guardar imagen en disco para transcripción manual
            img_path = os.path.join(_img_dir, f'{xref}.{ext}')
            with open(img_path, 'wb') as fh:
                fh.write(data)
            print(f"  💾 xref {xref}: guardado en scripts/_img_pending/{xref}.{ext} (pendiente de transcripción)")
            continue

        path = f'{subject_slug}/{xref}.{ext}'
        mime = 'image/jpeg' if ext in ('jpg', 'jpeg') else f'image/{ext}'

        resp = requests.post(
            f'{SUPABASE_URL}/storage/v1/object/{STORAGE_BUCKET}/{path}',
            headers={
                'apikey':        SERVICE_KEY,
                'Authorization': f'Bearer {SERVICE_KEY}',
                'Content-Type':  mime,
                'x-upsert':      'true',
            },
            data=data,
        )
        if resp.status_code in (200, 201):
            url = f'{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{path}'
            xref_to_url[xref] = url
            uploaded += 1
        else:
            print(f"  ✗ xref {xref}: upload error {resp.status_code} {resp.text[:80]}")
            errors += 1

    parts = [f"{uploaded} subidas"]
    if ocr_done:
        parts.append(f"{ocr_done} convertidas a texto (OCR)")
    if errors:
        parts.append(f"{errors} con error")
    print(f"  Imágenes: {', '.join(parts)}.")
    return xref_to_url, xref_to_text


def _replace_img_markers(body, xref_to_url, xref_to_text=None, fig_counter=None):
    """
    Reemplaza __IMG_<xref>__ por:
    - Bloque de código markdown si la imagen fue OCR'd (texto/fórmula).
    - ![Figura N](url) si fue subida como imagen.
    """
    counter      = [fig_counter or 0]
    xref_to_text = xref_to_text or {}

    def _is_formatted_markdown(text):
        """True si el texto ya tiene formato markdown (tabla, bullets, negrita) → no code block."""
        lines = [l.strip() for l in text.strip().split('\n') if l.strip()]
        return any(
            l.startswith('|') or l.startswith('- ') or l.startswith('* ') or
            l.startswith('**') or l.startswith('# ') or l.startswith('  -')
            for l in lines
        )

    def replacer(m):
        xref = int(m.group(1))
        if xref in xref_to_text:
            text = xref_to_text[xref]
            if _is_formatted_markdown(text):
                return f'\n\n{text}\n\n'
            return f'\n```\n{text}\n```\n'
        url = xref_to_url.get(xref)
        if not url:
            return ''
        counter[0] += 1
        return f'![Figura {counter[0]}]({url})'

    return re.sub(r'__IMG_(\d+)__', replacer, body)


# ── Main ──────────────────────────────────────────────────────────────────────

def _resolve_subject_id(slug):
    """Busca el UUID del subject en Supabase a partir del slug."""
    resp = requests.get(
        f'{SUPABASE_URL}/rest/v1/subjects?slug=eq.{slug}&select=id,name',
        headers=HTTP_HEADERS,
    )
    if resp.status_code != 200:
        print(f"ERROR: No se pudo consultar Supabase ({resp.status_code}): {resp.text[:100]}")
        sys.exit(1)
    rows = resp.json()
    if not rows:
        print(f"ERROR: No se encontró ningún subject con slug='{slug}'.")
        print("Subjects disponibles:")
        all_resp = requests.get(
            f'{SUPABASE_URL}/rest/v1/subjects?select=name,slug&order=name',
            headers=HTTP_HEADERS,
        )
        if all_resp.status_code == 200:
            for s in all_resp.json():
                print(f"  {s['slug']:<30} {s['name']}")
        sys.exit(1)
    subject_id   = rows[0]['id']
    subject_name = rows[0]['name']
    print(f"Subject resuelto: {subject_name} → {subject_id}")
    return subject_id


def main():
    parser = argparse.ArgumentParser(description='Carga módulos de una materia en Supabase.')
    parser.add_argument('--pdf',              required=True,  help='Ruta al PDF fuente')
    parser.add_argument('--subject-id',       default=None,   help='UUID del subject en Supabase')
    parser.add_argument('--subject-slug',     default=None,   help='Slug del subject (ej: geometria, logica-matematica)')
    parser.add_argument('--content-item-id',  default=None,   help='UUID del content_item (opcional)')
    parser.add_argument('--quizzes',          default=None,   help='Ruta al archivo de preguntas (quizzes/<materia>.py)')
    args = parser.parse_args()

    if not args.subject_id and not args.subject_slug:
        parser.error('Debés pasar --subject-id o --subject-slug')

    if args.subject_slug and not args.subject_id:
        args.subject_id = _resolve_subject_id(args.subject_slug)

    doc = fitz.open(args.pdf)
    print(f"PDF: {len(doc)} páginas")

    # ── Detección ─────────────────────────────────────────────────────────────
    print("\nDetectando formato del PDF...")
    cfg = detect_config(doc)

    print(f"\n=== Configuración detectada ===")
    print(f"  Encabezado módulo:  {cfg['module_heading_re']}  ({cfg['heading_count']} encontrados)")
    print(f"  Título multilinea:  {'Sí' if cfg['module_heading_multiline'] else 'No'}")
    print(f"  Subheadings:        {cfg['subheading_mode']}", end='')
    if cfg['subheading_mode'] == 'size':
        print(f"  ({cfg['size_h3_min']}–{cfg['size_h3_max']} pt)", end='')
    print()
    print(f"  Bullets unicode:    {list(cfg['inline_bullets'].keys()) or 'Ninguno'}")
    cover_preview = list(cfg['cover_parts'])[:5]
    print(f"  Portada ignorada:   {cover_preview}{'...' if len(cfg['cover_parts']) > 5 else ''}")

    # ── Extracción ────────────────────────────────────────────────────────────
    n_pages     = len(doc)
    subject_slug = re.sub(r'[^a-z0-9]+', '-', args.subject_id.lower())
    raw_text_all, lines_out = extract(doc, cfg)
    # doc se cierra más abajo, después de subir imágenes

    lines_out = fix_word_breaks(lines_out)
    body = '\n'.join(lines_out)
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    body = fix_embedded_lists(body)

    # ── Paridad (sin contar marcadores __IMG__) ───────────────────────────────
    raw_clean = dedup_raw_chars(clean_artifacts(raw_text_all))
    raw_count = count_content_chars(raw_clean,            cfg['cover_parts'])
    ext_count = count_content_chars(_body_text_only(body), cfg['cover_parts'])

    n_imgs = len(re.findall(r'__IMG_\d+__', body))
    print(f"\nChars extraídos:      {len(body):,}  (imágenes detectadas: {n_imgs})")
    print(f"Chars PDF (alfanum):  {raw_count}")
    print(f"Chars body (alfanum): {ext_count}")

    diff      = ext_count - raw_count
    tolerance = max(20, n_pages // 5)
    if abs(diff) > tolerance:
        print(f"  PARIDAD FALLIDA: diferencia = {diff:+d} chars (límite: {tolerance})")
        print("\n  Preview body:")
        print(body[:800])
        sys.exit(1)
    print(f"  Paridad OK" + (f" (artefacto: {diff:+d} chars)" if diff != 0 else ''))

    # ── Procesar imágenes (OCR o Storage) ────────────────────────────────────
    if n_imgs > 0:
        print(f"\nProcesando {n_imgs} imagen(es)...")
        xref_to_url, xref_to_text = _upload_images(doc, body, subject_slug)
        body = _replace_img_markers(body, xref_to_url, xref_to_text)
    doc.close()

    # ── Post-procesado de texto (después de paridad) ───────────────────────────
    # Limpiar "**" antes de ":" que vienen del PDF como marcadores markdown huérfanos
    # Ej: "estructura**: determina" → "estructura: determina"
    body = re.sub(r'\*\*(?=\s*:)', '', body)
    body = fix_double_chars(body)
    body = split_inline_definitions(body)
    body = mark_definition_terms(body)
    body = re.sub(r'\n{3,}', '\n\n', body)

    print("\n  Preview:")
    print(body[:600])

    # ── Dividir en módulos ────────────────────────────────────────────────────
    _module_re      = re.compile(cfg['module_heading_re'])
    _module_split   = re.compile(r'\n(?=## (?:' + cfg['module_heading_re'].lstrip('^') + r'))')

    parts   = _module_split.split(body)
    modules = []
    for part in parts:
        part = part.strip()
        if not part or not part.startswith('## '): continue
        heading_text = re.sub(r'\s+', ' ', part.split('\n')[0][3:].strip())
        if not _module_re.match(heading_text): continue
        content  = '\n'.join(part.split('\n')[1:]).strip()
        m        = re.search(cfg['module_number_re'], heading_text)
        order    = int(m.group(1)) if m else len(modules) + 1
        desc_m   = re.search(r'^### (.+)', content, re.MULTILINE)
        modules.append({
            'title':       heading_text,
            'body':        content,
            'order_index': order,
            'description': desc_m.group(1) if desc_m else None,
        })

    # Fusionar módulos con mismo order_index (ej: Módulo 3 PARTE I + PARTE II)
    merged = []
    for mod in modules:
        if merged and merged[-1]['order_index'] == mod['order_index']:
            merged[-1]['body'] += '\n\n' + mod['body']
            # Usar el título más corto (el que no incluye "PARTE II")
            if len(mod['title']) < len(merged[-1]['title']):
                merged[-1]['title'] = mod['title']
        else:
            merged.append(mod)
    if len(merged) < len(modules):
        print(f"  (Fusionados {len(modules) - len(merged)} módulo(s) duplicados)")
    modules = merged

    print(f"\nMódulos detectados: {len(modules)}")
    for mod in modules:
        print(f"  {mod['order_index']}. {mod['title'][:60]}  ({len(mod['body'])} chars)")

    if not modules:
        print("ERROR: No se encontraron módulos. Revisar el patrón detectado.")
        sys.exit(1)

    # ── Supabase ──────────────────────────────────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()

    if args.content_item_id:
        print(f"\nActualizando content_item {args.content_item_id}...")
        resp = requests.patch(
            f'{SUPABASE_URL}/rest/v1/content_items?id=eq.{args.content_item_id}',
            headers={**HTTP_HEADERS, 'Prefer': 'return=minimal'},
            json={'body': body, 'type': 'guide', 'updated_at': now},
        )
        print(f"  {'OK' if resp.status_code in [200, 204] else f'Error {resp.status_code}: {resp.text}'}")

    print(f"\nBorrando módulos existentes del subject {args.subject_id}...")
    resp = requests.delete(
        f'{SUPABASE_URL}/rest/v1/modules?subject_id=eq.{args.subject_id}',
        headers={**HTTP_HEADERS, 'Prefer': 'return=minimal'},
    )
    print(f"  {'OK' if resp.status_code in [200, 204] else f'Error {resp.status_code}: {resp.text[:100]}'}")

    print("\nInsertando módulos...")
    inserted      = 0
    errors        = 0
    order_to_id   = {}   # {order_index: module_id} — usado luego para los quizzes
    for mod in modules:
        resp = requests.post(
            f'{SUPABASE_URL}/rest/v1/modules',
            headers={**HTTP_HEADERS, 'Prefer': 'return=representation'},
            json={
                'subject_id':   args.subject_id,
                'title':        mod['title'],
                'description':  mod['description'],
                'body':         mod['body'],
                'order_index':  mod['order_index'],
                'is_published': True,
                'created_at':   now,
                'updated_at':   now,
            },
        )
        if resp.status_code in [200, 201]:
            row    = resp.json()
            mod_id = row[0]['id'] if isinstance(row, list) else row.get('id')
            order_to_id[mod['order_index']] = mod_id
            print(f"  ✓ {mod['title']}  —  id: {mod_id}")
            inserted += 1
        else:
            print(f"  ✗ Error módulo {mod['order_index']}: {resp.status_code} {resp.text[:150]}")
            errors += 1

    print(f"\nMódulos: {inserted} insertados, {errors} con error.")

    # ── Quizzes (opcional) ────────────────────────────────────────────────────
    if args.quizzes:
        import importlib.util, os
        quiz_path = os.path.abspath(args.quizzes)
        spec = importlib.util.spec_from_file_location("_quizzes", quiz_path)
        qmod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(qmod)
        questions_map = qmod.QUESTIONS   # {order_index: [...], 0: [...generals]}

        print(f"\nBorrando quizzes existentes del subject {args.subject_id}...")
        resp = requests.delete(
            f'{SUPABASE_URL}/rest/v1/quiz_questions?subject_id=eq.{args.subject_id}',
            headers={**HTTP_HEADERS, 'Prefer': 'return=minimal'},
        )
        print(f"  {'OK' if resp.status_code in [200, 204] else f'Error {resp.status_code}: {resp.text[:100]}'}")

        print("\nInsertando quizzes...")
        q_inserted = 0
        q_errors   = 0
        for key, question_list in questions_map.items():
            module_id   = order_to_id.get(key) if key != 0 else None
            label       = f"Módulo {key}" if key != 0 else "General"
            group_count = 0
            for order_index, question in enumerate(question_list, start=1):
                resp = requests.post(
                    f'{SUPABASE_URL}/rest/v1/quiz_questions',
                    headers={**HTTP_HEADERS, 'Prefer': 'return=representation'},
                    json={
                        'subject_id':   args.subject_id,
                        'module_id':    module_id,
                        'question':     question['question'],
                        'options':      question['options'],
                        'explanation':  question['explanation'],
                        'difficulty':   question['difficulty'],
                        'order_index':  order_index,
                        'is_published': True,
                    },
                )
                if resp.status_code in [200, 201]:
                    q_inserted += 1
                    group_count += 1
                else:
                    print(f"  ✗ Error {label} q{order_index}: {resp.status_code} {resp.text[:120]}")
                    q_errors += 1
            print(f"  {label}: {group_count} preguntas ✓")

        print(f"\nQuizzes: {q_inserted} insertadas, {q_errors} con error.")


if __name__ == '__main__':
    main()
